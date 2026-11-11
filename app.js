(() => {
  'use strict';
  const KEY = 'little-life-save-v1';
  const SLOT_KEY = 'little-life-slots-v1';
  const MAX_SLOTS = 10;
  const $ = (selector) => document.querySelector(selector);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (value) => Math.max(0, Math.min(100, value));
  const money = (value) => (value < 0 ? '-$' : '$') + Math.round(Math.abs(value)).toLocaleString('en-US');
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const firstNames = window.LIFE_NAMES?.first || ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Avery', 'Riley', 'Casey', 'Quinn', 'Charlie', 'Sam', 'Parker'];
  const surnames = window.LIFE_NAMES?.last || ['Bennett', 'Rivera', 'Brooks', 'Morgan', 'Hayes', 'Parker', 'Reed', 'Foster', 'Wells', 'Chen'];
  const cities = ['Portland, United States', 'Austin, United States', 'Charlotte, United States', 'London, United Kingdom', 'Toronto, Canada', 'Melbourne, Australia', 'Paris, France', 'Berlin, Germany', 'Warsaw, Poland', 'Istanbul, Turkey', 'Mumbai, India', 'Stockholm, Sweden', 'Oslo, Norway', 'Copenhagen, Denmark', 'Dubai, United Arab Emirates', 'Beijing, China'];
  const deathLabels = {'old-age':'Old age', 'poor-health':'Poor health', cancer:'Cancer complications', 'heart-attack':'Heart attack', lightning:'Lightning strike', surrender:'Surrender', surgery:'Surgery complications', 'alternative-treatment':'Treatment complications'};
  const statMeta = { happiness: ['😊', 'Happiness', '#e3bb70'], health: ['♥', 'Health', '#df948f'], smarts: ['✦', 'Smarts', '#91b4bf'], looks: ['✿', 'Looks', '#9abf98'] };
  const jobs = [
    { name: 'Barista', salary: 28000, icon: '☕' }, { name: 'Office assistant', salary: 35000, icon: '📎' },
    { name: 'Artist', salary: 32000, icon: '🎨' }, { name: 'Teacher', salary: 52000, icon: '🍎', degree: true, majors: ['education'], clean: true },
    { name: 'Software developer', salary: 85000, icon: '💻', degree: true, majors: ['computing', 'computerscience', 'engineering', 'electricalengineering', 'datascience', 'informationsystems'] }, { name: 'Doctor', salary: 110000, icon: '🩺', degree: true, majors: ['medicine'], smarts: 70, clean: true },
    { name: 'Musician', salary: 48000, icon: '🎵', skill: 'music', level: 3 }, { name: 'Athlete', salary: 60000, icon: '🏆', skill: 'fitness', level: 3 },
    { name: 'Chef', salary: 40000, icon: '👩‍🍳' }, { name: 'Mechanic', salary: 42000, icon: '🔧' },
    { name: 'Graphic designer', salary: 55000, icon: '🖌️', skill: 'art', level: 3 },
    { name: 'Journalist', salary: 50000, icon: '📰', degree: true, majors: ['arts', 'journalism', 'communications', 'english', 'history', 'linguistics', 'law'] }, { name: 'Engineer', salary: 80000, icon: '⚙️', degree: true, majors: ['computing', 'computerscience', 'engineering', 'electricalengineering', 'datascience', 'informationsystems'], smarts: 65 },
    { name: 'Librarian', salary: 47000, icon: '📚', degree: true, majors: ['education', 'arts', 'english', 'history', 'arthistory'] }, { name: 'Paramedic', salary: 50000, icon: '🚑', clean: true }, { name: 'Accountant', salary: 60000, icon: '🧮', degree: true, majors: ['business', 'finance', 'accounting', 'economics', 'marketing'] }, { name: 'Financial analyst', salary: 75000, icon: '📊', degree: true, majors: ['business', 'finance', 'accounting', 'economics', 'marketing'] },
    // Roles adapted from OpenLife, with annual salaries rebalanced for Little Life.
    { name: 'Delivery driver', salary: 26000, icon: '🚚', license: true }, { name: 'Junior translator', salary: 34000, icon: '🗣️', degree: true, majors: ['arts', 'journalism', 'communications', 'english', 'history', 'linguistics', 'law'] },
    { name: 'Exorcist', salary: 22000, icon: '🕯️' }, { name: 'Junior game developer', salary: 72000, icon: '🎮', degree: true, majors: ['computing', 'computerscience', 'engineering', 'electricalengineering', 'datascience', 'informationsystems'] },
    { name: 'Junior lawyer', salary: 90000, icon: '⚖️', degree: true, majors: ['arts', 'journalism', 'communications', 'english', 'history', 'linguistics', 'law'], clean: true }, { name: 'App developer', salary: 80000, icon: '📱', degree: true, majors: ['computing', 'computerscience', 'engineering', 'electricalengineering', 'datascience', 'informationsystems'] },
    { name: 'Junior banker', salary: 70000, icon: '🏦', degree: true, majors: ['business', 'finance', 'accounting', 'economics', 'marketing'] }, { name: 'Monk', salary: 25000, icon: '🕯️' }, { name: 'Wedding planner', salary: 40000, icon: '💐' },
    { name: 'Data scientist', salary: 105000, icon: '📊', degree: true, majors: ['computing', 'computerscience', 'engineering', 'electricalengineering', 'datascience', 'informationsystems'], smarts: 70 }, { name: 'Cashier', salary: 25000, icon: '🛒' },
    { name: 'College lecturer', salary: 65000, icon: '🎓', degree: true, majors: ['education'] }, { name: 'Junior editor', salary: 45000, icon: '📰', degree: true, majors: ['arts', 'journalism', 'communications', 'english', 'history', 'linguistics', 'law'] },
    { name: 'Flight attendant', salary: 48000, icon: '✈️' }, { name: 'Apprentice hairdresser', salary: 30000, icon: '✂️' }, { name: 'Nun', salary: 22000, icon: '⛪' },
    { name: 'Stockbroker', salary: 85000, icon: '📈', degree: true, majors: ['business', 'finance', 'accounting', 'economics', 'marketing'] }, { name: 'Social media manager', salary: 65000, icon: '📱', degree: true, majors: ['business', 'arts', 'marketing', 'communications'] },
    { name: 'Junior accountant', salary: 50000, icon: '🧮', degree: true, majors: ['business', 'finance', 'accounting', 'economics', 'marketing'] }
  ];
  // Named promotion chains from OpenLife; pay increases use Little Life's 15% rule.
  const promotionTitles = {
    'Junior translator': 'Translator', 'Translator': 'Senior translator',
    'Junior accountant': 'Accountant', 'Accountant': 'Senior accountant',
    'Junior game developer': 'Game developer', 'Game developer': 'Senior game developer',
    'Wedding planner': 'Senior wedding planner',
    'Engineer': 'Engineer II', 'Engineer II': 'Engineer III',
    'Junior editor': 'Editor', 'Editor': 'Senior editor',
    'Apprentice hairdresser': 'Hairdresser',
    'Social media manager': 'PR manager', 'PR manager': 'Head of marketing'
  };
  // Market names and categories adapted from OpenLife (MIT); prices and trading are rebalanced.
  const markets = [
    ['OpenMotors', 'stock', 45, 35], ['Airfruit Inc.', 'stock', 175, 30], ['Nanosoft Corp', 'stock', 330, 30], ['Woogle', 'stock', 125, 30], ['Rainforest Industries', 'stock', 120, 30], ['Boing Airspace', 'stock', 747, 35], ['Airbuss', 'stock', 320, 35], ['Doppelsieg Motorworks', 'stock', 55, 35], ['OpenLife Studios', 'stock', 69, 40], ['Candywriter LLC', 'stock', 45, 40],
    ['Gold', 'metal', 17000, 20], ['Silver', 'metal', 23, 25], ['Copper', 'metal', 5, 45], ['Palladium', 'metal', 2200, 35], ['Platinum', 'metal', 3500, 30],
    ['Xipple', 'crypto', 10, 75], ['Botcoin', 'crypto', 100, 75], ['ZephyrToken', 'crypto', 10, 75], ['LuminaToken', 'crypto', 10, 75], ['QuantumBit', 'crypto', 10, 75], ['SolsticeToken', 'crypto', 10, 75], ['NebulaCash', 'crypto', 10, 75], ['SecuCoin', 'crypto', 10, 75], ['OpenToken', 'crypto', 10, 75], ['Ethereal', 'crypto', 10, 75],
    ['S&E 500', 'fund', 100, 10], ['GTK Technology Fund', 'fund', 100, 10], ['GTK Hospitality Fund', 'fund', 100, 10], ['GTK Finance Fund', 'fund', 100, 10], ['GTK Automotive Fund', 'fund', 100, 10], ['GTK Videogame Fund', 'fund', 100, 10], ['GTK Aerospace Fund', 'fund', 100, 10], ['International Emerging Markets Fund', 'fund', 100, 10]
  ];
  // Life-Simulator1's progressive salary brackets. This is a game rule, not tax advice.
  function salaryTax(earnings, policy) {
    if (policy === 'flat') return Math.round(earnings * .2);
    const brackets = [[9950,.1], [40525,.12], [86375,.22], [164925,.24], [209425,.32], [523600,.35]];
    let tax = 0, previous = 0;
    for (const [bound, rate] of brackets) { tax += Math.max(0, Math.min(earnings, bound) - previous) * rate; if (earnings <= bound) return Math.round(tax); previous = bound; }
    return Math.round(tax + (earnings - previous) * .37);
  }
  const newPortfolio = () => markets.map(market => ({ price: market[2], units: 0 }));
  const portfolioValue = s => s.portfolio.reduce((sum, h) => sum + h.price * h.units, 0);
  const items = { bike: ['Bicycle', 500, '🚲'], car: ['Car', 15000, '🚗', 'car'], house: ['House', 100000, '🏡', 'house'],
    beetle: ['BWM Beetle', 35000, '🚗', 'car'], chiron: ['WV Chiron', 35000, '🚗', 'car'], minimart: ['Mini Smart', 20000, '🚗', 'car'], smartmini: ['Smart Mini', 20000, '🚗', 'car'], model3000: ['OpenMotors Model 3000', 75000, '🚗', 'car'], montecarlo: ['Chevollet Monte Carlo', 1100, '🚗', 'car'], accorda: ['Holder Accorda', 45000, '🚗', 'car'], civil: ['Holder Civil', 30000, '🚗', 'car'], santafe: ['Handai Santa Fe', 15000, '🚗', 'car'], cclass: ['Merchant C-Class', 55000, '🚗', 'car'], sorrento: ['Kai Sorrento', 16500, '🚗', 'car'], gt99: ['Totoya GT99', 11000, '🚗', 'car'], corvette: ['Chervolle Corvette', 12000, '🚗', 'car'], challenger: ['Dodgem Challenger', 14000, '🚗', 'car'], rover: ['Mars Rover 3000', 40000, '🚗', 'car'], mustang: ['Fodr Mustang', 67000, '🚗', 'car'], models: ['Nikola Model S', 56000, '🚗', 'car'], modelx: ['Nikola Model x', 67000, '🚗', 'car'], modely: ['Nikola Model Y', 99000, '🚗', 'car'], cybertruck: ['Nikola Cybertruck', 150000, '🚗', 'car'], electricbeetle: ['BWM Electric Beetle', 45000, '🚗', 'car'], model3500: ['OpenMotors Model 3500', 25000, '🚗', 'car'], senna: ['McLaid Senna', 1250000, '🚗', 'car'], mcl4500: ['McLaid 4500', 1000000, '🚗', 'car'], exotic: ['OpenMotors Exotic Mk. III', 750000, '🚗', 'car'], extra: ['Fodr Extra', 1750000, '🚗', 'car'], xartra: ['Holder Xartra', 1750000, '🚗', 'car'], electricmk2: ['OpenMotors Electric Mk. II', 1650000, '🚗', 'car'], rubberscreech: ['OpenMotors RubberScreech', 2500000, '🚗', 'car'], ferry: ['Ferry LXVI', 4500000, '🚗', 'car'], lavish: ['Bourgeoise Lavish', 10000000, '🚗', 'car'], avenger: ['Landbo Avenger', 135000, '🚗', 'car'], silverclaw: ['Doppelsieg Motorworks Silver Claw Mk. II', 350000, '🚗', 'car'], f1mk1: ['F1 Mk. I', 250000, '🏎️', 'car'], f1mk2: ['F1 Mk. II', 500000, '🏎️', 'car'], f1mk3: ['F1 Mk. III', 750000, '🏎️', 'car'], f1mk4: ['F1 Mk. IV', 1000000, '🏎️', 'car'],
    raft: ['Raft', 100, '🛶', 'boat'], speedboat: ['Speedboat', 10000, '🚤', 'boat'], yacht: ['Yacht', 45000, '🛥️', 'boat'], pirateship: ['Pirate Ship', 10000000, '⛵', 'boat'], rowingboat: ['Rowing Boat', 5000, '🛶', 'boat'],
    boing737: ['Boing 737', 150000000, '✈️', 'plane'], boing747: ['Boing 747', 250000000, '✈️', 'plane'], airbuss320: ['Airbuss A320', 175000000, '✈️', 'plane'], airbuss340: ['Airbuss A340', 275000000, '✈️', 'plane'], cessna: ['Cessna 172 Skyhawk', 15000, '🛩️', 'plane'], predator: ['Embracer Predator 520', 15000000, '🛩️', 'plane'], tompatt: ['Gumman F-14 Tompatt', 77777777, '✈️', 'plane'],
    duplex: ['Duplex', 100000, '🏡', 'house'], villa: ['Villa', 10000000, '🏡', 'house'], castle: ['Castle', 5000000, '🏰', 'house'], farm: ['Farm', 500000, '🏡', 'house'], geodesic: ['Geodesic Home', 500000, '🏡', 'house'], cabin: ['Log Cabin', 100000, '🏡', 'house'], condominium: ['Condomidium', 100000, '🏢', 'house'], trailer: ['Trailer', 15000, '🏠', 'house'], futurehome: ['Futuristic Home', 20000000, '🏠', 'house'], penthouse: ['Penthouse', 5000000, '🏙️', 'house'], modernhome: ['Modern Home', 300000, '🏡', 'house'], studio: ['Studio', 25000, '🏢', 'house'], tinyhouse: ['Tiny House', 10000, '🏠', 'house']
  };
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
    fastfood: { label: 'Fast food', cost: 2000, health: -4, happiness: 2 },
    coffeedonut: { label: 'Coffee, donut & cigarette', cost: 250, health: -6, happiness: 1 }
  };
  // OpenLife's degree catalogue, merged with the existing broad majors.
  const majors = { education: 'Education', medicine: 'Medicine', computing: 'Computer science & engineering', arts: 'Arts & journalism', business: 'Business', finance: 'Finance', journalism: 'Journalism', computerscience: 'Computer Science', accounting: 'Accounting', politics: 'Political Science', nursing: 'Nursing', psychology: 'Psychology', engineering: 'Engineering', arthistory: 'Art History', communications: 'Communications', graphicdesign: 'Graphic Design', datascience: 'Data Science', criminaljustice: 'Criminal Justice', linguistics: 'Linguistics', marketing: 'Marketing', anthropology: 'Anthropology', archaeology: 'Archaeology', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', mathematics: 'Mathematics', history: 'History', informationsystems: 'Information Systems', music: 'Music', economics: 'Economics', dance: 'Dance', electricalengineering: 'Electrical Engineering', religion: 'Religious Studies', dentistry: 'Dentistry', law: 'Law' };
  const coreMajors = ['education', 'medicine', 'computing', 'arts', 'business'];
  const gigs = { yard: ['Yard work', 250, '🌱'], tutor: ['Tutoring', 400, '✏️'], freelance: ['Freelance project', 800, '💻'] };
  // Trait names and broad effects adapted from Life-Simulator1 (MIT).
  const traits = {
    cheerful: ['Cheerful', 'Happiness gains are a little stronger.'], bookworm: ['Book lover', 'Reading gives extra happiness.'], nerd: ['Nerd', 'Reading and studying boost smarts more.'],
    genius: ['Genius', 'Gain a little smarts each year.'], fast: ['Fast worker', 'Job performance improves over time.'], wellkept: ['Well-kept', 'Looks improve slightly over time.'],
    meditator: ['Meditator', 'Meditation gives extra happiness.'], grumpy: ['Grumpy', 'Happiness gains are a little smaller.'], slow: ['Slow worker', 'Job performance falls faster.'],
    lazy: ['Lazy', 'Working harder costs more happiness.'], thanatophobia: ['Thanatophobia', 'Sometimes worries about mortality and feels grief more deeply.'], sickly: ['Sickly', 'Health declines slightly faster.'], unkempt: ['Unkempt', 'Looks decline slightly faster.'],
    moody: ['Moody', 'Happiness changes are amplified.'], calm: ['Even-tempered', 'Happiness changes are softened.']
  };
  const catalog = window.LIFE_CATALOG || { BOOKS: [], SPEND_TIME_PLACES: [], CHATS: [], CHATS_CHILD: [] };
  const countries = catalog.COUNTRIES || [];
  // Two further book entries adapted from OpenLife (MIT). Values are rebalanced.
  const books = [...catalog.BOOKS, ['A Tale of Two Cities', 'Fiction · Charles Dickens', 438, 13, 0, 5], ['Merriam-Webster Dictionary', 'Reference · Merriam-Webster', 960, 13, 0, 100]];
  // Outing dialogue from OpenLife (MIT).
  const outings = [...catalog.SPEND_TIME_PLACES, ...["to practice sumo wrestling", "to play in the rain", "to toilet paper the neighbour's house", "to scare random people by jumping out of the bushes at a local park", "to make a wish while throwing a coing in a fountain", "to watch toy unboxing videos", "to a café to play cards", "to watch a movie under the stars in the park", "to perform in a flash mob at the grocery store", "to fly a kite", "to a rugby game", "to the circus", "longboarding", "to a Hindu temple", "to build a sandcastle in a sandbox at the park", "to an escape room", "antiquing", "to write haikus", "to play in the sprinklers at the local park", "to play bingo at the community centre", "to an arcade", "to throw paper aeroplanes off the bleachers at the local high school", "to the water park", "to the aquarium to look at sharks", "to sing P!nk songs at karaoke night", "to the movies", "axe throwing", "to make home made mini pizzas", "to a painting class", "to have a random dance party in a public plaza", "to plant trees in the forest", "whale watching", "to make and pass out balloon animals at the park", "snowboarding", "to the park", "to graffiti train cars", "to learn origami at the community centre", "birdwatching", "to the shooting range", "to do caricature drawings of random people in a public place", "yodelling", "deep sea fishing", "to a carnival", "to ding dong ditch the neighbours", "to parkour hardcore", "to watch a random trial at the municipal court", "to a rugby game", "to make selfies for Instagram", "to the museum", "to walk along a scenic vista", "to watch toy unboxing videos", "to fly a drone", "to make a safety evacuation map", "horseback riding in the countryside", "to dinner", "to a puppet-making seminar"]];
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
    { id: 'wealth', icon: '💰', name: 'Nest egg', detail: 'Reach $100,000 in cash and investments', check: s => s.balance + s.investment + portfolioValue(s) >= 100000 },
    { id: 'longlife', icon: '🎂', name: 'A life well lived', detail: 'Reach age 80', check: s => s.age >= 80 }
  ];
  let state;
  let unreadableSave = null;
  let storageReadFailed = false;
  let replaceUnreadable = false;
  let returnFocus = null;
  let pendingImport = null;
  let pendingSlot = null;
  let pendingSlotReset = null;
  let pendingInterview = null;
  let adoptionCandidate = null;
  // Job interview prompts adapted from OpenLife (MIT).
  const interviews = [
    ['Which Harry Potter character do you relate to most?', ['Harry Potter', 'Dobby', 'Hagrid', 'Draco Malfoy'], [1, 2]],
    ['Tea or coffee?', ['Tea', 'Coffee', 'Both', 'Neither'], [0, 1]],
    ['Team Edward or Team Jacob?', ['Team Edward', 'Team Jacob', "I don't care", 'What is that?'], [0, 1]],
    ['Do you prefer to call or text?', ['Call', 'Text', "Either one's fine", 'I prefer to talk in person'], [0, 1]],
    ['What are your weaknesses?', ['Where do I start?', "I'm a perfectionist", 'I feel horny at work', "I don't have any"], [1]],
    ['Any more questions?', ['When do I start?', 'What is the company culture like?', 'What is the pay?', 'How inclusive is the company?'], [1, 3]],
    ['What do you want to see in a workplace?', ['Collaboration', 'Cute female employees', 'Good Pay', 'Diversity'], [0, 3]]
  ];

  function freshLife(name, city, gender) {
    name = name || `${pick(firstNames)} ${pick(surnames)}`; city = city || pick(cities);
    const parentOne = pick(firstNames.filter(n => !name.startsWith(n + ' ')));
    const parentTwo = pick(firstNames.filter(n => n !== parentOne && !name.startsWith(n + ' ')));
    const parents = [parentOne, parentTwo].map(parentName => ({ name: parentName, age: random(24, 40), endAge: random(72, 95), bond: 70, alive: true, inheritance: random(2000, 10000), generosity: random(0, 100), wealth: random(0, 50) + random(0, 50), moneyRefusals: 0 }));
    const siblings = Math.random() < .55 ? [{ name: pick(firstNames.filter(n => n !== parentOne && n !== parentTwo && !name.startsWith(n + ' '))), age: random(0, 6), endAge: random(72, 95), bond: 65, alive: true, smarts: random(0, 50) + random(0, 50), looks: random(0, 50) + random(0, 50), petulance: random(0, 100) }] : [];
    return { version: 1, name, city, gender: gender || pick(['female', 'male', 'nonbinary']), age: 0, stats: { happiness: random(65, 90), health: random(70, 95), smarts: random(55, 90), looks: random(55, 90) }, balance: 0, income: 0, job: '', retired: false, education: 'None', major: '', studyMajor: '', studying: false, partner: null, married: false, engaged: false, lastVows: null, vowRejectedAt: null, proposalRejectedAt: null, pregnancy: null, parents, siblings, trait: pick(Object.keys(traits)), extraTraits: [], meditations: 0, studySessions: 0, grades: 65, droppedOut: false, karma: 50, parentAsks: [null, null], socialVisits: [], socialConversations: [], socialCompliments: [], argumentTarget: null, kidnappingRansom: null, dateCandidate: null, partnerDetails: null, scholarshipAttempt: null, readingBook: null, taxPolicy: 'flat', pensionPolicy: 'flat', workYears: 0, salaryHistory: [], happinessTotal: 0, happinessYears: 0, childProfiles: {}, childBonds: [], studentLoan: 0, savings: 0, debt: 0, will: {mode: 'legacy', child: null}, portfolio: newPortfolio(), stress: 0, jobHours: 40, jobWarnings: 0, jobWarned: false, lastRaiseRequest: null, raiseRejections: 0, lastSurgery: null, jackpot: 250000, generation: 1, legacyHistory: [], children: [], lostChildren: [], childBirthAges: [], friends: [], pet: null, petInfo: null, assets: [], assetValues: {}, alive: true, deathCause: null, funeralQueue: [], pending: null, recentEvents: [], seenEvents: [], prisonYears: 0, convictions: 0, license: false, boatLicense: false, pilotLicense: false, moves: 0, diet: 'regular', moments: MAX_MOMENTS, skills: { music: 0, art: 0, fitness: 0 }, careerLevel: 1, careerPerformance: 50, partnerBond: 65, friendBond: 60, investment: 0, illness: null, illnessSince: null, additionalIllnesses: [], milestones: [], history: [{ age: 0, icon: '👶', tag: 'THE BEGINNING', entries: [`I was born in ${city}. Hello, world!`, `${parentOne} and ${parentTwo} welcomed me into the world. My story starts here.`] }] };
  }
  function upgradeGame(saved) {
    const upgraded = { gender: '', parents: [], siblings: [], trait: '', extraTraits: [], meditations: 0, studySessions: 0, grades: 65, droppedOut: false, karma: 50, parentAsks: [null, null], socialVisits: [], socialConversations: [], socialCompliments: [], argumentTarget: null, kidnappingRansom: null, dateCandidate: null, partnerDetails: null, scholarshipAttempt: null, readingBook: null, taxPolicy: 'flat', pensionPolicy: 'flat', workYears: 0, salaryHistory: [], happinessTotal: 0, happinessYears: 0, childProfiles: {}, childBonds: (saved.children || []).map(() => 65), deathCause: null, funeralQueue: [], studentLoan: 0, savings: 0, debt: 0, will: {mode: 'legacy', child: null}, portfolio: newPortfolio(), stress: 0, jobHours: 40, jobWarnings: 0, jobWarned: false, lastRaiseRequest: null, raiseRejections: 0, lastSurgery: null, jackpot: 250000, generation: 1, legacyHistory: [], major: saved.education === 'University' ? 'legacy' : '', studyMajor: saved.studying ? 'legacy' : '', retired: false, married: false, engaged: false, lastVows: null, vowRejectedAt: null, proposalRejectedAt: null, pregnancy: null, children: [], lostChildren: [], childBirthAges: (saved.children || []).map(() => null), pet: null, petInfo: null, assetValues: Object.fromEntries((saved.assets || []).flatMap(name => { const item = Object.values(items).find(i => i[0] === name); return item ? [[name, Math.round(item[1] * .7)]] : []; })), recentEvents: [], seenEvents: [], prisonYears: 0, convictions: 0, license: false, boatLicense: false, pilotLicense: false, moves: 0, diet: 'regular', moments: MAX_MOMENTS, skills: { music: 0, art: 0, fitness: 0 }, careerLevel: 1, careerPerformance: 50, partnerBond: 65, friendBond: 60, investment: 0, illness: null, illnessSince: null, additionalIllnesses: [], milestones: [], ...saved };
    // Older child profiles did not record happiness; do not invent prior years.
    if (upgraded.childProfiles && typeof upgraded.childProfiles === 'object' && !Array.isArray(upgraded.childProfiles)) upgraded.childProfiles = Object.fromEntries(Object.entries(upgraded.childProfiles).map(([key, profile]) => [key, profile && typeof profile === 'object' && profile.happinessTotal === undefined && profile.happinessYears === undefined ? {...profile, happinessTotal:0, happinessYears:0} : profile]));
    // Work records also begin at migration rather than guessing a child's prior employment.
    if (upgraded.childProfiles && typeof upgraded.childProfiles === 'object' && !Array.isArray(upgraded.childProfiles)) upgraded.childProfiles = Object.fromEntries(Object.entries(upgraded.childProfiles).map(([key, profile]) => [key, profile && typeof profile === 'object' && profile.workYears === undefined && profile.salaryHistory === undefined ? {...profile, workYears:0, salaryHistory:[]} : profile]));
    // Student debt is only recorded from this version onward; do not invent old loans.
    if (upgraded.childProfiles && typeof upgraded.childProfiles === 'object' && !Array.isArray(upgraded.childProfiles)) upgraded.childProfiles = Object.fromEntries(Object.entries(upgraded.childProfiles).map(([key, profile]) => [key, profile && typeof profile === 'object' && profile.studentLoan === undefined ? {...profile, studentLoan:0} : profile]));
    // Event history is a set. Earlier saves may contain repeated indices; remove
    // duplicates so a subsequent new event cannot overflow the validated limit.
    if (Array.isArray(upgraded.seenEvents)) upgraded.seenEvents = [...new Set(upgraded.seenEvents)];
    // The original 25-asset portfolio predates the named fund catalogue.
    if (Array.isArray(saved.portfolio) && saved.portfolio.length === 25) upgraded.portfolio = [...saved.portfolio, ...newPortfolio().slice(25)];
    return upgraded;
  }
  function load() {
    let raw;
    try { raw = localStorage.getItem(KEY); } catch (_) { storageReadFailed = true; return freshLife(); }
    if (raw !== null) {
      try {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
          const upgraded = upgradeGame(saved);
          if (validBackup({format:'little-life-backup',version:1,game:upgraded})) return upgraded;
        }
      } catch (_) { /* preserve the original data below */ }
      unreadableSave = raw;
    }
    return freshLife();
  }
  function save() {
    const warning = $('#storage-warning');
    if ((unreadableSave !== null || storageReadFailed) && !replaceUnreadable) { warning.textContent = storageReadFailed ? 'Browser storage could not be read. Any existing save has not been overwritten; this temporary life will not autosave. Use Save & load to retry reading the original, or explicitly start a new life or restore a backup.' : 'The existing save could not be read. It has not been overwritten; this temporary life will not autosave. Use Save & load to download the original data, or explicitly start a new life or restore a backup.'; warning.hidden = false; return; }
    try { localStorage.setItem(KEY, JSON.stringify(state)); unreadableSave = null; storageReadFailed = false; replaceUnreadable = false; warning.hidden = true; }
    catch (_) { warning.textContent = storageReadFailed ? 'Could not replace the existing save. Browser storage is still unavailable; this life is not being saved.' : unreadableSave !== null ? 'Could not replace the unreadable save. The original data remains available under Save & load; this life is not being saved.' : 'Saving is unavailable in this browser. Your progress may be lost when you leave; use Save & load to download a backup.'; warning.hidden = false; }
  }
  function occupation() {
    if (!state.alive) return 'At rest';
    if (state.prisonYears > 0) return 'In prison';
    if (state.job) return state.job;
    if (state.retired) return 'Retired';
    if (state.studying) return 'University student';
    if (state.age < 5) return 'Little one';
    if (state.age < 18) return state.droppedOut ? 'Left school' : 'Student';
    return 'Unemployed';
  }
  function portrait() { if (!state.alive) return '🕊️'; if (state.prisonYears > 0) return '⛓️'; if (state.age < 3) return '👶'; if (state.age < 13) return '🧒'; if (state.age < 65) return '🧑'; return '🧓'; }
  const hasTrait = key => state.trait === key || state.extraTraits.includes(key);
  function learnTrait(key) { if (!hasTrait(key) && state.extraTraits.length < 2) { state.extraTraits.push(key); log(`I developed the ${traits[key][0]} trait.`); } }
  function changeStats(changes) {
    Object.entries(changes || {}).forEach(([key, amount]) => {
      if (!(key in state.stats)) return;
      if (key === 'happiness') {
        if (hasTrait('moody')) amount = Math.round(amount * 1.25);
        if (hasTrait('calm')) amount = Math.sign(amount) * Math.ceil(Math.abs(amount) * .75);
        if (amount > 0 && hasTrait('cheerful')) amount++;
        if (amount > 0 && hasTrait('grumpy')) amount = Math.max(0, amount - 1);
      }
      state.stats[key] = clamp(state.stats[key] + amount);
    });
  }
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
    $('#character-location').textContent = '⌖  ' + state.city + (state.gender ? ` · ${state.gender === 'nonbinary' ? 'Nonbinary' : state.gender[0].toUpperCase() + state.gender.slice(1)}` : '');
    $('#profile-age').textContent = state.age + (state.age === 1 ? ' year' : ' years');
    $('#occupation').textContent = occupation();
    $('#portrait').textContent = portrait();
    $('#balance').textContent = money(state.balance);
    $('#income').textContent = money(state.job ? Math.round(state.income * state.jobHours / 40) : state.income);
    $('#investment').textContent = money(state.investment + portfolioValue(state));
    $('#health-status').innerHTML = (state.illness ? `<div class="health-alert">🩺 <strong>${[state.illness, ...state.additionalIllnesses.map(c => c.name)].map(esc).join(', ')}</strong> · Some illnesses resolve naturally; others may need repeat treatment.</div>` : '') + (state.prisonYears ? `<div class="health-alert">⛓️ <strong>In prison</strong> · ${state.prisonYears} year${state.prisonYears === 1 ? '' : 's'} left. Age up to serve your sentence.</div>` : '');
    $('#life-status').textContent = state.alive ? 'LIFE IN PROGRESS' : 'LIFE COMPLETE';
    $('#chapter-label').textContent = `GEN ${state.generation} · CHAPTER ${String(state.age + 1).padStart(2, '0')}`;
    $('#moments').innerHTML = `<span>${state.alive ? `${state.moments} of ${MAX_MOMENTS} moments left this year` : 'Your story is complete'}</span><span>${state.alive ? '●'.repeat(state.moments) + '○'.repeat(MAX_MOMENTS - state.moments) : '✦'}</span>`;
    $('#trait-label').innerHTML = `<div class="trait-label"><strong>☯ Karma ${state.karma}% · Stress ${state.stress}%</strong>Kindness and choices shape karma; high stress can hurt your health.</div>` + [state.trait, ...state.extraTraits].filter(Boolean).map(key => `<div class="trait-label"><strong>✦ ${esc(traits[key][0])}</strong>${esc(traits[key][1])}</div>`).join('');
    $('#stats').innerHTML = Object.entries(statMeta).map(([key, [icon, name, color]]) => `<div class="stat"><div class="stat-row"><span><span class="stat-emoji" style="color:${color}">${icon}</span>${name}</span><span class="stat-value">${state.stats[key]}%</span></div><div class="bar"><i style="width:${state.stats[key]}%;background:${color}"></i></div></div>`).join('');
    $('#timeline').innerHTML = [...state.history].reverse().map((year) => `<div class="year-block"><div class="year-icon">${esc(year.icon)}</div><div><div class="year-heading"><strong>Age ${year.age}</strong>${year.tag ? `<span>${esc(year.tag)}</span>` : ''}</div>${year.entries.map(entry => `<p class="event">${esc(entry)}</p>`).join('')}</div></div>`).join('');
    $('#story-bottom').innerHTML = state.alive ? '<span>✧</span> Your story is still being written... <span>✧</span>' : '<span>✧</span> <button class="story-review" id="review-life">See your life in review</button> <span>✧</span>';
    $('#age-up').disabled = !state.alive || state.pending !== null;
    $('#age-up strong').textContent = state.alive ? 'Age up' : 'Life complete';
    $('#age-up small').textContent = state.alive ? 'See what the next year brings' : 'Review your story or continue your legacy';
    save();
  }
  function modal(content, focusOrigin = null) {
    if ($('#modal').classList.contains('hidden')) returnFocus = focusOrigin || document.activeElement;
    $('#modal-content').innerHTML = content;
    $('#modal').classList.remove('hidden');
    $('.close-modal').hidden = state.pending !== null;
    const focusTarget = state.pending !== null ? $('#modal-content button:not(:disabled)') : $('.close-modal');
    if (focusTarget) focusTarget.focus();
  }
  function closeModal() { pendingInterview = null; adoptionCandidate = null; $('#modal').classList.add('hidden'); if (returnFocus && returnFocus.focus) returnFocus.focus(); }
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
      content += option('toys', '🧸', 'Play with toys', 'A little imagination goes a long way. Depression can reduce enjoyment. Ages 3–12.', noTime || state.age < 3 || state.age >= 13);
      content += option('crafts', '✂️', 'Arts & crafts', 'Make something creative. Sometimes inspiration does not come. Available at 5.', noTime || state.age < 5);
      content += option('music-listen', '🎧', 'Listen to music', 'Lift your mood and reduce stress. Available at 12.', noTime || state.age < 12);
      content += option('movies', '🎬', 'Watch a movie', 'Choose a genre and a movie. Free for children; adults pay $20.', noTime || state.age < 8 || (state.age >= 18 && state.balance < 20));
      content += option('library', '🏛️', 'Visit the library', 'Browse the shelves to boost smarts. Available at 6.', noTime || state.age < 6);
      content += option('read', '📚', 'Read a book', 'Choose a book at the library. Available at 6.', noTime || state.age < 6);
      content += option('reading-session', '📖', state.readingBook ? 'Continue reading a book' : 'Read page by page', state.readingBook ? 'Resume your saved reading progress.' : 'Start a book and read it page by page or in batches. Starting uses one moment.', state.age < 6 || (!state.readingBook && noTime));
      content += option('meditate', '🧘', 'Meditate', 'Slow down, boost happiness and reduce stress.', noTime || state.age < 5);
      content += option('gym', '🏃', 'Exercise', 'Build healthy habits and feel your best. Available at 13.', noTime || state.age < 13);
      content += option('hobbies', '🎨', 'Hobbies & skills', 'Practice music, art or fitness. Skills can unlock careers.', state.age < 8);
      const doctorCost = state.age < 18 ? 0 : (state.illness ? 500 : 100);
      content += option('doctor', '🩺', 'Visit the doctor', state.age < 18 ? 'Family covers the cost. Treats illness and improves health.' : state.illness ? `Treat ${esc(state.illness)} for $500. Chronic conditions may require repeat visits.` : 'A checkup costs $100 and improves health.', noTime || state.balance < doctorCost);
      content += option('alternative-doctor', '🌿', 'Alternative treatment', 'Costs $100. Unproven treatment can improve or seriously harm health; it may be fatal.', noTime || state.age < 18 || state.balance < 100);
      content += option('lottery', '🎟️', 'Lottery', `Pick four numbers for $4 per ticket. Jackpot: ${money(state.jackpot)}. Available at 18.`, noTime || state.age < 18 || state.balance < 4);
      content += option('surgery', '✨', 'Plastic surgery', state.lastSurgery !== null && state.age - state.lastSurgery < 6 ? `Available again at age ${state.lastSurgery + 6}.` : 'Choose a surgeon. Costs $25,000, with a risk of complications. Available at 18.', noTime || state.age < 18 || state.balance < 25000 || (state.lastSurgery !== null && state.age - state.lastSurgery < 6));
      content += option('gigs', '🧰', 'Odd jobs', 'Earn a little extra money. Available at 16.', noTime || state.age < 16);
      content += option('diet', '🥗', 'Choose a diet', `Current: ${esc(diets[state.diet].label)}. Change your yearly costs and stats.`, state.age < 18);
      content += option('travel', '🌍', 'Move abroad', 'Start over in another city. Moving costs $3,000.', noTime || state.age < 18 || state.balance < 3000);
      content += option('license', '🪪', state.license ? 'Driver’s license earned' : 'Get a driver’s license', 'Costs $250. Available at 16; needed to buy a car.', noTime || state.age < 16 || state.balance < 250 || state.license);
      content += option('surrender', '🕊️', 'Surrender this life', 'End the current life after two confirmations.');
      content += option('boat-license', '🪪', state.boatLicense ? 'Boating license earned' : 'Get a boating license', 'Costs $500. Required to buy a boat. Available at 18.', noTime || state.age < 18 || state.balance < 500 || state.boatLicense);
      content += option('pilot-license', '🪪', state.pilotLicense ? 'Pilot license earned' : 'Get a pilot license', 'Costs $10,000. Required to buy a plane. Available at 18.', noTime || state.age < 18 || state.balance < 10000 || state.pilotLicense);
      content += option('crime', '🕵️', 'Crime', 'Risk arrest for a chance at fast money. Available at 18.', noTime || state.age < 18);
    } else if (type === 'relationships') {
      content = header('♡', 'BETTER TOGETHER', 'Relationships', 'Friendship and partner bonds fall by 3 each year. Spend time together to stay close.' + timeNote);
      content += option('family', '🏡', 'Spend time with family', 'Catch up with your loved ones.', noTime);
      state.parents.forEach((parent, index) => {
        if (parent.alive) content += option(`parent-${index}`, '👪', `Visit ${esc(parent.name)}`, `Parent · Age ${parent.age} · Bond ${parent.bond}% · Spend time together; a bond below 40% halves inheritance.`, noTime);
        else content += `<div class="legacy-entry"><span><strong>${esc(parent.name)}</strong><small>Parent · Remembered at age ${parent.age}</small></span><span>🕊️</span></div>`;
      });
      state.siblings.forEach((sibling, index) => {
        if (sibling.alive) content += option(`sibling-${index}`, '🧑', `Visit ${esc(sibling.name)}`, `Sibling · Age ${sibling.age} · Bond ${sibling.bond}%`, noTime);
        else content += `<div class="legacy-entry"><span><strong>${esc(sibling.name)}</strong><small>Sibling · Remembered at age ${sibling.age}</small></span><span>🕊️</span></div>`;
      });
      content += option('social', '💌', 'More ways to connect', 'Choose a loved one to compliment, insult, give a gift, or discuss a topic.', noTime || state.age < 3);
      content += option('conversation', '💬', 'Have a conversation', 'Choose someone to talk with.', noTime || state.age < 3 || !(state.partner || state.friends.length || state.parents.some(p => p.alive) || state.siblings.some(p => p.alive)));
      content += option('friend', '🤝', state.friends.length ? `Hang out with ${esc(state.friends[0])}` : 'Make a friend', state.friends.length ? `Friendship: ${state.friendBond}% · Spending time strengthens your bond.` : 'Meet someone new. Available at 5.', noTime || state.age < 5);
      content += option('date', '💌', state.partner ? `Spend time with ${esc(state.partner)}` : 'Find a date', state.partner ? `Bond: ${state.partnerBond}% · Spending time strengthens your relationship.` : 'Available at 18. Your looks influence your starting bond.', noTime || state.age < 18);
      if (!state.partner) content += option('meet-date', '💘', state.dateCandidate ? 'Return to a potential date' : 'Meet a potential date', 'Meet someone, see their profile and choose whether to ask them out. Meeting costs one moment; compatibility affects their answer.', state.age < 18 || (!state.dateCandidate && noTime));
      if (state.partner && !state.married && !state.engaged) content += option('propose', '💍', `Propose to ${esc(state.partner)}`, state.proposalRejectedAt === state.age ? 'Already declined this year; try again next year.' : state.partnerDetails?.yearsTogether !== undefined ? `Together ${state.partnerDetails.yearsTogether} years. Acceptance depends on time together, bond and partner personality; at least three years are needed.` : 'An engagement allows you to choose a wedding venue. A strong bond improves your chances.', noTime || state.proposalRejectedAt === state.age);
      if (state.partner && state.engaged && !state.married) { content += option('wedding', '💒', 'Plan a wedding', 'Choose a venue and celebrate together.', noTime); content += option('cancel-engagement', '💔', 'Call off the engagement', 'Stay together, but your bond will suffer.', noTime); }
      if (state.partner && state.married) content += option('renew-vows', '💐', 'Renew vows', state.vowRejectedAt === state.age ? 'Your spouse declined this year; ask again next year.' : state.lastVows !== null && state.age - state.lastVows < 10 ? `Available again at age ${state.lastVows + 10}.` : 'A spouse may decline based on your bond. If they agree, renewal costs $500 and is available every ten years.', noTime || state.balance < 500 || state.vowRejectedAt === state.age || (state.lastVows !== null && state.age - state.lastVows < 10));
      if (state.partner && !state.married) content += option('marry', '💍', `Marry ${esc(state.partner)}`, 'A wedding costs $2,000 and requires a bond of 60%.', noTime || state.balance < 2000 || state.partnerBond < 60);
      if (!state.partner && state.age >= 18) content += option('adopt', '🍼', 'Adopt a child', 'Costs $1,500. Each child costs $2,000/year until 18.', noTime || state.balance < 1500 || state.children.length + (state.pregnancy ? 1 : 0) >= 4);
      content += option('adoption-agency', '🏠', 'Visit an adoption agency', 'Meet a child aged 1–17. Adoption costs $10,000–$30,000. Available from age 21 through 70.', noTime || state.age < 21 || state.age > 70 || state.children.length + (state.pregnancy ? 1 : 0) >= 4);
      if (state.pregnancy) content += `<div class="progress-card">🍼 <strong>Expecting a child</strong><br>With ${esc(state.pregnancy.coParent)}. Age up to see what happens.</div>`;
      if (state.pregnancy) content += option('end-pregnancy', '🩺', 'End the pregnancy', 'Choose whether to end the pregnancy. Confirmation required.', noTime);
      if (state.partner) content += option('try-baby', '🤰', 'Try for a baby', state.partnerDetails?.fertility !== undefined && state.partnerDetails?.yearsTogether !== undefined ? 'Your partner may decline; if you both try, it costs $1,000 and pregnancy is not guaranteed. Fictional game rules, not medical advice.' : 'Costs $1,000 and starts a pregnancy. Birth or miscarriage occurs next year.', noTime || state.pregnancy || state.balance < 1000 || state.children.length >= 4 || state.partnerBond < 45);
      if (state.partner) content += option('child', '🍼', 'Welcome a child', 'Costs $1,000; requires 45% bond. Each child costs $2,000/year until 18.', noTime || state.balance < 1000 || state.children.length + (state.pregnancy ? 1 : 0) >= 4 || state.partnerBond < 45);
      if (state.children.length) content += option('children', '🧸', 'Spend time with your children', `Make memories with ${state.children.map(esc).join(', ')}.`, noTime);
      if (state.partner) content += option('breakup', '💔', state.married ? 'Get divorced' : 'Break up', state.married ? 'A divorce settlement costs 40–60% of your cash. Confirmation required.' : 'End your relationship. Confirmation required.', noTime);
      content += option('pet', '🐾', state.pet ? `Play with ${esc(state.pet)}` : 'Adopt a pet', state.pet ? `${state.petInfo ? `${esc(state.petInfo.breed)} · Age ${state.petInfo.age} · ` : ''}Spend time together.` : 'Costs $500 to adopt and $500/year. Available at 18.', noTime || state.age < 18 || (!state.pet && state.balance < 500));
    } else if (type === 'occupation') {
      content = header('▤', 'DREAM A LITTLE BIGGER', 'School & career', `Currently: ${esc(occupation())}. Education: ${esc(state.education)}${state.major && state.major !== 'legacy' ? ` (${esc(majors[state.major])})` : ''}.${timeNote}`);
      if (state.age < 18) {
        if (state.age >= 5) { const stage = state.age < 6 ? 'Early school' : state.age < 12 ? 'Elementary school' : state.age < 14 ? 'Middle school' : 'High school'; content += `<div class="progress-card">📚 <strong>${stage} · Grades: ${state.grades}%${state.droppedOut ? ' · Not attending' : ''}</strong><br>At 18, at least 40% grades and attending school are needed to graduate.</div>`; }
        if (!state.droppedOut) { content += option('study', '✏️', 'Study harder', 'Improve your grades and smarts.', noTime || state.age < 5); content += option('skip-school', '🛹', 'Skip school', 'Risk grades, smarts and karma for a chance at happiness. You might get caught.', noTime || state.age < 5); content += option('drop-school', '🚪', 'Drop out', 'Leave school at 16 or older. You can earn a GED later.', noTime || state.age < 16); }
        else content += option('return-school', '🎒', 'Return to school', 'Resume your studies.', noTime);
      }
      else {
        if (state.education === 'None') content += option('ged', '📜', 'Earn a GED', 'A high-school equivalency costs $500 and unlocks university.', noTime || state.balance < 500);
        if (state.studying) { content += `<div class="progress-card">🎓 <strong>${esc(majors[state.studyMajor] || 'University')}: year ${Math.min(4, state.age - state.studyStarted + 1)} of 4 · Grades ${state.grades}%</strong><br>Very low grades can lead to expulsion before graduation.</div>`; content += option('university-study', '📚', 'Study harder', 'Improve university grades and smarts.', noTime); content += option('university-skip', '🛹', 'Skip lectures', 'Gain happiness but lose grades, smarts and karma.', noTime); content += option('university-leave', '🚪', 'Leave university', 'Leave your current course. Any student loan remains due.', noTime); }
        else content += option('university', '🎓', state.education === 'University' ? 'Study another degree' : 'Go to university', `Four years of study. Tuition ${money(universityCost())}; leaves your job.`, noTime || state.education === 'None');
        content += option('pension-rules', '🌅', 'Pension rules', `Current game rule: ${state.pensionPolicy === 'flat' ? '30% of final salary' : 'career-based pension'}. Change without using a moment.`);
        content += option('job', '💼', state.job ? 'Look for another job' : 'Find a job', 'Browse opportunities and start earning.', noTime);
        if (state.job) { content += `<div class="progress-card">📈 <strong>Career level ${state.careerLevel} · Performance ${state.careerPerformance}%</strong><br>Stress ${state.stress}% · ${state.jobHours} hours/week. Reach 80% performance for a promotion. Long hours build stress; high stress hurts health.</div>`; content += option('hours', '⏰', 'Adjust working hours', 'Choose 38–70 hours per week. Pay scales with hours; long hours increase stress.', noTime); content += option('raise', '💵', 'Request a raise', state.lastRaiseRequest === state.age ? 'Already requested this year.' : 'Approval depends on performance. Repeated rejected requests can lead to dismissal.', noTime || state.lastRaiseRequest === state.age); content += option('work', '⭐', 'Work harder', 'Gain 20 performance; lose 4 happiness. Promotions bring a 15% raise.', noTime); content += option('quit', '🚪', 'Quit your job', 'Leave your current position after confirmation; career pension records reset.', noTime); if (state.age >= 65) content += option('retire', '🌅', 'Retire', state.pensionPolicy === 'career' ? `Career pension: ${state.workYears} years in this job; ten years required. Based on your five highest recorded salaries.` : 'Leave work and receive 30% of your salary as annual pension.', noTime || (state.pensionPolicy === 'career' && state.workYears < 10)); }
      }
    } else if (type === 'assets') {
      content = header('◇', 'THE LITTLE THINGS', 'Assets', `Your balance is ${money(state.balance)}. Spend wisely!${timeNote}`);
      content += option('life-statistics', '📊', 'Life statistics', 'Review education, career, health and finances without using a moment.');
      content += option('financial-overview', '🧮', 'Financial overview', 'See assets, debts, estimated annual expenses, tax and net worth.', false);
      content += `<div class="empty-state">${state.assets.length ? 'You own: ' + state.assets.map(esc).join(', ') + '.' : 'Nothing here yet. Your collection starts with a single little thing.'}</div>`;
      content += `<div class="progress-card">📊 <strong>Investment fund: ${money(state.investment)}</strong><br>Its value changes by −12% to +18% each year. You can lose money.</div>`;
      if (state.studentLoan) { content += `<div class="progress-card">🎓 <strong>Student loan: ${money(state.studentLoan)}</strong><br>Up to $1,000 is automatically repaid each year from available cash. There is no interest.</div>`; content += option('loan-pay', '💳', 'Make an extra student loan payment', `Pay up to $1,000 now.`, noTime || state.balance <= 0); }
      content += `<div class="progress-card">🏦 <strong>Savings: ${money(state.savings)} · Loan debt: ${money(state.debt)}</strong><br>Savings earn 10% per year; loan debt grows 20% per year. Up to 10% of debt is repaid from cash each year.</div>`;
      content += option('bank-custom', '🏦', 'Custom bank transaction', 'Deposit, withdraw, borrow or repay a chosen whole-dollar amount.', noTime || state.age < 18);
      content += option('bank-deposit', '⬇️', 'Deposit $1,000', 'Move cash to savings. Available at 18.', noTime || state.age < 18 || state.balance < 1000 || state.savings > 999999999000);
      if (state.savings) content += option('bank-withdraw', '⬆️', 'Withdraw savings', 'Withdraw up to $1,000 from savings.', noTime || state.age < 18 || state.balance > 999999999000);
      if (state.debt > 2 * (state.balance + state.savings)) content += option('bankruptcy', '⚠️', 'Declare bankruptcy', 'Clear bank debt but lose your cash, savings, investments, possessions, and job. Student loans remain.', noTime || state.age < 18);
      content += option('bank-borrow', '💳', 'Borrow $5,000', 'Borrow cash at 20% annual interest. Available at 18.', noTime || state.age < 18 || state.balance > 999999995000 || state.debt > 999999995000);
      if (state.debt) content += option('bank-repay', '💵', 'Pay loan debt', 'Repay up to $1,000 now.', noTime || state.age < 18 || state.balance <= 0);
      content += option('market', '🏦', 'Funds, stocks, metals & crypto', 'Trade named funds, stocks, metals and crypto. Some prices may fall sharply.', state.age < 18);
      content += option('invest', '📈', 'Invest $5,000', 'Buy into the fund. Available at 18.', noTime || state.age < 18 || state.balance < 5000 || state.investment > BANK_LIMIT - 5000);
      if (state.investment) content += option('withdraw', '💵', 'Sell investments', `Move ${money(state.investment)} back to your balance. Cash limit ${money(BANK_LIMIT)}.`, noTime || state.balance + state.investment > BANK_LIMIT);
      content += option('tax-rules', '🧾', 'Income tax rules', `Current game rule: ${state.taxPolicy === 'flat' ? '20% flat' : 'progressive brackets'}. Change without using a moment.`, state.age < 18);
      content += option('will', '📜', 'Last will', `Current plan: ${esc(willDescription(state))}. Change who receives your estate.`, noTime || state.age < 18);
      content += option('shopping', '🛍️', 'More property & vehicles', 'Browse car models, boats, planes, and houses.', state.age < 18);
      for (const [key, [name, cost, icon]] of Object.entries(items).filter(([key]) => ['bike', 'car', 'house'].includes(key))) {
        const owned = state.assets.includes(name);
        content += owned ? option(`sell-${key}`, icon, `Sell ${esc(name.toLowerCase())}`, `Sell for ${money(state.assetValues[name])}. Cash limit ${money(BANK_LIMIT)}.`, noTime || state.balance + state.assetValues[name] > BANK_LIMIT) : option(key, icon, `Buy a ${esc(name.toLowerCase())}`, `${money(cost)}${key !== 'bike' ? ' · Available at 18' : ''}${key === 'house' ? ' · Reduces annual living costs' : ''}${key === 'car' ? ' · License required' : ''}`, noTime || state.balance < cost || (key !== 'bike' && state.age < 18) || (key === 'car' && !state.license));
      }
    } else if (type === 'legacy') {
      showLegacy(); return;
    } else if (type === 'milestones') {
      content = header('🏅', 'YOUR LITTLE VICTORIES', 'Milestones', `${state.milestones.length} of ${milestones.length} unlocked. Every life has its own path.`);
      content += option('life-statistics', '📊', 'Life statistics', 'Review education, career, health and finances without using a moment.');
      content += milestones.map(b => `<div class="milestone-row ${state.milestones.includes(b.id) ? '' : 'locked'}"><span class="badge">${b.icon}</span><span><strong>${esc(b.name)}</strong><small>${esc(b.detail)}</small></span><span class="milestone-status">${state.milestones.includes(b.id) ? '✓ UNLOCKED' : 'LOCKED'}</span></div>`).join('');
    }
    modal(content);
  }
  // OpenLife's will choices adapted to playable generations.
  // Career pension formula adapted from Life-Simulator1.
  const BANK_LIMIT = 1000000000000;
  function creditCash(amount) {
    const credited = Math.min(amount, BANK_LIMIT - state.balance);
    state.balance += credited;
    if (credited < amount) log(`My cash reached the game's ${money(BANK_LIMIT)} limit; ${money(amount - credited)} could not be added.`);
    return credited;
  }
  function bankTransactionLimit(kind) {
    if (kind === 'deposit') return Math.min(state.balance, BANK_LIMIT - state.savings);
    if (kind === 'withdraw') return Math.min(state.savings, BANK_LIMIT - state.balance);
    if (kind === 'borrow') return Math.min(BANK_LIMIT - state.balance, BANK_LIMIT - state.debt);
    if (kind === 'repay') return Math.min(state.balance, state.debt);
    return 0;
  }
  function customBankPanel() {
    const entries = [['deposit', 'Deposit into savings'], ['withdraw', 'Withdraw savings'], ['borrow', 'Borrow from the bank'], ['repay', 'Repay bank debt']];
    modal(header('🏦', 'YOUR MONEY', 'Custom bank transaction', `Cash ${money(state.balance)} · Savings ${money(state.savings)} · Bank debt ${money(state.debt)}. Each transaction costs one moment. Borrowed money accrues 20% annual interest.`) + `<form id="bank-form"><label class="form-label" for="bank-kind">TRANSACTION</label><select class="form-input" id="bank-kind">${entries.map(([value,label]) => `<option value="${value}">${label} (up to ${money(bankTransactionLimit(value))})</option>`).join('')}</select><label class="form-label" for="bank-amount">AMOUNT IN WHOLE DOLLARS</label><input class="form-input" id="bank-amount" type="number" min="1" max="${BANK_LIMIT}" step="1" required><p id="bank-error" class="data-error" role="alert"></p><button class="modal-primary" type="submit">Complete transaction</button></form>`);
  }
  function annualLivingCosts(s) {
    if (!s.alive || s.age < 19 || s.prisonYears) return 0;
    const dependents = s.childBirthAges.filter(birth => birth !== null && s.age - birth < 18).length;
    const hasHome = s.assets.some(name => Object.values(items).some(item => item[0] === name && item[3] === 'house'));
    return (hasHome ? 8000 : 12000) + dependents * 2000 + (s.pet ? 500 : 0) + diets[s.diet].cost;
  }
  function financialOverview() {
    const earnings = !state.alive || state.prisonYears ? 0 : state.job ? Math.round(state.income * state.jobHours / 40) : state.income;
    const tax = state.alive && state.age >= 19 && !state.prisonYears ? salaryTax(earnings,state.taxPolicy) : 0;
    const expenses = annualLivingCosts(state);
    const property = Object.values(state.assetValues).reduce((sum,value) => sum + value,0);
    const investments = state.investment + portfolioValue(state);
    const net = state.balance + state.savings + investments + property - state.debt - state.studentLoan;
    const rows = [['Cash', state.balance], ['Savings', state.savings], ['Investments', investments], ['Possessions resale value', property], ['Bank debt', -state.debt], ['Student loan', -state.studentLoan], ['Net worth', net], ['Annual salary or pension', earnings], ['Estimated income tax', -tax], ['Estimated living costs', -expenses], ['Estimated annual cash flow', earnings - tax - expenses]];
    const details = rows.map(([label,value]) => `<div class="milestone-row"><span><strong>${esc(label)}</strong></span><span>${money(value)}</span></div>`).join('');
    modal(header('🧮', 'MONEY AT A GLANCE', 'Financial overview', 'Estimates use current income, hours, tax rules, diet, home, dependents and pet. They exclude market changes, interest, loan repayments and future changes. This is a game estimate, not financial advice.') + details);
  }
  // OpenLife's statistics screen adapted to Little Life's data model.
  function lifeStatistics() {
    const conditions = currentConditions().map(condition => condition.name);
    const degree = state.major === 'legacy' ? 'University degree (older save)' : majors[state.major] || 'None';
    const education = state.studying ? `${state.education}; studying ${majors[state.studyMajor] || 'university'}` : state.education;
    const net = state.balance + state.savings + state.investment + portfolioValue(state) + Object.values(state.assetValues).reduce((sum,value) => sum + value,0) - state.debt - state.studentLoan;
    const salary = !state.alive || state.prisonYears ? 0 : state.job ? Math.round(state.income * state.jobHours / 40) : state.income;
    const rows = [['Age', `${state.age} years`], ['Generation', String(state.generation)], ['Occupation', occupation()], ['Education', education], ['Degree', degree], ['Salary or pension', `${money(salary)} per year`], ['Net worth', money(net)], ['Conditions', conditions.length ? conditions.join(', ') : 'None'], ['Happiness', `${state.stats.happiness}%`], ['Health', `${state.stats.health}%`], ['Smarts', `${state.stats.smarts}%`], ['Looks', `${state.stats.looks}%`], ['Karma', `${state.karma}%`], ['Stress', `${state.stress}%`]];
    modal(header('📊', 'AT A GLANCE', 'Life statistics', 'A snapshot of this life. Net worth includes possessions at resale value and subtracts bank and student debt.') + rows.map(([label,value]) => `<div class="milestone-row"><span><strong>${esc(label)}</strong></span><span>${esc(value)}</span></div>`).join('') + option('financial-overview', '🧮', 'Financial overview', 'See the calculation and estimated annual flow.'));
  }
  function pensionAmount(s) {
    if (s.pensionPolicy === 'flat') return Math.round(s.income * .3);
    const top = [...s.salaryHistory].sort((a, b) => b - a).slice(0, 5);
    return top.length ? Math.round(top.reduce((sum, value) => sum + value, 0) / top.length * Math.min(s.workYears, 35) * .02) : 0;
  }
  function pensionPanel() {
    let content = header('🌅', 'GAME SETTINGS', 'Pension rules', `Choose a retirement rule for this simulation. You have ${state.workYears} recorded years in your ${state.job ? 'current' : 'last'} job. These fictional rules are not financial advice.`);
    content += option('pension-flat', '⚖️', 'Flat pension', 'At age 65, retire for 30% of your final salary.', state.pensionPolicy === 'flat');
    content += option('pension-career', '📈', 'Career-based pension', 'From age 65 with ten recorded years: average of your highest five annual salaries, multiplied by 2% per year (maximum 35 years). From age 70, forced retirement is possible.', state.pensionPolicy === 'career');
    modal(content);
  }
  function taxPanel() {
    let content = header('🧾', 'GAME SETTINGS', 'Income tax rules', 'Choose how annual salary and pension tax is calculated in this simulation. These fictional rules are not tax advice. Your choice follows the family into future generations.');
    content += option('tax-flat', '⚖️', 'Flat tax', '20% of annual salary or pension, preserving the original game rule.', state.taxPolicy === 'flat');
    content += option('tax-progressive', '📊', 'Progressive brackets', 'Use Life-Simulator1’s 10–37% marginal brackets.', state.taxPolicy === 'progressive');
    modal(content);
  }
  function willDescription(s) {
    if (s.will.mode === 'equal') return 'divide equally among children and spouse';
    if (s.will.mode === 'child') return `everything to ${s.children[s.will.child] || 'the chosen child'}`;
    if (s.will.mode === 'spouse') return 'everything to your spouse';
    if (s.will.mode === 'charity') return 'everything to charity';
    return 'everything to the child you continue as';
  }
  function willPanel() {
    let content = header('📜', 'FOR THE FUTURE', 'Last will', `Current plan: ${esc(willDescription(state))}. Changing your will costs one moment. Bank debt follows the same shares; student loans are not inherited.`);
    content += option('will-set-legacy', '🌱', 'Playable heir', 'Leave everything to the child you choose to continue as.', state.moments <= 0 || state.will.mode === 'legacy');
    content += option('will-set-equal', '⚖️', 'Divide equally', 'Divide cash, savings, bank debt and investments among children and your spouse. Individual items go to beneficiaries in order.', state.moments <= 0 || !state.children.length || state.will.mode === 'equal');
    content += option('will-set-spouse', '💍', 'Leave everything to spouse', 'Your playable child will not receive the estate.', state.moments <= 0 || !state.married || !state.partner || state.will.mode === 'spouse');
    content += option('will-set-charity', '💚', 'Leave everything to charity', 'Your playable child will start without the estate or bank debt.', state.moments <= 0 || state.will.mode === 'charity');
    state.children.forEach((name, i) => { content += option(`will-child-${i}`, '🧸', `Leave everything to ${esc(name)}`, 'Other children can still be played, but will not inherit the estate.', state.moments <= 0 || (state.will.mode === 'child' && state.will.child === i)); });
    modal(content);
  }
  function inheritanceShare(old, childIndex) {
    let mode = old.will.mode;
    if (mode === 'spouse' && (!old.partner || !old.married)) mode = 'legacy';
    const count = old.children.length + (old.partner && old.married ? 1 : 0);
    const total = mode === 'legacy' || (mode === 'child' && old.will.child === childIndex);
    const split = value => total ? value : mode === 'equal' && count ? Math.floor(value / count) + (childIndex < value % count ? 1 : 0) : 0;
    const assets = old.assets.filter((_, i) => total || (mode === 'equal' && count && i % count === childIndex));
    return {balance: split(old.balance), savings: split(old.savings), debt: split(old.debt), investment: split(old.investment), portfolio: old.portfolio.map(h => ({price:h.price, units:split(h.units)})), assets, assetValues:Object.fromEntries(assets.map(name => [name, old.assetValues[name]]))};
  }
  const movieGenres = { family: ['Children’s films', 'MOVIES_CHILD', 8], classics: ['Film collection', 'MOVIES', 18], christmas: ['Holiday films', 'MOVIES_CHRISTMAS', 18], adult: ['Adult films', 'MOVIES_ADULT', 18], animated: ['Animated', 'MOVIES_ANIMATED', 8], comedy: ['Comedy', 'MOVIES_COMEDY', 13], fantasy: ['Fantasy', 'MOVIES_FANTASY', 13], musical: ['Musical', 'MOVIES_MUSICAL', 13], scifi: ['Science fiction', 'MOVIES_SCI_FI', 13], horror: ['Horror', 'MOVIES_HORROR', 18] };
  function moviesPanel(genre = '') {
    const cost = state.age < 18 ? 0 : 20;
    let content = header('🎬', 'MOVIE NIGHT', genre ? movieGenres[genre][0] : 'Watch a movie', `Choose a film. ${cost ? 'Tickets cost $20.' : 'Family covers the ticket.'} Watching costs one moment.`);
    if (!genre) for (const [key, [label, , minAge]] of Object.entries(movieGenres)) content += option(`movie-genre-${key}`, '🎞️', label, `Available from age ${minAge}.`, state.age < minAge);
    else { content += option('movies', '↩️', 'All genres', 'Choose another genre.'); (catalog[movieGenres[genre][1]] || []).forEach((title, index) => { if (title) content += option(`movie-watch-${genre}-${index}`, '🎥', esc(title), cost ? '$20 · Watch this film' : 'Free · Watch this film', state.moments <= 0 || state.balance < cost); }); }
    modal(content);
  }
  // Life-Simulator1 and OpenLife both support more than one condition at a time.
  function removeCondition(index) {
    if (index === 0) { const next = state.additionalIllnesses.shift(); state.illness = next ? next.name : null; state.illnessSince = next ? next.since : null; }
    else state.additionalIllnesses.splice(index - 1, 1);
  }
  function currentConditions() { return state.illness ? [{name: state.illness, since: state.illnessSince}, ...state.additionalIllnesses] : []; }
  function doctorPanel() {
    const cost = state.age < 18 ? 0 : 500;
    let content = header('🩺', 'TAKE CARE', 'Choose a condition', `Treat one condition per visit. ${cost ? 'Each visit costs $500.' : 'Family covers the cost.'} Some chronic conditions need repeated treatment.`);
    currentConditions().forEach((condition, i) => { content += option(`doctor-treat-${i}`, '🩺', esc(condition.name), cost ? 'Treatment: $500' : 'Treatment: free', state.moments <= 0 || state.balance < cost); });
    modal(content);
  }
  function treatCondition(index) {
    const condition = currentConditions()[index]; if (!condition) return false;
    const cost = state.age < 18 ? 0 : 500; if (state.balance < cost) return false;
    state.balance -= cost;
    const chance = condition.name === 'cancer' ? .05 : condition.name === 'depression' ? (state.stats.happiness >= 25 ? .25 : 0) : condition.name === 'high blood pressure' ? (state.stress < 60 ? .33 : 0) : condition.name === 'anxiety' ? .25 : condition.name === 'loneliness' ? .5 : 1;
    if (chance === 1 || Math.random() < chance) { log(`I visited the doctor and was treated for ${condition.name}. I recovered.`); removeCondition(index); }
    else log(`I was treated for ${condition.name}, but the condition remains. I can try again.`);
    changeStats({health: 10}); return true;
  }
  function petPanel() {
    let content = header('🐾', 'A NEW FRIEND', 'Adopt a pet', 'Choose a companion. Adoption costs $500 and care costs $500 per year. Pets age and have finite lifespans.');
    for (const type of ['cat', 'dog', 'fish']) content += option(`pet-adopt-${type}`, type === 'cat' ? '🐈' : type === 'dog' ? '🐕' : '🐟', `Adopt a ${type}`, 'A random name and breed will be chosen.', state.moments <= 0 || state.balance < 500 || !!state.pet);
    modal(content);
  }
  function canBuyItem(key) {
    const item = items[key]; if (!item || state.assets.includes(item[0]) || state.balance < item[1] || (key !== 'bike' && state.age < 18)) return false;
    return item[3] === 'car' ? state.license : item[3] === 'boat' ? state.boatLicense : item[3] === 'plane' ? state.pilotLicense : true;
  }
  function shoppingPanel(category = '') {
    let content = header('🛍️', 'SOMETHING SPECIAL', category ? `${category[0].toUpperCase()}${category.slice(1)}s` : 'Property & vehicles', 'Choose what to buy or sell. Vehicles require the appropriate license; properties reduce yearly living costs. Sales start at 70% of purchase price; vehicles depreciate by 15% yearly.');
    if (!category) for (const [id, label] of [['car','Cars'], ['boat','Boats'], ['plane','Planes'], ['house','Homes']]) content += option(`shop-${id}`, '🏷️', label, 'Browse the catalogue.');
    else { content += option('shopping', '↩️', 'All categories', 'Return to the property and vehicle categories.');
      for (const [key, [name, cost, icon, kind]] of Object.entries(items)) if (kind === category && !['car', 'house'].includes(key)) { const owned = state.assets.includes(name); content += owned ? option(`sell-${key}`, icon, `Sell ${esc(name)}`, `Sell for ${money(state.assetValues[name])}. Cash limit ${money(BANK_LIMIT)}.`, state.moments <= 0 || state.balance + state.assetValues[name] > BANK_LIMIT) : option(key, icon, `Buy ${esc(name)}`, `${money(cost)}${kind === 'house' ? ' · Reduces living costs' : ` · ${kind} license required`}`, state.moments <= 0 || !canBuyItem(key)); }
    }
    modal(content);
  }
  function marketPanel() {
    let content = header('🏦', 'MARKETPLACE', 'Funds, stocks, metals & crypto', `Balance ${money(state.balance)}. Prices change every year, and you can lose money. Each trade buys or sells one unit and costs one moment.`);
    content += option('market-custom', '🔢', 'Trade multiple units', 'Choose an asset and a whole number of units to buy or sell.', state.moments <= 0);
    for (const category of ['fund', 'stock', 'metal', 'crypto']) {
      content += `<div class="eyebrow market-heading">${category === 'fund' ? 'INDEX FUNDS' : category === 'stock' ? 'STOCKS' : category === 'metal' ? 'METALS' : 'CRYPTO'}</div>`;
      markets.forEach(([name, type], i) => { if (type !== category) return; const holding = state.portfolio[i]; content += `<div class="progress-card"><strong>${esc(name)}</strong> · ${money(holding.price)}/unit · Owned ${holding.units} · Value ${money(holding.price * holding.units)}</div>`; content += option(`market-buy-${i}`, '＋', `Buy ${esc(name)}`, 'Buy one unit at the current price.', state.moments <= 0 || state.balance < holding.price || holding.units >= 100000); if (holding.units) content += option(`market-sell-${i}`, '−', `Sell ${esc(name)}`, 'Sell one unit at the current price.', state.moments <= 0 || state.balance + holding.price > 1000000000000); });
    }
    modal(content);
  }
  function customMarketPanel() {
    const choices = markets.map(([name], index) => `<option value="${index}">${esc(name)} · ${money(state.portfolio[index].price)}/unit · owned ${state.portfolio[index].units}</option>`).join('');
    modal(header('📊', 'MARKETPLACE', 'Trade multiple units', `Choose a fund or asset and the number of units. Current cash: ${money(state.balance)}. Every trade costs one moment and prices can fall.`) + `<form id="market-form"><label class="form-label" for="market-asset">ASSET</label><select class="form-input" id="market-asset">${choices}</select><label class="form-label" for="market-direction">TRANSACTION</label><select class="form-input" id="market-direction"><option value="buy">Buy</option><option value="sell">Sell</option></select><label class="form-label" for="market-units">WHOLE UNITS</label><input class="form-input" id="market-units" type="number" min="1" max="100000" step="1" required><p id="market-error" class="data-error" role="alert"></p><button class="modal-primary" type="submit">Complete trade</button></form>`);
  }
  function hobbiesPanel() {
    const noTime = state.moments <= 0;
    let content = header('🎨', 'PRACTICE MAKES PROGRESS', 'Hobbies & skills', 'Each practice costs one moment. Reach level 3 in music or fitness to unlock a related career.');
    content += `<div class="skill-grid">${Object.entries(skills).map(([key, [icon, name]]) => `<div>${icon} ${name}<strong>Level ${state.skills[key]}/5</strong></div>`).join('')}</div>`;
    for (const [key, [icon, name]] of Object.entries(skills)) content += option(`practice-${key}`, icon, `Practice ${name.toLowerCase()}`, state.skills[key] >= 5 ? 'You have mastered this hobby!' : `Level ${state.skills[key]} → ${state.skills[key] + 1} · Boosts happiness${key === 'fitness' ? ' and health' : ''}.`, noTime || state.skills[key] >= 5);
    modal(content);
  }
  // Relationship interactions and dialogue adapted from Life-Simulator1 and OpenLife (MIT).
  function removePartner(divorce = true) {
    if (divorce && state.partner && state.married && state.balance > 0) { const amount = Math.round(state.balance * (.4 + Math.random() * .2)); state.balance -= amount; log(`A divorce settlement paid ${money(amount)} to ${state.partner}.`); changeStats({happiness:-10}); }
    // A later partner with the same name is not the child's other parent.
    for (const profile of Object.values(state.childProfiles)) if (profile?.coParentCurrent) profile.coParentCurrent = false;
    if (state.pregnancy?.coParentCurrent) state.pregnancy.coParentCurrent = false;
    state.partner = null; state.partnerDetails = null; state.married = false; state.engaged = false; state.lastVows = null; state.vowRejectedAt = null; state.proposalRejectedAt = null; state.socialVisits = state.socialVisits.filter(ref => ref !== 'partner-0'); state.socialConversations = state.socialConversations.filter(ref => ref !== 'partner-0'); state.socialCompliments = state.socialCompliments.filter(ref => ref !== 'partner-0');
    if (state.will.mode === 'spouse') { state.will = {mode:'legacy', child:null}; log('My will now leaves the estate to my playable heir.'); }
  }
  // Children have independent lives, as in Life-Simulator1. Old saves without
  // profiles keep their original behavior rather than inventing past details.
  function newChildProfile(adopted = false, assessment = null, coParent = null, coParentCurrent = false) {
    return {adopted, happinessTotal:0, happinessYears:0, workYears:0, salaryHistory:[], studentLoan:0, happiness: random(50, 100), health: random(80, 100), smarts: assessment ? assessment.smarts : random(0, 50) + random(0, 50), looks: assessment ? assessment.looks : random(0, 50) + random(0, 50), education: 'None', studyStarted: null, job: '', income: 0, balance: 0, partner: null, partnerDesire:random(0,100), coParent, coParentCurrent};
  }
  function addChild(name, birthAge, profile) {
    const index = state.children.length;
    state.children.push(name); state.childBirthAges.push(birthAge); state.childBonds.push(65); state.childProfiles[index] = profile;
  }
  // Rare accidental deaths in Life-Simulator1 can affect any known-age relation.
  function suddenRelationDeath(age) { return age >= 6 && Math.random() > 1 - 1 / 1400; }
  function suddenDeathReason(age) {
    const reasons = ['a tree falling on their home', 'a fall into a well', 'a crocodile attack', 'a spider bite', 'a lightning strike', 'a tornado', 'a flood', 'a fall from a cliff', 'a pedestrian road accident', 'a train accident', 'a landslide', 'an aviation accident', 'carbon monoxide poisoning', 'a fireworks accident', 'a house fire', 'a snake bite', 'a hippopotamus attack', 'smoke from a forest fire', 'a car crash'];
    if (age >= 16) reasons.push('a distracted driving accident');
    return pick(reasons);
  }
  // Living children use compact indices throughout the UI and wills. On a death,
  // preserve a memorial and reindex every surviving child and beneficiary.
  function loseChild(index, age, sudden, wasInPrison) {
    const name = state.children[index];
    if (state.lostChildren.length < 400) state.lostChildren.push({name, age, atAge:state.age});
    log(`${name}, my child, ${sudden ? 'passed away suddenly' : 'passed away'} at age ${age}.${sudden ? ` The cause was ${suddenDeathReason(age)}.` : ''}`);
    changeStats({happiness: hasTrait('thanatophobia') ? -35 : -30});
    state.funeralQueue.push({name, relationship:'child', canAttend:!wasInPrison});
    state.children.splice(index,1); state.childBirthAges.splice(index,1); state.childBonds.splice(index,1);
    state.childProfiles = Object.fromEntries(Object.entries(state.childProfiles).filter(([key]) => Number(key) !== index).map(([key, value]) => [String(Number(key) > index ? Number(key) - 1 : Number(key)), value]));
    if (state.will.mode === 'child') {
      if (state.will.child === index) { state.will = {mode:'legacy', child:null}; log('My will now leaves the estate to my playable heir.'); }
      else if (state.will.child > index) state.will.child--;
    }
  }
  function childMortality(wasInPrison) {
    for (let index = state.children.length - 1; index >= 0; index--) {
      const age = childAge(index), profile = state.childProfiles[index]; if (age === null) continue;
      const sudden = suddenRelationDeath(age);
      let oldAge = false;
      if (!sudden && profile && age > 70) {
        const wellness = profile.happiness + Math.trunc((profile.health - profile.happiness) / 3);
        oldAge = (age >= random(98,122) || age > random(70 + Math.floor(wellness / 11), 90 + Math.floor(wellness / 3))) && Math.random() < .65;
      }
      if (sudden || oldAge) loseChild(index, age, sudden, wasInPrison);
    }
  }
  function ageChildren() {
    state.children.forEach((name, index) => {
      const profile = state.childProfiles[index], age = childAge(index);
      if (!profile || age === null) return;
      if (age > 0) { profile.happinessTotal += profile.happiness; profile.happinessYears++; }
      if (Math.random() < .5) { if (profile.happiness < 46) profile.happiness = clamp(profile.happiness + random(0,4)); else if (profile.happiness > 54) profile.happiness = clamp(profile.happiness - random(0,3)); }
      if (age === 6 || age === 12 || age === 14) { profile.smarts = clamp(profile.smarts + random(0, age === 6 ? 2 : age === 12 ? 3 : 4)); log(`${name}, my child, started ${age === 6 ? 'elementary' : age === 12 ? 'middle' : 'high'} school.`); }
      if (age === 18 && profile.education === 'None') {
        profile.education = 'High school'; profile.smarts = clamp(profile.smarts + random(5,10)); profile.happiness = clamp(profile.happiness + random(5,10)); log(`${name}, my child, graduated from high school.`);
        if (profile.smarts >= random(35, 45) && Math.random() < .75) { profile.studyStarted = age; profile.studentLoan = profile.smarts >= 85 ? 2500 : 5000; log(`${name} started university with a ${money(profile.studentLoan)} student loan.`); }
      }
      if (profile.studyStarted !== null && age - profile.studyStarted >= 4) { profile.studyStarted = null; profile.education = 'University'; profile.smarts = clamp(profile.smarts + random(6, 12)); profile.happiness = clamp(profile.happiness + random(8, 14)); log(`${name} graduated from university.`); }
      if (age >= 18 && !profile.job && profile.studyStarted === null && Math.random() < 1 / 3) { profile.job = profile.education === 'University' ? 'Office assistant' : 'Barista'; profile.income = profile.job === 'Barista' ? 28000 : 35000; log(`${name} started a job as a ${profile.job.toLowerCase()}.`); }
      if (profile.job) { profile.balance = Math.min(BANK_LIMIT, profile.balance + Math.max(0, profile.income - salaryTax(profile.income, state.taxPolicy) - 12000)); profile.workYears = Math.min(100, profile.workYears + 1); profile.salaryHistory.push(profile.income); profile.salaryHistory = profile.salaryHistory.slice(-100); }
      if (profile.studyStarted === null && profile.studentLoan && profile.balance) { const payment = Math.min(1000, profile.studentLoan, profile.balance); profile.studentLoan -= payment; profile.balance -= payment; log(`${name} paid ${money(payment)} toward their student loan${profile.studentLoan ? `; ${money(profile.studentLoan)} remains` : ', paying it off'}.`); }
      let partnerDied = false;
      if (profile.partner?.details) {
        const details = profile.partner.details; details.age = Math.min(150, details.age + 1);
        if (details.yearsTogether !== undefined) details.yearsTogether++;
        if (details.endAge !== undefined && details.age >= details.endAge) { log(`${profile.partner.name}, ${name}'s ${profile.partner.married ? 'spouse' : 'partner'}, passed away at age ${details.age}.`); profile.partner = null; profile.happiness = clamp(profile.happiness - random(10,20)); partnerDied = true; }
      }
      if (age >= 18 && !profile.partner && !partnerDied && Math.random() < (profile.partnerDesire === undefined ? .08 : profile.partnerDesire / 700)) { const partner = pick(firstNames.filter(n => n !== name && !state.children.includes(n))); profile.partner = {name:partner, since:age, married:false, marriedAt:null, details:makePartnerDetails(age)}; log(`${name} is now in a relationship with ${partner}.`); }
      else if (profile.partner && (!profile.partner.married || profile.partner.mayDivorce !== false) && Math.random() < (profile.partner.married ? 1 / 45 : 1 / 15)) { const partner = profile.partner; profile.partner = null; profile.happiness = clamp(profile.happiness - random(5,20)); if (profile.partnerDesire !== undefined) { const floor = partner.married ? random(5,12) : random(10,15); if (profile.partnerDesire > floor) profile.partnerDesire = Math.max(floor, profile.partnerDesire - (partner.married ? random(3,10) : random(1,6))); } log(`${name} and ${partner.name} ${partner.married ? 'divorced' : 'broke up'}.`); }
      else if (profile.partner && !profile.partner.married && age - profile.partner.since >= 3 && Math.random() < .2) { profile.partner.married = true; profile.partner.marriedAt = age; if (profile.partnerDesire !== undefined) profile.partner.mayDivorce = Math.random() < .5; log(`${name} married ${profile.partner.name}.`); }
    });
  }
  function beginDating(candidate) {
    state.partner = candidate.name;
    state.partnerDetails = {age:candidate.age, smarts:candidate.smarts, looks:candidate.looks, craziness:candidate.craziness, willpower:candidate.willpower, ...(candidate.endAge === undefined ? {} : {endAge:candidate.endAge}), ...(candidate.yearsTogether === undefined ? {} : {yearsTogether:0}), ...(candidate.fertility === undefined ? {} : {fertility:candidate.fertility})};
    state.partnerBond = 50; state.dateCandidate = null;
  }
  function datePanel() {
    const c = state.dateCandidate; if (!c) return;
    modal(header('💘', 'A NEW CONNECTION', `Meet ${esc(c.name)}`, `Age ${c.age} · Smarts ${c.smarts}% · Looks ${c.looks}% · Craziness ${c.craziness}%. Their decision depends on compatibility with you.`) + option('date-ask', '💌', 'Ask them out', 'They may accept or decline; meeting already used a moment.') + option('date-decline', '↩️', 'Not my type', 'Politely pass on this introduction.'));
  }
  function makePartnerDetails(subjectAge) {
    const spread = Math.floor(subjectAge / 6), age = Math.max(18, subjectAge + random(-spread, spread));
    return {age, smarts:random(0,50) + random(0,50), looks:random(0,50) + random(0,50), craziness:random(0,100), willpower:random(0,60) + random(0,40), fertility:random(25,100), yearsTogether:0, endAge:Math.max(age + 1, random(72, 110))};
  }
  function makeDateCandidate() {
    return {name:pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && !state.friends.includes(n))), ...makePartnerDetails(state.age)};
  }
  function socialTargets() {
    let content = header('💌', 'PEOPLE IN YOUR LIFE', 'Choose a person', 'Compliment, talk, give a gift, or insult someone. Parents can also be asked for money.');
    state.parents.forEach((p, i) => { if (p.alive) content += option(`social-target-parent-${i}`, '👪', esc(p.name), `Parent · Bond ${p.bond}%`); });
    state.siblings.forEach((p, i) => { if (p.alive) content += option(`social-target-sibling-${i}`, '🧑', esc(p.name), `Sibling · Bond ${p.bond}%`); });
    state.children.forEach((name, i) => { content += option(`social-target-child-${i}`, '🧸', esc(name), `Child · Bond ${state.childBonds[i]}%`); });
    if (state.partner) content += option('social-target-partner-0', '♡', esc(state.partner), `Partner · Bond ${state.partnerBond}%`);
    if (state.friends.length) content += option('social-target-friend-0', '🤝', esc(state.friends[0]), `Friend · Bond ${state.friendBond}%`);
    modal(content);
  }
  function socialPerson(kind, index) {
    if (!Number.isInteger(index) || index < 0) return null;
    if (kind === 'parent' || kind === 'sibling') { const p = (kind === 'parent' ? state.parents : state.siblings)[index]; return p && p.alive ? {name: p.name, bond: p.bond, age: p.age} : null; }
    if (kind === 'child' && state.children[index]) return {name: state.children[index], bond: state.childBonds[index], age: childAge(index)};
    if (kind === 'partner' && index === 0 && state.partner) return {name: state.partner, bond: state.partnerBond, age: null};
    if (kind === 'friend' && index === 0 && state.friends.length) return {name: state.friends[0], bond: state.friendBond, age: null};
    return null;
  }
  function changeBond(kind, index, amount) {
    if (kind === 'parent') state.parents[index].bond = clamp(state.parents[index].bond + amount);
    else if (kind === 'sibling') state.siblings[index].bond = clamp(state.siblings[index].bond + amount);
    else if (kind === 'child') state.childBonds[index] = clamp(state.childBonds[index] + amount);
    else if (kind === 'partner') state.partnerBond = clamp(state.partnerBond + amount);
    else if (kind === 'friend') state.friendBond = clamp(state.friendBond + amount);
  }
  function converseWithPerson(kind, index, person, heart) {
    if (person.bond < 25) { log(`${person.name} was not interested in having a conversation.`); changeStats({happiness:-4}); return; }
    const ageTopics = state.age < 6 ? [catalog.CHATS_INFANT, catalog.TALKS_INFANT] : state.age < 13 ? [catalog.CHATS_CHILD, catalog.TALKS_CHILD, catalog.DISCUSSIONS_CHILD] : state.age < 18 ? [catalog.TALKS_TEEN, catalog.HEART_TO_HEARTS_TEEN] : [catalog.TALKS_ADULT];
    const lists = heart ? [catalog.HEART_TO_HEARTS, ...(state.age >= 13 && state.age < 18 ? [catalog.HEART_TO_HEARTS_TEEN] : [])] : [...ageTopics, ...(state.age >= 13 ? [catalog.DISCUSSIONS, catalog.TALKS, catalog.CHATS] : [])];
    const selected = pick(lists.filter(list => list && list.length)); const topic = selected ? pick(selected) : 'life';
    const description = heart ? 'had a heart-to-heart' : selected === catalog.TALKS ? 'talked' : selected === catalog.CHATS ? 'had a chat' : 'discussed';
    let agreement = Math.round(Math.sqrt(Math.random()) * 75 + Math.max(0, person.bond - 50) / 3);
    const sibling = kind === 'sibling' ? state.siblings[index] : null;
    if (sibling && Number.isInteger(sibling.petulance) && Math.random() < .5) agreement -= random(0, Math.floor(sibling.petulance / 3));
    agreement = clamp(agreement);
    log(description === 'discussed' ? `I discussed ${topic} with ${person.name}. Agreement: ${agreement}%.` : `I ${description} with ${person.name} about ${topic}. Agreement: ${agreement}%.`);
    const ref = `${kind}-${index}`;
    if (!state.socialConversations.includes(ref)) { state.socialConversations.push(ref); changeBond(kind, index, Math.round(agreement / 12)); changeStats({happiness: hasTrait('cheerful') ? 8 : 4}); }
    if (agreement < 15) { changeBond(kind, index, -random(2, 8)); changeStats({happiness:-4}); state.argumentTarget = {kind, index}; state.pending = ARGUMENT_EVENT; }
  }
  function socialPersonPanel(kind, index) {
    const person = socialPerson(kind, index); if (!person) return;
    const ref = `${kind}-${index}`;
    let content = header('💬', 'BETTER TOGETHER', esc(person.name), `Bond ${person.bond}%${person.age === null ? '' : ` · Age ${person.age}`}. Interactions take one moment.`);
    if (kind === 'sibling' && Number.isInteger(state.siblings[index].petulance)) { const sibling = state.siblings[index]; content += `<div class="progress-card">🧑 <strong>Sibling profile</strong><br>Smarts ${sibling.smarts}% · Looks ${sibling.looks}% · Petulance ${sibling.petulance}%<br>Petulance can reduce agreement in conversations.</div>`; }
    if (kind === 'parent' && Number.isInteger(state.parents[index].generosity)) { const parent = state.parents[index]; content += `<div class="progress-card">👪 <strong>Parent profile</strong><br>Generosity ${parent.generosity}% · Wealth rating ${parent.wealth}%<br>Wealth is a rating, not a cash balance; inheritance remains separate.</div>`; }
    if (kind === 'partner' && state.partnerDetails) { const p = state.partnerDetails; content += `<div class="progress-card">💘 <strong>Partner · Age ${p.age}</strong><br>Smarts ${p.smarts}% · Looks ${p.looks}% · Craziness ${p.craziness}% · Willpower ${p.willpower}%${p.yearsTogether === undefined ? '' : `<br>Years together: ${p.yearsTogether}`}${p.fertility === undefined ? '' : `<br>Game conception chance: ${p.fertility}% (not medical advice)`}</div>`; }
    const profile = kind === 'child' ? state.childProfiles[index] : null;
    if (profile) content += `<div class="progress-card">🧸 <strong>${profile.adopted ? 'Adopted child' : 'Child'} · ${esc(profile.education)}</strong><br>Happiness ${profile.happiness}% · Health ${profile.health}% · Smarts ${profile.smarts}% · Looks ${profile.looks}%<br>${profile.studyStarted !== null ? 'Studying at university' : profile.job ? `${esc(profile.job)} · ${money(profile.income)}/year` : 'No job'} · Own savings ${money(profile.balance)}${profile.studentLoan ? ` · Student loan ${money(profile.studentLoan)}` : ''}${profile.job ? ` · ${profile.workYears} recorded work years` : ''}${profile.partner ? ` · ${profile.partner.married ? 'Married to' : 'Dating'} ${esc(profile.partner.name)}` : ''}${profile.partnerDesire === undefined ? '' : `<br>Relationship interest: ${profile.partnerDesire}%`}</div>`;
    content += option(`social-do-visit-${ref}`, '🌳', 'Spend time together', state.socialVisits.includes(ref) ? 'Already spent time together this year; another visit has no stat benefit.' : 'Enjoy an outing together. Very low bonds may lead to a refusal.', state.moments <= 0 || state.age < 5 || (person.age !== null && person.age < 5));
    content += option(`social-do-talk-${ref}`, '💬', 'Discuss a topic', 'Discuss ideas. A low bond may lead to refusal; poor agreement can spark an argument.', state.moments <= 0 || (person.age !== null && person.age < 3));
    content += option(`social-do-heart-${ref}`, '💗', 'Heart-to-heart', 'Talk about something personal.', state.moments <= 0 || state.age < 13 || (person.age !== null && person.age < 13));
    content += option(`social-do-compliment-${ref}`, '🌟', 'Give a compliment', 'Appreciation varies. The first compliment per person each year builds bond and karma.', state.moments <= 0 || state.age < 6 || (person.age !== null && person.age < 5));
    content += option(`social-do-insult-${ref}`, '💢', 'Insult', 'Hurts your bond and karma, and may provoke a response.', state.moments <= 0 || (person.age !== null && person.age < 5));
    content += option(`social-do-gift-${ref}`, '🎁', 'Give a gift', 'Costs $100 and strengthens your bond.', state.moments <= 0 || state.balance < 100);
    if (kind === 'parent') content += option(`social-do-ask-${ref}`, '💵', 'Ask for money', state.parentAsks[index] !== null && state.age - state.parentAsks[index] < 3 ? `Ask again at age ${state.parentAsks[index] + 3}.` : Number.isInteger(state.parents[index].moneyRefusals) ? `Generosity and wealth affect the response and amount. A gift or three refusals starts a three-year cooldown; refusals: ${state.parents[index].moneyRefusals}/3.` : Number.isInteger(state.parents[index].generosity) ? 'Their generosity affects their response and their wealth rating affects the amount. Ask once every three years.' : 'Your bond affects the chance they agree. Ask once every three years.', state.moments <= 0 || state.age < 6 || (state.parentAsks[index] !== null && state.age - state.parentAsks[index] < 3));
    modal(content);
  }
  // Lottery, surgery and work-life systems adapted from Life-Simulator1 (MIT).
  const weddingVenues = [ ['Courthouse', 51], ["Family member's house", 255], ['Wedding chapel', 255], ['Restaurant', 5100], ['Vineyard', 15300], ['Country club', 15300] ];
  function weddingPanel() {
    let content = header('💒', 'A SPECIAL DAY', 'Plan your wedding', `Choose a place to marry ${esc(state.partner)}. Each venue uses one moment and has its own price.`);
    weddingVenues.forEach(([place, cost], i) => { content += option(`venue-${i}`, '💐', esc(place), `${money(cost)} · Bond must be at least 60%`, state.balance < cost || state.partnerBond < 60 || state.moments <= 0); });
    modal(content);
  }
  function lotteryPanel() {
    modal(header('🎟️', 'TRY YOUR LUCK', 'Lottery', `Jackpot: ${money(state.jackpot)}. Each ticket costs $4. Enter one or ten lines of four different numbers from 1 to 20. Match all four in any order to win. One moment per draw.`) + `<form id="lottery-form"><label class="form-label" for="lottery-numbers">NUMBERS, ONE TICKET PER LINE</label><textarea id="lottery-numbers" class="form-input lottery-input" rows="4" maxlength="250" placeholder="1 2 3 4" required></textarea><p id="lottery-error" class="data-error" role="alert"></p><button class="modal-primary" type="submit">Buy tickets and draw</button></form>`);
  }
  function surgeryPanel() {
    let content = header('✨', 'A BIG DECISION', 'Plastic surgery', 'Costs $25,000. A higher reputation reduces the chance of a botched procedure; complications can damage health, looks and happiness and may be fatal. Wait six years between procedures.');
    content += option('surgeon-0', '🩺', 'Dr. Brooks', 'Reputation: 55% · 9% complication risk', state.moments <= 0 || state.balance < 25000);
    content += option('surgeon-1', '🩺', 'Dr. Reed', 'Reputation: 85% · 3% complication risk', state.moments <= 0 || state.balance < 25000);
    modal(content);
  }
  function hoursPanel() {
    let content = header('⏰', 'WORK-LIFE BALANCE', 'Working hours', `Current schedule: ${state.jobHours} hours/week. Annual pay scales with hours; longer hours gradually increase performance and stress.`);
    for (const hours of [38, 40, 50, 60, 70]) content += option(`hours-${hours}`, '🗓️', `${hours} hours / week`, hours > 40 ? 'More pressure, more performance.' : 'A more manageable schedule.', state.moments <= 0 || state.jobHours === hours);
    content += `<form id="hours-form"><label class="form-label" for="hours-input">OR CHOOSE ANY WHOLE NUMBER FROM 38 TO 70</label><input class="form-input" id="hours-input" type="number" min="38" max="70" step="1" value="${state.jobHours}" required><p id="hours-error" class="data-error" role="alert"></p><button class="modal-primary" type="submit">Set hours</button></form>`;
    modal(content);
  }
  function booksPanel() {
    let content = header('📚', 'BETWEEN THE PAGES', 'Choose a book', 'Choose an age-appropriate book. Reading takes one moment; books can be revisited.');
    books.forEach((book, index) => { if (state.age >= book[3]) content += option(`book-${index}`, '📖', esc(book[0]), `${esc(book[1])} · ${book[2]} pages · Increases happiness and smarts`, state.moments <= 0); });
    if (!books.some(book => state.age >= book[3])) content += '<div class="empty-state">No books available at this age.</div>';
    modal(content);
  }
  function finishBook(book) {
    log(`I read ${book[0]} (${book[2]} pages).`);
    changeStats({happiness: Math.min(10, Math.ceil(book[4] / 12)) + (hasTrait('bookworm') ? 3 : 0), smarts: Math.min(10, Math.ceil(book[5] / 12)) + (hasTrait('nerd') ? 2 : 0)});
  }
  function readingPanel() {
    const progress = state.readingBook;
    if (!progress) {
      let content = header('📖', 'A LITTLE AT A TIME', 'Choose a book', 'Starting a book uses one moment. Read page by page or in batches; finish it to receive its benefits. You can return to it later or abandon it.');
      books.forEach((book,index) => { if (state.age >= book[3]) content += option(`reading-begin-${index}`, '📚', esc(book[0]), `${esc(book[1])} · ${book[2]} pages`, state.moments <= 0); });
      modal(content); return;
    }
    const book = books[progress.index]; if (!book) return;
    modal(header('📖', 'A LITTLE AT A TIME', esc(book[0]), `${esc(book[1])} · ${progress.pages} of ${book[2]} pages read. Finishing gives the same benefits as a quick read.`) + option('reading-page-1','📄','Read one page','Continue reading.') + option('reading-page-50','📚','Read up to 50 pages','Continue reading in a batch.') + option('reading-abandon','🚪','Abandon this book','Discard your progress without finishing.'));
  }
  function conversationPanel() {
    let content = header('💬', 'KEEP IN TOUCH', 'Have a conversation', 'Talk with someone close to you. Conversations improve your bond.');
    state.parents.forEach((p, i) => { if (p.alive) content += option(`chat-parent-${i}`, '👪', esc(p.name), `Parent · Bond ${p.bond}%`, state.moments <= 0); });
    state.siblings.forEach((p, i) => { if (p.alive) content += option(`chat-sibling-${i}`, '🧑', esc(p.name), `Sibling · Bond ${p.bond}%`, state.moments <= 0); });
    if (state.partner) content += option('chat-partner', '♡', esc(state.partner), `Partner · Bond ${state.partnerBond}%`, state.moments <= 0);
    if (state.friends.length) content += option('chat-friend', '🤝', esc(state.friends[0]), `Friend · Bond ${state.friendBond}%`, state.moments <= 0);
    modal(content);
  }
  function universityCost() { return state.stats.smarts >= 85 ? 2500 : 5000; }
  function universityPanel(showMore = false) {
    let content = header('🎓', 'CHOOSE YOUR PATH', 'University', `Choose a four-year degree. Tuition: ${money(universityCost())}${state.stats.smarts >= 85 ? ' with a merit discount for 85% smarts' : ' (85% smarts earns a merit discount)' }. Pay now, apply for a scholarship, ask a parent, or use a loan. Enrolling ends your job and pension.`);
    content += option(showMore ? 'core-majors' : 'more-majors', '📚', showMore ? 'Back to popular degrees' : 'More degrees', showMore ? 'Browse the five broad majors.' : 'Browse the full catalogue of additional degrees.');
    for (const [key, label] of Object.entries(majors).filter(([key]) => showMore !== coreMajors.includes(key))) {
      const disabled = state.moments <= 0 || state.studying || state.major === key;
      content += option(`major-${key}`, '📘', `${label} · pay tuition`, `Four years · Pay ${money(universityCost())} now`, disabled || state.balance < universityCost());
      content += option(`majorloan-${key}`, '🎓', `${label} · student loan`, `Borrow ${money(universityCost())}; repay up to $1,000/year after graduating or leaving.`, disabled);
      content += option(`majorparent-${key}`, '👪', `${label} · ask a parent`, 'Ask a living parent to cover tuition; acceptance depends on your bond.', disabled || !state.parents.some(parent => parent.alive));
      content += option(`majorscholar-${key}`, '🏅', `${label} · apply for a scholarship`, state.scholarshipAttempt === state.age ? 'Already applied this year.' : 'A successful application covers tuition; chance improves with smarts. One application per year.', disabled || state.scholarshipAttempt === state.age);
    }
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
    let content = header('🕵️', 'HIGH RISK, HIGH CONSEQUENCES', 'Crime', `Convictions: ${state.convictions}${state.convictions === 100 ? '+' : ''}. Getting caught costs your job and can lead to prison. Some careers require a clean record.`);
    for (const [key, crime] of Object.entries(crimes)) content += option(`offense-${key}`, crime.icon, crime.label, `${Math.round(crime.chance * 100)}% chance of success · ${money(crime.min)}–${money(crime.max)} · If caught: ${crime.sentence} year${crime.sentence === 1 ? '' : 's'} in prison and up to ${money(crime.fine)} fine.`, state.moments <= 0);
    modal(content);
  }
  function travelPanel() {
    let content = header('🌍', 'A CHANGE OF SCENERY', 'Move abroad', 'Moving costs $3,000. Your current job, university enrollment, and pension will end. Your possessions and relationships stay with you.');
    cities.forEach((city, index) => { if (city !== state.city) content += option(`move-${index}`, '📍', esc(city), 'Move here for $3,000.', state.moments <= 0 || state.balance < 3000); });
    if (countries.length) content += option('move-country-menu', '🌐', 'More countries', 'Choose from the country catalogue.', state.moments <= 0 || state.balance < 3000);
    modal(content);
  }
  function countryMovePanel() {
    const choices = countries.map((country,index) => `<option value="${index}" ${country === state.city ? 'disabled' : ''}>${esc(country)}</option>`).join('');
    modal(header('🌐', 'A CHANGE OF SCENERY', 'Choose a country', 'Moving costs $3,000 and ends your current job, studies and pension. Country names are locations only; they do not change local laws, currency or living costs.') + `<form id="country-move-form"><label class="form-label" for="country-move">DESTINATION</label><select class="form-input" id="country-move" required><option value="">Choose a country</option>${choices}</select><p id="country-move-error" class="data-error" role="alert"></p><button class="modal-primary" type="submit">Move to this country</button></form>`);
  }
  function moveTo(city) {
    if (!city || city === state.city || state.age < 18 || state.balance < 3000) return false;
    const previous = state.city; state.balance -= 3000; state.city = city; state.moves = Math.min(300, state.moves + 1); state.job = ''; state.income = 0; state.workYears = 0; state.salaryHistory = []; state.retired = false; state.studying = false; state.studyMajor = ''; log(`I moved from ${previous} to ${city} for a fresh start.`); changeStats({happiness: 5}); return true;
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
  // Dialogue and situations adapted from Life-Simulator1's random events (MIT).
  events.push(
    { min: 2, max: 2, when: s => s.parents.some(p => p.alive), icon: '💉', title: 'A visit to the doctor', text: '{{parent}} is taking you to the doctor for a vaccination. How will you behave?', choices: [
      {label: 'Try to stay calm', result: 'I remained calm during my vaccination.', stats: {happiness: 2}},
      {label: 'Throw a tantrum', result: 'I threw a tantrum at the doctor’s office.', parentBond: -8, stats: {happiness: -10}},
      {label: 'Bite my parent', result: 'I bit {{parent}} at the doctor’s office.', parentBond: -20, stats: {happiness: -5}}
    ]},
    { min: 18, max: 100, when: s => !!s.partner && s.partnerBond <= 35, icon: '💔', title: 'A relationship in trouble', text: '{{partner}} says they want to separate. What will you do?', choices: [
      {label: 'Wish them well', result: 'I wished {{partner}} the best as we separated.', endPartner: true, stats: {happiness: -12}},
      {label: 'Ask them to stay', result: 'I asked {{partner}} to stay and work things out.', reconcile: true, stats: {happiness: -5}},
      {label: 'Insult them one last time', result: 'I insulted {{partner}} as we separated.', endPartner: true, karma: -4, stats: {happiness: -12}}
    ]}
  );
  // Appended only: pending event indices in existing saves must stay stable.
  const ARGUMENT_EVENT = events.length;
  events.push({min:0, max:100, when: () => false, icon:'💬', title:'A disagreement', text:'A conversation turned into an argument. What will you do?', choices:[
    {label:'Apologize', result:'I apologized.', stats:{happiness:-3}, karma:2},
    {label:'Agree to disagree', result:'We agreed to disagree.', stats:{}},
    {label:'Insult them', result:'I insulted them.', stats:{}, karma:-4}
  ]});
  const KIDNAPPING_EVENT = events.length;
  events.push({min:18, max:100, when:s => !!s.partner && s.balance >= 1000000 && s.karma < 60 && Math.random() < 1 / 250, icon:'🚨', title:'A kidnapping', text:'Your partner has been kidnapped. The kidnappers demand a ransom and warn you not to involve the police. What will you do?', choices:[
    {label:'Pay the ransom', result:'I paid the ransom.', stats:{}},
    {label:'Involve the police', result:'I contacted the police.', stats:{}},
    {label:'Do nothing', result:'I did nothing.', stats:{}}
  ]});
  const LIGHTNING_EVENT = events.length;
  events.push({min:5, max:100, when: () => Math.random() < 1 / 5000, icon:'⚡', title:'Struck by lightning', text:'You were struck by lightning! What happens next?', choices:[{label:'See what happens', result:'Lightning struck.', stats:{}}]});
  const ASKED_OUT_EVENT = events.length;
  events.push({min:18, max:69, when:s => !s.partner && Math.random() < 1 / 16, icon:'💌', title:'An invitation to date', text:'Someone has asked you out. What will you do?', choices:[{label:'Start dating', result:'I accepted the invitation.', stats:{}}, {label:'Decline', result:'I declined the invitation.', stats:{}}]});
  // Family deaths can happen in the same year; resolve every memorial in order.
  const FUNERAL_EVENT = events.length;
  events.push({min:0, max:100, when:() => false, icon:'🕯️', title:'Remembering a loved one', text:'A loved one has passed away.', choices:[
    {label:'Attend the funeral', result:'I attended the funeral.', stats:{}},
    {label:'Do not attend', result:'I did not attend the funeral.', stats:{}}
  ]});
  const firstPerson = text => text.replace(/\bgave you\b/g, 'gave me').replace(/\byou were\b/g, 'I was').replace(/\bYou\b/g, 'I').replace(/\byou\b/g, 'I').replace(/\bYour\b/g, 'My').replace(/\byour\b/g, 'my');
  function expandStory(text) {
    return text.replace(/\{\{(partner|friend|child|city|parent)\}\}/g, (_, key) => ({ partner: state.partner || 'my partner', friend: state.friends[0] || 'my friend', child: state.children[0] || 'my child', city: state.city, parent: state.parents.find(p => p.alive)?.name || 'my parent' })[key]);
  }
  function ageUp() {
    if (!state.alive || state.pending !== null) return;
    // A restored life can already be 100 even though ordinary play ends at 100.
    if (state.age >= 100) { state.alive = false; state.deathCause = state.stats.health <= 0 ? 'poor-health' : 'old-age'; state.income = 0; state.job = ''; log('My life came to an end at age 100. What a journey it was.'); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; render(); showSummary(); return; }
    const focusBeforeAge = document.activeElement;
    const wasInPrison = state.prisonYears > 0;
    state.happinessTotal += state.stats.happiness; state.happinessYears++;
    state.age++; state.moments = MAX_MOMENTS; state.socialVisits = []; state.socialConversations = []; state.socialCompliments = []; state.dateCandidate = null;
    state.jackpot = random(100000, 1000000);
    let entry = pick(['A new year, a new chapter.', 'Another year of little moments and big possibilities.', 'Here’s to another trip around the sun.', 'I grew another year older.']);
    let icon = state.age < 5 ? '🧸' : state.age < 18 ? '🎒' : '🌱'; let tag = '';
    if (state.age === 5) { entry = 'I started school. There is so much to learn!'; tag = 'FIRST DAY'; icon = '🎒'; }
    if (state.age === 18) {
      if (!state.droppedOut && state.grades >= 40) { entry = 'I graduated high school and became an adult. The world is full of possibilities!'; state.education = 'High school'; }
      else { entry = 'I became an adult without a high-school diploma. I can earn a GED later.'; state.education = 'None'; }
      tag = 'A NEW CHAPTER'; icon = '🎉';
    }
    if (wasInPrison) { entry = 'I served another year of my sentence.'; icon = '⛓️'; tag = 'SERVING TIME'; }
    state.history.push({ age: state.age, icon, tag, entries: [entry] });
    if (wasInPrison) { state.prisonYears--; if (state.prisonYears === 0) log('I completed my sentence and was released.'); }
    if (state.pet && state.petInfo) { state.petInfo.age++; if (state.petInfo.age >= state.petInfo.endAge) { log(`${state.pet}, my ${state.petInfo.type}, passed away at age ${state.petInfo.age}.`); state.pet = null; state.petInfo = null; changeStats({happiness: -10}); } }
    if (state.pregnancy && state.age > state.pregnancy.started) {
      const {coParent, coParentCurrent} = state.pregnancy; state.pregnancy = null;
      if (Math.random() < .1) { log(`The pregnancy ended in miscarriage. ${coParent} and I lost the baby.`); changeStats({happiness: -20}); }
      else { const name = pick(firstNames.filter(n => !state.children.includes(n) && n !== coParent)); addChild(name, state.age, newChildProfile(false, null, coParent, coParentCurrent === true)); log(`${coParent} and I welcomed a child named ${name}.`); changeStats({happiness: 10}); }
    }
    ageChildren(); childMortality(wasInPrison);
    for (const parent of state.parents) {
      if (!parent.alive) continue;
      parent.age = Math.min(150, parent.age + 1); parent.bond = clamp(parent.bond - 2);
      const sudden = parent.age < parent.endAge && suddenRelationDeath(parent.age);
      if (parent.age >= parent.endAge || sudden) {
        parent.alive = false; state.funeralQueue.push({name:parent.name, relationship:'parent', canAttend:!wasInPrison}); const inheritance = parent.bond < 40 ? Math.floor(parent.inheritance / 2) : parent.inheritance; creditCash(inheritance);
        log(`${parent.name}, my parent, passed away at age ${parent.age}.${sudden ? ` The cause was ${suddenDeathReason(parent.age)}.` : ''} I inherited ${money(inheritance)}${parent.bond < 40 ? ' after we had grown apart' : ''}.`);
        changeStats({ happiness: (parent.bond < 40 ? -7 : -15) - (hasTrait('thanatophobia') ? 5 : 0) });
      }
    }
    for (const sibling of state.siblings) {
      if (!sibling.alive) continue; sibling.age = Math.min(150, sibling.age + 1); sibling.bond = clamp(sibling.bond - 1);
      const sudden = sibling.age < sibling.endAge && suddenRelationDeath(sibling.age);
      if (sibling.age >= sibling.endAge || sudden) { sibling.alive = false; state.funeralQueue.push({name:sibling.name, relationship:'sibling', canAttend:!wasInPrison}); log(`${sibling.name}, my sibling, passed away at age ${sibling.age}.${sudden ? ` The cause was ${suddenDeathReason(sibling.age)}.` : ''}`); changeStats({ happiness: hasTrait('thanatophobia') ? -15 : -10 }); }
    }
    if (!state.droppedOut && [6,12,14].includes(state.age)) { const stage = state.age === 6 ? 'elementary' : state.age === 12 ? 'middle' : 'high', bonus = state.age === 6 ? 2 : state.age === 12 ? 3 : 4; log(`I started ${stage} school.`); changeStats({smarts: random(1, bonus) + (hasTrait('genius') ? bonus : 0)}); }
    if (state.age >= 6 && state.age < 18 && !state.droppedOut) state.grades = clamp(state.grades - 1);
    if (hasTrait('thanatophobia') && state.age >= 13 && Math.random() < .1) { log('I felt anxious thinking about mortality.'); state.stress = clamp(state.stress + 5); changeStats({happiness: -5, health: -1}); }
    if (hasTrait('genius')) changeStats({ smarts: 1 });
    if (hasTrait('sickly')) changeStats({ health: -1 });
    if (hasTrait('wellkept')) changeStats({ looks: 1 });
    if (hasTrait('unkempt')) changeStats({ looks: -1 });
    if (state.job && hasTrait('fast')) state.careerPerformance = clamp(state.careerPerformance + 2);
    if (state.job && hasTrait('slow')) state.careerPerformance = clamp(state.careerPerformance - 2);
    if (state.partner) {
      if (state.partnerDetails) { state.partnerDetails.age = Math.min(150, state.partnerDetails.age + 1); if (state.partnerDetails.yearsTogether !== undefined) state.partnerDetails.yearsTogether++; }
      const partnerSudden = state.partnerDetails && (state.partnerDetails.endAge === undefined || state.partnerDetails.age < state.partnerDetails.endAge) && suddenRelationDeath(state.partnerDetails.age);
      if (state.partnerDetails && ((state.partnerDetails.endAge !== undefined && state.partnerDetails.age >= state.partnerDetails.endAge) || partnerSudden)) { state.funeralQueue.push({name:state.partner, relationship:state.married ? 'spouse' : 'partner', canAttend:!wasInPrison}); log(`${state.partner}, my ${state.married ? 'spouse' : 'partner'}, passed away at age ${state.partnerDetails.age}.${partnerSudden ? ` The cause was ${suddenDeathReason(state.partnerDetails.age)}.` : ''}`); removePartner(false); changeStats({happiness: hasTrait('thanatophobia') ? -25 : -20}); }
      else { state.partnerBond = clamp(state.partnerBond - 3);
        if (state.partnerBond === 0) { log(`${state.partner} and I drifted apart and ended our relationship.`); removePartner(); changeStats({ happiness: -12 }); } }
    }
    if (state.friends.length) {
      state.friendBond = clamp(state.friendBond - 3);
      if (state.friendBond === 0) { log(`${state.friends[0]} and I lost touch over the years.`); state.friends = []; state.socialVisits = state.socialVisits.filter(ref => ref !== 'friend-0'); state.socialConversations = state.socialConversations.filter(ref => ref !== 'friend-0'); state.socialCompliments = state.socialCompliments.filter(ref => ref !== 'friend-0'); changeStats({ happiness: -5 }); }
    }
    if (state.job && !wasInPrison) {
      const extra = Math.max(0, state.jobHours - 40);
      state.stress = clamp(state.stress + Math.ceil(extra / 5) - (state.jobHours <= 40 ? 4 : 0));
      if (extra) state.careerPerformance = clamp(state.careerPerformance + Math.floor(extra / 10));
    } else state.stress = clamp(state.stress - 5);
    if (state.stress >= 80) { changeStats({ health: -3, happiness: -3 }); log('High stress took a toll on my health and happiness.'); }
    if (state.job) {
      if (state.careerPerformance >= 80 && state.careerLevel < 5) {
        state.careerLevel++; state.income = Math.min(BANK_LIMIT, Math.round(state.income * 1.15)); state.careerPerformance = 55;
        const previousJob = state.job; state.job = promotionTitles[state.job] || state.job;
        log(`I earned a promotion to career level ${state.careerLevel}${state.job !== previousJob ? ` as ${state.job}` : ''}! My annual salary is now ${money(state.income)}.`); changeStats({ happiness: 5 });
      } else state.careerPerformance = clamp(state.careerPerformance - 4);
    }
    if (state.investment > 0) {
      const rate = random(-12, 18), previous = state.investment;
      state.investment = Math.min(BANK_LIMIT, Math.max(0, Math.round(previous * (1 + rate / 100))));
      log(`My investment fund ${rate < 0 ? 'fell' : 'grew'} ${Math.abs(rate)}% to ${money(state.investment)}.`);
    }
    for (const name of state.assets) { const item = Object.values(items).find(candidate => candidate[0] === name); if (item && ['car', 'boat', 'plane'].includes(item[3])) state.assetValues[name] = Math.max(0, Math.round(state.assetValues[name] * .85)); }
    state.portfolio.forEach((holding, i) => { const volatility = markets[i][3]; const rate = markets[i][1] === 'fund' ? random(5, 15) : random(-volatility, volatility); holding.price = Math.max(1, Math.min(1000000000, Math.round(holding.price * (100 + rate) / 100))); });
    if (state.age >= 19 && !wasInPrison) {
      const earnings = state.job ? Math.round(state.income * state.jobHours / 40) : state.income;
      const tax = salaryTax(earnings, state.taxPolicy);
      const expenses = annualLivingCosts(state);
      if (state.diet !== 'regular') { changeStats({ health: diets[state.diet].health, happiness: diets[state.diet].happiness }); log(`My ${diets[state.diet].label.toLowerCase()} diet affected my health and happiness this year.`); }
      const available = state.balance + earnings - tax;
      state.balance = Math.max(0, Math.min(BANK_LIMIT, available - expenses));
      if (available - expenses > BANK_LIMIT) log(`My cash reached the game's ${money(BANK_LIMIT)} limit; excess income could not be added.`);
      if (state.income) log(`I ${state.retired ? 'received a pension of' : 'earned'} ${money(earnings)}; taxes were ${money(tax)} and living costs were ${money(expenses)}.`);
      if (available < expenses) { log('Money was tight this year, and I had trouble covering living costs.'); changeStats({ happiness: -4 }); }
      else if (!state.income) log(`I paid ${money(expenses)} in living costs.`);
    }
    if (state.job && !wasInPrison) { state.workYears = Math.min(100, state.workYears + 1); state.salaryHistory.push(state.income); state.salaryHistory = state.salaryHistory.slice(-100); }
    if (state.job && !wasInPrison && state.pensionPolicy === 'career' && state.age >= 70 && state.workYears >= 10 && Math.random() < 1 / 9) { const oldJob = state.job; state.income = pensionAmount(state); state.job = ''; state.retired = true; log(`I was required to retire from ${oldJob.toLowerCase()} with an annual pension of ${money(state.income)}.`); changeStats({happiness: 12}); }
    if (state.job && !wasInPrison) {
      if (state.careerPerformance <= 25) { state.jobWarnings = Math.min(3, state.jobWarnings + (state.jobWarned ? 0 : 1)); if (state.jobWarned || state.jobWarnings >= 3) { log('I was fired for consistently low performance.'); state.job = ''; state.income = 0; state.workYears = 0; state.salaryHistory = []; state.jobWarned = false; changeStats({happiness: -15}); } else { state.jobWarned = true; log('My employer warned me that my performance is too low.'); } }
      else state.jobWarned = false;
    }
    if (!wasInPrison) {
      if (state.savings) { const interest = Math.min(1000000000000 - state.savings, Math.round(state.savings * .1)); state.savings += interest; if (interest) log(`My savings earned ${money(interest)} in interest.`); }
      if (state.debt) { const interest = Math.min(1000000000000 - state.debt, Math.round(state.debt * .2)); state.debt += interest; const payment = Math.min(state.balance, Math.ceil(state.debt / 10)); state.balance -= payment; state.debt -= payment; log(`My loan accrued ${money(interest)} in interest${payment ? `; I repaid ${money(payment)}` : ''}.`); }
    }
    if (state.studentLoan && !state.studying && !wasInPrison && state.balance > 0) { const payment = Math.min(1000, state.studentLoan, state.balance); state.balance -= payment; state.studentLoan -= payment; log(`I paid ${money(payment)} toward my student loan${state.studentLoan ? `; ${money(state.studentLoan)} remains` : ', paying it off'}.`); }
    if (state.studying && state.age - state.studyStarted < 4 && state.grades < random(10, 45)) { state.studying = false; state.studyMajor = ''; log('I was expelled from university after earning poor grades.'); changeStats({happiness: -30}); }
    if (state.studying && state.age - state.studyStarted >= 4) { state.studying = false; state.education = 'University'; state.major = state.studyMajor || 'legacy'; state.studyMajor = ''; log(`I graduated from university${majors[state.major] ? ` with a degree in ${majors[state.major]}` : ''}!`); changeStats({ smarts: 10, happiness: 5 }); }
    if (state.stats.happiness < 30) { changeStats({ health: -2 }); log('A difficult year took a toll on my health.'); }
    if (state.age > 55) changeStats({ health: -random(2, 5), looks: -random(0, 2) });
    else if (state.age >= 18) changeStats({ health: -random(0, 2), happiness: -random(0, 2) });
    // Process each condition independently; short illnesses may resolve after a year.
    const conditions = currentConditions(); let fatalCondition = null;
    for (let i = conditions.length - 1; i >= 0 && state.stats.health > 0; i--) {
      const condition = conditions[i];
      if ((condition.name === 'depression' && state.stats.happiness >= 80) || (condition.name === 'high blood pressure' && state.stress < 40 && Math.random() < .5) || (condition.name === 'loneliness' && (state.partner || state.friends.length) && state.stats.happiness >= 50 && Math.random() < .5)) { log(`I am no longer suffering from ${condition.name}.`); removeCondition(i); changeStats({health: 4, happiness: 4}); }
      else if (['the common cold', 'the flu'].includes(condition.name) && condition.since !== null && state.age > condition.since) { log(`I recovered from ${condition.name}.`); removeCondition(i); changeStats({health: 3}); }
      else {
        const damage = condition.name === 'cancer' ? 12 : condition.name === 'high blood pressure' ? 3 : condition.name === 'depression' ? 2 : condition.name === 'anxiety' || condition.name === 'loneliness' ? 1 : 4;
        changeStats({health: -damage, ...(['cancer', 'depression', 'anxiety', 'loneliness'].includes(condition.name) ? {happiness: -3} : {})}); log(`My health suffered from ${condition.name}.`);
        if (condition.name === 'cancer' && state.stats.health === 0) fatalCondition = 'cancer';
        else if (condition.name === 'high blood pressure' && state.stats.health > 0 && state.stress > 80 && state.stats.health < 15 && state.stress > random(80,95) && state.stats.health < random(1,15) && Math.random() < 1 / 3) { state.stats.health = 0; fatalCondition = 'heart-attack'; log('I suffered a fatal heart attack.'); }
      }
    }
    if (state.stats.health > 0 && state.age >= 4 && state.stats.health < 75 && currentConditions().length < 5 && Math.random() < .08) {
      const roll = Math.random(), name = roll < .01 ? 'cancer' : roll < .45 ? 'the common cold' : roll < .75 ? 'the flu' : roll < .9 ? 'high blood pressure' : 'depression';
      if (!currentConditions().some(condition => condition.name === name)) { if (state.illness) state.additionalIllnesses.push({name, since: state.age}); else { state.illness = name; state.illnessSince = state.age; } log(`I developed ${name}. A doctor can help.`); }
    }

    // Additional OpenLife conditions and situational triggers, rebalanced for this game.
    for (const [name, trigger] of [['depression', state.stats.happiness <= 25], ['anxiety', state.stress >= 80], ['loneliness', state.age >= 18 && !state.partner && !state.friends.length && state.stats.happiness < 40]]) {
      if (state.stats.health > 0 && trigger && currentConditions().length < 5 && !currentConditions().some(condition => condition.name === name) && Math.random() < .05) { if (state.illness) state.additionalIllnesses.push({name, since:state.age}); else { state.illness = name; state.illnessSince = state.age; } log(`I developed ${name}. A doctor can help.`); }
    }

    if (state.stats.health <= 0 || state.age >= 100 || (state.age >= 75 && Math.random() < (state.age - 72) / 160)) {
      state.alive = false; state.deathCause = state.stats.health <= 0 ? fatalCondition || 'poor-health' : 'old-age'; state.income = 0; state.job = ''; state.pending = null; state.funeralQueue = []; log(`My life came to an end at age ${state.age}. What a journey it was.`); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; render(); showSummary(); return;
    }
    if (state.funeralQueue.length) { state.pending = FUNERAL_EVENT; render(); showEvent(focusBeforeAge); return; }
    const eligible = events.map((event, index) => ({ event, index })).filter(({event}) => state.age >= event.min && state.age <= event.max && !!event.prison === (state.prisonYears > 0) && (!event.when || event.when(state)));
    if (eligible.length && Math.random() < .7) {
      let unseen = eligible.filter(({index}) => !state.seenEvents.includes(index));
      // Only recycle eligible stories after all of them have been seen, and avoid the last three where possible.
      if (!unseen.length) { const eligibleIds = new Set(eligible.map(({index}) => index)); state.seenEvents = state.seenEvents.filter(index => !eligibleIds.has(index)); unseen = eligible.filter(({index}) => !state.recentEvents.includes(index)); if (!unseen.length) unseen = eligible; }
      state.pending = pick(unseen).index; if (state.pending === ASKED_OUT_EVENT) state.dateCandidate = makeDateCandidate(); if (state.pending === KIDNAPPING_EVENT) { state.kidnappingRansom = Math.round(state.balance * (.2 + Math.random() * .6)); log(`${state.partner} was kidnapped. The ransom demand is ${money(state.kidnappingRansom)}.`); changeStats({happiness:-30}); } state.seenEvents.push(state.pending); state.recentEvents = [...state.recentEvents, state.pending].slice(-3);
    }
    render(); if (state.pending !== null) showEvent(focusBeforeAge);
  }
  function showEvent(focusOrigin = null) {
    const event = events[state.pending]; if (!event) { state.pending = null; render(); return; }
    const target = state.pending === ARGUMENT_EVENT && state.argumentTarget ? socialPerson(state.argumentTarget.kind, state.argumentTarget.index) : null;
    let content = header(event.icon, `AGE ${state.age} · A LITTLE MOMENT`, esc(event.title), esc(target ? `My conversation with ${target.name} turned into an argument. What will I do?` : state.pending === ASKED_OUT_EVENT && state.dateCandidate ? `${state.dateCandidate.name}, age ${state.dateCandidate.age}, has asked you out. Smarts ${state.dateCandidate.smarts}% · Looks ${state.dateCandidate.looks}% · Craziness ${state.dateCandidate.craziness}%. What will you do?` : state.pending === FUNERAL_EVENT ? `${state.funeralQueue[0].name || 'My loved one'}, my ${state.funeralQueue[0].relationship}, has passed away. ${state.funeralQueue[0].canAttend ? 'Would I like to attend the funeral?' : 'I was in prison this year and could not attend the funeral. Would I like to remember them privately?'}` : state.pending === KIDNAPPING_EVENT ? `${state.partner} has been kidnapped. The kidnappers demand ${money(state.kidnappingRansom)} and warn against calling the police. What will you do?` : expandStory(event.text)));
    event.choices.forEach((choice, index) => {
      const effects = [];
      if (choice.cost) effects.push(`Costs ${money(choice.cost)}${state.balance < choice.cost ? ' (not enough money)' : ''}`);
      if (choice.gain) effects.push(`Gain ${money(choice.gain)}`);
      for (const [key, value] of Object.entries(choice.stats || {})) if (value) effects.push(`${value > 0 ? '+' : ''}${value} ${key}`);
      if (choice.bond) effects.push(`${choice.bond > 0 ? '+' : ''}${choice.bond} partner bond`);
      if (choice.friendBond) effects.push(`${choice.friendBond > 0 ? '+' : ''}${choice.friendBond} friendship`);
      if (choice.performance) effects.push(`+${choice.performance} performance`);
      if (choice.parentBond) effects.push(`${choice.parentBond > 0 ? '+' : ''}${choice.parentBond} parent bond`);
      if (choice.karma) effects.push(`${choice.karma > 0 ? '+' : ''}${choice.karma} karma`);
      if (state.pending === KIDNAPPING_EVENT && index === 0) effects.push(`Pay ${money(state.kidnappingRansom)} · Release not guaranteed`);
      if (state.pending === KIDNAPPING_EVENT && index === 1) effects.push('Rescue not guaranteed');
      if (state.pending === KIDNAPPING_EVENT && index === 2) effects.push('Partner presumed dead · −8 to −16 karma');
      if (state.pending === ARGUMENT_EVENT && index === 0) effects.push('+2–4 bond');
      if (state.pending === ARGUMENT_EVENT && index === 2) effects.push('−4–7 bond');
      if (state.pending === FUNERAL_EVENT) effects.push(index === 0 ? '+3–5 happiness and karma' : '−2–5 karma');
      if (choice.endPartner) effects.push(state.married ? 'Ends marriage; divorce settlement 40–60% of cash' : 'Ends relationship');
      if (choice.reconcile) effects.push(`${state.married ? 'May end marriage; divorce settlement 40–60% of cash' : 'May end relationship'}${state.partnerDetails ? ' · Partner willpower affects outcome' : ''}`);
      const label = state.pending === FUNERAL_EVENT && !state.funeralQueue[0].canAttend ? (index === 0 ? 'Remember them privately' : 'Do not hold a remembrance') : choice.label;
      content += option(`choice-${index}`, '✦', esc(label), effects.join(' · ') || 'No stat change', !!choice.cost && state.balance < choice.cost);
    });
    modal(content, focusOrigin);
  }
  function qualifiedFor(job) {
    return job && state.age >= 18 && (!job.degree || state.education === 'University') && (!job.majors || state.major === 'legacy' || job.majors.includes(state.major)) && (!job.smarts || state.stats.smarts >= job.smarts) && (!job.skill || state.skills[job.skill] >= job.level) && (!job.clean || state.convictions === 0) && (!job.license || state.license) && state.job !== job.name;
  }
  function interviewPanel(index) {
    const job = jobs[index]; if (!qualifiedFor(job)) return;
    pendingInterview = {job: index, question: random(0, interviews.length - 1)};
    const [question, answers] = interviews[pendingInterview.question];
    let content = header('💼', 'JOB INTERVIEW', esc(job.name), `${esc(question)} Your answer determines whether you are hired. Choosing an answer uses one moment.`);
    answers.forEach((answer, i) => { content += option(`interview-answer-${i}`, '💬', esc(answer), 'Answer the interview question.', state.moments <= 0); });
    modal(content);
  }
  function jobsPanel() {
    let content = header('💼', 'THE NEXT STEP', 'Find a job', 'Choose a path. Taking a job leaves university if you are studying.');
    jobs.forEach((job, i) => content += option(`job-${i}`, job.icon, job.name, `${money(job.salary)} / year${job.degree ? ` · ${job.majors ? job.majors.map(key => majors[key]).join(' or ') : 'University'} degree required` : ''}${job.smarts ? ` · ${job.smarts}% smarts required` : ''}${job.skill ? ` · ${skills[job.skill][1]} level ${job.level} required` : ''}${job.clean ? ' · Clean record required' : ''}${job.license ? ' · Driver’s license required' : ''}`, state.moments <= 0 || !qualifiedFor(job)));
    modal(content);
  }
  function showSummary() {
    const relationships = (state.partner ? 1 : 0) + state.friends.length + state.children.length + (state.pet ? 1 : 0);
    const lifetime = state.happinessYears ? Math.round(state.stats.happiness * .3 + (state.happinessTotal / state.happinessYears) * .7) : state.stats.happiness;
    modal(header('🕊️', 'THE END OF A CHAPTER', 'A life to remember', `${esc(state.name)} lived for ${state.age} years. Every little moment made a story worth telling.`) + `<div class="summary-grid"><div><small>YEARS LIVED</small><strong>${state.age}</strong></div><div><small>CAUSE OF DEATH</small><strong>${state.deathCause ? deathLabels[state.deathCause] : 'Not recorded'}</strong></div><div><small>FINAL BALANCE</small><strong>${money(state.balance)}</strong></div><div><small>EDUCATION</small><strong>${esc(state.education)}</strong></div><div><small>LOVED ONES</small><strong>${relationships}</strong></div><div><small>MILESTONES</small><strong>${state.milestones.length} / ${milestones.length}</strong></div><div><small>LIFETIME HAPPINESS</small><strong>${lifetime}%</strong></div><div><small>KARMA</small><strong>${state.karma}%</strong></div><div><small>INVESTMENTS</small><strong>${money(state.investment + portfolioValue(state))}</strong></div></div><p class="form-note">${state.assets.length ? `Treasured possessions: ${state.assets.map(esc).join(', ')}.` : 'A life is measured in more than possessions.'} Lifetime happiness uses ${state.happinessYears ? `the ${state.happinessYears} recorded year${state.happinessYears === 1 ? '' : 's'}` : 'the final happiness score'}${state.happinessYears < state.age ? ' (earlier years were not recorded)' : ''}. Scroll through your timeline to revisit the moments.</p><button class="modal-secondary" data-close>View my story</button><button class="modal-secondary" data-action="life-statistics">Life statistics</button>${state.children.length ? '<button class="modal-primary" data-action="choose-successor">Continue as a child</button>' : ''}<button class="modal-secondary" data-action="restart-confirm">Start a new life</button>`);
  }
  function showLegacy() {
    let content = header('🌳', 'A STORY THAT GROWS', 'Family legacy', `Generation ${state.generation}. Continue as a child when your life ends. The last five past lives and their stories are saved here.`);
    content += `<div class="legacy-entry"><span><strong>${esc(state.name)}</strong><small>Current life · Age ${state.age}${state.alive ? '' : ' · Remembered'}</small></span><span>✦</span></div>`;
    if (state.alive && state.age >= 18 && !state.prisonYears) content += option('will', '📜', 'Last will', `Current plan: ${esc(willDescription(state))}.`, state.moments <= 0);
    if (state.children.length) content += `<div class="progress-card"><strong>Children</strong><br>${state.children.map((name, i) => `${esc(name)}${state.childBirthAges[i] === null ? ' (age unknown)' : `, age ${state.age - state.childBirthAges[i]}`}`).join(' · ')}</div>`;
    if (state.lostChildren.length) content += `<div class="progress-card"><strong>Remembered children</strong><br>${state.lostChildren.map(child => `${esc(child.name || 'Unnamed child')}, age ${child.age} (when I was ${child.atAge})`).join(' · ')}</div>`;
    if (!state.legacyHistory.length) content += '<div class="empty-state">Your family history starts with this life. After your story ends, you can choose a child to carry it on.</div>';
    [...state.legacyHistory].reverse().forEach((ancestor, reverseIndex) => { const index = state.legacyHistory.length - 1 - reverseIndex; content += option(`archive-${index}`, '📖', esc(ancestor.name), `Lived ${ancestor.age} years · Read their story`); });
    modal(content);
  }
  function showArchive(index) {
    const ancestor = state.legacyHistory[index]; if (!ancestor) return;
    const chapters = [...ancestor.history].reverse().map(year => `<div class="year-block"><div class="year-icon">${esc(year.icon)}</div><div><div class="year-heading"><strong>Age ${year.age}</strong>${year.tag ? `<span>${esc(year.tag)}</span>` : ''}</div>${year.entries.map(entry => `<p class="event">${esc(entry)}</p>`).join('')}</div></div>`).join('');
    modal(header('📖', 'FAMILY HISTORY', esc(ancestor.name), `${ancestor.age} years · ${esc(ancestor.city)} · Final cash ${money(ancestor.balance)}${ancestor.deathCause ? ` · ${deathLabels[ancestor.deathCause]}` : ''}`) + `<div class="archive-timeline">${chapters}</div><button class="modal-secondary" data-action="show-legacy">Back to family legacy</button>`);
  }
  function childAge(index) {
    const birth = state.childBirthAges[index];
    return Number.isInteger(birth) && birth >= 0 && birth <= state.age && state.children[index] ? state.age - birth : null;
  }
  function showSuccessors() {
    if (state.alive) return;
    let content = header('🌱', 'THE NEXT GENERATION', 'Continue the story', 'Choose a child to play at their current age using their existing profile where available. Their share of the estate follows your will. The parent’s student loans do not transfer; a child keeps their own recorded student loan. Older children without profiles start fresh.');
    if (!state.children.length) content += '<div class="empty-state">There are no children to continue as.</div>';
    state.children.forEach((name, i) => { const age = childAge(i); content += option(`successor-${i}`, '🧑', esc(name), age === null ? 'Age unknown in this older save; cannot continue as this child.' : `Age ${age} · Continue this family line`, age === null || state.generation >= 10000); });
    content += '<button class="modal-secondary" data-action="summary">Back to summary</button>';
    modal(content);
  }
  function confirmSuccessor(index) {
    if (state.alive || childAge(index) === null) return;
    const profile = state.childProfiles[index];
    const otherParent = !profile || profile.coParent === undefined ? 'This older profile has no recorded co-parent.' : profile.coParent === null ? 'No co-parent was recorded for this child.' : profile.coParentCurrent && state.partnerDetails?.endAge !== undefined ? `${esc(profile.coParent)} will remain as a living parent, with a starting bond of 65% and no recorded inheritance.` : `${esc(profile.coParent)} cannot be carried over without a current, identified lifespan profile.`;
    modal(header('🌱', 'THE NEXT GENERATION', `Continue as ${esc(state.children[index])}?`, `You’ll start at age ${childAge(index)} using their existing profile where available. This life will be archived and cannot be played again. Their share of cash, savings, bank debt, investments and possessions follows your will; the parent’s student loans do not transfer. A child keeps their own recorded student loan. ${otherParent}`) + `<button class="modal-secondary" data-action="choose-successor">Back</button><button class="modal-primary" data-action="inherit-${index}">Continue this legacy</button>`);
  }
  function inheritLife(index) {
    const age = childAge(index); if (state.alive || age === null || state.generation >= 10000) return;
    const old = state;
    const surname = old.name.trim().split(/\s+/).slice(-1)[0];
    // Imported names can each be 300 UTF-16 code units; keep their combined
    // successor name within the same validated limit without splitting an emoji.
    let name = `${old.children[index]} ${surname}`.slice(0,300).trimEnd();
    if (name && /[\uD800-\uDBFF]/.test(name[name.length - 1])) name = name.slice(0,-1).trimEnd();
    const successor = freshLife(name, old.city);
    successor.age = age; successor.generation = old.generation + 1; successor.taxPolicy = old.taxPolicy; successor.pensionPolicy = old.pensionPolicy;
    Object.assign(successor, inheritanceShare(old, index));
    const profile = old.childProfiles[index];
    successor.education = profile ? profile.education : age >= 18 ? 'High school' : 'None';
    const inheritedCash = successor.balance;
    if (profile) {
      successor.stats = {happiness:profile.happiness, health:profile.health, smarts:profile.smarts, looks:profile.looks};
      successor.happinessTotal = profile.happinessTotal; successor.happinessYears = profile.happinessYears;
      successor.balance = Math.min(1000000000000, successor.balance + profile.balance); successor.studentLoan = profile.studentLoan;
      successor.job = profile.job; successor.income = profile.income; successor.workYears = profile.workYears; successor.salaryHistory = [...profile.salaryHistory];
      if (profile.education === 'University') successor.major = 'legacy';
      if (profile.studyStarted !== null) { successor.studying = true; successor.studyStarted = profile.studyStarted; successor.studyMajor = 'legacy'; }
      if (profile.partner) { successor.partner = profile.partner.name; successor.married = profile.partner.married; if (profile.partner.marriedAt != null) successor.lastVows = profile.partner.marriedAt; if (profile.partner.details) successor.partnerDetails = {...profile.partner.details}; }
    }
    successor.siblings = old.children.map((name, i) => ({ name, age: childAge(i), bond: 65, alive: true, ...(old.childProfiles[i] ? {smarts:old.childProfiles[i].smarts, looks:old.childProfiles[i].looks, petulance:random(0, 100)} : {}) })).filter((_, i) => i !== index).filter(sibling => sibling.age !== null).map(sibling => ({ ...sibling, endAge: Math.max(sibling.age + 1, random(72, 95)) }));
    successor.parents = [{ name: old.name, age: old.age, endAge: old.age, bond: 0, alive: false, inheritance: 0 }];
    // Only preserve the other parent when their identity and lifespan are still known.
    if (profile?.coParentCurrent && old.partner === profile.coParent && old.partnerDetails?.endAge !== undefined) {
      successor.parents.push({name:old.partner, age:old.partnerDetails.age, endAge:old.partnerDetails.endAge, bond:65, alive:true, inheritance:0});
    }
    successor.legacyHistory = [...old.legacyHistory, { name: old.name, age: old.age, city: old.city, balance: old.balance, investment: old.investment, deathCause:old.deathCause, history: old.history }].slice(-5);
    successor.history = [{ age, icon: '🌱', tag: 'A NEW GENERATION', entries: [`My name is ${name}. I am continuing my parent ${old.name}’s story at age ${age}.`, `I inherited ${money(inheritedCash)} in cash, ${money(successor.savings)} in savings, ${money(successor.debt)} in bank debt and ${money(successor.investment + portfolioValue(successor))} in investments.`, ...(profile && profile.balance ? [`I brought ${money(successor.balance - inheritedCash)} of my own savings into this life${successor.balance - inheritedCash < profile.balance ? ' (the cash limit applies)' : ''}.`] : []), ...(profile && profile.studentLoan ? [`My own student loan balance is ${money(profile.studentLoan)}.`] : []), ...(successor.parents.length > 1 ? [`My other parent ${successor.parents[1].name} remains in my life.`] : []), ...successor.assets.map(asset => `I inherited a ${asset}.`)] }];
    state = successor; closeModal(); render();
  }
  function readSlots() {
    try {
      const raw = localStorage.getItem(SLOT_KEY);
      const saved = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(saved) || saved.length > MAX_SLOTS) return null;
      const ids = new Set();
      for (const slot of saved) {
        if (!slot || typeof slot.id !== 'string' || !slot.id || slot.id.length > 100 || ids.has(slot.id) || !slot.game || typeof slot.game !== 'object') return null;
        ids.add(slot.id); slot.game = upgradeGame(slot.game);
        if (!validBackup({format:'little-life-backup', version:1, game:slot.game})) return null;
      }
      return saved;
    } catch (_) { return null; }
  }
  function writeSlots(slots) {
    try { localStorage.setItem(SLOT_KEY, JSON.stringify(slots)); return true; } catch (_) { return false; }
  }
  function dataPanel(message = '', isError = false) {
    pendingImport = null; pendingSlot = null; pendingSlotReset = null;
    const slots = readSlots();
    let content = header('💾', 'YOUR STORY, YOUR DEVICE', 'Save & load', storageReadFailed ? 'Browser storage could not be read. This temporary life is not autosaving; retry reading the original or explicitly replace it.' : unreadableSave !== null ? 'The temporary life is not autosaving because the original data could not be read. Download the original before explicitly replacing it.' : 'Your current life saves automatically in this browser. Save copies locally or download a backup to move it to another device.');
    content += option('slot-save', '📌', 'Save a local copy', slots === null ? 'Saved lives could not be read; existing data was not changed.' : `${slots.length} of ${MAX_SLOTS} slots used.`, slots === null || slots.length >= MAX_SLOTS);
    if (storageReadFailed) content += option('retry-save-read', '🔄', 'Retry reading original save', 'If browser storage is available again, recover the original bytes without changing them.');
    if (unreadableSave !== null) content += option('export-unreadable', '🛟', 'Download original unreadable save', 'Save the untouched browser data for recovery before replacing it.');
    if (slots === null) { try { if (localStorage.getItem(SLOT_KEY) !== null) { content += option('export-unreadable-slots', '🛟', 'Download unreadable local slots', 'Save the untouched slot data for recovery.'); content += option('slot-reset', '🗑️', 'Remove unreadable local slots', 'Delete only the unreadable slot data after confirmation. The current autosave is not affected.'); } } catch (_) { /* Browser storage is unavailable. */ } }
    if (slots) slots.forEach((slot, index) => { content += option(`slot-load-${index}`, '📖', esc(slot.game.name), `Age ${slot.game.age} · Generation ${slot.game.generation} · Review before loading`) + option(`slot-delete-${index}`, '🗑️', `Delete ${esc(slot.game.name)}’s copy`, 'Confirmation required.'); });
    content += `<button class="modal-option" data-action="export"><span class="option-emoji">⬇️</span><span><strong>${unreadableSave !== null || storageReadFailed ? 'Download temporary life' : 'Download backup'}</strong><small>${unreadableSave !== null || storageReadFailed ? 'Download the temporary life as JSON, not the original save.' : 'Save your current life as a JSON file.'}</small></span><b>›</b></button><div class="progress-card"><strong>Restore a backup</strong><br>Choose a Little Life backup file. You will be asked to confirm before your current life is replaced.<input class="file-input" id="import-file" type="file" accept="application/json,.json" aria-label="Choose a Little Life backup"></div><p id="data-message" class="${isError || slots === null ? 'data-error' : 'data-success'}" role="status">${esc(message || (slots === null ? 'Local save slots could not be read. Your current life was not changed.' : ''))}</p>`;
    modal(content);
  }
  // Backups are untrusted files: reject malformed or oversized values before replacing a live game.
  function validBackup(data) {
    const s = data && data.format === 'little-life-backup' && data.version === 1 && data.game;
    const text = value => typeof value === 'string' && value.length <= 300;
    const number = (value, max) => Number.isSafeInteger(value) && value >= 0 && value <= max;
    const entryText = value => typeof value === 'string' && value.length <= 2000;
    const list = (value, max, check) => Array.isArray(value) && value.length <= max && value.every(check);
    if (!s || s.version !== 1 || !(s.deathCause === null || (!s.alive && typeof s.deathCause === 'string' && Object.hasOwn(deathLabels,s.deathCause))) || !['', 'female', 'male', 'nonbinary'].includes(s.gender) || !text(s.name) || !s.name || !text(s.city) || !number(s.age, 100) || typeof s.alive !== 'boolean' || !number(s.balance, 1000000000000) || !number(s.income, 1000000000000) || !number(s.investment, 1000000000000)) return false;
    if (!s.stats || !Object.keys(statMeta).every(k => number(s.stats[k], 100)) || !number(s.moments, MAX_MOMENTS) || !(s.pending === null || (number(s.pending, events.length - 1) && s.alive))) return false;
    if (!text(s.job) || !['None', 'High school', 'University'].includes(s.education) || typeof s.studying !== 'boolean' || typeof s.retired !== 'boolean' || typeof s.married !== 'boolean' || !(s.partner === null || text(s.partner)) || !(s.pet === null || text(s.pet)) || !(s.illness === null || text(s.illness))) return false;
    if (!number(s.careerLevel, 5) || s.careerLevel < 1 || !number(s.careerPerformance, 100) || !number(s.partnerBond, 100) || !number(s.friendBond, 100) || !s.skills || !Object.keys(skills).every(k => number(s.skills[k], 5))) return false;
    if (!list(s.children, 4, text) || !list(s.childBirthAges, 4, age => age === null || number(age, s.age)) || s.childBirthAges.length !== s.children.length || !list(s.friends, 1, text) || !list(s.assets, Object.keys(items).length, value => Object.values(items).some(item => item[0] === value)) || !list(s.milestones, milestones.length, id => milestones.some(b => b.id === id)) || !list(s.recentEvents, 3, index => number(index, events.length - 1))) return false;
    if (!list(s.seenEvents, events.length, index => number(index, events.length - 1)) || !number(s.prisonYears, 5) || !number(s.convictions, 100) || typeof s.license !== 'boolean' || typeof s.boatLicense !== 'boolean' || typeof s.pilotLicense !== 'boolean' || !number(s.moves, 300) || !Object.hasOwn(diets, s.diet)) return false;
    if (!list(s.lostChildren, 400, child => child && text(child.name) && number(child.atAge, s.age) && number(child.age, child.atAge))) return false;
    if (!(s.petInfo === null || (s.pet && s.petInfo && ['cat', 'dog', 'fish'].includes(s.petInfo.type) && text(s.petInfo.breed) && number(s.petInfo.age, 30) && number(s.petInfo.endAge, 30) && s.petInfo.endAge > 0))) return false;
    if (!(s.pregnancy === null || (s.pregnancy && text(s.pregnancy.coParent) && s.pregnancy.coParent && (s.pregnancy.coParentCurrent === undefined || (typeof s.pregnancy.coParentCurrent === 'boolean' && (!s.pregnancy.coParentCurrent || s.pregnancy.coParent === s.partner))) && number(s.pregnancy.started, s.age) && s.children.length < 4))) return false;
    if (!(s.vowRejectedAt === null || (s.partner && s.married && number(s.vowRejectedAt, s.age))) || !(s.proposalRejectedAt === null || (s.partner && number(s.proposalRejectedAt, s.age))) || typeof s.engaged !== 'boolean' || !(s.lastVows === null || number(s.lastVows, s.age)) || (s.engaged && (!s.partner || s.married))) return false;
    if (!s.assetValues || typeof s.assetValues !== 'object' || Array.isArray(s.assetValues) || Object.keys(s.assetValues).length !== s.assets.length || !s.assets.every(name => Object.hasOwn(s.assetValues, name) && number(s.assetValues[name], 1000000000000))) return false;
    if (!list(s.portfolio, markets.length, h => h && number(h.price, 1000000000) && h.price > 0 && number(h.units, 100000)) || s.portfolio.length !== markets.length) return false;
    if (!s.will || !['legacy', 'equal', 'child', 'spouse', 'charity'].includes(s.will.mode) || (s.will.mode === 'child' ? !number(s.will.child, s.children.length - 1) : s.will.child !== null)) return false;
    if (!number(s.savings, 1000000000000) || !number(s.debt, 1000000000000)) return false;
    if (!(s.scholarshipAttempt === null || number(s.scholarshipAttempt, s.age))) return false;
    if (!(s.readingBook === null || (s.readingBook && number(s.readingBook.index, books.length - 1) && s.age >= books[s.readingBook.index][3] && number(s.readingBook.pages, books[s.readingBook.index][2] - 1)))) return false;
    if (!list(s.funeralQueue, 11, f => f && text(f.name) && ['parent','sibling','child','partner','spouse'].includes(f.relationship) && typeof f.canAttend === 'boolean') || (s.pending === FUNERAL_EVENT ? !s.funeralQueue.length : s.funeralQueue.length !== 0)) return false;
    if (s.pending === ASKED_OUT_EVENT && !s.dateCandidate) return false;
    if (s.pending === KIDNAPPING_EVENT ? !(s.partner && number(s.kidnappingRansom, s.balance) && s.kidnappingRansom > 0) : s.kidnappingRansom !== null) return false;
    if (!number(s.happinessYears, s.age) || !number(s.happinessTotal, s.happinessYears * 100)) return false;
    if (!['flat','career'].includes(s.pensionPolicy) || !number(s.workYears, 100) || !list(s.salaryHistory, 100, salary => number(salary, 1000000000000)) || s.salaryHistory.length > s.workYears) return false;
    if (!['flat','progressive'].includes(s.taxPolicy)) return false;
    if (!number(s.studentLoan, 1000000000) || !(s.illnessSince === null || number(s.illnessSince, s.age))) return false;
    if (!list(s.additionalIllnesses, 4, c => c && text(c.name) && !!c.name && (c.since === null || number(c.since, s.age))) || (!s.illness && s.additionalIllnesses.length) || new Set([s.illness, ...s.additionalIllnesses.map(c => c.name)].filter(Boolean)).size !== (s.illness ? 1 : 0) + s.additionalIllnesses.length) return false;
    if (!list(s.extraTraits, 2, id => typeof id === 'string' && Object.hasOwn(traits, id) && id !== s.trait) || new Set(s.extraTraits).size !== s.extraTraits.length || !number(s.meditations, 1000) || !number(s.studySessions, 1000)) return false;
    if (!list(s.socialCompliments, 12, ref => typeof ref === 'string' && /^(parent-[01]|sibling-[0-3]|child-[0-3]|partner-0|friend-0)$/.test(ref)) || new Set(s.socialCompliments).size !== s.socialCompliments.length) return false;
    if (!list(s.socialConversations, 12, ref => typeof ref === 'string' && /^(parent-[01]|sibling-[0-3]|child-[0-3]|partner-0|friend-0)$/.test(ref)) || new Set(s.socialConversations).size !== s.socialConversations.length) return false;
    if (s.pending === ARGUMENT_EVENT) { const t = s.argumentTarget; if (!t || !Number.isInteger(t.index) || t.index < 0 || !(['parent','sibling','child','partner','friend'].includes(t.kind))) return false; const p = t.kind === 'parent' ? s.parents[t.index]?.alive : t.kind === 'sibling' ? s.siblings[t.index]?.alive : t.kind === 'child' ? !!s.children[t.index] : t.kind === 'partner' ? t.index === 0 && !!s.partner : t.index === 0 && !!s.friends.length; if (!p) return false; } else if (s.argumentTarget !== null) return false;
    if (!list(s.socialVisits, 12, ref => typeof ref === 'string' && /^(parent-[01]|sibling-[0-3]|child-[0-3]|partner-0|friend-0)$/.test(ref)) || new Set(s.socialVisits).size !== s.socialVisits.length) return false;
    if (!s.childProfiles || typeof s.childProfiles !== 'object' || Array.isArray(s.childProfiles) || Object.keys(s.childProfiles).some(key => !/^[0-3]$/.test(key) || Number(key) >= s.children.length)) return false;
    const validPartnerDetails = p => p && typeof p === 'object' && number(p.age, 150) && p.age >= 18 && (p.endAge === undefined || (number(p.endAge, 150) && p.endAge > p.age)) && (p.yearsTogether === undefined || number(p.yearsTogether, s.age)) && (p.fertility === undefined || number(p.fertility, 100)) && ['smarts','looks','craziness','willpower'].every(key => number(p[key],100));
    for (const [key, profile] of Object.entries(s.childProfiles)) {
      const birth = s.childBirthAges[Number(key)], age = birth === null ? null : s.age - birth;
      if (age === null || !profile || typeof profile !== 'object' || !number(profile.workYears, Math.max(0, age - 17)) || !list(profile.salaryHistory, 100, salary => number(salary, BANK_LIMIT)) || profile.salaryHistory.length > profile.workYears || (!profile.job && profile.workYears !== 0) || !((profile.coParent === undefined && profile.coParentCurrent === undefined) || ((profile.coParent === null || (text(profile.coParent) && !!profile.coParent)) && typeof profile.coParentCurrent === 'boolean' && (!profile.coParentCurrent || (profile.coParent && profile.coParent === s.partner)))) || !(profile.partnerDesire === undefined || number(profile.partnerDesire, 100)) || !number(profile.studentLoan, 1000000000) || (age < 18 && profile.studentLoan !== 0) || !number(profile.happinessYears, age) || !number(profile.happinessTotal, profile.happinessYears * 100) || typeof profile.adopted !== 'boolean' || !['happiness', 'health', 'smarts', 'looks'].every(key => number(profile[key], 100)) || !['None', 'High school', 'University'].includes(profile.education) || !(profile.studyStarted === null || number(profile.studyStarted, 100)) || !text(profile.job) || !number(profile.income, 1000000000000) || !number(profile.balance, 1000000000000) || !(profile.partner === null || (profile.partner && text(profile.partner.name) && !!profile.partner.name && number(profile.partner.since, age) && profile.partner.since >= 18 && typeof profile.partner.married === 'boolean' && (profile.partner.mayDivorce === undefined || (profile.partner.married && typeof profile.partner.mayDivorce === 'boolean')) && (profile.partner.marriedAt === undefined || (profile.partner.married ? number(profile.partner.marriedAt, age) && profile.partner.marriedAt >= profile.partner.since : profile.partner.marriedAt === null)) && (profile.partner.details === undefined || (validPartnerDetails(profile.partner.details) && (profile.partner.details.yearsTogether === undefined || profile.partner.details.yearsTogether <= age - profile.partner.since))))) || (profile.studyStarted !== null && (!number(profile.studyStarted, age) || profile.studyStarted < 18 || profile.education !== 'High school' || profile.job)) || (profile.job ? age < 18 || profile.income <= 0 : profile.income !== 0) || (age < 18 && profile.education !== 'None')) return false;
    }
    if (!(s.partnerDetails === null || (s.partner && validPartnerDetails(s.partnerDetails))) || !(s.dateCandidate === null || (!s.partner && s.age >= 18 && validPartnerDetails(s.dateCandidate) && (s.dateCandidate.yearsTogether === undefined || s.dateCandidate.yearsTogether === 0) && text(s.dateCandidate.name) && !!s.dateCandidate.name))) return false;
    if (!number(s.karma, 100) || !list(s.parentAsks, 2, age => age === null || number(age, s.age)) || s.parentAsks.length !== 2 || !list(s.childBonds, 4, bond => number(bond, 100)) || s.childBonds.length !== s.children.length) return false;
    if (!number(s.jobWarnings, 3) || typeof s.jobWarned !== 'boolean') return false;
    if (!number(s.stress, 100) || !number(s.jobHours, 70) || s.jobHours < 38 || !(s.lastRaiseRequest === null || number(s.lastRaiseRequest, s.age)) || !number(s.raiseRejections, 100) || !(s.lastSurgery === null || number(s.lastSurgery, s.age)) || !number(s.jackpot, 1000000) || s.jackpot < 100000) return false;
    if (!list(s.siblings, 4, p => p && text(p.name) && number(p.age, 150) && number(p.endAge, 150) && number(p.bond, 100) && typeof p.alive === 'boolean' && ((p.smarts === undefined && p.looks === undefined && p.petulance === undefined) || (number(p.smarts, 100) && number(p.looks, 100) && number(p.petulance, 100)))) || !(typeof s.trait === 'string' && (s.trait === '' || Object.hasOwn(traits, s.trait))) || !number(s.grades, 100) || typeof s.droppedOut !== 'boolean') return false;
    if (!list(s.parents, 2, p => p && text(p.name) && number(p.age, 150) && number(p.endAge, 150) && number(p.bond, 100) && typeof p.alive === 'boolean' && number(p.inheritance, 1000000000000) && ((p.generosity === undefined && p.wealth === undefined && p.moneyRefusals === undefined) || (number(p.generosity, 100) && number(p.wealth, 100) && (p.moneyRefusals === undefined || number(p.moneyRefusals, 3)))))) return false;
    const validHistory = history => list(history, 105, year => year && number(year.age, 100) && text(year.icon) && text(year.tag) && list(year.entries, 10000, entryText)) && history.length > 0;
    if (!number(s.generation, 10000) || s.generation < 1 || !list(s.legacyHistory, 5, ancestor => ancestor && text(ancestor.name) && text(ancestor.city) && number(ancestor.age, 100) && number(ancestor.balance, 1000000000000) && number(ancestor.investment, 1000000000000) && (ancestor.deathCause === undefined || ancestor.deathCause === null || (typeof ancestor.deathCause === 'string' && Object.hasOwn(deathLabels,ancestor.deathCause))) && validHistory(ancestor.history))) return false;
    if (!['', 'legacy', ...Object.keys(majors)].includes(s.major) || !['', 'legacy', ...Object.keys(majors)].includes(s.studyMajor)) return false;
    if (s.studying && !number(s.studyStarted, s.age)) return false;
    return list(s.history, 105, year => year && number(year.age, s.age) && text(year.icon) && text(year.tag) && list(year.entries, 10000, entryText)) && s.history.length > 0;
  }
  function downloadBlob(contents, filename, type) {
    const blob = new Blob([contents], {type});
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportBackup() {
    downloadBlob(JSON.stringify({ format: 'little-life-backup', version: 1, game: state }, null, 2), 'little-life-backup.json', 'application/json');
    $('#data-message').textContent = 'Backup downloaded. Keep it somewhere safe.';
  }
  function newLifeForm() {
    modal(header('🌱', 'A FRESH START', 'Start a new life?', storageReadFailed ? 'Starting this life will replace any existing save, even though browser storage could not be read. Retry reading the original from Save & load first if you want to recover it.' : unreadableSave !== null ? 'Starting this life will replace the unreadable original save. Download the original from Save & load first if you want to keep it.' : 'Your current life and family archive will be replaced. Make this next one your own or leave the fields blank for a surprise.') + `<form id="new-life-form"><label class="form-label" for="new-name">NAME</label><input class="form-input" id="new-name" maxlength="40" placeholder="Random name" autocomplete="off"><label class="form-label" for="new-city">BIRTHPLACE</label><select class="form-input" id="new-city"><option value="">Surprise me</option><optgroup label="Cities">${cities.map(city => `<option value="${esc(city)}">${esc(city)}</option>`).join('')}</optgroup><optgroup label="Countries">${countries.map(country => `<option value="${esc(country)}">${esc(country)}</option>`).join('')}</optgroup></select><label class="form-label" for="new-gender">GENDER</label><select class="form-input" id="new-gender"><option value="">Surprise me</option><option value="female">Female</option><option value="male">Male</option><option value="nonbinary">Nonbinary</option></select><p class="form-note">Starting fresh replaces the current life and its family archive on this device.</p><button type="button" class="modal-secondary" data-close>Keep my life</button><button type="submit" class="modal-primary">Start fresh</button></form>`);
  }
  function act(action) {
    if (action.startsWith('choice-')) {
      const event = events[state.pending]; const choice = event && event.choices[Number(action.split('-')[1])];
      if (!choice || (choice.cost && state.balance < choice.cost)) return;
      if (state.pending === FUNERAL_EVENT) {
        const selected = Number(action.split('-')[1]), funeral = state.funeralQueue[0];
        if (!funeral || ![0,1].includes(selected)) return;
        const name = funeral.name || 'my loved one';
        if (selected === 0) { changeStats({happiness:random(3,5)}); state.karma = clamp(state.karma + random(3,5)); log(funeral.canAttend ? `I attended ${name}'s funeral.` : `I remembered ${name} privately while in prison.`); }
        else { state.karma = clamp(state.karma - random(2,5)); log(funeral.canAttend ? `I did not attend ${name}'s funeral.` : `I did not hold a private remembrance for ${name}.`); }
        state.funeralQueue.shift(); state.pending = state.funeralQueue.length ? FUNERAL_EVENT : null; render();
        if (state.pending !== null) showEvent(); else closeModal();
        return;
      }
      if (state.pending === ASKED_OUT_EVENT) {
        const candidate = state.dateCandidate, selected = Number(action.split('-')[1]); if (!candidate || state.partner || ![0,1].includes(selected)) return;
        if (selected === 0) { beginDating(candidate); log(`I accepted ${candidate.name}'s invitation, and we started dating.`); changeStats({happiness:15}); }
        else { state.dateCandidate = null; log(`I declined ${candidate.name}'s invitation to date.`); }
        state.pending = null; render(); closeModal(); return;
      }
      if (state.pending === LIGHTNING_EVENT) {
        if (Math.random() < .5) { state.stats = {happiness:100, health:100, smarts:100, looks:100}; log('I survived being struck by lightning, and felt unexpectedly revitalized.'); }
        else {
          const fatal = Math.random() < .2; state.stats = {happiness:0, health:fatal ? 0 : 1, smarts:0, looks:0};
          if (fatal) { state.alive = false; state.deathCause = 'lightning'; state.income = 0; state.job = ''; log('I died after being struck by lightning.'); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; }
          else log('I survived a lightning strike, but it left me badly injured.');
        }
        state.pending = null; render(); closeModal(); if (!state.alive) showSummary(); return;
      }
      if (state.pending === KIDNAPPING_EVENT) {
        const selected = Number(action.split('-')[1]); if (!state.partner || state.kidnappingRansom === null || selected < 0 || selected > 2) return;
        const name = state.partner, ransom = state.kidnappingRansom;
        if (selected === 0) { if (state.balance < ransom) return; state.balance -= ransom; log(`I paid ${money(ransom)} in ransom for ${name}.`); }
        else if (selected === 1) log(`I involved the police in the search for ${name}.`);
        else { state.karma = clamp(state.karma - random(8,16)); log('I did nothing in response to the kidnapping.'); }
        const rescued = selected === 0 ? Math.random() < 5 / 6 : selected === 1 ? Math.random() < 2 / 3 : false;
        if (rescued) { log(`${name} was safely released.`); state.partnerBond = clamp(state.partnerBond + random(30, 50)); changeStats({happiness: random(6,12)}); }
        else { log(`${name} and the kidnappers vanished. ${name} is presumed dead.`); state.funeralQueue.push({name, relationship:state.married ? 'spouse' : 'partner', canAttend:state.prisonYears === 0}); removePartner(false); changeStats({happiness:-20}); }
        state.kidnappingRansom = null; state.pending = rescued ? null : FUNERAL_EVENT; render(); if (state.pending !== null) showEvent(); else closeModal(); return;
      }
      if (state.pending === ARGUMENT_EVENT) {
        const target = state.argumentTarget && socialPerson(state.argumentTarget.kind, state.argumentTarget.index); if (!target) return;
        const selected = Number(action.split('-')[1]);
        if (selected === 0) { changeBond(state.argumentTarget.kind, state.argumentTarget.index, random(2, 4)); changeStats({happiness:-3}); state.karma = clamp(state.karma + 2); log(`I apologized to ${target.name}.`); }
        else if (selected === 1) log(`${target.name} and I agreed to disagree.`);
        else if (selected === 2) { changeBond(state.argumentTarget.kind, state.argumentTarget.index, -random(4, 7)); state.karma = clamp(state.karma - 4); log(`I called ${target.name} ${catalog.INSULTS?.length ? pick(catalog.INSULTS) : 'a jerk'}.`); }
        else return;
        state.argumentTarget = null; state.pending = null; render(); closeModal(); return;
      }
      state.balance -= (choice.cost || 0); if (choice.gain) creditCash(choice.gain); changeStats(choice.stats); if (choice.bond && state.partner) state.partnerBond = clamp(state.partnerBond + choice.bond); if (choice.friendBond && state.friends.length) state.friendBond = clamp(state.friendBond + choice.friendBond); if (choice.performance && state.job) state.careerPerformance = clamp(state.careerPerformance + choice.performance); if (choice.parentBond) { const parent = state.parents.find(p => p.alive); if (parent) parent.bond = clamp(parent.bond + choice.parentBond); } log(expandStory(choice.result)); if (choice.karma) state.karma = clamp(state.karma + choice.karma);
      if (choice.reconcile && state.partner) { const chance = state.partnerDetails ? (1 - state.partnerDetails.willpower / 100) ** (state.married ? 2 : 1) : .5; if (Math.random() < chance) { log(`${state.partner} decided to stay and try again.`); state.partnerBond = clamp(state.partnerBond + 10); } else { log(`${state.partner} decided to leave.`); removePartner(); } }
      if (choice.endPartner && state.partner) { removePartner(); }
      state.pending = null; render(); closeModal(); return;
    }
    if (action === 'slot-save' && state.pending === null) {
      const slots = readSlots(); if (!slots || slots.length >= MAX_SLOTS) { dataPanel('A local save slot is unavailable.', true); return; }
      const copy = JSON.parse(JSON.stringify(state));
      if (!validBackup({format:'little-life-backup',version:1,game:copy})) { dataPanel('This life could not be saved to a slot.', true); return; }
      const base = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      let id = base, suffix = 0; while (slots.some(slot => slot.id === id)) id = `${base}-${++suffix}`;
      slots.push({id, game:copy});
      const saved = writeSlots(slots); dataPanel(saved ? 'Local copy saved.' : 'Could not save a copy. Browser storage may be full or unavailable.', !saved); return;
    }
    if ((action.startsWith('slot-load-') || action.startsWith('slot-delete-')) && state.pending === null) {
      const loading = action.startsWith('slot-load-'), index = Number(action.slice(loading ? 10 : 12)), slots = readSlots(), slot = slots && slots[index];
      if (!Number.isInteger(index) || !slot) { dataPanel('This saved life is no longer available.', true); return; }
      pendingSlot = {id:slot.id, game:slot.game, operation:loading ? 'load' : 'delete'};
      modal(header(loading ? '📂' : '🗑️', 'LOCAL SAVE', loading ? 'Replace your current life?' : 'Delete this copy?', loading ? `Load ${esc(slot.game.name)} at age ${slot.game.age}? This replaces your current life, but not its other saved copies.` : `Delete the saved copy of ${esc(slot.game.name)}? Your current life and other copies will not change.`) + `<button class="modal-secondary" data-action="slot-cancel">Cancel</button><button class="modal-primary" data-action="slot-confirm">${loading ? 'Load this life' : 'Delete copy'}</button>`); return;
    }
    if (action === 'slot-reset' && state.pending === null && readSlots() === null) {
      try { const raw = localStorage.getItem(SLOT_KEY); if (raw === null) { dataPanel('Local slot data is no longer available.', true); return; } pendingSlotReset = raw; }
      catch (_) { dataPanel('Could not read the local slot data.', true); return; }
      modal(header('🗑️', 'LOCAL SAVE RECOVERY', 'Remove unreadable local slots?', 'This permanently deletes the unreadable slot data. Download it first if you want to keep a recovery copy. Your current autosave will not be changed.') + '<button class="modal-secondary" data-action="slot-cancel">Cancel</button><button class="modal-primary" data-action="slot-reset-confirm">Remove unreadable slots</button>'); return;
    }
    if (action === 'slot-reset-confirm' && state.pending === null && pendingSlotReset !== null) {
      try {
        if (localStorage.getItem(SLOT_KEY) !== pendingSlotReset || readSlots() !== null) { dataPanel('Local slot data changed; nothing was removed.', true); return; }
        localStorage.removeItem(SLOT_KEY); dataPanel('Unreadable local slot data removed.');
      } catch (_) { dataPanel('Could not remove the unreadable local slot data.', true); }
      return;
    }
    if (action === 'slot-cancel' && state.pending === null) { dataPanel(); return; }
    if (action === 'slot-confirm' && pendingSlot && state.pending === null) {
      const slots = readSlots(), slot = slots?.find(item => item.id === pendingSlot.id);
      if (!slot || JSON.stringify(slot.game) !== JSON.stringify(pendingSlot.game)) { dataPanel('This saved life changed or is no longer available; nothing was changed.', true); return; }
      if (pendingSlot.operation === 'delete') { const remaining = slots.filter(item => item.id !== slot.id), deleted = writeSlots(remaining); dataPanel(deleted ? 'Local copy deleted.' : 'Could not delete the local copy.', !deleted); return; }
      state = slot.game; replaceUnreadable = true; pendingSlot = null; closeModal(); render(); if (state.pending !== null) showEvent(); return;
    }
    if (action === 'import-cancel' && state.pending === null) { dataPanel(); return; }
    if (action === 'export' && state.pending === null) { exportBackup(); return; }
    if (action === 'retry-save-read' && state.pending === null && storageReadFailed) {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw === null) { dataPanel('No original save was found. Start a new life or restore a backup to resume autosaving.'); return; }
        unreadableSave = raw; storageReadFailed = false;
        dataPanel('Original data is available to download. Reload the page to try resuming it, or explicitly replace it.');
      } catch (_) { dataPanel('Browser storage still cannot be read. Nothing was changed.', true); }
      return;
    }
    if (action === 'export-unreadable-slots' && state.pending === null && readSlots() === null) { try { const raw = localStorage.getItem(SLOT_KEY); if (raw !== null) { downloadBlob(raw, 'little-life-unreadable-slots.txt', 'text/plain'); $('#data-message').textContent = 'Original local slot data downloaded without changes.'; } } catch (_) { dataPanel('Could not read the local slot data.', true); } return; }
    if (action === 'export-unreadable' && state.pending === null && unreadableSave !== null) { downloadBlob(unreadableSave, 'little-life-unreadable-save.txt', 'text/plain'); $('#data-message').textContent = 'Original save data downloaded without changes.'; return; }
    if (action === 'import-confirm' && pendingImport && state.pending === null) { state = pendingImport; replaceUnreadable = true; pendingImport = null; closeModal(); render(); if (state.pending !== null) showEvent(); return; }
    if (action === 'life-statistics' && state.pending === null) { lifeStatistics(); return; }
    if (action === 'financial-overview' && state.pending === null) { financialOverview(); return; }
    if (action === 'summary' && state.pending === null && !state.alive) { showSummary(); return; }
    if (action === 'show-legacy' && state.pending === null) { showLegacy(); return; }
    if (action.startsWith('archive-') && state.pending === null) { showArchive(Number(action.slice(8))); return; }
    if (action === 'choose-successor' && state.pending === null && !state.alive) { showSuccessors(); return; }
    if (action.startsWith('successor-') && state.pending === null && !state.alive) { confirmSuccessor(Number(action.slice(10))); return; }
    if (action.startsWith('inherit-') && state.pending === null && !state.alive) { inheritLife(Number(action.slice(8))); return; }
    if (action === 'restart-confirm') { if (state.pending === null) newLifeForm(); return; }
    if (!state.alive || state.pending !== null) return;
    if (state.prisonYears && !['prison-read', 'prison-exercise', 'prison-contact', 'prison-doctor'].includes(action)) return;
    if (action === 'surrender') { modal(header('🕊️', 'END THIS CHAPTER', 'Surrender this life?', 'This ends the current life. You can review it and continue as an eligible child afterward.') + '<button class="modal-secondary" data-close>Keep living</button><button class="modal-primary" data-action="surrender-confirm">Continue</button>'); return; }
    if (action === 'surrender-confirm') { modal(header('🕊️', 'FINAL CONFIRMATION', 'End this life now?', 'This cannot be undone. Your current character will die.') + '<button class="modal-secondary" data-close>Keep living</button><button class="modal-primary" data-action="surrender-final">End this life</button>'); return; }
    if (action === 'surrender-final') { state.alive = false; state.deathCause = 'surrender'; state.income = 0; state.job = ''; log('I surrendered my life.'); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; closeModal(); render(); showSummary(); return; }
    if (action === 'meet-date' && state.age >= 18 && !state.partner && (state.dateCandidate || state.moments > 0)) {
      if (!state.dateCandidate) { state.dateCandidate = makeDateCandidate(); state.moments--; log(`I met ${state.dateCandidate.name} as a potential date.`); render(); }
      datePanel(); return;
    }
    if ((action === 'date-ask' || action === 'date-decline') && state.dateCandidate && !state.partner && state.age >= 18) {
      const candidate = state.dateCandidate; state.dateCandidate = null;
      if (action === 'date-decline') log(`I decided not to ask ${candidate.name} out.`);
      else {
        const compatibility = clamp(Math.round((state.stats.looks - candidate.looks + 50) * 2 / 3 + (state.stats.smarts - candidate.smarts + 50) / 3));
        const accepted = Math.random() < (Math.random() < 1 / 6 ? state.karma / 100 : compatibility / 100);
        if (accepted) { beginDating(candidate); log(`${candidate.name} accepted my invitation, and we started dating.`); changeStats({happiness:15}); }
        else { log(`${candidate.name} declined my invitation to date.`); changeStats({happiness:-4}); }
      }
      closeModal(); render(); return;
    }
    if (action === 'adoption-agency' && state.age >= 21 && state.age <= 70 && state.moments > 0 && state.children.length + (state.pregnancy ? 1 : 0) < 4) {
      const available = firstNames.filter(n => !state.children.includes(n) && !state.name.startsWith(n + ' '));
      adoptionCandidate = {name:pick(available), age:random(1, 17), cost:random(10000, 30000), smarts:random(0, 50) + random(0, 50), looks:random(0, 50) + random(0, 50)};
      const c = adoptionCandidate;
      modal(header('🏠', 'ADOPTION AGENCY', 'Meet a child', `You ${state.partner ? `and ${esc(state.partner)} have` : 'have'} an opportunity to adopt ${esc(c.name)}, age ${c.age}. ${state.partner ? `${esc(state.partner)} will be recorded as the other adoptive parent. ` : ''}Agency assessment: smarts ${c.smarts}%, looks ${c.looks}%. These follow the child into their future life. Adoption costs ${money(c.cost)}. Child care costs $2,000 per year until age 18.`) + option('adoption-confirm', '🍼', `Adopt ${esc(c.name)}`, `Pay ${money(c.cost)} and welcome this child into your family.`, state.balance < c.cost) + '<button class="modal-secondary" data-close>Not right now</button>'); return;
    }
    if (action === 'cancel-engagement' && state.partner && state.engaged && !state.married && state.moments > 0) { modal(header('💔', 'A DIFFICULT DECISION', 'Call off the engagement?', `You will remain together, but your bond with ${esc(state.partner)} will suffer.`) + '<button class="modal-secondary" data-close>Keep the engagement</button><button class="modal-primary" data-action="cancel-engagement-final">Call off engagement</button>'); return; }
    if (action === 'end-pregnancy' && state.pregnancy && state.moments > 0) { modal(header('🩺', 'YOUR CHOICE', 'End the pregnancy?', 'The pregnancy will end and no birth or miscarriage will occur from it. This decision cannot be undone.') + '<button class="modal-secondary" data-close>Continue pregnancy</button><button class="modal-primary" data-action="end-pregnancy-final">End pregnancy</button>'); return; }
    if (action === 'breakup' && state.partner && state.moments > 0) { modal(header('💔', 'A DIFFICULT DECISION', state.married ? 'Get divorced?' : 'End this relationship?', state.married ? `A divorce settlement will cost 40–60% of your current cash. Your spouse designation in your will will be reset.` : 'Are you sure you want to break up?') + '<button class="modal-secondary" data-close>Keep the relationship</button><button class="modal-primary" data-action="breakup-final">Confirm</button>'); return; }
    if (action === 'pension-rules' && state.age >= 18) { pensionPanel(); return; }
    if ((action === 'pension-flat' || action === 'pension-career') && state.age >= 18) { const policy = action.slice(8); if (policy === state.pensionPolicy) return; state.pensionPolicy = policy; closeModal(); render(); return; }
    if (action === 'tax-rules' && state.age >= 18) { taxPanel(); return; }
    if ((action === 'tax-flat' || action === 'tax-progressive') && state.age >= 18) { const policy = action.slice(4); if (policy === state.taxPolicy) return; state.taxPolicy = policy; closeModal(); render(); return; }
    if (action === 'will' && state.age >= 18 && state.moments > 0) { willPanel(); return; }
    if (action === 'doctor' && state.additionalIllnesses.length && state.moments > 0 && (state.age < 18 || state.balance >= 500)) { doctorPanel(); return; }
    if (action === 'movies' && state.age >= 8 && state.moments > 0 && (state.age < 18 || state.balance >= 20)) { moviesPanel(); return; }
    if (action.startsWith('movie-genre-') && state.moments > 0) { const genre = action.slice(12); if (movieGenres[genre] && state.age >= movieGenres[genre][2] && (state.age < 18 || state.balance >= 20)) moviesPanel(genre); return; }
    if (action === 'pet' && state.age >= 18 && !state.pet && state.balance >= 500 && state.moments > 0) { petPanel(); return; }
    if (action === 'shopping' && state.age >= 18) { shoppingPanel(); return; }
    if (action.startsWith('shop-') && state.age >= 18 && ['car', 'boat', 'plane', 'house'].includes(action.slice(5))) { shoppingPanel(action.slice(5)); return; }
    if (action === 'bankruptcy' && state.age >= 18 && state.moments > 0 && state.debt > 2 * (state.balance + state.savings)) { modal(header('⚠️', 'A DIFFICULT DECISION', 'Declare bankruptcy?', 'Your bank debt will be cleared, but you will lose your cash, savings, investments, possessions and job. Student loans remain.') + '<button class="modal-secondary" data-close>Cancel</button><button class="modal-primary" data-action="bankrupt-confirm">Declare bankruptcy</button>'); return; }
    if (action === 'market' && state.age >= 18) { marketPanel(); return; }
    if (action === 'wedding' && state.partner && state.engaged && !state.married && state.moments > 0) { weddingPanel(); return; }
    if (action === 'social' && state.age >= 3) { socialTargets(); return; }
    if (action.startsWith('social-target-') && state.age >= 3) { const parts = action.slice(14).split('-'); socialPersonPanel(parts[0], Number(parts[1])); return; }
    if (action === 'lottery' && state.age >= 18 && state.balance >= 4 && state.moments > 0) { lotteryPanel(); return; }
    if (action === 'surgery' && state.age >= 18 && state.balance >= 25000 && state.moments > 0 && (state.lastSurgery === null || state.age - state.lastSurgery >= 6)) { surgeryPanel(); return; }
    if (action === 'hours' && state.job && state.moments > 0) { hoursPanel(); return; }
    if (action === 'reading-session' && state.age >= 6 && (state.readingBook || state.moments > 0)) { readingPanel(); return; }
    if (action.startsWith('reading-begin-')) {
      const index = Number(action.slice(14)), book = books[index]; if (!Number.isInteger(index) || !book || state.age < book[3] || state.readingBook || state.moments <= 0) return;
      state.readingBook = {index, pages:0}; state.moments--; log(`I started reading ${book[0]}.`); render(); readingPanel(); return;
    }
    if (action === 'reading-abandon' && state.readingBook) { const book = books[state.readingBook.index]; log(`I abandoned ${book[0]} after ${state.readingBook.pages} pages.`); state.readingBook = null; closeModal(); render(); return; }
    if (action.startsWith('reading-page-') && state.readingBook) {
      const amount = Number(action.slice(13)), book = books[state.readingBook.index]; if (![1, 50].includes(amount) || !book) return;
      state.readingBook.pages = Math.min(book[2], state.readingBook.pages + amount);
      if (state.readingBook.pages === book[2]) { finishBook(book); state.readingBook = null; closeModal(); render(); } else { render(); readingPanel(); } return;
    }
    if (action === 'read' && state.age >= 6) { booksPanel(); return; }
    if (action === 'conversation' && state.age >= 3) { conversationPanel(); return; }
    if (action === 'gigs' && state.age >= 16) { gigsPanel(); return; }
    if ((action === 'more-majors' || action === 'core-majors') && state.age >= 18 && state.education !== 'None' && !state.studying) { universityPanel(action === 'more-majors'); return; }
    if (action === 'university' && state.age >= 18 && state.education !== 'None' && !state.studying) { universityPanel(); return; }
    if (action === 'diet' && state.age >= 18) { dietPanel(); return; }
    if (action === 'crime' && state.age >= 18) { crimePanel(); return; }
    if (action === 'move-country-menu' && state.age >= 18 && state.balance >= 3000 && state.moments > 0) { countryMovePanel(); return; }
    if (action === 'travel' && state.age >= 18 && state.balance >= 3000) { travelPanel(); return; }
    if (action === 'market-custom' && state.age >= 18 && state.moments > 0) { customMarketPanel(); return; }
    if (action === 'bank-custom' && state.age >= 18 && state.moments > 0) { customBankPanel(); return; }
    if (action === 'hobbies' && state.age >= 8) { hobbiesPanel(); return; }
    if (state.moments <= 0) return;
    if (action === 'quit' && state.job) { modal(header('🚪', 'A CAREER DECISION', 'Quit your job?', `Leave your position as ${esc(state.job)}? Your income and current-job pension records will reset. This uses one moment.`) + '<button class="modal-secondary" data-close>Keep my job</button><button class="modal-primary" data-action="quit-confirm">Quit my job</button>'); return; }
    if (action === 'retire' && state.job && state.age >= 65 && (state.pensionPolicy === 'flat' || state.workYears >= 10)) { modal(header('🌅', 'A NEW CHAPTER', 'Retire from work?', `Leave your position as ${esc(state.job)} and receive an annual pension of ${money(pensionAmount(state))} under your current pension rules. This uses one moment.`) + '<button class="modal-secondary" data-close>Keep working</button><button class="modal-primary" data-action="retire-confirm">Retire</button>'); return; }
    if (action.startsWith('social-do-insult-')) {
      const ref = action.slice(17), [kind, rawIndex] = ref.split('-'), index = Number(rawIndex), person = socialPerson(kind, index);
      if (!person || state.age < 3 || (person.age !== null && person.age < 5)) return;
      modal(header('💢', 'A CHOICE OF WORDS', `Insult ${esc(person.name)}?`, 'This will hurt your bond and karma, and may provoke a response.') + `<button class="modal-secondary" data-close>Never mind</button><button class="modal-primary" data-action="social-insult-confirm-${kind}-${index}">Insult them</button>`); return;
    }
    if (action.startsWith('social-insult-confirm-')) action = `social-do-insult-${action.slice(22)}`;
    if (action === 'job') { jobsPanel(); return; }
    if (action.startsWith('job-')) {
      const job = jobs[Number(action.slice(4))];
      if (!qualifiedFor(job)) return;
      interviewPanel(Number(action.slice(4))); return;
    } else if (action.startsWith('interview-answer-')) {
      const answer = Number(action.slice(17)); if (!pendingInterview || !Number.isInteger(answer) || answer < 0 || answer >= 4) return;
      const job = jobs[pendingInterview.job], question = interviews[pendingInterview.question]; if (!qualifiedFor(job) || !question) return;
      if (question[2].includes(answer)) { state.job = job.name; state.income = job.salary; state.workYears = 0; state.salaryHistory = []; state.studying = false; state.studyMajor = ''; state.retired = false; state.careerLevel = 1; state.careerPerformance = 50; state.jobHours = 40; state.jobWarnings = 0; state.jobWarned = false; state.lastRaiseRequest = null; state.raiseRejections = 0; log(`I passed my interview and started a new job as a ${job.name.toLowerCase()}.`); changeStats({ happiness: 4 }); }
      else { log(`I interviewed for ${job.name.toLowerCase()} but did not get the job.`); changeStats({happiness: -3}); }
    } else if (action.startsWith('major-') || action.startsWith('majorloan-') || action.startsWith('majorparent-') || action.startsWith('majorscholar-')) {
      const loan = action.startsWith('majorloan-'), parentPays = action.startsWith('majorparent-'), scholarship = action.startsWith('majorscholar-'), key = action.slice(scholarship ? 13 : parentPays ? 12 : loan ? 10 : 6); const cost = universityCost();
      const parent = parentPays ? state.parents.filter(p => p.alive).sort((a, b) => b.bond - a.bond)[0] : null;
      if (!Object.hasOwn(majors, key) || state.age < 18 || state.education === 'None' || state.studying || (!loan && !parentPays && !scholarship && state.balance < cost) || state.major === key || (loan && state.studentLoan + cost > 1000000000) || (parentPays && !parent) || (scholarship && state.scholarshipAttempt === state.age)) return;
      if (scholarship) state.scholarshipAttempt = state.age;
      if (scholarship && state.stats.smarts < random(random(75, 85), 100)) { log('My scholarship application was rejected.'); changeStats({happiness: -8}); }
      else if (parentPays && Math.random() >= parent.bond / 100) { log(`${parent.name} declined to pay my university tuition.`); parent.bond = clamp(parent.bond - 3); changeStats({happiness: -4}); }
      else { if (loan) state.studentLoan += cost; else if (!parentPays && !scholarship) state.balance -= cost; state.studying = true; state.studyStarted = state.age; state.studyMajor = key; state.job = ''; state.retired = false; state.income = 0; state.workYears = 0; state.salaryHistory = []; log(`I enrolled in ${majors[key]} at university for ${money(cost)}${loan ? ' using a student loan' : parentPays ? `, paid by ${parent.name}` : scholarship ? ', covered by a scholarship' : ''}. Graduation is four years away.`); }
    }
    else if (action.startsWith('gig-')) { const key = action.slice(4); const gig = gigs[key]; if (!gig || state.age < 16 || (key === 'tutor' && state.stats.smarts < 65) || (key === 'freelance' && (state.age < 18 || Math.max(state.skills.art, state.skills.music) < 2))) return; creditCash(gig[1]); log(`I completed ${gig[0].toLowerCase()} and earned ${money(gig[1])}.`); changeStats({ happiness: -1 }); }
    else if (action.startsWith('social-do-')) {
      const [verb, kind, rawIndex] = action.slice(10).split('-'), index = Number(rawIndex), person = socialPerson(kind, index);
      if (!person || state.age < 3) return;
      if (verb === 'visit' && state.age >= 5 && (person.age === null || person.age >= 5)) {
        const ref = `${kind}-${index}`;
        if (person.bond < 15) { log(`${person.name} refused to spend time with me.`); changeStats({happiness:-4}); }
        else {
          const enjoyment = Math.max(random(0, 70), random(0, 70)) + random(0, 30);
          const theirEnjoyment = Math.round((Math.random() + Math.random()) * 50 * .5 + person.bond * .5);
          log(`I took ${person.name} ${pick(outings)}. My enjoyment: ${enjoyment}%; theirs: ${theirEnjoyment}%.`);
          if (!state.socialVisits.includes(ref)) { changeStats({happiness:Math.round(enjoyment / 12)}); changeBond(kind,index,Math.round(theirEnjoyment / 12)); state.socialVisits.push(ref); }
        }
      }
      else if (verb === 'talk' && (person.age === null || person.age >= 3)) converseWithPerson(kind, index, person, false);
      else if (verb === 'heart' && state.age >= 13 && (person.age === null || person.age >= 13)) converseWithPerson(kind, index, person, true);
      else if (verb === 'compliment' && state.age >= 6 && (person.age === null || person.age >= 5)) {
        const words = catalog.COMPLIMENTS || [], ref = `${kind}-${index}`; let appreciation = random(0,50) + random(0,50);
        if (person.bond >= random(51,100)) appreciation = Math.max(appreciation, random(0,50) + random(0,50));
        else if (person.bond <= random(0,49)) appreciation = Math.min(appreciation, random(0,50) + random(0,50));
        log(`I told ${person.name} they are ${words.length ? pick(words) : 'wonderful'}. Appreciation: ${appreciation}%.`);
        if (!state.socialCompliments.includes(ref)) {
          state.socialCompliments.push(ref); changeBond(kind,index,Math.round(appreciation / 6)); state.karma = clamp(state.karma + 2);
          if (random(1,300) <= Math.round(appreciation * person.bond / 50)) { log(`${person.name} told me I am ${words.length ? pick(words) : 'wonderful'}!`); changeStats({happiness:8}); }
        }
      }
      else if (verb === 'insult' && (person.age === null || person.age >= 5)) {
        const words = catalog.INSULTS || [], sibling = kind === 'sibling' ? state.siblings[index] : null;
        log(`I called ${person.name} ${words.length ? pick(words) : 'a jerk'}.`); changeBond(kind, index, -12); state.karma = clamp(state.karma - 4);
        const petulance = Number.isInteger(sibling?.petulance) ? (sibling.petulance / 100) ** 1.5 : null;
        const attackChance = petulance !== null ? .3 * petulance : kind === 'partner' && state.partnerDetails ? .45 * (state.partnerDetails.craziness / 100) ** 2 : 0;
        const insultChance = petulance !== null ? .5 * petulance : (100 - person.bond) / 400;
        if (attackChance && Math.random() < attackChance) { const damage = random(4,10); log(`${person.name} attacked me after the insult.`); changeStats({health:-damage, happiness:-damage}); changeBond(kind,index,-random(4,8)); }
        else if (Math.random() < insultChance) { log(`${person.name} insulted me back.`); changeStats({happiness: -5}); }
      }
      else if (verb === 'gift' && state.balance >= 100) { state.balance -= 100; changeBond(kind, index, 15); state.karma = clamp(state.karma + 2); log(`I gave ${person.name} a thoughtful gift.`); changeStats({happiness: 4}); }
      else if (verb === 'ask' && kind === 'parent' && state.age >= 6 && (state.parentAsks[index] === null || state.age - state.parentAsks[index] >= 3)) {
        const parent = state.parents[index], profiled = Number.isInteger(parent.generosity), tracksRefusals = Number.isInteger(parent.moneyRefusals);
        if (tracksRefusals && parent.moneyRefusals >= 3) parent.moneyRefusals = 0;
        if (!tracksRefusals) state.parentAsks[index] = state.age;
        const chance = profiled ? Math.min(1, parent.generosity / 35) : person.bond / 100;
        if (Math.random() < chance) {
          const amount = profiled ? Math.max(1, Math.round(5 ** (parent.wealth / 22) * (parent.generosity / 100) ** 2 * Math.sqrt(state.age) * (0.6 + Math.random() * .8))) : random(50, 500);
          if (tracksRefusals) { parent.moneyRefusals = 0; state.parentAsks[index] = state.age; }
          creditCash(amount); changeBond(kind, index, -2); log(`${person.name} gave me ${money(amount)} when I asked for help.`);
        } else { changeBond(kind, index, -5); log(`${person.name} declined to give me money.`); if (tracksRefusals) { parent.moneyRefusals++; if (parent.moneyRefusals >= 3) { state.parentAsks[index] = state.age; log(`${person.name} asked me to stop requesting money for a while.`); } } }
      }
      else return;
    }
    else if (action === 'toys' && state.age >= 3 && state.age < 13) { const sayings = catalog[state.age < 6 ? 'TOYS_3_5' : state.age < 10 ? 'TOYS_6_9' : 'TOYS_10_12'] || []; const depressed = currentConditions().some(condition => condition.name === 'depression'); log(depressed ? 'I did not feel like playing, but decided to try anyway.' : sayings.length ? firstPerson(pick(sayings)) : 'I played with my toys.'); changeStats({happiness: depressed ? random(0,6) : random(5,10)}); }
    else if (action === 'crafts' && state.age >= 5) { const blocked = state.age >= random(5,10) && Math.random() < .1; const sayings = catalog[blocked ? 'CRAFTS_BLOCKED' : state.age < 6 ? 'CRAFTS_5' : state.age < 10 ? 'CRAFTS_6_9' : state.age < 13 ? 'CRAFTS_10_12' : 'CRAFTS_13_PLUS'] || []; log(sayings.length ? firstPerson(pick(sayings)) : blocked ? 'I could not think of anything to make.' : 'I made something creative.'); changeStats(blocked ? {happiness:-random(2,4)} : {happiness: 5, smarts: hasTrait('nerd') ? 3 : 2}); }
    else if (action === 'music-listen' && state.age >= 12) { const artists = catalog.MUSIC_ARTISTS || []; log(artists.length ? `I listened to music by ${pick(artists)}.` : 'I listened to music.'); state.stress = clamp(state.stress - 5); changeStats({happiness: 6, health: 1}); }
    else if (action === 'library' && state.age >= 6) { log('I visited the library and explored the shelves.'); changeStats({smarts: hasTrait('nerd') || hasTrait('genius') ? 7 : 5, happiness: hasTrait('bookworm') ? 5 : 2}); }
    else if (action.startsWith('surgeon-')) {
      const index = Number(action.slice(8)), reputation = [55, 85][index], name = ['Brooks', 'Reed'][index];
      if (!name || state.age < 18 || state.balance < 25000 || (state.lastSurgery !== null && state.age - state.lastSurgery < 6)) return;
      state.balance -= 25000; state.lastSurgery = state.age;
      if (Math.random() < .2 * (1 - reputation / 100)) { const damage = random(8, 20); log(`My plastic surgery with Dr. ${name} was botched. My health, looks and happiness suffered.`); changeStats({ health: -damage, looks: -damage, happiness: -damage }); }
      else { log(`My plastic surgery with Dr. ${name} was successful.`); changeStats({ looks: random(10, 20), happiness: 10 }); }
    }
    else if (action.startsWith('hours-')) { const hours = Number(action.slice(6)); if (!state.job || !Number.isInteger(hours) || hours < 38 || hours > 70 || state.jobHours === hours) return; state.jobHours = hours; log(`I changed my working schedule to ${hours} hours per week.`); }
    else if (action === 'raise' && state.job && state.lastRaiseRequest !== state.age) {
      state.lastRaiseRequest = state.age;
      if (Math.random() < state.careerPerformance / 100 * .7) { const increase = Math.min(BANK_LIMIT - state.income, Math.max(1, Math.round(state.income * .05))); state.income += increase; state.raiseRejections = 0; log(`My request for a raise was approved. My salary increased by ${money(increase)} per year.`); changeStats({ happiness: 5 }); }
      else { state.raiseRejections = Math.min(100, state.raiseRejections + 1); log('My request for a raise was rejected.'); changeStats({ happiness: -3 }); if (state.raiseRejections >= 3 && Math.random() < .1) { log('After repeated requests, my employer fired me.'); state.job = ''; state.income = 0; state.workYears = 0; state.salaryHistory = []; changeStats({ happiness: -15 }); } }
    }
    else if (action === 'prison-read' && state.prisonYears) { log('I read in the prison library.'); changeStats({ smarts: 5, happiness: 1 }); }
    else if (action === 'prison-exercise' && state.prisonYears) { log('I exercised in the prison yard.'); changeStats({ health: 5, happiness: 1 }); }
    else if (action === 'prison-contact' && state.prisonYears) { log('I wrote to my loved ones while serving my sentence.'); if (state.partner) state.partnerBond = clamp(state.partnerBond + 10); state.parents.filter(p => p.alive).forEach(p => { p.bond = clamp(p.bond + 5); }); if (state.friends.length) state.friendBond = clamp(state.friendBond + 10); changeStats({ happiness: 5 }); }
    else if (action === 'prison-doctor' && state.prisonYears) { if (state.illness) { log(`The prison infirmary treated me for ${state.illness}.`); removeCondition(0); } else log('I visited the prison infirmary.'); changeStats({ health: 8 }); }
    else if (action.startsWith('diet-') && state.age >= 18) { const key = action.slice(5); if (!Object.hasOwn(diets, key) || key === state.diet) return; state.diet = key; log(`I changed to a ${diets[key].label.toLowerCase()} diet.`); }
    else if (action === 'boat-license' && state.age >= 18 && !state.boatLicense && state.balance >= 500) { state.balance -= 500; state.boatLicense = true; log('I earned my boating license.'); changeStats({happiness: 3}); }
    else if (action === 'pilot-license' && state.age >= 18 && !state.pilotLicense && state.balance >= 10000) { state.balance -= 10000; state.pilotLicense = true; log('I earned my pilot license.'); changeStats({happiness: 3}); }
    else if (action === 'license' && state.age >= 16 && !state.license && state.balance >= 250) { state.balance -= 250; state.license = true; log('I got my driver’s license.'); changeStats({ happiness: 3 }); }
    else if (action.startsWith('move-country-')) { const index = Number(action.slice(13)); if (!Number.isInteger(index) || !moveTo(countries[index])) return; }
    else if (action.startsWith('move-')) { const index = Number(action.slice(5)); if (!Number.isInteger(index) || !moveTo(cities[index])) return; }
    else if (action.startsWith('offense-')) {
      const crime = crimes[action.slice(8)]; if (!crime || state.age < 18) return; state.karma = clamp(state.karma - 5);
      if (Math.random() < crime.chance) { const gain = random(crime.min, crime.max); creditCash(gain); log(`I got away with ${crime.name} and gained ${money(gain)}.`); changeStats({ happiness: 3 }); }
      else { const fine = Math.min(state.balance, crime.fine); state.balance -= fine; state.prisonYears = crime.sentence; state.convictions = Math.min(100, state.convictions + 1); state.job = ''; state.income = 0; state.workYears = 0; state.salaryHistory = []; state.retired = false; state.studying = false; state.studyMajor = ''; log(`I was caught for ${crime.name}, paid ${money(fine)}, and was sentenced to ${crime.sentence} year${crime.sentence === 1 ? '' : 's'} in prison.`); changeStats({ happiness: -12 }); }
    }
    else if (action === 'walk' && state.age >= 5) { log('I went for a walk and enjoyed some fresh air.'); changeStats({ health: 4, happiness: 3 }); }
    else if (action.startsWith('book-')) { const book = books[Number(action.slice(5))]; if (!book || state.age < book[3]) return; finishBook(book); }
    else if (action.startsWith('chat-')) { const target = action.slice(5); let person; if (target.startsWith('parent-')) person = state.parents[Number(target.slice(7))]; else if (target.startsWith('sibling-')) person = state.siblings[Number(target.slice(8))]; else if (target === 'partner' && state.partner) person = {name: state.partner, bond: state.partnerBond, alive: true}; else if (target === 'friend' && state.friends.length) person = {name: state.friends[0], bond: state.friendBond, alive: true}; if (!person || !person.alive || state.age < 3) return; const topics = state.age < 6 ? catalog.CHATS_INFANT : state.age < 13 ? catalog.CHATS_CHILD : catalog.CHATS; log(`I talked with ${person.name} about ${topics.length ? pick(topics) : 'life'}.`); if (target === 'partner') state.partnerBond = clamp(state.partnerBond + 8); else if (target === 'friend') state.friendBond = clamp(state.friendBond + 8); else person.bond = clamp(person.bond + 8); changeStats({ happiness: 3 }); }
    else if (action === 'meditate' && state.age >= 5) { state.stress = clamp(state.stress - (hasTrait('meditator') ? 15 : 10)); state.karma = clamp(state.karma + 2); state.meditations = Math.min(1000, state.meditations + 1); log('I took a moment to slow down and meditate.'); if (state.meditations >= 3) learnTrait('meditator'); changeStats({ happiness: hasTrait('meditator') ? 8 : 5, health: 1 }); }
    else if (action === 'gym' && state.age >= 13) { log('I exercised and felt stronger for it.'); changeStats({ health: 6, looks: 3, happiness: 1 }); }
    else if (action.startsWith('practice-') && state.age >= 8 && skills[action.slice(9)] && state.skills[action.slice(9)] < 5) { const key = action.slice(9); state.skills[key]++; log(`I practiced ${skills[key][1].toLowerCase()} and reached level ${state.skills[key]}.`); changeStats({ happiness: 4, ...(key === 'fitness' ? { health: 3 } : { smarts: 1 }) }); }
    else if (action.startsWith('doctor-treat-')) { const index = Number(action.slice(13)); if (!Number.isInteger(index) || index < 0 || !treatCondition(index)) return; }
    else if (action === 'doctor' && state.balance >= (state.age < 18 ? 0 : (state.illness ? 500 : 100))) {
      if (state.illness) { if (!treatCondition(0)) return; }
      else { if (state.age >= 18) state.balance -= 100; log('I visited the doctor for a checkup.'); changeStats({health: 10}); }
    }
    else if (action === 'alternative-doctor' && state.age >= 18 && state.balance >= 100) { state.balance -= 100; const effect = random(-15, 8); log(`I tried an unproven alternative treatment. It ${effect < 0 ? 'harmed' : 'improved'} my health.`); changeStats({ health: effect, happiness: effect }); if (effect > 0 && state.illness && Math.random() < .05) { log(`I recovered from ${state.illness}.`); removeCondition(0); } }
    else if (action.startsWith('sibling-')) { const sibling = state.siblings[Number(action.slice(8))]; if (!sibling || !sibling.alive) return; sibling.bond = clamp(sibling.bond + 18); log(`I took my sibling ${sibling.name} ${pick(outings)}.`); changeStats({ happiness: 5 }); }
    else if (action.startsWith('parent-')) { const parent = state.parents[Number(action.slice(7))]; if (!parent || !parent.alive) return; parent.bond = clamp(parent.bond + 18); log(`I took my parent ${parent.name} ${pick(outings)}.`); changeStats({ happiness: 5 }); }
    else if (action === 'family') { log(`I took my family ${pick(outings)}.`); changeStats({ happiness: 5 }); }
    else if (action === 'friend' && state.age >= 5) { if (!state.friends.length) { state.friendBond = 60; state.friends.push(pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && n !== state.partner))); log(`I made a new friend named ${state.friends[0]}.`); } else { log(`I took my friend ${state.friends[0]} ${pick(outings)}.`); state.friendBond = clamp(state.friendBond + 20); } changeStats({ happiness: 6 }); }
    else if (action === 'date' && state.age >= 18) { if (!state.partner) { state.partnerBond = clamp(45 + Math.round(state.stats.looks / 5)); state.partner = pick(firstNames.filter(n => !state.name.startsWith(n + ' ') && !state.friends.includes(n))); state.dateCandidate = null; log(`I met ${state.partner}, and we started dating!`); } else { log(`I took ${state.partner} ${pick(outings)}.`); state.partnerBond = clamp(state.partnerBond + 20); } changeStats({ happiness: 8 }); }
    else if (action === 'propose' && state.partner && !state.married && !state.engaged && state.proposalRejectedAt !== state.age) { const p = state.partnerDetails; const accepted = p?.yearsTogether !== undefined ? p.yearsTogether >= random(3, 8 - Math.floor(p.craziness / 20)) && state.partnerBond >= random(50,60) + random(0,40) : Math.random() < state.partnerBond / 100; if (accepted) { state.proposalRejectedAt = null; state.engaged = true; state.partnerBond = clamp(state.partnerBond + 15); log(`${state.partner} accepted my proposal!`); changeStats({happiness: 10}); } else { state.proposalRejectedAt = state.age; state.partnerBond = clamp(state.partnerBond - 5); log(`${state.partner} turned down my proposal.`); changeStats({happiness: -5}); } }
    else if (action === 'cancel-engagement-final' && state.partner && state.engaged && !state.married) { state.engaged = false; state.partnerBond = clamp(state.partnerBond - 15); log(`I called off my engagement to ${state.partner}.`); changeStats({happiness: -4}); }
    else if (action.startsWith('venue-')) { const venue = weddingVenues[Number(action.slice(6))]; if (!venue || !state.partner || !state.engaged || state.married || state.partnerBond < 60 || state.balance < venue[1]) return; state.balance -= venue[1]; state.married = true; state.engaged = false; state.lastVows = state.age; state.partnerBond = clamp(state.partnerBond + 20); log(`${state.partner} and I got married at the ${venue[0].toLowerCase()} for ${money(venue[1])}.`); changeStats({happiness: 12}); }
    else if (action === 'renew-vows' && state.partner && state.married && state.balance >= 500 && state.vowRejectedAt !== state.age && (state.lastVows === null || state.age - state.lastVows >= 10)) { if (state.partnerBond < random(40,70)) { state.vowRejectedAt = state.age; state.partnerBond = clamp(state.partnerBond - random(4,8)); log(`${state.partner} declined to renew our wedding vows.`); } else { state.balance -= 500; state.lastVows = state.age; state.vowRejectedAt = null; state.partnerBond = clamp(state.partnerBond + random(15,20)); log(`${state.partner} and I renewed our wedding vows.`); changeStats({happiness: random(10,16)}); } }
    else if (action === 'marry' && state.partner && !state.married && state.balance >= 2000 && state.partnerBond >= 60) { state.balance -= 2000; state.married = true; state.engaged = false; state.proposalRejectedAt = null; state.lastVows = state.age; log(`${state.partner} and I got married!`); changeStats({ happiness: 12 }); }
    else if (action === 'adoption-confirm') {
      const c = adoptionCandidate; if (!c || state.age < 21 || state.age > 70 || state.balance < c.cost || state.children.length + (state.pregnancy ? 1 : 0) >= 4) return;
      state.balance -= c.cost; addChild(c.name, state.age - c.age, newChildProfile(true, c, state.partner, !!state.partner)); log(`${state.partner ? `${state.partner} and I adopted` : 'I adopted'} ${c.name}, age ${c.age}, for ${money(c.cost)}.`); changeStats({happiness: random(15, 30)}); adoptionCandidate = null;
    }
    else if (action === 'adopt' && !state.partner && state.age >= 18 && state.balance >= 1500 && state.children.length + (state.pregnancy ? 1 : 0) < 4) { state.balance -= 1500; const name = pick(firstNames.filter(n => !state.children.includes(n) && !state.name.startsWith(n + ' '))); addChild(name, state.age, newChildProfile(true)); log(`I adopted a child named ${name}.`); changeStats({ happiness: 10 }); }
    else if (action === 'end-pregnancy-final' && state.pregnancy) { const {coParent, coParentCurrent} = state.pregnancy; state.pregnancy = null; log('I chose to end the pregnancy.'); if (coParentCurrent !== false && state.partner === coParent) state.partnerBond = clamp(state.partnerBond - 5); changeStats({happiness:-5}); }
    else if (action === 'try-baby' && state.partner && !state.pregnancy && state.balance >= 1000 && state.children.length < 4 && state.partnerBond >= 45) {
      const p = state.partnerDetails, profiled = p?.fertility !== undefined && p.yearsTogether !== undefined;
      if (profiled && (p.yearsTogether < random(1,2) || state.partnerBond < random(45,75))) { state.partnerBond = clamp(state.partnerBond - random(4,8)); log(`${state.partner} was not ready to try for a baby.`); }
      else { state.balance -= 1000; if (profiled && Math.random() >= p.fertility / 100) { log(`${state.partner} and I tried for a baby, but did not conceive.`); changeStats({happiness:-3}); }
        else { state.pregnancy = {coParent: state.partner, coParentCurrent:true, started: state.age}; log(`${state.partner} and I are expecting a baby.`); changeStats({happiness: 5}); } }
    }
    else if (action === 'child' && state.partner && state.balance >= 1000 && state.children.length + (state.pregnancy ? 1 : 0) < 4 && state.partnerBond >= 45) { state.balance -= 1000; const name = pick(firstNames.filter(n => !state.children.includes(n) && n !== state.partner)); addChild(name, state.age, newChildProfile(false, null, state.partner, true)); log(`${state.partner} and I welcomed a child named ${name} into our family.`); changeStats({ happiness: 10 }); }
    else if (action === 'children' && state.children.length) { state.childBonds = state.childBonds.map(bond => clamp(bond + 10)); log(`I spent a wonderful day with ${state.children.join(' and ')}.`); changeStats({ happiness: 7 }); }
    else if (action === 'breakup-final' && state.partner) { log(`I ${state.married ? 'divorced' : 'broke up with'} ${state.partner}.`); removePartner(); changeStats({ happiness: -8 }); }
    else if (action.startsWith('movie-watch-')) { const [genre, rawIndex] = action.slice(12).split('-'), info = movieGenres[genre], title = info && (catalog[info[1]] || [])[Number(rawIndex)], cost = state.age < 18 ? 0 : 20; if (!title || state.age < info[2] || state.balance < cost) return; state.balance -= cost; log(`I watched ${title} at the movies.`); changeStats({happiness: 6}); }
    else if (action.startsWith('pet-adopt-')) {
      const type = action.slice(10); if (!['cat', 'dog', 'fish'].includes(type) || state.age < 18 || state.pet || state.balance < 500) return;
      const breeds = catalog[`PET_BREEDS_${type.toUpperCase()}`] || [type], names = type === 'fish' ? (catalog.PET_NAMES_FISH || []) : [...(catalog[`PET_NAMES_${type.toUpperCase()}_MALE`] || []), ...(catalog[`PET_NAMES_${type.toUpperCase()}_FEMALE`] || [])];
      state.balance -= 500; state.pet = names.length ? pick(names) : pick(['Mochi', 'Biscuit', 'Peanut']); state.petInfo = {type, breed: pick(breeds), age: 0, endAge: type === 'fish' ? random(2, 5) : random(10, 17)}; log(`I adopted a ${state.petInfo.breed} named ${state.pet}.`); changeStats({happiness: 7});
    }
    else if (action === 'pet' && state.age >= 18 && state.pet) { const activities = state.petInfo ? catalog[`SPEND_TIME_PET_${state.petInfo.type.toUpperCase()}`] : null; log(activities?.length ? `I ${pick(activities).replace(/your$/, 'my')} ${state.petInfo.type}, ${state.pet}.` : `I spent time playing with ${state.pet}.`); changeStats({ happiness: 7 }); }
    else if (action === 'university-study' && state.studying) { state.grades = clamp(state.grades + 10); state.studySessions = Math.min(1000, state.studySessions + 1); if (state.studySessions >= 3 && state.stats.smarts >= 75) learnTrait('nerd'); log(`I studied hard at university. My grades are ${state.grades}%.`); changeStats({smarts: hasTrait('nerd') ? 7 : 5, happiness: -1}); }
    else if (action === 'university-skip' && state.studying) { state.karma = clamp(state.karma - random(1,6)); state.grades = clamp(state.grades - 15); log('I skipped my university lectures.'); changeStats({happiness: 5, smarts: -2}); }
    else if (action === 'university-leave' && state.studying) { state.studying = false; state.studyMajor = ''; log('I left university before graduating.'); changeStats({happiness: -3}); }
    else if (action === 'study' && state.age >= 5 && state.age < 18 && !state.droppedOut) { state.grades = clamp(state.grades + 10); state.studySessions = Math.min(1000, state.studySessions + 1); if (state.studySessions >= 3 && state.stats.smarts >= 75) learnTrait('nerd'); log(`I studied hard at school. My grades are ${state.grades}%.`); changeStats({ smarts: hasTrait('nerd') ? 7 : 5, happiness: -1 }); }
    else if (action === 'skip-school' && state.age >= 5 && state.age < 18 && !state.droppedOut) { state.karma = clamp(state.karma - random(1,6)); state.grades = clamp(state.grades - 10); if (Math.random() < .2) { log('I was caught skipping school and received detention.'); changeStats({ smarts: -2, happiness: -8 }); } else { log('I skipped school to have some fun.'); changeStats({ smarts: -2, happiness: 5 }); } }
    else if (action === 'drop-school' && state.age >= 16 && state.age < 18 && !state.droppedOut) { state.droppedOut = true; log('I dropped out of school.'); changeStats({ happiness: 3 }); }
    else if (action === 'return-school' && state.age < 18 && state.droppedOut) { state.droppedOut = false; log('I returned to school.'); changeStats({ happiness: 2 }); }
    else if (action === 'ged' && state.age >= 18 && state.education === 'None' && state.balance >= 500) { state.balance -= 500; state.education = 'High school'; state.droppedOut = false; log('I earned a high-school equivalency diploma.'); changeStats({ smarts: 3, happiness: 4 }); }
    else if (action === 'work' && state.job) { state.stress = clamp(state.stress + (hasTrait('lazy') ? 10 : 4)); state.careerPerformance = clamp(state.careerPerformance + 20); log(`I worked hard. My career performance is now ${state.careerPerformance}%.`); changeStats({ happiness: hasTrait('lazy') ? -7 : -4, smarts: 2 }); }
    else if (action === 'retire-confirm' && state.job && state.age >= 65 && (state.pensionPolicy === 'flat' || state.workYears >= 10)) { const oldJob = state.job; state.income = pensionAmount(state); state.job = ''; state.retired = true; log(`I retired from my job as a ${oldJob.toLowerCase()} with an annual pension of ${money(state.income)}.`); changeStats({ happiness: 8 }); }
    else if (action === 'quit-confirm' && state.job) { log(`I quit my job as a ${state.job.toLowerCase()}.`); state.job = ''; state.income = 0; state.workYears = 0; state.salaryHistory = []; changeStats({ happiness: 3 }); }
    else if (action.startsWith('will-set-')) { const mode = action.slice(9); if (state.age < 18 || !['legacy', 'equal', 'spouse', 'charity'].includes(mode) || state.will.mode === mode || (mode === 'equal' && !state.children.length) || (mode === 'spouse' && (!state.partner || !state.married))) return; state.will = {mode, child:null}; log(`I updated my will: ${willDescription(state)}.`); }
    else if (action.startsWith('will-child-')) { const index = Number(action.slice(11)); if (state.age < 18 || !Number.isInteger(index) || !state.children[index] || (state.will.mode === 'child' && state.will.child === index)) return; state.will = {mode:'child', child:index}; log(`I updated my will: ${willDescription(state)}.`); }
    else if (action === 'bankrupt-confirm' && state.age >= 18 && state.debt > 2 * (state.balance + state.savings)) { state.balance = 0; state.savings = 0; state.debt = 0; state.investment = 0; state.portfolio = newPortfolio(); state.assets = []; state.assetValues = {}; state.job = ''; state.income = 0; state.workYears = 0; state.salaryHistory = []; state.retired = false; log('I declared bankruptcy. My bank debt was cleared, but I lost my money, possessions, investments and job.'); changeStats({happiness: -15}); }
    else if (action === 'bank-deposit' && state.age >= 18 && state.balance >= 1000 && state.savings <= 999999999000) { state.balance -= 1000; state.savings += 1000; log('I deposited $1,000 into savings.'); }
    else if (action === 'bank-withdraw' && state.age >= 18 && state.savings > 0 && state.balance <= 999999999000) { const amount = Math.min(1000, state.savings); state.savings -= amount; state.balance += amount; log(`I withdrew ${money(amount)} from savings.`); }
    else if (action === 'bank-borrow' && state.age >= 18 && state.balance <= 999999995000 && state.debt <= 999999995000) { state.balance += 5000; state.debt += 5000; log('I borrowed $5,000 from the bank.'); }
    else if (action === 'bank-repay' && state.age >= 18 && state.debt > 0 && state.balance > 0) { const amount = Math.min(1000, state.debt, state.balance); state.balance -= amount; state.debt -= amount; log(`I repaid ${money(amount)} of my bank loan.`); }
    else if (action.startsWith('market-buy-') || action.startsWith('market-sell-')) { const buying = action.startsWith('market-buy-'), index = Number(action.slice(buying ? 11 : 12)), holding = state.portfolio[index], market = markets[index]; if (!holding || !market || state.age < 18 || (buying && (state.balance < holding.price || holding.units >= 100000)) || (!buying && (holding.units <= 0 || state.balance + holding.price > 1000000000000))) return; if (buying) { state.balance -= holding.price; holding.units++; } else { state.balance += holding.price; holding.units--; } log(`I ${buying ? 'bought' : 'sold'} one unit of ${market[0]} for ${money(holding.price)}.`); }
    else if (action === 'loan-pay' && state.studentLoan > 0 && state.balance > 0) { const payment = Math.min(1000, state.studentLoan, state.balance); state.studentLoan -= payment; state.balance -= payment; log(`I made an extra ${money(payment)} student loan payment.`); }
    else if (action === 'invest' && state.age >= 18 && state.balance >= 5000 && state.investment <= BANK_LIMIT - 5000) { state.balance -= 5000; state.investment += 5000; log('I invested $5,000 in a fund.'); }
    else if (action === 'withdraw' && state.investment > 0 && state.balance + state.investment <= BANK_LIMIT) { log(`I sold my investments for ${money(state.investment)}.`); state.balance += state.investment; state.investment = 0; }
    else if (items[action]) { const [name, cost] = items[action]; if (!canBuyItem(action)) return; state.balance -= cost; state.assets.push(name); state.assetValues[name] = Math.round(cost * .7); log(`I bought a ${name.toLowerCase()} for ${money(cost)}.`); changeStats({ happiness: 8 }); }
    else if (action.startsWith('sell-') && items[action.slice(5)]) { const [name, cost] = items[action.slice(5)]; if (!state.assets.includes(name) || state.balance + state.assetValues[name] > BANK_LIMIT) return; const proceeds = state.assetValues[name]; state.assets = state.assets.filter(item => item !== name); delete state.assetValues[name]; state.balance += proceeds; log(`I sold my ${name.toLowerCase()} for ${money(proceeds)}.`); }
    else return;
    state.moments--;
    if ((action.startsWith('surgeon-') || action === 'alternative-doctor') && state.stats.health <= 0) { state.alive = false; state.deathCause = action === 'alternative-doctor' ? 'alternative-treatment' : 'surgery'; state.income = 0; state.job = ''; log(action === 'alternative-doctor' ? 'I died after an unproven treatment.' : 'I died from complications after plastic surgery.'); state.history[state.history.length - 1].icon = '🕊️'; state.history[state.history.length - 1].tag = 'THE END'; closeModal(); render(); showSummary(); return; }
    closeModal(); render(); if (state.pending !== null) showEvent();
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
    if (event.target.id === 'market-form') {
      event.preventDefault();
      if (!state.alive || state.pending !== null || state.prisonYears || state.age < 18 || state.moments <= 0) return;
      const rawIndex = $('#market-asset').value, index = Number(rawIndex), direction = $('#market-direction').value, value = $('#market-units').value, units = Number(value), holding = state.portfolio[index], asset = markets[index];
      if (!rawIndex || !Number.isInteger(index) || !holding || !asset || !['buy','sell'].includes(direction)) { $('#market-error').textContent = 'Choose a valid asset and transaction.'; return; }
      const limit = direction === 'buy' ? Math.min(100000 - holding.units, Math.floor(state.balance / holding.price)) : Math.min(holding.units, Math.floor((BANK_LIMIT - state.balance) / holding.price));
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(units) || units < 1 || units > limit) { $('#market-error').textContent = limit > 0 ? `Enter a whole number from 1 to ${limit} units.` : 'No units are available for this trade.'; return; }
      const total = units * holding.price;
      if (direction === 'buy') { state.balance -= total; holding.units += units; } else { state.balance += total; holding.units -= units; }
      log(`I ${direction === 'buy' ? 'bought' : 'sold'} ${units} unit${units === 1 ? '' : 's'} of ${asset[0]} for ${money(total)}.`);
      state.moments--; closeModal(); render(); return;
    }
    if (event.target.id === 'bank-form') {
      event.preventDefault();
      if (!state.alive || state.pending !== null || state.prisonYears || state.age < 18 || state.moments <= 0) return;
      const kind = $('#bank-kind').value, value = $('#bank-amount').value, amount = Number(value), limit = bankTransactionLimit(kind);
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(amount) || amount < 1 || amount > limit) { $('#bank-error').textContent = limit > 0 ? `Enter a whole-dollar amount from $1 to ${money(limit)} for this transaction.` : 'No amount is available for this transaction.'; return; }
      if (kind === 'deposit') { state.balance -= amount; state.savings += amount; log(`I deposited ${money(amount)} into savings.`); }
      else if (kind === 'withdraw') { state.savings -= amount; state.balance += amount; log(`I withdrew ${money(amount)} from savings.`); }
      else if (kind === 'borrow') { state.balance += amount; state.debt += amount; log(`I borrowed ${money(amount)} from the bank.`); }
      else if (kind === 'repay') { state.balance -= amount; state.debt -= amount; log(`I repaid ${money(amount)} of my bank loan.`); }
      else return;
      state.moments--; closeModal(); render(); return;
    }
    if (event.target.id === 'country-move-form') {
      event.preventDefault(); const value = $('#country-move').value, index = Number(value);
      if (!value || !Number.isInteger(index) || !countries[index] || countries[index] === state.city) { $('#country-move-error').textContent = 'Choose a different destination.'; return; }
      act(`move-country-${index}`); return;
    }
    if (event.target.id === 'hours-form') {
      event.preventDefault(); const value = $('#hours-input').value, hours = Number(value);
      if (!value || !Number.isInteger(hours) || hours < 38 || hours > 70 || hours === state.jobHours) { $('#hours-error').textContent = 'Choose a different whole number from 38 to 70.'; return; }
      act(`hours-${hours}`); return;
    }
    if (event.target.id === 'lottery-form') {
      event.preventDefault();
      if (!state.alive || state.pending !== null || state.prisonYears || state.age < 18 || state.moments <= 0) return;
      const lines = $('#lottery-numbers').value.trim().split(/\n/).map(line => line.trim());
      if (![1, 10].includes(lines.length) || lines.some(line => !/^\d+(?:\s+\d+){3}$/.test(line))) { $('#lottery-error').textContent = 'Enter one or ten lines, each with four whole numbers separated by spaces.'; return; }
      const tickets = lines.map(line => line.split(/\s+/).map(Number));
      if (tickets.some(nums => nums.some(n => n < 1 || n > 20) || new Set(nums).size !== 4)) { $('#lottery-error').textContent = 'Each ticket needs four different numbers from 1 to 20.'; return; }
      const cost = tickets.length * 4;
      if (state.balance < cost) { $('#lottery-error').textContent = 'You do not have enough money for those tickets.'; return; }
      const pool = Array.from({length: 20}, (_, i) => i + 1), winning = [];
      for (let i = 0; i < 4; i++) winning.push(pool.splice(random(0, pool.length - 1), 1)[0]);
      const won = tickets.some(ticket => ticket.every(n => winning.includes(n))), prize = state.jackpot;
      state.balance -= cost; state.moments--;
      if (won) { creditCash(prize); state.jackpot = random(100000, 1000000); changeStats({ happiness: 100 }); }
      log(`I bought ${tickets.length} lottery ticket${tickets.length === 1 ? '' : 's'} for ${money(cost)}. Winning numbers: ${winning.join(', ')}. ${won ? `I won ${money(prize)}!` : 'I did not win.'}`);
      render();
      modal(header('🎟️', 'THE DRAW', won ? 'Jackpot!' : 'Better luck next time', `Winning numbers: ${winning.join(', ')}. ${won ? `You won ${money(prize)}!` : `You spent ${money(cost)} and did not win.`}`) + '<button class="modal-primary" data-close>Continue</button>');
      return;
    }
    if (event.target.id !== 'new-life-form') return;
    event.preventDefault();
    const name = $('#new-name').value.trim().replace(/\s+/g, ' ');
    const city = $('#new-city').value;
    const gender = $('#new-gender').value;
    state = freshLife(name || undefined, cities.includes(city) || countries.includes(city) ? city : undefined, ['female', 'male', 'nonbinary'].includes(gender) ? gender : undefined); replaceUnreadable = true;
    closeModal(); render();
  });
  document.addEventListener('keydown', event => {
    if ($('#modal').classList.contains('hidden')) return;
    if (event.key === 'Escape' && state.pending === null) { closeModal(); return; }
    if (event.key === 'Tab') {
      const focusable = [...$('#modal').querySelectorAll('button:not(:disabled):not([hidden]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')];
      if (!focusable.length) return;
      if (!focusable.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus(); }
      else if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  state = load(); render(); if (state.pending !== null) showEvent();
})();
