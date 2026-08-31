# Próxima implementação — gateway de pagamento

Fluxo de produção:

1. frontend cria o pedido no banco;
2. Edge Function cria cobrança Pix/cartão no gateway;
3. gateway devolve QR Code/token seguro;
4. cliente paga;
5. webhook autenticado chega à Edge Function;
6. Edge Function valida assinatura/idempotência/valor/pedido;
7. backend atualiza `payments.payment_status` e `orders.payment_status`;
8. backend chama a transição de pedido/estoque adequada;
9. webhook duplicado não pode baixar estoque duas vezes.

As credenciais secretas do gateway ficam em Secrets da Edge Function, nunca em `config.js` e nunca no frontend.
