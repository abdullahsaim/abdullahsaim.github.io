/* Full country memberships checked against the official sources below on 2026-10-26.
   Regional bodies, observers, partners, and invited guests are not country members. */
const ATLAS_ORGANIZATIONS = [
  {
    id: 'un', short: 'UN', name: 'United Nations', checked: '2026-10-26',
    members: ATLAS_COUNTRIES.filter(country => !['VA', 'PS'].includes(country.id)).map(country => country.id),
    summary: '193 member states. The Holy See and State of Palestine are non-member observer states and are not highlighted as members.',
    source: 'https://www.un.org/en/about-us/member-states',
    observers: {VA: 'Non-member observer state: Holy See', PS: 'Non-member observer state: State of Palestine'},
    observerSource: 'https://research.un.org/en/unmembers/observers',
    bounds: [-180, 180, -60, 85]
  },
  {
    id: 'g20', short: 'G20', name: 'Group of Twenty', checked: '2026-10-26',
    members: 'AR AU BR CA CN FR DE IN ID IT JP KR MX RU SA ZA TR GB US'.split(' '),
    summary: 'The G20 has 19 country members plus the European Union and African Union. Only direct country membership is mapped; belonging to either regional body does not make a country a direct G20 member.',
    bodies: ['European Union', 'African Union'],
    source: 'https://www.dfat.gov.au/trade/organisations/g20',
    bounds: [-180, 180, -60, 85]
  },
  {
    id: 'sco', short: 'SCO', name: 'Shanghai Cooperation Organisation', checked: '2026-10-26',
    members: 'BY CN IN IR KZ KG PK RU TJ UZ'.split(' '),
    summary: '10 full member states. Observer states and dialogue partners are excluded from this membership map.',
    source: 'https://eng.sectsco.org/20170109/192193.html',
    bounds: [20, 180, 0, 82]
  },
  {
    id: 'eu', short: 'EU', name: 'European Union', checked: '2026-10-26',
    members: 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '),
    summary: '27 member countries. Candidate countries and former members are not included.',
    source: 'https://european-union.europa.eu/principles-countries-history/eu-countries_en',
    bounds: [-26, 42, 32, 73]
  },
  {
    id: 'nato', short: 'NATO', name: 'North Atlantic Treaty Organization', checked: '2026-10-26',
    members: 'AL BE BG CA HR CZ DK EE FI FR DE GR HU IS IT LV LT LU ME NL MK NO PL PT RO SK SI ES SE TR GB US'.split(' '),
    summary: '32 member countries, including Finland and Sweden. Partner countries are not members of the alliance.',
    source: 'https://www.nato.int/cps/en/natohq/nato_countries.htm',
    bounds: [-170, 50, 5, 82]
  },
  {
    id: 'asean', short: 'ASEAN', name: 'Association of Southeast Asian Nations', checked: '2026-10-26',
    members: 'BN KH ID LA MY MM PH SG TH TL VN'.split(' '),
    summary: '11 member states. Timor-Leste became the eleventh member on 26 October 2025.',
    source: 'https://asean.org/member-states/',
    extraSource: 'https://asean.org/forging-a-new-era-timor-leste-admitted-into-asean/',
    bounds: [90, 142, -13, 30]
  },
  {
    id: 'g7', short: 'G7', name: 'Group of Seven', checked: '2026-10-26',
    members: 'CA FR DE IT JP GB US'.split(' '),
    summary: 'The country list contains seven participants. The European Union also participates; invited summit guests are not added to the country list.',
    bodies: ['European Union'],
    source: 'https://www.international.gc.ca/world-monde/international_relations-relations_internationales/g7/index.aspx?lang=eng',
    bounds: [-180, 180, -5, 85]
  },
  {
    id: 'saarc', short: 'SAARC', name: 'South Asian Association for Regional Cooperation', checked: '2026-10-26',
    members: 'AF BD BT IN MV NP PK LK'.split(' '),
    summary: 'Eight member states. Observer countries and organizations are not included in the highlighted group.',
    source: 'https://www.saarc-sec.org/',
    bounds: [58, 100, -5, 39]
  }
];
