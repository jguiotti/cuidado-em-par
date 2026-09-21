# Sprint 3 — QA checklist (backoffice de exercícios)

**Status: aprovado** — manuais validados pela pessoa responsável; smoke automatizado `scripts/sprint03-qa-smoke.ts` + checagens de seed/ilustrações OK (2026-09-21).

Após aplicar as migrations de seed/ilustrações e promover um usuário a admin:

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'admin')
on conflict (user_id) do update set role = 'admin';
```

## Gate e RLS
- [x] Member acessa `/admin` e cai em `/home`
- [x] Admin acessa `/admin` e `/admin/exercises`
- [x] Actions com sessão member retornam `forbidden`

## CRUD
- [x] Criar rascunho sem publicar
- [x] Editar título/descrição/tags e salvar
- [x] Publicar sem capacidades → bloqueado (`publish_needs_capabilities`)
- [x] Publicar com `high-impact` sem contraindicação → bloqueado
- [x] Publicar com `seated` + tags válidas → ok
- [x] Despublicar → some da leitura publicada
- [x] Upload de imagem PNG/JPEG/WebP grava path em `image_paths`

## Seed
- [x] Existe exercício com `active-pause` em `intensity_tags`
- [x] Existe exercício só `seated` (sem `standing` em required)
- [x] Existe exercício `standing` e outro `lying`

## Motor (smoke)
- [x] `select * from list_safe_exercises()` com perfil `torn-acl` não retorna itens com `high-impact` / plyometrics / contraindicação LCA
- [x] Perfil só `seated` não recebe exercícios que exigem `standing`

## Copy / LGPD
- [x] Zero emoji; sem “emagreça/shape/treino masculino”
- [x] Nenhuma tela admin consulta clínica/ciclo/biometria de quem usa o app

## Ilustrações (extra)
- [x] 146 PNGs em `public/exercise-illustrations/{slug}.png`
- [x] Migration `20260921140000_attach_exercise_illustrations.sql` liga `image_paths`

## Regressão rápida de tags

```bash
npx tsx scripts/sprint03-qa-smoke.ts
```

Resultado registrado: PASS em publish sem capacidades, high-impact sem contraindicação, seated+high-impact com contraindicação, título inválido.
