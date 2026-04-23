/**
 * Preenchimento com borda esquerda reta (o clip do trilho aplica o raio) e canto direito arredondado.
 */
function pathRightRoundedRect(x, y, w, h, r) {
  if (w <= 0 || h <= 0) return '';
  const r2 = Math.max(0, Math.min(r, w / 2, h / 2));
  if (r2 < 0.5) {
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  return `M ${x} ${y} L ${x + w - r2} ${y} A ${r2} ${r2} 0 0 1 ${x + w} ${y + r2} L ${x + w} ${
    y + h - r2
  } A ${r2} ${r2} 0 0 1 ${x + w - r2} ${y + h} L ${x} ${y + h} L ${x} ${y} Z`;
}

/**
 * Gera SVG da barra de progresso.
 * Layout: canvas width x height, margens externas, retângulo com borda,
 * padding interno, trilho (fundo) e preenchimento proporcional à %.
 */
export function buildProgressSvg(cfg) {
  const {
    width: W,
    height: H,
    margin,
    borderWidth: bw,
    borderColor,
    borderRadius: brOuter,
    padding: pad,
    backgroundColor,
    barColor,
    percentage,
    showLabel,
    labelColor,
    labelFontSize: labelFontSizeCfg,
    barBorderRadius: barBorderRadiusCfg,
  } = cfg;

  const pct = Math.min(100, Math.max(0, Number(percentage)));

  const boxX = margin.left;
  const boxY = margin.top;
  const boxW = W - margin.left - margin.right;
  const boxH = H - margin.top - margin.bottom;

  const innerX = boxX + bw;
  const innerY = boxY + bw;
  const innerW = boxW - 2 * bw;
  const innerH = boxH - 2 * bw;
  const brInner = Math.max(0, brOuter - bw);

  const trackX = innerX + pad;
  const trackY = innerY + pad;
  const trackW = innerW - 2 * pad;
  const trackH = innerH - 2 * pad;
  const trackR = Math.max(0, Math.min(brInner - pad, trackH / 2));

  const fillW = (trackW * pct) / 100;

  const barB =
    barBorderRadiusCfg != null && Number.isFinite(Number(barBorderRadiusCfg))
      ? Math.max(0, Number(barBorderRadiusCfg))
      : trackR;
  const isTrackFull = fillW >= trackW - 0.5;
  const fillRFull = Math.max(0, Math.min(barB, trackR, trackH / 2, trackW / 2));
  const rTip = Math.max(0, Math.min(barB, trackH / 2, fillW / 2));

  const labelText = `${Math.round(pct)}%`;
  const autoFont = Math.round(Math.min(48, Math.max(10, trackH * 0.52)));
  const labelFontSize = Math.max(
    8,
    labelFontSizeCfg != null && Number.isFinite(Number(labelFontSizeCfg))
      ? Number(labelFontSizeCfg)
      : autoFont,
  );

  const esc = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');

  const clipId = `clip-${Math.random().toString(36).slice(2)}`;

  // y em <text> é a baseline alfabética. O librsvg (Sharp) não aplica o mesmo "middle" que o navegador;
  // deslocamos a baseline para o miolo do texto coincidir com o centro vertical do trilho.
  const labelYBaseline = trackY + trackH / 2 + 0.36 * labelFontSize;
  const labelSvg = showLabel
    ? `<text x="${trackX + trackW / 2}" y="${labelYBaseline}" fill="${esc(labelColor)}"
    font-size="${labelFontSize}" font-family="system-ui, Segoe UI, sans-serif" font-weight="600"
    text-anchor="middle" dominant-baseline="alphabetic">${esc(labelText)}</text>`
    : '';

  let fillBarSvg = '';
  if (fillW >= 0.5) {
    if (isTrackFull) {
      fillBarSvg = `<rect x="${trackX}" y="${trackY}" width="${trackW}" height="${trackH}" rx="${fillRFull}" ry="${fillRFull}" fill="${esc(barColor)}"/>`;
    } else {
      const d = pathRightRoundedRect(trackX, trackY, fillW, trackH, rTip);
      fillBarSvg = d
        ? `<path d="${d}" fill="${esc(barColor)}"/>`
        : `<rect x="${trackX}" y="${trackY}" width="${fillW}" height="${trackH}" fill="${esc(barColor)}"/>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="${clipId}">
      <rect x="${trackX}" y="${trackY}" width="${trackW}" height="${trackH}" rx="${trackR}" ry="${trackR}"/>
    </clipPath>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(backgroundColor)}"/>
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${brOuter}" ry="${brOuter}"
    fill="${esc(backgroundColor)}" stroke="${esc(borderColor)}" stroke-width="${bw}"/>
  <rect x="${trackX}" y="${trackY}" width="${trackW}" height="${trackH}" rx="${trackR}" ry="${trackR}"
    fill="${esc(backgroundColor)}"/>
  <g clip-path="url(#${clipId})">
    ${fillBarSvg}
  </g>
  ${labelSvg}
</svg>`;
}
