-- purpose: seed minimum safe exercise library for sprint 3 admin backoffice
--   (seated, standing, lying, unilateral, active-pause, low-impact).
-- affected: tags (ensure intensity/equipment), exercises_library
-- notes: titles/descriptions are pt-BR (user-facing content). slugs stay english.
--   contraindication_tags = profile condition/phase slugs.
--   intensity_tags = movement effort tags (also used by tag_block_rules).
--   idempotent via fixed uuids.

insert into public.tags (slug, domain, kind, label)
values
  ('active-pause', 'habit', 'intensity', 'Pausa ativa'),
  ('low-intensity', 'movement', 'intensity', 'Intensidade baixa'),
  ('medium-intensity', 'movement', 'intensity', 'Intensidade média'),
  ('high-intensity', 'movement', 'intensity', 'Intensidade alta'),
  ('high-impact', 'movement', 'intensity', 'Alto impacto'),
  ('lower-body-plyometrics', 'movement', 'intensity', 'Pliometria inferior'),
  ('axial-load', 'movement', 'intensity', 'Carga axial'),
  ('prone-position', 'movement', 'intensity', 'Decúbito ventral'),
  ('spin', 'movement', 'intensity', 'Giro'),
  ('inversion', 'movement', 'intensity', 'Inversão'),
  ('deep-knee-flexion', 'movement', 'intensity', 'Flexão profunda de joelho'),
  ('spine-flexion-rotation', 'movement', 'intensity', 'Flexão com rotação da coluna'),
  ('high-intra-abdominal-pressure', 'movement', 'intensity', 'Alta pressão intra-abdominal'),
  ('forefoot-impact', 'movement', 'intensity', 'Impacto na ponta dos pés'),
  ('bodyweight', 'movement', 'equipment', 'Peso corporal'),
  ('wall', 'movement', 'equipment', 'Parede'),
  ('chair', 'movement', 'equipment', 'Cadeira'),
  ('bottle', 'movement', 'equipment', 'Garrafa'),
  ('towel', 'movement', 'equipment', 'Toalha'),
  ('food-bag', 'movement', 'equipment', 'Saco de alimento'),
  ('standing', 'movement', 'capability', 'Em pé'),
  ('seated', 'movement', 'capability', 'Sentado'),
  ('lying', 'movement', 'capability', 'Deitado'),
  ('unilateral', 'movement', 'capability', 'Unilateral'),
  ('low-impact', 'movement', 'capability', 'Baixo impacto'),
  ('pregnancy-trimester-1', 'cycle', 'condition', 'Gestação trimestre 1'),
  ('pregnancy-trimester-2', 'cycle', 'condition', 'Gestação trimestre 2'),
  ('pregnancy-trimester-3', 'cycle', 'condition', 'Gestação trimestre 3'),
  ('postpartum', 'cycle', 'condition', 'Pós-gestação'),
  ('diastasis-recti', 'movement', 'condition', 'Diástase abdominal'),
  ('disc-herniation', 'movement', 'condition', 'Hérnia de disco'),
  ('plantar-fasciitis', 'movement', 'condition', 'Fascite plantar'),
  ('chondromalacia', 'movement', 'condition', 'Condromalácia patelar'),
  ('torn-acl', 'movement', 'condition', 'Ruptura do LCA')
on conflict (slug) do update
set
  domain = excluded.domain,
  kind = excluded.kind,
  label = excluded.label;

insert into public.exercises_library (
  id,
  title,
  description,
  image_paths,
  video_url,
  target_muscles,
  equipment_tags,
  contraindication_tags,
  required_capability_tags,
  intensity_tags,
  is_published,
  created_by
)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'Elevação de braços sentada (pausa ativa)',
    'Sente-se com a coluna alongada. Eleve os braços até a linha dos ombros e desça com calma. Repita por cerca de um minuto, respirando sem prender o ar. Serve como pausa ativa no trabalho.',
    '{}',
    null,
    array['shoulders', 'arms'],
    array['chair', 'bodyweight'],
    '{}',
    array['seated'],
    array['active-pause', 'low-intensity'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Ponte de glúteos no solo',
    'Deite de costas com os joelhos flexionados e os pés no chão. Eleve o quadril até alinhar ombros e joelhos, depois desça com controle. Evite arquear a lombar em excesso.',
    '{}',
    null,
    array['glutes', 'core'],
    array['bodyweight'],
    '{}',
    array['lying', 'low-impact'],
    array['low-intensity'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Agachamento apoiado na cadeira',
    'Fique em pé à frente de uma cadeira estável. Desça o quadril como se fosse sentar, toque de leve o assento e suba. Mantenha os pés firmes e o peito aberto. Amplitude confortável, sem forçar o joelho.',
    '{}',
    null,
    array['legs', 'glutes'],
    array['chair', 'bodyweight'],
    array['torn-acl', 'chondromalacia'],
    array['standing', 'low-impact'],
    array['low-intensity', 'deep-knee-flexion'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    'Remada com toalha (sentada)',
    'Sente-se e segure uma toalha com as duas mãos à frente do peito. Puxe a toalha em direção ao tronco, aproximando as omoplatas, e solte com controle. Pode enfatizar um lado de cada vez.',
    '{}',
    null,
    array['back', 'arms'],
    array['towel', 'chair'],
    '{}',
    array['seated', 'unilateral', 'low-impact'],
    array['low-intensity'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    'Prancha de joelhos',
    'Apoie os antebraços e os joelhos no solo. Mantenha o tronco alinhado sem deixar o quadril cair ou subir demais. Segure por poucos segundos e descanse. Pare se houver desconforto abdominal ou lombar.',
    '{}',
    null,
    array['core'],
    array['bodyweight'],
    array['diastasis-recti'],
    array['lying', 'low-impact'],
    array['low-intensity', 'high-intra-abdominal-pressure'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    'Deslize de parede (wall sit curto)',
    'Encoste as costas na parede e desça até um ângulo confortável de joelhos. Segure por poucos segundos e suba. Evite amplitude profunda se houver desconforto no joelho.',
    '{}',
    null,
    array['legs'],
    array['wall', 'bodyweight'],
    array['chondromalacia', 'torn-acl'],
    array['standing', 'low-impact'],
    array['low-intensity', 'deep-knee-flexion'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    'Rotação de tronco sentada com garrafa',
    'Sente-se e segure uma garrafa à frente do peito. Gire o tronco com calma para um lado e para o outro, sem forçar o fim do movimento. Amplitude pequena. Útil como pausa ativa leve.',
    '{}',
    null,
    array['core'],
    array['bottle', 'chair'],
    array['disc-herniation', 'hernia'],
    array['seated', 'low-impact'],
    array['active-pause', 'low-intensity', 'spine-flexion-rotation'],
    true,
    null
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    'Elevação de panturrilha em pé',
    'Em pé, perto de um apoio se precisar. Suba na ponta dos pés e desça com controle. Movimento lento, sem salto.',
    '{}',
    null,
    array['legs'],
    array['bodyweight'],
    array['plantar-fasciitis'],
    array['standing', 'low-impact'],
    array['low-intensity', 'forefoot-impact'],
    true,
    null
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  target_muscles = excluded.target_muscles,
  equipment_tags = excluded.equipment_tags,
  contraindication_tags = excluded.contraindication_tags,
  required_capability_tags = excluded.required_capability_tags,
  intensity_tags = excluded.intensity_tags,
  is_published = excluded.is_published,
  updated_at = now();
