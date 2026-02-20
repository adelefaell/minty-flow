
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || ".";
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

const MAX_DEPTH = 8; // safety valve

function walk(dir, prefix = "", depth = 0) {
  if (depth > MAX_DEPTH) return "";

  let entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !IGNORE.has(e.name))
    .sort((a, b) => {
      // folders first, then alpha
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  return entries
    .map((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      const fullPath = path.join(dir, entry.name);

      const icon = entry.isDirectory() ? "📁 " : "📄 ";

      if (entry.isDirectory()) {
        return (
          prefix +
          connector +
          icon +
          entry.name +
          "/\n" +
          walk(fullPath, nextPrefix, depth + 1)
        );
      } else {
        return prefix + connector + icon + entry.name + "\n";
      }
    })
    .join("");
}

const tree = `# Project Structure

Generated on: ${new Date().toISOString()}

\`\`\`
${ROOT}/
${walk(ROOT)}
\`\`\`
`;

if (fs.existsSync(OUTPUT)) {
  console.warn("⚠ Overwriting existing STRUCTURE.md");
}

fs.writeFileSync(OUTPUT, tree, "utf8");
console.log(`✔ Project structure written to ${OUTPUT}`);
