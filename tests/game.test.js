const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');
const names = fs.readFileSync('names.js', 'utf8');
const catalog = fs.readFileSync('lifesim-catalog.js', 'utf8');
const KEY = 'little-life-save-v1';
function game(saved, random = 0.9, exposeEvents = false) {
  const dom = new JSDOM(html, { url: 'https://example.com/', runScripts: 'outside-only' });
  dom.window.Math.random = () => random;
  if (saved) dom.window.localStorage.setItem(KEY, JSON.stringify(saved));
  dom.window.eval(names);
  dom.window.eval(catalog);
  dom.window.eval(exposeEvents ? script.replace("state = load(); render();", "window.__events = events; window.__validBackup = validBackup; state = load(); render();") : script);
  return { dom, d: dom.window.document, save: () => JSON.parse(dom.window.localStorage.getItem(KEY)) };
}
function click(g, selector) { const element = g.d.querySelector(selector); assert.ok(element, `Missing ${selector}`); assert.equal(element.disabled, false, `${selector} is disabled`); element.click(); }
function applyJob(g, index) {
  click(g, `[data-action="job-${index}"]`);
  const text = g.d.querySelector('#modal-content').textContent;
  let answer = 0;
  if (text.includes('Harry Potter character')) answer = 1;
  if (text.includes('weaknesses')) answer = 1;
  if (text.includes('Any more questions')) answer = 1;
  click(g, `[data-action="interview-answer-${answer}"]`);
}
function choose(g) { while (g.save().pending !== null) { const choice = g.d.querySelector('[data-action^="choice-"]:not(:disabled)'); assert.ok(choice); choice.click(); } }
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
  act(g, 'occupation', 'job'); applyJob(g, 0);
  age(g, 1); assert.equal(g.save().balance, 10400); // salary - 20% tax - living costs
  act(g, 'relationships', 'date'); act(g, 'relationships', 'marry'); act(g, 'relationships', 'child');
  assert.equal(g.save().married, true); assert.equal(g.save().children.length, 1);
  age(g, 1); act(g, 'assets', 'bike'); assert.ok(g.save().assets.includes('Bicycle'));
  act(g, 'assets', 'sell-bike'); assert.ok(!g.save().assets.includes('Bicycle'));
  const beforeUniversity = g.save().balance;
  act(g, 'occupation', 'university'); click(g, '[data-action="major-computing"]'); assert.equal(g.save().balance, beforeUniversity - 2500); assert.equal(g.save().income, 0);
  age(g, 4); assert.equal(g.save().education, 'University'); assert.equal(g.save().studying, false);
  act(g, 'occupation', 'job'); applyJob(g, 4); assert.equal(g.save().job, 'Software developer');
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
  age(g, 1); act(g, 'occupation', 'job'); applyJob(g, 6); assert.equal(g.save().job, 'Musician');
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
  const initial = game().save(); initial.age = 30; initial.balance = 50000; initial.pet = 'Mochi'; initial.children = ['Sam']; initial.childBirthAges = [29]; initial.childBonds = [65];
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
  const g = game(initial); act(g, 'occupation', 'retire'); click(g,'[data-action="retire-confirm"]'); assert.equal(g.save().retired, true); assert.equal(g.save().income, 15600);
  assert.equal(g.d.querySelector('#occupation').textContent, 'Retired'); age(g, 1); assert.match(g.d.querySelector('#timeline').textContent, /pension/);
  act(g, 'occupation', 'job'); applyJob(g, 0); assert.equal(g.save().retired, false); assert.equal(g.save().income, 28000);
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
  const initial = game().save(); initial.age = 18; initial.education = 'High school'; initial.balance = 15000; initial.stats.smarts = 85;
  const g = game(initial); click(g, '[data-panel="occupation"]'); click(g, '[data-action="university"]'); click(g, '[data-action="major-education"]');
  assert.equal(g.save().balance, 12500); assert.equal(g.save().studyMajor, 'education'); age(g, 4);
  assert.equal(g.save().major, 'education'); click(g, '[data-panel="occupation"]'); click(g, '[data-action="job"]');
  assert.equal(g.d.querySelector('[data-action="job-3"]').disabled, false); assert.equal(g.d.querySelector('[data-action="job-4"]').disabled, true);
  applyJob(g, 3); assert.equal(g.save().job, 'Teacher');
});

test('odd jobs are available to students and do not end enrollment', () => {
  const initial = game().save(); initial.age = 18; initial.education = 'High school'; initial.balance = 5000; initial.stats.smarts = 80;
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
  initial.parents = []; initial.children = ['Sam', 'Riley']; initial.childBirthAges = [60, 80]; initial.childBonds = [65, 65]; initial.assets = ['House']; initial.assetValues = {'House': 70000};
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
  const initial = game().save(); initial.alive = false; initial.age = 60; initial.children = ['Sam']; initial.childBirthAges = [null]; delete initial.childBonds;
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

test('school grades, skipping, dropout, return and GED are persistent and gate university', () => {
  const initial = game().save(); initial.age = 16; initial.grades = 50; initial.balance = 6000; initial.trait = '';
  const g = game(initial, 0.9);
  act(g, 'occupation', 'study'); assert.equal(g.save().grades, 60);
  act(g, 'occupation', 'skip-school'); assert.equal(g.save().grades, 50);
  act(g, 'occupation', 'drop-school'); assert.equal(g.save().droppedOut, true);
  age(g, 2); assert.equal(g.save().education, 'None');
  click(g, '[data-panel="occupation"]'); assert.equal(g.d.querySelector('[data-action="university"]').disabled, true);
  click(g, '[data-action="ged"]'); assert.equal(g.save().education, 'High school');
  click(g, '[data-panel="occupation"]'); click(g, '[data-action="university"]'); assert.ok(g.d.querySelector('[data-action="major-arts"]'));
  const second = game({...initial, droppedOut: true}); act(second, 'occupation', 'return-school'); assert.equal(second.save().droppedOut, false);
});

test('book catalog respects age, spends a moment and applies book lover trait', () => {
  const initial = game().save(); initial.age = 6; initial.trait = 'bookworm'; initial.stats.happiness = 40; initial.stats.smarts = 40;
  const g = game(initial); click(g, '[data-panel="activities"]'); click(g, '[data-action="read"]');
  assert.ok(g.d.querySelector('[data-action="book-3"]')); assert.equal(g.d.querySelector('[data-action="book-1"]'), null);
  click(g, '[data-action="book-3"]'); assert.equal(g.save().stats.happiness, 45); assert.equal(g.save().stats.smarts, 42); assert.equal(g.save().moments, 2);
  assert.match(g.d.querySelector('#timeline').textContent, /Brown Bear/); assert.match(g.d.querySelector('#trait-label').textContent, /Book lover/);
});

test('sibling visits, conversations and aging persist across reload', () => {
  const initial = game().save(); initial.age = 10; initial.siblings = [{name: 'Robin', age: 12, endAge: 90, bond: 50, alive: true}];
  const g = game(initial); act(g, 'relationships', 'sibling-0'); assert.equal(g.save().siblings[0].bond, 68);
  click(g, '[data-panel="relationships"]'); click(g, '[data-action="conversation"]'); click(g, '[data-action="chat-sibling-0"]'); assert.equal(g.save().siblings[0].bond, 76);
  assert.match(g.d.querySelector('#timeline').textContent, /talked with Robin/); age(g, 1);
  const restored = game(g.save()); assert.equal(restored.save().siblings[0].age, 13); assert.equal(restored.save().siblings[0].bond, 75);
});

test('trait effects apply to activities and annual changes while old saves get defaults', () => {
  const initial = game().save(); initial.age = 9; initial.trait = 'genius'; initial.stats.smarts = 40;
  const g = game(initial); age(g, 1); assert.ok(g.save().stats.smarts >= 41);
  const old = game().save(); delete old.trait; delete old.siblings; delete old.grades; delete old.droppedOut;
  const restored = game(old); assert.equal(restored.save().trait, ''); assert.deepEqual(restored.save().siblings, []); assert.equal(restored.save().grades, 65);
});

test('lottery validates tickets before charging and pays a matching draw', () => {
  const initial = game().save(); initial.age = 22; initial.balance = 100; initial.jackpot = 250000; initial.trait = '';
  const g = game(initial, .9); click(g, '[data-panel="activities"]'); click(g, '[data-action="lottery"]');
  const form = g.d.querySelector('#lottery-form'), input = g.d.querySelector('#lottery-numbers');
  const submit = () => form.dispatchEvent(new g.dom.window.Event('submit', {bubbles: true, cancelable: true}));
  input.value = '1 1 2 3'; submit(); assert.match(g.d.querySelector('#lottery-error').textContent, /different/); assert.equal(g.save().balance, 100); assert.equal(g.save().moments, 3);
  input.value = '19 18 17 16'; submit(); assert.equal(g.save().balance, 250096); assert.equal(g.save().moments, 2); assert.match(g.d.querySelector('#modal-title').textContent, /Jackpot/);
  assert.match(g.d.querySelector('#timeline').textContent, /19, 18, 17, 16/); assert.equal(game(g.save()).save().balance, 250096);
});

test('lottery supports ten tickets, rejects invalid count and never spends unaffordable money', () => {
  const initial = game().save(); initial.age = 22; initial.balance = 20; const g = game(initial, .9);
  click(g, '[data-panel="activities"]'); click(g, '[data-action="lottery"]');
  const input = g.d.querySelector('#lottery-numbers'), form = g.d.querySelector('#lottery-form');
  const submit = () => form.dispatchEvent(new g.dom.window.Event('submit', {bubbles: true, cancelable: true}));
  input.value = '1 2 3 4\n1 2 3 4'; submit(); assert.match(g.d.querySelector('#lottery-error').textContent, /one or ten/);
  input.value = Array(10).fill('1 2 3 4').join('\n'); submit(); assert.match(g.d.querySelector('#lottery-error').textContent, /enough money/); assert.equal(g.save().balance, 20);
  const funded = game({...initial, balance: 100}, .9); click(funded, '[data-panel="activities"]'); click(funded, '[data-action="lottery"]'); funded.d.querySelector('#lottery-numbers').value = Array(10).fill('1 2 3 4').join('\n'); funded.d.querySelector('#lottery-form').dispatchEvent(new funded.dom.window.Event('submit', {bubbles: true, cancelable: true})); assert.equal(funded.save().balance, 60); assert.equal(funded.save().moments, 2);
});

test('surgery has a cost, risk, and persistent six year cooldown', () => {
  const initial = game().save(); initial.age = 30; initial.balance = 60000; initial.trait = ''; initial.stats.looks = 40;
  const success = game(initial, .9); click(success, '[data-panel="activities"]'); click(success, '[data-action="surgery"]'); click(success, '[data-action="surgeon-1"]');
  assert.equal(success.save().balance, 35000); assert.equal(success.save().lastSurgery, 30); assert.ok(success.save().stats.looks > 40);
  click(success, '[data-panel="activities"]'); assert.equal(success.d.querySelector('[data-action="surgery"]').disabled, true); click(success, '.close-modal');
  age(success, 6); assert.equal(success.save().lastSurgery, 30);
  const botched = game({...initial, stats: {...initial.stats, health: 5}}, 0); click(botched, '[data-panel="activities"]'); click(botched, '[data-action="surgery"]'); click(botched, '[data-action="surgeon-0"]'); assert.equal(botched.save().alive, false); assert.match(botched.d.querySelector('#timeline').textContent, /complications/);
});

test('work hours, stress, meditation and raise requests interact with yearly progression', () => {
  const initial = game().save(); Object.assign(initial, {age: 25, education:'High school', job: 'Barista', income: 28000, careerPerformance: 60, stress: 70, trait: ''});
  const g = game(initial, .9); click(g, '[data-panel="occupation"]'); click(g, '[data-action="hours"]'); click(g, '[data-action="hours-70"]'); assert.equal(g.save().jobHours, 70);
  act(g, 'occupation', 'work'); assert.equal(g.save().stress, 74); age(g, 1); assert.equal(g.save().stress, 80); assert.match(g.d.querySelector('#timeline').textContent, /High stress/);
  act(g, 'activities', 'meditate'); assert.equal(g.save().stress, 70);
  act(g, 'occupation', 'raise'); assert.equal(g.save().lastRaiseRequest, 26); assert.equal(g.save().raiseRejections, 1);
  click(g, '[data-panel="occupation"]'); assert.equal(g.d.querySelector('[data-action="raise"]').disabled, true);
  const approved = game({...initial, careerPerformance: 100}, 0); act(approved, 'occupation', 'raise'); assert.equal(approved.save().income, 29400);
});

test('older saves receive safe defaults for lottery, surgery and work life', () => {
  const initial = game().save(); for (const field of ['stress','jobHours','lastRaiseRequest','raiseRejections','lastSurgery','jackpot']) delete initial[field];
  const restored = game(initial); assert.equal(restored.save().stress, 0); assert.equal(restored.save().jobHours, 40); assert.equal(restored.save().jackpot, 250000); assert.equal(restored.save().lastSurgery, null);
});

test('backup import rejects malformed new system fields without replacing the life', async () => {
  const g = game(); const original = g.save(); const invalid = {...original, name:'Invalid backup', jobHours: 100};
  click(g, '#save-menu'); const input = g.d.querySelector('#import-file');
  const backup = {format:'little-life-backup', version:1, game:invalid};
  Object.defineProperty(input, 'files', {value:[new g.dom.window.File([JSON.stringify(backup)], 'backup.json', {type:'application/json'})]});
  const loaded = waitFor(g, () => !!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid'));
  input.dispatchEvent(new g.dom.window.Event('change', {bubbles:true})); await loaded;
  assert.equal(g.save().name, original.name); assert.equal(g.save().jobHours, 40);
});

test('social actions use source dialogue and update bonds and karma', () => {
  const initial = game().save(); initial.age = 20; initial.balance = 500; initial.trait = ''; initial.parents = [{name:'Morgan', age:50, endAge:90, bond:60, alive:true, inheritance:3000}];
  const g = game(initial, .1);
  click(g, '[data-panel="relationships"]'); click(g, '[data-action="social"]'); click(g, '[data-action="social-target-parent-0"]'); click(g, '[data-action="social-do-compliment-parent-0"]');
  assert.equal(g.save().parents[0].bond, 62); assert.equal(g.save().karma, 52); assert.match(g.d.querySelector('#timeline').textContent, /I told Morgan/);
  click(g, '[data-panel="relationships"]'); click(g, '[data-action="social"]'); click(g, '[data-action="social-target-parent-0"]'); click(g, '[data-action="social-do-ask-parent-0"]'); assert.equal(g.save().parentAsks[0], 20); assert.ok(g.save().balance > 500);
  click(g, '[data-panel="relationships"]'); click(g, '[data-action="social"]'); click(g, '[data-action="social-target-parent-0"]'); assert.equal(g.d.querySelector('[data-action="social-do-ask-parent-0"]').disabled, true);
  click(g, '[data-action="social-do-insult-parent-0"]'); click(g, '[data-action="social-insult-confirm-parent-0"]'); assert.equal(g.save().karma, 48);
});

test('child bonds are initialized for adoptions and births and restored in old saves', () => {
  const initial = game().save(); initial.age = 25; initial.balance = 10000;
  const g = game(initial); act(g, 'relationships', 'adopt'); assert.deepEqual(g.save().childBonds, [65]);
  age(g, 1); act(g, 'relationships', 'children'); assert.deepEqual(g.save().childBonds, [75]);
  const partnered = game({...initial, partner:'Jamie', partnerBond:70}); act(partnered, 'relationships', 'child'); assert.deepEqual(partnered.save().childBonds, [65]);
  const old = partnered.save(); delete old.childBonds; delete old.karma; delete old.parentAsks; const restored = game(old); assert.deepEqual(restored.save().childBonds, [65]); assert.equal(restored.save().karma, 50);
});

test('toys, crafts, music and library are age gated and use moments', () => {
  const initial = game().save(); initial.age = 10; initial.stats.smarts = 40; initial.stress = 30; initial.trait = 'nerd';
  const g = game(initial); act(g, 'activities', 'toys'); act(g, 'activities', 'crafts'); act(g, 'activities', 'library'); assert.equal(g.save().moments, 0); assert.equal(g.save().stats.smarts, 50);
  const adult = game({...initial, age: 20}); click(adult, '[data-panel="activities"]'); assert.equal(adult.d.querySelector('[data-action="toys"]').disabled, true); click(adult, '[data-action="music-listen"]'); assert.equal(adult.save().stress, 25);
});

test('student loan enables university without cash and is repaid after studies', () => {
  const initial = game().save(); Object.assign(initial, {age:18, education:'High school', balance:0, trait:''}); initial.stats.smarts = 70;
  const g = game(initial, .9); click(g, '[data-panel="occupation"]'); click(g, '[data-action="university"]'); assert.equal(g.d.querySelector('[data-action="major-arts"]').disabled, true); click(g, '[data-action="majorloan-arts"]');
  assert.equal(g.save().studentLoan, 5000); assert.equal(g.save().balance, 0); age(g, 4); assert.equal(g.save().studentLoan, 5000); assert.equal(g.save().education, 'University');
  const funded = game({...g.save(), balance: 20000}); age(funded, 1); assert.equal(funded.save().studentLoan, 4000); assert.equal(funded.save().balance, 7000);
  act(funded, 'assets', 'loan-pay'); assert.equal(funded.save().studentLoan, 3000); assert.equal(funded.save().balance, 6000);
});

test('temporary illnesses resolve and chronic treatment may require repeat visits', () => {
  const initial = game().save(); Object.assign(initial, {age:30, illness:'the flu', illnessSince:30, balance:5000, trait:''}); initial.stats.health = 90;
  const g = game(initial, .9); age(g, 1); assert.equal(g.save().illness, null); assert.match(g.d.querySelector('#timeline').textContent, /recovered from the flu/);
  const chronic = game({...initial, illness:'cancer'}, .9); act(chronic, 'activities', 'doctor'); assert.equal(chronic.save().illness, 'cancer'); assert.equal(chronic.save().balance, 4500); assert.match(chronic.d.querySelector('#timeline').textContent, /condition remains/);
  const cured = game({...initial, illness:'cancer'}, 0); act(cured, 'activities', 'doctor'); assert.equal(cured.save().illness, null);
});

test('alternative treatment may be fatal and old health/loan saves migrate', () => {
  const initial = game().save(); Object.assign(initial, {age:30, balance:500, trait:''}); initial.stats.health = 5;
  const g = game(initial, 0); act(g, 'activities', 'alternative-doctor'); assert.equal(g.save().alive, false); assert.match(g.d.querySelector('#timeline').textContent, /unproven treatment/);
  delete initial.studentLoan; delete initial.illnessSince; const old = game(initial); assert.equal(old.save().studentLoan, 0); assert.equal(old.save().illnessSince, null);
});

test('proposal, venue wedding and vow renewal use relationship state and cooldown', () => {
  const initial = game().save(); Object.assign(initial, {age: 30, partner:'Jamie', partnerBond:90, balance:20000, trait:''});
  const g = game(initial, .1); act(g, 'relationships', 'propose'); assert.equal(g.save().engaged, true);
  click(g, '[data-panel="relationships"]'); click(g, '[data-action="wedding"]'); click(g, '[data-action="venue-0"]'); assert.equal(g.save().married, true); assert.equal(g.save().engaged, false); assert.equal(g.save().balance, 19949);
  click(g, '[data-panel="relationships"]'); assert.equal(g.d.querySelector('[data-action="renew-vows"]').disabled, true);
  const later = game({...g.save(), age:40}, .9); act(later, 'relationships', 'renew-vows'); assert.equal(later.save().lastVows, 40); assert.equal(later.save().balance, 19449);
});

test('market trades, yearly price changes, old-save migration and inheritance', () => {
  const initial = game().save(); Object.assign(initial, {age: 30, balance:50000, trait:''});
  const g = game(initial, .9); click(g, '[data-panel="assets"]'); click(g, '[data-action="market"]'); click(g, '[data-action="market-buy-0"]'); assert.equal(g.save().portfolio[0].units, 1); assert.equal(g.save().balance, 49955);
  age(g, 1); assert.equal(g.save().portfolio[0].price, 58); click(g, '[data-panel="assets"]'); click(g, '[data-action="market"]'); click(g, '[data-action="market-sell-0"]'); assert.equal(g.save().portfolio[0].units, 0);
  const legacy = game().save(); delete legacy.portfolio; assert.equal(game(legacy).save().portfolio.length, 33);
  const parent = g.save(); parent.alive = false; parent.children = ['Alex']; parent.childBirthAges = [25]; parent.childBonds = [65]; parent.portfolio[1].units = 3;
  const heir = game(parent); click(heir, '#review-life'); click(heir, '[data-action="choose-successor"]'); click(heir, '[data-action="successor-0"]'); click(heir, '[data-action="inherit-0"]'); assert.equal(heir.save().portfolio[1].units, 3);
});

test('interviews hire on suitable answers and reject unsuitable answers without ending a previous job', () => {
  const initial = game().save(); Object.assign(initial, {age: 25, job: 'Barista', income:28000, trait:''});
  const rejected = game(initial, .9); click(rejected, '[data-panel="occupation"]'); click(rejected, '[data-action="job"]'); click(rejected, '[data-action="job-1"]');
  assert.match(rejected.d.querySelector('#modal-content').textContent, /workplace/); click(rejected, '[data-action="interview-answer-1"]');
  assert.equal(rejected.save().job, 'Barista'); assert.equal(rejected.save().income, 28000); assert.equal(rejected.save().moments, 2); assert.match(rejected.d.querySelector('#timeline').textContent, /did not get the job/);
  const hired = game(initial, .9); click(hired, '[data-panel="occupation"]'); click(hired, '[data-action="job"]'); applyJob(hired, 1); assert.equal(hired.save().job, 'Office assistant');
});

test('pregnancy persists, retains co-parent after breakup, and resolves on age-up', () => {
  const initial = game().save(); Object.assign(initial, {age:25, partner:'Jamie', partnerBond:80, balance:5000, trait:''});
  const g = game(initial, .9); act(g, 'relationships', 'try-baby'); assert.equal(g.save().pregnancy.coParent, 'Jamie'); act(g, 'relationships', 'breakup'); click(g, '[data-action="breakup-final"]');
  const restored = game(g.save(), .9); age(restored, 1); assert.equal(restored.save().pregnancy, null); assert.equal(restored.save().children.length, 1); assert.deepEqual(restored.save().childBirthAges, [26]); assert.deepEqual(restored.save().childBonds, [65]); assert.match(restored.d.querySelector('#timeline').textContent, /Jamie and I welcomed/);
  const miscarriage = game({...initial, pregnancy:{coParent:'Jamie', started:25}}, 0); age(miscarriage, 1); assert.equal(miscarriage.save().children.length, 0); assert.match(miscarriage.d.querySelector('#timeline').textContent, /miscarriage/);
});

test('parent may fund university and extended degree list includes OpenLife degrees', () => {
  const initial = game().save(); Object.assign(initial, {age:18, education:'High school', balance:0, trait:''});
  initial.parents = [{name:'Morgan', age:50, endAge:90, bond:80, alive:true, inheritance:3000}];
  const g = game(initial, .1); click(g, '[data-panel="occupation"]'); click(g, '[data-action="university"]'); click(g, '[data-action="more-majors"]'); assert.ok(g.d.querySelector('[data-action="majorparent-finance"]')); click(g, '[data-action="majorparent-finance"]');
  assert.equal(g.save().studyMajor, 'finance'); assert.equal(g.save().studentLoan, 0); assert.equal(g.save().balance, 0);
});

test('surrender requires two confirmations and ends life with legacy summary', () => {
  const g = game(); click(g, '[data-panel="activities"]'); click(g, '[data-action="surrender"]'); assert.equal(g.save().alive, true);
  click(g, '[data-action="surrender-confirm"]'); assert.equal(g.save().alive, true); click(g, '[data-action="surrender-final"]'); assert.equal(g.save().alive, false); assert.match(g.d.querySelector('#modal-title').textContent, /life to remember/i);
});

test('bank deposits, interest, borrowing and repayments are saved and inherited', () => {
  const initial = game().save(); Object.assign(initial, {age:25, balance:20000, trait:''});
  const g = game(initial, .9); act(g, 'assets', 'bank-deposit'); act(g, 'assets', 'bank-borrow');
  assert.equal(g.save().savings, 1000); assert.equal(g.save().debt, 5000); assert.equal(g.save().balance, 24000);
  age(g, 1); assert.equal(g.save().savings, 1100); assert.equal(g.save().debt, 5400); assert.equal(g.save().balance, 11400);
  act(g, 'assets', 'bank-repay'); assert.equal(g.save().debt, 4400); assert.equal(g.save().balance, 10400);
  const saved = g.save(); saved.alive = false; saved.children=['Alex']; saved.childBirthAges=[24]; saved.childBonds=[65]; const heir = game(saved);
  click(heir, '#review-life'); click(heir, '[data-action="choose-successor"]'); click(heir, '[data-action="successor-0"]'); click(heir, '[data-action="inherit-0"]'); assert.equal(heir.save().savings, 1100); assert.equal(heir.save().debt, 4400);
});

test('low job performance triggers warning and then dismissal after pay', () => {
  const initial = game().save(); Object.assign(initial, {age:30, job:'Barista', income:28000, careerPerformance:20, balance:0, trait:''});
  const g = game(initial, .9); age(g, 1); assert.equal(g.save().jobWarned, true); assert.equal(g.save().balance, 10400);
  age(g, 1); assert.equal(g.save().job, ''); assert.equal(g.save().balance, 20800); assert.match(g.d.querySelector('#timeline').textContent, /fired for consistently low performance/);
});

test('bankruptcy requires confirmation and clears assets while retaining student loans', () => {
  const initial = game().save(); Object.assign(initial, {age:30, balance:100, savings:100, debt:10000, studentLoan:5000, investment:5000, assets:['House'], job:'Barista', income:28000, trait:''}); initial.assetValues = {House:70000}; initial.portfolio[0].units = 2;
  const g = game(initial); click(g, '[data-panel="assets"]'); click(g, '[data-action="bankruptcy"]'); assert.equal(g.save().debt, 10000); click(g, '[data-action="bankrupt-confirm"]');
  assert.equal(g.save().debt, 0); assert.equal(g.save().studentLoan, 5000); assert.equal(g.save().investment, 0); assert.deepEqual(g.save().assets, []); assert.equal(g.save().portfolio[0].units, 0); assert.equal(g.save().job, '');
});

test('property catalogue gates vehicle purchases by licenses and reduces housing costs', () => {
  const initial = game().save(); Object.assign(initial, {age:30, balance:100000, trait:''});
  const g = game(initial); click(g, '[data-panel="assets"]'); click(g, '[data-action="shopping"]'); click(g, '[data-action="shop-boat"]'); assert.equal(g.d.querySelector('[data-action="raft"]').disabled, true); click(g, '.close-modal');
  act(g, 'activities', 'boat-license'); click(g, '[data-panel="assets"]'); click(g, '[data-action="shopping"]'); click(g, '[data-action="shop-boat"]'); click(g, '[data-action="raft"]'); assert.ok(g.save().assets.includes('Raft'));
  click(g, '[data-panel="assets"]'); click(g, '[data-action="shopping"]'); click(g, '[data-action="shop-house"]'); click(g, '[data-action="tinyhouse"]'); assert.ok(g.save().assets.includes('Tiny House'));
  age(g, 1); assert.match(g.d.querySelector('#timeline').textContent, /\$8,000 in living costs/);
});

test('pets have types, names, breeds and finite lifespans while older pets remain compatible', () => {
  const initial = game().save(); Object.assign(initial, {age:25, balance:30000, trait:''});
  const g = game(initial, .9); click(g, '[data-panel="relationships"]'); click(g, '[data-action="pet"]'); click(g, '[data-action="pet-adopt-fish"]');
  assert.equal(g.save().petInfo.type, 'fish'); assert.equal(g.save().petInfo.breed, 'Betta Fish'); assert.equal(g.save().balance, 29500); assert.ok(g.save().pet);
  const oldPet = game({...initial, pet:'Biscuit', petInfo:null}); act(oldPet, 'relationships', 'pet'); assert.equal(oldPet.save().pet, 'Biscuit');
  const nearEnd = g.save(); nearEnd.petInfo.age = nearEnd.petInfo.endAge - 1; const dying = game(nearEnd, .9); age(dying, 1); assert.equal(dying.save().pet, null); assert.equal(dying.save().petInfo, null); assert.match(dying.d.querySelector('#timeline').textContent, /passed away/);
});

test('repeated meditation and study can teach traits without replacing an existing trait', () => {
  const initial = game().save(); Object.assign(initial, {age:10, trait:'cheerful', extraTraits:[], meditations:0, studySessions:0}); initial.stats.smarts = 80;
  const g = game(initial); for (let i=0; i<3; i++) act(g, 'activities', 'meditate'); assert.deepEqual(g.save().extraTraits, ['meditator']); assert.equal(g.save().trait, 'cheerful');
  age(g, 1); for (let i=0; i<3; i++) act(g, 'occupation', 'study'); assert.deepEqual(g.save().extraTraits, ['meditator', 'nerd']);
  const old = g.save(); delete old.extraTraits; delete old.meditations; delete old.studySessions; assert.deepEqual(game(old).save().extraTraits, []);
});

test('new-life gender selection persists and old lives keep unspecified gender', () => {
  const g = game(); click(g, '#new-life'); g.d.querySelector('#new-gender').value = 'nonbinary';
  g.d.querySelector('#new-life-form').dispatchEvent(new g.dom.window.Event('submit', {bubbles:true, cancelable:true}));
  assert.equal(g.save().gender, 'nonbinary'); assert.match(g.d.querySelector('#character-location').textContent, /Nonbinary/);
  const old = g.save(); delete old.gender; assert.equal(game(old).save().gender, '');
});

test('new systems survive a JSON backup restore and inherited portfolios retain values', async () => {
  const initial = game().save(); Object.assign(initial, {age:32, balance:1500, savings:12000, debt:5000, studentLoan:2000, partner:'Jamie', partnerBond:75, engaged:true, pregnancy:{coParent:'Jamie', started:32}, pet:'Poppy', petInfo:{type:'cat',breed:'Tabby Cat',age:2,endAge:15}, trait:'cheerful', extraTraits:['nerd'], meditations:3, studySessions:3}); initial.portfolio[0] = {price:75,units:3}; initial.assets=['Yacht']; initial.assetValues={'Yacht':31500}; initial.boatLicense=true;
  const g = game(); click(g, '#save-menu'); const input = g.d.querySelector('#import-file');
  Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup', version:1, game:initial})], 'backup.json', {type:'application/json'})]});
  const loaded = waitFor(g, () => g.d.querySelector('#modal-title').textContent.includes('Replace')); input.dispatchEvent(new g.dom.window.Event('change', {bubbles:true})); await loaded; click(g, '[data-action="import-confirm"]');
  const restored = g.save(); assert.equal(restored.savings,12000); assert.equal(restored.debt,5000); assert.equal(restored.studentLoan,2000); assert.equal(restored.portfolio[0].units,3); assert.equal(restored.petInfo.breed,'Tabby Cat'); assert.equal(restored.pregnancy.coParent,'Jamie'); assert.deepEqual(restored.extraTraits,['nerd']); assert.deepEqual(restored.assets,['Yacht']);
});

test('movie catalogue gates genres by age and charges adult ticket prices', () => {
  const initial = game().save(); Object.assign(initial, {age:10, balance:50, trait:''});
  const child = game(initial); click(child, '[data-panel="activities"]'); click(child, '[data-action="movies"]'); assert.equal(child.d.querySelector('[data-action="movie-genre-horror"]').disabled, true); click(child, '[data-action="movie-genre-animated"]'); click(child, '[data-action="movie-watch-animated-0"]'); assert.equal(child.save().balance, 50); assert.equal(child.save().moments, 2); assert.match(child.d.querySelector('#timeline').textContent, /at the movies/);
  const adult = game({...initial, age:20}); click(adult, '[data-panel="activities"]'); click(adult, '[data-action="movies"]'); click(adult, '[data-action="movie-genre-horror"]'); click(adult, '[data-action="movie-watch-horror-0"]'); assert.equal(adult.save().balance, 30);
});

test('old 25-asset portfolios gain named funds without losing holdings', () => {
  const saved = game().save(); saved.portfolio = saved.portfolio.slice(0,25); saved.portfolio[0].units = 3;
  const restored = game(saved); assert.equal(restored.save().portfolio.length, 33); assert.equal(restored.save().portfolio[0].units, 3); assert.equal(restored.save().portfolio[25].price, 100);
});

test('vehicle resale values depreciate annually and migrate for old saves', () => {
  const initial = game().save(); Object.assign(initial, {age:30,balance:50000,license:true,trait:''});
  const g = game(initial); act(g,'assets','car'); assert.equal(g.save().assetValues.Car,10500); age(g,1); assert.equal(g.save().assetValues.Car,8925);
  const before = g.save().balance; act(g,'assets','sell-car'); assert.equal(g.save().balance,before + 8925); assert.equal(g.save().assetValues.Car,undefined);
  const old = game().save(); old.assets = ['Car']; delete old.assetValues; assert.equal(game(old).save().assetValues.Car,10500);
});

test('multiple illnesses can be treated separately and recover independently', () => {
  const initial = game().save(); Object.assign(initial, {age:30, balance:5000, trait:'', illness:'cancer', illnessSince:29, additionalIllnesses:[{name:'the flu', since:30}, {name:'high blood pressure', since:29}]}); initial.stats.health = 90;
  const g = game(initial, .9); click(g, '[data-panel="activities"]'); click(g, '[data-action="doctor"]'); assert.match(g.d.querySelector('#modal-content').textContent, /cancer/); assert.match(g.d.querySelector('#modal-content').textContent, /flu/); click(g, '[data-action="doctor-treat-1"]');
  assert.equal(g.save().balance, 4500); assert.equal(g.save().illness, 'cancer'); assert.deepEqual(g.save().additionalIllnesses.map(c => c.name), ['high blood pressure']);
  const stored = g.save(); const recovered = game(stored, 0); click(recovered, '[data-panel="activities"]'); click(recovered, '[data-action="doctor"]'); click(recovered, '[data-action="doctor-treat-0"]'); assert.equal(recovered.save().illness, 'high blood pressure'); assert.deepEqual(recovered.save().additionalIllnesses, []);
  const timed = game(initial, .9); age(timed, 1); assert.equal(timed.save().illness, 'cancer'); assert.deepEqual(timed.save().additionalIllnesses.map(c => c.name), ['high blood pressure']); assert.match(timed.d.querySelector('#timeline').textContent, /recovered from the flu/);
});

test('prison infirmary treats one condition and preserves others', () => {
  const initial = game().save(); Object.assign(initial, {age:30, prisonYears:1, illness:'the flu', illnessSince:30, additionalIllnesses:[{name:'cancer', since:28}]});
  const g = game(initial); act(g, 'activities', 'prison-doctor'); assert.equal(g.save().illness, 'cancer'); assert.equal(g.save().illnessSince,28); assert.deepEqual(g.save().additionalIllnesses, []);
});

test('wills divide estate and debt among children and spouse without duplicating items', () => {
  const initial = game().save(); Object.assign(initial, {age:70, balance:1001, savings:501, debt:301, investment:201, children:['Sam','Riley'], childBirthAges:[40,45], childBonds:[60,60], partner:'Morgan', married:true, assets:['House','Bicycle'], assetValues:{House:70000,Bicycle:350}, trait:''}); initial.portfolio[0].units = 5;
  const g = game(initial); click(g, '[data-panel="assets"]'); click(g, '[data-action="will"]'); click(g, '[data-action="will-set-equal"]'); assert.equal(g.save().will.mode,'equal');
  const deceased = g.save(); deceased.alive = false; const heir = game(deceased); click(heir, '#review-life'); click(heir, '[data-action="choose-successor"]'); click(heir, '[data-action="successor-0"]'); click(heir, '[data-action="inherit-0"]');
  const s = heir.save(); assert.equal(s.balance, 334); assert.equal(s.savings,167); assert.equal(s.debt,101); assert.equal(s.investment,67); assert.equal(s.portfolio[0].units,2); assert.deepEqual(s.assets,['House']); assert.equal(s.assetValues.House,70000);
});

test('specific beneficiary, spouse and charity wills affect the playable heir', () => {
  const initial = game().save(); Object.assign(initial, {age:70, balance:10000, children:['Sam','Riley'], childBirthAges:[40,45], childBonds:[65,65], partner:'Morgan', married:true, trait:''});
  function heirFor(will, index) { const g = game({...initial, alive:false, will}); click(g, '#review-life'); click(g, '[data-action="choose-successor"]'); click(g, `[data-action="successor-${index}"]`); click(g, `[data-action="inherit-${index}"]`); return g.save(); }
  assert.equal(heirFor({mode:'child',child:1}, 0).balance,0); assert.equal(heirFor({mode:'child',child:1}, 1).balance,10000); assert.equal(heirFor({mode:'spouse',child:null}, 0).balance,0); assert.equal(heirFor({mode:'charity',child:null}, 0).balance,0);
  const old = game().save(); delete old.will; assert.equal(game(old).save().will.mode,'legacy');
});

test('will eligibility, selection and breakup reset are enforced', () => {
  const initial = game().save(); Object.assign(initial, {age:40, balance:5000, children:['Sam'], childBirthAges:[30], childBonds:[65], partner:'Morgan', married:true});
  const g = game(initial); click(g, '[data-panel="assets"]'); click(g, '[data-action="will"]'); click(g, '[data-action="will-child-0"]'); assert.deepEqual(g.save().will,{mode:'child',child:0});
  click(g, '[data-panel="assets"]'); click(g, '[data-action="will"]'); click(g, '[data-action="will-set-spouse"]'); assert.equal(g.save().will.mode,'spouse');
  act(g, 'relationships', 'breakup'); click(g, '[data-action="breakup-final"]'); assert.deepEqual(g.save().will,{mode:'legacy',child:null});
  const stale = game({...initial, partner:null, married:false, will:{mode:'spouse',child:null}, alive:false}); click(stale, '#review-life'); click(stale, '[data-action="choose-successor"]'); click(stale, '[data-action="successor-0"]'); click(stale, '[data-action="inherit-0"]'); assert.equal(stale.save().balance,5000);
  const minor = game({...initial,age:17,childBirthAges:[10]}); click(minor, '[data-panel="assets"]'); assert.equal(minor.d.querySelector('[data-action="will"]').disabled,true);
});

test('backup migration and validation preserve wills and reject invalid beneficiaries', async () => {
  async function restore(saved, valid) { const g = game(); const original = g.save(); click(g, '#save-menu'); const input = g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:saved})],'will.json')]}); const done = waitFor(g, () => valid ? g.d.querySelector('#modal-title').textContent.includes('Replace') : !!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; if (valid) click(g,'[data-action="import-confirm"]'); else assert.equal(g.save().name,original.name); return g.save(); }
  const source = game().save(); Object.assign(source,{age:40,children:['Sam'],childBirthAges:[30],childBonds:[65],will:{mode:'child',child:0}});
  assert.deepEqual((await restore(source,true)).will,{mode:'child',child:0});
  const old = {...source}; delete old.will; assert.deepEqual((await restore(old,true)).will,{mode:'legacy',child:null});
  await restore({...source,will:{mode:'child',child:4}},false); await restore({...source,will:{mode:'bogus',child:null}},false);
});

test('adoption agency offers an older child and preserves their age for family continuation', () => {
  const initial = game().save(); Object.assign(initial,{age:40,balance:50000,partner:'Morgan',married:true}); const g = game(initial,0.5);
  click(g,'[data-panel="relationships"]'); click(g,'[data-action="adoption-agency"]'); assert.match(g.d.querySelector('#modal-content').textContent,/age 9/); click(g,'[data-action="adoption-confirm"]');
  const s = g.save(); assert.equal(s.balance,30000); assert.equal(s.childBirthAges[0],31); assert.equal(s.childBonds[0],65); assert.equal(s.moments,2); assert.ok(s.history.at(-1).entries.some(entry => entry.includes('adopted')));
  const dead = game({...s,alive:false}); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); click(dead,'[data-action="inherit-0"]'); assert.equal(dead.save().age,9);
});

test('adoption agency eligibility and affordability are enforced without spending a moment', () => {
  let initial = game().save(); Object.assign(initial,{age:21,balance:0}); let g = game(initial,0.5);
  click(g,'[data-panel="relationships"]'); click(g,'[data-action="adoption-agency"]'); assert.equal(g.d.querySelector('[data-action="adoption-confirm"]').disabled,true); click(g,'.close-modal'); assert.equal(g.save().moments,3); assert.equal(g.save().children.length,0);
  g = game({...initial,age:71,balance:50000}); click(g,'[data-panel="relationships"]'); assert.equal(g.d.querySelector('[data-action="adoption-agency"]').disabled,true);
  g = game({...initial,age:20,balance:50000}); click(g,'[data-panel="relationships"]'); assert.equal(g.d.querySelector('[data-action="adoption-agency"]').disabled,true);
});

test('individual outings reward the first yearly visit and low bonds can cause refusal', () => {
  const initial = game().save(); Object.assign(initial,{age:25,moments:3,trait:'',extraTraits:[]}); initial.parents[0].bond=70; const g = game(initial,0.5);
  function visit() { click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-visit-parent-0"]'); }
  visit(); const first = g.save(); assert.ok(first.parents[0].bond > 70); assert.deepEqual(first.socialVisits,['parent-0']);
  visit(); assert.equal(g.save().parents[0].bond,first.parents[0].bond); assert.equal(g.save().stats.happiness,first.stats.happiness);
  const low = game({...initial,parents:initial.parents.map((p,i)=>({...p,bond:i===0?10:p.bond}))},0.5); click(low,'[data-panel="relationships"]'); click(low,'[data-action="social"]'); click(low,'[data-action="social-target-parent-0"]'); click(low,'[data-action="social-do-visit-parent-0"]'); assert.equal(low.save().parents[0].bond,10); assert.equal(low.save().stats.happiness,initial.stats.happiness-4); assert.deepEqual(low.save().socialVisits,[]);
  age(g,1); assert.deepEqual(g.save().socialVisits,[]);
});

test('old saves default to no social visits and malformed visit records cannot be imported', async () => {
  const original = game().save(); delete original.socialVisits; assert.deepEqual(game(original).save().socialVisits,[]);
  const g = game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:{...original,socialVisits:['parent-99']}})],'bad.json')]}); const done=waitFor(g,()=>!!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save().socialVisits,[]);
});

test('scholarship applications can cover tuition or be rejected once per year', () => {
  const initial = game().save(); Object.assign(initial,{age:18,education:'High school',balance:0,trait:'',extraTraits:[]}); initial.stats.smarts=100;
  const success=game(initial,.5); click(success,'[data-panel="occupation"]'); click(success,'[data-action="university"]'); click(success,'[data-action="majorscholar-computing"]'); const enrolled=success.save(); assert.equal(enrolled.studying,true); assert.equal(enrolled.studyMajor,'computing'); assert.equal(enrolled.balance,0); assert.equal(enrolled.studentLoan,0); assert.equal(enrolled.scholarshipAttempt,18); assert.match(enrolled.history.at(-1).entries.join(' '),/covered by a scholarship/);
  initial.stats.smarts=30; const rejected=game(initial,.9); click(rejected,'[data-panel="occupation"]'); click(rejected,'[data-action="university"]'); click(rejected,'[data-action="majorscholar-arts"]'); assert.equal(rejected.save().studying,false); assert.equal(rejected.save().scholarshipAttempt,18); assert.equal(rejected.save().moments,2);
  click(rejected,'[data-panel="occupation"]'); click(rejected,'[data-action="university"]'); assert.equal(rejected.d.querySelector('[data-action="majorscholar-arts"]').disabled,true); click(rejected,'.close-modal'); age(rejected,1); click(rejected,'[data-panel="occupation"]'); click(rejected,'[data-action="university"]'); assert.equal(rejected.d.querySelector('[data-action="majorscholar-arts"]').disabled,false);
});

test('university students can study, skip, leave or be expelled and retain existing degrees and debt', () => {
  const initial = game().save(); Object.assign(initial,{age:25,education:'University',major:'arts',studying:true,studyMajor:'computing',studyStarted:25,studentLoan:5000,grades:45,trait:'',extraTraits:[]});
  const g=game(initial,.9); act(g,'occupation','university-study'); assert.equal(g.save().grades,55); act(g,'occupation','university-skip'); assert.equal(g.save().grades,40); age(g,1); assert.equal(g.save().studying,false); assert.equal(g.save().education,'University'); assert.equal(g.save().major,'arts'); assert.equal(g.save().studentLoan,5000); assert.match(g.save().history.at(-1).entries.join(' '),/expelled/);
  const leaving=game(initial,.9); act(leaving,'occupation','university-leave'); assert.equal(leaving.save().studying,false); assert.equal(leaving.save().studyMajor,''); assert.equal(leaving.save().studentLoan,5000);
});

test('scholarship attempt is migrated and validated in backups', async () => {
  const original=game().save(); delete original.scholarshipAttempt; assert.equal(game(original).save().scholarshipAttempt,null);
  const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:{...original,scholarshipAttempt:999}})],'bad.json')]}); const done=waitFor(g,()=>!!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.equal(g.save().scholarshipAttempt,null);
});

test('new children keep a profile, age through school and bring their own life into the next generation', () => {
  const initial=game().save(); Object.assign(initial,{age:35,partner:'Morgan',partnerBond:80,balance:50000,trait:'',extraTraits:[]});
  const g=game(initial,.1); act(g,'relationships','child'); let s=g.save(); assert.equal(s.childProfiles['0'].adopted,false); assert.equal(s.childProfiles['0'].smarts,10);
  click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-child-0"]'); assert.match(g.d.querySelector('#modal-content').textContent,/Smarts 10%/); click(g,'.close-modal');
  // Use a profile close to adulthood so progression is easy to inspect.
  s=g.save(); s.age=52; s.childBirthAges[0]=35; s.childProfiles['0'].smarts=80; s.childProfiles['0'].looks=66; s.childProfiles['0'].happiness=72;
  const grown=game(s,.1); age(grown,1); s=grown.save(); assert.equal(s.childProfiles['0'].education,'High school'); assert.equal(s.childProfiles['0'].studyStarted,18); assert.match(s.history.at(-1).entries.join(' '),/started university/);
  s.childProfiles['0'].partner={name:'Riley',since:18,married:false}; const partnered=game(s,.1); age(partnered,4); s=partnered.save(); assert.equal(s.childProfiles['0'].education,'University'); assert.equal(s.childProfiles['0'].job,'Office assistant'); assert.ok(s.childProfiles['0'].balance > 0); assert.equal(s.childProfiles['0'].partner.married,true);
  const profile=s.childProfiles['0']; const estate=s.balance; const dead=game({...s,alive:false}); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); click(dead,'[data-action="inherit-0"]'); const successor=dead.save(); assert.equal(successor.stats.smarts,profile.smarts); assert.equal(successor.stats.looks,66); assert.equal(successor.education,'University'); assert.equal(successor.major,'legacy'); assert.equal(successor.job,'Office assistant'); assert.equal(successor.partner,profile.partner.name); assert.equal(successor.married,true); assert.equal(successor.balance,estate+profile.balance); assert.match(successor.history[0].entries.join(' '),/own savings/);
});

test('adopted candidates keep their displayed assessments, and legacy children have no invented profile', () => {
  const initial=game().save(); Object.assign(initial,{age:40,balance:50000}); const g=game(initial,.5); click(g,'[data-panel="relationships"]'); click(g,'[data-action="adoption-agency"]'); assert.match(g.d.querySelector('#modal-content').textContent,/smarts 50%, looks 50%/); click(g,'[data-action="adoption-confirm"]'); assert.equal(g.save().childProfiles['0'].smarts,50); assert.equal(g.save().childProfiles['0'].looks,50); assert.equal(g.save().childProfiles['0'].adopted,true);
  const old=g.save(); delete old.childProfiles; assert.deepEqual(game(old).save().childProfiles,{});
});

test('child profile backups reject invalid ages and restore valid independent lives', async () => {
  const seed=game().save(); Object.assign(seed,{age:40,balance:50000}); const source=game(seed,.5); click(source,'[data-panel="relationships"]'); click(source,'[data-action="adoption-agency"]'); click(source,'[data-action="adoption-confirm"]'); const saved=source.save();
  async function restore(value,valid) { const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:value})],'child.json')]}); const done=waitFor(g,()=>valid ? g.d.querySelector('#modal-title').textContent.includes('Replace') : !!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; if(valid) click(g,'[data-action="import-confirm"]'); return g.save(); }
  assert.deepEqual((await restore(saved,true)).childProfiles,saved.childProfiles);
  await restore({...saved,childProfiles:{0:{...saved.childProfiles[0],studyStarted:90}}},false); await restore({...saved,childProfiles:{2:saved.childProfiles[0]}},false);
});

test('a disagreement persists across reload and apology affects the selected person', () => {
  const initial=game().save(); Object.assign(initial,{age:25,trait:'',extraTraits:[],karma:50}); initial.parents[0].bond=60;
  const g=game(initial,0); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-talk-parent-0"]');
  const pending=g.save(); assert.notEqual(pending.pending,null); assert.deepEqual(pending.argumentTarget,{kind:'parent',index:0}); assert.equal(pending.moments,2); assert.equal(g.d.querySelector('#age-up').disabled,true); assert.equal(g.d.querySelector('.close-modal').hidden,true); assert.match(g.d.querySelector('#modal-title').textContent,/disagreement/i);
  const loaded=game(pending,0); assert.match(loaded.d.querySelector('#modal-content').textContent,/argument/); click(loaded,'[data-action="choice-0"]'); assert.equal(loaded.save().pending,null); assert.equal(loaded.save().argumentTarget,null); assert.equal(loaded.save().parents[0].bond,pending.parents[0].bond+2); assert.equal(loaded.save().karma,52); assert.equal(loaded.save().moments,2);
});

test('arguments support disagreement or insults; estranged people refuse conversation', () => {
  const initial=game().save(); Object.assign(initial,{age:25,trait:'',extraTraits:[],karma:50}); initial.parents[0].bond=60;
  function start() { const g=game(initial,0); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-talk-parent-0"]'); return g; }
  let g=start(); let before=g.save().parents[0].bond; click(g,'[data-action="choice-1"]'); assert.equal(g.save().parents[0].bond,before); assert.equal(g.save().karma,50);
  g=start(); before=g.save().parents[0].bond; click(g,'[data-action="choice-2"]'); assert.equal(g.save().parents[0].bond,before-4); assert.equal(g.save().karma,46);
  initial.parents[0].bond=10; g=game(initial,.9); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-talk-parent-0"]'); assert.equal(g.save().pending,null); assert.equal(g.save().parents[0].bond,10); assert.match(g.d.querySelector('#timeline').textContent,/not interested/);
});

test('conversation bonuses apply only once per person each year', () => {
  const initial=game().save(); Object.assign(initial,{age:25,trait:'',extraTraits:[]}); initial.parents[0].bond=60; const g=game(initial,.9);
  function talk(){click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-talk-parent-0"]');}
  talk(); const first=g.save(); assert.ok(first.parents[0].bond>60); assert.deepEqual(first.socialConversations,['parent-0']); talk(); assert.equal(g.save().parents[0].bond,first.parents[0].bond); assert.equal(g.save().stats.happiness,first.stats.happiness); age(g,1); assert.deepEqual(g.save().socialConversations,[]);
});

test('argument backups validate the target before restoring the mandatory choice', async () => {
  const initial=game().save(); Object.assign(initial,{age:25,trait:'',extraTraits:[]}); initial.parents[0].bond=60; const source=game(initial,0); click(source,'[data-panel="relationships"]'); click(source,'[data-action="social"]'); click(source,'[data-action="social-target-parent-0"]'); click(source,'[data-action="social-do-talk-parent-0"]'); const pending=source.save();
  async function restore(saved,valid) { const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:saved})],'argument.json')]}); const done=waitFor(g,()=>valid ? g.d.querySelector('#modal-title').textContent.includes('Replace') : !!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; if(valid) click(g,'[data-action="import-confirm"]'); return g; }
  const restored=await restore(pending,true); assert.match(restored.d.querySelector('#modal-title').textContent,/disagreement/i); click(restored,'[data-action="choice-1"]'); assert.equal(restored.save().pending,null);
  await restore({...pending,argumentTarget:{kind:'parent',index:99}},false); await restore({...pending,argumentTarget:null},false);
});

test('expanded source movie catalogues are selectable and adult categories are age-gated', () => {
  const initial=game().save(); Object.assign(initial,{age:10,balance:100}); const child=game(initial,.9); click(child,'[data-panel="activities"]'); click(child,'[data-action="movies"]'); assert.equal(child.d.querySelector('[data-action="movie-genre-adult"]').disabled,true); assert.equal(child.d.querySelector('[data-action="movie-genre-christmas"]').disabled,true); click(child,'[data-action="movie-genre-family"]'); click(child,'[data-action="movie-watch-family-0"]'); assert.match(child.d.querySelector('#timeline').textContent,/Big Boy/);
  const adult=game({...initial,age:25},.9); click(adult,'[data-panel="activities"]'); click(adult,'[data-action="movies"]'); click(adult,'[data-action="movie-genre-christmas"]'); assert.match(adult.d.querySelector('#modal-content').textContent,/Home Alone/); click(adult,'[data-action="movie-watch-christmas-0"]'); assert.equal(adult.save().balance,80);
});

test('a child in university continues their studies as the successor', () => {
  const initial=game().save(); Object.assign(initial,{age:45,alive:false,children:['Sam'],childBirthAges:[26],childBonds:[65],balance:1000,childProfiles:{0:{adopted:true,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:18,job:'',income:0,balance:500,partner:null}}});
  const g=game(initial,.9); click(g,'#review-life'); click(g,'[data-action="choose-successor"]'); click(g,'[data-action="successor-0"]'); click(g,'[data-action="inherit-0"]'); assert.equal(g.save().age,19); assert.equal(g.save().studying,true); assert.equal(g.save().studyStarted,18); assert.equal(g.save().studyMajor,'legacy'); assert.equal(g.save().balance,1500); assert.equal(g.save().stats.smarts,60);
});

test('OpenLife promotion chains carry named roles forward without changing legacy jobs', () => {
  const initial=game().save(); Object.assign(initial,{age:30,job:'Junior game developer',income:72000,careerLevel:1,careerPerformance:80,balance:50000,trait:'',extraTraits:[]}); let g=game(initial,.9); age(g,1); assert.equal(g.save().job,'Game developer'); assert.equal(g.save().income,82800); assert.equal(g.save().careerLevel,2);
  let next=g.save(); next.careerPerformance=80; g=game(next,.9); age(g,1); assert.equal(g.save().job,'Senior game developer'); assert.equal(g.save().income,95220);
  g=game({...initial,job:'Teacher',income:52000},.9); age(g,1); assert.equal(g.save().job,'Teacher'); assert.equal(g.save().income,59800);
});

test('mental conditions develop, can be treated independently, and some conditions recover', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:50000,stress:95,trait:'',extraTraits:[],parents:[],siblings:[],partner:null,friends:[]}); initial.stats.happiness=10; initial.stats.health=90;
  const g=game(initial,0); age(g,1); const names=[g.save().illness,...g.save().additionalIllnesses.map(c=>c.name)]; assert.ok(names.includes('depression')); assert.ok(names.includes('anxiety')); assert.ok(names.includes('loneliness'));
  const calm=game({...initial,stress:0,illness:'high blood pressure',illnessSince:29,additionalIllnesses:[],stats:{...initial.stats,happiness:90,health:90}},0); age(calm,1); assert.ok(![calm.save().illness,...calm.save().additionalIllnesses.map(c=>c.name)].includes('high blood pressure')); assert.match(calm.d.querySelector('#timeline').textContent,/no longer suffering from high blood pressure/);
  const happy=game({...initial,illness:'depression',illnessSince:29,additionalIllnesses:[],stats:{...initial.stats,happiness:90,health:90}},.9); age(happy,1); assert.equal(happy.save().illness,null);
  const treatment=game({...initial,illness:'anxiety',illnessSince:29,additionalIllnesses:[{name:'loneliness',since:29}]},0); click(treatment,'[data-panel="activities"]'); click(treatment,'[data-action="doctor"]'); click(treatment,'[data-action="doctor-treat-0"]'); assert.equal(treatment.save().illness,'loneliness');
});

test('page-by-page reading persists, can be resumed without moments, and rewards once on completion', () => {
  const initial=game().save(); Object.assign(initial,{age:10,moments:1,trait:'bookworm',extraTraits:[]}); initial.stats.happiness=40; initial.stats.smarts=40;
  const g=game(initial); click(g,'[data-panel="activities"]'); click(g,'[data-action="reading-session"]'); click(g,'[data-action="reading-begin-3"]'); assert.equal(g.save().moments,0); assert.deepEqual(g.save().readingBook,{index:3,pages:0}); click(g,'[data-action="reading-page-1"]'); assert.equal(g.save().readingBook.pages,1);
  const resumed=game(g.save()); click(resumed,'[data-panel="activities"]'); click(resumed,'[data-action="reading-session"]'); assert.match(resumed.d.querySelector('#modal-content').textContent,/1 of/); click(resumed,'[data-action="reading-page-50"]'); assert.equal(resumed.save().readingBook,null); assert.equal(resumed.save().stats.happiness,45); assert.equal(resumed.save().stats.smarts,42); assert.equal(resumed.save().moments,0);
});

test('reading can be abandoned and invalid reading progress cannot be restored', async () => {
  const initial=game().save(); Object.assign(initial,{age:10,moments:3}); const g=game(initial); click(g,'[data-panel="activities"]'); click(g,'[data-action="reading-session"]'); click(g,'[data-action="reading-begin-3"]'); click(g,'[data-action="reading-page-1"]'); click(g,'[data-action="reading-abandon"]'); assert.equal(g.save().readingBook,null); assert.match(g.d.querySelector('#timeline').textContent,/abandoned/);
  const old={...initial}; delete old.readingBook; assert.equal(game(old).save().readingBook,null);
  const receiver=game(); click(receiver,'#save-menu'); const input=receiver.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new receiver.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:{...initial,readingBook:{index:3,pages:999999}}})],'invalid.json')]}); const done=waitFor(receiver,()=>!!receiver.d.querySelector('#data-message') && receiver.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new receiver.dom.window.Event('change',{bubbles:true})); await done; assert.equal(receiver.save().readingBook,null);
});

test('potential dates have persistent profiles and can accept, age and break up', () => {
  const initial=game().save(); Object.assign(initial,{age:30,trait:'',extraTraits:[],moments:1}); const g=game(initial,0); click(g,'[data-panel="relationships"]'); click(g,'[data-action="meet-date"]'); const candidate=g.save().dateCandidate; assert.equal(g.save().moments,0); assert.equal(candidate.age,25); assert.match(g.d.querySelector('#modal-content').textContent,/Craziness/); click(g,'.close-modal');
  const reloaded=game(g.save(),0); click(reloaded,'[data-panel="relationships"]'); click(reloaded,'[data-action="meet-date"]'); click(reloaded,'[data-action="date-ask"]'); assert.equal(reloaded.save().partner,candidate.name); assert.equal(reloaded.save().partnerDetails.age,25); assert.equal(reloaded.save().dateCandidate,null); assert.equal(reloaded.save().moments,0); age(reloaded,1); assert.equal(reloaded.save().partnerDetails.age,26); act(reloaded,'relationships','breakup'); click(reloaded,'[data-action="breakup-final"]'); assert.equal(reloaded.save().partnerDetails,null);
});

test('potential dates may decline or be declined, and malformed profiles cannot be imported', async () => {
  const initial=game().save(); Object.assign(initial,{age:30,trait:'',extraTraits:[]}); initial.stats.smarts=0; initial.stats.looks=0;
  const rejected=game(initial,.9); click(rejected,'[data-panel="relationships"]'); click(rejected,'[data-action="meet-date"]'); click(rejected,'[data-action="date-ask"]'); assert.equal(rejected.save().partner,null); assert.match(rejected.d.querySelector('#timeline').textContent,/declined my invitation/);
  const declined=game(initial,.9); click(declined,'[data-panel="relationships"]'); click(declined,'[data-action="meet-date"]'); click(declined,'[data-action="date-decline"]'); assert.equal(declined.save().dateCandidate,null); assert.equal(declined.save().moments,2);
  const old={...initial}; delete old.partnerDetails; delete old.dateCandidate; assert.equal(game(old).save().partnerDetails,null);
  const receiver=game(); click(receiver,'#save-menu'); const input=receiver.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new receiver.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:{...initial,dateCandidate:{name:'Alex',age:10,smarts:50,looks:50,craziness:50,willpower:50}}})],'bad.json')]}); const done=waitFor(receiver,()=>!!receiver.d.querySelector('#data-message') && receiver.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new receiver.dom.window.Event('change',{bubbles:true})); await done; assert.equal(receiver.save().dateCandidate,null);
});

test('divorce requires confirmation and pays a cash settlement, while a breakup does not', () => {
  const initial=game().save(); Object.assign(initial,{age:40,balance:10000,partner:'Jamie',partnerBond:80,married:true,will:{mode:'spouse',child:null},trait:'',extraTraits:[]});
  const g=game(initial,.5); click(g,'[data-panel="relationships"]'); click(g,'[data-action="breakup"]'); assert.match(g.d.querySelector('#modal-content').textContent,/40–60%/); click(g,'.close-modal'); assert.equal(g.save().partner,'Jamie'); assert.equal(g.save().balance,10000); assert.equal(g.save().moments,3);
  act(g,'relationships','breakup'); click(g,'[data-action="breakup-final"]'); assert.equal(g.save().balance,5000); assert.equal(g.save().partner,null); assert.equal(g.save().will.mode,'legacy'); assert.match(g.d.querySelector('#timeline').textContent,/divorce settlement paid \$5,000/);
  const unwed=game({...initial,married:false,will:{mode:'legacy',child:null}},.5); act(unwed,'relationships','breakup'); click(unwed,'[data-action="breakup-final"]'); assert.equal(unwed.save().balance,10000);
});

test('automatic end of a marriage also applies the divorce settlement', () => {
  const initial=game().save(); Object.assign(initial,{age:40,balance:30000,partner:'Jamie',partnerBond:2,married:true,will:{mode:'spouse',child:null},trait:'',extraTraits:[]}); const g=game(initial,.5); age(g,1); assert.equal(g.save().partner,null); assert.equal(g.save().balance,3000); assert.equal(g.save().will.mode,'legacy'); assert.match(g.d.querySelector('#timeline').textContent,/divorce settlement/);
});

test('kidnapping choices can rescue a partner or result in their presumed death without divorce settlement', () => {
  const initial=game().save(); const eventId=game(undefined,.9,true).dom.window.__events.findIndex(e=>e.title==='A kidnapping'); assert.ok(eventId>=0); Object.assign(initial,{age:40,balance:2000000,partner:'Morgan',married:true,partnerBond:50,will:{mode:'spouse',child:null},trait:'',extraTraits:[],karma:50,pending:eventId,kidnappingRansom:800000});
  const paid=game(initial,0); assert.match(paid.d.querySelector('#modal-content').textContent,/\$800,000/); click(paid,'[data-action="choice-0"]'); assert.equal(paid.save().balance,1200000); assert.equal(paid.save().partner,'Morgan'); assert.equal(paid.save().partnerBond,80); assert.equal(paid.save().kidnappingRansom,null);
  const failed=game(initial,.9); click(failed,'[data-action="choice-0"]'); assert.equal(failed.save().balance,1200000); assert.equal(failed.save().partner,null); assert.equal(failed.save().will.mode,'legacy'); assert.doesNotMatch(failed.d.querySelector('#timeline').textContent,/divorce settlement/);
  const police=game(initial,0); click(police,'[data-action="choice-1"]'); assert.equal(police.save().balance,2000000); assert.equal(police.save().partner,'Morgan');
  const ignored=game(initial,0); click(ignored,'[data-action="choice-2"]'); assert.equal(ignored.save().karma,42); assert.equal(ignored.save().partner,null); assert.equal(ignored.save().balance,2000000);
});

test('kidnapping backups reject invalid ransom and preserve unresolved decisions', async () => {
  const initial=game().save(); const eventId=game(undefined,.9,true).dom.window.__events.findIndex(e=>e.title==='A kidnapping'); Object.assign(initial,{age:40,balance:2000000,partner:'Morgan',pending:eventId,kidnappingRansom:800000});
  async function restore(saved,valid) { const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:saved})],'kidnap.json')]}); const done=waitFor(g,()=>valid ? g.d.querySelector('#modal-title').textContent.includes('Replace') : !!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; if(valid) click(g,'[data-action="import-confirm"]'); return g; }
  const g=await restore(initial,true); assert.match(g.d.querySelector('#modal-title').textContent,/kidnapping/i); assert.equal(g.save().kidnappingRansom,800000); click(g,'[data-action="choice-1"]'); assert.match(g.d.querySelector('#modal-title').textContent,/Remembering/); assert.equal(g.save().funeralQueue[0].name,'Morgan'); choose(g); assert.equal(g.save().pending,null);
  await restore({...initial,kidnappingRansom:3000000},false); await restore({...initial,partner:null},false);
});

test('rare lightning outcomes include rejuvenation, injury and death', () => {
  const initial=game().save(); const eventId=game(undefined,.9,true).dom.window.__events.findIndex(e=>e.title==='Struck by lightning'); assert.ok(eventId>=0); Object.assign(initial,{age:30,pending:eventId,trait:'',extraTraits:[]});
  const lucky=game(initial,0); click(lucky,'[data-action="choice-0"]'); assert.deepEqual(lucky.save().stats,{happiness:100,health:100,smarts:100,looks:100}); assert.equal(lucky.save().alive,true);
  const hurt=game(initial,.9); click(hurt,'[data-action="choice-0"]'); assert.equal(hurt.save().stats.health,1); assert.equal(hurt.save().alive,true);
  const fatal=game(initial,.9); let values=[.9,.1]; fatal.dom.window.Math.random=()=>values.shift() ?? .9; click(fatal,'[data-action="choice-0"]'); assert.equal(fatal.save().alive,false); assert.match(fatal.d.querySelector('#modal-title').textContent,/remember/);
});

test('progressive salary tax uses the upstream marginal brackets and preserves the legacy flat option', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:0,job:'Barista',income:28000,careerPerformance:50,trait:'',extraTraits:[]}); const g=game(initial,.9);
  click(g,'[data-panel="assets"]'); click(g,'[data-action="tax-rules"]'); click(g,'[data-action="tax-progressive"]'); assert.equal(g.save().moments,3); assert.equal(g.save().taxPolicy,'progressive'); age(g,1); assert.equal(g.save().balance,12839); assert.match(g.d.querySelector('#timeline').textContent,/taxes were \$3,161/);
  const high=game({...initial,income:100000,taxPolicy:'progressive'},.9); age(high,1); assert.equal(high.save().balance,69979); assert.match(high.d.querySelector('#timeline').textContent,/taxes were \$18,021/);
  const flat=game(initial,.9); age(flat,1); assert.equal(flat.save().balance,10400);
  const old={...initial}; delete old.taxPolicy; assert.equal(game(old).save().taxPolicy,'flat');
});

test('progressive tax mode follows generations and invalid modes are rejected in backups', async () => {
  const initial=game().save(); Object.assign(initial,{age:50,alive:false,taxPolicy:'progressive',children:['Sam'],childBirthAges:[30],childBonds:[65]}); const heir=game(initial); click(heir,'#review-life'); click(heir,'[data-action="choose-successor"]'); click(heir,'[data-action="successor-0"]'); click(heir,'[data-action="inherit-0"]'); assert.equal(heir.save().taxPolicy,'progressive');
  const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:{...initial,taxPolicy:'invalid'}})],'bad.json')]}); const done=waitFor(g,()=>!!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.equal(g.save().taxPolicy,'flat');
});

test('career-based pensions require ten recorded years and use the highest five salaries', () => {
  const initial=game().save(); Object.assign(initial,{age:65,balance:50000,job:'Barista',income:50000,careerPerformance:55,workYears:9,salaryHistory:[30000,32000,34000,36000,38000,40000,42000,44000,46000],trait:'',extraTraits:[]}); const g=game(initial,.9);
  click(g,'[data-panel="occupation"]'); click(g,'[data-action="pension-rules"]'); click(g,'[data-action="pension-career"]'); assert.equal(g.save().moments,3);
  click(g,'[data-panel="occupation"]'); assert.equal(g.d.querySelector('[data-action="retire"]').disabled,true); click(g,'.close-modal'); age(g,1); assert.equal(g.save().workYears,10); assert.equal(g.save().salaryHistory.at(-1),50000);
  act(g,'occupation','retire'); click(g,'[data-action="retire-confirm"]'); assert.equal(g.save().income,8880); assert.equal(g.save().retired,true); // (50000+46000+44000+42000+40000)/5 * .20
  age(g,1); act(g,'occupation','job'); applyJob(g,0); assert.equal(g.save().workYears,0); assert.deepEqual(g.save().salaryHistory,[]);
});

test('pension settings and salary histories migrate and reject malformed backups', async () => {
  const old=game().save(); delete old.pensionPolicy; delete old.workYears; delete old.salaryHistory; const restored=game(old).save(); assert.equal(restored.pensionPolicy,'flat'); assert.equal(restored.workYears,0); assert.deepEqual(restored.salaryHistory,[]);
  const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:{...old,pensionPolicy:'career',workYears:0,salaryHistory:[50000]}})],'bad.json')]}); const done=waitFor(g,()=>!!g.d.querySelector('#data-message') && g.d.querySelector('#data-message').textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.equal(g.save().pensionPolicy,'flat');
});

test('career-based rules may require retirement from age seventy', () => {
  const initial=game().save(); Object.assign(initial,{age:69,balance:50000,job:'Barista',income:50000,careerPerformance:50,pensionPolicy:'career',workYears:10,salaryHistory:Array(10).fill(50000),trait:'',extraTraits:[]}); initial.stats.health=100; const g=game(initial,0); age(g,1); assert.equal(g.save().retired,true); assert.equal(g.save().job,''); assert.equal(g.save().income,11000); assert.match(g.d.querySelector('#timeline').textContent,/required to retire/);
});

test('leaving a job clears career pension records before a new career', () => {
  const initial=game().save(); Object.assign(initial,{age:40,job:'Barista',income:28000,workYears:10,salaryHistory:Array(10).fill(28000),pensionPolicy:'career'}); const g=game(initial); act(g,'occupation','quit'); click(g,'[data-action="quit-confirm"]'); assert.equal(g.save().job,''); assert.equal(g.save().workYears,0); assert.deepEqual(g.save().salaryHistory,[]);
});

test('compliments report appreciation and only reward the first per person each year', () => {
  const initial=game().save(); Object.assign(initial,{age:25,trait:'',extraTraits:[],karma:50}); initial.parents[0].bond=60; const g=game(initial,.5);
  function compliment(){click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-compliment-parent-0"]');}
  compliment(); const first=g.save(); assert.equal(first.parents[0].bond,68); assert.equal(first.karma,52); assert.match(g.d.querySelector('#timeline').textContent,/Appreciation: 50%/); assert.deepEqual(first.socialCompliments,['parent-0']);
  compliment(); assert.equal(g.save().parents[0].bond,68); assert.equal(g.save().karma,52); age(g,1); assert.deepEqual(g.save().socialCompliments,[]);
});

test('insulting a partner can provoke an attack based on their profile', () => {
  const initial=game().save(); Object.assign(initial,{age:30,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[],partnerDetails:{age:30,smarts:60,looks:60,craziness:100,willpower:50}}); initial.stats.health=80; const g=game(initial,0);
  click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-partner-0"]'); click(g,'[data-action="social-do-insult-partner-0"]'); click(g,'[data-action="social-insult-confirm-partner-0"]'); assert.equal(g.save().stats.health,76); assert.equal(g.save().partnerBond,64); assert.match(g.d.querySelector('#timeline').textContent,/attacked me/);
});

test('a random invitation to date persists as a choice and carries the suitor profile', () => {
  const initial=game().save(); const eventId=game(undefined,.9,true).dom.window.__events.findIndex(e=>e.title==='An invitation to date'); assert.ok(eventId>=0); const candidate={name:'Taylor',age:28,smarts:70,looks:75,craziness:30,willpower:60}; Object.assign(initial,{age:30,pending:eventId,dateCandidate:candidate,trait:'',extraTraits:[]});
  const accepted=game(initial,.9); assert.match(accepted.d.querySelector('#modal-content').textContent,/Taylor, age 28/); click(accepted,'[data-action="choice-0"]'); assert.equal(accepted.save().partner,'Taylor'); assert.equal(accepted.save().partnerDetails.smarts,70); assert.equal(accepted.save().dateCandidate,null); assert.equal(accepted.save().moments,3);
  const refused=game(initial,.9); click(refused,'[data-action="choice-1"]'); assert.equal(refused.save().partner,null); assert.equal(refused.save().dateCandidate,null);
});

test('a pregnancy may be continued or ended with confirmation even after a breakup', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:5000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[]}); const g=game(initial,.9); act(g,'relationships','try-baby'); act(g,'relationships','end-pregnancy'); click(g,'.close-modal'); assert.equal(g.save().pregnancy.coParent,'Morgan'); assert.equal(g.save().moments,2);
  act(g,'relationships','breakup'); click(g,'[data-action="breakup-final"]'); act(g,'relationships','end-pregnancy'); click(g,'[data-action="end-pregnancy-final"]'); assert.equal(g.save().pregnancy,null); assert.equal(g.save().moments,0); age(g,1); assert.equal(g.save().children.length,0); assert.match(g.d.querySelector('#timeline').textContent,/end the pregnancy/);
});

test('grown children can end relationships and their own income follows selected tax rules', () => {
  const initial=game().save(); Object.assign(initial,{age:50,balance:50000,taxPolicy:'progressive',children:['Sam'],childBirthAges:[25],childBonds:[65],trait:'',extraTraits:[],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:0,partner:{name:'Riley',since:20,married:true}}}});
  const g=game(initial,0); age(g,1); const child=g.save().childProfiles['0']; assert.equal(child.partner,null); assert.equal(child.balance,12839); assert.match(g.d.querySelector('#timeline').textContent,/Sam and Riley divorced/);
});

test('financial overview totals assets and liabilities and estimates yearly flow', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:10000,savings:5000,debt:3000,studentLoan:2000,investment:1000,job:'Barista',income:28000,jobHours:40,taxPolicy:'progressive',assets:['Bicycle'],assetValues:{Bicycle:350}}); initial.portfolio[0].units=2;
  const g=game(initial); click(g,'[data-panel="assets"]'); click(g,'[data-action="financial-overview"]'); const text=g.d.querySelector('#modal-content').textContent; assert.match(text,/Net worth\$11,440/); assert.match(text,/Estimated income tax-\$3,161/); assert.match(text,/Estimated annual cash flow\$12,839/); assert.equal(g.save().moments,3);
  const owed=game({...initial,balance:0,savings:0,investment:0,debt:3000,studentLoan:2000,assets:[],assetValues:{},portfolio:initial.portfolio.map(h=>({...h,units:0}))}); click(owed,'[data-panel="assets"]'); click(owed,'[data-action="financial-overview"]'); assert.match(owed.d.querySelector('#modal-content').textContent,/Net worth-\$5,000/);
});

test('working hours can be any integer from 38 through 70 and invalid form values do not spend time', () => {
  const initial=game().save(); Object.assign(initial,{age:30,job:'Barista',income:28000}); const g=game(initial); click(g,'[data-panel="occupation"]'); click(g,'[data-action="hours"]'); const form=g.d.querySelector('#hours-form'), input=g.d.querySelector('#hours-input');
  input.value='71'; form.dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(g.save().moments,3); assert.match(g.d.querySelector('#hours-error').textContent,/38 to 70/);
  input.value='47'; form.dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(g.save().jobHours,47); assert.equal(g.save().moments,2);
});

test('life review reports recorded lifetime happiness and karma without inventing old history', () => {
  const initial=game().save(); Object.assign(initial,{age:20,alive:false,happinessYears:2,happinessTotal:100,karma:63}); initial.stats.happiness=80; const g=game(initial); click(g,'#review-life'); const text=g.d.querySelector('#modal-content').textContent; assert.match(text,/LIFETIME HAPPINESS59%/); assert.match(text,/KARMA63%/); assert.match(text,/2 recorded years \(earlier years were not recorded\)/);
  delete initial.happinessTotal; delete initial.happinessYears; const legacy=game(initial); click(legacy,'#review-life'); assert.match(legacy.d.querySelector('#modal-content').textContent,/LIFETIME HAPPINESS80%/);
  const living=game({...initial,alive:true,age:20},.9); const before=living.save().stats.happiness; age(living,1); assert.equal(living.save().happinessTotal,before); assert.equal(living.save().happinessYears,1);
});

test('local save slots preserve separate lives and require confirmation before loading or deleting', () => {
  const initial=game().save(); Object.assign(initial,{age:30,name:'First Life'}); const g=game(initial); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/i); assert.match(g.d.querySelector('#modal-content').textContent,/First Life/);
  click(g,'.close-modal'); click(g,'#new-life'); g.d.querySelector('#new-name').value='Second Life'; g.d.querySelector('#new-life-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(g.save().name,'Second Life');
  click(g,'#save-menu'); click(g,'[data-action="slot-load-0"]'); assert.equal(g.save().name,'Second Life'); click(g,'[data-action="slot-cancel"]'); click(g,'[data-action="slot-load-0"]'); click(g,'[data-action="slot-confirm"]'); assert.equal(g.save().name,'First Life'); assert.equal(g.save().age,30);
  click(g,'#save-menu'); click(g,'[data-action="slot-delete-0"]'); click(g,'[data-action="slot-cancel"]'); assert.ok(g.d.querySelector('[data-action="slot-load-0"]')); click(g,'[data-action="slot-delete-0"]'); click(g,'[data-action="slot-confirm"]'); assert.equal(g.d.querySelector('[data-action="slot-load-0"]'),null); assert.equal(g.save().name,'First Life');
});

test('local slots survive reload, honor limits, and refuse corrupt or full storage', () => {
  const source=game(); click(source,'#save-menu'); click(source,'[data-action="slot-save"]'); const raw=source.dom.window.localStorage.getItem('little-life-slots-v1'); const reload=game(source.save()); reload.dom.window.localStorage.setItem('little-life-slots-v1',raw); click(reload,'#save-menu'); assert.ok(reload.d.querySelector('[data-action="slot-load-0"]'));
  const slots=JSON.parse(raw); reload.dom.window.localStorage.setItem('little-life-slots-v1',JSON.stringify(Array.from({length:10},(_,i)=>({...slots[0],id:`slot-${i}`})))); click(reload,'#save-menu'); assert.equal(reload.d.querySelector('[data-action="slot-save"]').disabled,true);
  reload.dom.window.localStorage.setItem('little-life-slots-v1','{broken'); click(reload,'#save-menu'); assert.equal(reload.d.querySelector('[data-action="slot-save"]').disabled,true); assert.match(reload.d.querySelector('#data-message').textContent,/could not be read/); assert.equal(reload.dom.window.localStorage.getItem('little-life-slots-v1'),'{broken');
  const full=game(); const storage=full.dom.window.Storage.prototype, original=storage.setItem; storage.setItem=function(key,value){if(key==='little-life-slots-v1') throw new Error('quota exceeded'); return original.call(this,key,value);}; click(full,'#save-menu'); click(full,'[data-action="slot-save"]'); assert.match(full.d.querySelector('#data-message').textContent,/Could not save/); assert.equal(full.dom.window.localStorage.getItem('little-life-slots-v1'),null);
});

test('upstream country catalogue is available for birthplaces and emigration', () => {
  const g=game(); click(g,'#new-life'); const select=g.d.querySelector('#new-city'); assert.ok([...select.options].some(option=>option.value==='Afghanistan')); assert.ok([...select.options].some(option=>option.value==='Zimbabwe')); select.value='Japan'; g.d.querySelector('#new-life-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(g.save().city,'Japan');
  const initial=g.save(); Object.assign(initial,{age:30,balance:10000,job:'Barista',income:28000,workYears:5,salaryHistory:Array(5).fill(28000)}); const emigrant=game(initial); click(emigrant,'[data-panel="activities"]'); click(emigrant,'[data-action="travel"]'); click(emigrant,'[data-action="move-country-menu"]'); const country=emigrant.d.querySelector('#country-move'), option=[...country.options].find(item=>item.textContent==='France'); assert.ok(option); country.value=option.value; emigrant.d.querySelector('#country-move-form').dispatchEvent(new emigrant.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(emigrant.save().city,'France'); assert.equal(emigrant.save().balance,7000); assert.equal(emigrant.save().job,''); assert.equal(emigrant.save().workYears,0); assert.equal(emigrant.save().moments,2);
});

test('backups reject impossible lifetime happiness records without replacing the current life', async () => {
  for (const record of [{happinessYears:1,happinessTotal:101},{happinessYears:2,happinessTotal:10},{happinessYears:0,happinessTotal:1},{happinessYears:0.5,happinessTotal:20}]) {
    const g=game(); const before=g.save(); const invalid={...before,age:1,...record}; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before);
  }
});

test('custom bank transactions accept exact amounts and reject invalid or unavailable funds', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:5000,savings:2000,debt:3000}); const g=game(initial);
  const open=()=>{click(g,'[data-panel="assets"]'); click(g,'[data-action="bank-custom"]');};
  const submit=(kind,amount)=>{g.d.querySelector('#bank-kind').value=kind; g.d.querySelector('#bank-amount').value=amount; g.d.querySelector('#bank-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true}));};
  open(); submit('deposit','6000'); assert.match(g.d.querySelector('#bank-error').textContent,/\$5,000/); assert.equal(g.save().moments,3); submit('deposit','0'); assert.equal(g.save().balance,5000); submit('deposit','1250'); assert.equal(g.save().balance,3750); assert.equal(g.save().savings,3250); assert.equal(g.save().moments,2);
  open(); submit('withdraw','2500'); assert.equal(g.save().balance,6250); assert.equal(g.save().savings,750);
  open(); submit('repay','3001'); assert.equal(g.save().debt,3000); submit('repay','2100'); assert.equal(g.save().balance,4150); assert.equal(g.save().debt,900); assert.equal(g.save().moments,0);
  const borrowed=game(initial); click(borrowed,'[data-panel="assets"]'); click(borrowed,'[data-action="bank-custom"]'); borrowed.d.querySelector('#bank-kind').value='borrow'; borrowed.d.querySelector('#bank-amount').value='777'; borrowed.d.querySelector('#bank-form').dispatchEvent(new borrowed.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(borrowed.save().balance,5777); assert.equal(borrowed.save().debt,3777); assert.equal(borrowed.save().moments,2);
});

test('custom bank transactions respect storage bounds and game restrictions', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:999999999999,savings:2,debt:0}); const g=game(initial); click(g,'[data-panel="assets"]'); click(g,'[data-action="bank-custom"]'); g.d.querySelector('#bank-kind').value='withdraw'; g.d.querySelector('#bank-amount').value='2'; g.d.querySelector('#bank-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.match(g.d.querySelector('#bank-error').textContent,/\$1/); assert.equal(g.save().savings,2); assert.equal(g.save().moments,3);
  g.d.querySelector('#bank-kind').value='repay'; g.d.querySelector('#bank-amount').value='1'; g.d.querySelector('#bank-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.match(g.d.querySelector('#bank-error').textContent,/No amount/); assert.equal(g.save().debt,0);
  const young=game({...initial,age:17}); click(young,'[data-panel="assets"]'); assert.equal(young.d.querySelector('[data-action="bank-custom"]').disabled,true);
});

test('market bulk trades enforce cash and unit limits and cost one moment', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:1000}); initial.portfolio[0]={price:100,units:2}; const g=game(initial);
  function open(){click(g,'[data-panel="assets"]'); click(g,'[data-action="market"]'); click(g,'[data-action="market-custom"]');}
  function trade(direction,units){g.d.querySelector('#market-direction').value=direction; g.d.querySelector('#market-units').value=units; g.d.querySelector('#market-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true}));}
  open(); trade('buy','11'); assert.match(g.d.querySelector('#market-error').textContent,/1 to 10/); assert.equal(g.save().moments,3); trade('buy','5'); assert.equal(g.save().balance,500); assert.equal(g.save().portfolio[0].units,7); assert.equal(g.save().moments,2);
  open(); trade('sell','8'); assert.match(g.d.querySelector('#market-error').textContent,/1 to 7/); trade('sell','3'); assert.equal(g.save().balance,800); assert.equal(g.save().portfolio[0].units,4); assert.equal(g.save().moments,1); assert.match(g.d.querySelector('#timeline').textContent,/sold 3 units/);
});

test('market bulk trades enforce storage ceiling and ownership', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:999999999950}); initial.portfolio[0]={price:100,units:10}; const g=game(initial); click(g,'[data-panel="assets"]'); click(g,'[data-action="market"]'); click(g,'[data-action="market-custom"]'); g.d.querySelector('#market-direction').value='sell'; g.d.querySelector('#market-units').value='1'; g.d.querySelector('#market-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.match(g.d.querySelector('#market-error').textContent,/No units/); assert.equal(g.save().portfolio[0].units,10); assert.equal(g.save().moments,3);
});

test('high-value finances stay within backup limits through growth, salary and inheritance', () => {
  const max=1000000000000, initial=game().save(); Object.assign(initial,{age:40,balance:max-10,investment:max,job:'Barista',income:max,careerPerformance:85,trait:'',extraTraits:[],parents:[{name:'Morgan',age:79,endAge:80,bond:80,alive:true,inheritance:100000}],siblings:[]});
  const g=game(initial,.9); age(g,1); const result=g.save(); assert.equal(result.balance,max); assert.equal(result.investment,max); assert.equal(result.income,max); assert.equal(result.salaryHistory.at(-1),max); assert.match(g.d.querySelector('#timeline').textContent,/cash reached the game.s/); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/Local copy saved/);
});

test('sales and fund deposits that would overflow are disabled instead of destroying assets', () => {
  const max=1000000000000, initial=game().save(); Object.assign(initial,{age:30,balance:max,investment:max,assets:['Bicycle'],assetValues:{Bicycle:350}}); const g=game(initial); click(g,'[data-panel="assets"]'); assert.equal(g.d.querySelector('[data-action="withdraw"]').disabled,true); assert.equal(g.d.querySelector('[data-action="invest"]').disabled,true); assert.equal(g.d.querySelector('[data-action="sell-bike"]').disabled,true); assert.equal(g.save().balance,max); assert.deepEqual(g.save().assets,['Bicycle']); assert.equal(g.save().investment,max);
});

test('exceptional cash gifts are bounded and remain locally saveable', () => {
  const max=1000000000000, initial=game().save(); Object.assign(initial,{age:30,balance:max-20,parents:[{name:'Morgan',age:55,endAge:90,bond:80,alive:true,inheritance:1000}],siblings:[]}); const g=game(initial,0.1); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-ask-parent-0"]'); assert.equal(g.save().balance,max); assert.match(g.d.querySelector('#timeline').textContent,/cash reached the game.s/); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/Local copy saved/);
});

test('free policy changes do not grow the timeline and previously long histories remain saveable', () => {
  const initial=game().save(); Object.assign(initial,{age:30,job:'Barista',income:28000}); initial.history[0].entries=Array.from({length:101},(_,i)=>`Earlier setting change ${i}`); const g=game(initial);
  for (let i=0;i<4;i++) { click(g,'[data-panel="assets"]'); click(g,'[data-action="tax-rules"]'); click(g,`[data-action="tax-${i%2?'flat':'progressive'}"]`); }
  assert.equal(g.save().history[0].entries.length,101); assert.equal(g.save().moments,3); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/Local copy saved/);
});

test('complete lives remain valid for local save slots across different random outcomes', () => {
  for (const random of [0.1,0.5,0.9]) {
    const g=game(undefined,random); for (let year=0;year<100 && g.save().alive;year++) {
      if (g.save().age >= 5 && year%4===0) { act(g,'activities','walk'); }
      age(g,1);
    }
    assert.equal(g.save().alive,false); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/Local copy saved/,`random ${random}, age ${g.save().age}`);
  }
});

test('new parent profiles show generosity and wealth ratings that affect financial requests', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:0,parents:[{name:'Morgan',age:55,endAge:90,bond:70,alive:true,inheritance:3000,generosity:100,wealth:100}],siblings:[]}); const g=game(initial,.5);
  click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); assert.match(g.d.querySelector('#modal-content').textContent,/Generosity 100% · Wealth rating 100%/); click(g,'[data-action="social-do-ask-parent-0"]'); assert.equal(g.save().balance,Math.round(5**(100/22)*Math.sqrt(30))); assert.equal(g.save().parents[0].inheritance,3000);
  const ungenerous=game({...initial,parents:[{...initial.parents[0],generosity:0}]},.5); click(ungenerous,'[data-panel="relationships"]'); click(ungenerous,'[data-action="social"]'); click(ungenerous,'[data-action="social-target-parent-0"]'); click(ungenerous,'[data-action="social-do-ask-parent-0"]'); assert.equal(ungenerous.save().balance,0); assert.equal(ungenerous.save().parents[0].bond,65); assert.match(ungenerous.d.querySelector('#timeline').textContent,/declined/);
});

test('old parent saves keep the bond-based request rule and invalid profiles are rejected', async () => {
  const old=game().save(); Object.assign(old,{age:30,balance:0,parents:[{name:'Morgan',age:55,endAge:90,bond:70,alive:true,inheritance:1000}],siblings:[]}); const legacy=game(old,.5); click(legacy,'[data-panel="relationships"]'); click(legacy,'[data-action="social"]'); click(legacy,'[data-action="social-target-parent-0"]'); assert.doesNotMatch(legacy.d.querySelector('#modal-content').textContent,/Parent profile/); click(legacy,'[data-action="social-do-ask-parent-0"]'); assert.equal(legacy.save().balance,275);
  for (const profile of [{generosity:101,wealth:50},{generosity:50},{generosity:null,wealth:null}]) { const g=game(); const before=g.save(); const invalid={...old,parents:[{...old.parents[0],...profile}]}; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

test('local save slots remain distinct even when the ID generator repeats', () => {
  const g=game(); Object.defineProperty(g.dom.window.crypto,'randomUUID',{value:()=> 'same-id'}); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); click(g,'[data-action="slot-save"]'); click(g,'[data-action="slot-save"]'); const slots=JSON.parse(g.dom.window.localStorage.getItem('little-life-slots-v1')); assert.equal(new Set(slots.map(s=>s.id)).size,3); assert.ok(g.d.querySelector('[data-action="slot-load-2"]')); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
});

test('sibling profiles show attributes and petulance can reduce conversation agreement', () => {
  const initial=game().save(); Object.assign(initial,{age:30,trait:'',extraTraits:[],siblings:[{name:'Riley',age:32,endAge:90,bond:60,alive:true,smarts:80,looks:70,petulance:100}]});
  function talk(data) { const g=game(data,.49); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-sibling-0"]'); assert.match(g.d.querySelector('#modal-content').textContent,/Smarts 80% · Looks 70% · Petulance/); click(g,'[data-action="social-do-talk-sibling-0"]'); return g; }
  const petulant=talk(initial), calm=talk({...initial,siblings:[{...initial.siblings[0],petulance:0}]}); assert.match(petulant.d.querySelector('#timeline').textContent,/Agreement: 40%/); assert.match(calm.d.querySelector('#timeline').textContent,/Agreement: 56%/); assert.ok(petulant.save().siblings[0].bond<calm.save().siblings[0].bond);
  const legacy=game({...initial,siblings:[{name:'Riley',age:32,endAge:90,bond:60,alive:true}]},.49); click(legacy,'[data-panel="relationships"]'); click(legacy,'[data-action="social"]'); click(legacy,'[data-action="social-target-sibling-0"]'); assert.doesNotMatch(legacy.d.querySelector('#modal-content').textContent,/Sibling profile/); click(legacy,'[data-action="social-do-talk-sibling-0"]'); assert.match(legacy.d.querySelector('#timeline').textContent,/Agreement: 56%/);
});

test('heirs retain a sibling’s known child attributes without fabricating older profiles', () => {
  const initial=game().save(); Object.assign(initial,{age:60,alive:false,children:['Sam','Riley','Alex'],childBirthAges:[30,32,34],childBonds:[65,65,65],childProfiles:{1:{adopted:false,happiness:70,health:80,smarts:83,looks:64,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:200,partner:null}}}); const g=game(initial,.5); click(g,'#review-life'); click(g,'[data-action="choose-successor"]'); click(g,'[data-action="successor-0"]'); click(g,'[data-action="inherit-0"]'); assert.equal(g.save().siblings[0].smarts,83); assert.equal(g.save().siblings[0].looks,64); assert.equal(g.save().siblings[0].petulance,50); assert.equal(g.save().siblings[1].petulance,undefined); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
});

test('backup rejects malformed sibling profiles without replacing the current life', async () => {
  for (const profile of [{smarts:70,looks:80,petulance:101},{smarts:70,looks:80},{smarts:null,looks:null,petulance:null}]) { const g=game(); const before=g.save(); const invalid={...before,age:30,siblings:[{name:'Riley',age:32,endAge:90,bond:60,alive:true,...profile}]}; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

test('child happiness records continue into their playable life without inventing prior years', () => {
  const initial=game().save(); Object.assign(initial,{age:40,balance:10000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[]}); const g=game(initial,.5); act(g,'relationships','child'); const born=g.save().childProfiles[0]; assert.equal(born.happinessYears,0); const first=born.happiness; age(g,1); let child=g.save().childProfiles[0]; assert.equal(child.happinessYears,1); assert.equal(child.happinessTotal,first); const second=child.happiness; age(g,1); child=g.save().childProfiles[0]; assert.equal(child.happinessYears,2); assert.equal(child.happinessTotal,first+second);
  const heir=game({...g.save(),alive:false}); click(heir,'#review-life'); click(heir,'[data-action="choose-successor"]'); click(heir,'[data-action="successor-0"]'); click(heir,'[data-action="inherit-0"]'); assert.equal(heir.save().happinessYears,2); assert.equal(heir.save().happinessTotal,first+second); const deceased=game({...heir.save(),alive:false}); click(deceased,'#review-life'); const score=Math.round(child.happiness*.3+(first+second)/2*.7); assert.match(deceased.d.querySelector('#modal-content').textContent,new RegExp(`LIFETIME HAPPINESS${score}%`)); assert.doesNotMatch(deceased.d.querySelector('#modal-content').textContent,/earlier years were not recorded/);
});

test('old child profiles start recording only from migration and adopted children have no invented earlier years', () => {
  const initial=game().save(); Object.assign(initial,{age:40,children:['Sam'],childBirthAges:[30],childBonds:[65],childProfiles:{0:{adopted:true,happiness:70,health:80,smarts:60,looks:65,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null}}}); const g=game(initial,.9); assert.equal(g.save().childProfiles[0].happinessYears,0); age(g,1); assert.equal(g.save().childProfiles[0].happinessTotal,70); assert.equal(g.save().childProfiles[0].happinessYears,1); const heir=game({...g.save(),alive:false}); click(heir,'#review-life'); click(heir,'[data-action="choose-successor"]'); click(heir,'[data-action="successor-0"]'); click(heir,'[data-action="inherit-0"]'); assert.equal(heir.save().happinessYears,1); const dead=game({...heir.save(),alive:false}); click(dead,'#review-life'); assert.match(dead.d.querySelector('#modal-content').textContent,/earlier years were not recorded/);
});

test('child happiness history rejects impossible backup records', async () => {
  const base=game().save(); Object.assign(base,{age:40,children:['Sam'],childBirthAges:[30],childBonds:[65],childProfiles:{0:{adopted:true,happiness:70,health:80,smarts:60,looks:65,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null}}});
  for (const record of [{happinessYears:11,happinessTotal:1},{happinessYears:1,happinessTotal:101},{happinessYears:1},{happinessYears:0,happinessTotal:1}]) { const g=game(); const before=g.save(); const invalid={...base,childProfiles:{0:{...base.childProfiles[0],...record}}}; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

test('a profiled partner can pass away without a divorce settlement', () => {
  const initial=game().save(); Object.assign(initial,{age:50,balance:100000,partner:'Morgan',married:true,partnerBond:80,will:{mode:'spouse',child:null},partnerDetails:{age:79,endAge:80,smarts:70,looks:60,craziness:30,willpower:50},trait:'',extraTraits:[]}); const g=game(initial,.9); age(g,1); assert.equal(g.save().partner,null); assert.equal(g.save().partnerDetails,null); assert.equal(g.save().married,false); assert.equal(g.save().balance,88000); assert.equal(g.save().will.mode,'legacy'); assert.match(g.d.querySelector('#timeline').textContent,/Morgan, my spouse, passed away at age 80/); assert.doesNotMatch(g.d.querySelector('#timeline').textContent,/divorce settlement/); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
});

test('partner lifespans are persistent, optional for legacy profiles, and validated', async () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:50000,trait:'',extraTraits:[]}); const g=game(initial,0); act(g,'relationships','meet-date'); const candidate=g.save().dateCandidate; assert.ok(candidate.endAge>candidate.age); click(g,'[data-action="date-ask"]'); assert.equal(g.save().partnerDetails.endAge,candidate.endAge);
  const legacy=game({...initial,partner:'Morgan',partnerBond:80,partnerDetails:{age:79,smarts:50,looks:50,craziness:50,willpower:50}},.9); age(legacy,1); assert.equal(legacy.save().partner,'Morgan'); assert.equal(legacy.save().partnerDetails.endAge,undefined);
  for (const endAge of [28,151,null]) { const receiver=game(); const before=receiver.save(); const bad={...initial,dateCandidate:{name:'Sam',age:28,smarts:50,looks:50,craziness:50,willpower:50,endAge}}; click(receiver,'#save-menu'); const input=receiver.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new receiver.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:bad})],'bad.json')]}); const done=waitFor(receiver,()=>receiver.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new receiver.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(receiver.save(),before); }
});

test('recorded child career years and salaries transfer to an heir’s career pension', () => {
  const initial=game().save(); Object.assign(initial,{age:80,balance:50000,pensionPolicy:'career',children:['Sam'],childBirthAges:[16],childBonds:[65],trait:'',extraTraits:[],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:null,job:'Barista',income:50000,balance:0,partner:null,workYears:9,salaryHistory:Array(9).fill(50000)}}}); initial.stats.health=100; const g=game(initial,.9); age(g,1); const child=g.save().childProfiles[0]; assert.equal(child.workYears,10); assert.equal(child.salaryHistory.length,10);
  const heir=game({...g.save(),alive:false},.9); click(heir,'#review-life'); click(heir,'[data-action="choose-successor"]'); click(heir,'[data-action="successor-0"]'); click(heir,'[data-action="inherit-0"]'); assert.equal(heir.save().age,65); assert.equal(heir.save().workYears,10); assert.deepEqual(heir.save().salaryHistory,Array(10).fill(50000)); act(heir,'occupation','retire'); click(heir,'[data-action="retire-confirm"]'); assert.equal(heir.save().income,10000); assert.equal(heir.save().retired,true); click(heir,'#save-menu'); click(heir,'[data-action="slot-save"]'); assert.match(heir.d.querySelector('#data-message').textContent,/saved/);
});

test('older child career profiles begin recording at migration without fabricating past work', () => {
  const initial=game().save(); Object.assign(initial,{age:50,children:['Sam'],childBirthAges:[25],childBonds:[65],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:0,partner:null}}}); const g=game(initial,.9); assert.equal(g.save().childProfiles[0].workYears,0); assert.deepEqual(g.save().childProfiles[0].salaryHistory,[]); age(g,1); assert.equal(g.save().childProfiles[0].workYears,1); assert.deepEqual(g.save().childProfiles[0].salaryHistory,[28000]);
});

test('backup rejects impossible child career records', async () => {
  const base=game().save(); Object.assign(base,{age:50,children:['Sam'],childBirthAges:[25],childBonds:[65],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:0,partner:null}}});
  for (const record of [{workYears:9,salaryHistory:[]},{workYears:0,salaryHistory:[28000]},{workYears:2},{workYears:1,salaryHistory:[-1]}]) { const g=game(); const before=g.save(); const invalid={...base,childProfiles:{0:{...base.childProfiles[0],...record}}}; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

test('a rejected proposal cannot be repeated that year and resets for a different partner', () => {
  const initial=game().save(); Object.assign(initial,{age:30,partner:'Morgan',partnerBond:50,trait:'',extraTraits:[]}); const g=game(initial,.9); act(g,'relationships','propose'); assert.equal(g.save().proposalRejectedAt,30); assert.equal(g.save().partnerBond,45); assert.equal(g.save().moments,2); const reloaded=game(g.save(),.9); click(reloaded,'[data-panel="relationships"]'); assert.equal(reloaded.d.querySelector('[data-action="propose"]').disabled,true); click(reloaded,'.close-modal'); age(reloaded,1); click(reloaded,'[data-panel="relationships"]'); assert.equal(reloaded.d.querySelector('[data-action="propose"]').disabled,false); click(reloaded,'[data-action="breakup"]'); click(reloaded,'[data-action="breakup-final"]'); assert.equal(reloaded.save().proposalRejectedAt,null); act(reloaded,'relationships','date'); assert.equal(reloaded.save().proposalRejectedAt,null); click(reloaded,'[data-panel="relationships"]'); assert.equal(reloaded.d.querySelector('[data-action="propose"]').disabled,false);
});

test('calling off an engagement requires confirmation and leaves the relationship intact', () => {
  const initial=game().save(); Object.assign(initial,{age:30,partner:'Morgan',partnerBond:80,engaged:true}); const g=game(initial); act(g,'relationships','cancel-engagement'); assert.equal(g.save().engaged,true); assert.equal(g.save().moments,3); click(g,'[data-close].modal-secondary'); assert.equal(g.save().engaged,true); act(g,'relationships','cancel-engagement'); click(g,'[data-action="cancel-engagement-final"]'); assert.equal(g.save().engaged,false); assert.equal(g.save().partner,'Morgan'); assert.equal(g.save().partnerBond,65); assert.equal(g.save().moments,2);
});

test('proposal rejection history migrates and rejects invalid backups', async () => {
  const old=game().save(); delete old.proposalRejectedAt; assert.equal(game(old).save().proposalRejectedAt,null); for (const invalid of [{...old,proposalRejectedAt:1},{...old,age:30,partner:'Morgan',proposalRejectedAt:31}]) { const g=game(); const before=g.save(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

test('life statistics show education, conditions and finances without costing a moment', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:10000,savings:5000,debt:2000,studentLoan:1000,job:'Barista',income:28000,jobHours:50,education:'University',major:'computing',illness:'anxiety',illnessSince:28,additionalIllnesses:[{name:'the flu',since:30}],moments:0}); const g=game(initial); click(g,'[data-panel="assets"]'); click(g,'[data-action="life-statistics"]'); const text=g.d.querySelector('#modal-content').textContent; assert.match(text,/OccupationBarista/); assert.match(text,/DegreeComputer science & engineering/); assert.match(text,/Salary or pension\$35,000 per year/); assert.match(text,/Net worth\$12,000/); assert.match(text,/Conditionsanxiety, the flu/); assert.equal(g.save().moments,0); click(g,'[data-action="financial-overview"]'); assert.match(g.d.querySelector('#modal-content').textContent,/Annual salary or pension\$35,000/); assert.equal(g.save().moments,0);
});

test('life statistics remain available in prison and after death, with no projected earnings', () => {
  const initial=game().save(); Object.assign(initial,{age:40,balance:10000,prisonYears:2,moments:0}); const prison=game(initial); click(prison,'[data-panel="milestones"]'); click(prison,'[data-action="life-statistics"]'); assert.match(prison.d.querySelector('#modal-content').textContent,/OccupationIn prison/); click(prison,'[data-action="financial-overview"]'); assert.match(prison.d.querySelector('#modal-content').textContent,/Estimated living costs\$0/);
  const dead=game({...initial,alive:false,prisonYears:0}); click(dead,'#review-life'); click(dead,'[data-action="life-statistics"]'); assert.match(dead.d.querySelector('#modal-content').textContent,/OccupationAt rest/); click(dead,'[data-action="financial-overview"]'); assert.match(dead.d.querySelector('#modal-content').textContent,/Estimated annual cash flow\$0/);
});

test('insults require confirmation and a petulant sibling can retaliate', () => {
  const initial=game().save(); Object.assign(initial,{age:25,karma:50,trait:'',extraTraits:[],siblings:[{name:'Riley',age:26,endAge:90,bond:80,alive:true,smarts:70,looks:60,petulance:100}]}); initial.stats.health=80; const g=game(initial,0);
  function prompt(){click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-sibling-0"]'); click(g,'[data-action="social-do-insult-sibling-0"]');}
  prompt(); assert.equal(g.save().moments,3); assert.equal(g.save().karma,50); assert.match(g.d.querySelector('#modal-title').textContent,/Insult Riley/); click(g,'[data-close].modal-secondary'); assert.equal(g.save().siblings[0].bond,80); prompt(); click(g,'[data-action="social-insult-confirm-sibling-0"]'); assert.equal(g.save().moments,2); assert.equal(g.save().karma,46); assert.equal(g.save().siblings[0].bond,64); assert.equal(g.save().stats.health,76); assert.match(g.d.querySelector('#timeline').textContent,/Riley attacked me/);
  const returned=game(initial,.4); click(returned,'[data-panel="relationships"]'); click(returned,'[data-action="social"]'); click(returned,'[data-action="social-target-sibling-0"]'); click(returned,'[data-action="social-do-insult-sibling-0"]'); click(returned,'[data-action="social-insult-confirm-sibling-0"]'); assert.match(returned.d.querySelector('#timeline').textContent,/insulted me back/); assert.equal(returned.save().stats.health,80);
  const calm=game({...initial,siblings:[{...initial.siblings[0],petulance:0}]},0); click(calm,'[data-panel="relationships"]'); click(calm,'[data-action="social"]'); click(calm,'[data-action="social-target-sibling-0"]'); click(calm,'[data-action="social-do-insult-sibling-0"]'); click(calm,'[data-action="social-insult-confirm-sibling-0"]'); assert.doesNotMatch(calm.d.querySelector('#timeline').textContent,/attacked me|insulted me back/);
});

test('profiled partners track years together and proposals consider relationship duration', () => {
  const initial=game().save(); Object.assign(initial,{age:30,partner:'Morgan',partnerBond:95,trait:'',extraTraits:[],partnerDetails:{age:30,endAge:90,yearsTogether:2,smarts:50,looks:50,craziness:0,willpower:50}}); const g=game(initial,0); click(g,'[data-panel="relationships"]'); assert.match(g.d.querySelector('[data-action="propose"]').textContent,/Together 2 years/); click(g,'[data-action="propose"]'); assert.equal(g.save().engaged,false); assert.equal(g.save().proposalRejectedAt,30); age(g,1); assert.equal(g.save().partnerDetails.yearsTogether,3); const reload=game(g.save(),0); act(reload,'relationships','propose'); assert.equal(reload.save().engaged,true); assert.equal(reload.save().proposalRejectedAt,null); assert.match(reload.d.querySelector('#timeline').textContent,/accepted my proposal/);
});

test('new dates start their relationship clock while malformed clock values are rejected', async () => {
  const initial=game().save(); Object.assign(initial,{age:30,trait:'',extraTraits:[]}); const g=game(initial,0); act(g,'relationships','meet-date'); assert.equal(g.save().dateCandidate.yearsTogether,0); click(g,'[data-action="date-ask"]'); assert.equal(g.save().partnerDetails.yearsTogether,0); age(g,1); assert.equal(g.save().partnerDetails.yearsTogether,1);
  const candidate={name:'Sam',age:28,smarts:50,looks:50,craziness:50,willpower:50}; for (const yearsTogether of [1,-1,31,null]) { const receiver=game(); const before=receiver.save(); const bad={...initial,dateCandidate:{...candidate,yearsTogether}}; click(receiver,'#save-menu'); const input=receiver.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new receiver.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:bad})],'bad.json')]}); const done=waitFor(receiver,()=>receiver.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new receiver.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(receiver.save(),before); }
});

test('profiled partners can decline trying for a baby or experience an unsuccessful attempt', () => {
  const initial=game().save(); Object.assign(initial,{age:30,balance:5000,partner:'Morgan',partnerBond:95,trait:'',extraTraits:[],partnerDetails:{age:30,smarts:50,looks:50,craziness:50,willpower:50,yearsTogether:0,fertility:100,endAge:90}});
  const notReady=game(initial,0); act(notReady,'relationships','try-baby'); assert.equal(notReady.save().pregnancy,null); assert.equal(notReady.save().balance,5000); assert.equal(notReady.save().partnerBond,91); assert.match(notReady.d.querySelector('#timeline').textContent,/not ready/);
  const failed=game({...initial,partnerDetails:{...initial.partnerDetails,yearsTogether:3,fertility:25}},.9); act(failed,'relationships','try-baby'); assert.equal(failed.save().pregnancy,null); assert.equal(failed.save().balance,4000); assert.match(failed.d.querySelector('#timeline').textContent,/did not conceive/);
  const success=game({...initial,partnerDetails:{...initial.partnerDetails,yearsTogether:3,fertility:100}},0); click(success,'[data-panel="relationships"]'); click(success,'[data-action="social"]'); click(success,'[data-action="social-target-partner-0"]'); assert.match(success.d.querySelector('#modal-content').textContent,/Game conception chance: 100% \(not medical advice\)/); click(success,'.close-modal'); act(success,'relationships','try-baby'); assert.equal(success.save().pregnancy.coParent,'Morgan'); assert.equal(success.save().balance,4000);
});

test('new dating profiles carry the game conception chance and invalid values are rejected', async () => {
  const initial=game().save(); Object.assign(initial,{age:30,trait:'',extraTraits:[]}); const g=game(initial,0); act(g,'relationships','meet-date'); const fertility=g.save().dateCandidate.fertility; assert.ok(fertility>=25 && fertility<=100); click(g,'[data-action="date-ask"]'); assert.equal(g.save().partnerDetails.fertility,fertility);
  for (const fertility of [-1,101,null,1.5]) { const receiver=game(); const before=receiver.save(); const bad={...initial,dateCandidate:{name:'Sam',age:28,smarts:50,looks:50,craziness:50,willpower:50,yearsTogether:0,fertility}}; click(receiver,'#save-menu'); const input=receiver.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new receiver.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:bad})],'bad.json')]}); const done=waitFor(receiver,()=>receiver.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new receiver.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(receiver.save(),before); }
});

test('varied multi-year family simulations always produce valid backup states', () => {
  for (const seed of [1,237,8675309]) {
    const initial=game().save(); Object.assign(initial,{age:40,balance:100000,partner:'Morgan',partnerBond:90,married:true,education:'High school',job:'Barista',income:28000,trait:'',extraTraits:[],partnerDetails:{age:42,endAge:100,yearsTogether:5,fertility:75,smarts:65,looks:70,craziness:20,willpower:50}}); initial.stats.health=100;
    const g=game(initial,.9,true); let n=seed; g.dom.window.Math.random=()=>{n=(1664525*n+1013904223)>>>0; return n/4294967296;}; act(g,'relationships','child');
    function check() { const state=g.save(); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:state}),true,`seed ${seed} age ${state.age}: ${JSON.stringify(state)}`); }
    check(); for (let i=0;i<25 && g.save().alive;i++) { age(g,1); check(); if (g.save().alive && i%5===0) { act(g,'activities','walk'); check(); } }
    click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
    if (g.save().alive) { act(g,'activities','surrender'); click(g,'[data-action="surrender-confirm"]'); click(g,'[data-action="surrender-final"]'); }
    check(); if (g.save().children.length) { click(g,'#review-life'); click(g,'[data-action="choose-successor"]'); click(g,'[data-action="successor-0"]'); click(g,'[data-action="inherit-0"]'); check(); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/); }
  }
});

test('new adult child partners age and their profiles follow a playable heir', () => {
  const initial=game().save(); Object.assign(initial,{age:40,balance:50000,children:['Sam'],childBirthAges:[23],childBonds:[65],trait:'',extraTraits:[],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:60,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null}}}); const g=game(initial,0); age(g,1); const p=g.save().childProfiles[0].partner; assert.ok(p.details); assert.equal(p.details.yearsTogether,0); assert.ok(p.details.endAge>p.details.age); g.dom.window.Math.random=()=>.9; age(g,1); const updated=g.save().childProfiles[0].partner; assert.equal(updated.details.age,p.details.age+1); assert.equal(updated.details.yearsTogether,1);
  const heir=game({...g.save(),alive:false},.9); click(heir,'#review-life'); click(heir,'[data-action="choose-successor"]'); click(heir,'[data-action="successor-0"]'); click(heir,'[data-action="inherit-0"]'); assert.equal(heir.save().partner,updated.name); assert.deepEqual(heir.save().partnerDetails,updated.details); click(heir,'#save-menu'); click(heir,'[data-action="slot-save"]'); assert.match(heir.d.querySelector('#data-message').textContent,/saved/);
});

test('a child can lose a profiled partner without immediately finding a replacement', () => {
  const initial=game().save(); Object.assign(initial,{age:65,balance:50000,trait:'',extraTraits:[],children:['Sam'],childBirthAges:[20],childBonds:[65],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:0,partner:{name:'Riley',since:20,married:true,details:{age:79,endAge:80,yearsTogether:25,fertility:50,smarts:50,looks:50,craziness:50,willpower:50}}}}}); const g=game(initial,0); age(g,1); assert.equal(g.save().childProfiles[0].partner,null); assert.match(g.d.querySelector('#timeline').textContent,/Riley, Sam.s spouse, passed away at age 80/); assert.doesNotMatch(g.d.querySelector('#timeline').textContent,/Sam and Riley divorced/);
});

test('child partner profile validation rejects impossible records and accepts older partners', async () => {
  const base=game().save(); Object.assign(base,{age:50,children:['Sam'],childBirthAges:[25],childBonds:[65],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:60,looks:65,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:0,partner:{name:'Riley',since:20,married:true}}}}); const legacy=game(base); click(legacy,'#save-menu'); click(legacy,'[data-action="slot-save"]'); assert.match(legacy.d.querySelector('#data-message').textContent,/saved/);
  for (const details of [{age:28,endAge:28,smarts:50,looks:50,craziness:50,willpower:50},{age:28,yearsTogether:6,smarts:50,looks:50,craziness:50,willpower:50},{age:28,fertility:101,smarts:50,looks:50,craziness:50,willpower:50}]) { const g=game(); const before=g.save(); const invalid={...base,childProfiles:{0:{...base.childProfiles[0],partner:{...base.childProfiles[0].partner,details}}}}; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

function gameWithRawSave(raw) {
  const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'outside-only'}); dom.window.Math.random=()=>.9; dom.window.localStorage.setItem(KEY,raw); dom.window.eval(names); dom.window.eval(catalog); dom.window.eval(script); return {dom,d:dom.window.document,save:()=>JSON.parse(dom.window.localStorage.getItem(KEY))};
}

test('unreadable autosaves remain untouched and their original bytes can be downloaded', async () => {
  for (const raw of ['{"version":1,','{"version":999,"history":[],"stats":{}}','null','']) {
    const g=gameWithRawSave(raw); assert.equal(g.dom.window.localStorage.getItem(KEY),raw); assert.equal(g.d.querySelector('#storage-warning').hidden,false); assert.match(g.d.querySelector('#storage-warning').textContent,/not been overwritten/); click(g,'#age-up'); assert.equal(g.dom.window.localStorage.getItem(KEY),raw); click(g,'#save-menu'); assert.ok(g.d.querySelector('[data-action="export-unreadable"]')); assert.match(g.d.querySelector('#modal-content').textContent,/Download temporary life/);
    let blob, filename; g.dom.window.URL.createObjectURL=value=>{blob=value;return 'blob:original';}; g.dom.window.URL.revokeObjectURL=()=>{}; g.dom.window.HTMLAnchorElement.prototype.click=function(){filename=this.download;}; click(g,'[data-action="export-unreadable"]'); assert.equal(filename,'little-life-unreadable-save.txt'); const reader=new g.dom.window.FileReader(); const content=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsText(blob);}); assert.equal(content,raw); assert.equal(g.dom.window.localStorage.getItem(KEY),raw);
  }
});

test('explicit new life replaces an unreadable save, but cancelling does not', () => {
  const raw='{broken'; const g=gameWithRawSave(raw); click(g,'#new-life'); assert.match(g.d.querySelector('#modal-content').textContent,/replace the unreadable original/); click(g,'[data-close].modal-secondary'); assert.equal(g.dom.window.localStorage.getItem(KEY),raw); click(g,'#new-life'); g.d.querySelector('#new-name').value='Fresh Life'; g.d.querySelector('#new-life-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(g.save().name,'Fresh Life'); assert.equal(g.d.querySelector('#storage-warning').hidden,true);
});

test('failed replacement keeps original unreadable data available until a save succeeds', () => {
  const raw='{broken'; const g=gameWithRawSave(raw), storage=g.dom.window.Storage.prototype, original=storage.setItem; storage.setItem=function(key,value){if(key===KEY) throw new Error('quota'); return original.call(this,key,value);}; click(g,'#new-life'); g.d.querySelector('#new-name').value='Fresh Life'; g.d.querySelector('#new-life-form').dispatchEvent(new g.dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(g.dom.window.localStorage.getItem(KEY),raw); assert.match(g.d.querySelector('#storage-warning').textContent,/original data remains/i); click(g,'#save-menu'); assert.ok(g.d.querySelector('[data-action="export-unreadable"]')); click(g,'.close-modal'); storage.setItem=original; click(g,'#age-up'); choose(g); assert.equal(g.save().name,'Fresh Life'); assert.equal(g.d.querySelector('#storage-warning').hidden,true);
});

test('restoring a validated backup can explicitly replace an unreadable autosave', async () => {
  const raw='{broken'; const g=gameWithRawSave(raw), restored=game().save(); restored.name='Restored Life'; click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:restored})],'backup.json')]}); const done=waitFor(g,()=>g.d.querySelector('#modal-title')?.textContent.includes('Replace')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.equal(g.dom.window.localStorage.getItem(KEY),raw); click(g,'[data-action="import-confirm"]'); assert.equal(g.save().name,'Restored Life'); assert.equal(g.d.querySelector('#storage-warning').hidden,true);
});

test('unreadable local slots can be downloaded without changing the original data', async () => {
  const g=game(), raw='{broken slots'; g.dom.window.localStorage.setItem('little-life-slots-v1',raw); click(g,'#save-menu'); assert.equal(g.d.querySelector('[data-action="slot-save"]').disabled,true); let blob, filename; g.dom.window.URL.createObjectURL=value=>{blob=value;return 'blob:slots';}; g.dom.window.URL.revokeObjectURL=()=>{}; g.dom.window.HTMLAnchorElement.prototype.click=function(){filename=this.download;}; click(g,'[data-action="export-unreadable-slots"]'); assert.equal(filename,'little-life-unreadable-slots.txt'); const reader=new g.dom.window.FileReader(); const content=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(blob);}); assert.equal(content,raw); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),raw);
});

test('loading a valid local slot explicitly replaces an unreadable autosave', () => {
  const original=game(); click(original,'#save-menu'); click(original,'[data-action="slot-save"]'); const slots=original.dom.window.localStorage.getItem('little-life-slots-v1'); const raw='{broken'; const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'outside-only'}); dom.window.Math.random=()=>.9; dom.window.localStorage.setItem(KEY,raw); dom.window.localStorage.setItem('little-life-slots-v1',slots); dom.window.eval(names); dom.window.eval(catalog); dom.window.eval(script); const g={dom,d:dom.window.document,save:()=>JSON.parse(dom.window.localStorage.getItem(KEY))}; click(g,'#save-menu'); click(g,'[data-action="slot-load-0"]'); assert.equal(dom.window.localStorage.getItem(KEY),raw); click(g,'[data-action="slot-cancel"]'); assert.equal(dom.window.localStorage.getItem(KEY),raw); click(g,'[data-action="slot-load-0"]'); click(g,'[data-action="slot-confirm"]'); assert.equal(g.save().name,original.save().name); assert.equal(g.d.querySelector('#storage-warning').hidden,true);
});

test('partner willpower affects reconciliation and marriage makes reconciliation harder', () => {
  const initial=game().save(); const eventId=game(undefined,.9,true).dom.window.__events.findIndex(event=>event.title==='A relationship in trouble'); assert.ok(eventId>=0); Object.assign(initial,{age:30,balance:10000,partner:'Morgan',partnerBond:30,pending:eventId,partnerDetails:{age:30,smarts:50,looks:50,craziness:50,willpower:0}});
  const stay=game(initial,.9); assert.match(stay.d.querySelector('#modal-content').textContent,/willpower affects outcome/); click(stay,'[data-action="choice-1"]'); assert.equal(stay.save().partner,'Morgan'); assert.equal(stay.save().partnerBond,40);
  const firm=game({...initial,partnerDetails:{...initial.partnerDetails,willpower:100}},.9); click(firm,'[data-action="choice-1"]'); assert.equal(firm.save().partner,null);
  const partner={...initial.partnerDetails,willpower:50}; const dating=game({...initial,partnerDetails:partner},.4); click(dating,'[data-action="choice-1"]'); assert.equal(dating.save().partner,'Morgan'); const married=game({...initial,married:true,partnerDetails:partner},.4); click(married,'[data-action="choice-1"]'); assert.equal(married.save().partner,null); assert.equal(married.save().balance,5200); assert.match(married.d.querySelector('#timeline').textContent,/divorce settlement/);
});

test('school transitions show the stage and grant source-inspired learning bonuses', () => {
  for (const [age,stage,base] of [[5,'elementary',2],[11,'middle',3],[13,'high',4]]) {
    const initial=game().save(); Object.assign(initial,{age,trait:'',extraTraits:[]}); initial.stats.smarts=40; const g=game(initial,0); click(g,'#age-up'); assert.equal(g.save().stats.smarts,41); assert.match(g.d.querySelector('#timeline').textContent,new RegExp(`started ${stage} school`)); choose(g); click(g,'[data-panel="occupation"]'); assert.match(g.d.querySelector('#modal-content').textContent,new RegExp(`${stage} school`,'i'));
    initial.trait='genius'; const genius=game(initial,0); click(genius,'#age-up'); assert.equal(genius.save().stats.smarts,42+base); // transition plus yearly genius bonus
  }
});

test('a restored living centenarian ends their life without exceeding the save age limit', () => {
  const initial=game().save(); Object.assign(initial,{age:100,alive:true}); const g=game(initial,.9); click(g,'#age-up'); assert.equal(g.save().age,100); assert.equal(g.save().alive,false); assert.match(g.d.querySelector('#timeline').textContent,/end at age 100/); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
});

test('death summaries record causes for age, poor health, surrender and complications', () => {
  const base=game().save(); const old=game({...base,age:99,trait:'',extraTraits:[]},.9); old.dom.window.Math.random=()=>.9; click(old,'#age-up'); assert.equal(old.save().deathCause,'old-age'); assert.match(old.d.querySelector('#modal-content').textContent,/CAUSE OF DEATHOld age/);
  const sick=game({...base,age:30,illness:'cancer',illnessSince:25,trait:'',extraTraits:[],stats:{...base.stats,health:1}},.9); click(sick,'#age-up'); assert.equal(sick.save().deathCause,'poor-health'); assert.match(sick.d.querySelector('#modal-content').textContent,/CAUSE OF DEATHPoor health/);
  const surrender=game(base); act(surrender,'activities','surrender'); click(surrender,'[data-action="surrender-confirm"]'); click(surrender,'[data-action="surrender-final"]'); assert.equal(surrender.save().deathCause,'surrender');
  const surgery=game({...base,age:30,balance:50000,stats:{...base.stats,health:1}},0); act(surgery,'activities','surgery'); click(surgery,'[data-action="surgeon-0"]'); assert.equal(surgery.save().deathCause,'surgery'); assert.match(surgery.d.querySelector('#modal-content').textContent,/Surgery complications/);
  const eventId=game(undefined,.9,true).dom.window.__events.findIndex(event=>event.title==='Struck by lightning'); const struck=game({...base,age:30,pending:eventId},.9); let values=[.9,.1]; struck.dom.window.Math.random=()=>values.shift()??.9; click(struck,'[data-action="choice-0"]'); assert.equal(struck.save().deathCause,'lightning'); assert.match(struck.d.querySelector('#modal-content').textContent,/Lightning strike/);
});

test('death cause survives succession and legacy saves do not invent a cause', () => {
  const initial=game().save(); Object.assign(initial,{age:50,alive:false,deathCause:'poor-health',children:['Sam'],childBirthAges:[30],childBonds:[65]}); const g=game(initial); click(g,'#review-life'); click(g,'[data-action="choose-successor"]'); click(g,'[data-action="successor-0"]'); click(g,'[data-action="inherit-0"]'); assert.equal(g.save().deathCause,null); assert.equal(g.save().legacyHistory[0].deathCause,'poor-health'); click(g,'[data-panel="legacy"]'); click(g,'[data-action="archive-0"]'); assert.match(g.d.querySelector('#modal-content').textContent,/Poor health/);
  const legacy={...initial}; delete legacy.deathCause; const old=game(legacy); click(old,'#review-life'); assert.match(old.d.querySelector('#modal-content').textContent,/CAUSE OF DEATHNot recorded/);
});

test('backups reject invalid or live-player death causes', async () => {
  const base=game().save(); for (const invalid of [{...base,deathCause:'surrender'},{...base,alive:false,deathCause:'unknown cause'},{...base,legacyHistory:[{name:'Alex',city:'City',age:50,balance:0,investment:0,deathCause:'bad',history:base.history}]}]) { const g=game(); const before=g.save(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:invalid})],'bad.json')]}); const done=waitFor(g,()=>g.d.querySelector('#data-message')?.textContent.includes('not a valid')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; assert.deepEqual(g.save(),before); }
});

test('removing unreadable slots requires confirmation and leaves the autosave intact', () => {
  const g=game(), before=g.save(), raw='{broken'; g.dom.window.localStorage.setItem('little-life-slots-v1',raw); click(g,'#save-menu'); click(g,'[data-action="slot-reset"]'); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),raw); click(g,'[data-action="slot-cancel"]'); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),raw); click(g,'[data-action="slot-reset"]'); click(g,'[data-action="slot-reset-confirm"]'); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),null); assert.deepEqual(g.save(),before); assert.equal(g.d.querySelector('[data-action="slot-save"]').disabled,false); assert.match(g.d.querySelector('#data-message').textContent,/removed/);
});

test('slot recovery never deletes changed data and reports storage errors', () => {
  const g=game(); g.dom.window.localStorage.setItem('little-life-slots-v1','{broken'); click(g,'#save-menu'); click(g,'[data-action="slot-reset"]'); g.dom.window.localStorage.setItem('little-life-slots-v1','[]'); click(g,'[data-action="slot-reset-confirm"]'); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),'[]'); assert.match(g.d.querySelector('#data-message').textContent,/changed/);
  g.dom.window.localStorage.setItem('little-life-slots-v1','{broken again'); click(g,'#save-menu'); click(g,'[data-action="slot-reset"]'); const storage=g.dom.window.Storage.prototype, original=storage.removeItem; storage.removeItem=function(key){if(key==='little-life-slots-v1') throw new Error('denied'); return original.call(this,key);}; click(g,'[data-action="slot-reset-confirm"]'); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),'{broken again'); assert.match(g.d.querySelector('#data-message').textContent,/Could not remove/);
});

test('slot confirmations do not load or delete a copy modified in another tab', () => {
  for (const operation of ['load','delete']) { const g=game(); const before=g.save(); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); click(g,`[data-action="slot-${operation}-0"]`); const slots=JSON.parse(g.dom.window.localStorage.getItem('little-life-slots-v1')); slots[0].game.name='Changed elsewhere'; g.dom.window.localStorage.setItem('little-life-slots-v1',JSON.stringify(slots)); click(g,'[data-action="slot-confirm"]'); assert.deepEqual(g.save(),before); assert.equal(JSON.parse(g.dom.window.localStorage.getItem('little-life-slots-v1'))[0].game.name,'Changed elsewhere'); assert.match(g.d.querySelector('#data-message').textContent,/changed/); }
});

test('modal keyboard focus stays inside, and mandatory events cannot be escaped', () => {
  const g=game(); const opener=g.d.querySelector('[data-panel="activities"]'); opener.focus(); opener.click(); const dialog=g.d.querySelector('#modal'); const close=dialog.querySelector('.close-modal'); assert.equal(g.d.activeElement,close); const focusable=[...dialog.querySelectorAll('button:not(:disabled):not([hidden]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')]; const key=(key,shiftKey=false)=>g.d.dispatchEvent(new g.dom.window.KeyboardEvent('keydown',{key,shiftKey,bubbles:true,cancelable:true})); key('Tab',true); assert.equal(g.d.activeElement,focusable.at(-1)); key('Tab'); assert.equal(g.d.activeElement,close); opener.focus(); key('Tab'); assert.equal(g.d.activeElement,close); key('Escape'); assert.ok(dialog.classList.contains('hidden')); assert.equal(g.d.activeElement,opener);
  const initial=game().save(); initial.age=7; initial.pending=0; const pending=game(initial); const eventDialog=pending.d.querySelector('#modal'); assert.equal(pending.d.querySelector('.close-modal').hidden,true); pending.d.dispatchEvent(new pending.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})); assert.ok(!eventDialog.classList.contains('hidden')); assert.equal(pending.save().pending,0);
});

test('family funerals queue in order, survive reload, and apply each choice once', () => {
  const initial=game().save(); Object.assign(initial,{age:35,karma:50,trait:'',extraTraits:[],parents:[{name:'Avery',age:70,endAge:71,bond:75,alive:true,inheritance:1000},{name:'Taylor',age:70,endAge:71,bond:70,alive:true,inheritance:1000}],siblings:[{name:'Sam',age:35,endAge:36,bond:65,alive:true}],partner:'Riley',married:true,partnerBond:80,partnerDetails:{age:79,endAge:80,smarts:50,looks:50,craziness:30,willpower:50}});
  const g=game(initial,.9,true); click(g,'#age-up'); let state=g.save(); assert.deepEqual(state.funeralQueue.map(f=>f.name),['Avery','Taylor','Sam','Riley']); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:state}),true); assert.match(g.d.querySelector('#modal-content').textContent,/Avery, my parent/); assert.equal(g.d.querySelector('#age-up').disabled,true); assert.equal(state.moments,3);
  const restored=game(state,.9,true); assert.match(restored.d.querySelector('#modal-content').textContent,/Avery/); click(restored,'[data-action="choice-0"]'); assert.equal(restored.save().karma,55); assert.match(restored.d.querySelector('#modal-content').textContent,/Taylor/); assert.equal(restored.dom.window.__validBackup({format:'little-life-backup',version:1,game:restored.save()}),true);
  click(restored,'[data-action="choice-1"]'); assert.equal(restored.save().karma,50); click(restored,'[data-action="choice-0"]'); click(restored,'[data-action="choice-1"]'); state=restored.save(); assert.equal(state.pending,null); assert.deepEqual(state.funeralQueue,[]); assert.equal(state.karma,50); assert.equal(state.moments,3); assert.match(restored.d.querySelector('#timeline').textContent,/attended Avery.s funeral/); assert.match(restored.d.querySelector('#timeline').textContent,/did not attend Taylor.s funeral/); assert.equal(restored.dom.window.__validBackup({format:'little-life-backup',version:1,game:state}),true); click(restored,'#save-menu'); click(restored,'[data-action="slot-save"]'); assert.match(restored.d.querySelector('#data-message').textContent,/saved/);
});

test('in prison, funerals offer private remembrance rather than impossible attendance', () => {
  const initial=game().save(); Object.assign(initial,{age:30,prisonYears:2,karma:50,trait:'',extraTraits:[],parents:[{name:'Morgan',age:79,endAge:80,bond:70,alive:true,inheritance:0}],siblings:[]}); const g=game(initial,.9); click(g,'#age-up'); assert.match(g.d.querySelector('#modal-content').textContent,/could not attend/); assert.match(g.d.querySelector('[data-action="choice-0"]').textContent,/Remember them privately/); click(g,'[data-action="choice-0"]'); assert.match(g.d.querySelector('#timeline').textContent,/remembered Morgan privately while in prison/); assert.equal(g.save().karma,55); assert.equal(g.save().prisonYears,1);
});

test('funeral queue migration and validation reject inconsistent or oversized entries', () => {
  const initial=game().save(); delete initial.funeralQueue; const old=game(initial,.9,true); assert.deepEqual(old.save().funeralQueue,[]); const event=old.dom.window.__events.findIndex(e=>e.title==='Remembering a loved one'); const verify=s=>old.dom.window.__validBackup({format:'little-life-backup',version:1,game:s});
  const f={name:'Sam',relationship:'sibling',canAttend:true}; assert.equal(verify({...old.save(),pending:event,funeralQueue:[f]}),true); for (const bad of [{pending:event,funeralQueue:[]},{pending:null,funeralQueue:[f]},{pending:event,funeralQueue:Array(12).fill(f)},{pending:event,funeralQueue:[{...f,relationship:'stranger'}]},{pending:event,funeralQueue:[{...f,canAttend:'yes'}]}]) assert.equal(verify({...old.save(),...bad}),false);
  const dying=game({...old.save(),age:99,parents:[{name:'Morgan',age:79,endAge:80,bond:70,alive:true,inheritance:0}],siblings:[]},.9,true); click(dying,'#age-up'); assert.equal(dying.save().alive,false); assert.deepEqual(dying.save().funeralQueue,[]); assert.equal(verify(dying.save()),true);
});

test('a pending funeral backup restores safely with escaped names', async () => {
  const initial=game().save(); Object.assign(initial,{age:30,trait:'',extraTraits:[],parents:[{name:'<img src=x onerror=alert(1)>',age:79,endAge:80,bond:70,alive:true,inheritance:0}],siblings:[]}); const source=game(initial,.9); click(source,'#age-up'); const saved=source.save(); const g=game(); click(g,'#save-menu'); const input=g.d.querySelector('#import-file'); Object.defineProperty(input,'files',{value:[new g.dom.window.File([JSON.stringify({format:'little-life-backup',version:1,game:saved})],'funeral.json')]}); const done=waitFor(g,()=>g.d.querySelector('#modal-title').textContent.includes('Replace')); input.dispatchEvent(new g.dom.window.Event('change',{bubbles:true})); await done; click(g,'[data-action="import-confirm"]'); assert.equal(g.save().pending,saved.pending); assert.equal(g.d.querySelector('#modal-content img'),null); assert.match(g.d.querySelector('#modal-content').textContent,/<img src=x/); click(g,'[data-action="choice-0"]'); assert.equal(g.save().pending,null); assert.equal(g.d.querySelector('#timeline img'),null); assert.match(g.d.querySelector('#timeline').textContent,/attended <img src=x/);
});

test('spouses can decline renewing vows; rejection persists and charges only on acceptance', () => {
  const initial=game().save(); Object.assign(initial,{age:40,partner:'Jamie',married:true,partnerBond:40,balance:2000,lastVows:30,trait:'',extraTraits:[]}); const g=game(initial,.9); act(g,'relationships','renew-vows'); assert.equal(g.save().vowRejectedAt,40); assert.equal(g.save().lastVows,30); assert.equal(g.save().partnerBond,32); assert.equal(g.save().balance,2000); assert.match(g.d.querySelector('#timeline').textContent,/declined to renew/); click(g,'[data-panel="relationships"]'); assert.equal(g.d.querySelector('[data-action="renew-vows"]').disabled,true); assert.match(g.d.querySelector('[data-action="renew-vows"]').textContent,/ask again next year/);
  const restored=game({...g.save(),age:41,partnerBond:80,moments:3},.9); act(restored,'relationships','renew-vows'); assert.equal(restored.save().vowRejectedAt,null); assert.equal(restored.save().lastVows,41); assert.equal(restored.save().balance,1500); assert.match(restored.d.querySelector('#timeline').textContent,/renewed our wedding vows/);
  const separating=game({...g.save(),moments:3},.9); act(separating,'relationships','breakup'); click(separating,'[data-action="breakup-final"]'); assert.equal(separating.save().vowRejectedAt,null);
});

test('vow rejection migrates safely and invalid rejection histories are rejected', () => {
  const initial=game().save(); delete initial.vowRejectedAt; const g=game(initial,.9,true); assert.equal(g.save().vowRejectedAt,null); const validate=s=>g.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}); const married={...g.save(),age:30,partner:'Jamie',married:true}; assert.equal(validate({...married,vowRejectedAt:30}),true); assert.equal(validate({...married,vowRejectedAt:31}),false); assert.equal(validate({...married,married:false,vowRejectedAt:30}),false); assert.equal(validate({...married,partner:null,vowRejectedAt:30}),false);
});

test('an empty but present local-slot value is preserved as unreadable data', () => {
  const g=game(); g.dom.window.localStorage.setItem('little-life-slots-v1',''); click(g,'#save-menu'); assert.equal(g.d.querySelector('[data-action="slot-save"]').disabled,true); assert.ok(g.d.querySelector('[data-action="export-unreadable-slots"]')); assert.ok(g.d.querySelector('[data-action="slot-reset"]')); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),''); click(g,'[data-action="slot-reset"]'); click(g,'[data-action="slot-reset-confirm"]'); assert.equal(g.dom.window.localStorage.getItem('little-life-slots-v1'),null);
});

test('a failed startup storage read never overwrites an unseen save and can recover its bytes', async () => {
  const original=game().save(); original.name='Original Life'; const raw=JSON.stringify(original); const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'outside-only'}); dom.window.Math.random=()=>.9; dom.window.localStorage.setItem(KEY,raw); const storage=dom.window.Storage.prototype, get=storage.getItem; let fail=true; storage.getItem=function(key){if(key===KEY && fail) throw new Error('denied'); return get.call(this,key);}; dom.window.eval(names); dom.window.eval(catalog); dom.window.eval(script); const g={dom,d:dom.window.document,save:()=>JSON.parse(get.call(dom.window.localStorage,KEY))}; assert.equal(get.call(dom.window.localStorage,KEY),raw); assert.match(g.d.querySelector('#storage-warning').textContent,/not been overwritten/); click(g,'#age-up'); assert.equal(get.call(dom.window.localStorage,KEY),raw); click(g,'#save-menu'); assert.match(g.d.querySelector('#modal-content').textContent,/Download temporary life/); click(g,'[data-action="retry-save-read"]'); assert.match(g.d.querySelector('#data-message').textContent,/still cannot be read/); assert.equal(get.call(dom.window.localStorage,KEY),raw); fail=false; click(g,'[data-action="retry-save-read"]'); assert.match(g.d.querySelector('#data-message').textContent,/available to download/); let blob; dom.window.URL.createObjectURL=value=>{blob=value;return 'blob:recovery';}; dom.window.URL.revokeObjectURL=()=>{}; dom.window.HTMLAnchorElement.prototype.click=function(){}; click(g,'[data-action="export-unreadable"]'); const reader=new dom.window.FileReader(); const content=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(blob);}); assert.equal(content,raw); click(g,'.close-modal'); click(g,'#age-up'); choose(g); assert.equal(get.call(dom.window.localStorage,KEY),raw);
});

test('explicit replacement after a failed startup read preserves old data on write failure and retries', () => {
  const raw=JSON.stringify(game().save()), dom=new JSDOM(html,{url:'https://example.com/',runScripts:'outside-only'}); dom.window.Math.random=()=>.9; dom.window.localStorage.setItem(KEY,raw); const storage=dom.window.Storage.prototype, get=storage.getItem, set=storage.setItem; let failWrite=true; storage.getItem=function(key){if(key===KEY) throw new Error('denied');return get.call(this,key);}; storage.setItem=function(key,value){if(key===KEY && failWrite) throw new Error('denied'); return set.call(this,key,value);}; dom.window.eval(names); dom.window.eval(catalog); dom.window.eval(script); const g={dom,d:dom.window.document,save:()=>JSON.parse(get.call(dom.window.localStorage,KEY))}; click(g,'#new-life'); assert.match(g.d.querySelector('#modal-content').textContent,/replace any existing save/); g.d.querySelector('#new-name').value='Replacement'; g.d.querySelector('#new-life-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})); assert.equal(get.call(dom.window.localStorage,KEY),raw); assert.match(g.d.querySelector('#storage-warning').textContent,/Could not replace/); storage.getItem=get; failWrite=false; click(g,'#age-up'); choose(g); assert.equal(g.save().name,'Replacement'); assert.equal(g.d.querySelector('#storage-warning').hidden,true);
});

test('resolving an age-up event returns keyboard focus to the age button', () => {
  const initial=game().save(); Object.assign(initial,{age:6,parents:[],siblings:[],trait:'',extraTraits:[]}); const g=game(initial,0); const button=g.d.querySelector('#age-up'); button.focus(); button.click(); assert.notEqual(g.save().pending,null); assert.notEqual(g.d.activeElement,button); choose(g); assert.equal(g.save().pending,null); assert.equal(g.d.activeElement,button);
});

test('quitting and retirement require confirmation without spending a moment on cancellation', () => {
  const initial=game().save(); Object.assign(initial,{age:65,job:'Barista',income:50000,workYears:10,salaryHistory:Array(10).fill(50000),pensionPolicy:'career',moments:3}); const g=game(initial,.9); const before=g.save(); act(g,'occupation','quit'); assert.match(g.d.querySelector('#modal-content').textContent,/pension records will reset/); assert.deepEqual(g.save(),before); click(g,'[data-close].modal-secondary'); assert.deepEqual(g.save(),before); act(g,'occupation','retire'); assert.match(g.d.querySelector('#modal-content').textContent,/\$10,000/); assert.deepEqual(g.save(),before); click(g,'[data-close].modal-secondary'); assert.deepEqual(g.save(),before); act(g,'occupation','retire'); click(g,'[data-action="retire-confirm"]'); assert.equal(g.save().income,10000); assert.equal(g.save().retired,true); assert.equal(g.save().moments,2);
  const quit=game(initial,.9); act(quit,'occupation','quit'); click(quit,'[data-action="quit-confirm"]'); assert.equal(quit.save().job,''); assert.equal(quit.save().income,0); assert.equal(quit.save().workYears,0); assert.equal(quit.save().moments,2);
});

test('skipping school or university reduces karma, including when caught and at the floor', () => {
  const initial=game().save(); Object.assign(initial,{age:16,karma:50,trait:'',extraTraits:[]}); const caught=game(initial,0); act(caught,'occupation','skip-school'); assert.equal(caught.save().karma,49); assert.match(caught.d.querySelector('#timeline').textContent,/caught skipping/);
  const free=game({...initial,karma:3},.9); act(free,'occupation','skip-school'); assert.equal(free.save().karma,0); assert.match(free.d.querySelector('#timeline').textContent,/skipped school/);
  const college=game({...initial,age:22,education:'High school',studying:true,studyStarted:21,studyMajor:'arts'},.9); act(college,'occupation','university-skip'); assert.equal(college.save().karma,44); assert.match(college.d.querySelector('#timeline').textContent,/skipped my university lectures/);
});

test('maximum valid activity, crime and move counters stay valid after more actions', () => {
  const base=game().save(); const check=g=>assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
  const mindful=game({...base,age:10,trait:'',extraTraits:[],meditations:1000,studySessions:1000},.9,true); act(mindful,'activities','meditate'); act(mindful,'occupation','study'); assert.equal(mindful.save().meditations,1000); assert.equal(mindful.save().studySessions,1000); check(mindful); assert.equal(game(mindful.save()).save().age,10);
  const university=game({...base,age:21,education:'High school',studying:true,studyStarted:20,studyMajor:'arts',studySessions:1000},.9,true); act(university,'occupation','university-study'); assert.equal(university.save().studySessions,1000); check(university);
  const crime=game({...base,age:30,convictions:100},.9,true); act(crime,'activities','crime'); assert.match(crime.d.querySelector('#modal-content').textContent,/Convictions: 100\+/); click(crime,'[data-action="offense-shoplift"]'); assert.equal(crime.save().convictions,100); assert.equal(crime.save().prisonYears,1); check(crime);
  const travel=game({...base,age:30,balance:10000,moves:300,city:'Paris, France'},.9,true); act(travel,'activities','travel'); const destination=[...travel.d.querySelectorAll('[data-action^="move-"]')].find(el=>el.dataset.action!=='move-country-menu'); assert.ok(destination); destination.click(); assert.equal(travel.save().moves,300); check(travel);
});

test('a very old living parent or sibling in a valid backup does not exceed the age limit', () => {
  const base=game().save(); Object.assign(base,{age:40,parents:[{name:'Morgan',age:150,endAge:150,bond:70,alive:true,inheritance:0}],siblings:[{name:'Alex',age:150,endAge:150,bond:70,alive:true}],trait:'',extraTraits:[]}); const g=game(base,.9,true); click(g,'#age-up'); assert.equal(g.save().parents[0].age,150); assert.equal(g.save().siblings[0].age,150); assert.equal(g.save().parents[0].alive,false); assert.equal(g.save().siblings[0].alive,false); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true); choose(g); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
});

test('toy and craft descriptions follow age-specific source lists and match their outcomes', () => {
  for (const [age,toyKey,craftKey] of [[5,'TOYS_3_5','CRAFTS_5'],[6,'TOYS_6_9','CRAFTS_6_9'],[9,'TOYS_6_9','CRAFTS_6_9'],[10,'TOYS_10_12','CRAFTS_10_12'],[12,'TOYS_10_12','CRAFTS_10_12']]) {
    const base=game().save(); Object.assign(base,{age,trait:'',extraTraits:[]}); base.stats.happiness=50; base.stats.smarts=40; const g=game(base,.9); const list=g.dom.window.LIFE_CATALOG; const convert=s=>s.replace(/\bgave you\b/g,'gave me').replace(/\byou were\b/g,'I was').replace(/\bYou\b/g,'I').replace(/\byou\b/g,'I').replace(/\bYour\b/g,'My').replace(/\byour\b/g,'my'); act(g,'activities','toys'); assert.equal(g.save().history.at(-1).entries.at(-1),convert(list[toyKey][Math.floor(.9*list[toyKey].length)])); act(g,'activities','crafts'); assert.equal(g.save().history.at(-1).entries.at(-1),convert(list[craftKey][Math.floor(.9*list[craftKey].length)])); assert.equal(g.save().stats.smarts,42);
  }
  const base=game().save(); Object.assign(base,{age:10,trait:'',extraTraits:[]}); base.stats.happiness=50;base.stats.smarts=40; const blocked=game(base,0); act(blocked,'activities','crafts'); assert.equal(blocked.save().stats.smarts,40); assert.equal(blocked.save().stats.happiness,48); assert.match(blocked.d.querySelector('#timeline').textContent,/couldn't decide what to make/);
  const depressed=game({...base,illness:'the flu',illnessSince:9,additionalIllnesses:[{name:'depression',since:9}]},0); act(depressed,'activities','toys'); assert.equal(depressed.save().stats.happiness,50); assert.match(depressed.d.querySelector('#timeline').textContent,/did not feel like playing/);
});

test('newly enrolled children record education loans, repay them and keep their own debt as heirs', () => {
  const base=game().save(); Object.assign(base,{age:40,balance:30000,studentLoan:9000,trait:'',extraTraits:[],children:['Sam'],childBirthAges:[23],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:65,looks:65,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null}}}); const g=game(base,0,true); age(g,1); const enrolled=g.save(); assert.equal(enrolled.childProfiles[0].studyStarted,18); assert.equal(enrolled.childProfiles[0].studentLoan,5000); assert.match(g.d.querySelector('#timeline').textContent,/started university with a \$5,000 student loan/); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-child-0"]'); assert.match(g.d.querySelector('#modal-content').textContent,/Student loan \$5,000/); click(g,'.close-modal');
  const dead=game({...enrolled,alive:false},.9,true); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); assert.match(dead.d.querySelector('#modal-content').textContent,/parent.s student loans do not transfer/); click(dead,'[data-action="successor-0"]'); assert.match(dead.d.querySelector('#modal-content').textContent,/keeps their own recorded student loan/); click(dead,'[data-action="inherit-0"]'); assert.equal(dead.save().studentLoan,5000); assert.equal(dead.save().studying,true); assert.match(dead.d.querySelector('#timeline').textContent,/own student loan balance is \$5,000/); assert.equal(dead.dom.window.__validBackup({format:'little-life-backup',version:1,game:dead.save()}),true);
  age(g,4); const graduated=g.save().childProfiles[0]; assert.equal(graduated.education,'University'); assert.equal(graduated.job,'Office assistant'); assert.equal(graduated.studentLoan,4000); assert.match(g.d.querySelector('#timeline').textContent,/paid \$1,000 toward their student loan/); age(g,4); assert.equal(g.save().childProfiles[0].studentLoan,0); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
});

test('child loan migration does not fabricate past debt and invalid profiles are rejected', () => {
  const base=game().save(); Object.assign(base,{age:50,studentLoan:9000,alive:false,children:['Sam'],childBirthAges:[31],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:65,education:'High school',studyStarted:18,job:'',income:0,balance:0,partner:null}}}); const g=game(base,.9,true); assert.equal(g.save().childProfiles[0].studentLoan,0); const validate=s=>g.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}); for (const loan of [-1,1000000001,1.5,null,'5000']) assert.equal(validate({...g.save(),childProfiles:{0:{...g.save().childProfiles[0],studentLoan:loan}}}),false); click(g,'#review-life'); click(g,'[data-action="choose-successor"]'); click(g,'[data-action="successor-0"]'); click(g,'[data-action="inherit-0"]'); assert.equal(g.save().studentLoan,0); assert.equal(g.save().studying,true);
  const minor=game().save(); Object.assign(minor,{age:20,children:['Sam'],childBirthAges:[10],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:65,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null,studentLoan:1}}}); const bad=game(minor,.9,true); assert.equal(bad.d.querySelector('#storage-warning').hidden,false); assert.deepEqual(bad.save(),minor);
});

test('a child’s recorded marriage year follows the heir and prevents immediate vow renewal', () => {
  const base=game().save(); Object.assign(base,{age:50,balance:50000,trait:'',extraTraits:[],children:['Sam'],childBirthAges:[28],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:65,education:'High school',studyStarted:null,job:'',income:0,balance:0,partner:{name:'Riley',since:20,married:false}}}}); const g=game(base,.1,true); age(g,1); const p=g.save().childProfiles[0].partner; assert.equal(p.married,true); assert.equal(p.marriedAt,23); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
  const heir=game({...g.save(),alive:false},.9); click(heir,'#review-life'); click(heir,'[data-action="choose-successor"]'); click(heir,'[data-action="successor-0"]'); click(heir,'[data-action="inherit-0"]'); assert.equal(heir.save().married,true); assert.equal(heir.save().lastVows,23); click(heir,'[data-panel="relationships"]'); assert.equal(heir.d.querySelector('[data-action="renew-vows"]').disabled,true); assert.match(heir.d.querySelector('[data-action="renew-vows"]').textContent,/age 33/);
});

test('older child marriages without dates remain compatible, and malformed dates are rejected', () => {
  const base=game().save(); Object.assign(base,{age:50,alive:false,children:['Sam'],childBirthAges:[28],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:65,education:'High school',studyStarted:null,job:'',income:0,balance:0,partner:{name:'Riley',since:20,married:true}}}}); const g=game(base,.9,true); assert.equal(g.d.querySelector('#storage-warning').hidden,true); const valid=s=>g.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}); const saved=g.save(); for(const date of [null,19,23,'21']) assert.equal(valid({...saved,childProfiles:{0:{...saved.childProfiles[0],partner:{...saved.childProfiles[0].partner,marriedAt:date}}}}),false); const unmarried={...saved.childProfiles[0].partner,married:false,marriedAt:21}; assert.equal(valid({...saved,childProfiles:{0:{...saved.childProfiles[0],partner:unmarried}}}),false); click(g,'#review-life'); click(g,'[data-action="choose-successor"]'); click(g,'[data-action="successor-0"]'); click(g,'[data-action="inherit-0"]'); assert.equal(g.save().married,true); assert.equal(g.save().lastVows,null);
});

test('children’s relationship interest influences dating and can decline after a breakup', () => {
  const base=game().save(); Object.assign(base,{age:40,trait:'',extraTraits:[],children:['Sam'],childBirthAges:[23],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:0,looks:50,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null,partnerDesire:100}}}); const eager=game(base,.1,true); age(eager,1); assert.ok(eager.save().childProfiles[0].partner); assert.equal(eager.save().childProfiles[0].partnerDesire,100); assert.equal(eager.dom.window.__validBackup({format:'little-life-backup',version:1,game:eager.save()}),true); click(eager,'[data-panel="relationships"]'); click(eager,'[data-action="social"]'); click(eager,'[data-action="social-target-child-0"]'); assert.match(eager.d.querySelector('#modal-content').textContent,/Relationship interest: 100%/); click(eager,'.close-modal');
  const uninterested=game({...base,childProfiles:{0:{...base.childProfiles[0],partnerDesire:0}}},0); age(uninterested,1); assert.equal(uninterested.save().childProfiles[0].partner,null);
  const dating=eager.save(); dating.childProfiles[0].partner.details=undefined; const breakup=game(dating,.01,true); age(breakup,1); assert.equal(breakup.save().childProfiles[0].partner,null); assert.equal(breakup.save().childProfiles[0].partnerDesire,99); assert.match(breakup.d.querySelector('#timeline').textContent,/broke up/); assert.equal(breakup.dom.window.__validBackup({format:'little-life-backup',version:1,game:breakup.save()}),true);
});

test('new child marriages can be durable while legacy marriages retain prior breakup rules', () => {
  const base=game().save(); Object.assign(base,{age:55,trait:'',extraTraits:[],children:['Sam'],childBirthAges:[25],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:60,education:'High school',studyStarted:null,job:'Barista',income:28000,balance:0,partnerDesire:80,partner:{name:'Riley',since:20,married:true,marriedAt:25,mayDivorce:false}}}}); const stable=game(base,0,true); age(stable,1); assert.equal(stable.save().childProfiles[0].partner.name,'Riley'); assert.equal(stable.dom.window.__validBackup({format:'little-life-backup',version:1,game:stable.save()}),true);
  const atRisk=game({...base,childProfiles:{0:{...base.childProfiles[0],partner:{...base.childProfiles[0].partner,mayDivorce:true}}}},0,true); age(atRisk,1); assert.equal(atRisk.save().childProfiles[0].partner,null); assert.equal(atRisk.save().childProfiles[0].partnerDesire,77); assert.match(atRisk.d.querySelector('#timeline').textContent,/divorced/);
  const legacyProfile={...base.childProfiles[0]}; delete legacyProfile.partnerDesire; const legacyPartner={...legacyProfile.partner}; delete legacyPartner.mayDivorce; legacyProfile.partner=legacyPartner; const legacy=game({...base,childProfiles:{0:legacyProfile}},0); age(legacy,1); assert.equal(legacy.save().childProfiles[0].partner,null);
});

test('relationship interest and marriage durability validate and older profiles do not fabricate them', () => {
  const base=game().save(); Object.assign(base,{age:50,children:['Sam'],childBirthAges:[28],childBonds:[70],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:65,education:'High school',studyStarted:null,job:'',income:0,balance:0,partner:{name:'Riley',since:20,married:true}}}}); const old=game(base,.9,true); assert.equal(old.save().childProfiles[0].partnerDesire,undefined); assert.equal(old.save().childProfiles[0].partner.mayDivorce,undefined); const verify=s=>old.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}); const saved=old.save(); for (const desire of [-1,101,1.5,null,'50']) assert.equal(verify({...saved,childProfiles:{0:{...saved.childProfiles[0],partnerDesire:desire}}}),false); for (const value of [null,0,'false']) assert.equal(verify({...saved,childProfiles:{0:{...saved.childProfiles[0],partner:{...saved.childProfiles[0].partner,mayDivorce:value}}}}),false); assert.equal(verify({...saved,childProfiles:{0:{...saved.childProfiles[0],partner:{...saved.childProfiles[0].partner,married:false,mayDivorce:false}}}}),false);
  const born=game({...base,children:[],childBirthAges:[],childBonds:[],childProfiles:{},partner:'Morgan',partnerBond:80,balance:10000},.5); act(born,'relationships','child'); assert.equal(born.save().childProfiles[0].partnerDesire,50);
});

test('a newly profiled child records a divorce tendency only upon marriage', () => {
  const base=game().save(); Object.assign(base,{age:50,children:['Sam'],childBirthAges:[28],childBonds:[70],trait:'',extraTraits:[],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:70,looks:65,education:'High school',studyStarted:null,job:'',income:0,balance:0,partnerDesire:75,partner:{name:'Riley',since:20,married:false,marriedAt:null}}}}); const g=game(base,.1,true); age(g,1); assert.equal(g.save().childProfiles[0].partner.marriedAt,23); assert.equal(g.save().childProfiles[0].partner.mayDivorce,true); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
});

test('a recorded surviving co-parent with a lifespan follows the heir without invented wealth', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:10000,partner:'Morgan',partnerBond:80,married:true,trait:'',extraTraits:[],partnerDetails:{age:30,endAge:31,smarts:60,looks:50,craziness:20,willpower:50}}); const g=game(base,.9,true); act(g,'relationships','child'); assert.equal(g.save().childProfiles[0].coParent,'Morgan'); assert.equal(g.save().childProfiles[0].coParentCurrent,true); const dead=game({...g.save(),alive:false},.9,true); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); assert.match(dead.d.querySelector('#modal-content').textContent,/Morgan will remain as a living parent/); click(dead,'[data-action="inherit-0"]'); const parents=dead.save().parents; assert.equal(parents.length,2); assert.deepEqual(parents[1],{name:'Morgan',age:30,endAge:31,bond:65,alive:true,inheritance:0}); assert.match(dead.d.querySelector('#timeline').textContent,/other parent Morgan remains/); assert.equal(dead.dom.window.__validBackup({format:'little-life-backup',version:1,game:dead.save()}),true); age(dead,1); assert.equal(dead.save().parents[1].alive,false); assert.match(dead.d.querySelector('#timeline').textContent,/Morgan, my parent, passed away/);
});

test('co-parent links do not attach an ex or a later partner with the same name', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:10000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[],partnerDetails:{age:30,endAge:90,smarts:60,looks:50,craziness:20,willpower:50}}); const g=game(base,.9,true); act(g,'relationships','child'); act(g,'relationships','breakup'); click(g,'[data-action="breakup-final"]'); const after=g.save(); assert.equal(after.childProfiles[0].coParent,'Morgan'); assert.equal(after.childProfiles[0].coParentCurrent,false); const newPartner={...after,partner:'Morgan',partnerBond:80,partnerDetails:{age:28,endAge:88,smarts:60,looks:50,craziness:20,willpower:50},alive:false}; const dead=game(newPartner,.9,true); assert.equal(dead.dom.window.__validBackup({format:'little-life-backup',version:1,game:dead.save()}),true); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); assert.match(dead.d.querySelector('#modal-content').textContent,/cannot be carried over/); click(dead,'[data-action="inherit-0"]'); assert.equal(dead.save().parents.length,1);
});

test('pregnancy and adoption record co-parent links without inventing them for old pregnancies', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:50000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[]}); const pregnancy=game(base,.9,true); act(pregnancy,'relationships','try-baby'); assert.equal(pregnancy.save().pregnancy.coParentCurrent,true); age(pregnancy,1); assert.equal(pregnancy.save().childProfiles[0].coParent,'Morgan'); assert.equal(pregnancy.save().childProfiles[0].coParentCurrent,true);
  const separated=game(base,.9,true); act(separated,'relationships','try-baby'); act(separated,'relationships','breakup'); click(separated,'[data-action="breakup-final"]'); assert.equal(separated.save().pregnancy.coParentCurrent,false); age(separated,1); assert.equal(separated.save().childProfiles[0].coParent,'Morgan'); assert.equal(separated.save().childProfiles[0].coParentCurrent,false);
  const old=game({...base,pregnancy:{coParent:'Morgan',started:30}},.9); age(old,1); assert.equal(old.save().childProfiles[0].coParent,'Morgan'); assert.equal(old.save().childProfiles[0].coParentCurrent,false);
  const joint=game(base,.5); act(joint,'relationships','adoption-agency'); click(joint,'[data-action="adoption-confirm"]'); assert.equal(joint.save().childProfiles[0].coParent,'Morgan'); assert.equal(joint.save().childProfiles[0].coParentCurrent,true); const single=game({...base,partner:null},.5); act(single,'relationships','adopt'); assert.equal(single.save().childProfiles[0].coParent,null); assert.equal(single.save().childProfiles[0].coParentCurrent,false);
});

test('invalid co-parent associations are rejected without changing older save rules', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:10000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[]}); const g=game(base,.9,true); act(g,'relationships','child'); const saved=g.save(), verify=s=>g.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}); const profile=saved.childProfiles[0]; for (const fields of [{coParent:'Taylor',coParentCurrent:true},{coParent:null,coParentCurrent:true},{coParent:'Morgan',coParentCurrent:'yes'},{coParent:undefined,coParentCurrent:true},{coParent:5,coParentCurrent:false}]) assert.equal(verify({...saved,childProfiles:{0:{...profile,...fields}}}),false); const old={...profile}; delete old.coParent; delete old.coParentCurrent; assert.equal(verify({...saved,childProfiles:{0:old}}),true);
  assert.equal(verify({...saved,pregnancy:{coParent:'Taylor',coParentCurrent:true,started:30}}),false); assert.equal(verify({...saved,pregnancy:{coParent:'Taylor',coParentCurrent:false,started:30}}),true);
});

test('co-parent identity is cleared on partner death and is never reconstructed on succession', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:10000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[],partnerDetails:{age:79,endAge:80,smarts:60,looks:50,craziness:20,willpower:50}}); const g=game(base,.9,true); act(g,'relationships','child'); click(g,'#age-up'); assert.equal(g.save().partner,null); assert.equal(g.save().childProfiles[0].coParentCurrent,false); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true); choose(g); const dead=game({...g.save(),alive:false},.9); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); click(dead,'[data-action="inherit-0"]'); assert.equal(dead.save().parents.length,1);
});

test('a later same-name partner is not penalized when an earlier pregnancy ends', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:10000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[]}); const g=game(base,.9,true); act(g,'relationships','try-baby'); act(g,'relationships','breakup'); click(g,'[data-action="breakup-final"]'); const separated=g.save(); const replacement=game({...separated,partner:'Morgan',partnerBond:80,moments:3},.9,true); act(replacement,'relationships','end-pregnancy'); click(replacement,'[data-action="end-pregnancy-final"]'); assert.equal(replacement.save().partnerBond,80); assert.equal(replacement.save().pregnancy,null); assert.equal(replacement.dom.window.__validBackup({format:'little-life-backup',version:1,game:replacement.save()}),true);
});

test('seeded family lives and succession remain valid through long-running relationship changes', () => {
  for (const seed of [17,913,271828]) {
    const initial=game().save(); Object.assign(initial,{age:25,balance:100000,partner:'Morgan',partnerBond:85,trait:'',extraTraits:[],partnerDetails:{age:27,endAge:91,yearsTogether:3,fertility:75,smarts:65,looks:70,craziness:20,willpower:50}}); initial.stats.health=100;
    const g=game(initial,.9,true); let randomSeed=seed; const rng=()=>{randomSeed=(1664525*randomSeed+1013904223)>>>0; return randomSeed/4294967296;}; g.dom.window.Math.random=rng; act(g,'relationships','child'); act(g,'relationships','child');
    const check=instance=>{const save=instance.save(); assert.equal(instance.dom.window.__validBackup({format:'little-life-backup',version:1,game:save}),true,`seed ${seed} age ${save.age} pending ${save.pending}`);};
    const year=instance=>{ click(instance,'#age-up'); check(instance); while(instance.save().pending!==null){ const choice=instance.d.querySelector('[data-action^="choice-"]:not(:disabled)'); assert.ok(choice); choice.click(); check(instance); } };
    for(let i=0;i<40 && g.save().alive;i++){year(g); if(g.save().alive && !g.save().prisonYears && g.save().partner && g.save().partnerBond<60) {act(g,'relationships','date'); check(g);} }
    const dead=game({...g.save(),alive:false,deathCause:g.save().alive ? null : g.save().deathCause},.9,true); dead.dom.window.Math.random=rng; check(dead); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); click(dead,'[data-action="inherit-0"]'); check(dead); for(let i=0;i<8 && dead.save().alive;i++) year(dead); click(dead,'#save-menu'); click(dead,'[data-action="slot-save"]'); assert.match(dead.d.querySelector('#data-message').textContent,/saved/);
  }
});

test('duplicate seen-event records are normalized before a new event is selected', () => {
  const inspector=game(undefined,.9,true), events=inspector.dom.window.__events; const initial=inspector.save(); Object.assign(initial,{age:6,parents:[],siblings:[],trait:'',extraTraits:[],seenEvents:Array(events.length).fill(0)}); const g=game(initial,0,true); assert.deepEqual(g.save().seenEvents,[0]); click(g,'#age-up'); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true); choose(g); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true); click(g,'#save-menu'); click(g,'[data-action="slot-save"]'); assert.match(g.d.querySelector('#data-message').textContent,/saved/);
});

test('joint adoption and co-parent succession escape names and respect cancellation', () => {
  const base=game().save(); Object.assign(base,{age:30,balance:50000,partner:'<img src=x onerror=alert(1)>',partnerBond:80,trait:'',extraTraits:[],partnerDetails:{age:30,endAge:90,smarts:60,looks:50,craziness:20,willpower:50}}); const g=game(base,.5,true); const before=g.save(); act(g,'relationships','adoption-agency'); assert.match(g.d.querySelector('#modal-content').textContent,/recorded as the other adoptive parent/); assert.equal(g.d.querySelector('#modal-content img'),null); click(g,'[data-close].modal-secondary'); assert.deepEqual(g.save(),before); act(g,'relationships','adoption-agency'); click(g,'[data-action="adoption-confirm"]'); assert.equal(g.save().childProfiles[0].coParent,base.partner); const dead=game({...g.save(),alive:false},.9,true); click(dead,'#review-life'); click(dead,'[data-action="choose-successor"]'); click(dead,'[data-action="successor-0"]'); assert.equal(dead.d.querySelector('#modal-content img'),null); assert.match(dead.d.querySelector('#modal-content').textContent,/<img src=x/); click(dead,'[data-action="inherit-0"]'); assert.equal(dead.save().parents[1].name,base.partner); assert.equal(dead.d.querySelector('#timeline img'),null); assert.equal(dead.dom.window.__validBackup({format:'little-life-backup',version:1,game:dead.save()}),true);
});

test('long imported family names produce a valid playable heir without splitting surrogate pairs', () => {
  const base=game().save(); Object.assign(base,{name:'P'.repeat(300),age:50,alive:false,children:['A'.repeat(299)+'😀'],childBirthAges:[30],childBonds:[70]}); const g=game(base,.9,true); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),false); // the child itself exceeds 300 UTF-16 units
  base.children=['A'.repeat(298)+'😀']; const valid=game(base,.9,true); assert.equal(valid.dom.window.__validBackup({format:'little-life-backup',version:1,game:valid.save()}),true); click(valid,'#review-life'); click(valid,'[data-action="choose-successor"]'); click(valid,'[data-action="successor-0"]'); click(valid,'[data-action="inherit-0"]'); assert.equal(valid.save().name.length,300); assert.ok(valid.save().name.endsWith('😀')); assert.equal(valid.dom.window.__validBackup({format:'little-life-backup',version:1,game:valid.save()}),true); click(valid,'#save-menu'); click(valid,'[data-action="slot-save"]'); assert.match(valid.d.querySelector('#data-message').textContent,/saved/);
  const split=game({...base,name:'😀'+'P'.repeat(298),children:['A'.repeat(298)]},.9,true); click(split,'#review-life'); click(split,'[data-action="choose-successor"]'); click(split,'[data-action="successor-0"]'); click(split,'[data-action="inherit-0"]'); assert.equal(split.save().name,'A'.repeat(298)); assert.equal(split.dom.window.__validBackup({format:'little-life-backup',version:1,game:split.save()}),true);
});

test('child loss preserves memorials, compacts profiles and keeps the named will on the same survivor', () => {
  const base=game().save(); const profile=smarts=>({adopted:false,happiness:70,health:80,smarts,looks:60,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null}); Object.assign(base,{age:40,balance:50000,partner:'Morgan',partnerBond:80,trait:'',extraTraits:[],parents:[],siblings:[],children:['Alex','Sam','Riley'],childBirthAges:[25,38,30],childBonds:[70,75,80],childProfiles:{0:profile(10),1:profile(20),2:profile(30)},will:{mode:'child',child:1}}); const g=game(base,.9999,true); click(g,'#age-up'); const s=g.save(); assert.deepEqual(s.children,['Sam']); assert.deepEqual(s.childBirthAges,[38]); assert.deepEqual(s.childBonds,[75]); assert.equal(s.childProfiles[0].smarts,20); assert.deepEqual(s.will,{mode:'child',child:0}); assert.deepEqual(s.lostChildren.map(c=>c.name),['Riley','Alex']); assert.equal(s.funeralQueue.length,2); assert.equal(s.funeralQueue[0].relationship,'child'); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}),true); const resumed=game(s,.9,true); assert.match(resumed.d.querySelector('#modal-content').textContent,/Riley, my child/); choose(resumed); click(resumed,'[data-panel="legacy"]'); assert.match(resumed.d.querySelector('#modal-content').textContent,/Remembered children/); assert.match(resumed.d.querySelector('#modal-content').textContent,/Riley, age 11/); click(resumed,'.close-modal'); click(resumed,'[data-panel="relationships"]'); click(resumed,'[data-action="social"]'); assert.match(resumed.d.querySelector('#modal-content').textContent,/Sam/); assert.doesNotMatch(resumed.d.querySelector('#modal-content').textContent,/Riley|Alex/); click(resumed,'.close-modal'); act(resumed,'relationships','child'); assert.equal(resumed.save().children.length,2); assert.equal(resumed.save().childProfiles[0].smarts,20); assert.equal(resumed.dom.window.__validBackup({format:'little-life-backup',version:1,game:resumed.save()}),true);
  const final=game({...resumed.save(),alive:false},.9,true); click(final,'#review-life'); click(final,'[data-action="choose-successor"]'); assert.match(final.d.querySelector('#modal-content').textContent,/Sam/); assert.doesNotMatch(final.d.querySelector('#modal-content').textContent,/Riley|Alex/); click(final,'[data-action="successor-0"]'); click(final,'[data-action="inherit-0"]'); assert.equal(final.save().balance,resumed.save().balance); assert.equal(final.dom.window.__validBackup({format:'little-life-backup',version:1,game:final.save()}),true);
});

test('a will naming a deceased child reverts safely and child death can occur from old age', () => {
  const base=game().save(); Object.assign(base,{age:85,balance:20000,parents:[],siblings:[],children:['Sam'],childBirthAges:[5],childBonds:[70],trait:'',extraTraits:[],will:{mode:'child',child:0},childProfiles:{0:{adopted:false,happiness:0,health:0,smarts:50,looks:50,education:'High school',studyStarted:null,job:'',income:0,balance:0,partner:null}}}); base.stats.health=100; const g=game(base,.5,true); click(g,'#age-up'); assert.equal(g.save().alive,true); assert.deepEqual(g.save().children,[]); assert.deepEqual(g.save().will,{mode:'legacy',child:null}); assert.equal(g.save().lostChildren[0].age,81); assert.match(g.d.querySelector('#timeline').textContent,/will now leaves the estate/); assert.match(g.d.querySelector('#modal-content').textContent,/Sam, my child/); choose(g); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
});

test('child memorial migration and validation preserve old saves and reject impossible records', () => {
  const base=game().save(); delete base.lostChildren; const g=game(base,.9,true); assert.deepEqual(g.save().lostChildren,[]); const verify=s=>g.dom.window.__validBackup({format:'little-life-backup',version:1,game:s}); const saved=g.save(); for(const record of [{name:'Sam',age:0,atAge:1},{name:'Sam',age:1,atAge:0},{name:'Sam',age:-1,atAge:0},{name:'Sam',age:0,atAge:'0'}]) assert.equal(verify({...saved,lostChildren:[record]}),false); assert.equal(verify({...saved,age:50,lostChildren:[{name:'Sam',age:10,atAge:40}]}),true); assert.equal(verify({...saved,lostChildren:Array(401).fill({name:'Sam',age:0,atAge:0})}),false);
});

test('child deaths queue alongside family deaths in prison and malicious names stay text', () => {
  const s=game().save(); Object.assign(s,{age:35,prisonYears:1,trait:'',extraTraits:[],parents:[{name:'Parent',age:89,endAge:90,bond:80,alive:true,inheritance:0}],siblings:[],children:['<img src=x onerror=alert(1)>','Alex'],childBirthAges:[20,25],childBonds:[65,65],childProfiles:{},will:{mode:'equal',child:null}}); const g=game(s,.9999,true); click(g,'#age-up'); assert.equal(g.save().funeralQueue.length,3); assert.ok(g.save().funeralQueue.every(f=>!f.canAttend)); assert.match(g.d.querySelector('#modal-content').textContent,/remember them privately/); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true); const restored=game(g.save(),.9,true); choose(restored); assert.match(restored.d.querySelector('#timeline').textContent,/remembered/); click(restored,'[data-panel="legacy"]'); assert.match(restored.d.querySelector('#modal-content').textContent,/<img src=x onerror=alert\(1\)>/); assert.equal(restored.d.querySelector('#modal-content img'),null); assert.match(restored.d.querySelector('#modal-content').textContent,/Alex/); assert.equal(restored.dom.window.__validBackup({format:'little-life-backup',version:1,game:restored.save()}),true);
});

test('simultaneous sudden family deaths persist eleven funerals without divorce settlement', () => {
  const s=game().save(); Object.assign(s,{age:40,balance:500000,trait:'',extraTraits:[],parents:[0,1].map(i=>({name:`Parent ${i}`,age:65,endAge:100,bond:80,alive:true,inheritance:0})),siblings:[0,1,2,3].map(i=>({name:`Sibling ${i}`,age:30,endAge:90,bond:80,alive:true})),children:['A','B','C','D'],childBirthAges:[20,22,24,26],childBonds:[65,65,65,65],childProfiles:{},partner:'Morgan',married:true,partnerBond:80,partnerDetails:{age:42,endAge:90,smarts:50,looks:50,craziness:50,willpower:50},will:{mode:'spouse',child:null}}); s.stats.health=100;
  const g=game(s,.9999,true); click(g,'#age-up'); const lost=g.save(); assert.equal(lost.alive,true); assert.equal(lost.funeralQueue.length,11); assert.equal(lost.lostChildren.length,4); assert.ok(lost.parents.every(p=>!p.alive)); assert.ok(lost.siblings.every(p=>!p.alive)); assert.equal(lost.partner,null); assert.equal(lost.will.mode,'legacy'); assert.doesNotMatch(g.d.querySelector('#timeline').textContent,/divorce settlement/); assert.match(g.d.querySelector('#timeline').textContent,/cause was/); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:lost}),true);
  const restored=game(lost,.9,true); choose(restored); assert.equal(restored.save().funeralQueue.length,0); assert.equal(restored.save().pending,null); assert.equal(restored.dom.window.__validBackup({format:'little-life-backup',version:1,game:restored.save()}),true);
});

test('a young sibling is not eligible for sudden death, and unprofiled partner age is not invented', () => {
  const s=game().save(); Object.assign(s,{age:30,parents:[],siblings:[{name:'Young sibling',age:3,endAge:80,bond:70,alive:true}],children:[],partner:'Legacy partner',partnerDetails:null,trait:'',extraTraits:[]}); const g=game(s,.9999,true); click(g,'#age-up'); assert.equal(g.save().siblings[0].alive,true); assert.equal(g.save().partner,'Legacy partner'); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
});

test('a kidnapping loss queues a persisted funeral, preserves money and clears verified co-parent link', () => {
  const s=game().save(); const event=game(undefined,.9,true).dom.window.__events.findIndex(e=>e.title==='A kidnapping'); Object.assign(s,{age:40,balance:1000000,partner:'Morgan',married:true,pending:event,kidnappingRansom:300000,will:{mode:'spouse',child:null},children:['Sam'],childBirthAges:[35],childBonds:[65],childProfiles:{0:{adopted:false,happiness:70,health:80,smarts:50,looks:50,education:'None',studyStarted:null,job:'',income:0,balance:0,partner:null,coParent:'Morgan',coParentCurrent:true}}}); const g=game(s,.9,true); click(g,'[data-action="choice-2"]'); const after=g.save(); assert.equal(after.balance,1000000); assert.equal(after.partner,null); assert.equal(after.childProfiles[0].coParentCurrent,false); assert.equal(after.will.mode,'legacy'); assert.deepEqual(after.funeralQueue,[{name:'Morgan',relationship:'spouse',canAttend:true}]); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:after}),true); const reloaded=game(after,.9,true); assert.match(reloaded.d.querySelector('#modal-content').textContent,/Morgan, my spouse/); click(reloaded,'[data-action="choice-0"]'); assert.equal(reloaded.save().pending,null); assert.match(reloaded.d.querySelector('#timeline').textContent,/attended Morgan/);
});

test('new parent profiles track repeated refusals, cooldown and future requests', () => {
  const s=game().save(); Object.assign(s,{age:30,balance:0,trait:'',extraTraits:[],parents:[{name:'Morgan',age:55,endAge:100,bond:70,alive:true,inheritance:1000,generosity:0,wealth:50,moneyRefusals:0}],siblings:[]}); const g=game(s,.9,true);
  function ask(){ click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); click(g,'[data-action="social-do-ask-parent-0"]'); }
  ask(); assert.equal(g.save().parents[0].moneyRefusals,1); assert.equal(g.save().parentAsks[0],null); ask(); assert.equal(g.save().parents[0].moneyRefusals,2); ask(); assert.equal(g.save().parents[0].moneyRefusals,3); assert.equal(g.save().parentAsks[0],30); assert.match(g.d.querySelector('#timeline').textContent,/stop requesting money/); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
  age(g,2); click(g,'[data-panel="relationships"]'); click(g,'[data-action="social"]'); click(g,'[data-action="social-target-parent-0"]'); assert.equal(g.d.querySelector('[data-action="social-do-ask-parent-0"]').disabled,true); click(g,'.close-modal'); age(g,1); ask(); assert.equal(g.save().parents[0].moneyRefusals,1); assert.equal(g.save().parentAsks[0],30); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
  const generous=game({...g.save(),parents:[{...g.save().parents[0],generosity:100}]},.5,true); click(generous,'[data-panel="relationships"]'); click(generous,'[data-action="social"]'); click(generous,'[data-action="social-target-parent-0"]'); click(generous,'[data-action="social-do-ask-parent-0"]'); assert.equal(generous.save().parents[0].moneyRefusals,0); assert.equal(generous.save().parentAsks[0],33); assert.ok(generous.save().balance>0); assert.equal(generous.dom.window.__validBackup({format:'little-life-backup',version:1,game:generous.save()}),true);
});

test('parent request tracking rejects invalid counts and leaves legacy profiles unchanged', () => {
  const g=game(undefined,.9,true), s=g.save(); assert.ok(s.parents.every(p=>p.moneyRefusals===0)); const valid=state=>g.dom.window.__validBackup({format:'little-life-backup',version:1,game:state}); for (const moneyRefusals of [-1,4,1.5,null,'1']) assert.equal(valid({...s,parents:[{...s.parents[0],moneyRefusals}]}),false); const legacy={...s.parents[0]}; delete legacy.moneyRefusals; assert.equal(valid({...s,parents:[legacy]}),true); delete legacy.generosity; delete legacy.wealth; assert.equal(valid({...s,parents:[{...legacy,moneyRefusals:0}]}),false);
});

test('cancer complications and heart attacks are recorded and persist through generations', () => {
  const base=game().save(); Object.assign(base,{age:40,parents:[],siblings:[],children:['Sam'],childBirthAges:[25],childBonds:[65],childProfiles:{},trait:'',extraTraits:[],balance:50000}); base.stats={happiness:80,health:10,smarts:60,looks:60};
  const cancer=game({...base,illness:'cancer',illnessSince:38},0,true); click(cancer,'#age-up'); assert.equal(cancer.save().alive,false); assert.equal(cancer.save().deathCause,'cancer'); assert.match(cancer.d.querySelector('#modal-content').textContent,/Cancer complications/); assert.equal(cancer.dom.window.__validBackup({format:'little-life-backup',version:1,game:cancer.save()}),true); click(cancer,'[data-action="choose-successor"]'); click(cancer,'[data-action="successor-0"]'); click(cancer,'[data-action="inherit-0"]'); assert.equal(cancer.save().legacyHistory[0].deathCause,'cancer'); click(cancer,'[data-panel="legacy"]'); click(cancer,'[data-action="archive-0"]'); assert.match(cancer.d.querySelector('#modal-content').textContent,/Cancer complications/);
  const pressure={...base,stress:100,illness:'high blood pressure',illnessSince:38,stats:{...base.stats,health:9}}; const fatal=game(pressure,.25,true); click(fatal,'#age-up'); assert.equal(fatal.save().deathCause,'heart-attack'); assert.match(fatal.d.querySelector('#modal-content').textContent,/Heart attack/); assert.match(fatal.d.querySelector('#timeline').textContent,/fatal heart attack/); assert.equal(fatal.dom.window.__validBackup({format:'little-life-backup',version:1,game:fatal.save()}),true); const survived=game(pressure,.9,true); click(survived,'#age-up'); assert.equal(survived.save().alive,true); assert.equal(survived.save().deathCause,null);
});

test('annual health reaching zero cannot be reversed by a later condition recovery', () => {
  const base=game().save(); Object.assign(base,{age:30,parents:[],siblings:[],trait:'',extraTraits:[],illness:'cancer',illnessSince:28,additionalIllnesses:[{name:'the flu',since:29}],stats:{...base.stats,happiness:80,health:1}}); const g=game(base,.9,true); click(g,'#age-up'); assert.equal(g.save().alive,false); assert.equal(g.save().deathCause,'poor-health'); assert.equal(g.save().stats.health,0); assert.doesNotMatch(g.d.querySelector('#timeline').textContent,/recovered from the flu/); assert.equal(g.dom.window.__validBackup({format:'little-life-backup',version:1,game:g.save()}),true);
});
