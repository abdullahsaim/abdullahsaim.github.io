/* Map scope and membership views. Quizzes always use the unfiltered base geography. */
window.AtlasLayers = (() => {
  const groups = new Map(ATLAS_ORGANIZATIONS.map(group => [group.id, group]));
  const regions = {
    Africa: [-20, 56, -37, 39], Asia: [25, 180, -13, 82],
    Europe: [-26, 60, 33, 76], 'North America': [-170, -48, 5, 82],
    'South America': [-84, -32, -58, 15], Oceania: [108, 212, -51, 27]
  };
  const originalPaths = new Map(ATLAS_SHAPES.map(shape => [shape.id, shape.d]));
  let organization = 'All', worldContext = false, initialized = false, flightTimer;
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  function matches(country) { return organization === 'All' || groups.get(organization)?.members.includes(country.id) === true; }
  function visibleCountries() { return all.filter(country => (state.region === 'All' || country.region === state.region) && matches(country)); }
  function syncControls() {
    $('map-region').value = state.region; $('map-organization').value = organization;
    document.querySelectorAll('.region-filter').forEach(button => {
      const selected = button.dataset.region === state.region;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
    });
  }
  function wrappedPath(path) {
    return path.replace(/([ML])(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, command, x, y) => command + (Number(x) < 480 ? Number(x) + 960 : Number(x)) + ',' + y);
  }
  function paint() {
    const quiz = state.mapQuiz, scoped = !quiz && (state.region !== 'All' || organization !== 'All');
    const wrap = !quiz && state.region === 'Oceania' && !worldContext;
    state.mapWide = wrap;
    $('map-stage').classList.toggle('has-map-scope', scoped);
    $('map-stage').classList.toggle('is-map-quiz', quiz);
    $('map-stage').classList.toggle('pacific-view', wrap);
    for (const node of document.querySelectorAll('[data-country]')) {
      const country = byId.get(node.dataset.country);
      const included = !!country && (state.region === 'All' || country.region === state.region) && matches(country);
      node.classList.toggle('scope-member', scoped && included);
      node.classList.toggle('scope-muted', scoped && !included);
      node.classList.toggle('dimmed', scoped && !included);
      if (!country) continue;
      if (node.tagName.toLowerCase() === 'path') {
        const path = originalPaths.get(country.id);
        if (path) node.setAttribute('d', wrap && country.region === 'Oceania' ? wrappedPath(path) : path);
      } else if (node.tagName.toLowerCase() === 'circle') {
        node.setAttribute('cx', wrap && country.region === 'Oceania' && country.mapX < 480 ? country.mapX + 960 : country.mapX);
      }
    }
    if (!quiz) profile();
  }
  function fit() {
    if (state.mapQuiz) return;
    worldContext = false; paint();
    const group = groups.get(organization);
    const bounds = state.region !== 'All' ? regions[state.region] : group?.bounds;
    if (!bounds || state.region === 'All' && ['All', 'un', 'g20', 'g7'].includes(organization)) {
      state.zoom = 1; state.pan = {x: 0, y: 0}; mapTransform(); return;
    }
    const [west, east, south, north] = bounds;
    const x0 = (west + 180) * 960 / 360, x1 = (east + 180) * 960 / 360;
    const y0 = (85 - north) * 400 / 150, y1 = (85 - south) * 400 / 150;
    state.zoom = Math.max(1, Math.min(7, 890 / (x1 - x0), 338 / (y1 - y0)));
    state.pan = {x: (480 - (x0 + x1) / 2) * state.zoom, y: (200 - (y0 + y1) / 2) * state.zoom};
    $('map-layer').classList.add('map-flight'); clearTimeout(flightTimer);
    mapTransform(); flightTimer = setTimeout(() => $('map-layer').classList.remove('map-flight'), 500);
  }
  function description() {
    const countries = visibleCountries(), group = groups.get(organization), container = $('layer-description');
    const title = element('strong', group ? group.short + ' · ' + group.name : state.region === 'All' ? 'The whole world, one discovery at a time.' : state.region + ' · A closer look');
    const count = element('span', countries.length + ' ' + (countries.length === 1 ? 'country profile' : 'country profiles') + ' in this view', 'layer-count');
    const note = element('p', group ? group.summary : 'Choose a populated continent/region to frame its countries, or choose an organization to highlight its country members.');
    const meta = element('div', undefined, 'layer-meta');
    if (group) {
      const link = element('a', 'Official membership source ↗'); link.href = group.source;
      meta.append(link, element('span', 'Checked ' + group.checked));
    } else meta.append(element('span', 'Atlas groups countries into six populated regions.'));
    if (group && state.region !== 'All') meta.prepend(element('span', 'Filtered to ' + state.region + ' · ' + countries.length + ' of ' + group.members.length + ' country members'));
    if (!countries.length) note.append(document.createTextNode(' No countries match this continent and organization combination. Broaden either filter to continue.'));
    container.replaceChildren(title, count, note, meta);
  }
  function directoryCount(countries) {
    if (organization === 'All') return;
    $('directory-count').textContent = countries.length + ' ' + (countries.length === 1 ? 'country' : 'countries') + ' · ' + groups.get(organization).short + (state.region !== 'All' ? ' · ' + state.region : '') + (state.query ? ' · matching “' + state.query + '”' : '');
  }
  function profile() {
    const country = byId.get(state.selected); if (!country) return;
    window.AtlasDemographics?.render(country.id);
    const coordinate = (value, positive, negative) => Math.abs(value).toLocaleString(undefined, {maximumFractionDigits: 2}) + '° ' + (value >= 0 ? positive : negative);
    const extras = [['COUNTRY CODE', country.id + ' · ISO 3166-1 alpha-2'], ['GEOGRAPHY', country.landlocked ? 'Landlocked' : 'Has a coastline'], ['REFERENCE COORDINATES', coordinate(country.lat, 'N', 'S') + ', ' + coordinate(country.lon, 'E', 'W')]];
    $('profile-extra-facts').replaceChildren(...extras.map(([label, value]) => { const row = element('div'), name = element('span', label, 'fact-label'), content = element('strong', value); row.append(name, content); return row; }));
    const memberGroups = ATLAS_ORGANIZATIONS.filter(group => group.members.includes(country.id));
    const badges = memberGroups.map(group => {
      const button = element('button', group.short);
      button.setAttribute('aria-label', 'Show ' + group.name + ' members on the map');
      button.title = group.name + ' · Country member';
      button.addEventListener('click', () => selectOrganization(group.id));
      return button;
    });
    const observerGroups = ATLAS_ORGANIZATIONS.filter(group => group.observers?.[country.id]);
    for (const group of observerGroups) {
      const link = element('a', group.short + ' · Observer', 'observer-badge');
      link.href = group.observerSource; link.title = group.observers[country.id]; badges.push(link);
    }
    $('membership-badges').replaceChildren(...badges);
    $('membership-note').textContent = memberGroups.length ? 'Full country memberships in the eight groups tracked by Atlas. Tap a badge to see the group on the map.' : observerGroups.length ? observerGroups.map(group => group.observers[country.id]).join('. ') + '. Observer status is distinct from membership.' : 'No full country memberships in the groups tracked here.';
    const outside = (state.region !== 'All' || organization !== 'All') && (!(state.region === 'All' || country.region === state.region) || !matches(country));
    $('profile-scope-note').hidden = !outside;
    $('profile-scope-note').textContent = outside ? 'This country is outside the current map filters.' : '';
  }
  function updateMapLink() {
    const params = new URLSearchParams();
    if (state.region !== 'All') params.set('region', state.region);
    if (organization !== 'All') params.set('org', organization);
    const url = new URL(location.href);
    url.hash = params.toString(); history.replaceState(null, '', url);
  }
  function changed(shouldFit = true) {
    worldContext = false; state.limit = 24; syncControls();
    const countries = visibleCountries();
    if (countries.length && !countries.some(country => country.id === state.selected)) selectCountry(countries[0].id, {record: false});
    directory(); description(); profile();
    if (shouldFit) fit(); else paint();
    if (initialized && state.view === 'explore') updateMapLink();
  }
  function selectOrganization(id) {
    if (!groups.has(id)) return;
    if (state.view !== 'explore') switchView('explore');
    organization = id; state.region = 'All'; state.query = ''; $('search').value = '';
    changed(true); $('map-panel').scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  function restore() { if (!initialized) return; syncControls(); description(); fit(); }
  function applyRoute() {
    if (state.quiz && !state.quiz.finished) return;
    const params = new URLSearchParams(location.hash.slice(1)), region = params.get('region'), group = params.get('org');
    if (!regions[region] && !groups.has(group)) return;
    state.region = regions[region] ? region : 'All'; organization = groups.has(group) ? group : 'All';
    switchView('explore'); changed(true);
  }
  for (const region of E.regions) {
    const option = element('option', region === 'Oceania' ? 'Australia & Oceania' : region); option.value = region; $('map-region').append(option);
  }
  for (const group of ATLAS_ORGANIZATIONS) {
    const option = element('option', group.short + ' · ' + group.members.length + ' countries'); option.value = group.id; $('map-organization').append(option);
  }
  $('map-region').addEventListener('change', () => { state.region = $('map-region').value; changed(true); });
  $('map-organization').addEventListener('change', () => { organization = $('map-organization').value; changed(true); });
  $('fit-layer').addEventListener('click', fit);
  $('clear-layers').addEventListener('click', () => { organization = 'All'; state.region = 'All'; state.query = ''; $('search').value = ''; changed(true); });
  $('share-layer').addEventListener('click', async () => {
    updateMapLink();
    try { await navigator.clipboard.writeText(location.href); toast('Map view link copied.'); }
    catch { toast('This map view is ready in the address bar. Copy its URL to share.'); }
  });
  $('zoom-reset').addEventListener('click', () => { if (state.mapQuiz) return; worldContext = true; paint(); state.zoom = 1; state.pan = {x: 0, y: 0}; mapTransform(); });
  $('world-map').addEventListener('pointerdown', () => $('map-layer').classList.remove('map-flight'));
  window.addEventListener('hashchange', applyRoute);
  queueMicrotask(() => { initialized = true; syncControls(); description(); profile(); paint(); applyRoute(); });
  return {matches, paint, profile, directoryCount, changed, restore};
})();
