/**
 * Farma+ identity placeholder. Esta plataforma é neutra e está pronta para
 * ser apresentada a qualquer farmácia parceira: nenhum dado vincula o site a
 * uma unidade, cidade, CNPJ ou endereço específicos. Cada farmácia adaptará
 * apenas os pontos abaixo quando for adotar o projeto.
 */

const FARMA_PLUS_LOGO_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiNlMzA2MTMiLz48cGF0aCBkPSJNMjggMTRoOHYxNGgxNHY4SDM2djE0aC04VjM2SDE0di04aDE0eiIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==";

export const siteConfig = {
  brand: {
    name: "Farma+",
    descriptor: "Cuidado que acompanha você",
    logoMark: FARMA_PLUS_LOGO_SVG,
  },
  contact: {
    whatsappNumber: "5500000000000",
    whatsappDisplay: "WhatsApp da farmácia",
    email: "atendimento@farmaplus.com.br",
    address: "Endereço configurável pela farmácia parceira",
    hours: "Atendimento de segunda a sábado",
  },
  location: {
    defaultCity: "Selecione sua região",
    options: [
      "Selecione sua região",
      "Centro",
      "Zona Norte",
      "Zona Sul",
      "Zona Leste",
      "Zona Oeste",
    ],
  },
  social: ["Instagram", "Facebook", "YouTube", "TikTok"],
  legal: {
    cnpj: "00.000.000/0001-00",
    notice:
      "Farma+ é uma plataforma modelo para apresentação comercial a farmácias parceiras — personalize ao integrar.",
  },
  navigation: [
    { label: "Medicamentos", categoryId: "medicamentos" },
    { label: "Vitaminas", categoryId: "vitaminas" },
    { label: "Dermocosméticos", categoryId: "dermocosmeticos" },
    { label: "Higiene e Beleza", categoryId: "higiene-beleza" },
    { label: "Mamãe e Bebê", categoryId: "mamae-bebe" },
    { label: "Ofertas", categoryId: "ofertas" },
  ],
} as const;

export function buildWhatsAppLink(message: string, number?: string) {
  const phone = String(number || siteConfig.contact.whatsappNumber).replace(/\D/g, "");
  return `https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}?text=${encodeURIComponent(message)}`;
}
