#!/usr/bin/env node
/**
 * Find unused style keys in StyleSheet.create(...) objects.
 * Output is GCC-style (file:line:col: message) so Cursor/VS Code make each line clickable.
 *
 * Usage: node scripts/find-unused-styles.mjs [path]
 *   path: file or directory (default: src)
 * Example: node scripts/find-unused-styles.mjs src/app/accounts
 *
 * (Node is used instead of bash so we can reliably parse brace-balanced blocks
 * and extract key positions for clickable links.)
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.resolve(ROOT, process.argv[2] || "src");

function findFiles(dir, ext = ".tsx", acc = []) {
  const dirPath = path.resolve(ROOT, dir);
  if (!dirPath || !fs.existsSync(dirPath)) return acc;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const e of entries) {
    const name = e.name ?? "";
    const full = path.join(dirPath, name);
    if (e.isDirectory()) {
      if (name !== "node_modules" && name !== ".git") findFiles(full, ext, acc);
    } else if (name.endsWith(ext) || name.endsWith(".ts")) {
      acc.push(full);
    }
  }
  return acc;
}

function getStyleBlocks(content) {
  const blocks = [];
  const re = /const\s+(\w+)\s*=\s*StyleSheet\.create\s*\(/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const varName = m[1];
    const start = m.index;
    const arrowObj = content.indexOf("=> ({", start);
    if (arrowObj === -1) continue;
    const openBrace = content.indexOf("{", arrowObj);
    let depth = 1;
    let closeBrace = openBrace + 1;
    for (; closeBrace < content.length; closeBrace++) {
      const c = content[closeBrace];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const block = content.slice(openBrace + 1, closeBrace);
    const blockStartLine =
      content.slice(0, openBrace + 1).split("\n").length;
    const createOpen = content.indexOf("(", content.indexOf("StyleSheet.create", start));
    let d = 1;
    let end = createOpen + 1;
    for (; end < content.length; end++) {
      const c = content[end];
      if (c === "(" || c === "{") d++;
      else if (c === ")" || c === "}") d--;
      if (d === 0) break;
    }
    const callEnd = end + 1;
    blocks.push({ varName, block, start, blockEnd: callEnd, openBrace, blockStartLine });
  }
  return blocks;
}

/** Returns [{ key, lineOffsetInBlock, column }] for each top-level style key. */
function getDefinedKeysWithPosition(blockStr) {
  const keys = [];
  let depth = 0;
  const lines = blockStr.split("\n");
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const open = (line.match(/[{]/g) || []).length;
    const close = (line.match(/[}]/g) || []).length;
    const keyMatch = line.match(/^\s*(\w+):\s*\{/);
    if (keyMatch && depth === 0) {
      const column = (line.match(/^\s*/)[0]?.length ?? 0) + 1;
      keys.push({ key: keyMatch[1], lineOffsetInBlock: lineIdx, column });
    }
    depth += open - close;
  }
  return keys;
}

function getUsedKeys(content, varName, styleBlockStart, styleBlockEnd) {
  const before = content.slice(0, styleBlockStart);
  const after = content.slice(styleBlockEnd);
  const withoutBlock = before + after;
  const re = new RegExp(`\\b${varName}\\.(\\w+)`, "g");
  const used = new Set();
  let m;
  while ((m = re.exec(withoutBlock)) !== null) used.add(m[1]);
  return used;
}

function run() {
  if (!fs.existsSync(TARGET)) {
    console.error("Path not found:", TARGET);
    process.exit(1);
  }
  const files = fs.statSync(TARGET).isDirectory()
    ? findFiles(TARGET)
    : [TARGET].filter((f) => fs.existsSync(f));

  let totalUnused = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes("StyleSheet.create")) continue;

    const blocks = getStyleBlocks(content);
    const relativePath = path.relative(ROOT, file);
    for (const { varName, block, start, blockEnd, blockStartLine } of blocks) {
      const definedWithPos = getDefinedKeysWithPosition(block);
      const used = getUsedKeys(content, varName, start, blockEnd);
      const unused = definedWithPos.filter(({ key }) => !used.has(key));
      if (unused.length > 0) {
        totalUnused += unused.length;
        for (const { key, lineOffsetInBlock, column } of unused) {
          const line = blockStartLine + lineOffsetInBlock;
          // GCC-style so terminals/IDEs make it clickable: file:line:column: message
          console.log(`${relativePath}:${line}:${column}: unused style key "${key}" (${varName})`);
        }
      }
    }
  }
  if (totalUnused === 0) console.log("No unused style keys found.");
  else console.log(`\nTotal: ${totalUnused} unused style key(s).`);
}

run();
