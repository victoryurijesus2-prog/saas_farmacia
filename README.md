# Farma+

Site e sistema responsivo de farmácia, desenvolvido em React, TypeScript, Vite, Supabase e Lucide React. Loja, autenticação, perfil, catálogo, pedidos e painéis utilizam a mesma base de dados; produtos demonstrativos aparecem apenas como contingência quando o Supabase está indisponível.

## Executar localmente

```bat
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para validar uma build de produção:

```bat
npm run check
npm run build
npm start
```

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Página inicial com hero, categorias, ofertas, campanhas, editoriais, marcas, confiança, atendimento e rodapé. |
| `/produtos` | Catálogo com busca, filtros combinados, ordenação, visualização em grade/lista e paginação. |
| `/entrar` | Login, cadastro e recuperação de senha do cliente. |
| `/minha-conta` | Perfil, pontos e histórico de pedidos do cliente autenticado. |
| `/admin/` | Área administrativa preservada do sistema. |
| `/funcionario/` | Área operacional do funcionário. |
| `/cliente/` | Área de acompanhamento do cliente. |

## Funcionalidades

A implementação inclui navegação real entre as páginas, busca por nome/categoria/marca, filtros por categoria, marca, faixa de preço, desconto, disponibilidade e avaliação demonstrativa, chips removíveis, ordenação, alternância de grade/lista, paginação, favoritos persistentes, carrinho persistente com alteração de quantidade e subtotal, localização persistente, carrosséis e rails horizontais, estados vazios, feedback ao adicionar, drawer mobile de filtros, painel lateral de carrinho e finalização por WhatsApp configurável.

O catálogo, a autenticação, o perfil e a criação de pedidos usam o mesmo Supabase do painel. Antes do teste integrado, execute `client/public/supabase/MIGRACAO-V10-CONTA-CLIENTE.sql` depois da migração V9.

## Onde personalizar

A identidade, contato, WhatsApp, endereço, horários, produtos e categorias são carregados do Supabase. `client/src/lib/siteConfig.ts` contém somente valores de contingência.

O arquivo `client/src/lib/catalog.ts` mantém apenas dados demonstrativos para impedir uma tela vazia durante indisponibilidade do banco.

## Estrutura principal

```text
client/src/
  components/StoreComponents.tsx  # identidade, header, footer, cards, filtros, carrinho
  lib/siteConfig.ts               # dados adaptáveis da farmácia
  lib/catalog.ts                  # categorias, produtos e banners
  pages/Home.tsx                  # página inicial
  pages/Products.tsx              # catálogo
  App.tsx                         # rotas e estado compartilhado
  index.css                       # tokens visuais e responsividade
```

As informações apresentadas são **demonstrativas** e devem ser ajustadas antes de qualquer uso comercial. O protótipo não inclui medicamentos controlados, prescrição, diagnóstico ou promessa médica.
