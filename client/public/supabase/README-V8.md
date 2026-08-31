# Natal Farma V8 — Fundação SaaS

Esta pasta substitui a antiga ideia de banco de uma única farmácia por uma base multi-tenant.

## O que já está modelado

- `pharmacies` e `pharmacy_members` para separar empresas.
- perfis e papéis `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`, `EMPLOYEE`, `CUSTOMER`.
- catálogo, categorias, imagens, clientes e endereços.
- pedidos, itens, pagamentos e histórico de status.
- estoque com reserva, baixa, liberação e histórico de movimentações.
- delivery, cupons, banners, fidelidade, configurações e auditoria.
- RLS por `pharmacy_id`.
- RPC `create_order_secure` que recalcula preço, desconto, frete e estoque no banco.
- RPC `set_order_status_secure` que confirma ou devolve estoque com trilha de movimentação.

## Como ativar

1. Crie um projeto Supabase.
2. Rode `schema-v8-saas.sql` no SQL Editor.
3. Crie o bucket de imagens de produto (opcional nesta etapa).
4. Copie `config.js`, preencha `url`, `anonKey` e `defaultPharmacyId`.
5. Troque `enabled` para `true` somente após o frontend estar conectado ao adapter da V8.

## Regra de segurança

A `anonKey` não é segredo. A segurança é feita por Auth + RLS. **Nunca use `service_role` no navegador.**

## Estado da entrega

A V8 cria a fundação de produção. O frontend legado V7 continua em modo demonstração enquanto cada módulo é migrado para chamadas assíncronas ao Supabase. Isso evita quebrar tudo de uma vez.
