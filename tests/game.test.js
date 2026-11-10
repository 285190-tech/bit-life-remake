const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');
const KEY = 'little-life-save-v1';
function game(saved, random = 0.9) {
  const dom = new JSDOM(html, { url: 'https://example.com/', runScripts: 'outside-only' });
  dom.window.Math.random = () => random;
  if (saved) dom.window.localStorage.setItem(KEY, JSON.stringify(saved));
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
  act(g, 'occupation', 'university'); assert.equal(g.save().balance, beforeUniversity - 5000); assert.equal(g.save().income, 0);
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
