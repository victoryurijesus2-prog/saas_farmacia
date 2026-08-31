# WhatsApp automático por status — V8.3

A integração foi preparada para enviar uma mensagem ao cliente quando Admin/Funcionário altera o status do pedido.

## O que já funciona no código
- Histórico interno continua em `order_status_history`.
- `Aguardando pagamento` agora tem status próprio (`AWAITING_PAYMENT`).
- Ao alterar status, o frontend chama a Edge Function `order-whatsapp`.
- Se a Meta ainda não estiver configurada, o pedido é salvo normalmente e o sistema informa que o WhatsApp não está configurado.
- Cada tentativa fica registrada em `whatsapp_notification_logs`.

## Para ativar o envio real
1. Execute `MIGRACAO-V8-3-WHATSAPP.sql` no SQL Editor.
2. Crie/prepare uma conta WhatsApp Business Platform (Cloud API) na Meta.
3. Crie e aprove um template genérico, por exemplo `pedido_status_atualizado`, com 4 variáveis no corpo nesta ordem: nome do cliente, número do pedido, status e nome da farmácia.
4. No Supabase > Edge Functions > Secrets configure:
   - `META_WHATSAPP_TOKEN`
   - `META_WHATSAPP_PHONE_NUMBER_ID`
   - `META_GRAPH_VERSION` (a versão atual da Graph API usada pela sua conta)
   - `META_WHATSAPP_STATUS_TEMPLATE=pedido_status_atualizado`
   - `META_WHATSAPP_TEMPLATE_LANGUAGE=pt_BR`
5. Faça deploy da função incluída em `supabase/functions/order-whatsapp/index.ts`:
   `supabase functions deploy order-whatsapp`

## Segurança
O token da Meta NÃO fica em `config.js` e NÃO deve ir para o navegador. Ele fica somente nos Secrets da Edge Function.

## Observação importante
Mensagens livres de texto dependem da janela de atendimento do WhatsApp. Para atualização automática confiável de pedido, principalmente fora dessa janela, use template aprovado. A função foi preparada para template por padrão.
