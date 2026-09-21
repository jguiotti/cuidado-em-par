# Sprint 8 — Revisão UX (`/revisao-ux`)

**Data:** 2026-09-21  
**Parecer:** **aprovado** para Círculo (dupla/grupo), com nitidez opcional.  
**Telas:** `/circle` (empty + active), copy `circle-pt-br.ts`; regressão leve Hoje/Conta.

---

## Checklist visual

- [x] Tokens menta / blush; Surfaces sem borda dura `1px solid`
- [x] Empty: privacidade → criar dupla → criar grupo → entrar com código (uma decisão por bloco)
- [x] Active: tipo (Dupla/Grupo), contagem “n de max”, código só se ainda cabe convite
- [x] Feed sem ranking, sem badge clínico
- [x] Lista de membros com scroll (`max-h`) para grupos maiores
- [x] Confirmação de saída sem culpa

## Checklist linguagem

- [x] Zero emoji
- [x] Neutro: “pessoas”, “cuidado do dia”, sem culpa se alguém não registrou
- [x] Erros: `group_full`, `pair_full`, `already_in_circle`, `invalid_invite` claros
- [x] Sem “competir”, “último colocado”, comparação corporal

## Checklist acessibilidade

- [x] Labels em TextField; botões com texto
- [x] Estados de erro via `InlineAlert`
- [x] Toque full-width nos CTAs principais
- [ ] Nitidez: foco visível teclado em todos os controles (padrão do design system — não regrediu)

---

## Achados

| Tela | Gravidade | Achado | Ação |
|---|---|---|---|
| Empty | nitidez | Três Surfaces (dupla/grupo/entrar) alongam a página | Aceitável no MVP; não unificar em um formulário denso |
| Active waiting | ajusta | Mensagem “aguardando” só com menos de 2 membros; em grupo de 1 pessoa ok | Mantido |
| Active full | — | Código some quando `members.length >= memberLimit` | Correto |

---

## Aprovado

Fluxo Círculo pair/group alinhado ao Santuário Digital e ao UX Writer. Sem bloqueio de lançamento.
