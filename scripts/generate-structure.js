import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || ".";   // default: current folder
const OUTPUT = "STRUCTURE.md";

const IGNORE = new Set([
  "node_modules",
  ".git",
  ".expo",
  "dist",
  "build",
  "android",
  "ios"
]);

function walk(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries
    .filter(e => !IGNORE.has(e.name))
    .map((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return (
          prefix +
          connector +
          entry.name +
          "/\n" +
          walk(fullPath, nextPrefix)
        );
      } else {
        return prefix + connector + entry.name + "\n";
      }
    })
    .join("");
}

const tree = `# Project Structure

\`\`\`
${ROOT}/
${walk(ROOT)}
\`\`\`
`;

if (fs.existsSync(OUTPUT)) {
  console.warn("⚠ Overwriting existing STRUCTURE.md");
}

fs.writeFileSync(OUTPUT, tree, { flag: "w" });
console.log(`✔ Project structure written to ${OUTPUT}`);
