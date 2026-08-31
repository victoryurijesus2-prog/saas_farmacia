import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pedido recebido",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAYMENT_APPROVED: "Pagamento confirmado",
  PREPARING: "Em separação",
  READY: "Pronto para retirada",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Método não permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const metaToken = Deno.env.get("META_WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID");
  const graphVersion = Deno.env.get("META_GRAPH_VERSION") || "v23.0";
  const template = Deno.env.get("META_WHATSAPP_STATUS_TEMPLATE") || "pedido_status_atualizado";
  const language = Deno.env.get("META_WHATSAPP_TEMPLATE_LANGUAGE") || "pt_BR";
  if (!supabaseUrl || !serviceKey) return response({ error: "Supabase não configurado" }, 500);

  const authorization = request.headers.get("Authorization") || "";
  const jwt = authorization.replace(/^Bearer\s+/i, "");
  if (!jwt) return response({ error: "Não autenticado" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(jwt);
  if (authError || !authData.user) return response({ error: "Sessão inválida" }, 401);

  let payload: { order_id?: string; status?: string };
  try { payload = await request.json(); } catch { return response({ error: "JSON inválido" }, 400); }
  if (!payload.order_id || !payload.status) return response({ error: "Pedido e status são obrigatórios" }, 400);
  if (!statusLabels[payload.status]) return response({ error: "Status inválido" }, 400);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id,pharmacy_id,order_number,customer_name,customer_phone,status,pharmacies(name)")
    .eq("id", payload.order_id)
    .single();
  if (orderError || !order) return response({ error: "Pedido não encontrado" }, 404);
  if (order.status !== payload.status) return response({ error: "Status informado não corresponde ao pedido" }, 409);

  const { data: membership } = await admin
    .from("pharmacy_members")
    .select("id")
    .eq("pharmacy_id", order.pharmacy_id)
    .eq("user_id", authData.user.id)
    .eq("active", true)
    .in("role", ["OWNER", "ADMIN", "MANAGER", "EMPLOYEE"])
    .maybeSingle();
  if (!membership) return response({ error: "Acesso negado" }, 403);

  const recipient = String(order.customer_phone || "").replace(/\D/g, "");
  const normalizedRecipient = recipient.startsWith("55") ? recipient : `55${recipient}`;
  const pharmacyName = Array.isArray(order.pharmacies)
    ? order.pharmacies[0]?.name
    : (order.pharmacies as { name?: string } | null)?.name;

  if (!metaToken || !phoneNumberId) {
    await admin.from("whatsapp_notification_logs").insert({
      pharmacy_id: order.pharmacy_id,
      order_id: order.id,
      status: payload.status,
      recipient: normalizedRecipient,
      delivery_state: "SKIPPED",
      error_message: "Secrets da Meta não configurados",
    });
    return response({ ok: true, skipped: true, reason: "WhatsApp não configurado" });
  }

  const metaResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${metaToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizedRecipient,
      type: "template",
      template: {
        name: template,
        language: { code: language },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: order.customer_name || "Cliente" },
            { type: "text", text: `NF-${String(order.order_number).padStart(6, "0")}` },
            { type: "text", text: statusLabels[payload.status] },
            { type: "text", text: pharmacyName || "Farmácia" },
          ],
        }],
      },
    }),
  });
  const metaBody = await metaResponse.json().catch(() => ({}));
  const messageId = metaBody?.messages?.[0]?.id || null;

  await admin.from("whatsapp_notification_logs").insert({
    pharmacy_id: order.pharmacy_id,
    order_id: order.id,
    status: payload.status,
    recipient: normalizedRecipient,
    provider_message_id: messageId,
    delivery_state: metaResponse.ok ? "SENT" : "FAILED",
    error_message: metaResponse.ok ? null : JSON.stringify(metaBody).slice(0, 1000),
  });
  if (!metaResponse.ok) return response({ error: "Falha no envio pelo WhatsApp", details: metaBody }, 502);
  return response({ ok: true, message_id: messageId });
});
