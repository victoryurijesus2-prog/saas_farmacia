/**
 * Farma+ design reminder: catalogue data mirrors the supplied reference;
 * keep card geometry stable, product imagery contained, and copy in pt-BR.
 */

export type Category = {
  id: string;
  label: string;
  shortLabel: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  installment: string;
  stock: "Em estoque" | "Retire hoje";
  badge?: string;
  image: string;
  rating: number | null;
  reviewCount: number;
  sales: number;
};

export const categories: Category[] = [
  { id: "medicamentos", label: "Medicamentos", shortLabel: "Medicamentos", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=240&q=85" },
  { id: "vitaminas", label: "Vitaminas e suplementos", shortLabel: "Vitaminas", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=240&q=85" },
  { id: "dor-febre", label: "Dor e febre", shortLabel: "Dor e Febre", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=240&q=85" },
  { id: "dermocosmeticos", label: "Dermocosméticos", shortLabel: "Dermocosméticos", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=240&q=85" },
  { id: "higiene-beleza", label: "Higiene e beleza", shortLabel: "Higiene", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=240&q=85" },
  { id: "mamae-bebe", label: "Mamãe e bebê", shortLabel: "Infantil", image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=240&q=85" },
  { id: "primeiros-socorros", label: "Primeiros socorros", shortLabel: "Primeiros Socorros", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=240&q=85" },
  { id: "saude-sexual", label: "Saúde sexual", shortLabel: "Saúde Sexual", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=240&q=85" },
  { id: "saude-bem-estar", label: "Saúde e bem-estar", shortLabel: "Bem-estar", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=240&q=85" },
];

export const brands = ["Cimed", "Vichy", "Nivea", "Needs", "Bepantol", "Pampers", "Nutriex", "Farma+"];

const productImages = {
  tablets: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=520&q=88",
  green: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=520&q=88",
  skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=520&q=88",
  serum: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=520&q=88",
  wellness: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=520&q=88",
  baby: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=520&q=88",
  care: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=520&q=88",
  firstAid: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=520&q=88",
} as const;

export const products: Product[] = [
  { id: "dipirona-1g", name: "Dipirona 1g 20 comprimidos", categoryId: "medicamentos", categoryLabel: "Medicamentos", brand: "Cimed", price: 9.99, oldPrice: 12.49, discount: 20, installment: "2x de R$ 5,00", stock: "Em estoque", badge: "Oferta", image: productImages.tablets, rating: null, reviewCount: 0, sales: 98 },
  { id: "buscopan-10mg", name: "Buscopan 10mg 20 comprimidos", categoryId: "medicamentos", categoryLabel: "Medicamentos", brand: "Cimed", price: 21.24, oldPrice: 24.99, discount: 15, installment: "2x de R$ 10,62", stock: "Em estoque", badge: "Oferta", image: productImages.green, rating: null, reviewCount: 0, sales: 92 },
  { id: "neosaldina-20", name: "Neosaldina com 20 drágeas", categoryId: "dor-febre", categoryLabel: "Medicamentos", brand: "Cimed", price: 12.99, oldPrice: 15.89, discount: 18, installment: "2x de R$ 6,50", stock: "Em estoque", badge: "Oferta", image: productImages.tablets, rating: null, reviewCount: 0, sales: 88 },
  { id: "viter-c-1g", name: "Viter C 1g com 10 comprimidos efervescentes", categoryId: "vitaminas", categoryLabel: "Vitaminas", brand: "Cimed", price: 13.29, oldPrice: 18.99, discount: 30, installment: "2x de R$ 6,65", stock: "Em estoque", badge: "Mais desconto", image: productImages.wellness, rating: null, reviewCount: 0, sales: 76 },
  { id: "nivea-hidratante", name: "Nivea Milk Hidratante 400ml", categoryId: "higiene-beleza", categoryLabel: "Higiene e Beleza", brand: "Nivea", price: 22.49, oldPrice: 28.99, discount: 22, installment: "2x de R$ 11,25", stock: "Em estoque", image: productImages.skincare, rating: null, reviewCount: 0, sales: 84 },
  { id: "nivea-sun", name: "Nivea Sun Protect & Bronze FPS 60 200ml", categoryId: "dermocosmeticos", categoryLabel: "Higiene e Beleza", brand: "Nivea", price: 66.49, oldPrice: 79.99, discount: 17, installment: "2x de R$ 33,25", stock: "Em estoque", image: productImages.serum, rating: null, reviewCount: 0, sales: 71 },
  { id: "bepantol-derma", name: "Bepantol Derma Loção Hidratante 400ml", categoryId: "dermocosmeticos", categoryLabel: "Higiene e Beleza", brand: "Bepantol", price: 64.90, oldPrice: 72.90, discount: 10, installment: "2x de R$ 32,45", stock: "Retire hoje", image: productImages.skincare, rating: null, reviewCount: 0, sales: 67 },
  { id: "protetor-solar", name: "Protetor Solar Nivea Sun FPS 60 200ml", categoryId: "dermocosmeticos", categoryLabel: "Higiene e Beleza", brand: "Nivea", price: 66.49, oldPrice: 79.90, discount: 17, installment: "2x de R$ 33,25", stock: "Em estoque", image: productImages.serum, rating: null, reviewCount: 0, sales: 64 },
  { id: "loratadina", name: "Loratadina 10mg com 12 comprimidos", categoryId: "medicamentos", categoryLabel: "Medicamentos", brand: "Cimed", price: 18.90, oldPrice: 21.90, discount: 12, installment: "2x de R$ 9,45", stock: "Em estoque", badge: "Mais vendido", image: productImages.tablets, rating: null, reviewCount: 0, sales: 120 },
  { id: "centrum", name: "Vitamina D3 2000UI com 60 cápsulas", categoryId: "vitaminas", categoryLabel: "Vitaminas", brand: "Needs", price: 34.99, oldPrice: 39.90, discount: 12, installment: "2x de R$ 17,50", stock: "Em estoque", image: productImages.wellness, rating: null, reviewCount: 0, sales: 79 },
  { id: "pampers", name: "Fralda Pampers Confort Sec M com 44 unidades", categoryId: "mamae-bebe", categoryLabel: "Infantil", brand: "Pampers", price: 89.90, oldPrice: 104.90, discount: 14, installment: "2x de R$ 44,95", stock: "Retire hoje", image: productImages.baby, rating: null, reviewCount: 0, sales: 73 },
  { id: "soro-fisiologico", name: "Soro Fisiológico 500ml", categoryId: "primeiros-socorros", categoryLabel: "Primeiros Socorros", brand: "Farma+", price: 9.90, oldPrice: 12.90, discount: 23, installment: "2x de R$ 4,95", stock: "Em estoque", image: productImages.care, rating: null, reviewCount: 0, sales: 68 },
  { id: "kit-primeiros", name: "Kit Primeiros Socorros com 39 itens", categoryId: "primeiros-socorros", categoryLabel: "Primeiros Socorros", brand: "Needs", price: 59.90, oldPrice: 69.90, discount: 14, installment: "2x de R$ 29,95", stock: "Em estoque", image: productImages.firstAid, rating: null, reviewCount: 0, sales: 54 },
  { id: "shampoo-anticaspa", name: "Shampoo Anticaspa Nizoral 200ml", categoryId: "higiene-beleza", categoryLabel: "Higiene e Beleza", brand: "Needs", price: 49.90, oldPrice: 56.90, discount: 12, installment: "2x de R$ 24,95", stock: "Em estoque", image: productImages.serum, rating: null, reviewCount: 0, sales: 61 },
  { id: "dolcoflex", name: "Dolcoflex 500mg com 20 comprimidos", categoryId: "dor-febre", categoryLabel: "Medicamentos", brand: "Cimed", price: 19.99, oldPrice: 23.99, discount: 17, installment: "2x de R$ 10,00", stock: "Em estoque", image: productImages.tablets, rating: null, reviewCount: 0, sales: 56 },
  { id: "probiotico", name: "Probiótico Lactobacillus 30 cápsulas", categoryId: "saude-bem-estar", categoryLabel: "Saúde e Bem-estar", brand: "Needs", price: 59.90, oldPrice: 68.90, discount: 13, installment: "2x de R$ 29,95", stock: "Retire hoje", image: productImages.wellness, rating: null, reviewCount: 0, sales: 48 },
  { id: "omega-3", name: "Ômega 3 1000mg 120 cápsulas", categoryId: "vitaminas", categoryLabel: "Suplementos", brand: "Needs", price: 79.90, oldPrice: 95.90, discount: 16, installment: "2x de R$ 39,95", stock: "Em estoque", image: productImages.wellness, rating: null, reviewCount: 0, sales: 45 },
  { id: "complexo-b", name: "Complexo B 100 com 60 comprimidos", categoryId: "vitaminas", categoryLabel: "Vitaminas", brand: "Cimed", price: 24.90, oldPrice: 29.90, discount: 17, installment: "2x de R$ 12,45", stock: "Em estoque", image: productImages.tablets, rating: null, reviewCount: 0, sales: 43 },
  { id: "ensure", name: "Ensure Original Chocolate 400g", categoryId: "saude-bem-estar", categoryLabel: "Saúde e Bem-estar", brand: "Needs", price: 89.90, oldPrice: 104.90, discount: 14, installment: "2x de R$ 44,95", stock: "Em estoque", image: productImages.wellness, rating: null, reviewCount: 0, sales: 42 },
  { id: "hidratante-vichy", name: "Hidratante facial Mineral 89 50ml", categoryId: "dermocosmeticos", categoryLabel: "Dermocosméticos", brand: "Vichy", price: 119.90, oldPrice: 139.90, discount: 14, installment: "3x de R$ 39,97", stock: "Em estoque", badge: "Destaque", image: productImages.skincare, rating: null, reviewCount: 0, sales: 39 },
  { id: "gel-limpeza", name: "Gel de limpeza facial 200g", categoryId: "dermocosmeticos", categoryLabel: "Dermocosméticos", brand: "Vichy", price: 79.90, oldPrice: 94.90, discount: 16, installment: "2x de R$ 39,95", stock: "Retire hoje", image: productImages.serum, rating: null, reviewCount: 0, sales: 37 },
  { id: "preservativos", name: "Preservativos com 3 unidades", categoryId: "saude-sexual", categoryLabel: "Saúde Sexual", brand: "Needs", price: 12.90, oldPrice: 15.90, discount: 19, installment: "2x de R$ 6,45", stock: "Em estoque", image: productImages.care, rating: null, reviewCount: 0, sales: 34 },
  { id: "termometro", name: "Termômetro digital clínico", categoryId: "primeiros-socorros", categoryLabel: "Primeiros Socorros", brand: "Farma+", price: 29.90, oldPrice: 36.90, discount: 19, installment: "2x de R$ 14,95", stock: "Em estoque", image: productImages.firstAid, rating: null, reviewCount: 0, sales: 31 },
];

export const editorialBanners = [
  { title: "Cuidados com a pele", description: "Rotina diária para uma pele saudável e luminosa.", cta: "Ver produtos", image: "https://sspark.genspark.ai/cfimages?u1=Mw16pCRU5tK702VMslhDtj0oJlslQVVUROhgzprThrI%2FR2VlMdkEaWBITwWrI96CNSE%2FIBaZPplFSQmjySoG41jIcquGCfzW33chIKgCGtSRL94v9ecLu9r9uJue6S%2Fh63%2Bim85TjCXPEFTcaiLzSeWswQ%3D%3D&u2=jTMHcfzXwchCoi3O&width=2560" },
  { title: "Energia e imunidade", description: "Vitaminas e nutrientes para manter o corpo forte.", cta: "Ver produtos", image: "https://sspark.genspark.ai/cfimages?u1=kMSjTbsHyM%2Fxp1MygtGYMp%2FSuA8VV2V5dg%2BvnR0BNispDeOTMeHxv6NZYX21USd6QdQR0DymTgh1z1l833ahsyCfVea7BvRFNCK6IhDyqA8mKwyY1K6s%2BO0JM2M5iHghIqa6nK6cUkWyJnx4wZqtqFGymr3noc5B2mKl1177KTup3uM%2F1d2rD%2Bl22hzZLLZwFQ%3D%3D&u2=d5OxE%2FJdrNs3hTLr&width=2560" },
  { title: "Bem-estar todos os dias", description: "Soluções para relaxar, dormir melhor e viver bem.", cta: "Ver produtos", image: "https://sspark.genspark.ai/cfimages?u1=xc%2B0riev3kWMn%2BtDmqxDCPBXX8zS8Ok03YSAhFX%2FU82HWVTuvJE00mAxZyzdC234w8CKQYJoJmMTv9JBJOSmcIt%2BPGXkwfrTjvoSWIVHjvoImhXh15FBzsjMZi%2BWk50iv3ztdJ1Nku3HwAtuOQlKoSqah%2B9kxbirpEnV6G65gjIBInb2eL6hizZWl6IUn2YW87YJA2btywnhQ9v0cjQWXI%2BxZBwkCMawZnxMu64wBU7xFFGylce4D2QrjCIIEhLK0Am8Hcd4MSXDoyBulx%2FsZeJVITPyh5F%2FjNb4CA%3D%3D&u2=W6gn3oDd%2BzMvRvcc&width=2560" },
];

export const heroSlides = [
  { eyebrow: "Cuidado que chega até você", title: "Sua saúde,\ndo seu jeito", description: "Medicamentos, cuidado e bem-estar com praticidade e segurança.", cta: "Comprar agora" },
  { eyebrow: "Tudo para sua rotina", title: "Cuide-se\npor inteiro", description: "Encontre escolhas para o seu cuidado diário em um só lugar.", cta: "Explorar produtos" },
];

export const paymentMethods = ["VISA", "Mastercard", "elo", "pix", "Boleto"];
