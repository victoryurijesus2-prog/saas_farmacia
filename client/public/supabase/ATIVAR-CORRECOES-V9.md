# Ativar as correções V9

O site não usa Vite nem Node.js. Abra `index.html` diretamente para uma demonstração local ou publique todos os arquivos em uma hospedagem estática.

## Banco de dados

No projeto Supabase correto, abra **SQL Editor** e execute nesta ordem:

1. `schema-v8-saas.sql` apenas em uma instalação nova;
2. `MIGRACAO-V8-2-CORRECOES.sql`;
3. `MIGRACAO-V8-3-WHATSAPP.sql`;
4. `MIGRACAO-V9-SEGURANCA-CORRECOES.sql`.
5. `MIGRACAO-V10-CONTA-CLIENTE.sql`.

Faça um backup antes de aplicar migrações em uma base que já tenha pedidos reais.

## WhatsApp automático

Instale a CLI do Supabase, autentique-se e rode:

```bash
supabase functions deploy order-whatsapp
supabase secrets set META_WHATSAPP_TOKEN=SEU_TOKEN
supabase secrets set META_WHATSAPP_PHONE_NUMBER_ID=SEU_PHONE_NUMBER_ID
supabase secrets set META_WHATSAPP_STATUS_TEMPLATE=pedido_status_atualizado
supabase secrets set META_WHATSAPP_TEMPLATE_LANGUAGE=pt_BR
```

Crie na Meta o template com quatro variáveis, nesta ordem: nome do cliente, número do pedido, status e nome da farmácia.

## Reservas abandonadas

No Supabase Cron, agende a cada cinco minutos:

```sql
select public.expire_stale_order_reservations();
```

## Conferência rápida

- Faça um pedido anônimo e confirme se o comprovante aparece imediatamente.
- Cancele-o antes da confirmação e confira a devolução do estoque reservado e do cupom.
- Entregue um pedido e confira a baixa do estoque, o total do cliente e os pontos.
- Confirme um pagamento e recarregue a área administrativa para validar que a forma de pagamento permaneceu salva.
- Acesse o catálogo sem login e confira que custo e estoque interno não aparecem na resposta.
