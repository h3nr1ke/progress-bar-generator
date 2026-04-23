import { DEFAULTS } from './defaults.js';

function flattenLabel(partial) {
  if (!partial || typeof partial.label !== 'object' || partial.label === null) return partial;
  const { label, ...rest } = partial;
  const out = { ...rest };
  if (label.enabled !== undefined || label.show !== undefined) {
    out.showLabel = Boolean(label.enabled ?? label.show);
  }
  if (label.color !== undefined) out.labelColor = label.color;
  if (label.fontSize !== undefined) out.labelFontSize = label.fontSize;
  return out;
}

function flattenBar(partial) {
  if (!partial || typeof partial.bar !== 'object' || partial.bar === null) return partial;
  const { bar, ...rest } = partial;
  if (bar.borderRadius !== undefined) rest.barBorderRadius = bar.borderRadius;
  return rest;
}

function normalizeMargin(margin) {
  if (margin == null) return { top: DEFAULTS.margin, right: DEFAULTS.margin, bottom: DEFAULTS.margin, left: DEFAULTS.margin };
  if (typeof margin === 'number') {
    return { top: margin, right: margin, bottom: margin, left: margin };
  }
  return {
    top: margin.top ?? DEFAULTS.margin,
    right: margin.right ?? DEFAULTS.margin,
    bottom: margin.bottom ?? DEFAULTS.margin,
    left: margin.left ?? DEFAULTS.margin,
  };
}

export function mergeConfig(partial = {}) {
  const flat = flattenLabel(flattenBar(partial));
  const margin = normalizeMargin(flat.margin ?? DEFAULTS.margin);
  return {
    ...DEFAULTS,
    ...flat,
    margin,
    thresholds: flat.thresholds?.length ? flat.thresholds : DEFAULTS.thresholds,
  };
}

/**
 * Cada item usa `until` como limite superior exclusivo da faixa, exceto o último
 * (percentuais >= último `until` usam a cor do último item). Ex.:
 * until 20 → [0,20); until 60 → [20,60); until 100 → [60,100].
 */
export function barColorForPercentage(percentage, thresholds, fallbackBarColor) {
  const p = Math.min(100, Math.max(0, Number(percentage)));
  const sorted = [...thresholds].sort((a, b) => a.until - b.until);
  for (const t of sorted) {
    if (p < t.until) return t.barColor;
  }
  return sorted.length ? sorted[sorted.length - 1].barColor : fallbackBarColor;
}
