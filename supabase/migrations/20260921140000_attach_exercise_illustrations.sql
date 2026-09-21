-- purpose: attach drawing-style illustration paths to seeded exercises.
-- affected: exercises_library.image_paths
-- notes: PNGs live in public/exercise-illustrations/{slug}.png
--   path convention: exercises/illustrations/{slug}.png

update public.exercises_library
set image_paths = array['exercises/illustrations/bodyweight-squat.png'], updated_at = now()
where id = 'a4529e30-5fa2-461c-855a-bdc548c927c7';

update public.exercises_library
set image_paths = array['exercises/illustrations/sumo-squat.png'], updated_at = now()
where id = 'c7e2cd90-3a67-41cb-86bd-470023e6103d';

update public.exercises_library
set image_paths = array['exercises/illustrations/isometric-squat.png'], updated_at = now()
where id = '4d4700a1-e0bd-4c25-8e6e-ce498c9481d9';

update public.exercises_library
set image_paths = array['exercises/illustrations/assisted-pistol-squat.png'], updated_at = now()
where id = '99e9323c-5ed7-4414-83ab-046d27d1213a';

update public.exercises_library
set image_paths = array['exercises/illustrations/cossack-squat.png'], updated_at = now()
where id = '174207e3-e81a-4cbf-8d37-dc2b0aa6c92c';

update public.exercises_library
set image_paths = array['exercises/illustrations/shrimp-squat.png'], updated_at = now()
where id = 'df25b5ed-e826-49bc-8288-68a5cf0415c8';

update public.exercises_library
set image_paths = array['exercises/illustrations/sissy-squat.png'], updated_at = now()
where id = '04020eda-4114-46b4-8a88-580f71762fb7';

update public.exercises_library
set image_paths = array['exercises/illustrations/frog-squat.png'], updated_at = now()
where id = '10921525-e39d-4e1f-8a58-4296addd06d6';

update public.exercises_library
set image_paths = array['exercises/illustrations/pulse-squat.png'], updated_at = now()
where id = 'c3fc0ba1-6207-47d7-8ce4-9f2dc0889173';

update public.exercises_library
set image_paths = array['exercises/illustrations/jump-squat.png'], updated_at = now()
where id = '9a24c328-5450-4dd1-8a8a-646eaa59389f';

update public.exercises_library
set image_paths = array['exercises/illustrations/pop-squat.png'], updated_at = now()
where id = '24c5fbaa-9da0-40e9-8694-338e323c045a';

update public.exercises_library
set image_paths = array['exercises/illustrations/goblet-squat.png'], updated_at = now()
where id = 'be9117c6-3428-4254-8713-d4ced66de3c6';

update public.exercises_library
set image_paths = array['exercises/illustrations/backpack-squat.png'], updated_at = now()
where id = 'ea7afbeb-a559-42d7-8714-6ad30e3cc4ea';

update public.exercises_library
set image_paths = array['exercises/illustrations/unstable-squat.png'], updated_at = now()
where id = '1c1a9b68-5e23-4092-8ca2-79de0e27bc2a';

update public.exercises_library
set image_paths = array['exercises/illustrations/bulgarian-split-squat.png'], updated_at = now()
where id = '65b6e883-c0a9-4901-8833-81f3a32b242d';

update public.exercises_library
set image_paths = array['exercises/illustrations/band-squat.png'], updated_at = now()
where id = '3b1798ca-a6f6-4930-8bc4-2b547c10e7df';

update public.exercises_library
set image_paths = array['exercises/illustrations/forward-lunge.png'], updated_at = now()
where id = '2cd1c0ad-f67b-4cef-8fd0-4a9feacc0f47';

update public.exercises_library
set image_paths = array['exercises/illustrations/reverse-lunge.png'], updated_at = now()
where id = '35338f11-4e2c-4792-8f2c-c5e93520acce';

update public.exercises_library
set image_paths = array['exercises/illustrations/lateral-lunge.png'], updated_at = now()
where id = '3a8188ae-38fb-4f46-86e9-7c9cf0b60ee7';

update public.exercises_library
set image_paths = array['exercises/illustrations/pendulum-lunge.png'], updated_at = now()
where id = '614d7ec5-1d3a-4e58-84d0-27b9b52d3460';

update public.exercises_library
set image_paths = array['exercises/illustrations/pulse-lunge.png'], updated_at = now()
where id = 'b00bf0ff-7e18-4dd1-83c3-5d021e719f8c';

update public.exercises_library
set image_paths = array['exercises/illustrations/jumping-lunge.png'], updated_at = now()
where id = '9ae70a56-0ae7-4b6a-83eb-a8604a2c5c57';

update public.exercises_library
set image_paths = array['exercises/illustrations/walking-lunge.png'], updated_at = now()
where id = '34212438-c891-4f61-8d07-c5e3e2a40c88';

update public.exercises_library
set image_paths = array['exercises/illustrations/curtsy-lunge.png'], updated_at = now()
where id = '635d6a6f-c250-4e26-846c-ec536de3c9c0';

update public.exercises_library
set image_paths = array['exercises/illustrations/glute-bridge.png'], updated_at = now()
where id = '5e7c8a73-f2fd-48e4-8085-80f1d8482657';

update public.exercises_library
set image_paths = array['exercises/illustrations/single-leg-glute-bridge.png'], updated_at = now()
where id = 'b145eec6-2533-4870-8bd4-35626d2c258e';

update public.exercises_library
set image_paths = array['exercises/illustrations/feet-elevated-glute-bridge.png'], updated_at = now()
where id = '817328cc-bc72-4d84-8406-faed6a8c85d1';

update public.exercises_library
set image_paths = array['exercises/illustrations/frog-pump.png'], updated_at = now()
where id = 'eadfec12-131c-4989-8d6e-b0ed2999ce8c';

update public.exercises_library
set image_paths = array['exercises/illustrations/stiff-deadlift.png'], updated_at = now()
where id = '7dc112d3-d066-4315-8e21-ddc0597af349';

update public.exercises_library
set image_paths = array['exercises/illustrations/sliding-leg-curl.png'], updated_at = now()
where id = '18b4ddd5-f81e-4c77-84d8-7bc54e297835';

update public.exercises_library
set image_paths = array['exercises/illustrations/standing-hamstring-curl.png'], updated_at = now()
where id = '3ca074f7-8f39-4b8a-810a-f5dddfe72c3c';

update public.exercises_library
set image_paths = array['exercises/illustrations/quadruped-hip-extension.png'], updated_at = now()
where id = '43d7af7c-ae52-4e3c-807e-65c6d185465b';

update public.exercises_library
set image_paths = array['exercises/illustrations/fire-hydrant.png'], updated_at = now()
where id = '51726f8a-becd-4158-8114-ace81abe5874';

update public.exercises_library
set image_paths = array['exercises/illustrations/standing-hip-abduction.png'], updated_at = now()
where id = '8555be14-76a5-4b2d-8c35-ac47e6ab0ed0';

update public.exercises_library
set image_paths = array['exercises/illustrations/clamshell.png'], updated_at = now()
where id = '790a99ea-b649-4840-8511-5bb6daeb6e8e';

update public.exercises_library
set image_paths = array['exercises/illustrations/monster-walk.png'], updated_at = now()
where id = '955add04-8118-47b9-89ae-490646a01cc1';

update public.exercises_library
set image_paths = array['exercises/illustrations/good-morning.png'], updated_at = now()
where id = '248bf262-ddf6-46f6-82da-a87a63496f9c';

update public.exercises_library
set image_paths = array['exercises/illustrations/wall-sit.png'], updated_at = now()
where id = '06dbbcfb-d5d2-475f-84d1-1f1febd8956b';

update public.exercises_library
set image_paths = array['exercises/illustrations/duck-walk.png'], updated_at = now()
where id = '8ff75a53-d59e-4a58-83d8-f7c09ff6f36f';

update public.exercises_library
set image_paths = array['exercises/illustrations/step-up.png'], updated_at = now()
where id = 'f0192e92-75c1-42bd-8123-401cd3e19e4a';

update public.exercises_library
set image_paths = array['exercises/illustrations/standing-calf-raise.png'], updated_at = now()
where id = '4ef78f98-8784-45c4-8b0f-f2de30d566cd';

update public.exercises_library
set image_paths = array['exercises/illustrations/single-leg-calf-raise.png'], updated_at = now()
where id = '4c362df5-53d1-42a3-8cf4-ad2e8ae5c199';

update public.exercises_library
set image_paths = array['exercises/illustrations/pulse-calf-raise.png'], updated_at = now()
where id = 'ebd3d29e-49f3-413b-843c-65a6c0360e98';

update public.exercises_library
set image_paths = array['exercises/illustrations/calf-jump.png'], updated_at = now()
where id = '1e4e9256-2962-44f5-8905-6168d642aa66';

update public.exercises_library
set image_paths = array['exercises/illustrations/push-up.png'], updated_at = now()
where id = '43e3b176-1c4c-46e1-8fbe-ff4e1d0a7f12';

update public.exercises_library
set image_paths = array['exercises/illustrations/knee-push-up.png'], updated_at = now()
where id = '04b300ac-80a6-4db9-8ab8-9c8e75739654';

update public.exercises_library
set image_paths = array['exercises/illustrations/diamond-push-up.png'], updated_at = now()
where id = '22a47d33-b934-499f-8aa4-ad9762b2ac7b';

update public.exercises_library
set image_paths = array['exercises/illustrations/wide-push-up.png'], updated_at = now()
where id = 'd9c44890-7cee-4100-8a15-ecc872df8306';

update public.exercises_library
set image_paths = array['exercises/illustrations/decline-push-up.png'], updated_at = now()
where id = '3e896eee-0134-4fa4-8035-4919eba34b26';

update public.exercises_library
set image_paths = array['exercises/illustrations/incline-push-up.png'], updated_at = now()
where id = '1b1bac00-e0e2-44e8-8fd8-b590190c7002';

update public.exercises_library
set image_paths = array['exercises/illustrations/pike-push-up.png'], updated_at = now()
where id = 'c02bc932-0be4-491a-8b43-083bd1150262';

update public.exercises_library
set image_paths = array['exercises/illustrations/wall-pike-push-up.png'], updated_at = now()
where id = '0cbf40c6-aae5-4361-8f40-328c61804749';

update public.exercises_library
set image_paths = array['exercises/illustrations/uneven-push-up.png'], updated_at = now()
where id = 'b4fbe1c1-c34e-4c17-8085-49aa488d8c61';

update public.exercises_library
set image_paths = array['exercises/illustrations/archer-push-up.png'], updated_at = now()
where id = '09f276c3-98af-4290-87fa-ec68dcab9d44';

update public.exercises_library
set image_paths = array['exercises/illustrations/typewriter-push-up.png'], updated_at = now()
where id = 'd6ebb4db-6cd3-4ace-8ab7-5bd52b625566';

update public.exercises_library
set image_paths = array['exercises/illustrations/spiderman-push-up.png'], updated_at = now()
where id = '2e63dfdd-c187-4940-8b65-c1165cae8959';

update public.exercises_library
set image_paths = array['exercises/illustrations/hindu-push-up.png'], updated_at = now()
where id = '1cfe53af-be71-49c2-8551-17e5885f1929';

update public.exercises_library
set image_paths = array['exercises/illustrations/pseudo-planche-push-up.png'], updated_at = now()
where id = '549d4c00-9ec2-4511-87a0-59bc6916d410';

update public.exercises_library
set image_paths = array['exercises/illustrations/plyo-push-up.png'], updated_at = now()
where id = '8b21c1e5-dfea-417c-8f72-619eaa1fce05';

update public.exercises_library
set image_paths = array['exercises/illustrations/sphinx-push-up.png'], updated_at = now()
where id = '59a91f47-a120-45f3-8977-f071a39978cd';

update public.exercises_library
set image_paths = array['exercises/illustrations/sliding-lateral-push-up.png'], updated_at = now()
where id = '13b2c43c-cd5f-4fbe-82a6-41b8a094d285';

update public.exercises_library
set image_paths = array['exercises/illustrations/weighted-push-up.png'], updated_at = now()
where id = '8d31f4af-e0d1-46c8-8891-51f91663e611';

update public.exercises_library
set image_paths = array['exercises/illustrations/band-resisted-push-up.png'], updated_at = now()
where id = 'ebc3eb51-e8a5-49bf-8fa8-a3af975502ac';

update public.exercises_library
set image_paths = array['exercises/illustrations/floor-press.png'], updated_at = now()
where id = '6bbd511f-41b4-4ba4-867f-392ad7b9d883';

update public.exercises_library
set image_paths = array['exercises/illustrations/floor-fly.png'], updated_at = now()
where id = 'b45bb731-a0b0-4302-802e-de4881e88935';

update public.exercises_library
set image_paths = array['exercises/illustrations/bent-over-row.png'], updated_at = now()
where id = '2f902563-38a2-4d66-84f4-d07ed117b666';

update public.exercises_library
set image_paths = array['exercises/illustrations/single-arm-row.png'], updated_at = now()
where id = 'a32f1ab4-cac2-429c-88aa-4b4b94e50c99';

update public.exercises_library
set image_paths = array['exercises/illustrations/seated-row.png'], updated_at = now()
where id = '6a195661-158f-48f5-85dc-5c6fd4f0f746';

update public.exercises_library
set image_paths = array['exercises/illustrations/lat-pulldown-band.png'], updated_at = now()
where id = '84c1df51-a467-471f-804a-46bf8ee2a0cd';

update public.exercises_library
set image_paths = array['exercises/illustrations/reverse-snow-angel.png'], updated_at = now()
where id = '8b238d79-5ef6-47ca-8175-3e694a5b8632';

update public.exercises_library
set image_paths = array['exercises/illustrations/prone-back-pull.png'], updated_at = now()
where id = '3b20a252-f498-4eb9-88ef-e09d196055b4';

update public.exercises_library
set image_paths = array['exercises/illustrations/superman.png'], updated_at = now()
where id = 'f01d0b05-2a56-447c-8bf6-db674ffe96d0';

update public.exercises_library
set image_paths = array['exercises/illustrations/floor-pullover.png'], updated_at = now()
where id = '7eebc5e8-08ea-423d-84ac-9861b71319b1';

update public.exercises_library
set image_paths = array['exercises/illustrations/overhead-press.png'], updated_at = now()
where id = '1f9fbfc3-8ca6-42c4-82ce-00a3f73a166d';

update public.exercises_library
set image_paths = array['exercises/illustrations/lateral-raise.png'], updated_at = now()
where id = 'bfaa14af-eb1c-4798-812f-b60c0389e416';

update public.exercises_library
set image_paths = array['exercises/illustrations/front-raise.png'], updated_at = now()
where id = '621c4d71-ee07-4b0e-8b1e-ee6f7ef34f6d';

update public.exercises_library
set image_paths = array['exercises/illustrations/band-pull-apart.png'], updated_at = now()
where id = 'cef854b7-86a8-497c-8f0f-6ac8d92106ca';

update public.exercises_library
set image_paths = array['exercises/illustrations/floor-t-isometric.png'], updated_at = now()
where id = '553981fd-b368-41e2-8288-372d2c55f585';

update public.exercises_library
set image_paths = array['exercises/illustrations/floor-tricep-dip.png'], updated_at = now()
where id = '2fe33432-2b8d-4b4f-84f1-b464f1620ecf';

update public.exercises_library
set image_paths = array['exercises/illustrations/chair-dip.png'], updated_at = now()
where id = '4beb20eb-7602-46b0-8f7d-f5bf4fe7d35e';

update public.exercises_library
set image_paths = array['exercises/illustrations/overhead-tricep-extension.png'], updated_at = now()
where id = '7d76305b-348d-4220-8d12-2eeccec609e8';

update public.exercises_library
set image_paths = array['exercises/illustrations/tricep-kickback.png'], updated_at = now()
where id = '25d4aa1b-e1f5-4e30-88de-5e08bb5fd94c';

update public.exercises_library
set image_paths = array['exercises/illustrations/tricep-pulley-band.png'], updated_at = now()
where id = 'e7bd0351-8f56-4b9e-8cc4-5b1e3b3d54ad';

update public.exercises_library
set image_paths = array['exercises/illustrations/biceps-curl.png'], updated_at = now()
where id = '9512d49d-885d-436f-8082-e9fab95895e0';

update public.exercises_library
set image_paths = array['exercises/illustrations/hammer-curl.png'], updated_at = now()
where id = 'ab76b38f-54b7-4aa5-89a3-ab6f31d22617';

update public.exercises_library
set image_paths = array['exercises/illustrations/reverse-wrist-plank.png'], updated_at = now()
where id = '3b6c2a7b-aa88-44cb-8a0d-77854f584fb5';

update public.exercises_library
set image_paths = array['exercises/illustrations/front-plank.png'], updated_at = now()
where id = 'b49602f2-ae55-4f3d-8edd-5df7197edb73';

update public.exercises_library
set image_paths = array['exercises/illustrations/unstable-plank.png'], updated_at = now()
where id = '2f9bb67b-4a4a-4180-871b-48feca482bdd';

update public.exercises_library
set image_paths = array['exercises/illustrations/side-plank.png'], updated_at = now()
where id = '5c1894da-9411-4df2-8358-ab70e80025ad';

update public.exercises_library
set image_paths = array['exercises/illustrations/side-plank-hip-dip.png'], updated_at = now()
where id = '852db82d-6f18-4174-84ae-a61b225aaab5';

update public.exercises_library
set image_paths = array['exercises/illustrations/plank-shoulder-tap.png'], updated_at = now()
where id = '3acddcaa-2888-4e15-8fb6-7420ca8d019f';

update public.exercises_library
set image_paths = array['exercises/illustrations/commando-plank.png'], updated_at = now()
where id = 'c504a8f8-aa8d-48d8-8f49-6edd1bd9ec6e';

update public.exercises_library
set image_paths = array['exercises/illustrations/plank-jack.png'], updated_at = now()
where id = '9b47264e-b98c-4082-8617-1e671bfe00a5';

update public.exercises_library
set image_paths = array['exercises/illustrations/plank-tuck-jump.png'], updated_at = now()
where id = '2a45eba2-8788-478e-8bb3-5971fb3c8877';

update public.exercises_library
set image_paths = array['exercises/illustrations/reverse-plank.png'], updated_at = now()
where id = '475045c7-965f-4f7d-8bd2-6ae14ff60ad8';

update public.exercises_library
set image_paths = array['exercises/illustrations/plank-row.png'], updated_at = now()
where id = '0b034b83-cefe-4fe3-8758-5ee7fde7e41d';

update public.exercises_library
set image_paths = array['exercises/illustrations/crunch.png'], updated_at = now()
where id = 'eaeb4484-396c-41ab-8206-1d5ba6b720f4';

update public.exercises_library
set image_paths = array['exercises/illustrations/weighted-crunch.png'], updated_at = now()
where id = '3b00282c-bef9-4820-87b4-89bcf781930b';

update public.exercises_library
set image_paths = array['exercises/illustrations/sit-up.png'], updated_at = now()
where id = '19365006-11af-441f-8061-8aa7bb913caf';

update public.exercises_library
set image_paths = array['exercises/illustrations/leg-raise.png'], updated_at = now()
where id = '42f57da7-e61a-4d8a-804a-2c6d4d73da92';

update public.exercises_library
set image_paths = array['exercises/illustrations/bicycle-crunch.png'], updated_at = now()
where id = '2a31cdbe-d5c5-440c-8e37-a7125caf00ce';

update public.exercises_library
set image_paths = array['exercises/illustrations/v-up.png'], updated_at = now()
where id = '7ddbbfd5-51c8-49f9-83e7-9ff17d3dacce';

update public.exercises_library
set image_paths = array['exercises/illustrations/single-leg-v-up-load.png'], updated_at = now()
where id = '29f4fc71-cec9-4617-8a1e-37cefeffacd1';

update public.exercises_library
set image_paths = array['exercises/illustrations/butterfly-crunch.png'], updated_at = now()
where id = '3d53c9ed-ab56-438c-8c1c-99fff818be61';

update public.exercises_library
set image_paths = array['exercises/illustrations/tuck-crunch.png'], updated_at = now()
where id = 'd21934be-e4b7-4977-8289-482bf1500afb';

update public.exercises_library
set image_paths = array['exercises/illustrations/rope-crunch.png'], updated_at = now()
where id = '5503bb24-87bc-4642-8d3c-41fef523cab7';

update public.exercises_library
set image_paths = array['exercises/illustrations/band-crunch.png'], updated_at = now()
where id = '98976610-fc69-4565-8915-41c858450ef8';

update public.exercises_library
set image_paths = array['exercises/illustrations/sliding-pike.png'], updated_at = now()
where id = 'b6993d3e-9b4c-4ffe-870e-0225bfc93451';

update public.exercises_library
set image_paths = array['exercises/illustrations/heel-touch.png'], updated_at = now()
where id = 'fd066298-4e12-401b-8a91-2103b60bcdef';

update public.exercises_library
set image_paths = array['exercises/illustrations/russian-twist.png'], updated_at = now()
where id = '73a40a70-dd29-490e-89a3-145586a8f153';

update public.exercises_library
set image_paths = array['exercises/illustrations/bird-dog.png'], updated_at = now()
where id = '96e2c21e-82d3-43e7-8b3c-4395fde90dfc';

update public.exercises_library
set image_paths = array['exercises/illustrations/hollow-body-hold.png'], updated_at = now()
where id = '23873d65-62d8-4d71-8c96-214f280e59e8';

update public.exercises_library
set image_paths = array['exercises/illustrations/hollow-body-rock.png'], updated_at = now()
where id = '8d3534d6-828b-4352-8c5b-81fd73ce1dd4';

update public.exercises_library
set image_paths = array['exercises/illustrations/dead-bug.png'], updated_at = now()
where id = 'bc2234d8-d9ad-457e-8f50-345a12bb59cf';

update public.exercises_library
set image_paths = array['exercises/illustrations/scissors.png'], updated_at = now()
where id = 'c4ff7454-d2bf-43ff-856a-055f0480799c';

update public.exercises_library
set image_paths = array['exercises/illustrations/flutter-kicks.png'], updated_at = now()
where id = '6f4abaf1-884a-4dec-8567-a882eeaf0365';

update public.exercises_library
set image_paths = array['exercises/illustrations/windshield-wipers.png'], updated_at = now()
where id = 'fec7aaa4-94f7-477e-82ec-c42c81866bb4';

update public.exercises_library
set image_paths = array['exercises/illustrations/l-sit-floor.png'], updated_at = now()
where id = '513b6fe5-4087-4f87-8b86-29be4ed9b0b8';

update public.exercises_library
set image_paths = array['exercises/illustrations/woodchop.png'], updated_at = now()
where id = 'b65619c3-341e-4556-85af-df7ac2260af9';

update public.exercises_library
set image_paths = array['exercises/illustrations/pallof-press.png'], updated_at = now()
where id = 'b47fe78f-49d0-44b2-8305-ded38adae046';

update public.exercises_library
set image_paths = array['exercises/illustrations/jumping-jack.png'], updated_at = now()
where id = '780cdfb2-513d-4bd0-83b8-2bff0f31e07f';

update public.exercises_library
set image_paths = array['exercises/illustrations/burpee.png'], updated_at = now()
where id = '9c71cdef-72aa-44c2-88f1-6494e3388a42';

update public.exercises_library
set image_paths = array['exercises/illustrations/sprawl.png'], updated_at = now()
where id = 'db8015bb-1ddd-454d-8691-5a1874b757d0';

update public.exercises_library
set image_paths = array['exercises/illustrations/mountain-climber.png'], updated_at = now()
where id = '98fc73d9-935c-4cd6-8c55-e33392dd808c';

update public.exercises_library
set image_paths = array['exercises/illustrations/cross-mountain-climber.png'], updated_at = now()
where id = 'ea6bc101-0c0f-454c-818a-f8b5dca81b76';

update public.exercises_library
set image_paths = array['exercises/illustrations/sliding-mountain-climber.png'], updated_at = now()
where id = 'eccbcca3-5847-403c-8010-315ad8d17320';

update public.exercises_library
set image_paths = array['exercises/illustrations/high-knees.png'], updated_at = now()
where id = '36a59d98-2536-4d9c-83f1-12dd6688e752';

update public.exercises_library
set image_paths = array['exercises/illustrations/butt-kicks.png'], updated_at = now()
where id = '74d35fdb-ca65-4d13-8b26-19af8331fb47';

update public.exercises_library
set image_paths = array['exercises/illustrations/skater-jump.png'], updated_at = now()
where id = '8857383d-04c5-449b-81ec-e1534aabe201';

update public.exercises_library
set image_paths = array['exercises/illustrations/star-jump.png'], updated_at = now()
where id = 'b6d4cf96-39e4-4061-86bf-3b3ff1a82f48';

update public.exercises_library
set image_paths = array['exercises/illustrations/broad-jump.png'], updated_at = now()
where id = '4898e041-3321-42f1-84d8-22abf6fb50b2';

update public.exercises_library
set image_paths = array['exercises/illustrations/tuck-jump.png'], updated_at = now()
where id = 'dc1ba2de-7ab6-47d6-8f9b-c000af4b8dbc';

update public.exercises_library
set image_paths = array['exercises/illustrations/inchworm.png'], updated_at = now()
where id = '0adcb8ff-1b40-473a-8850-e93376694927';

update public.exercises_library
set image_paths = array['exercises/illustrations/bear-crawl.png'], updated_at = now()
where id = '866d6867-839f-494b-8fe2-02cd49308ad7';

update public.exercises_library
set image_paths = array['exercises/illustrations/crab-walk.png'], updated_at = now()
where id = '052bc64e-f484-44c0-8985-dae34df8b942';

update public.exercises_library
set image_paths = array['exercises/illustrations/crab-reach.png'], updated_at = now()
where id = 'ed4dd230-b3e0-4421-8631-30dad340f3cf';

update public.exercises_library
set image_paths = array['exercises/illustrations/scorpion-reach.png'], updated_at = now()
where id = '407dc114-6a52-40ca-8c42-49a13def5af8';

update public.exercises_library
set image_paths = array['exercises/illustrations/shoulder-dislocate-broom.png'], updated_at = now()
where id = 'e7a37ed1-3b62-482b-8bc1-579a7b98b6f2';

update public.exercises_library
set image_paths = array['exercises/illustrations/seated-arm-raise-pause.png'], updated_at = now()
where id = '955dfadf-6f1c-4332-826e-e81c83973b67';

update public.exercises_library
set image_paths = array['exercises/illustrations/seated-towel-row.png'], updated_at = now()
where id = '5cb286fa-bbb3-47d5-8653-a4f79bcec509';

update public.exercises_library
set image_paths = array['exercises/illustrations/seated-bottle-rotation.png'], updated_at = now()
where id = 'b06fa5f0-4863-4539-8f2a-45cf240ca01a';

update public.exercises_library
set image_paths = array['exercises/illustrations/chair-supported-squat.png'], updated_at = now()
where id = 'e80774b4-c526-4af2-8e53-d9e3102a1c32';

update public.exercises_library
set image_paths = array['exercises/illustrations/knee-plank.png'], updated_at = now()
where id = 'b57e7cef-6995-48ee-8fd3-38eefe967fb7';

update public.exercises_library
set image_paths = array['exercises/illustrations/seated-shoulder-press-bottle.png'], updated_at = now()
where id = '92d42749-bf9a-4066-8726-9f428e9f69d2';

update public.exercises_library
set image_paths = array['exercises/illustrations/wall-angel-pause.png'], updated_at = now()
where id = 'a0c0aec6-e80e-4df4-8bdb-9f982f9b4b43';

update public.exercises_library
set image_paths = array['exercises/illustrations/seated-march.png'], updated_at = now()
where id = 'b3eca6ef-68a4-4a54-8b39-cc095b7a48b7';

