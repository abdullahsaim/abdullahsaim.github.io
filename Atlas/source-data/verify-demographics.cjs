const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'..'), context=vm.createContext({window:{}});
for(const file of ['data.js','demographics.js','demographics-ui.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
vm.runInContext('this.data=ATLAS_DEMOGRAPHICS;this.countries=ATLAS_COUNTRIES',context);
const {majority,stateLabel}=context.window.AtlasDemographics;
assert.equal(Object.keys(context.data).length,195);
for(const country of context.countries){
  const d=context.data[country.id];assert.ok(d);assert.ok(d.population.value>0);assert.equal(d.population.year,2024);
  if(d.religion){assert.equal(d.religion.year,2020);assert.equal(d.religion.groups.length,7);assert.ok(d.religion.groups.every(g=>g.share>=0&&g.share<=100));assert.ok(Math.abs(d.religion.groups.reduce((n,g)=>n+g.share,0)-100)<0.5);}
  if(d.stateReligion)assert.equal(d.stateReligion.year,2015);
}
assert.match(majority(context.data.PK.religion).value,/Islam/);
assert.equal(majority(context.data.GB.religion).value,'No religious majority');
assert.equal(majority(context.data.CN.religion).value,'No religious majority');
assert.match(majority(context.data.CN.religion).note,/unaffiliated/i);
assert.equal(majority({groups:[{name:'Christianity',share:50}]}).value,'No religious majority');
assert.equal(majority().value,'Not available');
assert.equal(stateLabel(context.data.PK.stateReligion).value,'Islam');
assert.equal(stateLabel(context.data.IN.stateReligion).value,'No official state religion');
assert.equal(stateLabel(context.data.TR.stateReligion).value,'No official state religion');
assert.match(stateLabel(context.data.TR.stateReligion).note,/favored/);
assert.equal(stateLabel(context.data.VA.stateReligion).value,'Not available');
for(const file of ['app.js','map-layers.js','demographics-ui.js','demographics.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
console.log('195 population profiles, source coverage, rounding, majority/plurality, missing data, state-status separation and script syntax passed.');
