(() => {
  'use strict';
  const KEY = 'little-life-save-v1';
  const $ = (selector) => document.querySelector(selector);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (value) => Math.max(0, Math.min(100, value));
  const money = (value) => '$' + Math.round(value).toLocaleString('en-US');
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const firstNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Avery', 'Riley', 'Casey', 'Quinn', 'Charlie', 'Sam', 'Parker'];
  const surnames = ['Bennett', 'Rivera', 'Brooks', 'Morgan', 'Hayes', 'Parker', 'Reed', 'Foster', 'Wells', 'Chen'];
  const cities = ['Portland, United States', 'Austin, United States', 'Charlotte, United States', 'London, United Kingdom', 'Toronto, Canada', 'Melbourne, Australia'];
  const statMeta = { happiness: ['😊', 'Happiness', '#e3bb70'], health: ['♥', 'Health', '#df948f'], smarts: ['✦', 'Smarts', '#91b4bf'], looks: ['✿', 'Looks', '#9abf98'] };
  const jobs = [
    { name: 'Barista', salary: 28000, icon: '☕' }, { name: 'Office assistant', salary: 35000, icon: '📎' },
    { name: 'Artist', salary: 32000, icon: '🎨' }, { name: 'Teacher', salary: 52000, icon: '🍎', degree: true },
    { name: 'Software developer', salary: 85000, icon: '💻', degree: true }, { name: 'Doctor', salary: 110000, icon: '🩺', degree: true, smarts: 70 },
    { name: 'Musician', salary: 48000, icon: '🎵', skill: 'music', level: 3 }, { name: 'Athlete', salary: 60000, icon: '🏆', skill: 'fitness', level: 3 }
  ];
  const items = { bike: ['Bicycle', 500, '🚲'], car: ['Car', 15000, '🚗'], house: ['House', 100000, '🏡'] };
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
    return { version: 1, name, city, age: 0, stats: { happiness: random(65, 90), health: random(70, 95), smarts: random(55, 90), looks: random(55, 90) }, balance: 0, income: 0, job: '', retired: false, education: 'None', studying: false, partner: null, married: false, children: [], childBirthAges: [], friends: [], pet: null, assets: [], alive: true, pending: null, recentEvents: [], moments: MAX_MOMENTS, skills: { music: 0, art: 0, fitness: 0 }, careerLevel: 1, careerPerformance: 50, partnerBond: 65, friendBond: 60, investment: 0, illness: null, milestones: [], history: [{ age: 0, icon: '👶', tag: 'THE BEGINNING', entries: [`I was born in ${city}. Hello, world!`, 'My parents welcomed me into the world. My story starts here.'] }] };
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.version === 1 && Array.isArray(saved.history) && saved.stats) {
        // Preserve games created before family and yearly moments were introduced.
        return { retired: false, married: false, children: [], childBirthAges: (saved.children || []).map(() => null), pet: null, recentEvents: [], moments: MAX_MOMENTS, skills: { music: 0, art: 0, fitness: 0 }, careerLevel: 1, careerPerformance: 50, partnerBond: 65, friendBond: 60, investment: 0, illness: null, milestones: [], ...saved };
      }
    } catch (_) { /* start fresh */ }
    return freshLife();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); $('#storage-warning').hidden = true; } catch (_) { $('#storage-warning').hidden = false; } }
  function occupation() {
    if (!state.alive) return 'At rest';
    if (state.job) return state.job;
    if (state.retired) return 'Retired';
    if (state.studying) return 'University student';
    if (state.age < 5) return 'Little one';
    if (state.age < 18) return 'Student';
    return 'Unemployed';
  }
  function portrait() { if (!state.alive) return '🕊️'; if (state.age < 3) return '👶'; if (state.age < 13) return '🧒'; if (state.age < 65) return '🧑'; return '🧓'; }
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
    $('#health-status').innerHTML = state.illness ? `<div class="health-alert">🩺 <strong>${esc(state.illness)}</strong> · Lowers health each year. Visit the doctor for treatment.</div>` : '';
    $('#life-status').textContent = state.alive ? 'LIFE IN PROGRESS' : 'LIFE COMPLETE';
    $('#chapter-label').textContent = `CHAPTER ${String(state.age + 1).padStart(2, '0')}`;
    $('#moments').innerHTML = `<span>${state.alive ? `${state.moments} of ${MAX_MOMENTS} moments left this year` : 'Your story is complete'}</span><span>${state.alive ? '●'.repeat(state.moments) + '○'.repeat(MAX_MOMENTS - state.moments) : '✦'}</span>`;
    $('#stats').innerHTML = Object.entries(statMeta).map(([key, [icon, name, color]]) => `<div class="stat"><div class="stat-row"><span><span class="stat-emoji" style="color:${color}">${icon}</span>${name}</span><span class="stat-value">${state.stats[key]}%</span></div><div class="bar"><i style="width:${state.stats[key]}%;background:${color}"></i></div></div>`).join('');
    $('#timeline').innerHTML = [...state.history].reverse().map((year) => `<div class="year-block"><div class="year-icon">${esc(year.icon)}</div><div><div class="year-heading"><strong>Age ${year.age}</strong>${year.tag ? `<span>${esc(year.tag)}</span>` : ''}</div>${year.entries.map(entry => `<p class="event">${esc(entry)}</p>`).join('')}</div></div>`).join('');
    $('#story-bottom').innerHTML = state.alive ? '<span>✧</span> Your story is still being written... <span>✧</span>' : '<span>✧</span> <button class="story-review" id="review-life">See your life in review</button> <span>✧</span>';
    $('#age-up').disabled = !state.alive || state.pending !== null;
    $('#age-up strong').textContent = state.alive ? 'Age up' : 'Life complete';
    $('#age-up small').textContent = state.alive ? 'See what the next year brings' : 'Start a new life to play again';
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
    if (!state.alive && type !== 'milestones') { showSummary(); return; }
    if (state.pending !== null) { showEvent(); return; }
    const noTime = state.moments <= 0;
    let content = '';
    const timeNote = noTime ? ' No moments left this year; age up to make more memories.' : ` ${state.moments} moment${state.moments === 1 ? '' : 's'} left this year.`;
    if (type === 'activities') {
      content = header('✦', 'A LITTLE ME TIME', 'Activities', 'There’s always something to do.' + timeNote);
      content += option('walk', '🌿', 'Go for a walk', 'A little fresh air improves health and happiness.', noTime || state.age < 5);
      content += option('read', '📚', 'Read a book', 'Give your brain a little workout.', noTime || state.age < 5);
      content += option('meditate', '🧘', 'Meditate', 'Slow down and find your happy place.', noTime || state.age < 5);
      content += option('gym', '🏃', 'Exercise', 'Build healthy habits and feel your best. Available at 13.', noTime || state.age < 13);
      content += option('hobbies', '🎨', 'Hobbies & skills', 'Practice music, art or fitness. Skills can unlock careers.', state.age < 8);
      const doctorCost = state.age < 18 ? 0 : (state.illness ? 500 : 100);
      content += option('doctor', '🩺', 'Visit the doctor', state.age < 18 ? 'Family covers the cost. Treats illness and improves health.' : state.illness ? `Treat ${esc(state.illness)} for $500.` : 'A checkup costs $100 and improves health.', noTime || state.balance < doctorCost);
      content += option('crime', '🕵️', 'Try your luck', 'A risky shortcut to some cash. Available at 18.', noTime || state.age < 18);
    } else if (type === 'relationships') {
      content = header('♡', 'BETTER TOGETHER', 'Relationships', 'Friendship and partner bonds fall by 3 each year. Spend time together to stay close.' + timeNote);
      content += option('family', '🏡', 'Spend time with family', 'Catch up with your loved ones.', noTime);
      content += option('friend', '🤝', state.friends.length ? `Hang out with ${esc(state.friends[0])}` : 'Make a friend', state.friends.length ? `Friendship: ${state.friendBond}% · Spending time strengthens your bond.` : 'Meet someone new. Available at 5.', noTime || state.age < 5);
      content += option('date', '💌', state.partner ? `Spend time with ${esc(state.partner)}` : 'Find a date', state.partner ? `Bond: ${state.partnerBond}% · Spending time strengthens your relationship.` : 'Available at 18. Your looks influence your starting bond.', noTime || state.age < 18);
      if (state.partner && !state.married) content += option('marry', '💍', `Marry ${esc(state.partner)}`, 'A wedding costs $2,000 and requires a bond of 60%.', noTime || state.balance < 2000 || state.partnerBond < 60);
      if (state.partner) content += option('child', '🍼', 'Welcome a child', 'Costs $1,000; requires 45% bond. Each child costs $2,000/year until 18.', noTime || state.balance < 1000 || state.children.length >= 4 || state.partnerBond < 45);
      if (state.children.length) content += option('children', '🧸', 'Spend time with your children', `Make memories with ${state.children.map(esc).join(', ')}.`, noTime);
      if (state.partner) content += option('breakup', '💔', state.married ? 'Get divorced' : 'Break up', 'Sometimes it’s time to go separate ways.', noTime);
      content += option('pet', '🐾', state.pet ? `Play with ${esc(state.pet)}` : 'Adopt a pet', state.pet ? 'Your furry friend is happy to see you.' : 'Costs $500 to adopt and $500/year. Available at 18.', noTime || state.age < 18 || (!state.pet && state.balance < 500));
    } else if (type === 'occupation') {
      content = header('▤', 'DREAM A LITTLE BIGGER', 'School & career', `Currently: ${esc(occupation())}. Education: ${esc(state.education)}.${timeNote}`);
      if (state.age < 18) content += option('study', '✏️', 'Study harder', 'Hit the books and improve your smarts. Available at 5.', noTime || state.age < 5);
      else {
        if (state.studying) content += `<div class="empty-state">🎓 University: year ${Math.min(4, state.age - state.studyStarted + 1)} of 4. Keep aging to graduate.</div>`;
        else content += option('university', '🎓', 'Go to university', 'Four years of study. Tuition is $5,000 up front; leaves your job.', noTime || state.education === 'University' || state.balance < 5000);
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
        content += owned ? option(`sell-${key}`, icon, `Sell ${esc(name.toLowerCase())}`, `Sell for ${money(cost * .7)}.`, noTime) : option(key, icon, `Buy a ${esc(name.toLowerCase())}`, `${money(cost)}${key !== 'bike' ? ' · Available at 18' : ''}${key === 'house' ? ' · Reduces annual living costs' : ''}`, noTime || state.balance < cost || (key !== 'bike' && state.age < 18));
      }
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
  function ageUp() {
    if (!state.alive || state.pending !== null) return;
    state.age++; state.moments = MAX_MOMENTS;
    let entry = pick(['A new year, a new chapter.', 'Another year of little moments and big possibilities.', 'Here’s to another trip around the sun.', 'I grew another year older.']);
    let icon = state.age < 5 ? '🧸' : state.age < 18 ? '🎒' : '🌱'; let tag = '';
    if (state.age === 5) { entry = 'I started school. There is so much to learn!'; tag = 'FIRST DAY'; icon = '🎒'; }
    if (state.age === 18) { entry = 'I graduated high school and became an adult. The world is full of possibilities!'; tag = 'A NEW CHAPTER'; icon = '🎉'; state.education = 'High school'; }
    state.history.push({ age: state.age, icon, tag, entries: [entry] });
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
    if (state.age >= 19) {
      const tax = Math.round(state.income * .2);
      const dependents = state.childBirthAges.filter(birthAge => birthAge !== null && state.age - birthAge < 18).length;
      const expenses = (state.assets.includes('House') ? 8000 : 12000) + dependents * 2000 + (state.pet ? 500 : 0);
      const available = state.balance + state.income - tax;
      state.balance = Math.max(0, available - expenses);
      if (state.income) log(`I ${state.retired ? 'received a pension of' : 'earned'} ${money(state.income)}; taxes were ${money(tax)} and living costs were ${money(expenses)}.`);
      if (available < expenses) { log('Money was tight this year, and I had trouble covering living costs.'); changeStats({ happiness: -4 }); }
      else if (!state.income) log(`I paid ${money(expenses)} in living costs.`);
    }
    if (state.studying && state.age - state.studyStarted >= 4) { state.studying = false; state.education = 'University'; log('I graduated from university!'); changeStats({ smarts: 10, happiness: 5 }); }
    if (state.stats.happiness < 30) { changeStats({ health: -2 }); log('A difficult year took a toll on my health.'); }
    if (state.age > 55) changeStats({ health: -random(2, 5), looks: -random(0, 2) });
    else if (state.age >= 18) changeStats({ health: -random(0, 2), happiness: -random(0, 2) });
    if (!state.illness && state.age >= 13 && state.stats.health < 75 && Math.random() < .08) { state.illness = pick(['a lingering illness', 'a respiratory illness', 'a recurring infection']); log(`I developed ${state.illness}. A doctor can help.`); }
    if (state.illness) { changeStats({ health: -4 }); log(`My health suffered from ${state.illness}.`); }
    if (state.stats.health <= 0 || state.age >= 100 || (state.age >= 75 && Math.random() < (state.age - 72) / 160)) {
      state.alive = false; state.income = 0; state.job = ''; state.pending = null; log(`My life came to an end at age ${state.age}. What a journey it was.`); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; render(); showSummary(); return;
    }
    let eligible = events.map((event, index) => ({ event, index })).filter(({event, index}) => state.age >= event.min && state.age <= event.max && (!event.when || event.when(state)) && !state.recentEvents.includes(index));
    if (!eligible.length) eligible = events.map((event, index) => ({ event, index })).filter(({event}) => state.age >= event.min && state.age <= event.max && (!event.when || event.when(state)));
    if (eligible.length && Math.random() < .7) { state.pending = pick(eligible).index; state.recentEvents = [...state.recentEvents, state.pending].slice(-3); }
    render(); if (state.pending !== null) showEvent();
  }
  function showEvent() {
    const event = events[state.pending]; if (!event) { state.pending = null; render(); return; }
    let content = header(event.icon, `AGE ${state.age} · A LITTLE MOMENT`, esc(event.title), esc(event.text));
    event.choices.forEach((choice, index) => {
      const effects = [];
      if (choice.cost) effects.push(`Costs ${money(choice.cost)}${state.balance < choice.cost ? ' (not enough money)' : ''}`);
      if (choice.gain) effects.push(`Gain ${money(choice.gain)}`);
      for (const [key, value] of Object.entries(choice.stats || {})) if (value) effects.push(`${value > 0 ? '+' : ''}${value} ${key}`);
      if (choice.bond) effects.push(`${choice.bond > 0 ? '+' : ''}${choice.bond} partner bond`);
      if (choice.friendBond) effects.push(`${choice.friendBond > 0 ? '+' : ''}${choice.friendBond} friendship`);
      if (choice.performance) effects.push(`+${choice.performance} performance`);
      content += option(`choice-${index}`, '✦', esc(choice.label), effects.join(' · ') || 'No stat change', !!choice.cost && state.balance < choice.cost);
    });
    modal(content);
  }
  function jobsPanel() {
    let content = header('💼', 'THE NEXT STEP', 'Find a job', 'Choose a path. Taking a job leaves university if you are studying.');
    jobs.forEach((job, i) => content += option(`job-${i}`, job.icon, job.name, `${money(job.salary)} / year${job.degree ? ' · University degree required' : ''}${job.smarts ? ` · ${job.smarts}% smarts required` : ''}${job.skill ? ` · ${skills[job.skill][1]} level ${job.level} required` : ''}`, state.moments <= 0 || (!!job.degree && state.education !== 'University') || (job.smarts && state.stats.smarts < job.smarts) || (job.skill && state.skills[job.skill] < job.level) || state.job === job.name));
    modal(content);
  }
  function showSummary() {
    const relationships = (state.partner ? 1 : 0) + state.friends.length + state.children.length + (state.pet ? 1 : 0);
    modal(header('🕊️', 'THE END OF A CHAPTER', 'A life to remember', `${esc(state.name)} lived for ${state.age} years. Every little moment made a story worth telling.`) + `<div class="summary-grid"><div><small>YEARS LIVED</small><strong>${state.age}</strong></div><div><small>FINAL BALANCE</small><strong>${money(state.balance)}</strong></div><div><small>EDUCATION</small><strong>${esc(state.education)}</strong></div><div><small>LOVED ONES</small><strong>${relationships}</strong></div><div><small>MILESTONES</small><strong>${state.milestones.length} / ${milestones.length}</strong></div><div><small>INVESTMENTS</small><strong>${money(state.investment)}</strong></div></div><p class="form-note">${state.assets.length ? `Treasured possessions: ${state.assets.map(esc).join(', ')}.` : 'A life is measured in more than possessions.'} Scroll through your timeline to revisit the moments.</p><button class="modal-secondary" data-close>View my story</button><button class="modal-primary" data-action="restart-confirm">Start a new life</button>`);
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
    if (s.studying && !number(s.studyStarted, s.age)) return false;
    return list(s.history, 105, year => year && number(year.age, s.age) && text(year.icon) && text(year.tag) && list(year.entries, 100, text)) && s.history.length > 0;
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ format: 'little-life-backup', version: 1, game: state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'little-life-backup.json'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#data-message').textContent = 'Backup downloaded. Keep it somewhere safe.';
  }
  function newLifeForm() {
    modal(header('🌱', 'A FRESH START', 'Start a new life?', 'Your current story will be replaced. Make this next one your own or leave the fields blank for a surprise.') + `<form id="new-life-form"><label class="form-label" for="new-name">NAME</label><input class="form-input" id="new-name" maxlength="40" placeholder="Random name" autocomplete="off"><label class="form-label" for="new-city">BIRTHPLACE</label><select class="form-input" id="new-city"><option value="">Surprise me</option>${cities.map(city => `<option value="${esc(city)}">${esc(city)}</option>`).join('')}</select><p class="form-note">Starting fresh replaces your current save on this device.</p><button type="button" class="modal-secondary" data-close>Keep my life</button><button type="submit" class="modal-primary">Start fresh</button></form>`);
  }
  function act(action) {
    if (action.startsWith('choice-')) {
      const event = events[state.pending]; const choice = event && event.choices[Number(action.split('-')[1])];
      if (!choice || (choice.cost && state.balance < choice.cost)) return;
      state.balance += (choice.gain || 0) - (choice.cost || 0); changeStats(choice.stats); if (choice.bond && state.partner) state.partnerBond = clamp(state.partnerBond + choice.bond); if (choice.friendBond && state.friends.length) state.friendBond = clamp(state.friendBond + choice.friendBond); if (choice.performance && state.job) state.careerPerformance = clamp(state.careerPerformance + choice.performance); log(choice.result); state.pending = null; closeModal(); render(); return;
    }
    if (action === 'import-cancel' && state.pending === null) { dataPanel(); return; }
    if (action === 'export' && state.pending === null) { exportBackup(); return; }
    if (action === 'import-confirm' && pendingImport && state.pending === null) { state = pendingImport; pendingImport = null; closeModal(); render(); if (state.pending !== null) showEvent(); return; }
    if (action === 'restart-confirm') { if (state.pending === null) newLifeForm(); return; }
    if (!state.alive || state.pending !== null) return;
    if (action === 'hobbies' && state.age >= 8) { hobbiesPanel(); return; }
    if (state.moments <= 0) return;
    if (action === 'job') { jobsPanel(); return; }
    if (action.startsWith('job-')) {
      const job = jobs[Number(action.slice(4))];
      if (!job || state.age < 18 || (job.degree && state.education !== 'University') || (job.smarts && state.stats.smarts < job.smarts) || (job.skill && state.skills[job.skill] < job.level) || state.job === job.name) return;
      state.job = job.name; state.income = job.salary; state.studying = false; state.retired = false; state.careerLevel = 1; state.careerPerformance = 50; log(`I started a new job as a ${job.name.toLowerCase()}.`); changeStats({ happiness: 4 });
    } else if (action === 'walk' && state.age >= 5) { log('I went for a walk and enjoyed some fresh air.'); changeStats({ health: 4, happiness: 3 }); }
    else if (action === 'read' && state.age >= 5) { log('I curled up with a good book.'); changeStats({ smarts: 4, happiness: 2 }); }
    else if (action === 'meditate' && state.age >= 5) { log('I took a moment to slow down and meditate.'); changeStats({ happiness: 5, health: 1 }); }
    else if (action === 'gym' && state.age >= 13) { log('I exercised and felt stronger for it.'); changeStats({ health: 6, looks: 3, happiness: 1 }); }
    else if (action.startsWith('practice-') && state.age >= 8 && skills[action.slice(9)] && state.skills[action.slice(9)] < 5) { const key = action.slice(9); state.skills[key]++; log(`I practiced ${skills[key][1].toLowerCase()} and reached level ${state.skills[key]}.`); changeStats({ happiness: 4, ...(key === 'fitness' ? { health: 3 } : { smarts: 1 }) }); }
    else if (action === 'doctor' && state.balance >= (state.age < 18 ? 0 : (state.illness ? 500 : 100))) { const cost = state.age < 18 ? 0 : (state.illness ? 500 : 100); state.balance -= cost; if (state.illness) { log(`I visited the doctor and was treated for ${state.illness}.`); state.illness = null; } else log('I visited the doctor for a checkup.'); changeStats({ health: 10 }); }
    else if (action === 'crime' && state.age >= 18) { if (Math.random() < .5) { const amount = random(500, 3000); state.balance += amount; log(`I took a risk and got away with ${money(amount)}.`); changeStats({ happiness: 3 }); } else { const fine = Math.min(state.balance, 1000); state.balance -= fine; log(`My risky scheme went wrong. I paid a ${money(fine)} fine.`); changeStats({ happiness: -10 }); } }
    else if (action === 'family') { log('I spent some quality time with my family.'); changeStats({ happiness: 5 }); }
    else if (action === 'friend' && state.age >= 5) { if (!state.friends.length) { state.friendBond = 60; state.friends.push(pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && n !== state.partner))); log(`I made a new friend named ${state.friends[0]}.`); } else { log(`I spent time with my friend ${state.friends[0]}.`); state.friendBond = clamp(state.friendBond + 20); } changeStats({ happiness: 6 }); }
    else if (action === 'date' && state.age >= 18) { if (!state.partner) { state.partnerBond = clamp(45 + Math.round(state.stats.looks / 5)); state.partner = pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && !state.friends.includes(n))); log(`I met ${state.partner}, and we started dating!`); } else { log(`I spent a lovely day with ${state.partner}.`); state.partnerBond = clamp(state.partnerBond + 20); } changeStats({ happiness: 8 }); }
    else if (action === 'marry' && state.partner && !state.married && state.balance >= 2000 && state.partnerBond >= 60) { state.balance -= 2000; state.married = true; log(`${state.partner} and I got married!`); changeStats({ happiness: 12 }); }
    else if (action === 'child' && state.partner && state.balance >= 1000 && state.children.length < 4 && state.partnerBond >= 45) { state.balance -= 1000; const name = pick(firstNames.filter(n => !state.children.includes(n) && n !== state.partner)); state.children.push(name); state.childBirthAges.push(state.age); log(`${state.partner} and I welcomed a child named ${name} into our family.`); changeStats({ happiness: 10 }); }
    else if (action === 'children' && state.children.length) { log(`I spent a wonderful day with ${state.children.join(' and ')}.`); changeStats({ happiness: 7 }); }
    else if (action === 'breakup' && state.partner) { log(`I ${state.married ? 'divorced' : 'broke up with'} ${state.partner}.`); state.partner = null; state.married = false; changeStats({ happiness: -8 }); }
    else if (action === 'pet' && state.age >= 18 && (state.pet || state.balance >= 500)) { if (!state.pet) { state.balance -= 500; state.pet = pick(['Mochi', 'Biscuit', 'Peanut', 'Poppy', 'Waffles']); log(`I adopted a pet named ${state.pet}.`); } else log(`I spent time playing with ${state.pet}.`); changeStats({ happiness: 7 }); }
    else if (action === 'study' && state.age >= 5 && state.age < 18) { log('I studied hard at school.'); changeStats({ smarts: 5, happiness: -1 }); }
    else if (action === 'university' && state.age >= 18 && !state.studying && state.education !== 'University' && state.balance >= 5000) { state.balance -= 5000; state.studying = true; state.studyStarted = state.age; state.job = ''; state.retired = false; state.income = 0; log('I enrolled in university. Graduation is four years away.'); }
    else if (action === 'work' && state.job && state.careerLevel < 5) { state.careerPerformance = clamp(state.careerPerformance + 20); log(`I worked hard. My career performance is now ${state.careerPerformance}%.`); changeStats({ happiness: -4, smarts: 2 }); }
    else if (action === 'retire' && state.job && state.age >= 65) { const oldJob = state.job; state.income = Math.round(state.income * .3); state.job = ''; state.retired = true; log(`I retired from my job as a ${oldJob.toLowerCase()} with an annual pension of ${money(state.income)}.`); changeStats({ happiness: 8 }); }
    else if (action === 'quit' && state.job) { log(`I quit my job as a ${state.job.toLowerCase()}.`); state.job = ''; state.income = 0; changeStats({ happiness: 3 }); }
    else if (action === 'invest' && state.age >= 18 && state.balance >= 5000) { state.balance -= 5000; state.investment += 5000; log('I invested $5,000 in a fund.'); }
    else if (action === 'withdraw' && state.investment > 0) { log(`I sold my investments for ${money(state.investment)}.`); state.balance += state.investment; state.investment = 0; }
    else if (items[action]) { const [name, cost] = items[action]; if (state.balance < cost || state.assets.includes(name) || (action !== 'bike' && state.age < 18)) return; state.balance -= cost; state.assets.push(name); log(`I bought a ${name.toLowerCase()} for ${money(cost)}.`); changeStats({ happiness: 8 }); }
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
    if (file.size > 1024 * 1024) { dataPanel('That file is too large to be a Little Life backup.', true); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (!input.isConnected || input.files[0] !== file || $('#modal').classList.contains('hidden')) return;
      try {
        const data = JSON.parse(reader.result);
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
