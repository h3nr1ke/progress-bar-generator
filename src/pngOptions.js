import { DEFAULTS } from './defaults.js';

const BASE = DEFAULTS.png;

/**
 * Opções do encoder PNG (libvips). Mescla defaults com `config.png`.
 * `colours` (EN) e `colors` (US) são aceitos.
 */
export function getPngOptions(merged) {
  const user = merged.png && typeof merged.png === 'object' && merged.png !== null ? merged.png : {};
  const n = user.colors ?? user.colours;
  return {
    ...BASE,
    ...user,
    ...(n != null ? { colors: n } : {}),
  };
}
