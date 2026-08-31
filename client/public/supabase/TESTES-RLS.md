# Testes obrigatórios de RLS — V8

Antes de colocar uma farmácia real, crie duas empresas de teste (`Farmácia A` e `Farmácia B`) e usuários separados.

## Deve funcionar

- OWNER A lê/edita produtos, pedidos, clientes, estoque e configurações da Farmácia A.
- EMPLOYEE A lê pedidos/clientes/estoque da Farmácia A e opera apenas o que a política permitir.
- CUSTOMER A enxerga somente os próprios pedidos/endereço/fidelidade.
- catálogo ativo e dados públicos permitidos continuam visíveis para compra.

## Deve falhar

- usuário da Farmácia A consultando produtos privados/pedidos/clientes da Farmácia B.
- funcionário tentando alterar membros/proprietário/configuração crítica.
- cliente tentando ler pedido de outro cliente.
- cliente alterando `pharmacy_id` no DevTools.
- cliente alterando preço, desconto, frete, status de pagamento ou estoque no navegador.
- chamada direta de update em estoque sem permissão.

## Checkout

O frontend envia apenas identificadores e quantidades. A RPC `create_order_secure` consulta o preço real, estoque, cupom e frete no banco. Portanto um preço adulterado no navegador não participa do cálculo final.

## Pagamento

A V8 ainda não marca pagamento real como aprovado. Essa confirmação deve entrar via gateway + webhook server-side/Edge Function. O frontend jamais deve promover `payment_status` para `APPROVED` por conta própria.
