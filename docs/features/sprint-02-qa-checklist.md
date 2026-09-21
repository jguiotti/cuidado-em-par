# Sprint 2 — QA smoke checklist

After applying migration `20260921034500_sprint2_onboarding_sex_sleep_stage.sql` and restarting `npm run dev`.

- [ ] Sprint 1 completo redireciona para `/onboarding/sex-assigned`
- [ ] Sexo atribuído pode ser pulado sem escolha
- [ ] Escolher sexo grava valor em inglês e segue para clinical
- [ ] Condições + nenhuma funcionam; nada vai para perfil público
- [ ] Mobilidade cadeira → capabilities sem `standing`
- [ ] Nutrição vegano + avoids gluten grava corretamente
- [ ] Ciclo “Não agora” não cria `user_cycle_profiles`
- [ ] Ciclo gestação sem trimestre bloqueia
- [ ] Ciclo ativo com consent cria profile + log `cycle_module`
- [ ] `male` + ciclo menstrual permitido
- [ ] Hábitos concluem com `onboarding_completed_at` e stage `completed`
- [ ] `/home` com onboarding completo não redireciona ao wizard
- [ ] Copy: sem “gênero biológico”, sem “perda de peso”, zero emoji
