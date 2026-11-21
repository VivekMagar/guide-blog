// comparison.js — Provider comparison section for RON→NPR tracker.
// Plain <script> tag inclusion — no ES module syntax (no import/export).
// Assumes globals: rateData, currentLang, translations, fmtNPR, fmtRON, fmtPct

'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// SAMPLE PROVIDERS FALLBACK
// Used when fetch('./data/providers.json') fails (e.g. file:// protocol).
// These use REAL numeric values so the UI renders with working demo data.
// ══════════════════════════════════════════════════════════════════════════════
var SAMPLE_PROVIDERS = [
  {
    id: 'wise', name: 'Wise', logo: 'assets/logos/wise.svg', website: 'https://wise.com', affiliate_url: '',
    fee_fixed_ron: 2.45, fee_percent: 0.65, rate_margin_percent: 0.0,
    min_amount_ron: 10, max_amount_ron: 50000,
    speed: 'minutes', payout_methods: ['bank deposit', 'mobile wallet'],
    pay_in_methods: ['bank transfer', 'debit card', 'credit card', 'Google Pay', 'Apple Pay'],
    notes_en: 'Pros: real mid-market exchange rate with zero hidden markup, transparent low fees | Cons: no cash pickup option in Nepal | Suits: direct bank and digital wallet transfers with maximum payout transparency',
    notes_ne: 'फाइदा: शून्य लुकेको मार्जिनसहित वास्तविक मध्य-बजार दर, पारदर्शी शुल्क | बेफाइदा: नेपालमा नगद पिकअप सुविधा छैन | उपयुक्त: उच्च पारदर्शिताका साथ बैंक खाता र डिजिटल वालेटमा पठाउन',
    last_checked: '2026-11-21', source_url: 'https://wise.com/ro/send-money/send-money-to-nepal'
  },
  {
    id: 'taptap-send', name: 'TapTap Send', logo: 'assets/logos/taptap.svg', website: 'https://www.taptapsend.com', affiliate_url: '',
    fee_fixed_ron: 0.0, fee_percent: 0.0, rate_margin_percent: 1.45,
    min_amount_ron: 15, max_amount_ron: 15000,
    speed: 'minutes', payout_methods: ['mobile wallet', 'bank deposit'],
    pay_in_methods: ['debit card'],
    notes_en: 'Pros: 100% zero transfer fee, fast app experience, instant delivery to eSewa and Khalti | Cons: debit card only, lower maximum sending limit | Suits: mobile smartphone users sending regular monthly remittances directly to wallets',
    notes_ne: 'फाइदा: १००% शून्य शुल्क, सजिलो मोबाइल एप, इसेवा र खल्तीमा तुरुन्त भुक्तानी | बेफाइदा: डेबिट कार्ड मात्र चल्ने, अधिकतम पठाउने सीमा केही कम | उपयुक्त: स्मार्टफोनबाट सिधै डिजिटल वालेटमा मासिक पैसा पठाउन',
    last_checked: '2026-11-21', source_url: 'https://www.taptapsend.com/destinations/nepal'
  },
  {
    id: 'remitly', name: 'Remitly', logo: 'assets/logos/remitly.svg', website: 'https://www.remitly.com', affiliate_url: '',
    fee_fixed_ron: 0.0, fee_percent: 0.0, rate_margin_percent: 1.65,
    min_amount_ron: 25, max_amount_ron: 25000,
    speed: 'minutes', payout_methods: ['bank deposit', 'cash pickup', 'mobile wallet'],
    pay_in_methods: ['debit card', 'credit card', 'bank transfer'],
    notes_en: 'Pros: instant delivery to eSewa and cash pickup across thousands of Nepal counters, zero fixed fee promo | Cons: rate includes a currency margin | Suits: fast transfers for emergency family support and cash pickups',
    notes_ne: 'फाइदा: इसेवा र नेपालभरि हजारौं ठाउँबाट तुरुन्त नगद पिकअप, निश्चित शुल्क शून्य | बेफाइदा: विनिमय दरमा केही मार्जिन समावेश | उपयुक्त: आपतकालीन पारिवारिक सहयोग र नगद झिक्नका लागि',
    last_checked: '2026-11-21', source_url: 'https://www.remitly.com/ro/en/nepal'
  },
  {
    id: 'revolut', name: 'Revolut', logo: 'assets/logos/revolut.svg', website: 'https://www.revolut.com/ro-RO/', affiliate_url: '',
    fee_fixed_ron: 3.5, fee_percent: 0.3, rate_margin_percent: 0.85,
    min_amount_ron: 20, max_amount_ron: 45000,
    speed: '1 day', payout_methods: ['bank deposit'],
    pay_in_methods: ['bank transfer', 'card', 'instant Revolut balance'],
    notes_en: 'Pros: seamless Romanian bank card integration, convenient if you already receive wages into Revolut | Cons: weekend foreign exchange markup (1%), bank deposit only | Suits: Romanian workers with Revolut salary accounts',
    notes_ne: 'फाइदा: रोमानियामा व्यापक प्रयोग, तलब सिधै रिभोलुटमा आउनेहरूका लागि सजिलो | बेफाइदा: शनिबार-आइतबार १% थप मार्जिन, बैंक डिपोजिट मात्र | उपयुक्त: रोमानियामा रिभोलुट खाता प्रयोग गर्ने नेपाली कामदारहरूका लागि',
    last_checked: '2026-11-21', source_url: 'https://www.revolut.com/ro-RO/send-money-abroad/romania-to-nepal/'
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// COMPARISON TRANSLATIONS
// Merged into the main `translations` object from index.html.
// ══════════════════════════════════════════════════════════════════════════════
function mergeComparisonTranslations() {
  if (typeof translations === 'undefined') return;

  var en = {
    compTitle:          'Send Money: Romania \u2192 Nepal',
    compSubtitle:       'Compare transfer services for the best deal',
    compAmountLabel:    'You send (RON)',
    compAmountPlaceholder: 'e.g. 500',
    compFilterAll:      'All',
    compFilterBank:     'Bank deposit',
    compFilterCash:     'Cash pickup',
    compFilterWallet:   'Mobile wallet',
    compSortCheapest:   'Cheapest first',
    compSortFastest:    'Fastest first',
    compBadgeBest:      '\uD83C\uDFC6 Highest Amount',
    compBadgeFast:      '\u26A1 Fastest',
    compBadgeCheap:     '\uD83D\uDCB0 Lowest Fee',
    compFee:            'Fee',
    compRate:           'Rate',
    compPayout:         'Payout',
    compSendBtn:        'Send money \u2192',
    compDetails:        'Details & last checked',
    compLastChecked:    'Last checked',
    compSource:         'Source',
    compUnavailable:    'Not available for this amount',
    compMin:            'min',
    compMax:            'max',
    compVsMidmarket:    'vs mid-market',
    compColProvider:    'Provider',
    compColFee:         'Fee',
    compColRate:        'Effective rate',
    compColReceives:    'Recipient gets',
    compColSpeed:       'Speed',
    compColPayout:      'Payout methods',
    compColSend:        'Send',
    compPros:           'Pros',
    compCons:           'Cons',
    compSuits:          'Who it suits',
    compPayIn:          'Pay in',
    compNotVerified:    'not yet verified',
    compPlaceholderNote:'These rows are placeholders. NPR amounts appear after you replace each TODO in data/providers.json with a number you checked on that provider\u2019s site.',
    compFilterAria:     'Filter by payout method',
    compSortAria:       'Sort by cheapest or fastest',
    compTableCaption:   'Romania to Nepal transfer comparison',
    compDisclosure:     'We may earn a commission if you use some links. This does not change the price you pay or how we rank services. Rankings are calculated from fees and rates.',
    compDisclaimer:     'Rates and fees change often. Check the provider\'s site before sending.',
    compStaleWarning:   '\u26A0\uFE0F Some data may be outdated (last checked over 14 days ago). Please verify on the provider\'s site.',
    compNoResults:      'No providers match your filter. Try a different payout method.',
    compLoading:        'Loading providers\u2026',
  };

  var ne = {
    compTitle:          '\u092A\u0948\u0938\u093E \u092A\u0920\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D: \u0930\u094B\u092E\u093E\u0928\u093F\u092F\u093E \u2192 \u0928\u0947\u092A\u093E\u0932',
    compSubtitle:       '\u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u0930\u093E\u092E\u094D\u0930\u094B \u0938\u092E\u091D\u094C\u0924\u093E\u0915\u093E \u0932\u093E\u0917\u093F \u0939\u0938\u094D\u0924\u093E\u0928\u094D\u0924\u0930\u0923 \u0938\u0947\u0935\u093E\u0939\u0930\u0942 \u0924\u0941\u0932\u0928\u093E \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D',
    compAmountLabel:    '\u0924\u092A\u093E\u0908\u0902 \u092A\u0920\u093E\u0909\u0928\u0941\u0939\u0941\u0928\u094D\u091B (RON)',
    compAmountPlaceholder: '\u091C\u0938\u094D\u0924\u0948 \u0945\u0966\u0966',
    compFilterAll:      '\u0938\u092C\u0948',
    compFilterBank:     '\u092C\u094D\u092F\u093E\u0902\u0915 \u091C\u092E\u094D\u092E\u093E',
    compFilterCash:     '\u0928\u0917\u0926 \u092A\u093F\u0915\u0905\u092A',
    compFilterWallet:   '\u092E\u094B\u092C\u093E\u0907\u0932 \u0935\u093E\u0932\u0947\u091F',
    compSortCheapest:   '\u0938\u0938\u094D\u0924\u094B \u092A\u0939\u093F\u0932\u0947',
    compSortFastest:    '\u091B\u093F\u091F\u094B \u092A\u0939\u093F\u0932\u0947',
    compBadgeBest:      '\uD83C\uDFC6 \u0938\u0930\u094D\u0935\u094B\u091A\u094D\u091A \u0930\u0915\u092E',
    compBadgeFast:      '\u26A1 \u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u091B\u093F\u091F\u094B',
    compBadgeCheap:     '\uD83D\uDCB0 \u0938\u092C\u0948\u092D\u0928\u094D\u0926\u093E \u0915\u092E \u0936\u0941\u0932\u094D\u0915',
    compFee:            '\u0936\u0941\u0932\u094D\u0915',
    compRate:           '\u0926\u0930',
    compPayout:         '\u092D\u0941\u0915\u094D\u0924\u093E\u0928\u0940',
    compSendBtn:        '\u092A\u0948\u0938\u093E \u092A\u0920\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D \u2192',
    compDetails:        '\u0935\u093F\u0935\u0930\u0923 \u0930 \u0905\u0928\u094D\u0924\u093F\u092E \u091C\u093E\u0901\u091A',
    compLastChecked:    '\u0905\u0928\u094D\u0924\u093F\u092E \u091C\u093E\u0901\u091A',
    compSource:         '\u0938\u094D\u0930\u094B\u0924',
    compUnavailable:    '\u092F\u094B \u0930\u0915\u092E\u0915\u093E \u0932\u093E\u0917\u093F \u0909\u092A\u0932\u092C\u094D\u0927 \u091B\u0948\u0928',
    compMin:            '\u0928\u094D\u092F\u0942\u0928\u0924\u092E',
    compMax:            '\u0905\u0927\u093F\u0915\u0924\u092E',
    compVsMidmarket:    '\u092E\u0927\u094D\u092F-\u092C\u091C\u093E\u0930 \u0924\u0941\u0932\u0928\u093E\u092E\u093E',
    compColProvider:    'प्रदायक',
    compColFee:         'शुल्क',
    compColRate:        'प्रभावकारी दर',
    compColReceives:    'प्रापकले पाउने',
    compColSpeed:       'गति',
    compColPayout:      'भुक्तानी विधि',
    compColSend:        'पठाउनुहोस्',
    compPros:           'फाइदा',
    compCons:           'बेफाइदा',
    compSuits:          'कसका लागि उपयुक्त',
    compPayIn:          'भुक्तानी गर्ने तरिका',
    compNotVerified:    'अझै प्रमाणित गरिएको छैन',
    compPlaceholderNote:'यी पङ्क्ति उदाहरण मात्र हुन्। data/providers.json मा प्रत्येक TODO लाई प्रदायकको साइटमा जाँचेको अंकले बदलेपछि NPR रकम देखिन्छ।',
    compFilterAria:     'भुक्तानी विधिअनुसार छान्नुहोस्',
    compSortAria:       'सस्तो वा छिटो अनुसार क्रम',
    compTableCaption:   'रोमानियाबाट नेपाल पैसा पठाउने तुलना',
    compDisclosure:     'केही लिंकहरू प्रयोग गर्नुभएमा हामीले कमिसन कमाउन सक्छौं। यसले तपाईंले तिर्ने मूल्य वा हाम्रो र्‍याङ्किङमा परिवर्तन गर्दैन। र्‍याङ्किङ शुल्क र दरबाट गणना गरिन्छ।',
    compDisclaimer:     'दर र शुल्कहरू प्रायः परिवर्तन हुन्छन्। पठाउनु अघि प्रदायकको साइट जाँच गर्नुहोस्।',
    compStaleWarning:   '⚠️ केही डेटा पुरानो हुन सक्छ (१४ दिनभन्दा पहिले जाँचिएको)। कृपया प्रदायकको साइटमा प्रमाणित गर्नुहोस्।',
    compNoResults:      '\u0924\u092A\u093E\u0908\u0902\u0915\u094B \u092B\u093F\u0932\u094D\u091F\u0930\u0938\u0901\u0917 \u0915\u0941\u0928\u0948 \u092A\u094D\u0930\u0926\u093E\u092F\u0915 \u092E\u0947\u0932 \u0916\u093E\u0901\u0926\u0948\u0928\u0964 \u092B\u0930\u0915 \u092D\u0941\u0915\u094D\u0924\u093E\u0928\u0940 \u0935\u093F\u0927\u093F \u092A\u094D\u0930\u092F\u093E\u0938 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964',
    compLoading:        '\u092A\u094D\u0930\u0926\u093E\u092F\u0915\u0939\u0930\u0942 \u0932\u094B\u0921 \u0939\u0941\u0901\u0926\u0948\u091B\u2026',
  };

  // Merge into existing translations object
  Object.assign(translations.en, en);
  Object.assign(translations.ne, ne);
}

// ══════════════════════════════════════════════════════════════════════════════
// CALCULATION ENGINE
// ══════════════════════════════════════════════════════════════════════════════
function calcProvider(provider, amountRON, midMarketRate) {
  var minAmt = parseFloat(provider.min_amount_ron);
  var maxAmt = parseFloat(provider.max_amount_ron);

  // Treat TODO / NaN min/max as unavailable
  if (isNaN(minAmt) || isNaN(maxAmt) || amountRON < minAmt || amountRON > maxAmt) {
    return { available: false, minAmt: minAmt, maxAmt: maxAmt };
  }

  var feeFixed = parseFloat(provider.fee_fixed_ron) || 0;
  var feePct   = parseFloat(provider.fee_percent) || 0;
  var margin   = parseFloat(provider.rate_margin_percent) || 0;

  var feeRON         = feeFixed + (amountRON * feePct / 100);
  var amountAfterFee = amountRON - feeRON;
  var effectiveRate  = midMarketRate * (1 - margin / 100);
  var recipientNPR   = amountAfterFee * effectiveRate;
  var midmarketNPR   = amountRON * midMarketRate;
  var costNPR        = midmarketNPR - recipientNPR;
  var costPct        = (costNPR / midmarketNPR) * 100;

  return {
    available: true,
    feeRON: feeRON,
    amountAfterFee: amountAfterFee,
    effectiveRate: effectiveRate,
    recipientNPR: recipientNPR,
    midmarketNPR: midmarketNPR,
    costNPR: costNPR,
    costPct: costPct
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// PROVIDER DATA LOADER
// ══════════════════════════════════════════════════════════════════════════════
var providersData = null;

async function loadProviders() {
  try {
    var res;
    try {
      res = await fetch('/data/providers.json');
    } catch (e) {}
    if (!res || !res.ok) {
      try { res = await fetch('./data/providers.json'); } catch (e) {}
    }
    if (!res || !res.ok) {
      try { res = await fetch('../data/providers.json'); } catch (e) {}
    }
    if (!res || !res.ok) throw new Error('HTTP ' + (res ? res.status : 'network error'));
    var data = await res.json();
    // Filter out meta/_comment entries, keep only objects with an `id`
    var arr = Array.isArray(data) ? data.filter(function(p) { return p.id; }) : [];
    if (arr.length === 0) throw new Error('No valid providers found in providers.json');
    providersData = arr;
  } catch (err) {
    console.warn('[comparison] Could not load providers.json, using sample data:', err.message);
    providersData = SAMPLE_PROVIDERS;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILTER / SORT STATE
// ══════════════════════════════════════════════════════════════════════════════
var activePayoutFilter = 'all';   // 'all' | 'bank' | 'cash' | 'wallet'
var activeSortMode     = 'cheapest'; // 'cheapest' | 'fastest'

// ══════════════════════════════════════════════════════════════════════════════
// SPEED SORT HELPER
// ══════════════════════════════════════════════════════════════════════════════
function speedRank(speed) {
  if (!speed) return 99;
  var s = speed.toLowerCase();
  if (s.includes('minute') || s.includes('instant')) return 1;
  if (s.includes('hour') || s === '1 hour')           return 2;
  if (s.includes('1 day') || s.includes('same day'))  return 3;
  if (s.includes('2 day'))                            return 4;
  if (s.includes('3 day'))                            return 5;
  return 6;
}

// ══════════════════════════════════════════════════════════════════════════════
// BADGE ASSIGNMENT
// ══════════════════════════════════════════════════════════════════════════════
function renderBadges(results) {
  // Reset badges
  results.forEach(function(r) { r.badges = []; });

  var available = results.filter(function(r) { return r.calc.available; });
  if (available.length === 0) return;

  // Highest Amount (most NPR received)
  var best = available.reduce(function(a, b) {
    return b.calc.recipientNPR > a.calc.recipientNPR ? b : a;
  });
  best.badges.push('best');

  // Fastest (lowest speed rank)
  var fastest = available.reduce(function(a, b) {
    return speedRank(b.provider.speed) < speedRank(a.provider.speed) ? b : a;
  });
  fastest.badges.push('fast');

  // Lowest Fee (lowest total feeRON)
  var cheapest = available.reduce(function(a, b) {
    return b.calc.feeRON < a.calc.feeRON ? b : a;
  });
  cheapest.badges.push('cheap');
}

// Split "Pros: … | Cons: … | Suits: …" notes. Any other text is shown as-is.
function parseReview(text) {
  if (!text) return null;
  var pros  = text.match(/(?:Pros|फाइदा)\s*:\s*([^|]*)/i);
  var cons  = text.match(/(?:Cons|बेफाइदा)\s*:\s*([^|]*)/i);
  var suits = text.match(/(?:Suits|उपयुक्त)\s*:\s*([^|]*)/i);
  if (!pros && !cons && !suits) return null;
  return {
    pros:  pros  ? pros[1].trim()  : '',
    cons:  cons  ? cons[1].trim()  : '',
    suits: suits ? suits[1].trim() : ''
  };
}

function moneyRON(n) {
  return (typeof fmtRON === 'function' ? fmtRON(n) : n.toFixed(2)) + ' RON';
}

function moneyNPR(n) {
  return (typeof fmtNPR === 'function' ? fmtNPR(n) : Math.round(n).toLocaleString()) + ' NPR';
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER TABLE (cards on narrow screens via CSS)
// Affiliate status is not an input to sort or badges.
// ══════════════════════════════════════════════════════════════════════════════
function renderComparisonCards(results) {
  var cmpCards = document.getElementById('cmp-cards');
  if (!cmpCards) return;

  var t    = typeof translations !== 'undefined' ? translations[currentLang] : {};
  var lang = typeof currentLang !== 'undefined' ? currentLang : 'en';

  if (results.length === 0) {
    cmpCards.innerHTML = '<p class="cmp-no-results">' +
      escHtml(t.compNoResults || 'No providers match your filter.') + '</p>';
    return;
  }

  var colProvider  = t.compColProvider  || 'Provider';
  var colFee       = t.compColFee       || 'Fee';
  var colRate      = t.compColRate      || 'Effective rate';
  var colReceives  = t.compColReceives  || 'Recipient gets';
  var colSpeed     = t.compColSpeed     || 'Speed';
  var colPayout    = t.compColPayout    || 'Payout methods';
  var colSend      = t.compColSend      || 'Send';

  var html = '<table class="cmp-table">';
  html += '<caption>' + escHtml(t.compTableCaption || 'Romania to Nepal transfer comparison') + '</caption>';
  html += '<thead><tr>';
  html += '<th scope="col">' + escHtml(colProvider) + '</th>';
  html += '<th scope="col">' + escHtml(colFee) + '</th>';
  html += '<th scope="col">' + escHtml(colRate) + '</th>';
  html += '<th scope="col">' + escHtml(colReceives) + '</th>';
  html += '<th scope="col">' + escHtml(colSpeed) + '</th>';
  html += '<th scope="col">' + escHtml(colPayout) + '</th>';
  html += '<th scope="col">' + escHtml(colSend) + '</th>';
  html += '</tr></thead><tbody>';

  results.forEach(function(r) {
    var p    = r.provider;
    var calc = r.calc;
    var badges = r.badges || [];
    var unavailable = !calc.available;

    var ctaHref = (p.affiliate_url && p.affiliate_url !== '') ? p.affiliate_url : p.website;
    var ctaRel  = (p.affiliate_url && p.affiliate_url !== '') ? 'sponsored noopener' : 'noopener';

    var payoutList = Array.isArray(p.payout_methods) ? p.payout_methods.join(', ') : '';
    var payInList  = Array.isArray(p.pay_in_methods) ? p.pay_in_methods.join(', ') : '';
    var notes = lang === 'ne' ? (p.notes_ne || p.notes_en || '') : (p.notes_en || '');
    var review = parseReview(notes);
    var lastCheckedFormatted = formatCheckedDate(p.last_checked) || (t.compNotVerified || 'not yet verified');

    html += '<tr class="' + (unavailable ? 'prov-row prov-row--unavailable' : 'prov-row') + '" data-id="' + escHtml(p.id) + '">';

    html += '<td data-label="' + escHtml(colProvider) + '">';
    html += '<div class="prov-header-cell">';
    if (p.logo) {
      var logoSrc = p.logo.startsWith('/') ? p.logo : '/' + p.logo;
      html += '<img src="' + escHtml(logoSrc) + '" alt="' + escHtml(p.name) + '" class="prov-logo" onerror="this.style.display=\'none\'" />';
    }
    html += '<div class="prov-title-group">';
    html += '<div class="prov-name">' + escHtml(p.name) + '</div>';
    if (badges.length > 0) {
      html += '<div class="prov-badges">';
      if (badges.includes('best'))  html += '<span class="badge badge-best">'  + escHtml(t.compBadgeBest  || 'Highest Amount') + '</span>';
      if (badges.includes('fast'))  html += '<span class="badge badge-fast">'  + escHtml(t.compBadgeFast  || 'Fastest') + '</span>';
      if (badges.includes('cheap')) html += '<span class="badge badge-cheap">' + escHtml(t.compBadgeCheap || 'Lowest Fee') + '</span>';
      html += '</div>';
    }
    html += '<p class="prov-last-checked">' + escHtml(t.compLastChecked || 'Last checked') + ': ' + escHtml(lastCheckedFormatted) + '</p>';
    html += '</div></div>';
    html += '</td>';

    if (unavailable) {
      var minStr = isNaN(calc.minAmt) ? '?' : calc.minAmt;
      var maxStr = isNaN(calc.maxAmt) ? '?' : calc.maxAmt;
      var unavail = (t.compUnavailable || 'Not available for this amount') +
        ' (' + (t.compMin || 'min') + ': ' + minStr + ' RON, ' +
        (t.compMax || 'max') + ': ' + maxStr + ' RON)';
      html += '<td data-label="' + escHtml(colFee) + '" colspan="3"><span class="prov-unavailable">' + escHtml(unavail) + '</span></td>';
    } else {
      html += '<td data-label="' + escHtml(colFee) + '">' + escHtml(moneyRON(calc.feeRON)) + '</td>';
      html += '<td data-label="' + escHtml(colRate) + '">' + escHtml(calc.effectiveRate.toFixed(2) + ' NPR/RON') + '</td>';
      html += '<td data-label="' + escHtml(colReceives) + '">';
      html += '<div class="prov-npr">' + escHtml(moneyNPR(calc.recipientNPR)) + '</div>';
      html += '<div class="prov-cost-pct">' + escHtml(moneyNPR(calc.costNPR)) + ' (' + calc.costPct.toFixed(2) + '% ' + (t.compVsMidmarket || 'vs mid-market') + ')</div>';
      html += '</td>';
    }

    html += '<td data-label="' + escHtml(colSpeed) + '">' + escHtml(p.speed || '') + '</td>';
    html += '<td data-label="' + escHtml(colPayout) + '">' + escHtml(payoutList) + '</td>';
    html += '<td data-label="' + escHtml(colSend) + '">';
    html += '<a href="' + escHtml(ctaHref) + '" class="prov-cta" rel="' + ctaRel + '" target="_blank">' +
      escHtml(t.compSendBtn || 'Send money') + '</a>';
    html += '</td>';
    html += '</tr>';

    html += '<tr class="prov-review-row">';
    html += '<td colspan="7">';
    html += '<details class="prov-notes">';
    html += '<summary>' + escHtml(t.compDetails || 'Details') + '</summary>';
    if (review) {
      if (review.pros)  html += '<p class="prov-notes-text"><strong>' + escHtml(t.compPros || 'Pros') + ':</strong> ' + escHtml(review.pros) + '</p>';
      if (review.cons)  html += '<p class="prov-notes-text"><strong>' + escHtml(t.compCons || 'Cons') + ':</strong> ' + escHtml(review.cons) + '</p>';
      if (review.suits) html += '<p class="prov-notes-text"><strong>' + escHtml(t.compSuits || 'Who it suits') + ':</strong> ' + escHtml(review.suits) + '</p>';
    } else if (notes) {
      html += '<p class="prov-notes-text">' + escHtml(notes) + '</p>';
    }
    if (payInList) {
      html += '<p class="prov-notes-text"><strong>' + escHtml(t.compPayIn || 'Pay in') + ':</strong> ' + escHtml(payInList) + '</p>';
    }
    if (p.source_url && p.source_url !== '#' && p.source_url !== 'TODO') {
      html += '<p class="prov-source"><a href="' + escHtml(p.source_url) + '" rel="noopener" target="_blank">' + escHtml(t.compSource || 'Source') + '</a></p>';
    }
    html += '</details>';
    html += '</td></tr>';
  });

  html += '</tbody></table>';
  cmpCards.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN RENDER
// ══════════════════════════════════════════════════════════════════════════════
function renderComparison() {
  var cmpCards = document.getElementById('cmp-cards');
  if (!cmpCards) return;

  var t = typeof translations !== 'undefined' ? translations[typeof currentLang !== 'undefined' ? currentLang : 'en'] : {};

  // Show loading if rateData not ready yet
  if (!rateData) {
    cmpCards.innerHTML = '<p class="cmp-no-results">' + escHtml(t.compLoading || 'Loading providers\u2026') + '</p>';
    return;
  }

  // Show loading if providers not loaded yet
  if (!providersData) {
    cmpCards.innerHTML = '<p class="cmp-no-results">' + escHtml(t.compLoading || 'Loading providers\u2026') + '</p>';
    return;
  }

  var amountInput = document.getElementById('cmp-amount');
  var amountRON   = amountInput ? parseFloat(amountInput.value) : 500;
  if (isNaN(amountRON) || amountRON <= 0) amountRON = 500;

  var midMarketRate = rateData.currentRate;

  // Compute results for all providers
  var results = providersData.map(function(provider) {
    return {
      provider: provider,
      calc: calcProvider(provider, amountRON, midMarketRate),
      badges: []
    };
  });

  // Apply payout filter
  if (activePayoutFilter !== 'all') {
    results = results.filter(function(r) {
      if (!Array.isArray(r.provider.payout_methods)) return false;
      return r.provider.payout_methods.some(function(m) {
        return m.toLowerCase().includes(activePayoutFilter.toLowerCase());
      });
    });
  }

  // Sort: available first, unavailable last
  if (activeSortMode === 'fastest') {
    results.sort(function(a, b) {
      var aAvail = a.calc.available ? 0 : 1;
      var bAvail = b.calc.available ? 0 : 1;
      if (aAvail !== bAvail) return aAvail - bAvail;
      return speedRank(a.provider.speed) - speedRank(b.provider.speed);
    });
  } else {
    // 'cheapest' = most NPR received (descending recipientNPR)
    results.sort(function(a, b) {
      var aAvail = a.calc.available ? 0 : 1;
      var bAvail = b.calc.available ? 0 : 1;
      if (aAvail !== bAvail) return aAvail - bAvail;
      if (!a.calc.available || !b.calc.available) return 0;
      return b.calc.recipientNPR - a.calc.recipientNPR;
    });
  }

  // Assign badges
  renderBadges(results);

  // Render table (stacked cards on narrow screens)
  renderComparisonCards(results);

  updateDisclaimer(providersData);
  updatePlaceholderNote(providersData);

  // Check staleness
  checkProviderStaleness(providersData);
}

function updateDisclaimer(providers) {
  var el = document.getElementById('cmp-disclaimer-line');
  if (!el) return;
  var t = typeof translations !== 'undefined'
    ? translations[typeof currentLang !== 'undefined' ? currentLang : 'en']
    : {};
  var dates = [];
  providers.forEach(function(p) {
    if (!p.last_checked || p.last_checked === 'TODO') return;
    var d = new Date(p.last_checked);
    if (!isNaN(d.getTime())) dates.push(p.last_checked);
  });
  dates.sort();
  var shown = dates.length
    ? formatCheckedDate(dates[0])
    : (t.compNotVerified || 'not yet verified');
  var sentence = t.compDisclaimer || 'Rates and fees change often. Check the provider\'s site before sending.';
  el.textContent = sentence + ' ' + (t.compLastChecked || 'Last checked') + ': ' + shown + '.';
}

function updatePlaceholderNote(providers) {
  var el = document.getElementById('cmp-placeholder-note');
  if (!el) return;
  var unverified = providers.length > 0 && providers.every(function(p) {
    return isNaN(parseFloat(p.fee_fixed_ron)) || isNaN(parseFloat(p.min_amount_ron));
  });
  el.hidden = !unverified;
}

// ══════════════════════════════════════════════════════════════════════════════
// FILTER HANDLERS
// ══════════════════════════════════════════════════════════════════════════════
function setPayoutFilter(method) {
  activePayoutFilter = method;

  // Update active state on filter buttons
  ['all', 'bank', 'cash', 'wallet'].forEach(function(m) {
    var btn = document.getElementById('filter-' + m);
    if (!btn) return;
    var on = m === method;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  renderComparison();
}

function setSortMode(mode) {
  activeSortMode = mode;

  var cheapBtn = document.getElementById('sort-cheapest');
  var fastBtn  = document.getElementById('sort-fastest');
  if (cheapBtn) {
    cheapBtn.classList.toggle('active', mode === 'cheapest');
    cheapBtn.setAttribute('aria-pressed', mode === 'cheapest' ? 'true' : 'false');
  }
  if (fastBtn) {
    fastBtn.classList.toggle('active', mode === 'fastest');
    fastBtn.setAttribute('aria-pressed', mode === 'fastest' ? 'true' : 'false');
  }

  renderComparison();
}

// ══════════════════════════════════════════════════════════════════════════════
// STALENESS WARNING
// ══════════════════════════════════════════════════════════════════════════════
function checkProviderStaleness(providers) {
  var warning = document.getElementById('cmp-stale-warning');
  if (!warning) return;

  var now       = Date.now();
  var staleMs   = 14 * 24 * 60 * 60 * 1000;
  var hasStale  = providers.some(function(p) {
    if (!p.last_checked || p.last_checked === 'TODO') return true;
    var d = new Date(p.last_checked);
    return isNaN(d.getTime()) || (now - d.getTime()) > staleMs;
  });

  warning.classList.toggle('visible', hasStale);
}

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE UPDATE
// ══════════════════════════════════════════════════════════════════════════════
function updateComparisonLang(lang) {
  var t = typeof translations !== 'undefined' ? translations[lang] : {};

  // Update all elements with data-i18n attribute inside comparison-section
  document.querySelectorAll('#comparison-section [data-i18n]').forEach(function(el) {
    var key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  var filterRow = document.querySelector('.cmp-filter-row');
  if (filterRow && t.compFilterAria) filterRow.setAttribute('aria-label', t.compFilterAria);
  var sortRow = document.querySelector('.cmp-sort-row');
  if (sortRow && t.compSortAria) sortRow.setAttribute('aria-label', t.compSortAria);

  // Re-render cards with new language
  renderComparison();
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCheckedDate(dateStr) {
  if (!dateStr || dateStr === 'TODO') return dateStr || '';
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  return d.toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════
async function initComparison() {
  mergeComparisonTranslations();
  await loadProviders();
  renderComparison();
}
