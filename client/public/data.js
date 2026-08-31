// Natal Farma V7 — dados de demonstração (somente modo local).
// Em produção, use Supabase (pasta supabase/) — nunca dependa destes dados.

window.PHARMACY_DEFAULT_PRODUCTS = [
  {
    "id": 1,
    "name": "Dorflex 36 comprimidos",
    "brand": "Sanofi",
    "category": "Medicamentos",
    "price": 28.9,
    "promo": 23.9,
    "cost": 17.4,
    "stock": 7,
    "minStock": 8,
    "expiry": "2027-11-30",
    "desc": "Analgésico e relaxante muscular para dores no corpo, nas costas e de cabeça.",
    "image": "assets/products/dorflex.jpg",
    "featured": true,
    "active": true
  },
  {
    "id": 2,
    "name": "Dipirona Sódica 500 mg/mL gotas 20 mL",
    "brand": "EMS Genérico",
    "category": "Medicamentos",
    "price": 12.99,
    "promo": 9.99,
    "cost": 6.8,
    "stock": 25,
    "minStock": 10,
    "expiry": "2028-03-31",
    "desc": "Analgésico e antitérmico em gotas com conta-gotas, para toda a família.",
    "image": "assets/products/dipirona.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 3,
    "name": "Paracetamol 750 mg — 20 comprimidos",
    "brand": "União Química Genérico",
    "category": "Medicamentos",
    "price": 14.9,
    "promo": 11.9,
    "cost": 8.1,
    "stock": 18,
    "minStock": 10,
    "expiry": "2028-08-31",
    "desc": "Analgésico e antitérmico de uso adulto, de ação rápida.",
    "image": "assets/products/paracetamol.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 4,
    "name": "Tylenol 500 mg — 24 comprimidos",
    "brand": "Johnson & Johnson",
    "category": "Medicamentos",
    "price": 24.9,
    "promo": null,
    "cost": 15.2,
    "stock": 5,
    "minStock": 6,
    "expiry": "2027-09-30",
    "desc": "Alívio rápido e seguro para dores e febre.",
    "image": "assets/products/tylenol.jpg",
    "featured": true,
    "active": true
  },
  {
    "id": 5,
    "name": "Advil 400 mg — 20 cápsulas",
    "brand": "Haleon",
    "category": "Medicamentos",
    "price": 27.9,
    "promo": 22.9,
    "cost": 16.8,
    "stock": 5,
    "minStock": 6,
    "expiry": "2028-01-31",
    "desc": "Ibuprofeno para dores de cabeça, muscular e febre.",
    "image": "assets/products/advil.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 6,
    "name": "Aspirina C efervescente — 10 comprimidos",
    "brand": "Bayer",
    "category": "Medicamentos",
    "price": 19.9,
    "promo": null,
    "cost": 11.9,
    "stock": 16,
    "minStock": 8,
    "expiry": "2028-05-31",
    "desc": "Analgésico efervescente com vitamina C.",
    "image": "assets/products/aspirina-c.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 7,
    "name": "Sal de Frutas Eno — 10 envelopes",
    "brand": "GSK",
    "category": "Medicamentos",
    "price": 13.9,
    "promo": 11.5,
    "cost": 7.4,
    "stock": 22,
    "minStock": 10,
    "expiry": "2027-12-31",
    "desc": "Alívio rápido de azia, má digestão e mal-estar.",
    "image": "assets/products/sal-frutas-eno.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 8,
    "name": "Luftal gotas 75 mg/mL — 30 mL",
    "brand": "Reckitt",
    "category": "Medicamentos",
    "price": 24.5,
    "promo": null,
    "cost": 14.6,
    "stock": 5,
    "minStock": 6,
    "expiry": "2028-02-28",
    "desc": "Simeticona para gases e desconforto abdominal.",
    "image": "assets/products/luftal.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 9,
    "name": "Vitamina C efervescente 1 g — 10 comprimidos",
    "brand": "Bio-C Hypera",
    "category": "Vitaminas e Suplementos",
    "price": 21.9,
    "promo": 17.9,
    "cost": 12.3,
    "stock": 30,
    "minStock": 10,
    "expiry": "2028-06-30",
    "desc": "Imunidade em alta: vitamina C efervescente sabor laranja.",
    "image": "assets/products/vitamina-c.jpg",
    "featured": true,
    "active": true
  },
  {
    "id": 10,
    "name": "Centrum Adulto — 60 comprimidos",
    "brand": "Haleon",
    "category": "Vitaminas e Suplementos",
    "price": 69.9,
    "promo": null,
    "cost": 42.0,
    "stock": 6,
    "minStock": 6,
    "expiry": "2026-09-20",
    "desc": "Multivitamínico e multimineral completo para adultos.",
    "image": "assets/products/centrum.jpg",
    "featured": true,
    "active": true
  },
  {
    "id": 11,
    "name": "Magnésio Multi 5x — 60 cápsulas",
    "brand": "Vitafor",
    "category": "Vitaminas e Suplementos",
    "price": 29.9,
    "promo": null,
    "cost": 17.5,
    "stock": 9,
    "minStock": 10,
    "expiry": "2027-02-28",
    "desc": "Magnésio quelato para energia, músculos e bem-estar.",
    "image": "assets/products/magnesio-multi5x.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 12,
    "name": "Biotina 45 µg — 60 cápsulas",
    "brand": "Suplemento",
    "category": "Vitaminas e Suplementos",
    "price": 29.9,
    "promo": null,
    "cost": 16.0,
    "stock": 7,
    "minStock": 10,
    "expiry": "2026-11-20",
    "desc": "Nutriente essencial para cabelos, pele e unhas.",
    "image": "assets/products/biotina.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 13,
    "name": "MAQ Premium A–Z — 60 cápsulas",
    "brand": "Suplemento",
    "category": "Vitaminas e Suplementos",
    "price": 29.99,
    "promo": null,
    "cost": 17.2,
    "stock": 5,
    "minStock": 8,
    "expiry": "2026-10-31",
    "desc": "Vitaminas e minerais de A a Z para o dia a dia.",
    "image": "assets/products/maq-premium.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 14,
    "name": "MAQ Mulher — 60 cápsulas",
    "brand": "Suplemento",
    "category": "Vitaminas e Suplementos",
    "price": 19.98,
    "promo": null,
    "cost": 10.8,
    "stock": 8,
    "minStock": 8,
    "expiry": "2028-03-31",
    "desc": "Fórmula com ferro, ácido fólico e vitaminas para ela.",
    "image": "assets/products/maq-mulher.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 15,
    "name": "Protetor Solar Nivea Sun FPS 50 — 200 mL",
    "brand": "Nivea",
    "category": "Dermocosméticos",
    "price": 39.9,
    "promo": 32.9,
    "cost": 24.3,
    "stock": 4,
    "minStock": 6,
    "expiry": "2028-09-30",
    "desc": "Proteção UVA/UVB com hidratação e toque seco.",
    "image": "assets/products/protetor-nivea.jpg",
    "featured": true,
    "active": true
  },
  {
    "id": 16,
    "name": "Repelente OFF! Family — 170 mL",
    "brand": "SC Johnson",
    "category": "Dermocosméticos",
    "price": 32.9,
    "promo": 27.9,
    "cost": 19.4,
    "stock": 13,
    "minStock": 6,
    "expiry": "2028-12-31",
    "desc": "Até 8 horas de proteção contra mosquitos.",
    "image": "assets/products/repelente-off.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 17,
    "name": "Sabonete Líquido Lux Botanicals — 200 mL",
    "brand": "Unilever",
    "category": "Higiene",
    "price": 7.99,
    "promo": null,
    "cost": 4.2,
    "stock": 42,
    "minStock": 10,
    "expiry": "2028-03-31",
    "desc": "Limpeza suave e perfumada para o dia a dia.",
    "image": "assets/products/sabonete-lux.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 18,
    "name": "Rexona Aerosol 150 mL",
    "brand": "Unilever",
    "category": "Higiene",
    "price": 14.99,
    "promo": 12.49,
    "cost": 8.7,
    "stock": 31,
    "minStock": 10,
    "expiry": "2028-07-31",
    "desc": "Antitranspirante de longa duração, 48h.",
    "image": "assets/products/rexona-aerosol.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 19,
    "name": "Soro Fisiológico 0,9% — 500 mL",
    "brand": "Farmarin",
    "category": "Primeiros Socorros",
    "price": 8.9,
    "promo": 6.9,
    "cost": 4.6,
    "stock": 34,
    "minStock": 10,
    "expiry": "2028-05-31",
    "desc": "Solução estéril para higiene nasal e limpeza de ferimentos.",
    "image": "assets/products/soro.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 20,
    "name": "Álcool 70% — 1 L",
    "brand": "Asfer",
    "category": "Higiene",
    "price": 12.9,
    "promo": null,
    "cost": 7.8,
    "stock": 26,
    "minStock": 10,
    "expiry": "2028-11-30",
    "desc": "Álcool etílico 70% para limpeza e desinfecção.",
    "image": "assets/products/alcool-70.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 21,
    "name": "Fralda Huggies Tripla Proteção XXG — 26 un",
    "brand": "Kimberly-Clark",
    "category": "Bebê e Infantil",
    "price": 54.9,
    "promo": 47.9,
    "cost": 36.5,
    "stock": 10,
    "minStock": 6,
    "expiry": "2028-02-28",
    "desc": "Secagem extra com barreiras contra vazamentos.",
    "image": "assets/products/fralda-huggies.jpg",
    "featured": true,
    "active": true
  },
  {
    "id": 22,
    "name": "Lenços Umedecidos Johnson's Baby — 44 un",
    "brand": "Johnson's",
    "category": "Bebê e Infantil",
    "price": 12.9,
    "promo": 10.5,
    "cost": 6.9,
    "stock": 27,
    "minStock": 10,
    "expiry": "2028-04-30",
    "desc": "Suaves e hipoalergênicos para o dia a dia do bebê.",
    "image": "assets/products/lenco-johnsons.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 23,
    "name": "Bepantol Baby 120 g",
    "brand": "Bayer",
    "category": "Bebê e Infantil",
    "price": 34.9,
    "promo": 29.9,
    "cost": 21.5,
    "stock": 14,
    "minStock": 6,
    "expiry": "2028-06-30",
    "desc": "Creme preventivo de assaduras com Dexpantenol B5.",
    "image": "assets/products/bepantol.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 24,
    "name": "Toalhas Umedecidas Turminha do Rex — 120 un",
    "brand": "Infantil",
    "category": "Bebê e Infantil",
    "price": 9.99,
    "promo": null,
    "cost": 5.5,
    "stock": 36,
    "minStock": 10,
    "expiry": "2028-06-30",
    "desc": "Toalhinhas umedecidas infantis, pacote econômico.",
    "image": "assets/products/toalhas-rex.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 25,
    "name": "Shampoo Linha Seda — 325 mL",
    "brand": "Seda",
    "category": "Beleza e Cuidados Pessoais",
    "price": 19.99,
    "promo": 16.99,
    "cost": 11.8,
    "stock": 28,
    "minStock": 8,
    "expiry": "2028-01-31",
    "desc": "Cabelos macios, brilhantes e perfumados.",
    "image": "assets/products/seda.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 26,
    "name": "Kit Elseve Shampoo + Condicionador",
    "brand": "L'Oréal Paris",
    "category": "Beleza e Cuidados Pessoais",
    "price": 44.99,
    "promo": null,
    "cost": 28.9,
    "stock": 18,
    "minStock": 6,
    "expiry": "2028-05-31",
    "desc": "Kit completo para nutrição profunda dos fios.",
    "image": "assets/products/elseve-kit.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 27,
    "name": "Dove Regenerative Nutrition — 200 g",
    "brand": "Dove",
    "category": "Beleza e Cuidados Pessoais",
    "price": 29.9,
    "promo": null,
    "cost": 18.2,
    "stock": 15,
    "minStock": 5,
    "expiry": "2028-03-31",
    "desc": "Cuidado regenerativo para a pele seca.",
    "image": "assets/products/dove-regenerative.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 28,
    "name": "Hidratante Monange 200 mL",
    "brand": "Monange",
    "category": "Beleza e Cuidados Pessoais",
    "price": 9.99,
    "promo": null,
    "cost": 5.3,
    "stock": 24,
    "minStock": 8,
    "expiry": "2028-02-29",
    "desc": "Hidratação diária com perfume suave.",
    "image": "assets/products/monange.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 29,
    "name": "Sabonete Íntimo Giovanna Baby 200 mL",
    "brand": "Giovanna Baby",
    "category": "Beleza e Cuidados Pessoais",
    "price": 19.99,
    "promo": null,
    "cost": 11.5,
    "stock": 20,
    "minStock": 6,
    "expiry": "2028-04-30",
    "desc": "Limpeza íntima diária com pH balanceado.",
    "image": "assets/products/giovanna-baby.jpg",
    "featured": false,
    "active": true
  },
  {
    "id": 30,
    "name": "Gillette Venus Sensitive — 1 un",
    "brand": "Gillette",
    "category": "Beleza e Cuidados Pessoais",
    "price": 13.99,
    "promo": null,
    "cost": 7.6,
    "stock": 0,
    "minStock": 6,
    "expiry": "2028-12-31",
    "desc": "Aparelho feminino com lâminas para pele sensível.",
    "image": "assets/products/gillette-venus.jpg",
    "featured": false,
    "active": true
  }
];
window.PHARMACY_DEFAULT_SETTINGS = {
  "loyaltyEnabled": true,
  "loyaltyRate": 1,
  "loyaltyRedeemPoints": 500,
  "loyaltyRedeemValue": 20,
  "freeDeliveryMin": 150,
  "topNotice": "Atendimento 24 horas · Entregas no mesmo dia em Natal/RN",
  "bannerTitle": "Cuidar de você ficou ainda mais fácil.",
  "bannerSubtitle": "Medicamentos, higiene e ofertas em um só lugar.",
  "bannerButton": "Ver produtos",
  "bannerLink": "#produtos",
  "bannerImage": ""
};
window.PHARMACY_INFO = {
  "name": "Natal Farma",
  "slogan": "24 Horas",
  "instagram": "@natalfarma",
  "address": "Av. Senador Salgado Filho, 1920 — Lagoa Nova, Natal/RN",
  "hoursWeek": "Segunda a domingo — 24 horas",
  "hoursSunday": "Domingos e feriados — 24 horas",
  "whatsapp": "84999990000"
};
window.PHARMACY_DEFAULT_ZONES = [
  {
    "id": 1,
    "name": "Centro",
    "fee": 5,
    "active": true
  },
  {
    "id": 2,
    "name": "Lagoa Nova",
    "fee": 7,
    "active": true
  },
  {
    "id": 3,
    "name": "Demais bairros",
    "fee": 10,
    "active": true
  },
  {
    "id": 4,
    "name": "Zona Norte",
    "fee": 12,
    "active": true
  }
];
window.PHARMACY_DEFAULT_COUPONS = [
  {
    "id": 1,
    "code": "FARMA10",
    "type": "percent",
    "value": 10,
    "minTotal": 50,
    "maxUses": 200,
    "usedCount": 26,
    "perUser": 1,
    "startsAt": "2026-08-01T00:00",
    "endsAt": "2026-09-03T23:59",
    "active": true
  },
  {
    "id": 2,
    "code": "COMPRA20",
    "type": "fixed",
    "value": 20,
    "minTotal": 150,
    "maxUses": 100,
    "usedCount": 9,
    "perUser": 1,
    "startsAt": "2026-08-01T00:00",
    "endsAt": "2026-10-31T23:59",
    "active": true
  },
  {
    "id": 3,
    "code": "BEMVINDO",
    "type": "percent",
    "value": 5,
    "minTotal": 0,
    "maxUses": 500,
    "usedCount": 18,
    "perUser": 1,
    "startsAt": "2026-01-01T00:00",
    "endsAt": "2026-12-31T23:59",
    "active": true
  }
];
window.PHARMACY_DEFAULT_BANNERS = [
  {
    "id": 1,
    "title": "Cuidar de você ficou ainda mais fácil.",
    "subtitle": "Medicamentos, higiene, cuidados pessoais e ofertas especiais em um só lugar.",
    "button": "Ver produtos",
    "link": "#produtos",
    "image": "",
    "tone": "brand",
    "startsAt": "2026-08-01T00:00",
    "endsAt": "2026-12-31T23:59",
    "active": true
  },
  {
    "id": 2,
    "title": "Semana da Saúde: até 20% OFF.",
    "subtitle": "Use o cupom FARMA10 e ganhe 10% em pedidos acima de R$ 50. Por tempo limitado!",
    "button": "Confira as ofertas",
    "link": "#ofertas",
    "image": "",
    "tone": "teal",
    "startsAt": "2026-08-20T00:00",
    "endsAt": "2026-09-03T23:59",
    "active": true
  }
];
window.PHARMACY_DEFAULT_USERS = [
  {
    "id": 1,
    "name": "Administrador",
    "email": "admin@farmacia.com",
    "phone": "",
    "role": "admin",
    "salt": "f3a1c9d2b8471e50629a7b8c4d5e6f70",
    "hash": "4924d7266ff37c0daf78e10f729fae178452e1c18d1e2d6e702f2878d1b54282",
    "fallbackHash": "1ea99d89985936a353781d56281f6a529cd6e24256d740b8298907775ea47159",
    "scheme": "pbkdf2",
    "active": true,
    "createdAt": "2026-01-15T09:00:00"
  },
  {
    "id": 2,
    "name": "Funcionário Demo",
    "email": "funcionario@farmacia.com",
    "phone": "",
    "role": "employee",
    "salt": "8b2e4f1a7c3d5960e8a4b1c2d3e4f5a6",
    "hash": "fabb052b694fd986b02a3fee37a82246852681b28022964cac1427c4f4a3101f",
    "fallbackHash": "af7f8700a5f749dca6632d99302604e400007b66dcf34a68cfdaee7567cd97a9",
    "scheme": "pbkdf2",
    "active": true,
    "createdAt": "2026-01-15T09:05:00"
  },
  {
    "id": 3,
    "name": "Cliente Demo",
    "email": "cliente@farmacia.com",
    "phone": "84900001111",
    "role": "customer",
    "salt": "1d5c9e3a7b2f8460a5c1d2e3f4b6a7c8",
    "hash": "29d9e2ce4aa3b36feee69d922dfb88a2c2d5ce434c4ec0666e0949c4756574c2",
    "fallbackHash": "64411d2c6cbee31fa47bfade91bb7883d41c44f07b19bf48c025b62263a3215f",
    "scheme": "pbkdf2",
    "active": true,
    "createdAt": "2026-02-01T10:00:00"
  }
];
window.PHARMACY_DEFAULT_ORDERS = [
  {
    "id": 1,
    "number": "NF-001001",
    "createdAt": "2026-08-01T10:00:00",
    "customer": {
      "name": "Maria Souza",
      "phone": "84991112233",
      "email": "maria.souza@email.com",
      "address": "Rua das Flores, 120 — Lagoa Nova, Natal/RN"
    },
    "deliveryMode": "retirada",
    "zone": null,
    "deliveryFee": 0,
    "items": [
      {
        "id": 1,
        "name": "Dorflex 36 comprimidos",
        "price": 23.9,
        "qty": 2
      },
      {
        "id": 2,
        "name": "Dipirona Sódica 500 mg/mL gotas 20 mL",
        "price": 9.99,
        "qty": 1
      }
    ],
    "subtotal": 57.79,
    "discount": 5.78,
    "coupon": {
      "code": "FARMA10",
      "value": 5.78
    },
    "total": 52.01,
    "paymentRequested": "PIX",
    "paymentConfirmed": "PIX",
    "paymentStatus": "Pago",
    "status": "Concluído",
    "cancelReason": null,
    "loyaltyAwarded": true,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-01T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-01T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-01T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-01T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-01T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-01T12:05:00",
        "by": "Equipe"
      },
      {
        "status": "Concluído",
        "at": "2026-08-01T12:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 2,
    "number": "NF-001002",
    "createdAt": "2026-08-04T10:00:00",
    "customer": {
      "name": "João Pereira",
      "phone": "84991114455",
      "email": "joao.pereira@email.com",
      "address": "Av. Prudente de Morais, 880 — Petrópolis, Natal/RN"
    },
    "deliveryMode": "entrega",
    "zone": "Centro",
    "deliveryFee": 5,
    "items": [
      {
        "id": 3,
        "name": "Paracetamol 750 mg — 20 comprimidos",
        "price": 11.9,
        "qty": 3
      }
    ],
    "subtotal": 35.7,
    "discount": 0.0,
    "coupon": null,
    "total": 40.7,
    "paymentRequested": "Dinheiro",
    "paymentConfirmed": "Dinheiro",
    "paymentStatus": "Pago",
    "status": "Concluído",
    "cancelReason": null,
    "loyaltyAwarded": true,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-04T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-04T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-04T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-04T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-04T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-04T12:05:00",
        "by": "Equipe"
      },
      {
        "status": "Concluído",
        "at": "2026-08-04T12:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 3,
    "number": "NF-001003",
    "createdAt": "2026-08-09T10:00:00",
    "customer": {
      "name": "Ana Lima",
      "phone": "84991115566",
      "email": "ana.lima@email.com",
      "address": "Rua do Fogo, 45 — Cidade Alta, Natal/RN"
    },
    "deliveryMode": "entrega",
    "zone": "Lagoa Nova",
    "deliveryFee": 7,
    "items": [
      {
        "id": 21,
        "name": "Fralda Huggies Tripla Proteção XXG — 26 un",
        "price": 47.9,
        "qty": 2
      },
      {
        "id": 23,
        "name": "Bepantol Baby 120 g",
        "price": 29.9,
        "qty": 1
      }
    ],
    "subtotal": 125.7,
    "discount": 0.0,
    "coupon": null,
    "total": 132.7,
    "paymentRequested": "Cartão de crédito",
    "paymentConfirmed": "Cartão de crédito",
    "paymentStatus": "Pago",
    "status": "Concluído",
    "cancelReason": null,
    "loyaltyAwarded": true,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-09T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-09T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-09T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-09T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-09T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-09T12:05:00",
        "by": "Equipe"
      },
      {
        "status": "Concluído",
        "at": "2026-08-09T12:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 4,
    "number": "NF-001004",
    "createdAt": "2026-08-12T10:00:00",
    "customer": {
      "name": "Carlos Santos",
      "phone": "84991117788",
      "email": "carlos.santos@email.com",
      "address": "Av. Hermes da Fonseca, 310 — Tirol, Natal/RN"
    },
    "deliveryMode": "entrega",
    "zone": "Demais bairros",
    "deliveryFee": 10,
    "items": [
      {
        "id": 5,
        "name": "Advil 400 mg — 20 cápsulas",
        "price": 22.9,
        "qty": 1
      },
      {
        "id": 6,
        "name": "Aspirina C efervescente — 10 comprimidos",
        "price": 19.9,
        "qty": 2
      }
    ],
    "subtotal": 62.7,
    "discount": 0.0,
    "coupon": null,
    "total": 72.7,
    "paymentRequested": "PIX",
    "paymentConfirmed": null,
    "paymentStatus": "Pendente",
    "status": "Cancelado",
    "cancelReason": "Cliente desistiu",
    "loyaltyAwarded": false,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-12T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Cancelado",
        "at": "2026-08-12T10:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 5,
    "number": "NF-001005",
    "createdAt": "2026-08-17T10:00:00",
    "customer": {
      "name": "Fernanda Alves",
      "phone": "84991119900",
      "email": "fernanda.alves@email.com",
      "address": "Rua Professor Zuza, 77 — Barro Vermelho, Natal/RN"
    },
    "deliveryMode": "retirada",
    "zone": null,
    "deliveryFee": 0,
    "items": [
      {
        "id": 1,
        "name": "Dorflex 36 comprimidos",
        "price": 23.9,
        "qty": 3
      },
      {
        "id": 2,
        "name": "Dipirona Sódica 500 mg/mL gotas 20 mL",
        "price": 9.99,
        "qty": 3
      },
      {
        "id": 9,
        "name": "Vitamina C efervescente 1 g — 10 comprimidos",
        "price": 17.9,
        "qty": 2
      }
    ],
    "subtotal": 137.47,
    "discount": 13.75,
    "coupon": {
      "code": "FARMA10",
      "value": 13.75
    },
    "total": 123.72,
    "paymentRequested": "PIX",
    "paymentConfirmed": "PIX",
    "paymentStatus": "Pago",
    "status": "Concluído",
    "cancelReason": null,
    "loyaltyAwarded": true,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-17T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-17T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-17T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-17T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-17T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-17T12:05:00",
        "by": "Equipe"
      },
      {
        "status": "Concluído",
        "at": "2026-08-17T12:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 6,
    "number": "NF-001006",
    "createdAt": "2026-08-13T10:00:00",
    "customer": {
      "name": "Cliente Demo",
      "phone": "84900001111",
      "email": "cliente@farmacia.com",
      "address": "Av. Salgado Filho, 1920 — Lagoa Nova, Natal/RN"
    },
    "deliveryMode": "retirada",
    "zone": null,
    "deliveryFee": 0,
    "items": [
      {
        "id": 9,
        "name": "Vitamina C efervescente 1 g — 10 comprimidos",
        "price": 17.9,
        "qty": 4
      },
      {
        "id": 11,
        "name": "Magnésio Multi 5x — 60 cápsulas",
        "price": 29.9,
        "qty": 1
      }
    ],
    "subtotal": 101.5,
    "discount": 0.0,
    "coupon": null,
    "total": 101.5,
    "paymentRequested": "PIX",
    "paymentConfirmed": "PIX",
    "paymentStatus": "Pago",
    "status": "Concluído",
    "cancelReason": null,
    "loyaltyAwarded": true,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-13T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-13T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-13T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-13T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-13T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-13T12:05:00",
        "by": "Equipe"
      },
      {
        "status": "Concluído",
        "at": "2026-08-13T12:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 7,
    "number": "NF-001007",
    "createdAt": "2026-08-19T10:00:00",
    "customer": {
      "name": "Cliente Demo",
      "phone": "84900001111",
      "email": "cliente@farmacia.com",
      "address": "Av. Salgado Filho, 1920 — Lagoa Nova, Natal/RN"
    },
    "deliveryMode": "entrega",
    "zone": "Centro",
    "deliveryFee": 5,
    "items": [
      {
        "id": 19,
        "name": "Soro Fisiológico 0,9% — 500 mL",
        "price": 6.9,
        "qty": 3
      },
      {
        "id": 20,
        "name": "Álcool 70% — 1 L",
        "price": 12.9,
        "qty": 1
      }
    ],
    "subtotal": 33.6,
    "discount": 0.0,
    "coupon": null,
    "total": 38.6,
    "paymentRequested": "Cartão de débito",
    "paymentConfirmed": "Cartão de débito",
    "paymentStatus": "Pago",
    "status": "Concluído",
    "cancelReason": null,
    "loyaltyAwarded": true,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-19T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-19T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-19T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-19T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-19T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-19T12:05:00",
        "by": "Equipe"
      },
      {
        "status": "Concluído",
        "at": "2026-08-19T12:30:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 8,
    "number": "NF-001008",
    "createdAt": "2026-08-21T10:00:00",
    "customer": {
      "name": "Maria Souza",
      "phone": "84991112233",
      "email": "maria.souza@email.com",
      "address": "Rua das Flores, 120 — Lagoa Nova, Natal/RN"
    },
    "deliveryMode": "retirada",
    "zone": null,
    "deliveryFee": 0,
    "items": [
      {
        "id": 15,
        "name": "Protetor Solar Nivea Sun FPS 50 — 200 mL",
        "price": 32.9,
        "qty": 1
      },
      {
        "id": 16,
        "name": "Repelente OFF! Family — 170 mL",
        "price": 27.9,
        "qty": 1
      }
    ],
    "subtotal": 60.8,
    "discount": 3.04,
    "coupon": {
      "code": "BEMVINDO",
      "value": 3.04
    },
    "total": 57.76,
    "paymentRequested": "PIX",
    "paymentConfirmed": null,
    "paymentStatus": "Pendente",
    "status": "Em separação",
    "cancelReason": null,
    "loyaltyAwarded": false,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-21T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-21T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-21T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-21T11:15:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 9,
    "number": "NF-001009",
    "createdAt": "2026-08-24T10:00:00",
    "customer": {
      "name": "João Pereira",
      "phone": "84991114455",
      "email": "joao.pereira@email.com",
      "address": "Av. Prudente de Morais, 880 — Petrópolis, Natal/RN"
    },
    "deliveryMode": "retirada",
    "zone": null,
    "deliveryFee": 0,
    "items": [
      {
        "id": 1,
        "name": "Dorflex 36 comprimidos",
        "price": 23.9,
        "qty": 4
      },
      {
        "id": 8,
        "name": "Luftal gotas 75 mg/mL — 30 mL",
        "price": 24.5,
        "qty": 1
      }
    ],
    "subtotal": 120.1,
    "discount": 0.0,
    "coupon": null,
    "total": 120.1,
    "paymentRequested": "Dinheiro",
    "paymentConfirmed": "Dinheiro",
    "paymentStatus": "Pago",
    "status": "Saiu para entrega",
    "cancelReason": null,
    "loyaltyAwarded": false,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-24T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-24T10:25:00",
        "by": "Equipe"
      },
      {
        "status": "Pagamento confirmado",
        "at": "2026-08-24T10:50:00",
        "by": "Equipe"
      },
      {
        "status": "Em separação",
        "at": "2026-08-24T11:15:00",
        "by": "Equipe"
      },
      {
        "status": "Pronto",
        "at": "2026-08-24T11:40:00",
        "by": "Equipe"
      },
      {
        "status": "Saiu para entrega",
        "at": "2026-08-24T12:05:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 10,
    "number": "NF-001010",
    "createdAt": "2026-08-26T10:00:00",
    "customer": {
      "name": "Fernanda Alves",
      "phone": "84991119900",
      "email": "fernanda.alves@email.com",
      "address": "Rua Professor Zuza, 77 — Barro Vermelho, Natal/RN"
    },
    "deliveryMode": "entrega",
    "zone": "Demais bairros",
    "deliveryFee": 10,
    "items": [
      {
        "id": 4,
        "name": "Tylenol 500 mg — 24 comprimidos",
        "price": 24.9,
        "qty": 2
      },
      {
        "id": 10,
        "name": "Centrum Adulto — 60 comprimidos",
        "price": 69.9,
        "qty": 1
      }
    ],
    "subtotal": 119.7,
    "discount": 0.0,
    "coupon": null,
    "total": 129.7,
    "paymentRequested": "PIX",
    "paymentConfirmed": null,
    "paymentStatus": "Pendente",
    "status": "Aguardando pagamento",
    "cancelReason": null,
    "loyaltyAwarded": false,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-26T10:00:00",
        "by": "Sistema"
      },
      {
        "status": "Aguardando pagamento",
        "at": "2026-08-26T10:25:00",
        "by": "Equipe"
      }
    ]
  },
  {
    "id": 11,
    "number": "NF-001011",
    "createdAt": "2026-08-27T07:00:00",
    "customer": {
      "name": "Cliente Demo",
      "phone": "84900001111",
      "email": "cliente@farmacia.com",
      "address": "Av. Salgado Filho, 1920 — Lagoa Nova, Natal/RN"
    },
    "deliveryMode": "entrega",
    "zone": "Centro",
    "deliveryFee": 5,
    "items": [
      {
        "id": 2,
        "name": "Dipirona Sódica 500 mg/mL gotas 20 mL",
        "price": 9.99,
        "qty": 2
      },
      {
        "id": 9,
        "name": "Vitamina C efervescente 1 g — 10 comprimidos",
        "price": 17.9,
        "qty": 1
      }
    ],
    "subtotal": 37.88,
    "discount": 0.0,
    "coupon": null,
    "total": 42.88,
    "paymentRequested": "PIX",
    "paymentConfirmed": null,
    "paymentStatus": "Pendente",
    "status": "Pedido recebido",
    "cancelReason": null,
    "loyaltyAwarded": false,
    "statusHistory": [
      {
        "status": "Pedido recebido",
        "at": "2026-08-27T07:00:00",
        "by": "Sistema"
      }
    ]
  }
];
window.PHARMACY_DEFAULT_CUSTOMERS = [
  {
    "id": 1,
    "name": "Maria Souza",
    "phone": "84991112233",
    "email": "maria.souza@email.com",
    "address": "Rua das Flores, 120 — Lagoa Nova, Natal/RN",
    "totalSpent": 109.77,
    "ordersCount": 2,
    "points": 1,
    "lastOrderAt": "2026-08-21T10:00:00",
    "createdAt": "2026-08-01T12:00:00",
    "profile": "recorrente"
  },
  {
    "id": 2,
    "name": "João Pereira",
    "phone": "84991114455",
    "email": "joao.pereira@email.com",
    "address": "Av. Prudente de Morais, 880 — Petrópolis, Natal/RN",
    "totalSpent": 160.8,
    "ordersCount": 2,
    "points": 1,
    "lastOrderAt": "2026-08-24T10:00:00",
    "createdAt": "2026-08-04T09:30:00",
    "profile": "recorrente"
  },
  {
    "id": 3,
    "name": "Ana Lima",
    "phone": "84991115566",
    "email": "ana.lima@email.com",
    "address": "Rua do Fogo, 45 — Cidade Alta, Natal/RN",
    "totalSpent": 132.7,
    "ordersCount": 1,
    "points": 1,
    "lastOrderAt": "2026-08-09T10:00:00",
    "createdAt": "2026-08-09T15:10:00",
    "profile": "fiel"
  },
  {
    "id": 4,
    "name": "Carlos Santos",
    "phone": "84991117788",
    "email": "carlos.santos@email.com",
    "address": "Av. Hermes da Fonseca, 310 — Tirol, Natal/RN",
    "totalSpent": 72.7,
    "ordersCount": 1,
    "points": 0,
    "lastOrderAt": "2026-08-12T10:00:00",
    "createdAt": "2026-08-12T11:20:00",
    "profile": "novo"
  },
  {
    "id": 5,
    "name": "Fernanda Alves",
    "phone": "84991119900",
    "email": "fernanda.alves@email.com",
    "address": "Rua Professor Zuza, 77 — Barro Vermelho, Natal/RN",
    "totalSpent": 253.42,
    "ordersCount": 2,
    "points": 1,
    "lastOrderAt": "2026-08-26T10:00:00",
    "createdAt": "2026-08-17T16:45:00",
    "profile": "recorrente"
  },
  {
    "id": 6,
    "name": "Cliente Demo",
    "phone": "84900001111",
    "email": "cliente@farmacia.com",
    "address": "Av. Salgado Filho, 1920 — Lagoa Nova, Natal/RN",
    "totalSpent": 182.98,
    "ordersCount": 3,
    "points": 2,
    "lastOrderAt": "2026-08-27T07:00:00",
    "createdAt": "2026-08-13T10:00:00",
    "profile": "fiel"
  }
];
window.PHARMACY_DEFAULT_COUPON_USAGE = [
  {
    "id": 1,
    "couponCode": "FARMA10",
    "userKey": "84991112233",
    "orderNumber": "NF-001001",
    "usedAt": "2026-08-01T10:00:00"
  },
  {
    "id": 2,
    "couponCode": "FARMA10",
    "userKey": "84991119900",
    "orderNumber": "NF-001005",
    "usedAt": "2026-08-17T10:00:00"
  },
  {
    "id": 3,
    "couponCode": "BEMVINDO",
    "userKey": "84991112233",
    "orderNumber": "NF-001008",
    "usedAt": "2026-08-21T10:00:00"
  }
];
