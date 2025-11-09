import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';


import { createClient } from '@supabase/supabase-js';

// Ottieni il percorso corrente per configurare dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica le variabili d'ambiente dai file .env e .env.local
dotenv.config();

// Validate Supabase env vars before creating client
let supabase = null;
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set. Supabase features will be disabled.');
} else {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase client created');
  } catch (e) {
    console.error('Failed to create Supabase client:', e.message || e);
    supabase = null;
  }
}

const app = express();

// Configura CORS in modo più permissivo
const corsOptions = {
  origin: ['https://jeopard.netlify.app', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174','https://jeopardy-b937.onrender.com/generate-quiz'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Log informativo all'avvio del server
console.log('CORS configurato per:', corsOptions.origin.join(', '));

// Configura un pool di API key
const API_KEYS = [
  process.env.OPENROUTER_API_KEY,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3
].filter(key => key && key.trim() !== ''); // Filtra le chiavi undefined o vuote

if (API_KEYS.length === 0) {
  console.error('ATTENZIONE: Nessuna API key valida trovata nelle variabili d\'ambiente. Il servizio non funzionerà!');
}

// Stato di ogni API key (true = funzionante, false = non funzionante)
const apiKeyStatus = API_KEYS.map(() => true);

// Contatore per tenere traccia dell'ultima API key usata
let currentKeyIndex = 0;

// Funzione per ottenere la prossima API key funzionante
const getNextWorkingApiKey = () => {
  // Verifica se ci sono API key disponibili
  if (API_KEYS.length === 0) {
    console.error('Nessuna API key disponibile!');
    return { key: null, index: -1 };
  }
  
  // Verifica se c'è almeno una chiave funzionante
  if (!apiKeyStatus.some(status => status)) {
    console.log('Tutte le API key sembrano non funzionare. Resettiamo lo stato e riproviamo.');
    // Reset dello stato di tutte le chiavi
    apiKeyStatus.fill(true);
  }
  
  // Trova la prossima chiave funzionante
  let attempts = 0;
  while (attempts < API_KEYS.length) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    if (apiKeyStatus[currentKeyIndex]) {
      return {
        key: API_KEYS[currentKeyIndex],
        index: currentKeyIndex
      };
    }
    attempts++;
  }
  
  // Fallback all'ultima chiave
  return {
    key: API_KEYS[0],
    index: 0
  };
};

// Stampa informazioni sulle API key disponibili
console.log(`Pool di ${API_KEYS.length} API key disponibili`);
// Stampa solo i primi caratteri di ogni chiave per verifica
API_KEYS.forEach((key, index) => {
  if (key) {
    console.log(`API Key ${index+1} (primi 10 caratteri): ${key.substring(0, 10)}...`);
  }
});

// Utilizza la variabile d'ambiente per la chiave API di OpenRouter
if (API_KEYS.length > 0 && API_KEYS[0]) {
  console.log('OpenRouter API Token iniziale (primi 10 caratteri):', API_KEYS[0].substring(0, 10) + '...');
} else {
  console.error('ATTENZIONE: API Token iniziale non disponibile o non valido!');
}

// Endpoint per mantenere il server sveglio attraverso cron job
app.get('/ping', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Ping ricevuto alle ${timestamp}`);
  res.status(200).json({ 
    status: 'online', 
    timestamp: timestamp,
    message: 'Il server è attivo'
  });
});

// Endpoint per ottenere categorie casuali dal database
app.get('/random-quiz', async (req, res) => {
  try {
    if (!supabase) {
      const reqLang = (req.query.lang && String(req.query.lang)) || (req.headers['accept-language'] && String(req.headers['accept-language']).split(',')[0]) || 'it';
      const language = reqLang && reqLang.startsWith('en') ? 'en' : 'it';
      console.warn('/random-quiz called but supabase is not configured, returning fallback categories', language);
      const fallback = generateFallbackData(['General','History','Science','Music','Cinema'], language);
      return res.json(fallback);
    }
    // Ottieni tutte le categorie con le loro domande
    const { data: allCategories, error: catError } = await supabase
      .from('categories')
      .select(`
        id,
        title,
        questions (
          text,
          answer,
          points
        )
      `);

    if (catError) throw catError;

    // Filtra le categorie che hanno esattamente 5 domande
    const validCategories = allCategories.filter(cat => cat.questions?.length === 5);
   if (validCategories.length < 5) {
      throw new Error('Non ci sono abbastanza categorie valide nel database');
    }

    // Mescola l'array delle categorie
    const shuffledCategories = validCategories.sort(() => Math.random() - 0.5);

    // Prendi le prime 4 categorie
    const selectedCategories = shuffledCategories.slice(0, 4);

    // Raccogli tutte le domande disponibili nel database
    const allQuestions = validCategories.flatMap(cat => 
      cat.questions.map(q => ({
        ...q,
        categoryTitle: cat.title // Aggiungiamo il titolo della categoria originale
      }))
    );

    // Raggruppa le domande per punteggio
    const questionsByPoints = {};
    [100, 200, 300, 400, 500].forEach(points => {
      questionsByPoints[points] = allQuestions.filter(q => q.points === points);
    });

    // Seleziona una domanda casuale per ogni punteggio
    const mysteryQuestions = Object.entries(questionsByPoints).map(([points, questions]) => {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      return {
        ...randomQuestion,
        text: `${randomQuestion.text} `
      };
    }).sort((a, b) => a.points - b.points);

    // Crea la categoria Mistero
    const mysteryCategory = {
      id: 'mystery',
      title: '???',
      questions: mysteryQuestions
    };

    // Ordina le domande per punteggio in ogni categoria normale
    const categories = [
      ...selectedCategories.map(cat => ({
        ...cat,
        questions: cat.questions.sort((a, b) => a.points - b.points)
      })),
      mysteryCategory
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching random quiz:', error);
    res.status(500).json({ error: 'Failed to fetch random quiz' });
  }
});

app.post('/generate-quiz', async (req, res) => {
  const { categories, lang } = req.body; // array da 5 categorie, optional lang
  const language = (lang && typeof lang === 'string' && lang.startsWith('en')) ? 'en' : 'it';

  // Verifica se ci sono categorie valide
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({
      error: 'Categorie non valide',
      message: 'Devi fornire un array di categorie'
    });
  }

  // Build prompts in the requested language
  const systemMessage = language === 'en'
    ? "You are an expert quiz writer. Produce clear Jeopardy-style questions and concise answers in English. Respond ONLY with valid JSON according to the requested schema."
    : "Sei un esperto nella creazione di quiz interattivi. Crea domande chiare in stile Jeopardy e risposte concise in italiano. Rispondi SOLO con JSON valido secondo lo schema richiesto.";

  const userPrompt = language === 'en'
    ? `The user provided these 5 categories for a Jeopardy-style quiz: ${categories.join(', ')}. Generate a Jeopardy quiz using these 5 categories. Each category must contain 5 questions with point values 100-500. 100-point questions should be easy, 500-point questions should be very hard.

Important rules:
1. Answers MUST NOT be contained in the questions.
2. Questions MUST be phrased as REAL QUESTIONS (with a question mark).
3. Answers must be concise (preferably 1-5 words) and precise.
4. Each question must have exactly one unambiguous correct answer.
5. Ensure factual accuracy.
6. Avoid trivial or obvious questions.
7. Return ONLY a valid JSON object with this exact structure:
{
  "categories": [
    {
      "title": "Category Name 1",
      "questions": [
        {"points": 100, "text": "Question text", "answer": "Answer text"},
        {"points": 200, "text": "Question text", "answer": "Answer text"},
        {"points": 300, "text": "Question text", "answer": "Answer text"},
        {"points": 400, "text": "Question text", "answer": "Answer text"},
        {"points": 500, "text": "Question text", "answer": "Answer text"}
      ]
    }
  ]
}`
    : `L'utente ha fornito queste 5 categorie per un quiz in stile Jeopardy!: ${categories.join(', ')}. Genera un quiz Jeopardy usando queste 5 categorie. Ogni categoria deve contenere 5 domande con punteggi 100-500. Le domande da 100 devono essere facili, quelle da 500 molto difficili.

Regole importanti:
1. Le risposte NON devono essere contenute nelle domande.
2. Le domande DEVONO essere formulate come VERE DOMANDE (con punto interrogativo).
3. Le risposte devono essere concise (preferibilmente 1-5 parole) e precise.
4. Ogni domanda deve avere una sola risposta corretta e non ambigua.
5. Assicurati della correttezza fattuale.
6. Evita domande banali o ovvie.
7. Restituisci SOLO un oggetto JSON valido con questa struttura esatta:
{
  "categories": [
    {
      "title": "Nome Categoria 1",
      "questions": [
        {"points": 100, "text": "Testo della domanda", "answer": "Testo della risposta"},
        {"points": 200, "text": "Testo della domanda", "answer": "Testo della risposta"},
        {"points": 300, "text": "Testo della domanda", "answer": "Testo della risposta"},
        {"points": 400, "text": "Testo della domanda", "answer": "Testo della risposta"},
        {"points": 500, "text": "Testo della domanda", "answer": "Testo della risposta"}
      ]
    }
  ]
}`;

  // Verifica se ci sono API key disponibili
  if (API_KEYS.length === 0) {
    console.error('Nessuna API key disponibile. Restituisco categorie di fallback');
    return res.json(generateFallbackData(categories, language));
  }

  // Inizia con la prima API key disponibile
  let apiKeyInfo = getNextWorkingApiKey();
  let attempts = 0;
  const maxAttempts = API_KEYS.length;
  
  while (attempts < maxAttempts) {
    try {
      // Verifica se abbiamo una chiave valida
      if (!apiKeyInfo.key) {
        console.error('API key non valida. Passaggio al fallback.');
        break;
      }

      // Utilizziamo OpenRouter API con gli header corretti
      console.log(`Tentativo ${attempts+1}/${maxAttempts} con API Key ${apiKeyInfo.index+1}`);
      
      const headers = {
        "Authorization": `Bearer ${apiKeyInfo.key}`,
        "HTTP-Referer": "https://jeopardy-b937.onrender.com",
        "X-Title": "Jeopardy Quiz App",
        "Content-Type": "application/json"
      };
      
      console.log('Headers configurati:', Object.keys(headers).join(', '));
      console.log('Header Authorization (primi 20 caratteri):', headers.Authorization.substring(0, 20) + '...');
      
      const requestBody = {
        "model": "mistralai/mistral-small-3.2-24b-instruct:free", // Modello gratuito di OpenRouter
        "messages": [
          {
            "role": "system",
            "content": systemMessage
          },
          {
            "role": "user",
            "content": userPrompt
          }
        ]
      };
      console.log(requestBody);
      console.log('Corpo richiesta preparato');
      console.log('Modello utilizzato:', requestBody.model);
      console.log('Invio richiesta a OpenRouter...');
      
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions", 
        requestBody,
        { headers: headers, timeout: 30000 }
      );

      console.log('Risposta API ricevuta:', response.status);
      
      // Se arriviamo qui, la richiesta è andata a buon fine
      console.log(`API Key ${apiKeyInfo.index+1} funzionante!`);
      
      // Estrai il contenuto dal messaggio di completamento
      const generatedText = response.data.choices[0].message.content || '';
      
      if (!generatedText) {
        console.error('Risposta vuota o in formato non riconosciuto dall\'API');
        throw new Error('Risposta vuota o in formato non riconosciuto dall\'API');
      }
      
      console.log('Testo generato:', generatedText.substring(0, 100) + '...');
      
      // Estrae il JSON dalla risposta
  let parsedData;
  let savedQuizId = null;
      try {
        // Log per diagnostica
        console.log('Testo generato:', generatedText.substring(0, 100) + '...');
        
        // Cerca di trovare la struttura JSON nella risposta, gestendo anche casi con \boxed{} e altri pattern
        let jsonText = generatedText;
        
        // Rimuove eventuali comandi LaTeX come \boxed{} dal testo
        if (jsonText.includes('\\boxed{')) {
          console.log('Rilevato comando LaTeX \\boxed{}, pulizia in corso...');
          jsonText = jsonText.replace('\\boxed{', '').replace(/}$/, '');
        }
        
        // Cerca di trovare la struttura JSON completa nella risposta
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
              parsedData = JSON.parse(jsonMatch[0]);
              console.log('JSON estratto con successo tramite pattern matching');
              try {
                console.log('[DEBUG] Inizio salvataggio su Supabase...');

                const { data: quizInsert, error: quizError } = await supabase
                  .from('quizzes')
                  .insert({
                    title: 'Quiz generato con categorie: ' + categories.join(', '),
                    created_by: null // Se hai auth, sostituisci con `req.user.id`
                  })
                  .select()
                  .single();

                if (quizError) throw quizError;
                const quizId = quizInsert.id;
                savedQuizId = quizId;

                for (let i = 0; i < parsedData.categories.length; i++) {
                  const cat = parsedData.categories[i];

                  const { data: categoryInsert, error: catError } = await supabase
                    .from('categories')
                    .insert({
                      quiz_id: quizId,
                      title: cat.title,
                      position: i + 1
                    })
                    .select()
                    .single();

                  if (catError) throw catError;
                  const categoryId = categoryInsert.id;

                  const questionsToInsert = cat.questions.map(q => ({
                    category_id: categoryId,
                    points: q.points,
                    text: q.text,
                    answer: q.answer
                  }));

                  const { error: questionsError } = await supabase
                    .from('questions')
                    .insert(questionsToInsert);

                  if (questionsError) throw questionsError;
                }

                console.log(`Quiz ${quizId} salvato correttamente in Supabase`);
              } catch (dbError) {
                console.error('Errore nel salvataggio su Supabase:', dbError);
                // Se vuoi, puoi restituire un 500 oppure continuare normalmente
              }
            } catch (innerError) {
              console.error('Errore nel parsing del JSON estratto:', innerError.message);
              // Tenta un'ulteriore pulizia del testo
              const cleanedJson = jsonMatch[0].replace(/```json|```/g, '').trim();
              parsedData = JSON.parse(cleanedJson);
            }
        } else {
          try {
            // Prova a parsare direttamente la risposta come JSON
            parsedData = JSON.parse(jsonText.trim());
            console.log('JSON estratto con successo tramite parsing diretto');
          } catch (error) {
            console.error('Formato JSON non trovato nella risposta:', error.message);
            throw new Error('Formato JSON non trovato nella risposta');
          }
        }
      } catch (parseError) {
        console.error('Errore nel parsing della risposta:', parseError.message);
        // Logga i primi 300 caratteri del testo ricevuto per debug
        console.error('Primi 300 caratteri della risposta problematica:', generatedText.substring(0, 300));
        throw new Error('Errore nel parsing della risposta JSON');
      }

      // Attach savedQuizId if we created/stored a quiz
      if (parsedData && savedQuizId) {
        try { parsedData.quizId = savedQuizId; } catch(e){}
      }
      res.json(parsedData);
      return; // Usciamo dalla funzione se la richiesta ha avuto successo
    } catch (error) {
      console.error(`Errore con API Key ${apiKeyInfo.index+1}:`, error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.error('ERRORE DI AUTENTICAZIONE: La chiave API potrebbe non essere valida.');
        // Segna questa chiave come non funzionante
        apiKeyStatus[apiKeyInfo.index] = false;
      }
      
      // Prova con la prossima chiave
      apiKeyInfo = getNextWorkingApiKey();
      attempts++;
      
      if (attempts < maxAttempts) {
        console.log(`Provo con la prossima API Key: ${apiKeyInfo.index+1}`);
      } else {
        console.error('Esauriti tutti i tentativi con le API key disponibili');
      }
    }
  }
  
  // Tutte le API key hanno fallito, restituisci categorie di fallback
  console.error('Tutte le API key hanno fallito, restituisco categorie di fallback');
  res.json(generateFallbackData(categories, language));
});

// Endpoint per restituire una pagina pubblica per un quiz (SEO-friendly)
app.get('/quiz/:id', async (req, res) => {
  const quizId = req.params.id;
  try {
    if (!supabase) {
      console.warn(`/quiz/${quizId} requested but supabase is not configured`);
      return res.status(503).send('Service unavailable: database not configured');
    }
    // Recupera quiz, categorie e domande dal DB
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, created_at')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) return res.status(404).send('Quiz non trovato');

    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('id, title, position')
      .eq('quiz_id', quizId)
      .order('position', { ascending: true });

    if (catError) throw catError;

    // Costruisci semplice HTML con meta tags per SEO
    const title = quizData.title || 'Quiz Jeopardy';
    const description = `Gioca al quiz: ${title}. Contiene ${categoriesData.length} categorie.`;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:url" content="${url}" />
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
        <ul>
          ${categoriesData.map(cat => `<li>${cat.position}. ${cat.title}</li>`).join('')}
        </ul>
      </body>
    </html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Errore nel recupero del quiz pubblico:', error);
    res.status(500).send('Errore interno');
  }
});

// Dynamic sitemap endpoint
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Base static pages
    const urls = [
      { loc: 'https://jeopardyonline.it/', priority: 1.0 },
      { loc: 'https://jeopardyonline.it/en/', priority: 0.8 },
      { loc: 'https://jeopardyonline.it/it/', priority: 0.8 }
    ];

    // Fetch recent quizzes (if supabase available)
    if (supabase) {
      const { data: quizzes, error: qError } = await supabase
        .from('quizzes')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!qError && quizzes && quizzes.length) {
        quizzes.forEach(q => {
          urls.push({ loc: `https://jeopardyonline.it/quiz/${q.id}`, priority: 0.6 });
        });
      }
    } else {
      console.warn('/sitemap.xml requested but supabase is not configured; only static pages will be included');
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Errore generazione sitemap dinamica:', error);
    res.status(500).send('Errore interno');
  }
});

// Funzione per generare dati di fallback
function generateFallbackData(categories, lang = 'it') {
  const isEn = lang && lang.startsWith('en');
  return {
    categories: categories.map((categoryName) => {
      return {
        title: categoryName,
        questions: [100, 200, 300, 400, 500].map(points => {
          return {
            points,
            text: isEn
              ? `Sample question for ${categoryName} worth ${points} points`
              : `Domanda di esempio per ${categoryName} da ${points} punti`,
            answer: isEn
              ? `Sample answer for ${categoryName}`
              : `Risposta di esempio per ${categoryName}`
          };
        })
      };
    })
  };
}

// Gestione errore per JSON malformato
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'JSON malformato',
      message: err.message 
    });
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
}); 
