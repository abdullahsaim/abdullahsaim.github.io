// Regenerate the profile snapshot from the cited, dated source extracts.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + ';this.countries=ATLAS_COUNTRIES', context);
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const population = read('population.json')[1], shares = read('religious-shares.json');
const aliases = {
  'Burma (Myanmar)': 'MM', Burma: 'MM', 'Cape Verde': 'CV', 'Ivory Coast': 'CI',
  'Czech Republic': 'CZ', 'Democratic Republic of the Congo': 'CD', 'Republic of the Congo': 'CG',
  'Congo DR': 'CD', 'Congo': 'CG', 'Republic of Macedonia': 'MK', 'Macedonia': 'MK',
  'Palestinian territories': 'PS', 'Bosnia-Herzegovina': 'BA', 'Swaziland': 'SZ',
  'Federated States of Micronesia': 'FM', 'Micronesia': 'FM',
  'St. Kitts and Nevis': 'KN', 'St. Lucia': 'LC', 'St. Vincent and the Grenadines': 'VC',
  'United States': 'US', 'East Timor': 'TL', Turkey: 'TR'
};
const normalize = name => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const countryId = name => aliases[name] || context.countries.find(c => normalize(c.name) === normalize(name) || normalize(c.official) === normalize(name))?.id;
const religions = ['Christians','Muslims','Unaffiliated','Buddhists','Hindus','Jews','Other religions'];
const names = {Christians:'Christianity',Muslims:'Islam',Unaffiliated:'Religiously unaffiliated',Buddhists:'Buddhism',Hindus:'Hinduism',Jews:'Judaism','Other religions':'Other religions (combined)'};
const result = Object.fromEntries(context.countries.map(c => [c.id, {}]));
for (const row of population) if (result[row.country.id] && Number.isFinite(row.value)) result[row.country.id].population = {value:row.value,year:Number(row.date)};
result.VA.population = {value:882,year:2024,source:'vatican'};
for (const row of shares) {
  const id = countryId(row.Country); if (!id) continue;
  const sorted = religions.map(key => ({name:names[key],share:row[key]})).sort((a,b) => b.share-a.share);
  result[id].religion = {year:2020,groups:sorted};
}
let category;
const classifications = {official:0,favored:0,none:0,hostile:0};
for (const raw of fs.readFileSync(path.join(__dirname, 'state-religion.txt'),'utf8').split(/\r?\n/)) {
  const line = raw.trim();
  if (line.startsWith('Official state religion (')) {category='official';continue;}
  if (line.startsWith('Preferred or favored state religions (')) {category='favored';continue;}
  if (line.startsWith('No official or preferred religion (')) {category='none';continue;}
  if (line.startsWith('Hostile relationship w/religious institutions (')) {category='hostile';continue;}
  let name=line, religion=null;
  if (['official','favored'].includes(category)) {
    const match = line.match(/^(.*?) (Islam|Christianity|Buddhism|Judaism|Multiple religions)$/);
    if (!match) continue;
    [,name,religion]=match;
  }
  const id=countryId(name); if (!category || !id) continue;
  if (result[id].stateReligion) throw Error('Duplicate classification: '+id);
  result[id].stateReligion={category,religion,year:2015}; classifications[category]++;
}
fs.writeFileSync(path.join(root,'demographics.js'), '/* Dated World Bank and Pew Research Center extracts; see SOURCES.md. */\nconst ATLAS_DEMOGRAPHICS='+JSON.stringify(result)+';\n');
for (const key of ['population','religion','stateReligion']) console.log(key+': '+Object.values(result).filter(x=>x[key]).length+' / '+context.countries.length, 'Missing: '+context.countries.filter(c=>!result[c.id][key]).map(c=>c.name).join(', '));
console.log('State classifications:', classifications);
console.log('Unmatched religious shares:',shares.filter(row=>!countryId(row.Country)).map(row=>row.Country).join(', '));
