-- purpose: seed accessible meal library for Sprint 4 (Nutricionista).
-- affected: meals_library
-- notes: fixed uuids; titles/descriptions pt-BR; tags EN; low-cost preferred.
--   contains_tags describe what is on the plate, not the person's allergy.

insert into public.meals_library (
  id,
  title,
  description,
  ingredients,
  image_paths,
  meal_slot,
  contains_tags,
  diet_compatible_tags,
  phase_tags,
  is_published,
  created_by
)
values
  (
    'b1000000-0000-4000-8000-000000000001',
    'Mingau de aveia e banana',
    'Aqueça a aveia com água até engrossar. Amasse a banana e misture. Adoce só se quiser. Use aveia comum: este prato contém glúten.',
    '[{"item":"aveia em flocos","qty":"4 colheres de sopa","alt":"banana amassada pura, sem aveia"},{"item":"banana","qty":"1 unidade"},{"item":"água","qty":"200 ml"}]'::jsonb,
    '{}',
    'breakfast',
    array['gluten'],
    array['vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'Omelete de legumes',
    'Bata os ovos. Refogue cebola e tomate em pouco óleo. Junte os ovos e cozinhe em fogo baixo até firmar.',
    '[{"item":"ovos","qty":"2 unidades"},{"item":"tomate","qty":"1 pequeno"},{"item":"cebola","qty":"1/4 unidade"},{"item":"óleo","qty":"1 colher de chá"}]'::jsonb,
    '{}',
    'breakfast',
    array['egg'],
    array['vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'Vitamina de banana e leite',
    'Bata banana com leite até ficar homogêneo. Sem açúcar se preferir. Contém lactose.',
    '[{"item":"banana","qty":"1 unidade"},{"item":"leite","qty":"200 ml","alt":"bebida vegetal sem lactose"}]'::jsonb,
    '{}',
    'breakfast',
    array['lactose'],
    array['vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'Arroz, feijão e salada',
    'Sirva arroz e feijão já cozidos com salada crua de alface e tomate. Tempero simples: limão e sal.',
    '[{"item":"arroz cozido","qty":"4 colheres de sopa"},{"item":"feijão cozido","qty":"1 concha"},{"item":"alface","qty":"a gosto"},{"item":"tomate","qty":"1/2 unidade"}]'::jsonb,
    '{}',
    'lunch',
    '{}',
    array['vegan', 'vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    'Ovos mexidos com batata-doce',
    'Cozinhe ou asse a batata-doce. Mexa os ovos em fogo baixo até cremosos. Sirva juntos.',
    '[{"item":"ovos","qty":"2 unidades"},{"item":"batata-doce","qty":"1 média"},{"item":"óleo","qty":"1 colher de chá"}]'::jsonb,
    '{}',
    'lunch',
    array['egg'],
    array['vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'Wrap de grão-de-bico no milho',
    'Amasse o grão-de-bico com temperos. Recheie a tortilha de milho com o paste e folhas. Sem trigo: não marca glúten.',
    '[{"item":"grão-de-bico cozido","qty":"1 xícara"},{"item":"tortilha de milho","qty":"1 unidade"},{"item":"alface","qty":"a gosto"},{"item":"limão","qty":"algumas gotas"}]'::jsonb,
    '{}',
    'lunch',
    '{}',
    array['vegan', 'vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    'Pasta de grão-de-bico no pão',
    'Amasse grão-de-bico com alho e limão. Passe no pão. O pão de trigo contém glúten.',
    '[{"item":"grão-de-bico cozido","qty":"1/2 xícara"},{"item":"pão de trigo","qty":"2 fatias","alt":"pão de milho sem glúten"},{"item":"limão","qty":"a gosto"}]'::jsonb,
    '{}',
    'snack',
    array['gluten'],
    array['vegan', 'vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000008',
    'Iogurte natural com fruta',
    'Sirva iogurte natural com fruta picada. Contém lactose.',
    '[{"item":"iogurte natural","qty":"1 pote pequeno","alt":"iogurte vegetal"},{"item":"fruta da estação","qty":"1 unidade"}]'::jsonb,
    '{}',
    'snack',
    array['lactose'],
    array['vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-000000000009',
    'Sopa de legumes',
    'Cozinhe batata, cenoura e abóbora em água até amolecer. Amasse um pouco para engrossar. Tempere com sal.',
    '[{"item":"batata","qty":"1 média"},{"item":"cenoura","qty":"1 unidade"},{"item":"abóbora","qty":"1 xícara"},{"item":"água","qty":"o suficiente"}]'::jsonb,
    '{}',
    'dinner',
    '{}',
    array['vegan', 'vegetarian', 'low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-00000000000a',
    'Peixe assado com legumes',
    'Tempere o peixe com limão e sal. Asse com legumes até cozinhar. Contém peixe.',
    '[{"item":"filé de peixe","qty":"1 porção"},{"item":"legumes da estação","qty":"2 xícaras"},{"item":"limão","qty":"a gosto"}]'::jsonb,
    '{}',
    'dinner',
    array['fish'],
    array['low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-00000000000b',
    'Frango desfiado com arroz',
    'Cozinhe o frango, desfie e sirva com arroz. Contém carne.',
    '[{"item":"frango cozido desfiado","qty":"1 xícara"},{"item":"arroz cozido","qty":"4 colheres de sopa"},{"item":"sal","qty":"a gosto"}]'::jsonb,
    '{}',
    'dinner',
    array['meat'],
    array['low-cost'],
    '{}',
    true,
    null
  ),
  (
    'b1000000-0000-4000-8000-00000000000c',
    'Salada de grãos frios',
    'Misture feijão ou grão-de-bico cozido com tomate, cebola e limão. Sirva frio.',
    '[{"item":"feijão ou grão-de-bico cozido","qty":"1 xícara"},{"item":"tomate","qty":"1 unidade"},{"item":"cebola","qty":"1/4 unidade"},{"item":"limão","qty":"a gosto"}]'::jsonb,
    '{}',
    'dinner',
    '{}',
    array['vegan', 'vegetarian', 'low-cost'],
    '{}',
    true,
    null
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  ingredients = excluded.ingredients,
  meal_slot = excluded.meal_slot,
  contains_tags = excluded.contains_tags,
  diet_compatible_tags = excluded.diet_compatible_tags,
  phase_tags = excluded.phase_tags,
  is_published = excluded.is_published,
  updated_at = now();
