# Direção visual — Farma+

## Especificação de referência

Este projeto reproduz as duas imagens fornecidas pelo usuário: **página inicial** e **página de produtos** da referência visual Farma+. Elas são a fonte de verdade para proporções, organização, cabeçalho, navegação, banners, cards, filtros, benefícios, atendimento e rodapé. A fidelidade visual tem prioridade sobre interpretações estilísticas alternativas.

## Design Movement

**E-commerce editorial de saúde contemporâneo**, combinando clareza de varejo especializado com a confiança visual de uma rede farmacêutica moderna. O design deve parecer produzido por uma agência de e-commerce: funcional, limpo, preciso e acolhedor.

## Core Principles

1. **Confiança primeiro:** branco, vermelho de ação e grafite formam uma interface legível, séria e acolhedora.
2. **Hierarquia comercial clara:** preço, desconto, disponibilidade e ação de compra devem ser escaneáveis em poucos segundos.
3. **Precisão de catálogo:** cards alinhados, imagens de produtos preservadas, espaçamento consistente e filtros compreensíveis.
4. **Proximidade humana:** fotografias de farmacêuticas, atendimento no WhatsApp e benefícios de loja conectam o digital ao cuidado.

## Color Philosophy

O vermelho da referência é a cor proprietária da ação e da energia comercial: aparece em CTAs, selos, preços promocionais e blocos de campanha. Branco e cinza muito claro mantêm o catálogo respirando, enquanto grafite dá contraste editorial e estabilidade. O vermelho deve ser usado com parcimônia para guiar decisões, não para colorir todas as superfícies. **Não usar laranja, roxo ou gradientes chamativos.**

## Layout Paradigm

Estrutura editorial em faixas de largura controlada, com cabeçalho em três níveis, hero assimétrico, módulos de rolagem horizontal e grades comerciais rigorosamente alinhadas. A home alterna áreas de descoberta e conversão; a página de produtos prioriza sidebar + catálogo em desktop e reorganiza filtros, busca e carrosséis em fluxo vertical no mobile.

## Signature Elements

- Faixas vermelhas de campanha com cantos discretos e produtos ou fotografia integrados.
- Selo de desconto vermelho pequeno e botão quadrado vermelho com ícone de carrinho nos cards.
- Miniaturas circulares ou suavemente recortadas para categorias, com rolagem horizontal em telas menores.

## Interaction Philosophy

Interações devem transmitir segurança e resposta imediata: hover revela elevação suave e borda mais definida; botões confirmam o clique com microescala; favoritos alternam estado sem interromper a navegação; o carrinho abre como painel lateral sem perder o contexto. Filtros e ordenação atualizam o catálogo de forma compreensível e exibem chips removíveis.

## Animation

Usar entradas curtas e discretas, com opacidade e pequenos deslocamentos, sempre abaixo de 300 ms. Carrosséis devem mover-se suavemente sem autoplay agressivo; drawers e carrinho entram pela lateral com easing de saída. Respeitar `prefers-reduced-motion` e nunca animar dimensões de layout quando uma transição de transform ou opacity resolver.

## Typography System

Usar **Manrope** para o corpo, navegação e dados de catálogo, e **Plus Jakarta Sans** em títulos e chamadas para uma presença editorial ligeiramente mais expressiva. Títulos principais devem ser fortes e compactos; labels e metadados menores devem manter contraste e espaçamento entre letras. Evitar Inter e tipografia decorativa que prejudique a leitura.

## Brand Essence

**Farma+ conecta cuidado, conveniência e compra segura em uma experiência digital clara para farmácias que querem estar mais perto das pessoas.** Personalidade: **confiável, humana, objetiva**.

## Brand Voice

Headlines e CTAs devem ser diretos, acolhedores e úteis, sem promessas médicas ou exageros. Microcopy deve reduzir dúvida e orientar a próxima ação.

> “Sua saúde, do seu jeito.”
>
> “Precisa de ajuda para comprar? Fale com a farmácia.”

## Wordmark & Logo

O logotipo deve combinar um símbolo de cruz farmacêutica vermelha com o wordmark “Farma+” em grafite, mantendo a proporção horizontal compacta da referência. O símbolo será tratado como marca gráfica própria e usado com destaque no cabeçalho e como favicon; o texto do wordmark será renderizado de forma controlada na interface para garantir legibilidade.

## Signature Brand Color

**Farma Red — `#e30613`**, vermelho de ação e reconhecimento usado com branco e grafite.

## Arquitetura de conteúdo

- `client/src/lib/siteConfig.ts`: identidade adaptável, contato, WhatsApp, horários, endereço, redes e textos institucionais.
- `client/src/lib/catalog.ts`: categorias, marcas, banners e produtos locais do protótipo.
- `client/src/components/`: cabeçalho, rodapé, benefícios, cards, carrinho, filtros e carrosséis reutilizáveis.
- `client/src/pages/Home.tsx`: página inicial.
- `client/src/pages/Products.tsx`: catálogo com filtros, busca, ordenação, visualização e paginação.

## Style Decisions

- A referência visual é soberana; não introduzir seções extras ou padrões de template genéricos.
- Fotografia e produto devem ter fundo claro, proporções preservadas e `alt` descritivo.
- Não incluir depoimentos ou reviews inventados; eventuais números de avaliação em cards são marcados como demonstrativos do protótipo.
- Todo conteúdo visível deve permanecer em português do Brasil.
