import fs from "fs";
import path from "path";

// Script for building image base64 json map.

console.log("generating base 64 json map");

const outputFilename = "role-logos";
const imgDirPath = `${process.cwd()}/src/ui/assets/role-logos/`;
const imgFilePaths = fs.readdirSync(imgDirPath);

const base64Map: Record<string, { base64: string }> = {};

for (const imgFilePath of imgFilePaths) {
  const key = imgFilePath.split(".")[0].toUpperCase();
  const ext = path.extname(imgFilePath).split(".")[1];
  const base64 = fs.readFileSync(`${imgDirPath}/${imgFilePath}`, {
    encoding: "base64",
  });

  console.log("adding img base64", {
    imgFilePath,
    base64: base64.substring(0, 5),
  });
  base64Map[key] = { base64: `data:image/${ext};base64,${base64}` };
}

fs.writeFileSync(
  `${process.cwd()}/src/ui/assets/${outputFilename}.json`,
  JSON.stringify(base64Map)
);

console.log("base64 json map generation complete", {
  files: imgFilePaths.length,
});
