# Ativação do Supabase — V8

A integração de frontend já foi preparada. Enquanto `enabled: false`, o sistema continua abrindo no modo local para não quebrar a demo.

## Assim que o projeto Supabase estiver criado

1. Abra **SQL Editor** e execute `schema-v8-saas.sql` inteiro.
2. Em **Authentication > Users**, crie seu usuário administrador.
3. Edite e execute `BOOTSTRAP-PRIMEIRA-FARMACIA.sql` para criar a primeira farmácia e vincular esse usuário como `OWNER`.
4. Rode o roteiro `TESTES-RLS.md` antes de inserir dados reais.
5. O schema já cria o bucket `pharmacy-images` e as policies de leitura/upload por tenant.
6. Copie **Project URL** e a chave pública **anon/publishable** para `config.js`.
7. Só então mude `enabled` para `true`.

## O que nunca vai no frontend

- `service_role`
- access token/secret do Mercado Pago
- webhook secret
- senha de banco
- chave privada de Resend/SendGrid

Esses segredos devem ficar em Supabase Edge Function Secrets/variáveis do ambiente de produção.

## Arquitetura preparada

`store-v8.js` funciona como adaptador entre a interface atual e `client-v8.js`. Em modo Supabase, o carrinho é o único estado de compra que permanece local. Catálogo, pedidos, estoque, clientes, cupons, regiões, banners e configurações são carregados do banco.

A loja pública resolve o tenant pelo `defaultPharmacySlug`. Isso evita colocar UUID fixo da farmácia em cada página e prepara o projeto para onboarding SaaS futuro.

## Importante

Não considere a migração validada apenas porque a página abriu. A validação real só termina após testar com as credenciais reais: cadastro/login, leitura de catálogo, criação de pedido, reserva/baixa de estoque, acesso do funcionário/admin e isolamento entre duas farmácias.
