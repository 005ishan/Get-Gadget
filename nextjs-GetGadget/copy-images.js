const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public", "images");

const dirs = [
  { src: path.join(__dirname, "..", "accessories_images", "gadget_accessories"), dest: path.join(publicDir, "accessories") },
  { src: path.join(__dirname, "..", "accessories_images", "charging"), dest: path.join(publicDir, "charging") },
];

for (const { src, dest } of dirs) {
  if (!fs.existsSync(src)) {
    console.log(`Source not found: ${src}`);
    continue;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied: ${file}`);
    }
  }
}

console.log("Done! Images copied to public/images/");
