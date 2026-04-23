import sharp from 'sharp';
import { mergeConfig, barColorForPercentage } from './mergeConfig.js';
import { buildProgressSvg } from './svg.js';
import { getPngOptions } from './pngOptions.js';

function buildPngPipeline(mergedConfig) {
  const barColor = barColorForPercentage(
    mergedConfig.percentage,
    mergedConfig.thresholds,
    mergedConfig.barColor,
  );
  const cfg = { ...mergedConfig, barColor };
  const svg = buildProgressSvg(cfg);
  return sharp(Buffer.from(svg)).png(getPngOptions(mergedConfig));
}

export async function renderProgressPng(mergedConfig) {
  return buildPngPipeline(mergedConfig).toBuffer();
}

export async function writeProgressPng(mergedConfig, filePath) {
  await buildPngPipeline(mergedConfig).toFile(filePath);
}

export function resolveImageJobs(rootConfig) {
  const base = mergeConfig(rootConfig);
  const jobs = [];

  if (Array.isArray(rootConfig.images) && rootConfig.images.length) {
    for (const img of rootConfig.images) {
      const one = mergeConfig({ ...rootConfig, ...img, images: undefined, series: undefined });
      const name = img.filename || `progress-${one.percentage}.png`;
      jobs.push({ config: one, filename: name });
    }
    return jobs;
  }

  if (rootConfig.series) {
    const { from = 0, to = 100, step = 1, filenamePattern = 'progress-{percent}.png' } = rootConfig.series;
    for (let p = from; p <= to; p += step) {
      const one = mergeConfig({
        ...rootConfig,
        percentage: p,
        images: undefined,
        series: undefined,
      });
      const name = filenamePattern.replaceAll('{percent}', String(Math.round(p * 1000) / 1000));
      jobs.push({ config: { ...one, percentage: p }, filename: name });
    }
    return jobs;
  }

  jobs.push({
    config: mergeConfig({ ...rootConfig, images: undefined, series: undefined }),
    filename: rootConfig.filename || `progress-${base.percentage}.png`,
  });
  return jobs;
}
