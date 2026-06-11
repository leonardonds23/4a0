/**
 * Batch 2: expands 2011-2025 to the official year-end top 50 (same pipeline as
 * scripts/expand-data.mjs). Creates the 9 missing season files (2012, 2013, 2015,
 * 2017, 2018, 2020, 2021, 2023, 2025) and deepens the 6 prototype seasons.
 * Note: 2020 has no Wimbledon champion (tournament cancelled - COVID).
 */
import fs from 'node:fs';

const TARGET = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const KEYS = ['sv', 'rt', 'fh', 'bh', 'sl', 'vl', 'mv', 'mn'];
const ye = JSON.parse(fs.readFileSync('/tmp/ye_rankings.json', 'utf8'));

const DISPLAY = {
  'Juan Martin del Potro': 'Juan M. del Potro',
  'Alex De Minaur': 'Alex de Minaur',
  'Felix Auger Aliassime': 'Felix Auger-Aliassime',
  'Botic Van De Zandschulp': 'Botic van de Zandschulp',
  'Mackenzie Mcdonald': 'Mackenzie McDonald',
  'Guillermo Garcia Lopez': 'Guillermo Garcia-Lopez',
  'Yen Hsun Lu': 'Yen-Hsun Lu',
};

/* curated attrs [sv,rt,fh,bh,sl,vl,mv,mn] for players with no entry in any year */
const PROFILES = {
  'Kevin Anderson': ['RSA', 93, 76, 89, 82, 72, 80, 76, 76],
  'Alex Bogomolov Jr': ['RUS', 76, 80, 80, 78, 68, 68, 80, 68],
  'Ivan Dodig': ['CRO', 80, 78, 82, 78, 72, 78, 82, 72],
  'Donald Young': ['USA', 74, 80, 80, 78, 70, 72, 84, 66],
  'Bernard Tomic': ['AUS', 82, 78, 82, 80, 84, 76, 78, 64],
  'Robin Haase': ['NED', 82, 76, 84, 80, 72, 74, 82, 66],
  'Pablo Andujar': ['ESP', 70, 78, 82, 76, 66, 64, 86, 72],
  'Fabio Fognini': ['ITA', 76, 84, 88, 84, 78, 76, 88, 66],
  'Jerzy Janowicz': ['POL', 93, 72, 84, 78, 74, 80, 76, 68],
  'Martin Klizan': ['SVK', 78, 76, 86, 78, 68, 68, 82, 68],
  'Benoit Paire': ['FRA', 82, 78, 80, 88, 84, 80, 82, 60],
  'David Goffin': ['BEL', 76, 86, 86, 86, 76, 74, 90, 76],
  'Marinko Matosevic': ['AUS', 78, 76, 82, 78, 68, 70, 80, 64],
  'Albert Ramos': ['ESP', 72, 78, 84, 78, 68, 66, 86, 72],
  'Vasek Pospisil': ['CAN', 86, 74, 82, 78, 74, 82, 78, 68],
  'Carlos Berlocq': ['ARG', 70, 78, 82, 76, 66, 64, 88, 74],
  'Lukas Rosol': ['CZE', 86, 72, 84, 78, 68, 72, 78, 66],
  'Joao Sousa': ['POR', 74, 80, 82, 80, 70, 70, 86, 72],
  'Lukas Lacko': ['SVK', 78, 76, 80, 78, 68, 70, 80, 66],
  'Leonardo Mayer': ['ARG', 84, 74, 88, 78, 70, 72, 80, 68],
  'Santiago Giraldo': ['COL', 76, 74, 86, 76, 66, 66, 84, 66],
  'Steve Johnson': ['USA', 86, 72, 84, 74, 74, 80, 78, 72],
  'Jack Sock': ['USA', 86, 72, 92, 72, 70, 78, 80, 68],
  'Adrian Mannarino': ['FRA', 76, 82, 78, 82, 76, 72, 84, 70],
  'Gilles Muller': ['LUX', 90, 70, 78, 74, 78, 88, 74, 72],
  'Pablo Carreno Busta': ['ESP', 78, 82, 86, 84, 72, 72, 86, 76],
  'Lucas Pouille': ['FRA', 84, 78, 86, 82, 74, 78, 82, 70],
  'Mischa Zverev': ['GER', 76, 74, 72, 72, 80, 90, 78, 68],
  'Diego Schwartzman': ['ARG', 66, 90, 84, 84, 72, 68, 92, 78],
  'Kyle Edmund': ['GBR', 84, 76, 90, 76, 68, 70, 80, 68],
  'Andrey Kuznetsov': ['RUS', 78, 78, 82, 78, 70, 70, 82, 66],
  'Paolo Lorenzi': ['ITA', 70, 78, 82, 78, 70, 68, 86, 74],
  'Federico Delbonis': ['ARG', 78, 74, 84, 76, 66, 66, 84, 68],
  'Borna Coric': ['CRO', 80, 86, 84, 84, 70, 70, 90, 76],
  'Hyeon Chung': ['KOR', 78, 86, 86, 86, 70, 70, 90, 76],
  'Aljaz Bedene': ['SLO', 78, 78, 84, 80, 70, 70, 82, 68],
  'Teymuraz Gabashvili': ['RUS', 78, 76, 84, 78, 68, 68, 80, 62],
  'Jiri Vesely': ['CZE', 86, 74, 84, 78, 70, 74, 78, 66],
  'Damir Dzumhur': ['BIH', 70, 82, 80, 80, 70, 70, 88, 70],
  'Filip Krajinovic': ['SRB', 78, 82, 84, 84, 72, 70, 84, 70],
  'Yuichi Sugita': ['JPN', 76, 78, 82, 78, 72, 74, 82, 70],
  'Karen Khachanov': ['RUS', 88, 80, 88, 84, 70, 74, 84, 76],
  'Ryan Harrison': ['USA', 84, 74, 82, 76, 70, 76, 78, 64],
  'Denis Shapovalov': ['CAN', 87, 76, 88, 84, 76, 80, 84, 66],
  'Marco Cecchinato': ['ITA', 72, 74, 84, 82, 76, 68, 84, 66],
  'Nikoloz Basilashvili': ['GEO', 84, 72, 90, 80, 64, 66, 80, 62],
  'Marton Fucsovics': ['HUN', 80, 80, 84, 82, 72, 72, 86, 72],
  'John Millman': ['AUS', 74, 84, 80, 80, 70, 70, 88, 76],
  'Nicolas Jarry': ['CHI', 90, 72, 88, 78, 68, 74, 78, 66],
  'Malek Jaziri': ['TUN', 76, 76, 82, 78, 72, 72, 82, 68],
  'Matthew Ebden': ['AUS', 78, 76, 80, 78, 76, 80, 80, 70],
  'Dusan Lajovic': ['SRB', 74, 80, 84, 80, 72, 70, 86, 70],
  'Guido Pella': ['ARG', 74, 80, 82, 80, 72, 70, 84, 72],
  'Jan Lennard Struff': ['GER', 88, 74, 84, 80, 70, 78, 78, 64],
  'Reilly Opelka': ['USA', 96, 66, 82, 72, 68, 78, 66, 72],
  'Hubert Hurkacz': ['POL', 92, 76, 86, 80, 72, 80, 80, 72],
  'Laslo Djere': ['SRB', 74, 78, 84, 80, 68, 66, 86, 72],
  'Daniel Evans': ['GBR', 76, 82, 80, 82, 86, 80, 84, 72],
  'Radu Albot': ['MDA', 70, 82, 78, 80, 70, 70, 86, 72],
  'Juan Ignacio Londero': ['ARG', 74, 76, 84, 78, 68, 66, 84, 68],
  'Lorenzo Sonego': ['ITA', 84, 76, 86, 78, 74, 74, 84, 72],
  'Ugo Humbert': ['FRA', 86, 78, 86, 82, 74, 76, 84, 72],
  'Cristian Garin': ['CHI', 78, 78, 86, 80, 68, 66, 86, 70],
  'Miomir Kecmanovic': ['SRB', 76, 82, 84, 82, 70, 70, 86, 70],
  'Alexander Bublik': ['KAZ', 90, 70, 84, 76, 82, 80, 76, 60],
  'Tennys Sandgren': ['USA', 80, 76, 84, 78, 70, 72, 80, 68],
  'Jordan Thompson': ['AUS', 78, 78, 80, 80, 74, 78, 84, 72],
  'Alejandro Davidovich Fokina': ['ESP', 78, 80, 86, 82, 76, 76, 90, 66],
  'Cameron Norrie': ['GBR', 78, 84, 84, 82, 70, 70, 90, 78],
  'Aslan Karatsev': ['RUS', 84, 76, 90, 84, 68, 70, 80, 68],
  'Lloyd Harris': ['RSA', 88, 74, 86, 78, 70, 74, 78, 66],
  'Sebastian Korda': ['USA', 84, 80, 88, 86, 74, 76, 82, 70],
  'Tommy Paul': ['USA', 82, 82, 86, 80, 76, 76, 90, 76],
  'Ilya Ivashka': ['BLR', 84, 74, 84, 78, 70, 72, 78, 66],
  'James Duckworth': ['AUS', 80, 74, 80, 76, 72, 76, 80, 68],
  'Holger Rune': ['DEN', 86, 84, 88, 86, 74, 76, 90, 74],
  'Francisco Cerundolo': ['ARG', 78, 78, 88, 80, 68, 68, 86, 70],
  'Maxime Cressy': ['USA', 90, 66, 76, 70, 76, 90, 70, 66],
  'Botic Van De Zandschulp': ['NED', 82, 78, 84, 82, 72, 74, 82, 68],
  'Yoshihito Nishioka': ['JPN', 68, 86, 80, 80, 72, 70, 90, 72],
  'Emil Ruusuvuori': ['FIN', 80, 80, 84, 82, 70, 70, 84, 66],
  'Jack Draper': ['GBR', 88, 80, 88, 82, 76, 78, 84, 76],
  'Sebastian Baez': ['ARG', 70, 80, 86, 78, 66, 64, 88, 72],
  'Arthur Rinderknech': ['FRA', 88, 72, 82, 76, 70, 78, 76, 68],
  'Brandon Nakashima': ['USA', 82, 80, 84, 84, 72, 74, 82, 74],
  'Jenson Brooksby': ['USA', 74, 84, 80, 84, 76, 72, 86, 72],
  'Alex Molcan': ['SVK', 76, 78, 84, 80, 68, 68, 84, 66],
  'Corentin Moutet': ['FRA', 70, 80, 82, 82, 84, 78, 86, 64],
  'Ben Shelton': ['USA', 93, 74, 88, 78, 72, 80, 82, 76],
  'Tallon Griekspoor': ['NED', 86, 76, 86, 80, 72, 74, 82, 70],
  'Tomas Martin Etcheverry': ['ARG', 80, 76, 86, 78, 68, 66, 86, 70],
  'Jiri Lehecka': ['CZE', 86, 78, 86, 82, 70, 72, 82, 72],
  'Christopher Eubanks': ['USA', 90, 68, 84, 74, 70, 80, 72, 66],
  'Arthur Fils': ['FRA', 88, 78, 88, 82, 72, 74, 86, 72],
  'Roman Safiullin': ['RUS', 84, 76, 84, 80, 70, 72, 80, 68],
  'Alexei Popyrin': ['AUS', 88, 74, 86, 78, 70, 74, 80, 68],
  'Mackenzie Mcdonald': ['USA', 76, 82, 82, 82, 70, 72, 86, 68],
  'Sebastian Ofner': ['AUT', 80, 76, 84, 80, 72, 72, 82, 68],
  'Matteo Arnaldi': ['ITA', 78, 80, 84, 80, 70, 72, 86, 70],
  'Max Purcell': ['AUS', 82, 76, 80, 78, 78, 86, 80, 70],
  'Alexander Shevchenko': ['KAZ', 80, 76, 84, 78, 68, 68, 82, 64],
  'Yannick Hanfmann': ['GER', 82, 74, 84, 78, 70, 72, 80, 66],
  'Alejandro Tabilo': ['CHI', 84, 78, 84, 80, 72, 74, 84, 70],
  'Tomas Machac': ['CZE', 84, 80, 86, 82, 74, 76, 88, 70],
  'Giovanni Mpetshi Perricard': ['FRA', 96, 66, 84, 74, 68, 78, 70, 66],
  'Flavio Cobolli': ['ITA', 80, 80, 86, 80, 70, 70, 86, 72],
  'Nuno Borges': ['POR', 78, 80, 84, 82, 72, 74, 84, 70],
  'Alex Michelsen': ['USA', 84, 80, 84, 84, 72, 74, 82, 70],
  'Zhizhen Zhang': ['CHN', 86, 76, 86, 80, 70, 74, 80, 68],
  'Marcos Giron': ['USA', 76, 82, 82, 80, 70, 72, 86, 70],
  'Mariano Navone': ['ARG', 72, 78, 84, 78, 66, 64, 88, 70],
  'Jakub Mensik': ['CZE', 92, 76, 86, 82, 68, 74, 80, 74],
  'Juncheng Shang': ['CHN', 78, 80, 84, 80, 72, 72, 86, 70],
  'Pedro Martinez': ['ESP', 70, 80, 82, 80, 72, 68, 86, 72],
  'Luciano Darderi': ['ITA', 80, 76, 86, 78, 68, 66, 86, 72],
  'Joao Fonseca': ['BRA', 86, 80, 92, 84, 72, 74, 86, 80],
  'Learner Tien': ['USA', 74, 84, 82, 84, 74, 72, 86, 76],
  'Valentin Vacherot': ['MON', 82, 78, 84, 80, 72, 76, 82, 76],
  'Gabriel Diallo': ['CAN', 90, 72, 84, 76, 68, 76, 76, 68],
  'Zizou Bergs': ['BEL', 82, 76, 84, 78, 70, 74, 84, 70],
  'Alexandre Muller': ['FRA', 78, 78, 82, 78, 70, 70, 86, 70],
  'Daniel Altmaier': ['GER', 78, 76, 84, 80, 72, 70, 84, 70],
  'Camilo Ugo Carabelli': ['ARG', 68, 78, 82, 78, 66, 64, 88, 70],
  'Jaume Munar': ['ESP', 74, 80, 84, 80, 70, 68, 88, 74],
};

/* career-phase attr overrides (year differs too much from nearest curated entry) */
const TWEAKS = {
  '2011|Stan Wawrinka': [85, 79, 89, 93, 77, 76, 84, 77],
  '2012|Stan Wawrinka': [85, 79, 89, 93, 77, 76, 84, 77],
  '2013|Stan Wawrinka': [87, 80, 90, 95, 78, 77, 84, 82],
  '2023|Stan Wawrinka': [86, 79, 88, 92, 77, 76, 80, 84],
  '2012|Andy Murray': [86, 93, 87, 90, 88, 84, 93, 86],
  '2013|Andy Murray': [86, 93, 87, 90, 88, 84, 93, 86],
  '2017|Andy Murray': [85, 91, 85, 89, 87, 83, 90, 84],
  '2022|Andy Murray': [84, 86, 82, 85, 84, 82, 84, 86],
  '2023|Andy Murray': [84, 86, 82, 85, 84, 82, 84, 86],
  '2013|Roger Federer': [90, 85, 92, 85, 92, 90, 88, 89],
  '2017|Roger Federer': [92, 87, 94, 92, 94, 93, 90, 94],
  '2018|Roger Federer': [92, 87, 94, 90, 94, 93, 90, 92],
  '2020|Roger Federer': [90, 85, 92, 86, 92, 91, 87, 90],
  '2021|Roger Federer': [88, 83, 90, 84, 90, 89, 84, 88],
  '2015|Rafael Nadal': [84, 89, 93, 86, 76, 81, 94, 92],
  '2017|Novak Djokovic': [86, 93, 90, 93, 82, 80, 93, 88],
  '2025|Novak Djokovic': [86, 93, 89, 92, 84, 82, 88, 94],
  '2018|Juan Martin del Potro': [90, 83, 97, 84, 72, 76, 82, 87],
  '2020|Jannik Sinner': [84, 86, 90, 87, 72, 74, 88, 82],
  '2021|Jannik Sinner': [86, 88, 91, 89, 73, 75, 89, 84],
  '2023|Jannik Sinner': [88, 91, 93, 92, 76, 78, 93, 90],
  '2021|Carlos Alcaraz': [83, 85, 90, 84, 80, 84, 93, 84],
  '2014|Dominic Thiem': [84, 78, 88, 85, 74, 72, 86, 76],
  '2015|Dominic Thiem': [84, 78, 88, 85, 74, 72, 86, 76],
  '2020|Dominic Thiem': [90, 83, 94, 90, 78, 76, 90, 87],
  '2014|Lleyton Hewitt': [76, 87, 82, 82, 78, 76, 87, 87],
  '2016|David Ferrer': [73, 89, 84, 84, 73, 71, 93, 84],
  '2017|David Ferrer': [73, 89, 84, 84, 73, 71, 93, 84],
};

/* slam champions of each new season (existing seasons already carry theirs) */
const CHAMPS = {
  '2012|Novak Djokovic': ['AO'],
  '2012|Rafael Nadal': ['RG'],
  '2012|Roger Federer': ['WB'],
  '2012|Andy Murray': ['US'],
  '2013|Novak Djokovic': ['AO'],
  '2013|Rafael Nadal': ['RG', 'US'],
  '2013|Andy Murray': ['WB'],
  '2015|Novak Djokovic': ['AO', 'WB', 'US'],
  '2015|Stan Wawrinka': ['RG'],
  '2017|Roger Federer': ['AO', 'WB'],
  '2017|Rafael Nadal': ['RG', 'US'],
  '2018|Roger Federer': ['AO'],
  '2018|Rafael Nadal': ['RG'],
  '2018|Novak Djokovic': ['WB', 'US'],
  '2020|Novak Djokovic': ['AO'],
  '2020|Rafael Nadal': ['RG'],
  '2020|Dominic Thiem': ['US'],
  '2021|Novak Djokovic': ['AO', 'RG', 'WB'],
  '2021|Daniil Medvedev': ['US'],
  '2023|Novak Djokovic': ['AO', 'RG', 'US'],
  '2023|Carlos Alcaraz': ['WB'],
  '2025|Jannik Sinner': ['AO', 'WB'],
  '2025|Carlos Alcaraz': ['RG', 'US'],
};

const HIGHLIGHTS = {
  '2011|David Ferrer': 'Semifinalista do Australian Open',
  '2012|Novak Djokovic': 'Campeão do AO, finalista de RG e do US',
  '2012|Rafael Nadal': 'Campeão de RG, finalista do AO',
  '2012|Roger Federer': 'Campeão de Wimbledon',
  '2012|Andy Murray': 'Campeão do US Open · ouro olímpico',
  '2012|David Ferrer': 'Semifinalista do US Open',
  '2012|Jo-Wilfried Tsonga': 'Semifinalista de Wimbledon',
  '2012|Tomas Berdych': 'Semifinalista do US Open',
  '2012|Juan Martin del Potro': 'Bronze olímpico em Londres',
  '2013|Rafael Nadal': 'Campeão de RG e do US Open',
  '2013|Novak Djokovic': 'Campeão do AO, finalista de WB e do US',
  '2013|Andy Murray': 'Campeão de Wimbledon, finalista do AO',
  '2013|David Ferrer': 'Finalista de Roland Garros',
  '2013|Stan Wawrinka': 'Semifinalista do US Open',
  '2013|Jerzy Janowicz': 'Semifinalista de Wimbledon',
  '2013|Juan Martin del Potro': 'Semifinalista de Wimbledon',
  '2015|Novak Djokovic': 'Campeão do AO, WB e US',
  '2015|Stan Wawrinka': 'Campeão de Roland Garros',
  '2015|Roger Federer': 'Finalista de WB e do US Open',
  '2015|Andy Murray': 'Finalista do Australian Open',
  '2015|Richard Gasquet': 'Semifinalista de Wimbledon',
  '2015|Marin Cilic': 'Semifinalista do US Open',
  '2017|Roger Federer': 'Campeão do AO e de Wimbledon',
  '2017|Rafael Nadal': 'Campeão de RG e do US Open',
  '2017|Stan Wawrinka': 'Finalista de Roland Garros',
  '2017|Marin Cilic': 'Finalista de Wimbledon',
  '2017|Kevin Anderson': 'Finalista do US Open',
  '2017|Dominic Thiem': 'Semifinalista de Roland Garros',
  '2017|Sam Querrey': 'Semifinalista de Wimbledon',
  '2017|Pablo Carreno Busta': 'Semifinalista do US Open',
  '2017|Grigor Dimitrov': 'Semifinalista do Australian Open',
  '2018|Roger Federer': 'Campeão do Australian Open',
  '2018|Rafael Nadal': 'Campeão de Roland Garros',
  '2018|Novak Djokovic': 'Campeão de WB e do US Open',
  '2018|Marin Cilic': 'Finalista do Australian Open',
  '2018|Dominic Thiem': 'Finalista de Roland Garros',
  '2018|Kevin Anderson': 'Finalista de Wimbledon',
  '2018|Juan Martin del Potro': 'Finalista do US Open',
  '2018|Marco Cecchinato': 'Semifinalista de Roland Garros',
  '2018|John Isner': 'Semifinalista de Wimbledon',
  '2018|Kyle Edmund': 'Semifinalista do Australian Open',
  '2018|Hyeon Chung': 'Semifinalista do Australian Open',
  '2020|Novak Djokovic': 'Campeão do AO, finalista de RG',
  '2020|Rafael Nadal': 'Campeão de Roland Garros',
  '2020|Dominic Thiem': 'Campeão do US Open, finalista do AO',
  '2020|Alexander Zverev': 'Finalista do US Open',
  '2020|Diego Schwartzman': 'Semifinalista de Roland Garros',
  '2020|Daniil Medvedev': 'Semifinalista do US Open',
  '2021|Novak Djokovic': 'Campeão do AO, RG e WB',
  '2021|Daniil Medvedev': 'Campeão do US Open, finalista do AO',
  '2021|Stefanos Tsitsipas': 'Finalista de Roland Garros',
  '2021|Matteo Berrettini': 'Finalista de Wimbledon',
  '2021|Alexander Zverev': 'Ouro olímpico em Tóquio',
  '2021|Aslan Karatsev': 'Semifinalista do Australian Open',
  '2021|Hubert Hurkacz': 'Semifinalista de Wimbledon',
  '2021|Denis Shapovalov': 'Semifinalista de Wimbledon',
  '2022|Stefanos Tsitsipas': 'Semifinalista do Australian Open',
  '2022|Matteo Berrettini': 'Semifinalista do Australian Open',
  '2023|Novak Djokovic': 'Campeão do AO, RG e US',
  '2023|Carlos Alcaraz': 'Campeão de Wimbledon',
  '2023|Stefanos Tsitsipas': 'Finalista do Australian Open',
  '2023|Casper Ruud': 'Finalista de Roland Garros',
  '2023|Daniil Medvedev': 'Finalista do US Open',
  '2023|Karen Khachanov': 'Semifinalista do Australian Open',
  '2023|Ben Shelton': 'Semifinalista do US Open',
  '2023|Jannik Sinner': 'Semifinalista de Wimbledon',
  '2024|Daniil Medvedev': 'Finalista do Australian Open',
  '2024|Jack Draper': 'Semifinalista do US Open',
  '2025|Jannik Sinner': 'Campeão do AO e de Wimbledon',
  '2025|Carlos Alcaraz': 'Campeão de RG e do US Open',
  '2025|Alexander Zverev': 'Finalista do Australian Open',
  '2025|Novak Djokovic': 'Semifinalista dos 4 Slams',
  '2025|Lorenzo Musetti': 'Semifinalista de Roland Garros',
  '2025|Taylor Fritz': 'Semifinalista de Wimbledon',
  '2025|Felix Auger Aliassime': 'Semifinalista do US Open',
  '2025|Ben Shelton': 'Semifinalista do Australian Open',
};

const slug = (name) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim().replace(/ +/g, '-');

/* index every curated entry across ALL existing season files */
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
  const officialNames = new Set();
  const out = [];

  for (const r of official) {
    const display = DISPLAY[r.name] ?? r.name;
    officialNames.add(display);
    const tweak = TWEAKS[`${y}|${r.name}`];
    const champs = CHAMPS[`${y}|${r.name}`] ?? null;
    const hl = HIGHLIGHTS[`${y}|${r.name}`] ?? null;
    const existing = files[y].players.find((p) => p.name === display);
    if (existing) {
      existing.rank = r.rank;
      if (tweak) existing.attrs = Object.fromEntries(KEYS.map((k, i) => [k, tweak[i]]));
      if (hl && !existing.highlight) existing.highlight = hl;
      out.push(existing);
      continue;
    }
    let attrs, country = r.ioc;
    if (tweak) {
      attrs = Object.fromEntries(KEYS.map((k, i) => [k, tweak[i]]));
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

  for (const p of files[y].players) if (!officialNames.has(p.name)) out.push(p);
  out.sort((a, b) => a.rank - b.rank);
  files[y].players = out;
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
console.log('years.json: ' + years.join(','));
