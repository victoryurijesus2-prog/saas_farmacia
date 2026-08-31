import { createClient, type User } from "@supabase/supabase-js";
import type { Product, Category } from "./catalog";

const url = import.meta.env.VITE_SUPABASE_URL || "https://wvmoqujtnmfnqgpdpcle.supabase.co";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_6b2IGzYMqB61_IZ-6f1NvQ_mzQEza_T";
export const supabase = createClient(url, publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

export type StoreSettings = { pharmacyId: string; name: string; logo: string | null; whatsapp: string; address: string; hours: string; freeDeliveryMin: number };
export type DeliveryZone = { id: string; name: string; fee: number; minOrder: number };
export type AccountData = { profile: { full_name: string; phone: string; email: string }; customer: null | { id: string; name: string; phone: string; email: string; points: number; orders_count: number; total_spent: number; address: string }; orders: any[] };

let pharmacyCache: any = null;
export async function resolvePharmacy() {
  if (pharmacyCache) return pharmacyCache;
  const { data, error } = await supabase.from("pharmacies").select("id,name,slug,logo_url,phone,address,status").eq("slug", "natal-farma").in("status", ["trial", "active"]).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Farmácia não encontrada no Supabase.");
  pharmacyCache = data;
  return data;
}

function mapProduct(row: any): Product {
  const price = Number(row.promo_price ?? row.price ?? 0);
  const oldPrice = row.promo_price != null ? Number(row.price) : undefined;
  const discount = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : undefined;
  return { id: String(row.id), name: row.name || "Produto", categoryId: String(row.category_id || "outros"), categoryLabel: row.categories?.name || "Outros", brand: row.brand || "Farmácia", price, oldPrice, discount, installment: `2x de ${(price / 2).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, stock: Number(row.stock || 0) > 0 ? "Em estoque" : "Retire hoje", badge: row.featured ? "Destaque" : discount ? "Oferta" : undefined, image: row.image_url || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=520&q=85", rating: null, reviewCount: 0, sales: 0 };
}

export async function loadStore() {
  const pharmacy = await resolvePharmacy();
  const [catalog, categoryResult, settingsResult, zonesResult] = await Promise.all([
    supabase.rpc("public_catalog_products_secure", { p_pharmacy: pharmacy.id }),
    supabase.from("categories").select("id,name,sort_order").eq("pharmacy_id", pharmacy.id).eq("active", true).order("sort_order"),
    supabase.from("pharmacy_settings").select("whatsapp,hours,free_delivery_min").eq("pharmacy_id", pharmacy.id).maybeSingle(),
    supabase.from("delivery_zones").select("id,name,fee,min_order").eq("pharmacy_id", pharmacy.id).eq("active", true).order("sort_order"),
  ]);
  let catalogRows: any[] = Array.isArray(catalog.data) ? catalog.data : [];
  if (catalog.error) {
    if (catalog.error.code !== "PGRST202") throw catalog.error;
    const direct = await supabase.from("products").select("id,pharmacy_id,category_id,name,slug,brand,description,price,promo_price,stock,image_url,featured,active,categories(name)").eq("pharmacy_id",pharmacy.id).eq("active",true).order("name");
    if (direct.error) throw direct.error;
    catalogRows = direct.data || [];
  }
  const products = catalogRows.map(mapProduct);
  const categories: Category[] = (categoryResult.data || []).map((item: any) => ({ id: String(item.id), label: item.name, shortLabel: item.name, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=240&q=85" }));
  const address = typeof pharmacy.address === "object" ? pharmacy.address?.formatted || "" : pharmacy.address || "";
  const hours = settingsResult.data?.hours || {};
  const settings: StoreSettings = { pharmacyId: pharmacy.id, name: pharmacy.name, logo: pharmacy.logo_url, whatsapp: settingsResult.data?.whatsapp || pharmacy.phone || "", address, hours: hours.hoursWeek || "", freeDeliveryMin: Number(settingsResult.data?.free_delivery_min || 0) };
  const zones: DeliveryZone[] = (zonesResult.data || []).map((zone: any) => ({ id: String(zone.id), name: zone.name, fee: Number(zone.fee || 0), minOrder: Number(zone.min_order || 0) }));
  return { products, categories, settings, zones };
}

export async function signIn(email: string, password: string) { return supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }); }
export async function destinationForUser(userId: string) {
  const { data } = await supabase.from("pharmacy_members").select("role,active").eq("user_id",userId).eq("active",true).limit(1).maybeSingle();
  if (data?.role === "EMPLOYEE") return "/funcionario/index.html";
  if (["OWNER","ADMIN","MANAGER"].includes(String(data?.role || ""))) return "/admin/index.html";
  return "/minha-conta";
}
export async function signUp(input: { name: string; phone: string; email: string; password: string }) { return supabase.auth.signUp({ email: input.email.trim().toLowerCase(), password: input.password, options: { data: { full_name: input.name.trim(), phone: input.phone.replace(/\D/g, "") } } }); }
export async function resetPassword(email: string) { return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${location.origin}/entrar` }); }
export async function getUser(): Promise<User | null> { const { data } = await supabase.auth.getUser(); return data.user; }

export async function getAccount(): Promise<AccountData> {
  const { data, error } = await supabase.rpc("customer_account_secure");
  if (!error) return data as AccountData;
  if (error.code !== "PGRST202") throw error;
  const user = await getUser(); if (!user) throw new Error("Não autenticado");
  const profileResult = await supabase.from("profiles").select("full_name,phone").eq("id",user.id).maybeSingle();
  if (profileResult.error) throw profileResult.error;
  const customerResult = await supabase.from("customers").select("id,name,phone,email,points,orders_count,total_spent").eq("auth_user_id",user.id).maybeSingle();
  if (customerResult.error) throw customerResult.error;
  let customer: any = customerResult.data; let orders: any[] = [];
  if (customer) {
    const [addressResult, ordersResult] = await Promise.all([supabase.from("customer_addresses").select("street,number,neighborhood,city").eq("customer_id",customer.id).order("is_default",{ascending:false}).limit(1).maybeSingle(),supabase.from("orders").select("*,order_items(*),order_status_history(*)").eq("customer_id",customer.id).order("created_at",{ascending:false})]);
    customer = { ...customer, address: addressResult.data ? [addressResult.data.street,addressResult.data.number,addressResult.data.neighborhood,addressResult.data.city].filter(Boolean).join(", ") : "" };
    orders = ordersResult.data || [];
  }
  return { profile: { full_name: profileResult.data?.full_name || "", phone: profileResult.data?.phone || "", email: user.email || "" }, customer, orders };
}

export async function updateAccount(input: { name: string; phone: string; email: string; address: string }) {
  const { data, error } = await supabase.rpc("update_customer_profile_secure", { p_name: input.name, p_phone: input.phone, p_email: input.email, p_address: input.address });
  if (!error) return data as AccountData;
  if (error.code !== "PGRST202") throw error;
  const user = await getUser(); if (!user) throw new Error("Não autenticado");
  const phone = input.phone.replace(/\D/g, "");
  const profileResult = await supabase.from("profiles").update({ full_name: input.name.trim(), phone, updated_at: new Date().toISOString() }).eq("id",user.id);
  if (profileResult.error) throw profileResult.error;
  const customerResult = await supabase.from("customers").update({ name: input.name.trim(), phone, email: user.email, updated_at: new Date().toISOString() }).eq("auth_user_id",user.id).select("id").maybeSingle();
  if (customerResult.error) throw customerResult.error;
  if (customerResult.data?.id && input.address.trim()) {
    const existing = await supabase.from("customer_addresses").select("id").eq("customer_id",customerResult.data.id).order("is_default",{ascending:false}).limit(1).maybeSingle();
    if (existing.data?.id) await supabase.from("customer_addresses").update({ street: input.address.trim(), is_default: true }).eq("id",existing.data.id);
  }
  return getAccount();
}

export async function createOrder(input: { name: string; phone: string; email: string; address: string; deliveryMode: "delivery" | "pickup"; deliveryZoneId?: string | null; paymentMethod: string; couponCode?: string; items: { id: string; qty: number }[] }) {
  const pharmacy = await resolvePharmacy();
  const payload = { name: input.name, phone: input.phone, email: input.email, delivery_mode: input.deliveryMode, delivery_zone_id: input.deliveryZoneId || null, payment_method: input.paymentMethod, coupon_code: input.couponCode || "", address: input.deliveryMode === "delivery" ? { formatted: input.address, street: input.address } : {}, items: input.items };
  const { data, error } = await supabase.rpc("create_order_secure_v2", { p_pharmacy: pharmacy.id, p_payload: payload });
  if (!error) return data;
  if (error.code !== "PGRST202") throw error;
  const legacy = await supabase.rpc("create_order_secure", { p_pharmacy: pharmacy.id, payload });
  if (legacy.error) throw legacy.error;
  return { id: legacy.data };
}
