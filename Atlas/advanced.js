/* Learning, comparison, and deep links extend the original passport without replacing v1 data. */
window.AtlasAdvanced = (() => {
  let countryA = 'FR', countryB = 'JP', deck = null, passportRef = progress;
  const format = new Intl.NumberFormat(undefined, {maximumFractionDigits: 1});
  const areaFormat = new Intl.NumberFormat(undefined, {maximumFractionDigits: 3});
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function route(hash) {
    const url = new URL(location.href);
    url.hash = hash;
    history.replaceState(null, '', url);
    return url;
  }
  async function copyLink(hash) {
    const url = route(hash);
    try { await navigator.clipboard.writeText(url.href); toast('A little world, ready to share. Link copied.'); }
    catch { toast('Your link is ready in the address bar. Copy it from there.'); }
  }
  function selected(id) { if (state.view === 'explore') route('country=' + id); }
  function view(name) {
    if (name === 'compare') route(countryA === countryB ? '' : 'compare=' + countryA + ',' + countryB);
    else if (name === 'explore') route('country=' + state.selected);
    else route('');
  }
  function applyRoute() {
    if (state.quiz && !state.quiz.finished) return;
    const params = new URLSearchParams(location.hash.slice(1));
    const pair = (params.get('compare') || '').toUpperCase().split(',');
    const id = (params.get('country') || '').toUpperCase();
    if (pair.length === 2 && pair.every(code => byId.has(code)) && pair[0] !== pair[1]) {
      [countryA, countryB] = pair;
      switchView('compare');
    } else if (byId.has(id)) {
      switchView('explore');
      selectCountry(id, {scroll: true});
    }
  }
  function compareProfile(country) {
    const article = node('article', undefined, 'panel compare-profile');
    article.append(flag(country), node('span', country.region.toUpperCase(), 'eyebrow'), node('h2', country.name), node('p', country.official));
    const dl = node('dl');
    for (const [label, value] of [['CAPITAL', country.capital], ['LANGUAGES', country.languages.join(', ')], ['CURRENCIES', country.currencies.join(', ')], ['AREA', areaFormat.format(country.area) + ' km²'], ['GEOGRAPHY', country.landlocked ? 'Landlocked' : 'Has a coastline']]) {
      const row = node('div'); row.append(node('dt', label), node('dd', value)); dl.append(row);
    }
    const button = node('button', 'Explore ' + country.name + ' ↗', 'secondary');
    button.addEventListener('click', () => { switchView('explore'); selectCountry(country.id, {scroll: true}); });
    article.append(dl, button);
    return article;
  }
  function compare() {
    $('compare-a').value = countryA; $('compare-b').value = countryB;
    const a = byId.get(countryA), b = byId.get(countryB), same = countryA === countryB;
    $('compare-error').textContent = same ? 'Choose two different countries to compare.' : '';
    $('comparison-results').hidden = same;
    if (same) return;
    $('compare-profiles').replaceChildren(compareProfile(a), compareProfile(b));
    const shared = a.languages.filter(language => b.languages.includes(language));
    const larger = a.area >= b.area ? a : b, smaller = larger === a ? b : a;
    const metrics = [
      ['REFERENCE-POINT DISTANCE', Math.round(E.distance(a, b)).toLocaleString() + ' km', 'A great-circle estimate across the globe'],
      ['LANGUAGES IN COMMON', shared.length ? shared.join(', ') : 'Different voices', shared.length ? 'Shared languages listed in the country dataset' : 'No shared languages listed in the dataset'],
      ['LAND CONNECTION', a.borders.includes(b.id) || b.borders.includes(a.id) ? 'Next-door neighbors' : 'Different horizons', a.region === b.region ? 'Both in ' + a.region : a.region + ' ↔ ' + b.region],
      ['AREA IN PERSPECTIVE', format.format(larger.area / smaller.area) + '×', larger.name + ' has the larger listed area']
    ];
    $('compare-metrics').replaceChildren(...metrics.map(([label, value, note]) => {
      const div = node('div'); div.append(node('span', label), node('strong', value), node('small', note)); return div;
    }));
    const maximum = Math.max(a.area, b.area);
    $('area-chart').replaceChildren(...[a, b].map(country => {
      const row = node('div', undefined, 'area-row'), label = node('div'), track = node('div', undefined, 'area-track'), fill = node('i');
      label.append(node('span', country.name), node('small', areaFormat.format(country.area) + ' km²'));
      fill.style.width = (country.area / maximum * 100) + '%'; track.append(fill); row.append(label, track); return row;
    }));
  }
  function renderLearning() {
    if (passportRef !== progress) { passportRef = progress; closeStudy(); }
    const now = Date.now(), today = E.localDate(), activity = progress.days[today] || {answered: 0, studied: 0};
    const due = E.reviewEntries(progress, 'due', now), missed = E.reviewEntries(progress, 'missed', now);
    const cards = [[due.length, 'READY TO REVISIT', 'Country and question-type pairs'], [missed.length, 'MISSED ANSWERS', 'Cleared by a correct answer'], [E.learningStreak(progress.days), 'DAY LEARNING STREAK', 'Quiz answers and study cards'], [activity.answered, 'ANSWERS TODAY', activity.studied + ' flashcards self-assessed']];
    $('learning-metrics').replaceChildren(...cards.map(([value, label, note]) => {
      const div = node('div'); div.append(node('span', label), node('strong', value), node('small', note)); return div;
    }));
    $('review-due').disabled = !due.length;
    $('review-due').textContent = 'Review due (' + due.length + ') ↗';
    $('practice-missed').disabled = !missed.length;
    $('practice-missed').textContent = 'Practice missed (' + missed.length + ') ↗';
    $('daily-goal').value = String(progress.goal);
    $('goal-progress').max = progress.goal; $('goal-progress').value = Math.min(activity.answered, progress.goal);
    $('goal-note').textContent = activity.answered >= progress.goal ? activity.answered + ' quiz answers today · Goal of ' + progress.goal + ' reached. ✦' : activity.answered + ' of ' + progress.goal + ' quiz answers today. A few discoveries go a long way.';
    const days = Array.from({length: 7}, (_, i) => E.shiftDay(today, i - 6));
    const amounts = days.map(day => (progress.days[day]?.answered || 0) + (progress.days[day]?.studied || 0));
    const maximum = Math.max(1, ...amounts);
    $('activity-note').textContent = 'Quiz answers and self-assessed flashcards.';
    $('activity-bars').replaceChildren(...days.map((day, i) => {
      const div = node('div'), track = node('div'), fill = node('i'), short = new Date(day + 'T12:00:00Z').toLocaleDateString(undefined, {weekday: 'short', timeZone: 'UTC'});
      div.setAttribute('aria-label', day + ': ' + amounts[i] + ' learning activities');
      div.title = day + ' · ' + amounts[i] + ' activities';
      fill.style.height = amounts[i] ? Math.max(5, amounts[i] / maximum * 64) + 'px' : '2px';
      track.append(fill); div.append(track, node('small', short)); return div;
    }));
  }
  function startReview(kind) {
    let entries;
    if (kind === 'session') entries = (state.quiz?.answers || []).filter(item => !item.correct).map(item => ({country: item.country, mode: item.mode}));
    else entries = E.reviewEntries(progress, kind === 'missed' ? 'missed' : 'due');
    const questions = E.buildReview(all, entries, 10);
    if (!questions.length) { toast('All caught up here. A fresh adventure is waiting.'); return; }
    closeStudy();
    startQuiz(false, {questions, settings: {mode: 'mixed', region: 'All', difficulty: 'adventurer', count: questions.length, timed: false, response: 'choice', practice: kind === 'due' ? 'review' : 'missed'}});
    $('quiz-mode-label').textContent = kind === 'due' ? 'A little spaced review' : 'A second look at missed answers';
  }
  function question(q, question, country) {
    const typed = q.settings.response === 'typed';
    $('typed-form').hidden = !typed; $('answers').hidden = typed;
    $('typed-answer').value = ''; $('typed-answer').disabled = false; $('typed-submit').disabled = false;
    $('typed-form').classList.remove('correct', 'incorrect'); $('typed-error').textContent = '';
    $('typed-note').textContent = question.mode === 'capitals' ? 'Any listed capital is accepted. Accents, case, and punctuation are ignored.' : 'Use a common or official country name, or a two-letter ISO code. Accents and punctuation are ignored.';
    document.querySelector('.quiz-keyboard').textContent = typed ? 'Type your answer · Enter to check · Enter again to continue' : 'Use 1–6 to answer · Enter to continue after an answer';
    if (q.settings.practice) $('quiz-mode-label').textContent = q.settings.practice === 'review' ? 'A little spaced review' : 'A second look at missed answers';
    if (typed) $('typed-answer').focus({preventScroll: true});
  }
  function answered(q) {
    if (q.settings.response !== 'typed') return;
    $('typed-answer').disabled = true; $('typed-submit').disabled = true;
    $('typed-form').classList.add(q.answers.at(-1).correct ? 'correct' : 'incorrect');
    $('next').focus({preventScroll: true});
  }
  function typedHint(q) {
    const question = q.questions[q.index], country = byId.get(question.country);
    const expected = question.mode === 'capitals' ? country.capital.split(' / ')[0] : country.name;
    q.hint = true; $('hint').disabled = true;
    $('typed-note').textContent = 'A little nudge: one accepted answer starts with “' + [...expected][0] + '”. A correct answer earns 25 fewer points.';
  }
  function results(q) {
    $('retry-missed').hidden = q.correct === q.questions.length;
    const summary = node('div', undefined, 'session-summary');
    summary.append(node('strong', (q.totalSeconds / q.questions.length).toFixed(1) + ' s'), node('span', 'Average answer time'), node('small', q.settings.response === 'typed' ? 'Recall mode · Written answers' : q.settings.practice ? 'Targeted review · Multiple choice' : 'Multiple choice'));
    const modes = node('div', undefined, 'session-modes');
    for (const mode of ['capitals', 'flags', 'map']) {
      const answers = q.answers.filter(item => item.mode === mode);
      if (!answers.length) continue;
      const row = node('div'); row.append(node('span', modeNames[mode]), node('strong', answers.filter(item => item.correct).length + ' / ' + answers.length)); modes.append(row);
    }
    $('session-insights').replaceChildren(summary, modes);
  }
  function closeStudy() { deck = null; $('study-panel').hidden = true; }
  function openStudy() {
    const region = $('study-region').value;
    const cards = E.shuffle(all.filter(country => region === 'All' || country.region === region)).slice(0, 20);
    deck = {cards, index: 0, remembered: 0, revealed: false, answered: false};
    $('study-panel').hidden = false; $('study-card').hidden = false; $('study-summary').hidden = true;
    showStudy(); $('study-panel').scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  function showStudy() {
    if (!deck) return;
    const country = deck.cards[deck.index]; deck.revealed = false; deck.answered = false;
    $('study-counter').textContent = 'Card ' + (deck.index + 1) + ' of ' + deck.cards.length + ' · Capital recall';
    $('study-flag').src = 'flags/' + country.id.toLowerCase() + '.svg'; $('study-flag').alt = 'Flag of ' + country.name;
    $('study-country').textContent = country.name; $('study-capital').textContent = country.capital;
    $('study-context').textContent = country.region + ' · ' + country.languages.join(', ');
    $('study-reveal').hidden = true; $('reveal-card').hidden = false; $('study-rating').hidden = true;
    $('study-again').disabled = $('study-known').disabled = false;
    $('study-card').classList.remove('revealed'); $('reveal-card').focus({preventScroll: true});
  }
  function rateStudy(remembered) {
    if (!deck || !deck.revealed || deck.answered) return;
    deck.answered = true; $('study-again').disabled = $('study-known').disabled = true;
    const country = deck.cards[deck.index];
    E.recordReview(progress, country.id, 'capitals', remembered, Date.now(), true);
    addUnique('discovered', country.id); if (remembered) deck.remembered++;
    save(); passport();
    deck.index++;
    if (deck.index < deck.cards.length) showStudy();
    else {
      $('study-card').hidden = true; $('study-summary').hidden = false;
      $('study-counter').textContent = 'A little practice, complete.';
      $('close-study').focus({preventScroll: true});
      $('study-summary').textContent = deck.remembered + ' of ' + deck.cards.length + ' capitals recalled by your own assessment. Your next reviews are scheduled. Come back for another little adventure.';
    }
  }
  for (const country of all) for (const id of ['compare-a', 'compare-b']) {
    const option = document.createElement('option'); option.value = country.id; option.textContent = country.name; $(id).append(option);
  }
  for (const region of E.regions) { const option = document.createElement('option'); option.value = region; option.textContent = 'Flashcards · ' + region; $('study-region').append(option); }
  $('compare-a').addEventListener('change', () => { countryA = $('compare-a').value; compare(); view('compare'); });
  $('compare-b').addEventListener('change', () => { countryB = $('compare-b').value; compare(); view('compare'); });
  $('compare-swap').addEventListener('click', () => { [countryA, countryB] = [countryB, countryA]; compare(); view('compare'); });
  $('compare-random').addEventListener('click', () => { [countryA, countryB] = E.shuffle(all).slice(0, 2).map(country => country.id); compare(); view('compare'); });
  $('share-comparison').addEventListener('click', () => { if (countryA === countryB) { toast('Choose two different countries first.'); return; } copyLink('compare=' + countryA + ',' + countryB); });
  $('share-country').addEventListener('click', () => copyLink('country=' + state.selected));
  $('compare-country').addEventListener('click', () => { countryA = state.selected; if (countryA === countryB) countryB = countryA === 'FR' ? 'JP' : 'FR'; switchView('compare'); });
  $('review-due').addEventListener('click', () => startReview('due'));
  $('practice-missed').addEventListener('click', () => startReview('missed'));
  $('retry-missed').addEventListener('click', () => startReview('session'));
  $('daily-goal').addEventListener('change', () => { progress.goal = Number($('daily-goal').value); save(); passport(); });
  $('open-study').addEventListener('click', openStudy); $('close-study').addEventListener('click', closeStudy);
  $('reveal-card').addEventListener('click', () => { if (!deck) return; deck.revealed = true; $('study-reveal').hidden = false; $('reveal-card').hidden = true; $('study-rating').hidden = false; $('study-card').classList.add('revealed'); $('study-again').focus({preventScroll: true}); });
  $('study-again').addEventListener('click', () => rateStudy(false)); $('study-known').addEventListener('click', () => rateStudy(true));
  $('typed-form').addEventListener('submit', event => {
    event.preventDefault(); const q = state.quiz; if (!q || q.answered || q.finished) return;
    const value = $('typed-answer').value.trim(); if (!value) { $('typed-error').textContent = 'Write your answer first, or skip this one.'; return; }
    q.pendingTyped = value.slice(0, 160); $('typed-error').textContent = '';
    const question = q.questions[q.index], country = byId.get(question.country);
    answer(E.acceptsAnswer(value, country, question.mode) ? country.id : null);
  });
  $('typed-answer').addEventListener('input', () => { $('typed-error').textContent = ''; });
  function syncAnswerStyle() { $('difficulty').querySelector('option[value="expert"]').textContent = $('answer-style').value === 'typed' ? 'Expert · Recall challenge' : 'Expert · Six answer choices'; }
  $('answer-style').addEventListener('change', syncAnswerStyle); syncAnswerStyle();
  function refreshClockViews() { if (document.hidden) return; if (state.view === 'passport') renderLearning(); if (state.view === 'challenge' && (!state.quiz || state.quiz.finished)) updateDaily(); }
  setInterval(refreshClockViews, 30000);
  document.addEventListener('visibilitychange', refreshClockViews);
  window.addEventListener('hashchange', applyRoute);
  // Initialization waits until this module is assigned so the base UI can call its hooks.
  queueMicrotask(() => { passport(); applyRoute(); });
  return {selected, view, compare, passport: renderLearning, question, answered, typedHint, results};
})();
