(() => {
  'use strict';
  const KEY = 'little-life-save-v1';
  const $ = (selector) => document.querySelector(selector);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (value) => Math.max(0, Math.min(100, value));
  const money = (value) => '$' + Math.round(value).toLocaleString('en-US');
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const firstNames = window.LIFE_NAMES?.first || ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Avery', 'Riley', 'Casey', 'Quinn', 'Charlie', 'Sam', 'Parker'];
  const surnames = window.LIFE_NAMES?.last || ['Bennett', 'Rivera', 'Brooks', 'Morgan', 'Hayes', 'Parker', 'Reed', 'Foster', 'Wells', 'Chen'];
  const cities = ['Portland, United States', 'Austin, United States', 'Charlotte, United States', 'London, United Kingdom', 'Toronto, Canada', 'Melbourne, Australia'];
  const statMeta = { happiness: ['😊', 'Happiness', '#e3bb70'], health: ['♥', 'Health', '#df948f'], smarts: ['✦', 'Smarts', '#91b4bf'], looks: ['✿', 'Looks', '#9abf98'] };
  const jobs = [
    { name: 'Barista', salary: 28000, icon: '☕' }, { name: 'Office assistant', salary: 35000, icon: '📎' },
    { name: 'Artist', salary: 32000, icon: '🎨' }, { name: 'Teacher', salary: 52000, icon: '🍎', degree: true, majors: ['education'], clean: true },
    { name: 'Software developer', salary: 85000, icon: '💻', degree: true, majors: ['computing'] }, { name: 'Doctor', salary: 110000, icon: '🩺', degree: true, majors: ['medicine'], smarts: 70, clean: true },
    { name: 'Musician', salary: 48000, icon: '🎵', skill: 'music', level: 3 }, { name: 'Athlete', salary: 60000, icon: '🏆', skill: 'fitness', level: 3 },
    { name: 'Chef', salary: 40000, icon: '👩‍🍳' }, { name: 'Mechanic', salary: 42000, icon: '🔧' },
    { name: 'Graphic designer', salary: 55000, icon: '🖌️', skill: 'art', level: 3 },
    { name: 'Journalist', salary: 50000, icon: '📰', degree: true, majors: ['arts'] }, { name: 'Engineer', salary: 80000, icon: '⚙️', degree: true, majors: ['computing'], smarts: 65 },
    { name: 'Librarian', salary: 47000, icon: '📚', degree: true, majors: ['education', 'arts'] }, { name: 'Paramedic', salary: 50000, icon: '🚑', clean: true }, { name: 'Accountant', salary: 60000, icon: '🧮', degree: true, majors: ['business'] }, { name: 'Financial analyst', salary: 75000, icon: '📊', degree: true, majors: ['business'] }
  ];
  const items = { bike: ['Bicycle', 500, '🚲'], car: ['Car', 15000, '🚗'], house: ['House', 100000, '🏡'] };
  const crimes = {
    shoplift: { name: 'shoplifting', label: 'Shoplift', icon: '🛍️', chance: 0.65, min: 200, max: 800, sentence: 1, fine: 200 },
    car: { name: 'car theft', label: 'Steal a car', icon: '🚘', chance: 0.4, min: 3000, max: 8000, sentence: 3, fine: 1000 },
    robbery: { name: 'robbery', label: 'Rob a store', icon: '💰', chance: 0.25, min: 10000, max: 20000, sentence: 5, fine: 2000 }
  };
  // Diet concept and categories adapted from OpenLife (MIT); game effects are rebalanced.
  const diets = {
    regular: { label: 'Regular', cost: 0, health: 0, happiness: 0 },
    vegetarian: { label: 'Vegetarian', cost: -500, health: 1, happiness: 0 },
    vegan: { label: 'Vegan', cost: 500, health: 1, happiness: 1 },
    mediterranean: { label: 'Mediterranean', cost: 500, health: 2, happiness: 1 },
    fastfood: { label: 'Fast food', cost: 2000, health: -4, happiness: 2 }
  };
  const majors = { education: 'Education', medicine: 'Medicine', computing: 'Computer science & engineering', arts: 'Arts & journalism', business: 'Business' };
  const gigs = { yard: ['Yard work', 250, '🌱'], tutor: ['Tutoring', 400, '✏️'], freelance: ['Freelance project', 800, '💻'] };
  const MAX_MOMENTS = 3;
  const skills = { music: ['🎵', 'Music'], art: ['🎨', 'Art'], fitness: ['🏃', 'Fitness'] };
  const milestones = [
    { id: 'school', icon: '🎒', name: 'First day', detail: 'Start school', check: s => s.age >= 5 },
    { id: 'career', icon: '💼', name: 'First paycheck', detail: 'Start a career', check: s => !!s.job },
    { id: 'graduate', icon: '🎓', name: 'Graduate', detail: 'Complete university', check: s => s.education === 'University' },
    { id: 'love', icon: '💍', name: 'Better together', detail: 'Get married', check: s => s.married },
    { id: 'family', icon: '🍼', name: 'Growing family', detail: 'Welcome a child', check: s => s.children.length > 0 },
    { id: 'home', icon: '🏡', name: 'Home sweet home', detail: 'Buy a house', check: s => s.assets.includes('House') },
    { id: 'skill', icon: '🌟', name: 'A little mastery', detail: 'Reach level 5 in a hobby', check: s => Object.values(s.skills).some(level => level >= 5) },
    { id: 'promotion', icon: '📈', name: 'Moving on up', detail: 'Earn a promotion', check: s => s.careerLevel >= 2 },
    { id: 'wealth', icon: '💰', name: 'Nest egg', detail: 'Reach $100,000 in cash and investments', check: s => s.balance + s.investment >= 100000 },
    { id: 'longlife', icon: '🎂', name: 'A life well lived', detail: 'Reach age 80', check: s => s.age >= 80 }
  ];
  let state;
  let returnFocus = null;
  let pendingImport = null;

  function freshLife(name, city) {
    name = name || `${pick(firstNames)} ${pick(surnames)}`; city = city || pick(cities);
    const parentOne = pick(firstNames.filter(n => !name.startsWith(n + ' ')));
    const parentTwo = pick(firstNames.filter(n => n !== parentOne && !name.startsWith(n + ' ')));
    const parents = [parentOne, parentTwo].map(parentName => ({ name: parentName, age: random(24, 40), endAge: random(72, 95), bond: 70, alive: true, inheritance: random(2000, 10000) }));
    return { version: 1, name, city, age: 0, stats: { happiness: random(65, 90), health: random(70, 95), smarts: random(55, 90), looks: random(55, 90) }, balance: 0, income: 0, job: '', retired: false, education: 'None', major: '', studyMajor: '', studying: false, partner: null, married: false, parents, generation: 1, legacyHistory: [], children: [], childBirthAges: [], friends: [], pet: null, assets: [], alive: true, pending: null, recentEvents: [], seenEvents: [], prisonYears: 0, convictions: 0, license: false, moves: 0, diet: 'regular', moments: MAX_MOMENTS, skills: { music: 0, art: 0, fitness: 0 }, careerLevel: 1, careerPerformance: 50, partnerBond: 65, friendBond: 60, investment: 0, illness: null, milestones: [], history: [{ age: 0, icon: '👶', tag: 'THE BEGINNING', entries: [`I was born in ${city}. Hello, world!`, `${parentOne} and ${parentTwo} welcomed me into the world. My story starts here.`] }] };
  }
  function upgradeGame(saved) {
    return { parents: [], generation: 1, legacyHistory: [], major: saved.education === 'University' ? 'legacy' : '', studyMajor: saved.studying ? 'legacy' : '', retired: false, married: false, children: [], childBirthAges: (saved.children || []).map(() => null), pet: null, recentEvents: [], seenEvents: [], prisonYears: 0, convictions: 0, license: false, moves: 0, diet: 'regular', moments: MAX_MOMENTS, skills: { music: 0, art: 0, fitness: 0 }, careerLevel: 1, careerPerformance: 50, partnerBond: 65, friendBond: 60, investment: 0, illness: null, milestones: [], ...saved };
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.version === 1 && Array.isArray(saved.history) && saved.stats) {
        return upgradeGame(saved);
      }
    } catch (_) { /* start fresh */ }
    return freshLife();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); $('#storage-warning').hidden = true; } catch (_) { $('#storage-warning').hidden = false; } }
  function occupation() {
    if (!state.alive) return 'At rest';
    if (state.prisonYears > 0) return 'In prison';
    if (state.job) return state.job;
    if (state.retired) return 'Retired';
    if (state.studying) return 'University student';
    if (state.age < 5) return 'Little one';
    if (state.age < 18) return 'Student';
    return 'Unemployed';
  }
  function portrait() { if (!state.alive) return '🕊️'; if (state.prisonYears > 0) return '⛓️'; if (state.age < 3) return '👶'; if (state.age < 13) return '🧒'; if (state.age < 65) return '🧑'; return '🧓'; }
  function changeStats(changes) { Object.entries(changes || {}).forEach(([key, amount]) => { if (key in state.stats) state.stats[key] = clamp(state.stats[key] + amount); }); }
  function log(text) {
    let chapter = state.history[state.history.length - 1];
    if (!chapter || chapter.age !== state.age) { chapter = { age: state.age, icon: '✦', tag: '', entries: [] }; state.history.push(chapter); }
    chapter.entries.push(text);
  }
  function checkMilestones() {
    for (const badge of milestones) {
      if (!state.milestones.includes(badge.id) && badge.check(state)) {
        state.milestones.push(badge.id);
        log(`Milestone unlocked: ${badge.name}!`);
      }
    }
  }
  function render() {
    checkMilestones();
    $('#character-name').textContent = state.name;
    $('#character-location').textContent = '⌖  ' + state.city;
    $('#profile-age').textContent = state.age + (state.age === 1 ? ' year' : ' years');
    $('#occupation').textContent = occupation();
    $('#portrait').textContent = portrait();
    $('#balance').textContent = money(state.balance);
    $('#income').textContent = money(state.income);
    $('#investment').textContent = money(state.investment);
    $('#health-status').innerHTML = (state.illness ? `<div class="health-alert">🩺 <strong>${esc(state.illness)}</strong> · Lowers health each year. Visit the doctor for treatment.</div>` : '') + (state.prisonYears ? `<div class="health-alert">⛓️ <strong>In prison</strong> · ${state.prisonYears} year${state.prisonYears === 1 ? '' : 's'} left. Age up to serve your sentence.</div>` : '');
    $('#life-status').textContent = state.alive ? 'LIFE IN PROGRESS' : 'LIFE COMPLETE';
    $('#chapter-label').textContent = `GEN ${state.generation} · CHAPTER ${String(state.age + 1).padStart(2, '0')}`;
    $('#moments').innerHTML = `<span>${state.alive ? `${state.moments} of ${MAX_MOMENTS} moments left this year` : 'Your story is complete'}</span><span>${state.alive ? '●'.repeat(state.moments) + '○'.repeat(MAX_MOMENTS - state.moments) : '✦'}</span>`;
    $('#stats').innerHTML = Object.entries(statMeta).map(([key, [icon, name, color]]) => `<div class="stat"><div class="stat-row"><span><span class="stat-emoji" style="color:${color}">${icon}</span>${name}</span><span class="stat-value">${state.stats[key]}%</span></div><div class="bar"><i style="width:${state.stats[key]}%;background:${color}"></i></div></div>`).join('');
    $('#timeline').innerHTML = [...state.history].reverse().map((year) => `<div class="year-block"><div class="year-icon">${esc(year.icon)}</div><div><div class="year-heading"><strong>Age ${year.age}</strong>${year.tag ? `<span>${esc(year.tag)}</span>` : ''}</div>${year.entries.map(entry => `<p class="event">${esc(entry)}</p>`).join('')}</div></div>`).join('');
    $('#story-bottom').innerHTML = state.alive ? '<span>✧</span> Your story is still being written... <span>✧</span>' : '<span>✧</span> <button class="story-review" id="review-life">See your life in review</button> <span>✧</span>';
    $('#age-up').disabled = !state.alive || state.pending !== null;
    $('#age-up strong').textContent = state.alive ? 'Age up' : 'Life complete';
    $('#age-up small').textContent = state.alive ? 'See what the next year brings' : 'Review your story or continue your legacy';
    save();
  }
  function modal(content) {
    if ($('#modal').classList.contains('hidden')) returnFocus = document.activeElement;
    $('#modal-content').innerHTML = content;
    $('#modal').classList.remove('hidden');
    $('.close-modal').hidden = state.pending !== null;
    const focusTarget = state.pending !== null ? $('#modal-content button:not(:disabled)') : $('.close-modal');
    if (focusTarget) focusTarget.focus();
  }
  function closeModal() { $('#modal').classList.add('hidden'); if (returnFocus && returnFocus.focus) returnFocus.focus(); }
  const option = (action, icon, title, detail, disabled = false) => `<button class="modal-option" data-action="${action}" ${disabled ? 'disabled' : ''}><span class="option-emoji">${icon}</span><span><strong>${title}</strong><small>${detail}</small></span><b>›</b></button>`;
  const header = (icon, kicker, title, description) => `<div class="modal-icon">${icon}</div><div class="eyebrow">${kicker}</div><h2 id="modal-title">${title}</h2><p class="modal-desc">${description}</p>`;
  function panel(type) {
    if (!state.alive && type !== 'milestones' && type !== 'legacy') { showSummary(); return; }
    if (state.pending !== null) { showEvent(); return; }
    const noTime = state.moments <= 0;
    let content = '';
    const timeNote = noTime ? ' No moments left this year; age up to make more memories.' : ` ${state.moments} moment${state.moments === 1 ? '' : 's'} left this year.`;
    if (state.prisonYears > 0 && type !== 'milestones' && type !== 'legacy') {
      content = header('⛓️', 'TIME TO REFLECT', 'Life in prison', `${state.prisonYears} year${state.prisonYears === 1 ? '' : 's'} remain on your sentence. Age up to serve time. You can still make a few choices.${timeNote}`);
      content += option('prison-read', '📖', 'Read in the library', 'Pass the time and improve your smarts.', noTime);
      content += option('prison-exercise', '🏃', 'Exercise in the yard', 'Look after your health.', noTime);
      content += option('prison-contact', '✉️', 'Write to loved ones', 'Maintain your relationships and lift your spirits.', noTime);
      content += option('prison-doctor', '🩺', 'Visit the infirmary', 'Free care; treats illness and improves health.', noTime);
      modal(content); return;
    }
    if (type === 'activities') {
      content = header('✦', 'A LITTLE ME TIME', 'Activities', 'There’s always something to do.' + timeNote);
      content += option('walk', '🌿', 'Go for a walk', 'A little fresh air improves health and happiness.', noTime || state.age < 5);
      content += option('read', '📚', 'Read a book', 'Give your brain a little workout.', noTime || state.age < 5);
      content += option('meditate', '🧘', 'Meditate', 'Slow down and find your happy place.', noTime || state.age < 5);
      content += option('gym', '🏃', 'Exercise', 'Build healthy habits and feel your best. Available at 13.', noTime || state.age < 13);
      content += option('hobbies', '🎨', 'Hobbies & skills', 'Practice music, art or fitness. Skills can unlock careers.', state.age < 8);
      const doctorCost = state.age < 18 ? 0 : (state.illness ? 500 : 100);
      content += option('doctor', '🩺', 'Visit the doctor', state.age < 18 ? 'Family covers the cost. Treats illness and improves health.' : state.illness ? `Treat ${esc(state.illness)} for $500.` : 'A checkup costs $100 and improves health.', noTime || state.balance < doctorCost);
      content += option('gigs', '🧰', 'Odd jobs', 'Earn a little extra money. Available at 16.', noTime || state.age < 16);
      content += option('diet', '🥗', 'Choose a diet', `Current: ${esc(diets[state.diet].label)}. Change your yearly costs and stats.`, state.age < 18);
      content += option('travel', '🌍', 'Move abroad', 'Start over in another city. Moving costs $3,000.', noTime || state.age < 18 || state.balance < 3000);
      content += option('license', '🪪', state.license ? 'Driver’s license earned' : 'Get a driver’s license', 'Costs $250. Available at 16; needed to buy a car.', noTime || state.age < 16 || state.balance < 250 || state.license);
      content += option('crime', '🕵️', 'Crime', 'Risk arrest for a chance at fast money. Available at 18.', noTime || state.age < 18);
    } else if (type === 'relationships') {
      content = header('♡', 'BETTER TOGETHER', 'Relationships', 'Friendship and partner bonds fall by 3 each year. Spend time together to stay close.' + timeNote);
      content += option('family', '🏡', 'Spend time with family', 'Catch up with your loved ones.', noTime);
      state.parents.forEach((parent, index) => {
        if (parent.alive) content += option(`parent-${index}`, '👪', `Visit ${esc(parent.name)}`, `Parent · Age ${parent.age} · Bond ${parent.bond}% · Spend time together; a bond below 40% halves inheritance.`, noTime);
        else content += `<div class="legacy-entry"><span><strong>${esc(parent.name)}</strong><small>Parent · Remembered at age ${parent.age}</small></span><span>🕊️</span></div>`;
      });
      content += option('friend', '🤝', state.friends.length ? `Hang out with ${esc(state.friends[0])}` : 'Make a friend', state.friends.length ? `Friendship: ${state.friendBond}% · Spending time strengthens your bond.` : 'Meet someone new. Available at 5.', noTime || state.age < 5);
      content += option('date', '💌', state.partner ? `Spend time with ${esc(state.partner)}` : 'Find a date', state.partner ? `Bond: ${state.partnerBond}% · Spending time strengthens your relationship.` : 'Available at 18. Your looks influence your starting bond.', noTime || state.age < 18);
      if (state.partner && !state.married) content += option('marry', '💍', `Marry ${esc(state.partner)}`, 'A wedding costs $2,000 and requires a bond of 60%.', noTime || state.balance < 2000 || state.partnerBond < 60);
      if (!state.partner && state.age >= 18) content += option('adopt', '🍼', 'Adopt a child', 'Costs $1,500. Each child costs $2,000/year until 18.', noTime || state.balance < 1500 || state.children.length >= 4);
      if (state.partner) content += option('child', '🍼', 'Welcome a child', 'Costs $1,000; requires 45% bond. Each child costs $2,000/year until 18.', noTime || state.balance < 1000 || state.children.length >= 4 || state.partnerBond < 45);
      if (state.children.length) content += option('children', '🧸', 'Spend time with your children', `Make memories with ${state.children.map(esc).join(', ')}.`, noTime);
      if (state.partner) content += option('breakup', '💔', state.married ? 'Get divorced' : 'Break up', 'Sometimes it’s time to go separate ways.', noTime);
      content += option('pet', '🐾', state.pet ? `Play with ${esc(state.pet)}` : 'Adopt a pet', state.pet ? 'Your furry friend is happy to see you.' : 'Costs $500 to adopt and $500/year. Available at 18.', noTime || state.age < 18 || (!state.pet && state.balance < 500));
    } else if (type === 'occupation') {
      content = header('▤', 'DREAM A LITTLE BIGGER', 'School & career', `Currently: ${esc(occupation())}. Education: ${esc(state.education)}${state.major && state.major !== 'legacy' ? ` (${esc(majors[state.major])})` : ''}.${timeNote}`);
      if (state.age < 18) content += option('study', '✏️', 'Study harder', 'Hit the books and improve your smarts. Available at 5.', noTime || state.age < 5);
      else {
        if (state.studying) content += `<div class="empty-state">🎓 ${esc(majors[state.studyMajor] || 'University')}: year ${Math.min(4, state.age - state.studyStarted + 1)} of 4. Keep aging to graduate.</div>`;
        else content += option('university', '🎓', state.education === 'University' ? 'Study another degree' : 'Go to university', `Four years of study. Tuition ${money(universityCost())}; leaves your job.`, noTime || state.balance < universityCost());
        content += option('job', '💼', state.job ? 'Look for another job' : 'Find a job', 'Browse opportunities and start earning.', noTime);
        if (state.job) { content += `<div class="progress-card">📈 <strong>Career level ${state.careerLevel} · Performance ${state.careerPerformance}%</strong><br>Reach 80% before your next birthday for a promotion (up to level 5). Performance falls by 4 each year.</div>`; content += option('work', '⭐', 'Work harder', 'Gain 20 performance; lose 4 happiness. Promotions bring a 15% raise.', noTime || state.careerLevel >= 5); content += option('quit', '🚪', 'Quit your job', 'Leave your current position.', noTime); if (state.age >= 65) content += option('retire', '🌅', 'Retire', 'Leave work and receive 30% of your salary as annual pension.', noTime); }
      }
    } else if (type === 'assets') {
      content = header('◇', 'THE LITTLE THINGS', 'Assets', `Your balance is ${money(state.balance)}. Spend wisely!${timeNote}`);
      content += `<div class="empty-state">${state.assets.length ? 'You own: ' + state.assets.map(esc).join(', ') + '.' : 'Nothing here yet. Your collection starts with a single little thing.'}</div>`;
      content += `<div class="progress-card">📊 <strong>Investment fund: ${money(state.investment)}</strong><br>Its value changes by −12% to +18% each year. You can lose money.</div>`;
      content += option('invest', '📈', 'Invest $5,000', 'Buy into the fund. Available at 18.', noTime || state.age < 18 || state.balance < 5000);
      if (state.investment) content += option('withdraw', '💵', 'Sell investments', `Move ${money(state.investment)} back to your balance.`, noTime);
      for (const [key, [name, cost, icon]] of Object.entries(items)) {
        const owned = state.assets.includes(name);
        content += owned ? option(`sell-${key}`, icon, `Sell ${esc(name.toLowerCase())}`, `Sell for ${money(cost * .7)}.`, noTime) : option(key, icon, `Buy a ${esc(name.toLowerCase())}`, `${money(cost)}${key !== 'bike' ? ' · Available at 18' : ''}${key === 'house' ? ' · Reduces annual living costs' : ''}${key === 'car' ? ' · License required' : ''}`, noTime || state.balance < cost || (key !== 'bike' && state.age < 18) || (key === 'car' && !state.license));
      }
    } else if (type === 'legacy') {
      showLegacy(); return;
    } else if (type === 'milestones') {
      content = header('🏅', 'YOUR LITTLE VICTORIES', 'Milestones', `${state.milestones.length} of ${milestones.length} unlocked. Every life has its own path.`);
      content += milestones.map(b => `<div class="milestone-row ${state.milestones.includes(b.id) ? '' : 'locked'}"><span class="badge">${b.icon}</span><span><strong>${esc(b.name)}</strong><small>${esc(b.detail)}</small></span><span class="milestone-status">${state.milestones.includes(b.id) ? '✓ UNLOCKED' : 'LOCKED'}</span></div>`).join('');
    }
    modal(content);
  }
  function hobbiesPanel() {
    const noTime = state.moments <= 0;
    let content = header('🎨', 'PRACTICE MAKES PROGRESS', 'Hobbies & skills', 'Each practice costs one moment. Reach level 3 in music or fitness to unlock a related career.');
    content += `<div class="skill-grid">${Object.entries(skills).map(([key, [icon, name]]) => `<div>${icon} ${name}<strong>Level ${state.skills[key]}/5</strong></div>`).join('')}</div>`;
    for (const [key, [icon, name]] of Object.entries(skills)) content += option(`practice-${key}`, icon, `Practice ${name.toLowerCase()}`, state.skills[key] >= 5 ? 'You have mastered this hobby!' : `Level ${state.skills[key]} → ${state.skills[key] + 1} · Boosts happiness${key === 'fitness' ? ' and health' : ''}.`, noTime || state.skills[key] >= 5);
    modal(content);
  }
  function universityCost() { return state.stats.smarts >= 85 ? 2500 : 5000; }
  function universityPanel() {
    let content = header('🎓', 'CHOOSE YOUR PATH', 'University', `Choose a four-year degree. Tuition: ${money(universityCost())}${state.stats.smarts >= 85 ? ' with a scholarship for 85% smarts' : ' (85% smarts earns a scholarship)'}. Enrolling ends your job and pension.`);
    for (const [key, label] of Object.entries(majors)) content += option(`major-${key}`, '📘', label, `Study ${label.toLowerCase()} · Four years`, state.moments <= 0 || state.balance < universityCost() || state.studying || state.major === key);
    modal(content);
  }
  function gigsPanel() {
    let content = header('🧰', 'A LITTLE EXTRA', 'Odd jobs', 'Earn cash without leaving your job or studies. Each gig costs a moment.');
    for (const [key, [label, pay, icon]] of Object.entries(gigs)) content += option(`gig-${key}`, icon, label, `${money(pay)} per gig${key === 'tutor' ? ' · 65% smarts required' : ''}${key === 'freelance' ? ' · Age 18+ and level 2 art or music required' : ''}`, state.moments <= 0 || (key === 'tutor' && state.stats.smarts < 65) || (key === 'freelance' && (state.age < 18 || Math.max(state.skills.art, state.skills.music) < 2)));
    modal(content);
  }
  function dietPanel() {
    let content = header('🥗', 'EVERYDAY CHOICES', 'Choose a diet', 'Diet changes apply once a year from age 19. These are game effects, not dietary advice. Changing costs one moment.');
    for (const [key, diet] of Object.entries(diets)) {
      const cost = diet.cost < 0 ? `Saves ${money(-diet.cost)}/year` : diet.cost ? `Costs ${money(diet.cost)}/year` : 'No extra cost';
      const effects = `${diet.health >= 0 ? '+' : ''}${diet.health} health · ${diet.happiness >= 0 ? '+' : ''}${diet.happiness} happiness / year`;
      content += option(`diet-${key}`, '🍽️', `${diet.label}${state.diet === key ? ' · Current' : ''}`, `${cost} · ${effects}`, state.moments <= 0 || state.diet === key);
    }
    modal(content);
  }
  function crimePanel() {
    let content = header('🕵️', 'HIGH RISK, HIGH CONSEQUENCES', 'Crime', `Convictions: ${state.convictions}. Getting caught costs your job and can lead to prison. Some careers require a clean record.`);
    for (const [key, crime] of Object.entries(crimes)) content += option(`offense-${key}`, crime.icon, crime.label, `${Math.round(crime.chance * 100)}% chance of success · ${money(crime.min)}–${money(crime.max)} · If caught: ${crime.sentence} year${crime.sentence === 1 ? '' : 's'} in prison and up to ${money(crime.fine)} fine.`, state.moments <= 0);
    modal(content);
  }
  function travelPanel() {
    let content = header('🌍', 'A CHANGE OF SCENERY', 'Move abroad', 'Moving costs $3,000. Your current job, university enrollment, and pension will end. Your possessions and relationships stay with you.');
    cities.forEach((city, index) => { if (city !== state.city) content += option(`move-${index}`, '📍', esc(city), 'Move here for $3,000.', state.moments <= 0 || state.balance < 3000); });
    modal(content);
  }
  // Keep the first six event indices stable for saved games with an unresolved choice.
  const events = [
    { min: 5, max: 17, icon: '🎨', title: 'A creative opportunity', text: 'Your school is looking for someone to enter the art competition. What do you do?', choices: [{ label: 'Give it a try', result: 'I entered the school art competition and had a great time.', stats: { happiness: 7, smarts: 2 } }, { label: 'Sit this one out', result: 'I decided not to enter the art competition.', stats: { happiness: -1 } }] },
    { min: 5, max: 17, icon: '🧩', title: 'A tricky assignment', text: 'You have a big school assignment due soon. How will you handle it?', choices: [{ label: 'Put in the work', result: 'I worked hard on a difficult school assignment.', stats: { smarts: 7, happiness: -2 } }, { label: 'Wing it', result: 'I took it easy instead of studying for my assignment.', stats: { happiness: 3, smarts: -3 } }] },
    { min: 18, max: 100, icon: '🎟️', title: 'A little adventure', text: 'A friend invites you on a spontaneous weekend trip for $300. Do you go?', choices: [{ label: 'Pack my bags', cost: 300, result: 'I went on a spontaneous weekend adventure. Totally worth it!', stats: { happiness: 10 } }, { label: 'Save my money', result: 'I stayed home and saved my money.', stats: { happiness: -1 } }] },
    { min: 18, max: 100, icon: '💡', title: 'A new skill', text: 'You have some free time and an opportunity to learn something new.', choices: [{ label: 'Learn something', result: 'I spent some time learning a new skill.', stats: { smarts: 6, happiness: 2 } }, { label: 'Take it easy', result: 'I enjoyed some well-deserved downtime.', stats: { happiness: 5 } }] },
    { min: 3, max: 100, icon: '🐕', title: 'A furry friend', text: 'You meet a very friendly dog at the park. It seems to like you!', choices: [{ label: 'Say hello', result: 'I made a furry friend at the park.', stats: { happiness: 7 } }, { label: 'Keep walking', result: 'I admired a friendly dog from afar.', stats: {} }] },
    { min: 18, max: 100, icon: '💌', title: 'A kind gesture', text: 'Someone in your community could use a hand. Will you help out?', choices: [{ label: 'Lend a hand', result: 'I helped someone in my community. It felt good to give back.', stats: { happiness: 6 } }, { label: 'Maybe next time', result: 'I was too busy to volunteer this time.', stats: {} }] },
    { min: 1, max: 5, icon: '🧸', title: 'A favorite toy', text: 'A colorful new toy catches your eye. How will you play?', choices: [{ label: 'Share it', result: 'I shared my favorite toy and made someone smile.', stats: { happiness: 6 } }, { label: 'Keep it close', result: 'I spent the afternoon playing with my favorite toy.', stats: { happiness: 3 } }] },
    { min: 6, max: 17, icon: '⚽', title: 'Join the team?', text: 'Your school is starting a sports team and they need more players.', choices: [{ label: 'Sign me up', result: 'I joined a school sports team and made some great memories.', stats: { health: 7, happiness: 3 } }, { label: 'Cheer from the sidelines', result: 'I cheered on the school team from the sidelines.', stats: { happiness: 2 } }] },
    { min: 6, max: 17, icon: '🍎', title: 'The new kid', text: 'A new student looks a little lost on their first day.', choices: [{ label: 'Introduce myself', result: 'I helped a new student feel welcome at school.', stats: { happiness: 6 } }, { label: 'Give them space', result: 'I let the new student settle in at their own pace.', stats: {} }] },
    { min: 13, max: 17, icon: '🎤', title: 'A chance to shine', text: 'There is an open spot in the school talent show.', choices: [{ label: 'Take the stage', result: 'I performed at the school talent show. What a rush!', stats: { happiness: 6, looks: 3 } }, { label: 'Watch the show', result: 'I watched my classmates perform at the talent show.', stats: { happiness: 2 } }] },
    { min: 18, max: 100, icon: '👛', title: 'A lost wallet', text: 'You find a wallet on the sidewalk. There’s cash inside and an ID.', choices: [{ label: 'Return it', result: 'I returned a lost wallet to its grateful owner.', stats: { happiness: 5 } }, { label: 'Keep the cash', result: 'I kept the cash from a wallet I found.', gain: 250, stats: { happiness: -3 } }] },
    { min: 18, max: 100, icon: '🌧️', title: 'A rainy day', text: 'Your plans fell through and you have an unexpected day to yourself.', choices: [{ label: 'Rest and recharge', result: 'I took a quiet day to rest and recharge.', stats: { health: 4, happiness: 4 } }, { label: 'Be productive', result: 'I used a rainy day to get things done.', stats: { smarts: 4 } }] },
    { min: 18, max: 100, icon: '📱', title: 'An old friend calls', text: 'Someone you haven’t spoken to in years reaches out to catch up.', choices: [{ label: 'Pick up the phone', result: 'I reconnected with an old friend.', stats: { happiness: 7 } }, { label: 'Call another time', result: 'I missed a chance to reconnect with an old friend.', stats: { happiness: -2 } }] },
    { min: 18, max: 100, icon: '🌻', title: 'A little project', text: 'You have an idea for a project you’ve always wanted to try.', choices: [{ label: 'Get started', result: 'I started a passion project and learned a lot along the way.', stats: { smarts: 4, happiness: 4 } }, { label: 'Not right now', result: 'I put my project idea aside for another day.', stats: {} }] },
    { min: 18, max: 100, icon: '🧾', title: 'Unexpected bill', text: 'An unexpected expense arrives in the mail. How will you deal with it?', choices: [{ label: 'Pay it now', cost: 500, result: 'I paid an unexpected bill and put it behind me.', stats: { happiness: 2 } }, { label: 'Sort it out myself', result: 'I spent a stressful afternoon sorting out an unexpected bill.', stats: { happiness: -5, smarts: 2 } }] },
    { min: 30, max: 100, icon: '🌅', title: 'A moment to reflect', text: 'You find yourself thinking about how far you’ve come.', choices: [{ label: 'Be proud of my journey', result: 'I reflected on my journey and appreciated how far I have come.', stats: { happiness: 7 } }, { label: 'Set a new goal', result: 'I set a new goal for the years ahead.', stats: { smarts: 3, happiness: 2 } }] },
    { min: 5, max: 100, icon: '🌱', title: 'A tiny garden', text: 'You have the chance to plant something and watch it grow.', choices: [{ label: 'Plant a seed', result: 'I planted a seed and enjoyed watching it grow.', stats: { happiness: 5, health: 2 } }, { label: 'Leave it to the gardeners', result: 'I admired the garden from a comfortable distance.', stats: { happiness: 1 } }] },
    { min: 18, max: 100, icon: '🧁', title: 'A sweet surprise', text: 'The local bakery is celebrating with a special treat.', choices: [{ label: 'Treat myself', cost: 20, result: 'I treated myself to something delicious at the bakery.', stats: { happiness: 6 } }, { label: 'Pass for now', result: 'I resisted a tempting treat at the bakery.', stats: { health: 1 } }] },
    { min: 18, max: 100, when: s => !!s.job, icon: '📋', title: 'A challenging project', text: 'A difficult project lands on your desk. Taking the lead could help your career, but it will take its toll.', choices: [{ label: 'Take the lead', result: 'I took the lead on a demanding project at work.', performance: 15, stats: { happiness: -5, smarts: 3 } }, { label: 'Keep my workload manageable', result: 'I chose a manageable workload instead of taking on another project.', stats: { happiness: 3 } }] },
    { min: 18, max: 100, when: s => !!s.partner, icon: '💬', title: 'A difficult conversation', text: 'Your partner wants to talk about something that has been bothering them.', choices: [{ label: 'Listen and work it out', result: 'My partner and I talked through a difficult issue together.', bond: 12, stats: { happiness: 3 } }, { label: 'Avoid the conversation', result: 'I avoided a difficult conversation with my partner.', bond: -12, stats: { happiness: -2 } }] },
    { min: 5, max: 100, when: s => s.friends.length > 0, icon: '🤝', title: 'A friend needs you', text: 'Your friend is having a hard week and asks if you can spend some time together.', choices: [{ label: 'Be there for them', result: 'I showed up for my friend when they needed me.', friendBond: 15, stats: { happiness: 4 } }, { label: 'I am too busy', result: 'I was too busy to help my friend this time.', friendBond: -12, stats: {} }] },
    { min: 18, max: 100, when: s => s.assets.includes('House'), icon: '🔧', title: 'A home repair', text: 'Something in your house needs fixing. You can hire help or try to repair it yourself.', choices: [{ label: 'Call a professional', cost: 1000, result: 'I hired a professional to repair my home.', stats: { happiness: 2 } }, { label: 'Fix it myself', result: 'I spent a long weekend fixing my home myself.', stats: { smarts: 4, happiness: -3 } }] },
    { min: 18, max: 100, when: s => s.children.length > 0, icon: '🎈', title: 'A family celebration', text: 'Your family has a reason to celebrate. What kind of day will you plan?', choices: [{ label: 'Throw a party', cost: 300, result: 'I threw a lovely celebration for my family.', stats: { happiness: 9 } }, { label: 'Keep it simple', result: 'We celebrated together with a quiet day at home.', stats: { happiness: 5 } }] },
    { min: 18, max: 100, when: s => s.studying, icon: '📝', title: 'Exams are coming', text: 'University exams are around the corner. How will you prepare?', choices: [{ label: 'Study through the night', result: 'I studied late into the night for my university exams.', stats: { smarts: 7, health: -3 } }, { label: 'Rest before the exam', result: 'I decided to rest before my university exams.', stats: { health: 3, happiness: 2 } }] },
    { min: 18, max: 100, when: s => !!s.pet, icon: '🐾', title: 'A special day for your pet', text: 'Your pet has a lot of energy today. How will you spend the afternoon?', choices: [{ label: 'Visit the pet park', result: 'I took my pet to the park for a lovely afternoon.', stats: { happiness: 7, health: 2 } }, { label: 'Buy a new toy', cost: 100, result: 'I surprised my pet with a new toy.', stats: { happiness: 8 } }] },
    { min: 18, max: 100, when: s => s.skills.music >= 3, icon: '🎶', title: 'An open mic', text: 'A local venue is looking for musicians for its open mic night.', choices: [{ label: 'Perform', result: 'I performed at an open mic and earned a little money.', gain: 200, stats: { happiness: 5 } }, { label: 'Enjoy the music', result: 'I enjoyed the music at a local open mic.', stats: { happiness: 3 } }] },
    { min: 18, max: 100, when: s => s.skills.art >= 3, icon: '🖼️', title: 'A local exhibition', text: 'A neighborhood gallery offers to show your artwork.', choices: [{ label: 'Show my work', result: 'My artwork was displayed at a neighborhood gallery.', gain: 300, stats: { happiness: 6 } }, { label: 'Keep creating privately', result: 'I decided to keep my artwork to myself for now.', stats: { happiness: 2 } }] },
    { min: 18, max: 100, when: s => !!s.illness, icon: '🍵', title: 'Time to slow down', text: 'Your illness is making you feel tired. A quiet day might help, but only a doctor can treat the illness.', choices: [{ label: 'Get some rest', result: 'I took it easy while feeling unwell.', stats: { health: 4, happiness: 2 } }, { label: 'Push through', result: 'I pushed through a difficult day while feeling unwell.', stats: { health: -4, smarts: 2 } }] },
    { min: 18, max: 100, when: s => !!s.job, icon: '⏰', title: 'Overtime opportunity', text: 'Your workplace offers a small bonus for working over the weekend.', choices: [{ label: 'Take the overtime', result: 'I worked overtime and received a bonus.', gain: 500, performance: 5, stats: { happiness: -4 } }, { label: 'Protect my time off', result: 'I turned down overtime to enjoy my weekend.', stats: { happiness: 5 } }] },
    { min: 5, max: 17, icon: '📖', title: 'Library day', text: 'You have an afternoon at the library and can choose how to spend it.', choices: [{ label: 'Explore the shelves', result: 'I discovered a fascinating book at the library.', stats: { smarts: 5 } }, { label: 'Read with a friend', result: 'I shared a story with a friend at the library.', stats: { happiness: 5 } }] },
    { min: 65, max: 100, icon: '📸', title: 'A box of memories', text: 'You find a box of old photographs and souvenirs.', choices: [{ label: 'Share the stories', result: 'I shared old photographs and stories with people I love.', stats: { happiness: 7 } }, { label: 'Make a scrapbook', result: 'I made a scrapbook of memories from my life.', stats: { happiness: 4, smarts: 2 } }] }
  ];
  // Additional original stories. Entries are appended so existing pending event IDs remain valid.
  events.push(
    { min: 2, max: 7, icon: '🪁', title: 'A windy afternoon', text: 'The wind is perfect for a kite, but your favorite book is waiting inside.', choices: [{ label: 'Fly the kite', result: 'I flew a kite until the sun went down.', stats: { happiness: 6, health: 2 } }, { label: 'Stay in and read', result: 'I stayed inside with a wonderful story.', stats: { smarts: 5 } }] },
    { min: 3, max: 10, icon: '🎂', title: 'Birthday plans', text: 'It is your birthday! How would you like to celebrate?', choices: [{ label: 'Have a party', result: 'My birthday party was full of laughter and cake.', stats: { happiness: 8 } }, { label: 'Keep it quiet', result: 'I enjoyed a quiet birthday with my family.', stats: { happiness: 4, health: 1 } }] },
    { min: 5, max: 12, icon: '🔬', title: 'The science fair', text: 'A science fair is coming up. You can build a project or enjoy the exhibits.', choices: [{ label: 'Build a project', result: 'I built a science project and learned from my mistakes.', stats: { smarts: 7, happiness: -2 } }, { label: 'Explore the exhibits', result: 'I wandered around the science fair and had fun.', stats: { smarts: 2, happiness: 4 } }] },
    { min: 8, max: 17, icon: '🎭', title: 'The school play', text: 'The drama club needs performers and stage crew for its new show.', choices: [{ label: 'Audition for a role', result: 'I stepped onstage in the school play.', stats: { happiness: 6, looks: 2 } }, { label: 'Help backstage', result: 'I helped put together the school play behind the scenes.', stats: { smarts: 3, happiness: 3 } }] },
    { min: 10, max: 17, icon: '🚌', title: 'Field trip', text: 'Your class is choosing between a museum and a day outdoors.', choices: [{ label: 'Visit the museum', result: 'I explored a museum on a school trip.', stats: { smarts: 5, happiness: 2 } }, { label: 'Go outdoors', result: 'I spent the school trip exploring outside.', stats: { health: 4, happiness: 4 } }] },
    { min: 13, max: 17, icon: '📱', title: 'A rumor spreads', text: 'A rumor about a classmate is spreading through your group chat.', choices: [{ label: 'Check on them', result: 'I reached out to a classmate who was having a difficult day.', stats: { happiness: 4 } }, { label: 'Leave the chat', result: 'I stepped away from the group chat and its drama.', stats: { happiness: 2 } }] },
    { min: 16, max: 25, icon: '🧭', title: 'Future plans', text: 'Someone asks what you want to do with your future. You are not sure yet.', choices: [{ label: 'Research careers', result: 'I explored a few possible careers for my future.', stats: { smarts: 4 } }, { label: 'Follow my curiosity', result: 'I decided to give myself time to discover what I enjoy.', stats: { happiness: 4 } }] },
    { min: 18, max: 100, icon: '🎲', title: 'Game night', text: 'A neighbor invites you to a board-game night.', choices: [{ label: 'Join the game', result: 'I spent the evening laughing over a board game.', stats: { happiness: 6 } }, { label: 'Stay home', result: 'I spent a peaceful evening at home.', stats: { health: 2 } }] },
    { min: 18, max: 100, icon: '🧳', title: 'A weekend away', text: 'There is a cheap fare for a short trip. Is it time for a change of scenery?', choices: [{ label: 'Book the trip', cost: 400, result: 'I took a refreshing weekend trip.', stats: { happiness: 9 } }, { label: 'Explore locally', result: 'I discovered a new place close to home.', stats: { happiness: 4 } }] },
    { min: 18, max: 100, icon: '🚲', title: 'Getting around', text: 'You have an extra hour and need to get across town.', choices: [{ label: 'Walk the scenic route', result: 'I took the scenic route across town.', stats: { health: 4, happiness: 2 } }, { label: 'Take the bus', result: 'I caught the bus and used the time to read.', stats: { smarts: 3 } }] },
    { min: 18, max: 100, icon: '📦', title: 'Decluttering day', text: 'Your living space could use a little attention.', choices: [{ label: 'Donate unused things', result: 'I donated things I no longer needed.', stats: { happiness: 6 } }, { label: 'Sell a few items', result: 'I sold some unused things and made a little money.', gain: 150, stats: { happiness: 1 } }] },
    { min: 18, max: 100, icon: '🎪', title: 'The town festival', text: 'A festival has come to town with food, music, and games.', choices: [{ label: 'Enjoy the festival', cost: 100, result: 'I spent a lively day at the town festival.', stats: { happiness: 7 } }, { label: 'Listen from outside', result: 'I enjoyed the festival music from a nearby park.', stats: { happiness: 3 } }] },
    { min: 18, max: 100, icon: '🧑‍🍳', title: 'Dinner experiment', text: 'You find a recipe you have never tried before.', choices: [{ label: 'Try cooking it', result: 'I tried a new recipe and learned a thing or two.', stats: { happiness: 4, smarts: 2 } }, { label: 'Order a favorite', cost: 40, result: 'I ordered my favorite meal and relaxed.', stats: { happiness: 5 } }] },
    { min: 18, max: 100, icon: '🗳️', title: 'Community decision', text: 'Your neighborhood is voting on how to use a shared public space.', choices: [{ label: 'Support a garden', result: 'I supported a new community garden.', stats: { happiness: 4, health: 1 } }, { label: 'Support a library', result: 'I supported a new neighborhood library.', stats: { happiness: 2, smarts: 3 } }] },
    { min: 18, max: 100, when: s => !!s.partner, icon: '🍽️', title: 'Anniversary plans', text: '{{partner}} asks how you would like to celebrate your time together.', choices: [{ label: 'Plan a special dinner', cost: 200, result: '{{partner}} and I celebrated with a special dinner.', bond: 12, stats: { happiness: 6 } }, { label: 'Cook together at home', result: '{{partner}} and I celebrated with a cozy dinner at home.', bond: 7, stats: { happiness: 4 } }] },
    { min: 18, max: 100, when: s => !!s.partner, icon: '🗺️', title: 'Different plans', text: '{{partner}} wants to spend the weekend differently than you do.', choices: [{ label: 'Find a compromise', result: '{{partner}} and I found a compromise for the weekend.', bond: 8, stats: { happiness: 2 } }, { label: 'Make separate plans', result: '{{partner}} and I spent the weekend doing our own things.', bond: -3, stats: { happiness: 4 } }] },
    { min: 5, max: 100, when: s => s.friends.length > 0, icon: '🎮', title: 'A friendly challenge', text: '{{friend}} challenges you to a game. What will you do?', choices: [{ label: 'Accept the challenge', result: '{{friend}} and I played a game together.', friendBond: 8, stats: { happiness: 5 } }, { label: 'Suggest a walk instead', result: '{{friend}} and I went for a walk instead.', friendBond: 4, stats: { health: 3, happiness: 2 } }] },
    { min: 18, max: 100, when: s => s.children.length > 0, icon: '🎓', title: 'A question from your child', text: '{{child}} wants your advice on trying something new.', choices: [{ label: 'Encourage them', result: 'I encouraged {{child}} to try something new.', stats: { happiness: 6 } }, { label: 'Help make a plan', result: 'I helped {{child}} make a plan for a new challenge.', stats: { smarts: 3, happiness: 3 } }] },
    { min: 18, max: 100, when: s => !!s.job, icon: '☕', title: 'A coworker needs help', text: 'A coworker is struggling to finish a project before its deadline.', choices: [{ label: 'Offer to help', result: 'I helped a coworker finish their project.', performance: 10, stats: { happiness: -2 } }, { label: 'Focus on my own work', result: 'I focused on finishing my own work.', performance: 3, stats: { happiness: 1 } }] },
    { min: 18, max: 100, when: s => s.studying, icon: '🎒', title: 'Campus club', text: 'A campus club is inviting new members.', choices: [{ label: 'Join the club', result: 'I joined a campus club and met new people.', stats: { happiness: 6 } }, { label: 'Focus on studying', result: 'I spent the extra time on my university studies.', stats: { smarts: 5 } }] },
    { min: 18, max: 100, when: s => s.assets.includes('Car'), icon: '🚗', title: 'A road trip', text: 'The road is calling and your car is ready for a trip.', choices: [{ label: 'Fill the tank and go', cost: 200, result: 'I took my car on a memorable road trip.', stats: { happiness: 8 } }, { label: 'Save the trip for later', result: 'I decided to save the road trip for another time.', stats: { happiness: 1 } }] },
    { min: 18, max: 100, when: s => s.moves > 0, icon: '🏙️', title: 'A new neighborhood', text: 'You spot a local gathering in your new city, {{city}}.', choices: [{ label: 'Introduce myself', result: 'I met some neighbors in {{city}}.', stats: { happiness: 6 } }, { label: 'Explore on my own', result: 'I explored {{city}} at my own pace.', stats: { happiness: 3, health: 2 } }] },
    { min: 18, max: 100, prison: true, icon: '📚', title: 'Prison education', text: 'A class is being offered at the prison library.', choices: [{ label: 'Attend the class', result: 'I attended a class while serving my sentence.', stats: { smarts: 6 } }, { label: 'Read on my own', result: 'I chose to read on my own in prison.', stats: { smarts: 2, happiness: 2 } }] },
    { min: 18, max: 100, prison: true, icon: '✉️', title: 'A letter from home', text: 'A letter arrives from someone who cares about you.', choices: [{ label: 'Write back', result: 'I wrote a thoughtful reply to a letter from home.', bond: 5, friendBond: 5, stats: { happiness: 5 } }, { label: 'Keep it to reread', result: 'I kept a letter from home to read again.', stats: { happiness: 3 } }] },
    { min: 18, max: 100, prison: true, icon: '🏀', title: 'Time in the yard', text: 'There is a game starting in the yard.', choices: [{ label: 'Join the game', result: 'I joined a game in the prison yard.', stats: { health: 4, happiness: 3 } }, { label: 'Take a quiet walk', result: 'I took a quiet walk around the prison yard.', stats: { health: 2, happiness: 2 } }] },
    { min: 18, max: 100, prison: true, icon: '🎨', title: 'Art class', text: 'An art workshop is looking for participants.', choices: [{ label: 'Try painting', result: 'I painted something in a prison art workshop.', stats: { happiness: 5 } }, { label: 'Help set up', result: 'I helped set up an art workshop.', stats: { smarts: 2, happiness: 2 } }] }
  );
  events.push(
    { min: 4, max: 100, when: s => s.parents.some(parent => parent.alive), icon: '📞', title: 'A call from home', text: '{{parent}} calls to hear how you are doing.', choices: [{ label: 'Catch up', result: 'I had a long conversation with {{parent}}.', parentBond: 10, stats: { happiness: 5 } }, { label: 'Call back later', result: 'I promised to catch up with {{parent}} another time.', parentBond: -3, stats: {} }] },
    { min: 8, max: 100, when: s => s.parents.some(parent => parent.alive), icon: '📷', title: 'A family memory', text: '{{parent}} finds an old photo and wants to share the story behind it.', choices: [{ label: 'Listen together', result: '{{parent}} and I shared a favorite family memory.', parentBond: 8, stats: { happiness: 5 } }, { label: 'Ask for the photo', result: 'I kept a family photo from {{parent}}.', parentBond: 3, stats: { happiness: 2 } }] }
  );
  function expandStory(text) {
    return text.replace(/\{\{(partner|friend|child|city|parent)\}\}/g, (_, key) => ({ partner: state.partner || 'my partner', friend: state.friends[0] || 'my friend', child: state.children[0] || 'my child', city: state.city, parent: state.parents.find(p => p.alive)?.name || 'my parent' })[key]);
  }
  function ageUp() {
    if (!state.alive || state.pending !== null) return;
    const wasInPrison = state.prisonYears > 0;
    state.age++; state.moments = MAX_MOMENTS;
    let entry = pick(['A new year, a new chapter.', 'Another year of little moments and big possibilities.', 'Here’s to another trip around the sun.', 'I grew another year older.']);
    let icon = state.age < 5 ? '🧸' : state.age < 18 ? '🎒' : '🌱'; let tag = '';
    if (state.age === 5) { entry = 'I started school. There is so much to learn!'; tag = 'FIRST DAY'; icon = '🎒'; }
    if (state.age === 18) { entry = 'I graduated high school and became an adult. The world is full of possibilities!'; tag = 'A NEW CHAPTER'; icon = '🎉'; state.education = 'High school'; }
    if (wasInPrison) { entry = 'I served another year of my sentence.'; icon = '⛓️'; tag = 'SERVING TIME'; }
    state.history.push({ age: state.age, icon, tag, entries: [entry] });
    if (wasInPrison) { state.prisonYears--; if (state.prisonYears === 0) log('I completed my sentence and was released.'); }
    for (const parent of state.parents) {
      if (!parent.alive) continue;
      parent.age++; parent.bond = clamp(parent.bond - 2);
      if (parent.age >= parent.endAge) {
        parent.alive = false; const inheritance = parent.bond < 40 ? Math.floor(parent.inheritance / 2) : parent.inheritance; state.balance += inheritance;
        log(`${parent.name}, my parent, passed away at age ${parent.age}. I inherited ${money(inheritance)}${parent.bond < 40 ? ' after we had grown apart' : ''}.`);
        changeStats({ happiness: parent.bond < 40 ? -7 : -15 });
      }
    }
    if (state.partner) {
      state.partnerBond = clamp(state.partnerBond - 3);
      if (state.partnerBond === 0) { log(`${state.partner} and I drifted apart and ended our relationship.`); state.partner = null; state.married = false; changeStats({ happiness: -12 }); }
    }
    if (state.friends.length) {
      state.friendBond = clamp(state.friendBond - 3);
      if (state.friendBond === 0) { log(`${state.friends[0]} and I lost touch over the years.`); state.friends = []; changeStats({ happiness: -5 }); }
    }
    if (state.job && state.careerLevel < 5) {
      if (state.careerPerformance >= 80) {
        state.careerLevel++; state.income = Math.round(state.income * 1.15); state.careerPerformance = 55;
        log(`I earned a promotion to career level ${state.careerLevel}! My annual salary is now ${money(state.income)}.`); changeStats({ happiness: 5 });
      } else state.careerPerformance = clamp(state.careerPerformance - 4);
    }
    if (state.investment > 0) {
      const rate = random(-12, 18), previous = state.investment;
      state.investment = Math.max(0, Math.round(previous * (1 + rate / 100)));
      log(`My investment fund ${rate < 0 ? 'fell' : 'grew'} ${Math.abs(rate)}% to ${money(state.investment)}.`);
    }
    if (state.age >= 19 && !wasInPrison) {
      const tax = Math.round(state.income * .2);
      const dependents = state.childBirthAges.filter(birthAge => birthAge !== null && state.age - birthAge < 18).length;
      const expenses = (state.assets.includes('House') ? 8000 : 12000) + dependents * 2000 + (state.pet ? 500 : 0) + diets[state.diet].cost;
      if (state.diet !== 'regular') { changeStats({ health: diets[state.diet].health, happiness: diets[state.diet].happiness }); log(`My ${diets[state.diet].label.toLowerCase()} diet affected my health and happiness this year.`); }
      const available = state.balance + state.income - tax;
      state.balance = Math.max(0, available - expenses);
      if (state.income) log(`I ${state.retired ? 'received a pension of' : 'earned'} ${money(state.income)}; taxes were ${money(tax)} and living costs were ${money(expenses)}.`);
      if (available < expenses) { log('Money was tight this year, and I had trouble covering living costs.'); changeStats({ happiness: -4 }); }
      else if (!state.income) log(`I paid ${money(expenses)} in living costs.`);
    }
    if (state.studying && state.age - state.studyStarted >= 4) { state.studying = false; state.education = 'University'; state.major = state.studyMajor || 'legacy'; state.studyMajor = ''; log(`I graduated from university${majors[state.major] ? ` with a degree in ${majors[state.major]}` : ''}!`); changeStats({ smarts: 10, happiness: 5 }); }
    if (state.stats.happiness < 30) { changeStats({ health: -2 }); log('A difficult year took a toll on my health.'); }
    if (state.age > 55) changeStats({ health: -random(2, 5), looks: -random(0, 2) });
    else if (state.age >= 18) changeStats({ health: -random(0, 2), happiness: -random(0, 2) });
    if (!state.illness && state.age >= 13 && state.stats.health < 75 && Math.random() < .08) { state.illness = pick(['a lingering illness', 'a respiratory illness', 'a recurring infection']); log(`I developed ${state.illness}. A doctor can help.`); }
    if (state.illness) { changeStats({ health: -4 }); log(`My health suffered from ${state.illness}.`); }
    if (state.stats.health <= 0 || state.age >= 100 || (state.age >= 75 && Math.random() < (state.age - 72) / 160)) {
      state.alive = false; state.income = 0; state.job = ''; state.pending = null; log(`My life came to an end at age ${state.age}. What a journey it was.`); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; render(); showSummary(); return;
    }
    const eligible = events.map((event, index) => ({ event, index })).filter(({event}) => state.age >= event.min && state.age <= event.max && !!event.prison === (state.prisonYears > 0) && (!event.when || event.when(state)));
    if (eligible.length && Math.random() < .7) {
      let unseen = eligible.filter(({index}) => !state.seenEvents.includes(index));
      // Only recycle eligible stories after all of them have been seen, and avoid the last three where possible.
      if (!unseen.length) { const eligibleIds = new Set(eligible.map(({index}) => index)); state.seenEvents = state.seenEvents.filter(index => !eligibleIds.has(index)); unseen = eligible.filter(({index}) => !state.recentEvents.includes(index)); if (!unseen.length) unseen = eligible; }
      state.pending = pick(unseen).index; state.seenEvents.push(state.pending); state.recentEvents = [...state.recentEvents, state.pending].slice(-3);
    }
    render(); if (state.pending !== null) showEvent();
  }
  function showEvent() {
    const event = events[state.pending]; if (!event) { state.pending = null; render(); return; }
    let content = header(event.icon, `AGE ${state.age} · A LITTLE MOMENT`, esc(event.title), esc(expandStory(event.text)));
    event.choices.forEach((choice, index) => {
      const effects = [];
      if (choice.cost) effects.push(`Costs ${money(choice.cost)}${state.balance < choice.cost ? ' (not enough money)' : ''}`);
      if (choice.gain) effects.push(`Gain ${money(choice.gain)}`);
      for (const [key, value] of Object.entries(choice.stats || {})) if (value) effects.push(`${value > 0 ? '+' : ''}${value} ${key}`);
      if (choice.bond) effects.push(`${choice.bond > 0 ? '+' : ''}${choice.bond} partner bond`);
      if (choice.friendBond) effects.push(`${choice.friendBond > 0 ? '+' : ''}${choice.friendBond} friendship`);
      if (choice.performance) effects.push(`+${choice.performance} performance`);
      if (choice.parentBond) effects.push(`${choice.parentBond > 0 ? '+' : ''}${choice.parentBond} parent bond`);
      content += option(`choice-${index}`, '✦', esc(choice.label), effects.join(' · ') || 'No stat change', !!choice.cost && state.balance < choice.cost);
    });
    modal(content);
  }
  function jobsPanel() {
    let content = header('💼', 'THE NEXT STEP', 'Find a job', 'Choose a path. Taking a job leaves university if you are studying.');
    jobs.forEach((job, i) => content += option(`job-${i}`, job.icon, job.name, `${money(job.salary)} / year${job.degree ? ` · ${job.majors ? job.majors.map(key => majors[key]).join(' or ') : 'University'} degree required` : ''}${job.smarts ? ` · ${job.smarts}% smarts required` : ''}${job.skill ? ` · ${skills[job.skill][1]} level ${job.level} required` : ''}${job.clean ? ' · Clean record required' : ''}`, state.moments <= 0 || (!!job.degree && state.education !== 'University') || (job.majors && state.major !== 'legacy' && !job.majors.includes(state.major)) || (job.smarts && state.stats.smarts < job.smarts) || (job.skill && state.skills[job.skill] < job.level) || (job.clean && state.convictions > 0) || state.job === job.name));
    modal(content);
  }
  function showSummary() {
    const relationships = (state.partner ? 1 : 0) + state.friends.length + state.children.length + (state.pet ? 1 : 0);
    modal(header('🕊️', 'THE END OF A CHAPTER', 'A life to remember', `${esc(state.name)} lived for ${state.age} years. Every little moment made a story worth telling.`) + `<div class="summary-grid"><div><small>YEARS LIVED</small><strong>${state.age}</strong></div><div><small>FINAL BALANCE</small><strong>${money(state.balance)}</strong></div><div><small>EDUCATION</small><strong>${esc(state.education)}</strong></div><div><small>LOVED ONES</small><strong>${relationships}</strong></div><div><small>MILESTONES</small><strong>${state.milestones.length} / ${milestones.length}</strong></div><div><small>INVESTMENTS</small><strong>${money(state.investment)}</strong></div></div><p class="form-note">${state.assets.length ? `Treasured possessions: ${state.assets.map(esc).join(', ')}.` : 'A life is measured in more than possessions.'} Scroll through your timeline to revisit the moments.</p><button class="modal-secondary" data-close>View my story</button>${state.children.length ? '<button class="modal-primary" data-action="choose-successor">Continue as a child</button>' : ''}<button class="modal-secondary" data-action="restart-confirm">Start a new life</button>`);
  }
  function showLegacy() {
    let content = header('🌳', 'A STORY THAT GROWS', 'Family legacy', `Generation ${state.generation}. Continue as a child when your life ends. The last five past lives and their stories are saved here.`);
    content += `<div class="legacy-entry"><span><strong>${esc(state.name)}</strong><small>Current life · Age ${state.age}${state.alive ? '' : ' · Remembered'}</small></span><span>✦</span></div>`;
    if (state.children.length) content += `<div class="progress-card"><strong>Children</strong><br>${state.children.map((name, i) => `${esc(name)}${state.childBirthAges[i] === null ? ' (age unknown)' : `, age ${state.age - state.childBirthAges[i]}`}`).join(' · ')}</div>`;
    if (!state.legacyHistory.length) content += '<div class="empty-state">Your family history starts with this life. After your story ends, you can choose a child to carry it on.</div>';
    [...state.legacyHistory].reverse().forEach((ancestor, reverseIndex) => { const index = state.legacyHistory.length - 1 - reverseIndex; content += option(`archive-${index}`, '📖', esc(ancestor.name), `Lived ${ancestor.age} years · Read their story`); });
    modal(content);
  }
  function showArchive(index) {
    const ancestor = state.legacyHistory[index]; if (!ancestor) return;
    const chapters = [...ancestor.history].reverse().map(year => `<div class="year-block"><div class="year-icon">${esc(year.icon)}</div><div><div class="year-heading"><strong>Age ${year.age}</strong>${year.tag ? `<span>${esc(year.tag)}</span>` : ''}</div>${year.entries.map(entry => `<p class="event">${esc(entry)}</p>`).join('')}</div></div>`).join('');
    modal(header('📖', 'FAMILY HISTORY', esc(ancestor.name), `${ancestor.age} years · ${esc(ancestor.city)} · Final cash ${money(ancestor.balance)}`) + `<div class="archive-timeline">${chapters}</div><button class="modal-secondary" data-action="show-legacy">Back to family legacy</button>`);
  }
  function childAge(index) {
    const birth = state.childBirthAges[index];
    return Number.isInteger(birth) && birth >= 0 && birth <= state.age && state.children[index] ? state.age - birth : null;
  }
  function showSuccessors() {
    if (state.alive) return;
    let content = header('🌱', 'THE NEXT GENERATION', 'Continue the story', 'Choose a child to play at their current age with new stats. Your cash, investments and possessions pass to them. Their other relationships and career start fresh.');
    if (!state.children.length) content += '<div class="empty-state">There are no children to continue as.</div>';
    state.children.forEach((name, i) => { const age = childAge(i); content += option(`successor-${i}`, '🧑', esc(name), age === null ? 'Age unknown in this older save; cannot continue as this child.' : `Age ${age} · Continue this family line`, age === null || state.generation >= 10000); });
    content += '<button class="modal-secondary" data-action="summary">Back to summary</button>';
    modal(content);
  }
  function confirmSuccessor(index) {
    if (state.alive || childAge(index) === null) return;
    modal(header('🌱', 'THE NEXT GENERATION', `Continue as ${esc(state.children[index])}?`, `You’ll start at age ${childAge(index)} with new stats. This life will be archived and cannot be played again. Your cash, investments and possessions will transfer.`) + `<button class="modal-secondary" data-action="choose-successor">Back</button><button class="modal-primary" data-action="inherit-${index}">Continue this legacy</button>`);
  }
  function inheritLife(index) {
    const age = childAge(index); if (state.alive || age === null || state.generation >= 10000) return;
    const old = state;
    const surname = old.name.trim().split(/\s+/).slice(-1)[0];
    const name = `${old.children[index]} ${surname}`;
    const successor = freshLife(name, old.city);
    successor.age = age; successor.generation = old.generation + 1;
    successor.balance = old.balance; successor.investment = old.investment; successor.assets = [...old.assets];
    successor.education = age >= 18 ? 'High school' : 'None';
    successor.parents = [{ name: old.name, age: old.age, endAge: old.age, bond: 0, alive: false, inheritance: 0 }];
    successor.legacyHistory = [...old.legacyHistory, { name: old.name, age: old.age, city: old.city, balance: old.balance, investment: old.investment, history: old.history }].slice(-5);
    successor.history = [{ age, icon: '🌱', tag: 'A NEW GENERATION', entries: [`My name is ${name}. I am continuing my parent ${old.name}’s story at age ${age}.`, `I inherited ${money(old.balance)} in cash${old.investment ? ` and ${money(old.investment)} in investments` : ''}${old.assets.length ? `, along with ${old.assets.join(', ')}` : ''}.`] }];
    state = successor; closeModal(); render();
  }
  function dataPanel(message = '', isError = false) {
    pendingImport = null;
    modal(header('💾', 'YOUR STORY, YOUR DEVICE', 'Save & load', 'Your game saves automatically in this browser. Download a backup to move it to another device or keep it safe.') + `<button class="modal-option" data-action="export"><span class="option-emoji">⬇️</span><span><strong>Download backup</strong><small>Save your current life as a JSON file.</small></span><b>›</b></button><div class="progress-card"><strong>Restore a backup</strong><br>Choose a Little Life backup file. You will be asked to confirm before your current life is replaced.<input class="file-input" id="import-file" type="file" accept="application/json,.json" aria-label="Choose a Little Life backup"></div><p id="data-message" class="${isError ? 'data-error' : 'data-success'}" role="status">${esc(message)}</p>`);
  }
  // Backups are untrusted files: reject malformed or oversized values before replacing a live game.
  function validBackup(data) {
    const s = data && data.format === 'little-life-backup' && data.version === 1 && data.game;
    const text = value => typeof value === 'string' && value.length <= 300;
    const number = (value, max) => Number.isSafeInteger(value) && value >= 0 && value <= max;
    const list = (value, max, check) => Array.isArray(value) && value.length <= max && value.every(check);
    if (!s || s.version !== 1 || !text(s.name) || !s.name || !text(s.city) || !number(s.age, 100) || typeof s.alive !== 'boolean' || !number(s.balance, 1000000000000) || !number(s.income, 1000000000000) || !number(s.investment, 1000000000000)) return false;
    if (!s.stats || !Object.keys(statMeta).every(k => number(s.stats[k], 100)) || !number(s.moments, MAX_MOMENTS) || !(s.pending === null || (number(s.pending, events.length - 1) && s.alive))) return false;
    if (!text(s.job) || !['None', 'High school', 'University'].includes(s.education) || typeof s.studying !== 'boolean' || typeof s.retired !== 'boolean' || typeof s.married !== 'boolean' || !(s.partner === null || text(s.partner)) || !(s.pet === null || text(s.pet)) || !(s.illness === null || text(s.illness))) return false;
    if (!number(s.careerLevel, 5) || s.careerLevel < 1 || !number(s.careerPerformance, 100) || !number(s.partnerBond, 100) || !number(s.friendBond, 100) || !s.skills || !Object.keys(skills).every(k => number(s.skills[k], 5))) return false;
    if (!list(s.children, 4, text) || !list(s.childBirthAges, 4, age => age === null || number(age, s.age)) || s.childBirthAges.length !== s.children.length || !list(s.friends, 1, text) || !list(s.assets, 3, value => Object.values(items).some(item => item[0] === value)) || !list(s.milestones, milestones.length, id => milestones.some(b => b.id === id)) || !list(s.recentEvents, 3, index => number(index, events.length - 1))) return false;
    if (!list(s.seenEvents, events.length, index => number(index, events.length - 1)) || !number(s.prisonYears, 5) || !number(s.convictions, 100) || typeof s.license !== 'boolean' || !number(s.moves, 100) || !Object.hasOwn(diets, s.diet)) return false;
    if (!list(s.parents, 2, p => p && text(p.name) && number(p.age, 150) && number(p.endAge, 150) && number(p.bond, 100) && typeof p.alive === 'boolean' && number(p.inheritance, 1000000000000))) return false;
    const validHistory = history => list(history, 105, year => year && number(year.age, 100) && text(year.icon) && text(year.tag) && list(year.entries, 100, text)) && history.length > 0;
    if (!number(s.generation, 10000) || s.generation < 1 || !list(s.legacyHistory, 5, ancestor => ancestor && text(ancestor.name) && text(ancestor.city) && number(ancestor.age, 100) && number(ancestor.balance, 1000000000000) && number(ancestor.investment, 1000000000000) && validHistory(ancestor.history))) return false;
    if (!['', 'legacy', ...Object.keys(majors)].includes(s.major) || !['', 'legacy', ...Object.keys(majors)].includes(s.studyMajor)) return false;
    if (s.studying && !number(s.studyStarted, s.age)) return false;
    return list(s.history, 105, year => year && number(year.age, s.age) && text(year.icon) && text(year.tag) && list(year.entries, 100, text)) && s.history.length > 0;
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ format: 'little-life-backup', version: 1, game: state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'little-life-backup.json'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#data-message').textContent = 'Backup downloaded. Keep it somewhere safe.';
  }
  function newLifeForm() {
    modal(header('🌱', 'A FRESH START', 'Start a new life?', 'Your current life and family archive will be replaced. Make this next one your own or leave the fields blank for a surprise.') + `<form id="new-life-form"><label class="form-label" for="new-name">NAME</label><input class="form-input" id="new-name" maxlength="40" placeholder="Random name" autocomplete="off"><label class="form-label" for="new-city">BIRTHPLACE</label><select class="form-input" id="new-city"><option value="">Surprise me</option>${cities.map(city => `<option value="${esc(city)}">${esc(city)}</option>`).join('')}</select><p class="form-note">Starting fresh replaces the current life and its family archive on this device.</p><button type="button" class="modal-secondary" data-close>Keep my life</button><button type="submit" class="modal-primary">Start fresh</button></form>`);
  }
  function act(action) {
    if (action.startsWith('choice-')) {
      const event = events[state.pending]; const choice = event && event.choices[Number(action.split('-')[1])];
      if (!choice || (choice.cost && state.balance < choice.cost)) return;
      state.balance += (choice.gain || 0) - (choice.cost || 0); changeStats(choice.stats); if (choice.bond && state.partner) state.partnerBond = clamp(state.partnerBond + choice.bond); if (choice.friendBond && state.friends.length) state.friendBond = clamp(state.friendBond + choice.friendBond); if (choice.performance && state.job) state.careerPerformance = clamp(state.careerPerformance + choice.performance); if (choice.parentBond) { const parent = state.parents.find(p => p.alive); if (parent) parent.bond = clamp(parent.bond + choice.parentBond); } log(expandStory(choice.result)); state.pending = null; closeModal(); render(); return;
    }
    if (action === 'import-cancel' && state.pending === null) { dataPanel(); return; }
    if (action === 'export' && state.pending === null) { exportBackup(); return; }
    if (action === 'import-confirm' && pendingImport && state.pending === null) { state = pendingImport; pendingImport = null; closeModal(); render(); if (state.pending !== null) showEvent(); return; }
    if (action === 'summary' && state.pending === null && !state.alive) { showSummary(); return; }
    if (action === 'show-legacy' && state.pending === null) { showLegacy(); return; }
    if (action.startsWith('archive-') && state.pending === null) { showArchive(Number(action.slice(8))); return; }
    if (action === 'choose-successor' && state.pending === null && !state.alive) { showSuccessors(); return; }
    if (action.startsWith('successor-') && state.pending === null && !state.alive) { confirmSuccessor(Number(action.slice(10))); return; }
    if (action.startsWith('inherit-') && state.pending === null && !state.alive) { inheritLife(Number(action.slice(8))); return; }
    if (action === 'restart-confirm') { if (state.pending === null) newLifeForm(); return; }
    if (!state.alive || state.pending !== null) return;
    if (state.prisonYears && !['prison-read', 'prison-exercise', 'prison-contact', 'prison-doctor'].includes(action)) return;
    if (action === 'gigs' && state.age >= 16) { gigsPanel(); return; }
    if (action === 'university' && state.age >= 18 && !state.studying && state.balance >= universityCost()) { universityPanel(); return; }
    if (action === 'diet' && state.age >= 18) { dietPanel(); return; }
    if (action === 'crime' && state.age >= 18) { crimePanel(); return; }
    if (action === 'travel' && state.age >= 18 && state.balance >= 3000) { travelPanel(); return; }
    if (action === 'hobbies' && state.age >= 8) { hobbiesPanel(); return; }
    if (state.moments <= 0) return;
    if (action === 'job') { jobsPanel(); return; }
    if (action.startsWith('job-')) {
      const job = jobs[Number(action.slice(4))];
      if (!job || state.age < 18 || (job.degree && state.education !== 'University') || (job.majors && state.major !== 'legacy' && !job.majors.includes(state.major)) || (job.smarts && state.stats.smarts < job.smarts) || (job.skill && state.skills[job.skill] < job.level) || (job.clean && state.convictions > 0) || state.job === job.name) return;
      state.job = job.name; state.income = job.salary; state.studying = false; state.studyMajor = ''; state.retired = false; state.careerLevel = 1; state.careerPerformance = 50; log(`I started a new job as a ${job.name.toLowerCase()}.`); changeStats({ happiness: 4 });
    } else if (action.startsWith('major-')) { const key = action.slice(6); if (!Object.hasOwn(majors, key) || state.age < 18 || state.studying || state.balance < universityCost() || state.major === key) return; const cost = universityCost(); state.balance -= cost; state.studying = true; state.studyStarted = state.age; state.studyMajor = key; state.job = ''; state.retired = false; state.income = 0; log(`I enrolled in ${majors[key]} at university for ${money(cost)}. Graduation is four years away.`); }
    else if (action.startsWith('gig-')) { const key = action.slice(4); const gig = gigs[key]; if (!gig || state.age < 16 || (key === 'tutor' && state.stats.smarts < 65) || (key === 'freelance' && (state.age < 18 || Math.max(state.skills.art, state.skills.music) < 2))) return; state.balance += gig[1]; log(`I completed ${gig[0].toLowerCase()} and earned ${money(gig[1])}.`); changeStats({ happiness: -1 }); }
    else if (action === 'prison-read' && state.prisonYears) { log('I read in the prison library.'); changeStats({ smarts: 5, happiness: 1 }); }
    else if (action === 'prison-exercise' && state.prisonYears) { log('I exercised in the prison yard.'); changeStats({ health: 5, happiness: 1 }); }
    else if (action === 'prison-contact' && state.prisonYears) { log('I wrote to my loved ones while serving my sentence.'); if (state.partner) state.partnerBond = clamp(state.partnerBond + 10); state.parents.filter(p => p.alive).forEach(p => { p.bond = clamp(p.bond + 5); }); if (state.friends.length) state.friendBond = clamp(state.friendBond + 10); changeStats({ happiness: 5 }); }
    else if (action === 'prison-doctor' && state.prisonYears) { if (state.illness) { log(`The prison infirmary treated me for ${state.illness}.`); state.illness = null; } else log('I visited the prison infirmary.'); changeStats({ health: 8 }); }
    else if (action.startsWith('diet-') && state.age >= 18) { const key = action.slice(5); if (!Object.hasOwn(diets, key) || key === state.diet) return; state.diet = key; log(`I changed to a ${diets[key].label.toLowerCase()} diet.`); }
    else if (action === 'license' && state.age >= 16 && !state.license && state.balance >= 250) { state.balance -= 250; state.license = true; log('I got my driver’s license.'); changeStats({ happiness: 3 }); }
    else if (action.startsWith('move-')) { const city = cities[Number(action.slice(5))]; if (!city || city === state.city || state.age < 18 || state.balance < 3000) return; const previous = state.city; state.balance -= 3000; state.city = city; state.moves++; state.job = ''; state.income = 0; state.retired = false; state.studying = false; state.studyMajor = ''; log(`I moved from ${previous} to ${city} for a fresh start.`); changeStats({ happiness: 5 }); }
    else if (action.startsWith('offense-')) {
      const crime = crimes[action.slice(8)]; if (!crime || state.age < 18) return;
      if (Math.random() < crime.chance) { const gain = random(crime.min, crime.max); state.balance += gain; log(`I got away with ${crime.name} and gained ${money(gain)}.`); changeStats({ happiness: 3 }); }
      else { const fine = Math.min(state.balance, crime.fine); state.balance -= fine; state.prisonYears = crime.sentence; state.convictions++; state.job = ''; state.income = 0; state.retired = false; state.studying = false; state.studyMajor = ''; log(`I was caught for ${crime.name}, paid ${money(fine)}, and was sentenced to ${crime.sentence} year${crime.sentence === 1 ? '' : 's'} in prison.`); changeStats({ happiness: -12 }); }
    }
    else if (action === 'walk' && state.age >= 5) { log('I went for a walk and enjoyed some fresh air.'); changeStats({ health: 4, happiness: 3 }); }
    else if (action === 'read' && state.age >= 5) { log('I curled up with a good book.'); changeStats({ smarts: 4, happiness: 2 }); }
    else if (action === 'meditate' && state.age >= 5) { log('I took a moment to slow down and meditate.'); changeStats({ happiness: 5, health: 1 }); }
    else if (action === 'gym' && state.age >= 13) { log('I exercised and felt stronger for it.'); changeStats({ health: 6, looks: 3, happiness: 1 }); }
    else if (action.startsWith('practice-') && state.age >= 8 && skills[action.slice(9)] && state.skills[action.slice(9)] < 5) { const key = action.slice(9); state.skills[key]++; log(`I practiced ${skills[key][1].toLowerCase()} and reached level ${state.skills[key]}.`); changeStats({ happiness: 4, ...(key === 'fitness' ? { health: 3 } : { smarts: 1 }) }); }
    else if (action === 'doctor' && state.balance >= (state.age < 18 ? 0 : (state.illness ? 500 : 100))) { const cost = state.age < 18 ? 0 : (state.illness ? 500 : 100); state.balance -= cost; if (state.illness) { log(`I visited the doctor and was treated for ${state.illness}.`); state.illness = null; } else log('I visited the doctor for a checkup.'); changeStats({ health: 10 }); }
    else if (action.startsWith('parent-')) { const parent = state.parents[Number(action.slice(7))]; if (!parent || !parent.alive) return; parent.bond = clamp(parent.bond + 18); log(`I spent time with my parent ${parent.name}.`); changeStats({ happiness: 5 }); }
    else if (action === 'family') { log('I spent some quality time with my family.'); changeStats({ happiness: 5 }); }
    else if (action === 'friend' && state.age >= 5) { if (!state.friends.length) { state.friendBond = 60; state.friends.push(pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && n !== state.partner))); log(`I made a new friend named ${state.friends[0]}.`); } else { log(`I spent time with my friend ${state.friends[0]}.`); state.friendBond = clamp(state.friendBond + 20); } changeStats({ happiness: 6 }); }
    else if (action === 'date' && state.age >= 18) { if (!state.partner) { state.partnerBond = clamp(45 + Math.round(state.stats.looks / 5)); state.partner = pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && !state.friends.includes(n))); log(`I met ${state.partner}, and we started dating!`); } else { log(`I spent a lovely day with ${state.partner}.`); state.partnerBond = clamp(state.partnerBond + 20); } changeStats({ happiness: 8 }); }
    else if (action === 'marry' && state.partner && !state.married && state.balance >= 2000 && state.partnerBond >= 60) { state.balance -= 2000; state.married = true; log(`${state.partner} and I got married!`); changeStats({ happiness: 12 }); }
    else if (action === 'adopt' && !state.partner && state.age >= 18 && state.balance >= 1500 && state.children.length < 4) { state.balance -= 1500; const name = pick(firstNames.filter(n => !state.children.includes(n) && !state.name.startsWith(n + ' '))); state.children.push(name); state.childBirthAges.push(state.age); log(`I adopted a child named ${name}.`); changeStats({ happiness: 10 }); }
    else if (action === 'child' && state.partner && state.balance >= 1000 && state.children.length < 4 && state.partnerBond >= 45) { state.balance -= 1000; const name = pick(firstNames.filter(n => !state.children.includes(n) && n !== state.partner)); state.children.push(name); state.childBirthAges.push(state.age); log(`${state.partner} and I welcomed a child named ${name} into our family.`); changeStats({ happiness: 10 }); }
    else if (action === 'children' && state.children.length) { log(`I spent a wonderful day with ${state.children.join(' and ')}.`); changeStats({ happiness: 7 }); }
    else if (action === 'breakup' && state.partner) { log(`I ${state.married ? 'divorced' : 'broke up with'} ${state.partner}.`); state.partner = null; state.married = false; changeStats({ happiness: -8 }); }
    else if (action === 'pet' && state.age >= 18 && (state.pet || state.balance >= 500)) { if (!state.pet) { state.balance -= 500; state.pet = pick(['Mochi', 'Biscuit', 'Peanut', 'Poppy', 'Waffles']); log(`I adopted a pet named ${state.pet}.`); } else log(`I spent time playing with ${state.pet}.`); changeStats({ happiness: 7 }); }
    else if (action === 'study' && state.age >= 5 && state.age < 18) { log('I studied hard at school.'); changeStats({ smarts: 5, happiness: -1 }); }
    else if (action === 'work' && state.job && state.careerLevel < 5) { state.careerPerformance = clamp(state.careerPerformance + 20); log(`I worked hard. My career performance is now ${state.careerPerformance}%.`); changeStats({ happiness: -4, smarts: 2 }); }
    else if (action === 'retire' && state.job && state.age >= 65) { const oldJob = state.job; state.income = Math.round(state.income * .3); state.job = ''; state.retired = true; log(`I retired from my job as a ${oldJob.toLowerCase()} with an annual pension of ${money(state.income)}.`); changeStats({ happiness: 8 }); }
    else if (action === 'quit' && state.job) { log(`I quit my job as a ${state.job.toLowerCase()}.`); state.job = ''; state.income = 0; changeStats({ happiness: 3 }); }
    else if (action === 'invest' && state.age >= 18 && state.balance >= 5000) { state.balance -= 5000; state.investment += 5000; log('I invested $5,000 in a fund.'); }
    else if (action === 'withdraw' && state.investment > 0) { log(`I sold my investments for ${money(state.investment)}.`); state.balance += state.investment; state.investment = 0; }
    else if (items[action]) { const [name, cost] = items[action]; if (state.balance < cost || state.assets.includes(name) || (action !== 'bike' && state.age < 18) || (action === 'car' && !state.license)) return; state.balance -= cost; state.assets.push(name); log(`I bought a ${name.toLowerCase()} for ${money(cost)}.`); changeStats({ happiness: 8 }); }
    else if (action.startsWith('sell-') && items[action.slice(5)]) { const [name, cost] = items[action.slice(5)]; if (!state.assets.includes(name)) return; state.assets = state.assets.filter(item => item !== name); state.balance += Math.round(cost * .7); log(`I sold my ${name.toLowerCase()} for ${money(cost * .7)}.`); }
    else return;
    state.moments--; closeModal(); render();
  }
  $('#age-up').addEventListener('click', ageUp);
  $('#new-life').addEventListener('click', () => act('restart-confirm'));
  $('#save-menu').addEventListener('click', () => { if (state.pending === null) dataPanel(); });
  document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => panel(button.dataset.panel)));
  $('#story-bottom').addEventListener('click', event => { if (event.target.closest('#review-life')) showSummary(); });
  $('#modal').addEventListener('click', event => { const action = event.target.closest('[data-action]'); if (action) act(action.dataset.action); else if (event.target.closest('[data-close]') && state.pending === null) closeModal(); });
  $('#modal').addEventListener('change', event => {
    if (event.target.id !== 'import-file') return;
    const input = event.target; const file = input.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { dataPanel('That file is too large to be a Little Life backup.', true); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (!input.isConnected || input.files[0] !== file || $('#modal').classList.contains('hidden')) return;
      try {
        const data = JSON.parse(reader.result);
        if (data && data.game && typeof data.game === 'object') data.game = upgradeGame(data.game);
        if (!validBackup(data)) throw new Error('Invalid backup');
        pendingImport = data.game;
        modal(header('📂', 'RESTORE A LIFE', 'Replace your current life?', `Restore ${esc(pendingImport.name)}’s life at age ${pendingImport.age}? This will replace your current save.`) + '<button class="modal-secondary" data-action="import-cancel">Cancel</button><button class="modal-primary" data-action="import-confirm">Restore backup</button>');
      } catch (_) { dataPanel('This is not a valid Little Life backup. Your current life was not changed.', true); }
    };
    reader.onerror = () => { if (input.isConnected && input.files[0] === file && !$('#modal').classList.contains('hidden')) dataPanel('Could not read that file. Your current life was not changed.', true); };
    reader.readAsText(file);
  });
  $('#modal').addEventListener('submit', event => {
    if (event.target.id !== 'new-life-form') return;
    event.preventDefault();
    const name = $('#new-name').value.trim().replace(/\s+/g, ' ');
    const city = $('#new-city').value;
    state = freshLife(name || undefined, cities.includes(city) ? city : undefined);
    closeModal(); render();
  });
  document.addEventListener('keydown', event => {
    if ($('#modal').classList.contains('hidden')) return;
    if (event.key === 'Escape' && state.pending === null) { closeModal(); return; }
    if (event.key === 'Tab') {
      const focusable = [...$('#modal').querySelectorAll('button:not(:disabled):not([hidden]), input:not(:disabled), select:not(:disabled)')];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  state = load(); render(); if (state.pending !== null) showEvent();
})();
