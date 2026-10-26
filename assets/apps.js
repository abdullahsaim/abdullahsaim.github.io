/* Add an entry here to grow the homepage collection. Paths are case-sensitive on GitHub Pages. */
const apps = [
  { name: 'Solis', category: 'Everyday', type: 'WEATHER', path: 'Weather/', icon: '☀', color: 'blue', tagline: 'A brighter outlook.', description: 'Your daily forecast, air quality, and a world of cities. A little clarity for whatever the sky has planned.', tags: ['Live forecasts', 'City comparison'], preview: 'weather' },
  { name: 'Chronosphere', category: 'Everyday', type: 'WORLD CLOCK', path: 'clock/', icon: '◷', color: 'peach', tagline: 'Every moment, everywhere.', description: 'Keep the world in sync. Explore time zones and find a meeting time that works across continents.', tags: ['World time', 'Meeting planner'], preview: 'clock' },
  { name: 'Viora', category: 'Everyday', type: 'WELLNESS', path: 'BMI/', icon: '♡', color: 'green', tagline: 'A little more balance.', description: 'Get to know your numbers with a collection of wellness calculators and personal insights.', tags: ['Body calculators', 'Wellness tools'], preview: 'wellness' },
  { name: 'Grade Studio', category: 'Learning', type: 'GPA & CGPA', path: 'GPA/', icon: '▥', color: 'purple', tagline: 'Make every credit count.', description: 'Bring your semesters together. Calculate your GPA, track your progress, and plan your next academic goal.', tags: ['Semester tracking', 'Target planner'], preview: 'grades' },
  { name: 'Allegro', category: 'Creative', type: 'VIRTUAL PIANO', path: 'Piano/', icon: '♫', color: 'rose', tagline: 'Make room for music.', description: 'A little piano universe in your browser. Play a melody, record an idea, and make it your own.', tags: ['Playable piano', 'Record sessions'], preview: 'piano' },
  { name: 'NovaPOS', category: 'Business', type: 'POINT OF SALE', path: 'POS/', icon: '▦', color: 'sand', tagline: 'Your store, in flow.', description: 'From the first item to the final receipt. Bring your checkout, inventory, and sales into one workspace.', tags: ['Inventory', 'Sales & receipts'], preview: 'pos' },
  { name: 'Airwave', category: 'Creative', type: 'LIVE RADIO', path: 'radio/', icon: '◉', color: 'lime', tagline: 'Find your frequency.', description: 'Tune into live stations from around the world. Discover a new sound or settle into an old favorite.', tags: ['Global stations', 'Live streaming'], preview: 'radio' },
  { name: 'Timetable Analyzer', category: 'Learning', type: 'STUDY PLANNER', path: 'Task/', icon: '▤', color: 'aqua', tagline: 'See your semester clearly.', description: 'Explore the ADEO S3 schedule, understand your workload, and find the free spaces in your week.', tags: ['Schedule insights', 'Free-time finder'], preview: 'schedule' }
];
const previews = {
  weather: '<div class="preview-weather"><span class="preview-sun">☀</span><span class="preview-temp">24°<small>Partly sunny</small></span><span class="forecast-bars"><i>MON<br>☀<br>24°</i><i>TUE<br>☁<br>22°</i><i>WED<br>☀<br>25°</i></span></div>',
  clock: '<div class="preview-clock"><span>PARIS<strong>10:24</strong></span><i>↔</i><span>TOKYO<strong>18:24</strong></span></div>',
  wellness: '<div class="preview-wellness"><span>YOUR DAILY BALANCE</span><div class="wellness-line"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><small>A little progress, every day.</small></div>',
  grades: '<div class="preview-grades"><span>THE BIGGER PICTURE</span><div class="grade-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div><small>One semester at a time. ↗</small></div>',
  piano: '<div class="preview-piano"><span>A LITTLE PLAY GOES A LONG WAY.</span><div class="keys">'+Array.from({length:10},(_,i)=>'<i class="'+([0,1,3,4,5,7,8].includes(i)?'sharp':'')+'"></i>').join('')+'</div></div>',
  pos: '<div class="preview-pos"><span class="pos-product">◈<small>THE CATALOG</small></span><div><span>Current order</span><i></i><i></i><strong>Ready for checkout <b>↗</b></strong></div></div>',
  radio: '<div class="preview-radio"><span>ON AIR <i></i></span><div>'+Array.from({length:25},(_,i)=>'<i style="--h:'+ (12+((i*17+7)%49))+'px"></i>').join('')+'</div><small>A whole world of sound.</small></div>',
  schedule: '<div class="preview-schedule"><div><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span></div><div>'+Array.from({length:15},(_,i)=>'<i class="cell-'+i+'"></i>').join('')+'</div></div>'
};
let activeFilter = 'All';
const grid = document.getElementById('app-grid');
const search = document.getElementById('search');
function renderApps() {
  const query = search.value.trim().toLowerCase();
  const filtered = apps.filter(app => (activeFilter === 'All' || app.category === activeFilter) && [app.name, app.type, app.description, ...app.tags].join(' ').toLowerCase().includes(query));
  grid.innerHTML = filtered.map(app => `<a class="app-card ${app.color}" href="${app.path}" aria-label="Open ${app.name}"><div class="card-preview" aria-hidden="true">${previews[app.preview]}</div><div class="card-body"><div class="card-meta"><span>${app.type}</span><span class="launch" aria-hidden="true">↗</span></div><h3>${app.name}</h3><p class="tagline">${app.tagline}</p><p class="description">${app.description}</p><div class="tags">${app.tags.map(tag => `<span>${tag}</span>`).join('')}</div></div></a>`).join('');
  document.getElementById('empty').hidden = filtered.length !== 0;
  document.getElementById('results-status').textContent = `${filtered.length} applications shown`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  renderApps();
}));
search.addEventListener('input', renderApps);
document.addEventListener('keydown', event => { if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { event.preventDefault(); search.focus(); } });
document.getElementById('app-count').textContent = String(apps.length).padStart(2, '0');
document.querySelector('[data-filter="All"] span').textContent = apps.length;
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('back-top').addEventListener('click', event => { event.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); });
renderApps();
