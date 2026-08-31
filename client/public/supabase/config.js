/* Configuração PÚBLICA do Supabase.
   A anon key pode ficar no frontend quando o RLS está correto.
   NUNCA coloque service_role, token do Mercado Pago ou outras chaves secretas aqui. */
window.NF_SUPABASE = {
  enabled: true,
  url: 'https://wvmoqujtnmfnqgpdpcle.supabase.co',
  anonKey: 'sb_publishable_6b2IGzYMqB61_IZ-6f1NvQ_mzQEza_T',
  defaultPharmacyId: '',
  defaultPharmacySlug: 'natal-farma',
  storageBucket: 'pharmacy-images',
  whatsappStatusNotifications: true
};
