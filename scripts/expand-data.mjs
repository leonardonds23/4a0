/**
 * Expands /public/data/<year>.json to ~50 players per year (2000-2010) by merging:
 *  - official year-end top 50 rankings (Tennis Abstract / Jeff Sackmann dataset, /tmp/ye_rankings.json)
 *  - existing curated entries (kept, with rank corrected to the official one)
 *  - new entries: attrs reused from the same player's nearest existing year, or
 *    from the curated PROFILES below (rating curation, GDD §7.3 step 2)
 * Existing players outside the official top 50 (e.g. Puerta 2005) are kept as-is.
 */
import fs from 'node:fs';

const YEARS = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010];
const KEYS = ['sv', 'rt', 'fh', 'bh', 'sl', 'vl', 'mv', 'mn'];
const ye = JSON.parse(fs.readFileSync('/tmp/ye_rankings.json', 'utf8'));

/* dataset name -> display name used in game */
const DISPLAY = {
  'Juan Martin del Potro': 'Juan M. del Potro',
  'Paul Henri Mathieu': 'Paul-Henri Mathieu',
  'Jan Michael Gambill': 'Jan-Michael Gambill',
  'Guillermo Garcia Lopez': 'Guillermo Garcia-Lopez',
  'Hyung Taik Lee': 'Hyung-Taik Lee',
  'Yen Hsun Lu': 'Yen-Hsun Lu',
  'Thiemo De Bakker': 'Thiemo de Bakker',
};

/* curated attrs [sv,rt,fh,bh,sl,vl,mv,mn] for players with no existing entry in any year */
const PROFILES = {
  'Wayne Ferreira': ['RSA', 82, 80, 86, 82, 76, 78, 84, 76],
  'Nicolas Lapentti': ['ECU', 80, 78, 85, 82, 74, 72, 84, 76],
  'Andrei Pavel': ['ROU', 82, 78, 84, 82, 74, 76, 82, 76],
  'Marc Rosset': ['SUI', 92, 70, 82, 76, 72, 82, 70, 72],
  'Hicham Arazi': ['MAR', 74, 80, 86, 80, 78, 76, 86, 70],
  'Fabrice Santoro': ['FRA', 70, 82, 74, 78, 90, 86, 84, 78],
  'Michael Chang': ['USA', 74, 84, 82, 80, 70, 70, 90, 84],
  'Jan Michael Gambill': ['USA', 86, 74, 86, 80, 68, 74, 76, 72],
  'Byron Black': ['ZIM', 74, 80, 78, 80, 78, 84, 82, 72],
  'Richard Krajicek': ['NED', 94, 70, 86, 76, 74, 88, 72, 76],
  'Marcelo Rios': ['CHI', 76, 84, 90, 86, 84, 78, 88, 68],
  'David Prinosil': ['GER', 80, 76, 80, 78, 74, 78, 78, 70],
  'Jerome Golmard': ['FRA', 82, 76, 84, 78, 72, 74, 80, 70],
  'Gianluca Pozzi': ['ITA', 74, 80, 78, 80, 78, 80, 78, 74],
  'Jonas Bjorkman': ['SWE', 76, 86, 78, 80, 76, 88, 82, 74],
  'Vladimir Voltchkov': ['BLR', 80, 74, 80, 76, 74, 80, 78, 70],
  'Fernando Vicente': ['ESP', 72, 80, 82, 78, 68, 66, 84, 72],
  'Francisco Clavet': ['ESP', 70, 80, 82, 78, 70, 68, 86, 74],
  'Andrew Ilie': ['AUS', 78, 72, 86, 74, 68, 70, 78, 70],
  'Albert Portas': ['ESP', 70, 78, 82, 80, 76, 70, 84, 72],
  'Greg Rusedski': ['GBR', 93, 70, 80, 74, 74, 86, 72, 72],
  'Bohdan Ulihrach': ['CZE', 76, 80, 82, 80, 70, 70, 84, 72],
  'Xavier Malisse': ['BEL', 82, 80, 86, 82, 76, 76, 84, 68],
  'Andreas Vinciguerra': ['SWE', 74, 82, 80, 80, 72, 72, 84, 70],
  'Alberto Martin': ['ESP', 68, 80, 80, 78, 70, 66, 86, 72],
  'Felix Mantilla': ['ESP', 70, 80, 84, 80, 68, 66, 86, 74],
  'Michel Kratochvil': ['SUI', 78, 76, 82, 78, 70, 72, 80, 68],
  'Paul Henri Mathieu': ['FRA', 80, 80, 86, 82, 72, 72, 84, 68],
  'Jarkko Nieminen': ['FIN', 76, 82, 82, 82, 74, 76, 88, 74],
  'Jose Acasuso': ['ARG', 84, 74, 86, 80, 68, 68, 80, 70],
  'Davide Sanguinetti': ['ITA', 76, 78, 82, 80, 74, 76, 80, 72],
  'Todd Martin': ['USA', 88, 76, 84, 82, 74, 84, 72, 80],
  'Agustin Calleri': ['ARG', 80, 74, 88, 78, 66, 66, 82, 70],
  'Mariano Zabaleta': ['ARG', 74, 78, 84, 78, 66, 66, 86, 72],
  'Feliciano Lopez': ['ESP', 88, 72, 82, 74, 84, 86, 78, 72],
  'Vincent Spadea': ['USA', 74, 82, 82, 82, 70, 70, 80, 72],
  'Taylor Dent': ['USA', 91, 68, 78, 72, 74, 90, 70, 70],
  'Sargis Sargsian': ['ARM', 72, 80, 80, 78, 68, 68, 84, 72],
  'Karol Kucera': ['SVK', 76, 84, 82, 82, 72, 72, 84, 72],
  'Flavio Saretta': ['BRA', 76, 76, 84, 76, 68, 66, 84, 68],
  'Filippo Volandri': ['ITA', 70, 78, 84, 76, 66, 64, 84, 70],
  'Olivier Rochus': ['BEL', 68, 84, 80, 82, 78, 76, 88, 74],
  'David Sanchez': ['ESP', 70, 78, 82, 78, 68, 66, 84, 70],
  'Joachim Johansson': ['SWE', 95, 70, 88, 74, 68, 76, 70, 72],
  'Florian Mayer': ['GER', 76, 80, 80, 84, 84, 80, 84, 72],
  'Luis Horna': ['PER', 72, 78, 82, 78, 68, 66, 84, 70],
  'Michael Llodra': ['FRA', 88, 70, 76, 72, 84, 92, 76, 72],
  'Karol Beck': ['SVK', 76, 80, 80, 80, 70, 70, 82, 68],
  'Igor Andreev': ['RUS', 80, 76, 90, 76, 66, 68, 84, 72],
  'Victor Hanescu': ['ROU', 80, 76, 84, 80, 70, 70, 80, 68],
  'Christophe Rochus': ['BEL', 68, 82, 78, 80, 76, 72, 86, 70],
  'Florent Serra': ['FRA', 76, 80, 82, 80, 72, 72, 84, 70],
  'Dmitry Tursunov': ['RUS', 84, 76, 88, 80, 68, 72, 80, 68],
  'Kristof Vliegen': ['BEL', 82, 74, 84, 78, 70, 76, 76, 68],
  'Julien Benneteau': ['FRA', 80, 80, 82, 82, 76, 80, 84, 70],
  'Marc Gicquel': ['FRA', 80, 76, 82, 78, 72, 76, 80, 70],
  'Hyung Taik Lee': ['KOR', 74, 84, 82, 82, 70, 72, 86, 74],
  'Juan Monaco': ['ARG', 72, 82, 84, 80, 68, 66, 90, 76],
  'Potito Starace': ['ITA', 72, 76, 84, 78, 70, 66, 84, 68],
  'Philipp Kohlschreiber': ['GER', 80, 78, 86, 86, 80, 76, 84, 70],
  'Nicolas Mahut': ['FRA', 84, 72, 78, 74, 82, 90, 78, 70],
  'Albert Montanes': ['ESP', 70, 78, 84, 78, 68, 64, 86, 72],
  'Stefan Koubek': ['AUT', 72, 80, 80, 78, 70, 68, 84, 68],
  'Andreas Seppi': ['ITA', 74, 84, 80, 82, 74, 72, 86, 74],
  'Simone Bolelli': ['ITA', 82, 74, 88, 80, 72, 76, 78, 66],
  'Igor Kunitsyn': ['RUS', 74, 80, 80, 80, 70, 70, 82, 70],
  'Janko Tipsarevic': ['SRB', 80, 82, 84, 84, 74, 72, 86, 74],
  'Viktor Troicki': ['SRB', 84, 80, 82, 80, 70, 72, 84, 70],
  'Jeremy Chardy': ['FRA', 86, 72, 88, 74, 70, 76, 78, 68],
  'Thomaz Bellucci': ['BRA', 82, 74, 86, 78, 68, 68, 86, 70],
  'Andreas Beck': ['GER', 80, 76, 78, 78, 68, 70, 80, 66],
  'Benjamin Becker': ['GER', 86, 74, 82, 76, 70, 76, 76, 70],
  'Guillermo Garcia Lopez': ['ESP', 76, 78, 84, 82, 72, 70, 84, 70],
  'Dudi Sela': ['ISR', 68, 84, 80, 82, 76, 74, 86, 72],
  'Horacio Zeballos': ['ARG', 76, 76, 82, 80, 70, 72, 82, 68],
  'Pablo Cuevas': ['URU', 76, 76, 86, 82, 76, 74, 84, 70],
  'Ernests Gulbis': ['LAT', 88, 76, 88, 82, 70, 72, 80, 62],
  'Yen Hsun Lu': ['TPE', 74, 84, 80, 80, 70, 72, 86, 72],
  'Andrey Golubev': ['KAZ', 82, 72, 86, 76, 66, 70, 78, 62],
  'Denis Istomin': ['UZB', 84, 78, 84, 78, 70, 72, 82, 68],
  'Marcel Granollers': ['ESP', 74, 80, 80, 80, 74, 78, 84, 70],
  'Thiemo De Bakker': ['NED', 86, 74, 84, 78, 70, 72, 78, 64],
  'Sergiy Stakhovsky': ['UKR', 84, 72, 78, 74, 80, 88, 76, 68],
  'Alexandr Dolgopolov': ['UKR', 80, 78, 86, 80, 84, 74, 90, 64],
};

/* per-year attr overrides: career phase differs too much from the reused entry */
const TWEAKS = {
  '2002|Gustavo Kuerten': [80, 78, 88, 90, 82, 76, 84, 86],
  '2003|Gustavo Kuerten': [80, 78, 88, 90, 82, 76, 84, 86],
  '2004|Gustavo Kuerten': [80, 78, 88, 90, 82, 76, 84, 86],
  '2002|Yevgeny Kafelnikov': [78, 85, 83, 87, 75, 78, 82, 77],
  '2003|Yevgeny Kafelnikov': [78, 85, 83, 87, 75, 78, 82, 77],
  '2004|Robin Soderling': [86, 76, 90, 82, 70, 72, 78, 74],
  '2005|Gael Monfils': [84, 80, 84, 78, 74, 75, 93, 70],
  '2006|Novak Djokovic': [83, 88, 87, 89, 76, 76, 90, 80],
  '2006|Andy Murray': [82, 88, 83, 86, 84, 80, 90, 76],
  '2006|Juan Carlos Ferrero': [80, 82, 88, 81, 71, 71, 88, 82],
  '2007|Juan Carlos Ferrero': [80, 82, 88, 81, 71, 71, 88, 82],
  '2009|Juan Carlos Ferrero': [80, 82, 88, 81, 71, 71, 88, 82],
  '2010|Juan Carlos Ferrero': [80, 82, 88, 81, 71, 71, 88, 82],
  '2009|James Blake': [83, 79, 89, 81, 70, 77, 86, 73],
};

/* extra slam highlights for players added by this script */
const HIGHLIGHTS = {
  '2000|Vladimir Voltchkov': 'Semifinalista de Wimbledon',
  '2002|Xavier Malisse': 'Semifinalista de Wimbledon',
  '2003|Albert Costa': 'Semifinalista de Roland Garros',
  '2004|Joachim Johansson': 'Semifinalista do US Open',
  '2005|Thomas Johansson': 'Semifinalista de Wimbledon',
  '2006|Nicolas Kiefer': 'Semifinalista do Australian Open',
  '2006|David Nalbandian': 'Semifinalista do Australian Open',
  '2008|Rainer Schuettler': 'Semifinalista de Wimbledon',
  '2010|Jo-Wilfried Tsonga': 'Semifinalista do Australian Open',
};

const slug = (name) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim().replace(/ +/g, '-');

/* load existing files; index curated entries by display name */
const files = {};
const byNameYear = {}; // displayName -> { year -> entry }
for (const y of YEARS) {
  files[y] = JSON.parse(fs.readFileSync(`public/data/${y}.json`, 'utf8'));
  for (const p of files[y].players) {
    (byNameYear[p.name] ??= {})[y] = p;
  }
}

const nearestEntry = (displayName, year) => {
  const m = byNameYear[displayName];
  if (!m) return null;
  const ys = Object.keys(m).map(Number).sort((a, b) => Math.abs(a - year) - Math.abs(b - year));
  return m[ys[0]] ?? null;
};

const missing = new Set();
for (const y of YEARS) {
  const official = ye[y]
    .map((s) => { const m = s.match(/^(\d+) (.+) ([A-Z]{3})$/); return { rank: +m[1], name: m[2], ioc: m[3] }; })
    .filter((r) => r.rank <= 50);
  const officialNames = new Set();
  const out = [];

  for (const r of official) {
    const display = DISPLAY[r.name] ?? r.name;
    officialNames.add(display);
    const existing = files[y].players.find((p) => p.name === display);
    const tweak = TWEAKS[`${y}|${r.name}`];
    if (existing) {
      existing.rank = r.rank; // corrige rank aproximado para o oficial
      if (tweak) existing.attrs = Object.fromEntries(KEYS.map((k, i) => [k, tweak[i]]));
      out.push(existing);
      continue;
    }
    const source = tweak ? { attrs: Object.fromEntries(KEYS.map((k, i) => [k, tweak[i]])) } : nearestEntry(display, y);
    let attrs, country = r.ioc;
    if (source) {
      attrs = { ...source.attrs };
    } else if (PROFILES[r.name]) {
      const [ioc, ...vals] = PROFILES[r.name];
      country = ioc;
      attrs = Object.fromEntries(KEYS.map((k, i) => [k, vals[i]]));
    } else {
      missing.add(`${y}: #${r.rank} ${r.name}`);
      continue;
    }
    out.push({
      id: slug(display),
      name: display,
      country,
      rank: r.rank,
      highlight: HIGHLIGHTS[`${y}|${r.name}`] ?? null,
      champion: null,
      attrs,
    });
  }

  /* mantém curados fora do top 50 oficial (ex.: Puerta 2005, Nadal 2004 #51) */
  for (const p of files[y].players) if (!officialNames.has(p.name)) out.push(p);

  out.sort((a, b) => a.rank - b.rank);
  files[y].players = out;
  /* aplica destaques extras a entradas que já existiam */
  for (const p of out) {
    const h = HIGHLIGHTS[`${y}|${p.name}`];
    if (h && !p.highlight) p.highlight = h;
  }
}

if (missing.size) {
  console.error('SEM PERFIL (autorar e rodar de novo):');
  for (const m of missing) console.error('  ' + m);
  process.exit(1);
}

for (const y of YEARS) {
  const body = files[y].players.map((p) => '    ' + JSON.stringify(p)).join(',\n');
  fs.writeFileSync(`public/data/${y}.json`, `{\n  "year": ${y},\n  "players": [\n${body}\n  ]\n}\n`);
  console.log(`${y}: ${files[y].players.length} jogadores`);
}
console.log('OK');
