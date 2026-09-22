const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const src =
  "C:/Users/janai/.cursor/projects/c-Users-janai-cuidado-em-par/assets/c__Users_janai_AppData_Roaming_Cursor_User_workspaceStorage_c3babb5d807a3af1e021912519aa2fd8_images_icone_cuidado_em_par-69452549-d3ef-4469-aebe-8c20b7089517.png";
const root = "C:/Users/janai/cuidado-em-par";

async function main() {
  const meta = await sharp(src).metadata();
  console.log("source", meta.width, meta.height, meta.format);

  const targets = [
    { rel: "app/icon.png", size: 512 },
    { rel: "app/apple-icon.png", size: 180 },
    { rel: "public/brand/mark.png", size: 512 },
    { rel: "public/icons/icon.png", size: 512 },
  ];

  for (const { rel, size } of targets) {
    await sharp(src)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png()
      .toFile(path.join(root, rel));
    console.log("wrote", rel, size);
  }

  const inset = 102;
  const inner = 512 - inset * 2;
  const innerBuf = await sharp(src)
    .resize(inner, inner, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([{ input: innerBuf, left: inset, top: inset }])
    .png()
    .toFile(path.join(root, "public/icons/icon-maskable.png"));
  console.log("wrote public/icons/icon-maskable.png");

  // Point SVGs at PNGs (avoid embedding huge base64 blobs in git).
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Cuidado em Par">',
    '  <image href="/icons/icon.png" width="512" height="512" />',
    "</svg>",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(root, "public/icons/icon.svg"), svg);

  const svgMask = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="">',
    '  <image href="/icons/icon-maskable.png" width="512" height="512" />',
    "</svg>",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(root, "public/icons/icon-maskable.svg"), svgMask);
  console.log("wrote svgs");

  try {
    const pngToIco = require("png-to-ico").default || require("png-to-ico");
    const os = require("os");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cep-ico-"));
    const icoSources = [];
    for (const size of [16, 32, 48]) {
      const file = path.join(dir, `${size}.png`);
      await sharp(src)
        .resize(size, size, { fit: "cover", position: "centre" })
        .png()
        .toFile(file);
      icoSources.push(file);
    }
    const ico = await pngToIco(icoSources);
    fs.writeFileSync(path.join(root, "app/favicon.ico"), ico);
    fs.writeFileSync(path.join(root, "public/favicon.ico"), ico);
    console.log("wrote favicon.ico", ico.length);
  } catch (error) {
    console.warn(
      "favicon.ico skipped (install png-to-ico to generate):",
      error.message,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
