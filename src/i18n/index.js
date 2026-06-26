/* i18n simples (vanilla, sem libs). Idiomas ATIVOS: pt (canônico), en.
   O espanhol (es.js) está traduzido e pronto, porém DESATIVADO no lançamento — fica
   fora de DICTS/LANGS e do seletor. Reativar = descomentar as 3 marcas "ES desativado".
   - t(key, vars): traduz, com interpolação {x}; cai em pt se faltar a chave,
     e na própria chave se faltar até em pt (sinal de dev).
   - applyStatic(): preenche elementos [data-i18n] / [data-i18n-html] / [data-i18n-ph].
   - detectLang(): navigator.language começando com pt → pt; qualquer outro → en.
   - persistência em localStorage['4a0_lang'], robusta a indisponível/inválido. */
import pt from './pt.js';
import en from './en.js';
// import es from './es.js'; // ES desativado temporariamente — reativar: descomentar

const DICTS = { pt, en /* , es */ };          // ES desativado temporariamente — repor `es` aqui
export const LANGS = ['pt', 'en'];            // ES desativado temporariamente — voltar a ['pt', 'en', 'es']
const STORE_KEY = '4a0_lang';
let lang = 'pt';
let onChange = null;

export function detectLang() {
  const n = (navigator.language || 'en').toLowerCase();
  if (n.startsWith('pt')) return 'pt';
  return 'en'; /* es desativado: navegador em espanhol cai no inglês (padrão internacional) */
}
function readStored() {
  try { const v = localStorage.getItem(STORE_KEY); return DICTS[v] ? v : null; } catch (e) { return null; }
}
function writeStored(l) { try { localStorage.setItem(STORE_KEY, l); } catch (e) { /* sem persistência, ok */ } }

export function getLang() { return lang; }

export function t(key, vars) {
  let s = DICTS[lang] && DICTS[lang][key];
  if (s == null) s = DICTS.pt[key];   /* fallback: português */
  if (s == null) return key;          /* último recurso: a chave crua (sinaliza falta) */
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}

export function applyStatic(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
  document.documentElement.lang = lang;
}

/* main.js registra aqui o que re-renderizar quando o idioma muda na hora */
export function onLangChange(fn) { onChange = fn; }

export function setLang(l) {
  if (!DICTS[l] || l === lang) return;
  lang = l;
  writeStored(l);
  applyStatic();
  if (onChange) onChange();
}

export function initLang() {
  lang = readStored() || detectLang();
  applyStatic();
}
