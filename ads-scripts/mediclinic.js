/**
 * ================================================================
 * Mediclinic Dental - AI Search Term Analyzer
 * ================================================================
 * סקריפט לניתוח search terms אוטומטי באמצעות Gemini AI
 * מוסיף מילות שלילה לרשימה: Ai>>Negatives>>Automated
 * זיכרון צובר: Properties Service (cache מהיר) + Google Sheet (archive)
 * ================================================================
 */

// ============================================================
// הגדרות - שנה כאן בלבד
// ============================================================
const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyD5ORd0n1Gs3INF6sdPlLDhJnwB-dq-mBc',
  GEMINI_MODEL: 'gemini-2.5-flash-lite',
  GEMINI_FALLBACK_MODEL: 'gemini-2.5-flash',
  NEGATIVE_LIST_NAME: 'Ai>>Negatives>>Automated',
  BATCH_SIZE: 20,
  PROPERTIES_MAX_FILL: 0.85
};

// ============================================================
// הפרומפט לג'מיני
// ============================================================
const GEMINI_SYSTEM_PROMPT = `אתה מנהל קמפיינים של Google Ads עבור מרפאת מדיקליניק בתל אביב.
המרפאה מתמחה בטיפולים דנטליים מורכבים ושיקום הפה:
- השתלות שיניים (שתלים דנטליים)
- שיקום הפה המלא
- הרמות סינוס והשתלות עצם
- השתלות שיניים בהרדמה מלאה
- כתרים, גשרים וציפויים כחלק משיקום מורכב
- שתלים זיגומטיים
- שתלי בייקון (שתלים קצרים למחוסרי עצם)
- ייעוץ ומחיר להשתלות

אזור גיאוגרפי רלוונטי: תל אביב, גבעתיים, רמת גן, בני ברק, בת ים, בת-ים, חולון, ראשון לציון, הרצליה, רמת השרון, פתח תקווה, גבעת שמואל, קרית אונו, יהוד, אזור גוש דן בכלל.
ערים לא רלוונטיות (מרוחקות מדי): חיפה, ירושלים, באר שבע, נתניה, רעננה, כפר סבא, רחובות, אשדוד, אשקלון, נס ציונה, מודיעין.

המרפאה היא מרפאת הסדר של הפניקס בלבד.
ביטוח רלוונטי: הפניקס בלבד.

=== חוקי APPROVE ===
אשר **רק** כאשר המונח מכיל כוונה **מפורשת ומוכחת** לאחד מאלה:
- השתלות שיניים / שתל / שתלים דנטלים / החלפת שיניים / שתלים בשיניים
- שיקום הפה / שיקום פה מלא
- הרמת סינוס / השתלת עצם / שתלים זיגומטיים / שתלי בייקון / שתלי זרקוניה
- חיפוש כירורג שיניים (מרמז על ניתוח מורכב)
- טיפול שיניים בהרדמה מלאה / הרדמה כללית / הרדמה עמוקה / סדציה
- כריית שיניים בסדציה — רלוונטי, צורך דומה להרדמה מלאה
- "ביום אחד" בהקשר מפורש של שתלים/שיניים
- שאלות על מחיר/עלות של השתלות
- גיאוגרפיה רלוונטית **בשילוב** עם מונח השתלה/שיקום מפורש בלבד (לדוג: "השתלת שיניים בחולון" ✓, "שתלים בתל אביב" ✓)
- הפניקס בכל הקשר של שיניים/השתלות - תמיד APPROVE, כולל שילוב עם מקצוע או אוכלוסייה (לדוג: "הפניקס שיניים משטרה", "הפניקס שיניים מורים")
- חיפוש מרפאת שיניים שעובדת עם הפניקס - תמיד APPROVE (לדוג: "מרפאת שיניים הפניקס", "רופא שיניים הפניקס תל אביב")
- פה ולסת — חיפושים כלליים של פה ולסת ללא מתחרה ספציפי וללא עיר לא רלוונטית - תמיד APPROVE! (לדוג: "מרפאת פה ולסת", "רופא פה ולסת", "כירורג פה ולסת תל אביב", "פה ולסת פרטי")
- תותבות על גבי שתלים / תותבת מושתלת — שיקום מורכב על שתלים, תמיד APPROVE
- תותבות נשלפות — APPROVE! לקוח פוטנציאלי שעשתלים הם פתרון קרוב ורלוונטי עבורו
- תותבת/תותבות לעולם לא יהיו root_term
- השלמת שיניים — רלוונטי לשיקום, לא לפסול על הסף
- חיפושי מותג: מדיקליניק, mediclinic, medic clinic, מדיק קליניק וכל וריאציה - תמיד APPROVE!
- רומן אציל, ד"ר רומן אציל, roman atzil - הרופא הראשי במרפאה - תמיד APPROVE, לעולם לא root_term!
- ביקורות, דירוגים, מידע על מדיקליניק - תמיד APPROVE!
- "בהרדמה כללית" / "הרדמה כללית" בהקשר של טיפול שיניים - רלוונטי!

=== חוקי REJECT ===
פסול כאשר המונח אינו מכיל כוונה מפורשת להשתלות שיניים, שיקום הפה, או טיפולים כירורגיים מורכבים. ספק ספיקות — פסול!
- **חיפוש כללי של רופא/מרפאת שיניים ללא כוונה לטיפול מורכב** — "מרפאת שיניים בתל אביב", "רופא שיניים בחולון", "מרפאת שיניים" סתם, "רופא שיניים קרוב" — REJECT. הכוונה לשירות שיניים כללי אינה מספיקה, גם אם הגיאוגרפיה רלוונטית
- **גיאוגרפיה ללא כוונה לטיפול מורכב** — "רופא שיניים בחולון", "מרפאת שיניים בתל אביב" — REJECT. גיאוגרפיה רלוונטית לבדה אינה מספיקה לאישור; חייב להיות שילוב עם מונח השתלה/שיקום מפורש
- **אסתטיקה דנטלית כללית** — "אסתטיקה דנטלית", "מומחה לאסתטיקה דנטלית", "רופא שיניים אסתטי" — REJECT. ציפויים/כתרים ייאושרו רק כשמופיעים במפורש בהקשר של שיקום הפה המלא
- טיפולים קטנים/בסיסיים בלבד: שיננית, ניקוי שיניים, לבנת שיניים, סתימה, טיפול שורש (ללא קשר להשתלה), צילום שיניים, רנטגן שיניים, פנורמי שיניים
- שמות של רופאים מתחרים או מרפאות מתחרות (לא מדיקליניק)
- כלל מתחרים חשוב: אם המונח מכיל שם עסק, מותג, או שם פרטי/משפחה בשילוב עם "שיניים", "השתלה", "שתל", "מרפאה", "שיקום", "פה ולסת" - וזה אינו "מדיקליניק" - זהו מתחרה, יש לפסול. root_term = שם העסק/האדם בלבד
- פה ולסת + מתחרה: "מרפאת פה ולסת ד"ר X" - פסול, root_term = שם הרופא
- פה ולסת + עיר לא רלוונטית: "פה ולסת חיפה" - פסול, root_term = שם העיר
- חשוב: "פה ולסת" לעולם לא תהיה root_term לשלילה בפני עצמה!
- ערים לא רלוונטיות גיאוגרפית: חיפה, ירושלים, באר שבע, נתניה, רעננה, כפר סבא, רחובות, אשדוד, אשקלון
- ביטוחים אחרים שאינם הפניקס: הראל, לאומית, מגדל, איילון - כאשר הכוונה לחיפוש כיסוי ביטוחי (לדוג: "השתלות שיניים הראל", "מרפאת שיניים מגדל")
  שים לב: חיפוש כללי של "ביטוח שיניים" ללא שם ביטוח ספציפי - APPROVE
- קופות חולים כמקור מימון: כללית (קופח), מכבי, מאוחדת, לאומית קופח
  חשוב: "כללית" לעולם לא תהיה root_term לבדה - השתמש ב-"כללית קופח"
- חיפושי זמינות/חירום: "פתוח", "פתוחה", "חירום", "דחוף", "עכשיו", "היום" — כאשר הכוונה למצוא רופא שיניים זמין כרגע (לדוג: "רופא שיניים פתוח", "מרפאת שיניים פתוחה בשבת", "רופא שיניים חירום"). אלה מחפשים טיפול דחוף, לא שיקום מורכב. root_term = "" (פסול את המונח המלא, לא מילה בודדת)
- תותבות בהקשר של תיקון/תקלה: "תיקון תותבות", "תיקון שיניים תותבות", "שיניים תותבות שנשברו", "תותבת שבורה" וכד׳ — אלה מחפשים שירות תיקון, לא שיקום חדש. root_term = "" (פסול את המונח המלא)
- תרופות, כאב שיניים כללי ללא הקשר לשיקום
- ציוד/חומרים דנטליים לרופאים
- אורתודונטיה, יישור שיניים (לא תחום המרפאה)
- ילדים/רפואת שיניים לילדים
- תוכן שאינו קשור לרפואת שיניים כלל

=== חוקי root_term ===
עבור כל מונח שהחלטת REJECT, עליך לספק גם root_term:
- root_term הוא הביטוי הקצר ביותר (1-3 מילים) שכדאי לשלול בנפרד
- אם הסיבה לפסילה היא עיר לא רלוונטית: root_term = שם העיר בלבד (לדוג: "חיפה")
- אם הסיבה היא שם רופא/מרפאה מתחרה: root_term = שם הרופא/המרפאה
- אם הסיבה היא טיפול לא רלוונטי: root_term = שם הטיפול (לדוג: "שיננית")
- אם הסיבה היא קופח כללית: root_term = "כללית קופח" - לעולם לא "כללית" לבד!
- אם הסיבה היא קופח מכבי/מאוחדת: root_term = "מכבי" או "מאוחדת" בהתאמה
- אם הסיבה היא ביטוח לא רלוונטי (הראל/מגדל/איילון/לאומית): root_term = שם חברת הביטוח (לדוג: "הראל", "מגדל")
- אם אין root_term ספציפי (כל הביטוי פסול באותה מידה): החזר root_term = ""
- חשוב: root_term לעולם לא יכלול מילים טובות כמו: השתלה, שתל, שיניים, טיפול, מרפאה, רופא, שיקום, הפניקס, מדיקליניק, כללית (לבד!), פה ולסת, סדציה, זרקוניה, בייקון, השלמת שיניים, רומן אציל, בת ים, תותבת, תותבות
- בת ים: עיר רלוונטית גיאוגרפית - לעולם לא root_term! אם מונח נפסל בגלל סיבה אחרת (מתחרה, טיפול לא רלוונטי) ובת ים מופיעה בו - root_term = הסיבה האחרת, לא "בת ים"

החזר תשובה בפורמט JSON בלבד:
{
  "results": [
    {
      "term": "מילת החיפוש המקורית",
      "decision": "APPROVE" או "REJECT",
      "reason": "סיבה קצרה בעברית",
      "root_term": "ביטוי שורש לשלילה או ריק אם אין"
    }
  ]
}`;

// ============================================================
// פונקציה ראשית
// ============================================================
function main() {
  Logger.log('=== Mediclinic Search Term Analyzer - Starting ===');

  // 0. נקה מילות מוגנות שנפלו לרשימת השלילה בטעות
  cleanProtectedKeywordsFromNegativeList();

  // 1. טען זיכרון צובר
  const memory = loadMemory();
  Logger.log('Loaded ' + Object.keys(memory).length + ' terms from memory');

  // 2. קבל רשימת מילות שלילה קיימות מהחשבון
  const existingNegatives = getExistingNegatives();
  Logger.log('Found ' + existingNegatives.size + ' existing negative keywords');

  // 3. שלוף search terms
  const searchTerms = getTodaySearchTerms();
  Logger.log('Found ' + searchTerms.length + ' search terms');

  if (searchTerms.length === 0) {
    Logger.log('No search terms found. Exiting.');
    return;
  }

  // 4. סנן מונחים שכבר טופלו
  const termsToAnalyze = searchTerms.filter(function(term) {
    const normalized = term.toLowerCase().trim();
    if (memory[normalized] !== undefined) {
      Logger.log('Skipping (in memory): ' + term);
      return false;
    }
    if (existingNegatives.has(normalized)) {
      Logger.log('Skipping (already negative): ' + term);
      return false;
    }
    return true;
  });

  Logger.log(termsToAnalyze.length + ' terms need Gemini analysis');

  if (termsToAnalyze.length === 0) {
    Logger.log('All terms already processed. Exiting.');
    return;
  }

  // 5. שלח ל-Gemini בקבוצות
  const toReject = [];
  const toApprove = [];
  const allResults = [];

  for (var i = 0; i < termsToAnalyze.length; i += CONFIG.BATCH_SIZE) {
    const batch = termsToAnalyze.slice(i, i + CONFIG.BATCH_SIZE);
    Logger.log('Processing batch ' + (Math.floor(i / CONFIG.BATCH_SIZE) + 1) + ': ' + batch.length + ' terms');

    const results = analyzeWithGemini(batch);
    if (!results) {
      Logger.log('ERROR: Gemini analysis failed for batch. Skipping.');
      continue;
    }

    results.forEach(function(r) {
      allResults.push(r);
      if (r.decision === 'REJECT') {
        const wordCount = r.term.trim().split(/\s+/).length;
        toReject.push({ term: r.term, root_term: r.root_term || '' });
        // מונחים ארוכים מ-10 מילים נכנסים לזיכרון כדי לא לרוץ עליהם שוב
        if (wordCount > 10) {
          memory[r.term.toLowerCase().trim()] = 'REJECT_LONG';
          Logger.log('Added long rejected term to memory: ' + r.term);
        }
      } else {
        toApprove.push(r.term);
        memory[r.term.toLowerCase().trim()] = 'APPROVE';
      }
    });
  }

  Logger.log('Analysis complete: ' + toApprove.length + ' approved, ' + toReject.length + ' to reject');

  // 6. הוסף מילות שלילה
  if (toReject.length > 0) {
    addNegativeKeywords(toReject);
  }

  // 7. שמור זיכרון מעודכן
  saveMemory(memory);

  // 8. כתוב ל-Sheet לוג
  logToSheet(allResults);

  Logger.log('=== Script completed successfully ===');
}

// ============================================================
// שליפת Search Terms (3 ימים אחורה, Search + PMax)
// ============================================================
function getTodaySearchTerms() {
  const tz = AdsApp.currentAccount().getTimeZone();
  const today = new Date();

  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fromDate = Utilities.formatDate(threeDaysAgo, tz, 'yyyy-MM-dd');
  const toDate   = Utilities.formatDate(today, tz, 'yyyy-MM-dd');

  Logger.log('Fetching search terms from ' + fromDate + ' to ' + toDate);

  const terms = new Set();

  // --- Standard Search campaigns ---
  const searchQuery =
    'SELECT search_term_view.search_term, search_term_view.status ' +
    'FROM search_term_view ' +
    "WHERE segments.date BETWEEN '" + fromDate + "' AND '" + toDate + "' " +
    "AND search_term_view.status != 'EXCLUDED'";

  const searchResult = AdsApp.search(searchQuery);
  while (searchResult.hasNext()) {
    const row = searchResult.next();
    const term = row['searchTermView'] && row['searchTermView']['searchTerm'];
    if (term && term.trim()) terms.add(term.trim());
  }
  Logger.log('Search campaign terms found: ' + terms.size);

  // --- PMax campaigns ---
  try {
    const pmaxQuery =
      'SELECT search_term_insight.text ' +
      'FROM search_term_insight ' +
      "WHERE segments.date BETWEEN '" + fromDate + "' AND '" + toDate + "'";

    const pmaxResult = AdsApp.search(pmaxQuery);
    var pmaxCount = 0;
    while (pmaxResult.hasNext()) {
      const row = pmaxResult.next();
      const term = row['searchTermInsight'] && row['searchTermInsight']['text'];
      if (term && term.trim()) {
        terms.add(term.trim());
        pmaxCount++;
      }
    }
    Logger.log('PMax terms found: ' + pmaxCount);
  } catch(e) {
    Logger.log('Warning: Could not fetch PMax search terms: ' + e.message);
  }

  Logger.log('Total unique search terms (Search + PMax): ' + terms.size);
  return Array.from(terms);
}

// ============================================================
// שליפת כל מילות השלילה הקיימות (GAQL)
// ============================================================
function getExistingNegatives() {
  const negatives = new Set();

  try {
    const listQuery =
      'SELECT shared_criterion.keyword.text ' +
      'FROM shared_criterion ' +
      "WHERE shared_set.type = 'NEGATIVE_KEYWORDS'";
    const listResult = AdsApp.search(listQuery);
    while (listResult.hasNext()) {
      const row = listResult.next();
      const text = row['sharedCriterion'] && row['sharedCriterion']['keyword'] && row['sharedCriterion']['keyword']['text'];
      if (text) negatives.add(text.toLowerCase().trim());
    }
  } catch(e) {
    Logger.log('Warning: Could not fetch shared list negatives: ' + e.message);
  }

  try {
    const campaignQuery =
      'SELECT campaign_criterion.keyword.text ' +
      'FROM campaign_criterion ' +
      'WHERE campaign_criterion.negative = TRUE ' +
      "AND campaign_criterion.type = 'KEYWORD'";
    const campaignResult = AdsApp.search(campaignQuery);
    while (campaignResult.hasNext()) {
      const row = campaignResult.next();
      const text = row['campaignCriterion'] && row['campaignCriterion']['keyword'] && row['campaignCriterion']['keyword']['text'];
      if (text) negatives.add(text.toLowerCase().trim());
    }
  } catch(e) {
    Logger.log('Warning: Could not fetch campaign negatives: ' + e.message);
  }

  return negatives;
}

// ============================================================
// ניתוח ב-Gemini (עם retry + fallback)
// ============================================================
function analyzeWithGemini(terms) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + CONFIG.GEMINI_MODEL + ':generateContent?key=' + CONFIG.GEMINI_API_KEY;

  const termsListText = terms.map(function(t, i) { return (i+1) + '. ' + t; }).join('\n');
  const prompt = GEMINI_SYSTEM_PROMPT + '\n\nנתח את רשימת מונחי החיפוש הבאה:\n' + termsListText;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var MAX_RETRIES = 3;
  var RETRY_DELAYS = [30000, 60000, 120000]; // 30s, 60s, 120s

  for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      Logger.log('Gemini API call - attempt ' + attempt + '/' + MAX_RETRIES);
      var response = UrlFetchApp.fetch(url, options);
      var responseCode = response.getResponseCode();

      if (responseCode === 503 || responseCode === 429) {
        Logger.log('Gemini overloaded (' + responseCode + '), waiting ' + (RETRY_DELAYS[attempt-1]/1000) + 's before retry...');
        if (attempt < MAX_RETRIES) {
          Utilities.sleep(RETRY_DELAYS[attempt - 1]);
          continue;
        } else {
          Logger.log('All retries exhausted for ' + responseCode + ' on primary model. Trying fallback model...');
          return analyzeWithGeminiFallback(terms);
        }
      }

      if (responseCode !== 200) {
        Logger.log('Gemini API error: ' + responseCode + ' - ' + response.getContentText());
        return null;
      }

      var json = JSON.parse(response.getContentText());
      var rawText = json.candidates[0].content.parts[0].text;
      var cleanText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

      var parsed;
      try {
        parsed = JSON.parse(cleanText);
      } catch(parseErr) {
        Logger.log('JSON parse failed, trying regex fallback: ' + parseErr.message);
        var match = cleanText.match(/"results"\s*:\s*(\[\s\S]*\])/);
        if (match) {
          try {
            return JSON.parse(match[1]);
          } catch(e2) {
            Logger.log('Regex fallback also failed: ' + e2.message);
            return null;
          }
        }
        return null;
      }

      return parsed.results || parsed;

    } catch (e) {
      Logger.log('Error calling Gemini (attempt ' + attempt + '): ' + e.message);
      if (attempt < MAX_RETRIES) {
        Utilities.sleep(RETRY_DELAYS[attempt - 1]);
      } else {
        Logger.log('All retries exhausted on primary model due to error. Trying fallback...');
        return analyzeWithGeminiFallback(terms);
      }
    }
  }

  return null;
}

// ============================================================
// Fallback - Gemini 2.5 Flash
// ============================================================
function analyzeWithGeminiFallback(terms) {
  Logger.log('Using fallback model: ' + CONFIG.GEMINI_FALLBACK_MODEL);
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + CONFIG.GEMINI_FALLBACK_MODEL + ':generateContent?key=' + CONFIG.GEMINI_API_KEY;

  const termsListText = terms.map(function(t, i) { return (i+1) + '. ' + t; }).join('\n');
  const prompt = GEMINI_SYSTEM_PROMPT + '\n\nנתח את רשימת מונחי החיפוש הבאה:\n' + termsListText;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    Utilities.sleep(5000);
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      Logger.log('Fallback model also failed: ' + responseCode + ' - ' + response.getContentText());
      return null;
    }

    var json = JSON.parse(response.getContentText());
    var rawText = json.candidates[0].content.parts[0].text;
    var cleanText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    var parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch(parseErr) {
      Logger.log('Fallback JSON parse failed: ' + parseErr.message);
      var match = cleanText.match(/"results"\s*:\s*(\[\s\S]*\])/);
      if (match) {
        try { return JSON.parse(match[1]); } catch(e2) { return null; }
      }
      return null;
    }

    Logger.log('Fallback model succeeded.');
    return parsed.results || parsed;

  } catch(e) {
    Logger.log('Fallback model error: ' + e.message);
    return null;
  }
}

// ============================================================
// הוספת מילות שלילה לרשימה Ai>>Negatives>>Automated
// מקבלת מערך של אובייקטים: [{term, root_term}, ...]
// ============================================================

// מילה בודדת → exact match [מילה], כדי שלא תחסום ביטויים מורכבים שמכילים אותה.
// מילים מרובות → phrase match "ביטוי".
function formatNegativeKw(text) {
  var t = text.trim();
  return t.split(/\s+/).length === 1 ? '[' + t + ']' : '"' + t + '"';
}

function addNegativeKeywords(rejectResults) {
  const listIterator = AdsApp.negativeKeywordLists()
    .withCondition("Name = '" + CONFIG.NEGATIVE_LIST_NAME + "'")
    .get();

  if (!listIterator.hasNext()) {
    Logger.log('ERROR: Negative keyword list "' + CONFIG.NEGATIVE_LIST_NAME + '" not found!');
    Logger.log('Please create this list manually in Google Ads first.');
    return;
  }

  const negativeList = listIterator.next();
  const MAX_WORDS = 10;
  const toAdd = new Set();

  rejectResults.forEach(function(r) {
    const term = r.term || '';
    const rootTerm = (r.root_term || '').trim();
    const wordCount = term.trim().split(/\s+/).length;

    if (wordCount <= MAX_WORDS) {
      toAdd.add(formatNegativeKw(term));
    } else {
      if (rootTerm && rootTerm.length > 0) {
        toAdd.add(formatNegativeKw(rootTerm));
        Logger.log('Long term (' + wordCount + ' words), using root_term: ' + rootTerm);
      } else {
        const firstThree = term.trim().split(/\s+/).slice(0, 3).join(' ');
        toAdd.add(formatNegativeKw(firstThree));
        Logger.log('Long term, no root_term, using first 3 words: ' + firstThree);
      }
    }

    // תמיד הוסף root_term בנפרד אם קיים ושונה מהמונח המלא
    if (rootTerm && rootTerm.length > 0 && rootTerm !== term.trim()) {
      toAdd.add(formatNegativeKw(rootTerm));
    }
  });

  var added = 0;
  toAdd.forEach(function(kw) {
    try {
      negativeList.addNegativeKeyword(kw);
      Logger.log('Added negative: ' + kw);
      added++;
    } catch (e) {
      Logger.log('Failed to add negative "' + kw + '": ' + e.message);
    }
  });

  Logger.log('Successfully added ' + added + ' negative keywords to ' + CONFIG.NEGATIVE_LIST_NAME);
}

// ============================================================
// ניקוי מילות מוגנות מרשימת השלילה
// מילים שלעולם לא צריכות להיות root_term — אם נפלו לרשימה, מסיר אותן
// ============================================================
function cleanProtectedKeywordsFromNegativeList() {
  Logger.log('=== Checking for protected keywords in negative list ===');

  const PROTECTED_KEYWORDS = [
    'השתלה', 'שתל', 'שיניים', 'טיפול', 'מרפאה', 'רופא', 'שיקום',
    'הפניקס', 'מדיקליניק', 'כללית', 'פה ולסת', 'סדציה', 'זרקוניה',
    'בייקון', 'השלמת שיניים', 'רומן אציל', 'בת ים', 'תותבת', 'תותבות'
  ];

  const protectedSet = new Set(PROTECTED_KEYWORDS.map(function(k) { return k.toLowerCase(); }));

  const listIterator = AdsApp.negativeKeywordLists()
    .withCondition("Name = '" + CONFIG.NEGATIVE_LIST_NAME + "'")
    .get();

  if (!listIterator.hasNext()) {
    Logger.log('Negative keyword list not found, skipping cleanup.');
    return;
  }

  const negativeList = listIterator.next();
  const kwIterator = negativeList.negativeKeywords().get();

  var removed = 0;
  var checked = 0;

  while (kwIterator.hasNext()) {
    const kw = kwIterator.next();
    const rawText = kw.getText();
    // strip phrase-match quotes or exact-match brackets if getText() includes them
    const cleanText = rawText.replace(/^["[\]]+|["[\]]+$/g, '').trim().toLowerCase();

    if (protectedSet.has(cleanText)) {
      Logger.log('CLEANUP: Removing protected keyword "' + rawText + '" from negative list');
      kw.remove();
      removed++;
    }
    checked++;
  }

  Logger.log('Protected keyword cleanup: checked ' + checked + ', removed ' + removed);
}

// ============================================================
// ניהול זיכרון צובר - Properties Service + Sheet fallback
// ============================================================
function loadMemory() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('mediclinic_terms_memory');

  if (!raw) {
    return loadMemoryFromSheet();
  }

  try {
    return JSON.parse(raw);
  } catch(e) {
    return {};
  }
}

function saveMemory(memory) {
  const props = PropertiesService.getScriptProperties();
  const serialized = JSON.stringify(memory);
  const sizeKB = serialized.length / 1024;

  Logger.log('Memory size: ' + sizeKB.toFixed(1) + ' KB');

  if (sizeKB < 450) {
    props.setProperty('mediclinic_terms_memory', serialized);
    Logger.log('Memory saved to Properties Service');
  } else {
    Logger.log('Properties nearly full - archiving to Sheet and resetting');
    archiveMemoryToSheet(memory);
    props.deleteProperty('mediclinic_terms_memory');
    const keys = Object.keys(memory);
    const recent = {};
    keys.slice(-1000).forEach(function(k) { recent[k] = memory[k]; });
    props.setProperty('mediclinic_terms_memory', JSON.stringify(recent));
  }
}

function loadMemoryFromSheet() {
  // Sheet לא זמין - מחזיר זיכרון ריק
  Logger.log('No Sheet available - starting with empty memory');
  return {};
}

function archiveMemoryToSheet(memory) {
  // Sheet לא זמין - מתעד בלוג בלבד
  Logger.log('Memory archive: ' + Object.keys(memory).length + ' terms (Properties reset, no Sheet available)');
}

// ============================================================
// לוג החלטות - נשמר ב-Properties Service (ללא Google Sheet)
// ============================================================
function logToSheet(results) {
  if (!results || results.length === 0) return;

  // סיכום בלוג בלבד - ללא Sheet
  var approved = 0, rejected = 0;
  results.forEach(function(r) {
    if (r.decision === 'APPROVE') approved++;
    else rejected++;
    Logger.log('[' + r.decision + '] ' + r.term + (r.root_term ? ' | root: ' + r.root_term : '') + ' | ' + (r.reason || ''));
  });
  Logger.log('Summary: ' + approved + ' approved, ' + rejected + ' rejected');
}