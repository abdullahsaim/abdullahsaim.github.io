/* Source years are deliberately visible: affiliation and legal status are distinct facts. */
window.AtlasDemographics = (() => {
  const sources = {
    population:'https://data.worldbank.org/indicator/SP.POP.TOTL',
    vatican:'https://www.vaticanstate.va/en/state-and-government/general-informations/population.html',
    religion:'https://www.pewresearch.org/religion/feature/religious-composition-by-country-2010-2020/',
    state:'https://www.pewresearch.org/religion/2017/10/03/many-countries-favor-specific-religions-officially-or-unofficially/'
  };
  function majority(religion) {
    if (!religion) return {value:'Not available',note:'Not covered by this dataset.'};
    const largest = religion.groups[0], percentage = largest.share.toLocaleString(undefined,{maximumFractionDigits:1})+'%';
    if (largest.name === 'Religiously unaffiliated') return {
      value:'No religious majority',
      note:largest.name+' is the largest affiliation category ('+percentage+'). Unaffiliated does not mean atheist.'
    };
    if (largest.share > 50 && largest.name !== 'Other religions (combined)') return {value:largest.name+' · '+percentage,note:'More than half identify with this broad religious group.'};
    return {value:'No religious majority',note:'Largest category: '+largest.name+' ('+percentage+'). No single religious group exceeds 50% in these rounded estimates.'};
  }
  function stateLabel(record) {
    if (!record) return {value:'Not available',note:'Not classified in the historical dataset.'};
    if (record.category === 'official') return {value:record.religion,note:'Classified as an official state religion in 2015.'};
    if (record.category === 'favored') return {value:'No official state religion',note:'Government-favored: '+record.religion+'. Preferential treatment is distinct from official status.'};
    if (record.category === 'hostile') return {value:'No official state religion',note:'The source classifies the government relationship with religious institutions as hostile in 2015.'};
    return {value:'No official state religion',note:'No official or preferred religion in the 2015 classification.'};
  }
  function node(tag,text,className) {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  function fact(label,value,note,source,sourceLabel) {
    const row=node('div',undefined,'demographic-fact');
    row.append(node('span',label,'fact-label'),node('strong',value),node('p',note));
    const link=node('a',sourceLabel+' ↗');link.href=source;row.append(link);return row;
  }
  function render(id) {
    const data=ATLAS_DEMOGRAPHICS[id] || {}, population=data.population;
    const religious=majority(data.religion), state=stateLabel(data.stateReligion);
    const container=document.getElementById('profile-demographics');
    const heading=node('div',undefined,'demographic-heading');heading.append(node('span','PEOPLE & BELIEFS','fact-label'),node('span','Dated source snapshots'));
    const pop=fact('POPULATION',population ? population.value.toLocaleString() : 'Not available',population ? (population.source==='vatican'?'Residents at 31 December 2024.':'Total population estimate · '+population.year+'.') : 'No estimate in this snapshot.',sources[population?.source==='vatican'?'vatican':'population'],population?.source==='vatican'?'Vatican City State · 2024':'World Bank · '+(population?.year || 'population'));
    const religion=fact('MAJORITY RELIGION · 2020',religious.value,religious.note,sources.religion,'Pew · 2020 estimates');
    const legal=fact('STATE RELIGION · 2015 SNAPSHOT',state.value,state.note,sources.state,'Pew · historical classification');
    container.replaceChildren(heading,pop,religion,legal);
    if(data.religion) {
      const details=node('details',undefined,'religion-breakdown');details.append(node('summary','Religious affiliation breakdown · 2020'));
      const list=node('dl');
      for(const group of data.religion.groups) {
        const row=node('div'),value=group.share===0?'<0.1%':group.share.toLocaleString(undefined,{maximumFractionDigits:1})+'%';
        row.append(node('dt',group.name),node('dd',value));list.append(row);
      }
      details.append(list,node('p','Broad affiliation categories, not individual beliefs or observance. Rounded estimates may not total 100%. Values rounded to zero are shown as <0.1%.'));container.append(details);
    }
    container.append(node('p','Population, affiliation, and state status refer to different years. State-religion classifications are historical and may have changed; they are not a statement of current law.','demographic-caveat'));
  }
  return {render,majority,stateLabel};
})();
