/**
 * Batch 3: creates the 1990-1999 season files with the official year-end top 50
 * (same pipeline as expand-data.mjs / expand-data-2011-2025.mjs).
 * The 90s era profiles lean into serve-and-volley archetypes.
 */
import fs from 'node:fs';

const TARGET = [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999];
const KEYS = ['sv', 'rt', 'fh', 'bh', 'sl', 'vl', 'mv', 'mn'];
const ye = JSON.parse(fs.readFileSync('/tmp/ye_rankings.json', 'utf8'));

const DISPLAY = {
  'Marc Kevin Goellner': 'Marc-Kevin Goellner',
  'Carl Uwe Steeb': 'Carl-Uwe Steeb',
  'Jan Michael Gambill': 'Jan-Michael Gambill',
  'Alex Obrien': "Alex O'Brien",
};

/* curated attrs [sv,rt,fh,bh,sl,vl,mv,mn] for players with no entry in any year */
const PROFILES = {
  'Stefan Edberg': ['SWE', 88, 84, 80, 86, 84, 96, 90, 88],
  'Boris Becker': ['GER', 93, 80, 90, 84, 80, 90, 80, 90],
  'Ivan Lendl': ['USA', 90, 86, 93, 86, 78, 80, 86, 92],
  'Jim Courier': ['USA', 85, 84, 93, 84, 70, 72, 88, 90],
  'Michael Stich': ['GER', 92, 78, 88, 84, 82, 90, 84, 80],
  'Sergi Bruguera': ['ESP', 74, 84, 88, 84, 70, 68, 92, 84],
  'Thomas Muster': ['AUT', 78, 84, 90, 82, 68, 68, 94, 90],
  'Andres Gomez': ['ECU', 80, 78, 88, 84, 74, 80, 80, 78],
  'Petr Korda': ['CZE', 86, 80, 90, 86, 76, 80, 84, 72],
  'Andrei Medvedev': ['UKR', 82, 82, 88, 86, 72, 72, 86, 76],
  'Alberto Berasategui': ['ESP', 70, 76, 92, 74, 64, 62, 88, 76],
  'Guy Forget': ['FRA', 88, 76, 84, 80, 78, 88, 82, 76],
  'Karel Novacek': ['CZE', 78, 78, 86, 80, 70, 72, 84, 74],
  'Emilio Sanchez': ['ESP', 74, 82, 84, 80, 74, 76, 86, 78],
  'Brad Gilbert': ['USA', 76, 84, 80, 80, 76, 76, 82, 86],
  'Malivai Washington': ['USA', 80, 80, 84, 80, 72, 76, 86, 76],
  'Todd Woodbridge': ['AUS', 76, 78, 76, 76, 80, 90, 80, 74],
  'Mark Woodforde': ['AUS', 74, 78, 74, 76, 82, 90, 78, 74],
  'Paul Haarhuis': ['NED', 76, 80, 78, 80, 76, 86, 82, 74],
  'Jacco Eltingh': ['NED', 80, 76, 78, 76, 76, 88, 80, 72],
  'John McEnroe': ['USA', 82, 82, 80, 82, 88, 95, 82, 80],
  'Jimmy Connors': ['USA', 74, 88, 84, 86, 76, 78, 82, 90],
  'Mats Wilander': ['SWE', 74, 86, 82, 86, 76, 76, 86, 88],
  'Yannick Noah': ['FRA', 82, 76, 82, 78, 76, 88, 86, 78],
  'Henri Leconte': ['FRA', 84, 76, 86, 80, 80, 86, 80, 68],
  'Jonas Svensson': ['SWE', 80, 78, 84, 80, 72, 74, 82, 74],
  'Andrei Chesnokov': ['RUS', 70, 84, 80, 80, 68, 66, 90, 80],
  'Guillermo Perez Roldan': ['ARG', 72, 78, 86, 78, 66, 64, 86, 74],
  'Jakob Hlasek': ['SUI', 84, 76, 80, 78, 76, 84, 80, 74],
  'Jay Berger': ['USA', 70, 82, 80, 78, 66, 64, 86, 76],
  'Juan Aguilera': ['ESP', 70, 78, 84, 78, 66, 64, 86, 74],
  'Aaron Krickstein': ['USA', 74, 84, 84, 82, 68, 66, 86, 80],
  'Andrei Cherkasov': ['RUS', 74, 80, 82, 80, 70, 70, 84, 74],
  'Richey Reneberg': ['USA', 78, 78, 80, 78, 74, 82, 80, 72],
  'Alexander Volkov': ['RUS', 80, 78, 84, 80, 74, 76, 80, 70],
  'Horst Skoff': ['AUT', 70, 80, 84, 78, 66, 64, 86, 74],
  'David Wheaton': ['USA', 86, 72, 84, 78, 74, 84, 76, 72],
  'Ronald Agenor': ['HAI', 74, 78, 86, 78, 68, 68, 84, 74],
  'Magnus Gustafsson': ['SWE', 74, 80, 86, 80, 68, 66, 86, 78],
  'Richard Fromberg': ['AUS', 84, 74, 86, 76, 68, 72, 78, 72],
  'Amos Mansdorf': ['ISR', 74, 82, 80, 80, 72, 74, 84, 76],
  'Franco Davin': ['ARG', 68, 80, 82, 78, 66, 64, 86, 74],
  'Martin Jaite': ['ARG', 70, 78, 84, 78, 66, 64, 86, 74],
  'Tim Mayotte': ['USA', 86, 74, 82, 76, 76, 88, 78, 74],
  'Jordi Arrese': ['ESP', 66, 78, 82, 78, 64, 62, 88, 74],
  'Luiz Mattar': ['BRA', 72, 78, 82, 78, 68, 68, 84, 72],
  'Scott Davis': ['USA', 80, 74, 78, 76, 76, 88, 76, 70],
  'Omar Camporese': ['ITA', 82, 76, 82, 78, 72, 76, 80, 70],
  'Carl Uwe Steeb': ['GER', 74, 80, 80, 80, 70, 70, 84, 74],
  'Derrick Rostagno': ['USA', 80, 76, 80, 78, 76, 84, 80, 70],
  'Mark Koevermans': ['NED', 68, 78, 80, 78, 66, 64, 84, 72],
  'Marcelo Filippini': ['URU', 68, 78, 82, 78, 66, 64, 86, 72],
  'Nicklas Kulti': ['SWE', 80, 76, 82, 78, 72, 76, 80, 70],
  'Gary Muller': ['RSA', 86, 70, 76, 74, 74, 86, 74, 68],
  'Goran Prpic': ['CRO', 74, 80, 80, 80, 70, 72, 82, 74],
  'Alberto Mancini': ['ARG', 72, 78, 86, 80, 66, 64, 86, 76],
  'Jan Siemerink': ['NED', 82, 76, 78, 76, 76, 86, 80, 72],
  'Patrick McEnroe': ['USA', 72, 82, 78, 80, 76, 80, 80, 76],
  'Olivier Delaitre': ['FRA', 72, 80, 78, 78, 74, 78, 82, 72],
  'Cristiano Caratti': ['ITA', 72, 78, 80, 78, 68, 68, 82, 70],
  'Christian Bergstrom': ['SWE', 76, 78, 80, 78, 70, 72, 80, 72],
  'Anders Jarryd': ['SWE', 74, 82, 76, 80, 76, 86, 82, 76],
  'Thierry Champion': ['FRA', 68, 78, 80, 78, 66, 64, 86, 72],
  'Carlos Costa': ['ESP', 70, 78, 84, 80, 66, 64, 86, 76],
  'Henrik Holm': ['SWE', 82, 76, 80, 78, 72, 76, 78, 70],
  'Arnaud Boetsch': ['FRA', 80, 78, 82, 80, 74, 78, 82, 74],
  'Magnus Larsson': ['SWE', 84, 76, 84, 80, 72, 76, 78, 74],
  'Wally Masur': ['AUS', 76, 80, 78, 80, 76, 82, 80, 76],
  'Javier Sanchez': ['ESP', 72, 82, 80, 80, 72, 74, 84, 74],
  'Jeff Tarango': ['USA', 74, 78, 80, 78, 74, 76, 80, 68],
  'Jaime Oncins': ['BRA', 76, 76, 82, 78, 66, 66, 84, 72],
  'Jaime Yzaga': ['PER', 70, 82, 82, 82, 72, 70, 86, 76],
  'Bernd Karbacher': ['GER', 76, 78, 82, 80, 68, 68, 82, 72],
  'Mikael Pernfors': ['SWE', 68, 82, 80, 80, 72, 72, 88, 76],
  'Marc Kevin Goellner': ['GER', 84, 72, 84, 76, 68, 76, 76, 68],
  'Jonathan Stark': ['USA', 84, 72, 80, 74, 72, 84, 74, 68],
  'Brett Steven': ['NZL', 76, 78, 78, 78, 72, 78, 80, 72],
  'Jason Stoltenberg': ['AUS', 78, 78, 78, 78, 76, 82, 80, 74],
  'Marcos Ondruska': ['RSA', 74, 78, 80, 78, 68, 70, 80, 70],
  'Javier Frana': ['ARG', 80, 74, 82, 76, 70, 76, 80, 70],
  'Andrea Gaudenzi': ['ITA', 76, 80, 84, 80, 68, 68, 84, 74],
  'Slava Dosedel': ['CZE', 72, 80, 82, 80, 68, 68, 84, 72],
  'Jared Palmer': ['USA', 76, 76, 78, 76, 74, 84, 78, 70],
  'Chuck Adams': ['USA', 78, 76, 82, 76, 68, 70, 78, 70],
  'Daniel Vacek': ['CZE', 84, 74, 80, 76, 70, 80, 76, 70],
  'Gilbert Schaller': ['AUT', 68, 80, 82, 78, 64, 62, 88, 74],
  'Jordi Burillo': ['ESP', 70, 78, 84, 78, 66, 64, 84, 70],
  'Alex Obrien': ['USA', 78, 76, 78, 76, 72, 82, 78, 72],
  'Hernan Gumy': ['ARG', 70, 80, 82, 78, 66, 64, 86, 72],
  'Chris Woodruff': ['USA', 80, 76, 84, 78, 68, 70, 78, 72],
  'Adrian Voinea': ['ROU', 72, 78, 84, 80, 68, 66, 84, 68],
  'Mikael Tillstrom': ['SWE', 76, 78, 80, 78, 72, 74, 80, 70],
  'Hendrik Dreekmann': ['GER', 72, 78, 82, 80, 68, 68, 84, 70],
  'Martin Damm': ['CZE', 82, 76, 80, 78, 72, 78, 78, 70],
  'Julian Alonso': ['ESP', 76, 76, 84, 78, 68, 68, 84, 70],
  'Filip Dewulf': ['BEL', 72, 78, 84, 80, 66, 66, 86, 72],
  'Guillaume Raoux': ['FRA', 76, 80, 80, 78, 72, 76, 82, 70],
  'Galo Blanco': ['ESP', 68, 78, 82, 78, 64, 62, 86, 72],
  'Scott Draper': ['AUS', 78, 76, 78, 76, 76, 84, 78, 70],
  'Karim Alami': ['MAR', 76, 76, 84, 78, 68, 68, 82, 70],
  'Fernando Meligeni': ['BRA', 72, 78, 84, 80, 68, 66, 86, 74],
  'Arnaud Di Pasquale': ['FRA', 78, 76, 84, 78, 70, 70, 82, 70],
  'Renzo Furlan': ['ITA', 70, 80, 84, 80, 68, 66, 86, 74],
};

/* career-phase overrides */
const TWEAKS = {
  '1990|Pete Sampras': [92, 75, 88, 78, 80, 89, 82, 84],
  '1991|Pete Sampras': [93, 76, 89, 79, 82, 90, 82, 86],
  '1992|Pete Sampras': [94, 77, 90, 80, 83, 91, 84, 88],
  '1990|Andre Agassi': [82, 94, 93, 88, 70, 72, 86, 76],
  '1991|Andre Agassi': [82, 94, 93, 88, 70, 72, 86, 76],
  '1992|Andre Agassi': [82, 94, 93, 88, 70, 72, 86, 78],
  '1993|Andre Agassi': [82, 94, 93, 88, 70, 72, 86, 76],
  '1994|Andre Agassi': [83, 95, 92, 89, 71, 73, 86, 82],
  '1995|Andre Agassi': [83, 95, 92, 89, 71, 73, 86, 82],
  '1990|Goran Ivanisevic': [95, 71, 83, 77, 75, 87, 76, 68],
  '1991|Goran Ivanisevic': [95, 71, 83, 77, 75, 87, 76, 68],
  '1992|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 70],
  '1993|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 70],
  '1994|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 70],
  '1995|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 70],
  '1996|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 70],
  '1997|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 70],
  '1998|Goran Ivanisevic': [96, 72, 84, 78, 76, 88, 76, 72],
  '1990|Michael Chang': [74, 86, 82, 80, 68, 68, 92, 84],
  '1991|Michael Chang': [74, 86, 82, 80, 68, 68, 92, 84],
  '1992|Michael Chang': [76, 88, 84, 82, 70, 70, 94, 86],
  '1993|Michael Chang': [76, 88, 84, 82, 70, 70, 94, 86],
  '1994|Michael Chang': [76, 88, 84, 82, 70, 70, 94, 86],
  '1995|Michael Chang': [76, 88, 84, 82, 70, 70, 94, 86],
  '1996|Michael Chang': [76, 88, 84, 82, 70, 70, 94, 86],
  '1997|Michael Chang': [76, 88, 84, 82, 70, 70, 94, 86],
  '1998|Michael Chang': [75, 86, 83, 81, 70, 70, 92, 84],
  '1997|Gustavo Kuerten': [80, 76, 88, 90, 82, 76, 86, 86],
  '1998|Gustavo Kuerten': [80, 76, 88, 90, 82, 76, 86, 86],
  '1999|Gustavo Kuerten': [82, 79, 90, 92, 84, 78, 88, 89],
  '1998|Marcelo Rios': [78, 86, 92, 88, 86, 80, 90, 72],
  '1998|Petr Korda': [88, 82, 92, 88, 78, 82, 84, 76],
  '1999|Lleyton Hewitt': [75, 88, 82, 82, 76, 74, 91, 87],
  '1998|Marat Safin': [87, 80, 87, 87, 70, 74, 82, 70],
  '1999|Marat Safin': [87, 80, 87, 87, 70, 74, 82, 70],
  '1996|Jim Courier': [83, 82, 90, 82, 70, 72, 85, 84],
  '1997|Jim Courier': [83, 82, 90, 82, 70, 72, 85, 84],
  '1999|Jim Courier': [82, 81, 89, 81, 70, 72, 84, 83],
  '1995|Stefan Edberg': [85, 82, 78, 84, 82, 93, 86, 85],
  '1996|Stefan Edberg': [85, 82, 78, 84, 82, 93, 86, 85],
  '1992|Ivan Lendl': [86, 82, 89, 83, 76, 78, 80, 86],
  '1993|Ivan Lendl': [86, 82, 89, 83, 76, 78, 80, 86],
  '1994|Patrick Rafter': [83, 78, 80, 78, 82, 91, 86, 78],
};

/* slam champions per season */
const CHAMPS = {
  '1990|Ivan Lendl': ['AO'],
  '1990|Andres Gomez': ['RG'],
  '1990|Stefan Edberg': ['WB'],
  '1990|Pete Sampras': ['US'],
  '1991|Boris Becker': ['AO'],
  '1991|Jim Courier': ['RG'],
  '1991|Michael Stich': ['WB'],
  '1991|Stefan Edberg': ['US'],
  '1992|Jim Courier': ['AO', 'RG'],
  '1992|Andre Agassi': ['WB'],
  '1992|Stefan Edberg': ['US'],
  '1993|Jim Courier': ['AO'],
  '1993|Sergi Bruguera': ['RG'],
  '1993|Pete Sampras': ['WB', 'US'],
  '1994|Pete Sampras': ['AO', 'WB'],
  '1994|Sergi Bruguera': ['RG'],
  '1994|Andre Agassi': ['US'],
  '1995|Andre Agassi': ['AO'],
  '1995|Thomas Muster': ['RG'],
  '1995|Pete Sampras': ['WB', 'US'],
  '1996|Boris Becker': ['AO'],
  '1996|Yevgeny Kafelnikov': ['RG'],
  '1996|Richard Krajicek': ['WB'],
  '1996|Pete Sampras': ['US'],
  '1997|Pete Sampras': ['AO', 'WB'],
  '1997|Gustavo Kuerten': ['RG'],
  '1997|Patrick Rafter': ['US'],
  '1998|Petr Korda': ['AO'],
  '1998|Carlos Moya': ['RG'],
  '1998|Pete Sampras': ['WB'],
  '1998|Patrick Rafter': ['US'],
  '1999|Yevgeny Kafelnikov': ['AO'],
  '1999|Andre Agassi': ['RG', 'US'],
  '1999|Pete Sampras': ['WB'],
};

const HIGHLIGHTS = {
  '1990|Ivan Lendl': 'Campeão do Australian Open',
  '1990|Andres Gomez': 'Campeão de Roland Garros',
  '1990|Stefan Edberg': 'Campeão de Wimbledon, finalista do AO',
  '1990|Pete Sampras': 'Campeão do US Open',
  '1990|Andre Agassi': 'Finalista de RG e do US Open',
  '1990|Boris Becker': 'Finalista de Wimbledon',
  '1991|Boris Becker': 'Campeão do AO, finalista de WB',
  '1991|Jim Courier': 'Campeão de RG, finalista do US',
  '1991|Michael Stich': 'Campeão de Wimbledon',
  '1991|Stefan Edberg': 'Campeão do US Open',
  '1991|Andre Agassi': 'Finalista de Roland Garros',
  '1991|Ivan Lendl': 'Finalista do Australian Open',
  '1992|Jim Courier': 'Campeão do AO e de Roland Garros',
  '1992|Andre Agassi': 'Campeão de Wimbledon',
  '1992|Stefan Edberg': 'Campeão do US Open, finalista do AO',
  '1992|Goran Ivanisevic': 'Finalista de Wimbledon',
  '1992|Petr Korda': 'Finalista de Roland Garros',
  '1992|Pete Sampras': 'Finalista do US Open',
  '1992|Michael Chang': 'Semifinalista do US Open',
  '1993|Jim Courier': 'Campeão do AO, finalista de RG e WB',
  '1993|Sergi Bruguera': 'Campeão de Roland Garros',
  '1993|Pete Sampras': 'Campeão de WB e do US Open',
  '1993|Cedric Pioline': 'Finalista do US Open',
  '1993|Stefan Edberg': 'Finalista do Australian Open',
  '1994|Pete Sampras': 'Campeão do AO e de Wimbledon',
  '1994|Sergi Bruguera': 'Campeão de Roland Garros',
  '1994|Andre Agassi': 'Campeão do US Open',
  '1994|Todd Martin': 'Finalista do Australian Open',
  '1994|Alberto Berasategui': 'Finalista de Roland Garros',
  '1994|Goran Ivanisevic': 'Finalista de Wimbledon',
  '1994|Michael Stich': 'Finalista do US Open',
  '1995|Andre Agassi': 'Campeão do AO, finalista do US',
  '1995|Thomas Muster': 'Campeão de Roland Garros',
  '1995|Pete Sampras': 'Campeão de WB e do US, finalista do AO',
  '1995|Michael Chang': 'Finalista de Roland Garros',
  '1995|Boris Becker': 'Finalista de Wimbledon',
  '1996|Boris Becker': 'Campeão do Australian Open',
  '1996|Yevgeny Kafelnikov': 'Campeão de Roland Garros',
  '1996|Richard Krajicek': 'Campeão de Wimbledon',
  '1996|Pete Sampras': 'Campeão do US Open',
  '1996|Michael Chang': 'Finalista do AO e do US Open',
  '1996|Michael Stich': 'Finalista de Roland Garros',
  '1996|Malivai Washington': 'Finalista de Wimbledon',
  '1997|Pete Sampras': 'Campeão do AO e de Wimbledon',
  '1997|Gustavo Kuerten': 'Campeão de Roland Garros',
  '1997|Patrick Rafter': 'Campeão do US Open',
  '1997|Carlos Moya': 'Finalista do Australian Open',
  '1997|Sergi Bruguera': 'Finalista de Roland Garros',
  '1997|Cedric Pioline': 'Finalista de Wimbledon',
  '1997|Greg Rusedski': 'Finalista do US Open',
  '1997|Jonas Bjorkman': 'Semifinalista do US Open',
  '1998|Petr Korda': 'Campeão do Australian Open',
  '1998|Carlos Moya': 'Campeão de Roland Garros',
  '1998|Pete Sampras': 'Campeão de Wimbledon',
  '1998|Patrick Rafter': 'Campeão do US Open',
  '1998|Marcelo Rios': 'Finalista do Australian Open',
  '1998|Alex Corretja': 'Finalista de Roland Garros',
  '1998|Goran Ivanisevic': 'Finalista de Wimbledon',
  '1998|Mark Philippoussis': 'Finalista do US Open',
  '1998|Tim Henman': 'Semifinalista de Wimbledon',
  '1999|Yevgeny Kafelnikov': 'Campeão do Australian Open',
  '1999|Andre Agassi': 'Campeão de RG e do US, finalista de WB',
  '1999|Pete Sampras': 'Campeão de Wimbledon',
  '1999|Thomas Enqvist': 'Finalista do Australian Open',
  '1999|Andrei Medvedev': 'Finalista de Roland Garros',
  '1999|Todd Martin': 'Finalista do US Open',
};

const slug = (name) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim().replace(/ +/g, '-');

const allYears = JSON.parse(fs.readFileSync('public/data/years.json', 'utf8'));
const files = {};
const byNameYear = {};
for (const y of allYears) {
  files[y] = JSON.parse(fs.readFileSync(`public/data/${y}.json`, 'utf8'));
  for (const p of files[y].players) (byNameYear[p.name] ??= {})[y] = p;
}
for (const y of TARGET) files[y] ??= { year: y, players: [] };

const nearestEntry = (displayName, year) => {
  const m = byNameYear[displayName];
  if (!m) return null;
  const ys = Object.keys(m).map(Number).sort((a, b) => Math.abs(a - year) - Math.abs(b - year));
  return m[ys[0]] ?? null;
};

const missing = new Set();
for (const y of TARGET) {
  const official = ye[y]
    .map((s) => { const m = s.match(/^(\d+) (.+) ([A-Z]{3})$/); return { rank: +m[1], name: m[2], ioc: m[3] }; })
    .filter((r) => r.rank <= 50);
  const out = [];
  for (const r of official) {
    const display = DISPLAY[r.name] ?? r.name;
    const tweak = TWEAKS[`${y}|${r.name}`];
    const champs = CHAMPS[`${y}|${r.name}`] ?? null;
    const hl = HIGHLIGHTS[`${y}|${r.name}`] ?? null;
    let attrs, country = r.ioc;
    if (tweak) {
      attrs = Object.fromEntries(KEYS.map((k, i) => [k, tweak[i]]));
      if (PROFILES[r.name]) country = PROFILES[r.name][0];
    } else {
      const source = nearestEntry(display, y);
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
    }
    out.push({ id: slug(display), name: display, country, rank: r.rank, highlight: hl, champion: champs, attrs });
  }
  out.sort((a, b) => a.rank - b.rank);
  files[y].players = out;
  for (const p of out) (byNameYear[p.name] ??= {})[y] = p;
}

if (missing.size) {
  console.error('SEM PERFIL (autorar e rodar de novo):');
  for (const m of missing) console.error('  ' + m);
  process.exit(1);
}

for (const y of TARGET) {
  const body = files[y].players.map((p) => '    ' + JSON.stringify(p)).join(',\n');
  fs.writeFileSync(`public/data/${y}.json`, `{\n  "year": ${y},\n  "players": [\n${body}\n  ]\n}\n`);
  console.log(`${y}: ${files[y].players.length} jogadores`);
}
const years = [...new Set([...allYears, ...TARGET])].sort();
fs.writeFileSync('public/data/years.json', JSON.stringify(years) + '\n');
console.log('years.json: ' + years.length + ' temporadas (' + years[0] + '-' + years[years.length - 1] + ')');
