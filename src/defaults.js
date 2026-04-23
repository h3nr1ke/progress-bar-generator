export const DEFAULTS = {
  backgroundColor: '#FFFFFF',
  barColor: '#0000FF',
  percentage: 0,
  height: 64,
  width: 400,
  borderWidth: 2,
  borderColor: '#333333',
  borderRadius: 8,
  padding: 4,
  margin: 8,
  outputDir: './output',
  thresholds: [
    { until: 20, barColor: '#E53935' },
    { until: 60, barColor: '#FDD835' },
    { until: 100, barColor: '#43A047' },
  ],
  showLabel: false,
  labelColor: '#1a1a1a',
  /** Se omitido ou null, calcula a partir da altura do trilho */
  labelFontSize: null,
  /** null = alinha ao trilho; number = raio dos cantos do preenchimento (0 = quadrado na ponta) */
  barBorderRadius: null,
  /**
   * Saída PNG otimizada (Sharp): zlib máximo, filtro adaptativo, paleta (menor tamanho em gráficos planos).
   * Desative `palette` se notar banding no texto.
   */
  png: {
    compressionLevel: 9,
    adaptiveFiltering: true,
    effort: 10,
    palette: true,
    quality: 100,
    colors: 256,
    dither: 1,
  },
};
