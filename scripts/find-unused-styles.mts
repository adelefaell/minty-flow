#!/usr/bin/env node

/**
 * Find unused style keys in StyleSheet.create(...) objects.
 * Output is GCC-style (file:line:col: message) so VS Code makes each line clickable.
 *
 * Usage:
 *   npx ts-node scripts/find-unused-styles.ts [path]
 * or compile with tsc and run with node.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT: string = process.cwd();
const TARGET: string = path.resolve(ROOT, process.argv[2] || "src");

interface StyleBlock {
  varName: string;
  block: string;
  start: number;
  blockEnd: number;
  openBrace: number;
  blockStartLine: number;
}

interface DefinedKey {
  key: string;
  lineOffsetInBlock: number;
  column: number;
}

function findFiles(dir: string, ext = ".tsx", acc: string[] = []): string[] {
  const dirPath = path.resolve(ROOT, dir);
  if (!dirPath || !fs.existsSync(dirPath)) return acc;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const e of entries) {
    const name = e.name ?? "";
    const full = path.join(dirPath, name);

    if (e.isDirectory()) {
      if (name !== "node_modules" && name !== ".git") {
        findFiles(full, ext, acc);
      }
    } else if (name.endsWith(ext) || name.endsWith(".ts")) {
      acc.push(full);
    }
  }

  return acc;
}

function getStyleBlocks(content: string): StyleBlock[] {
  const blocks: StyleBlock[] = [];
  const re = /const\s+(\w+)\s*=\s*StyleSheet\.create\s*\(/g;

  let m: RegExpExecArray | null;

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

    const createOpen = content.indexOf(
      "(",
      content.indexOf("StyleSheet.create", start)
    );

    let d = 1;
    let end = createOpen + 1;

    for (; end < content.length; end++) {
      const c = content[end];
      if (c === "(" || c === "{") d++;
      else if (c === ")" || c === "}") d--;
      if (d === 0) break;
    }

    const callEnd = end + 1;

    blocks.push({
      varName,
      block,
      start,
      blockEnd: callEnd,
      openBrace,
      blockStartLine,
    });
  }

  return blocks;
}

function getDefinedKeysWithPosition(blockStr: string): DefinedKey[] {
  const keys: DefinedKey[] = [];
  let depth = 0;
  const lines = blockStr.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    const open = (line.match(/[{]/g) || []).length;
    const close = (line.match(/[}]/g) || []).length;

    const keyMatch = line.match(/^\s*(\w+):\s*\{/);

    if (keyMatch && depth === 0) {
      const column = (line.match(/^\s*/)?.[0]?.length ?? 0) + 1;

      keys.push({
        key: keyMatch[1],
        lineOffsetInBlock: lineIdx,
        column,
      });
    }

    depth += open - close;
  }

  return keys;
}

function getUsedKeys(
  content: string,
  varName: string,
  styleBlockStart: number,
  styleBlockEnd: number
): Set<string> {
  const before = content.slice(0, styleBlockStart);
  const after = content.slice(styleBlockEnd);
  const withoutBlock = before + after;

  const re = new RegExp(`\\b${varName}\\.(\\w+)`, "g");

  const used = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = re.exec(withoutBlock)) !== null) {
    used.add(m[1]);
  }

  return used;
}

function run(): void {
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

    for (const {
      varName,
      block,
      start,
      blockEnd,
      blockStartLine,
    } of blocks) {
      const definedWithPos = getDefinedKeysWithPosition(block);
      const used = getUsedKeys(content, varName, start, blockEnd);

      const unused = definedWithPos.filter(
        ({ key }) => !used.has(key)
      );

      if (unused.length > 0) {
        totalUnused += unused.length;

        for (const { key, lineOffsetInBlock, column } of unused) {
          const line = blockStartLine + lineOffsetInBlock;

          console.log(
            `${relativePath}:${line}:${column}: unused style key "${key}" (${varName})`
          );
        }
      }
    }
  }

  if (totalUnused === 0) {
    console.log("No unused style keys found.");
  } else {
    console.log(`\nTotal: ${totalUnused} unused style key(s).`);
  }
}

run();