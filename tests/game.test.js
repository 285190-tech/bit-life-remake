const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');
const names = fs.readFileSync('names.js', 'utf8');
const KEY = 'little-life-save-v1';
function game(saved, random = 0.9) {
  const dom = new JSDOM(html, { url: 'https://example.com/', runScripts: 'outside-only' });
  dom.window.Math.random = () => random;
  if (saved) dom.window.localStorage.setItem(KEY, JSON.stringify(saved));
  dom.window.eval(names);
  dom.window.eval(script);
  return { dom, d: dom.window.document, save: () => JSON.parse(dom.window.localStorage.getItem(KEY)) };
}
function click(g, selector) { const element = g.d.querySelector(selector); assert.ok(element, `Missing ${selector}`); assert.equal(element.disabled, false, `${selector} is disabled`); element.click(); }
function choose(g) { if (g.save().pending !== null) { const choice = g.d.querySelector('[data-action^="choice-"]:not(:disabled)'); assert.ok(choice); choice.click(); } }
function age(g, count) { for (let i = 0; i < count; i++) { click(g, '#age-up'); choose(g); } }
function waitFor(g, predicate) { return new Promise((resolve, reject) => { if (predicate()) return resolve(); const observer = new g.dom.window.MutationObserver(() => { if (predicate()) { observer.disconnect(); clearTimeout(timer); resolve(); } }); const timer = setTimeout(() => { observer.disconnect(); reject(new Error('Timed out waiting for UI')); }, 2000); observer.observe(g.d.querySelector('#modal-content'), { childList: true, subtree: true, characterData: true }); }); }
function act(g, panel, action) { click(g, `[data-panel="${panel}"]`); click(g, `[data-action="${action}"]`); }

test('new life, yearly moment limit and automatic save', () => {
  const g = game(); assert.equal(g.save().age, 0);
  for (let i = 0; i < 3; i++) act(g, 'relationships', 'family');
  assert.equal(g.save().moments, 0);
  click(g, '[data-panel="relationships"]'); assert.equal(g.d.querySelector('[data-action="family"]').disabled, true);
  click(g, '.close-modal'); age(g, 1); assert.equal(g.save().moments, 3);
  const restored = game(g.save()); assert.equal(restored.save().age, 1); assert.equal(restored.save().moments, 3);
});

test('event zero is mandatory and survives reload', () => {
  const initial = game().save(); initial.age = 7; initial.pending = 0;
  const g = game(initial); assert.equal(g.d.querySelector('#age-up').disabled, true); assert.match(g.d.querySelector('#modal-title').textContent, /creative/);
  click(g, '[data-action="choice-0"]'); assert.equal(g.save().pending, null); assert.equal(g.d.querySelector('#age-up').disabled, false);
  assert.match(g.d.querySelector('#timeline').textContent, /art competition/);
});

test('career, taxes, education, relationships and assets', () => {
  const g = game(); age(g, 18);
  act(g, 'occupation', 'job'); click(g, '[data-action="job-0"]');
  age(g, 1); assert.equal(g.save().balance, 10400); // salary - 20% tax - living costs
  act(g, 'relationships', 'date'); act(g, 'relationships', 'marry'); act(g, 'relationships', 'child');
  assert.equal(g.save().married, true); assert.equal(g.save().children.length, 1);
  age(g, 1); act(g, 'assets', 'bike'); assert.ok(g.save().assets.includes('Bicycle'));
  act(g, 'assets', 'sell-bike'); assert.ok(!g.save().assets.includes('Bicycle'));
  const beforeUniversity = g.save().balance;
  act(g, 'occupation', 'university'); click(g, '[data-action="major-computing"]'); assert.equal(g.save().balance, beforeUniversity - 2500); assert.equal(g.save().income, 0);
  age(g, 4); assert.equal(g.save().education, 'University'); assert.equal(g.save().studying, false);
  act(g, 'occupation', 'job'); click(g, '[data-action="job-4"]'); assert.equal(g.save().job, 'Software developer');
});

test('life summary is available again after closing it', () => {
  const initial = game().save(); initial.age = 99;
  const g = game(initial); click(g, '#age-up'); assert.equal(g.save().alive, false);
  assert.match(g.d.querySelector('#modal-title').textContent, /remember/); click(g, '.close-modal'); click(g, '#review-life');
  assert.match(g.d.querySelector('#modal-content').textContent, /100/);
});

test('new life form replaces save and safely renders user text', () => {
  const g = game(); click(g, '#new-life'); g.d.querySelector('#new-name').value = '<img onerror=alert(1)>'; g.d.querySelector('#new-city').value = 'Charlotte, United States';
  g.d.querySelector('#new-life-form').dispatchEvent(new g.dom.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(g.save().name, '<img onerror=alert(1)>'); assert.equal(g.save().city, 'Charlotte, United States');
  assert.equal(g.d.querySelector('#character-name').textContent, '<img onerror=alert(1)>'); assert.equal(g.d.querySelector('#character-name img'), null);
});

test('older saves gain new fields without losing progress', () => {
  const old = game().save(); old.age = 25; delete old.moments; delete old.children; delete old.recentEvents; delete old.married; delete old.pet;
  const g = game(old); assert.equal(g.save().age, 25); assert.equal(g.save().moments, 3); assert.deepEqual(g.save().children, []);
});

test('hobby skill unlocks a career and hard work earns a promotion', () => {
  const initial = game().save(); initial.age = 18;
  const g = game(initial);
  for (let i = 0; i < 3; i++) { click(g, '[data-panel="activities"]'); click(g, '[data-action="hobbies"]'); click(g, '[data-action="practice-music"]'); }
  assert.equal(g.save().skills.music, 3);
  // The skills screen is still inspectable when no moments remain.
  click(g, '[data-panel="activities"]'); click(g, '[data-action="hobbies"]');
  assert.equal(g.d.querySelector('[data-action="practice-music"]').disabled, true); click(g, '.close-modal');
  age(g, 1); act(g, 'occupation', 'job'); click(g, '[data-action="job-6"]'); assert.equal(g.save().job, 'Musician');
  act(g, 'occupation', 'work'); act(g, 'occupation', 'work'); age(g, 1);
  assert.equal(g.save().careerLevel, 2); assert.equal(g.save().income, 55200); assert.ok(g.save().milestones.includes('promotion'));
});

test('relationships decay and can be strengthened or lost', () => {
  const initial = game().save(); initial.age = 30; initial.partner = 'Jamie'; initial.partnerBond = 4; initial.friends = ['Sam']; initial.friendBond = 4;
  const g = game(initial); age(g, 1); assert.equal(g.save().partnerBond, 1); assert.equal(g.save().friendBond, 1);
  act(g, 'relationships', 'date'); assert.equal(g.save().partnerBond, 21);
  age(g, 1); assert.equal(g.save().partner, 'Jamie'); assert.deepEqual(g.save().friends, []);
  assert.match(g.d.querySelector('#timeline').textContent, /lost touch/);
});

test('investments fluctuate and can be sold; illness can be treated', () => {
  const initial = game().save(); initial.age = 30; initial.balance = 30000; initial.illness = 'a lingering illness';
  const g = game(initial); act(g, 'activities', 'doctor'); assert.equal(g.save().illness, null); assert.equal(g.save().balance, 29500);
  act(g, 'assets', 'invest'); assert.equal(g.save().investment, 5000);
  age(g, 1); assert.equal(g.save().investment, 5750); // fixed random value produces +15%
  const balance = g.save().balance; act(g, 'assets', 'withdraw'); assert.equal(g.save().investment, 0); assert.equal(g.save().balance, balance + 5750);
});

test('contextual choices change bond and milestones remain earned', () => {
  const initial = game().save(); initial.age = 30; initial.partner = 'Jamie'; initial.partnerBond = 55; initial.pending = 19; initial.balance = 200000;
  const g = game(initial); assert.match(g.d.querySelector('#modal-title').textContent, /difficult conversation/);
  click(g, '[data-action="choice-0"]'); assert.equal(g.save().partnerBond, 67);
  act(g, 'assets', 'house'); assert.ok(g.save().milestones.includes('home'));
  act(g, 'assets', 'sell-house'); assert.ok(g.save().milestones.includes('home'));
  click(g, '[data-panel="milestones"]'); assert.match(g.d.querySelector('#modal-content').textContent, /Home sweet home/);
});

test('dependents and pets add to annual expenses', () => {
  const initial = game().save(); initial.age = 30; initial.balance = 50000; initial.pet = 'Mochi'; initial.children = ['Sam']; initial.childBirthAges = [29];
  const g = game(initial); age(g, 1); assert.equal(g.save().balance, 35500);
  assert.match(g.d.querySelector('#timeline').textContent, /\$14,500 in living costs/);
});

test('backup restore validates before replacing and preserves a pending event', async () => {
  const original = game().save(); original.age = 7; original.name = 'Backup Person'; original.pending = 0;
  const g = game(); click(g, '#save-menu');
  const input = g.d.querySelector('#import-file');
  const backup = { format: 'little-life-backup', version: 1, game: original };
  Object.defineProperty(input, 'files', { value: [new g.dom.window.File([JSON.stringify(backup)], 'backup.json', {type: 'application/json'})] });
  const loaded = waitFor(g, () => g.d.querySelector('#modal-title').textContent.includes('Replace'));
  input.dispatchEvent(new g.dom.window.Event('change', {bubbles: true}));
  await loaded;
  assert.match(g.d.querySelector('#modal-title').textContent, /Replace/); assert.notEqual(g.save().name, 'Backup Person');
  click(g, '[data-action="import-confirm"]'); assert.equal(g.save().name, 'Backup Person'); assert.equal(g.save().pending, 0);
  assert.equal(g.d.querySelector('#age-up').disabled, true); assert.match(g.d.querySelector('#modal-title').textContent, /creative/);
  click(g, '[data-action="choice-0"]');
  click(g, '#save-menu');
  const badInput = g.d.querySelector('#import-file');
  Object.defineProperty(badInput, 'files', { value: [new g.dom.window.File(['{"format":"little-life-backup","game":{}}'], 'bad.json')] });
  const rejected = waitFor(g, () => g.d.querySelector('#data-message')?.textContent.includes('not a valid'));
  badInput.dispatchEvent(new g.dom.window.Event('change', {bubbles: true}));
  await rejected;
  assert.match(g.d.querySelector('#data-message').textContent, /not a valid/); assert.equal(g.save().name, 'Backup Person');
});

test('children can receive free medical treatment', () => {
  const initial = game().save(); initial.age = 14; initial.illness = 'a lingering illness'; initial.balance = 0;
  const g = game(initial); act(g, 'activities', 'doctor'); assert.equal(g.save().illness, null); assert.equal(g.save().balance, 0);
});

test('retirement grants a pension and returning to work replaces it', () => {
  const initial = game().save(); initial.age = 65; initial.job = 'Teacher'; initial.income = 52000; initial.balance = 50000;
  const g = game(initial); act(g, 'occupation', 'retire'); assert.equal(g.save().retired, true); assert.equal(g.save().income, 15600);
  assert.equal(g.d.querySelector('#occupation').textContent, 'Retired'); age(g, 1); assert.match(g.d.querySelector('#timeline').textContent, /pension/);
  act(g, 'occupation', 'job'); click(g, '[data-action="job-0"]'); assert.equal(g.save().retired, false); assert.equal(g.save().income, 28000);
});

test('crime can lead to prison, restricted actions, release and a record', () => {
  const initial = game().save(); initial.age = 25; initial.balance = 5000; initial.job = 'Barista'; initial.income = 28000;
  const g = game(initial, .9);
  click(g, '[data-panel="activities"]'); click(g, '[data-action="crime"]'); click(g, '[data-action="offense-car"]');
  assert.equal(g.save().prisonYears, 3); assert.equal(g.save().balance, 4000); assert.equal(g.save().job, ''); assert.equal(g.save().convictions, 1);
  click(g, '[data-panel="occupation"]'); assert.match(g.d.querySelector('#modal-title').textContent, /prison/i); click(g, '[data-action="prison-read"]');
  age(g, 3); assert.equal(g.save().prisonYears, 0); assert.equal(g.save().balance, 4000); assert.match(g.d.querySelector('#timeline').textContent, /released/);
  click(g, '[data-panel="occupation"]'); click(g, '[data-action="job"]'); assert.equal(g.d.querySelector('[data-action="job-14"]').disabled, true);
});

test('prison has its own events and successful crime pays out', () => {
  const initial = game().save(); initial.age = 25; initial.balance = 5000;
  const g = game(initial, .1); click(g, '[data-panel="activities"]'); click(g, '[data-action="crime"]'); click(g, '[data-action="offense-shoplift"]');
  assert.equal(g.save().prisonYears, 0); assert.ok(g.save().balance > 5000);
  const jailed = g.save(); jailed.prisonYears = 3; const p = game(jailed, .1); click(p, '#age-up');
  assert.match(p.d.querySelector('#modal-title').textContent, /Prison education|letter from home|Time in the yard|Art class/i);
  choose(p); assert.equal(p.save().prisonYears, 2);
});

test('driving license gates cars, and moving ends a job but keeps possessions', () => {
  const initial = game().save(); initial.age = 25; initial.balance = 50000; initial.job = 'Barista'; initial.income = 28000;
  const g = game(initial); click(g, '[data-panel="assets"]'); assert.equal(g.d.querySelector('[data-action="car"]').disabled, true); click(g, '.close-modal');
  act(g, 'activities', 'license'); act(g, 'assets', 'car');
  click(g, '[data-panel="activities"]'); click(g, '[data-action="travel"]'); const destination = g.d.querySelector('[data-action^="move-"]:not(:disabled)'); assert.ok(destination); destination.click();
  assert.equal(g.save().moves, 1); assert.equal(g.save().job, ''); assert.equal(g.save().income, 0); assert.ok(g.save().assets.includes('Car'));
});

test('diets have annual effects and children can be adopted by single players', () => {
  const initial = game().save(); initial.age = 25; initial.balance = 30000; initial.stats.health = 60; initial.stats.happiness = 60;
  const g = game(initial); click(g, '[data-panel="activities"]'); click(g, '[data-action="diet"]'); click(g, '[data-action="diet-mediterranean"]');
  act(g, 'relationships', 'adopt'); assert.equal(g.save().children.length, 1); age(g, 1);
  assert.equal(g.save().balance, 14000); // 30000 - 1500 adoption - (12000 + 2000 child + 500 diet)
  assert.equal(g.save().diet, 'mediterranean'); assert.match(g.d.querySelector('#timeline').textContent, /diet affected/);
});

test('eligible events do not repeat until the available pool is exhausted', () => {
  const initial = game().save(); initial.age = 25; initial.balance = 1000000;
  const g = game(initial, .5); const seen = [];
  for (let i = 0; i < 12; i++) { click(g, '#age-up'); assert.notEqual(g.save().pending, null); seen.push(g.save().pending); choose(g); }
  assert.equal(new Set(seen).size, seen.length);
});

test('older backups receive defaults for new systems when restored', async () => {
  const original = game().save(); original.name = 'Old Backup';
  for (const key of ['seenEvents', 'prisonYears', 'convictions', 'license', 'moves', 'diet', 'major', 'studyMajor']) delete original[key];
  const g = game(); click(g, '#save-menu'); const input = g.d.querySelector('#import-file');
  Object.defineProperty(input, 'files', { value: [new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:original})], 'old.json')] });
  const loaded = waitFor(g, () => g.d.querySelector('#modal-title').textContent.includes('Replace'));
  input.dispatchEvent(new g.dom.window.Event('change', {bubbles:true})); await loaded; click(g, '[data-action="import-confirm"]');
  assert.equal(g.save().name, 'Old Backup'); assert.equal(g.save().diet, 'regular'); assert.equal(g.save().prisonYears, 0);
});

test('degree choice gates careers and scholarship applies', () => {
  const initial = game().save(); initial.age = 18; initial.balance = 15000; initial.stats.smarts = 85;
  const g = game(initial); click(g, '[data-panel="occupation"]'); click(g, '[data-action="university"]'); click(g, '[data-action="major-education"]');
  assert.equal(g.save().balance, 12500); assert.equal(g.save().studyMajor, 'education'); age(g, 4);
  assert.equal(g.save().major, 'education'); click(g, '[data-panel="occupation"]'); click(g, '[data-action="job"]');
  assert.equal(g.d.querySelector('[data-action="job-3"]').disabled, false); assert.equal(g.d.querySelector('[data-action="job-4"]').disabled, true);
  click(g, '[data-action="job-3"]'); assert.equal(g.save().job, 'Teacher');
});

test('odd jobs are available to students and do not end enrollment', () => {
  const initial = game().save(); initial.age = 18; initial.balance = 5000; initial.stats.smarts = 80;
  const g = game(initial); click(g, '[data-panel="occupation"]'); click(g, '[data-action="university"]'); click(g, '[data-action="major-arts"]');
  click(g, '[data-panel="activities"]'); click(g, '[data-action="gigs"]'); click(g, '[data-action="gig-tutor"]');
  assert.equal(g.save().balance, 400); assert.equal(g.save().studying, true);
});

test('legacy graduates remain eligible for specialized jobs after migration', () => {
  const old = game().save(); old.age = 30; old.education = 'University'; delete old.major; delete old.studyMajor;
  const g = game(old); assert.equal(g.save().major, 'legacy'); click(g, '[data-panel="occupation"]'); click(g, '[data-action="job"]'); assert.equal(g.d.querySelector('[data-action="job-4"]').disabled, false);
});

test('parents age, relationship visits improve bonds, and inheritance happens once', () => {
  const initial = game().save(); initial.age = 20; initial.balance = 20000;
  initial.parents = [{name:'Avery', age:70, endAge:71, bond:30, alive:true, inheritance:5000}];
  const g = game(initial); act(g, 'relationships', 'parent-0'); assert.equal(g.save().parents[0].bond, 48);
  age(g, 1); assert.equal(g.save().parents[0].alive, false); assert.equal(g.save().balance, 13000);
  assert.match(g.d.querySelector('#timeline').textContent, /inherited \$5,000/);
  age(g, 1); assert.equal(g.save().balance, 1000);
});

test('a strained parental bond reduces inheritance', () => {
  const initial = game().save(); initial.age = 20; initial.balance = 20000;
  initial.parents = [{name:'Avery', age:70, endAge:71, bond:20, alive:true, inheritance:5000}];
  const g = game(initial); age(g, 1); assert.equal(g.save().balance, 10500); assert.match(g.d.querySelector('#timeline').textContent, /grown apart/);
});

test('continue as a child preserves the estate and archives the previous story', () => {
  const initial = game().save(); initial.age = 99; initial.name = 'Alex Example'; initial.balance = 50000; initial.investment = 10000;
  initial.parents = []; initial.children = ['Sam', 'Riley']; initial.childBirthAges = [60, 80]; initial.assets = ['House'];
  const g = game(initial); click(g, '#age-up'); const estate = g.save(); assert.equal(estate.alive, false);
  click(g, '[data-action="choose-successor"]'); assert.match(g.d.querySelector('#modal-content').textContent, /Age 40/);
  click(g, '[data-action="successor-0"]'); assert.equal(g.save().alive, false); click(g, '[data-action="inherit-0"]');
  const next = g.save(); assert.equal(next.alive, true); assert.equal(next.name, 'Sam Example'); assert.equal(next.age, 40); assert.equal(next.generation, 2);
  assert.equal(next.balance, estate.balance); assert.equal(next.investment, estate.investment); assert.deepEqual(next.assets, ['House']); assert.equal(next.legacyHistory.length, 1);
  assert.equal(next.parents[0].name, 'Alex Example'); assert.equal(next.parents[0].alive, false);
  click(g, '[data-panel="legacy"]'); click(g, '[data-action="archive-0"]'); assert.match(g.d.querySelector('#modal-content').textContent, /life came to an end/i);
  const restored = game(next); assert.equal(restored.save().generation, 2); assert.equal(restored.save().legacyHistory[0].name, 'Alex Example');
});

test('child with unknown age is not eligible to continue an old save', () => {
  const initial = game().save(); initial.alive = false; initial.age = 60; initial.children = ['Sam']; initial.childBirthAges = [null];
  const g = game(initial); click(g, '[data-panel="relationships"]'); click(g, '[data-action="choose-successor"]');
  assert.equal(g.d.querySelector('[data-action="successor-0"]').disabled, true);
});

test('legacy backups restore archived stories and old saves receive safe defaults', async () => {
  const original = game().save(); original.age = 40; original.generation = 2; original.parents = [];
  original.legacyHistory = [{name: 'Previous Life', age: 80, city: 'Portland, United States', balance: 1000, investment: 0, history: [{age: 0, icon: '👶', tag: 'THE BEGINNING', entries: ['I was born.']}]}];
  const g = game(); click(g, '#save-menu'); const input = g.d.querySelector('#import-file');
  Object.defineProperty(input, 'files', {value: [new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:original})], 'legacy.json')]});
  const loaded = waitFor(g, () => g.d.querySelector('#modal-title').textContent.includes('Replace'));
  input.dispatchEvent(new g.dom.window.Event('change', {bubbles:true})); await loaded; click(g, '[data-action="import-confirm"]');
  assert.equal(g.save().generation, 2); assert.equal(g.save().legacyHistory[0].name, 'Previous Life');
  const old = game().save(); delete old.parents; delete old.generation; delete old.legacyHistory;
  const migrated = game(old); assert.deepEqual(migrated.save().parents, []); assert.equal(migrated.save().generation, 1); assert.deepEqual(migrated.save().legacyHistory, []);
});
