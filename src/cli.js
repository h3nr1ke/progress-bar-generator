#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeProgressPng, resolveImageJobs } from './generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = { config: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--config' || a === '-c') {
      out.config = argv[++i];
    }
  }
  return out;
}

async function main() {
  const { config: configPath } = parseArgs(process.argv);
  if (!configPath) {
    console.error('Uso: node src/cli.js --config caminho/config.json');
    process.exit(1);
  }

  const absConfig = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
  const raw = await fs.readFile(absConfig, 'utf8');
  const json = JSON.parse(raw);

  const outputDir = path.isAbsolute(json.outputDir)
    ? json.outputDir
    : path.resolve(path.dirname(absConfig), json.outputDir || './output');

  await fs.mkdir(outputDir, { recursive: true });

  const jobs = resolveImageJobs(json);
  let n = 0;
  for (const { config, filename } of jobs) {
    const dest = path.join(outputDir, filename);
    await writeProgressPng(config, dest);
    n++;
  }

  console.log(`Geradas ${n} imagem(ns) em ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
