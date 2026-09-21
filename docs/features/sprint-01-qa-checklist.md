# Sprint 1 — QA smoke checklist

Manual checks after `npm run dev` with a synthetic account.

- [ ] Sem login, `/onboarding/consent` redireciona para `/login`
- [ ] Aceitar só um checkbox bloqueia avanço com mensagem clara
- [ ] Aceitar os dois grava eventos `terms` e `health_personalization` em `lgpd_consent_logs`
- [ ] Identity exige apelido com pelo menos 2 caracteres
- [ ] “Prefiro não informar” deixa `gender_identity` nulo
- [ ] Focus exige um dos quatro focos
- [ ] Peso sem autorização de biometria não salva
- [ ] Peso com autorização cria `user_biometrics` só para a pessoa dona
- [ ] `/home` com Sprint 1 incompleto redireciona ao passo certo
- [ ] Após focus, chega em `/onboarding/clinical` (placeholder Sprint 2)
- [ ] Zero emoji e sem pronomes binários nas strings do fluxo
- [ ] Controles usáveis por teclado; checkboxes e radios com rótulo
