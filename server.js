import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Ottieni il percorso corrente per configurare dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica le variabili d'ambiente dai file .env e .env.local
dotenv.config();

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

app.post('/generate-quiz', async (req, res) => {
  const { categories } = req.body; // array da 5 categorie

  // Verifica se ci sono categorie valide
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({
      error: 'Categorie non valide',
      message: 'Devi fornire un array di categorie'
    });
  }

  const prompt = `
L'utente ha inserito le seguenti 5 categorie per un quiz in stile Jeopardy!: ${categories.join(", ")}.
Genera un quiz Jeopardy con queste 5 categorie. Ogni categoria deve contenere 5 domande, ciascuna con punteggi da 100 a 500.
Le domande da 100 devono essere facili, quelle da 500 molto difficili.

Per ogni categoria, crea domande con modalità diverse, alternando tra:
- Domande a risposta aperta (es: "Spiega in poche parole...")
- Domande a risposta chiusa (es: "Qual è...", "Chi ha fatto...")
- Domande numeriche (es: "Quanti sono...", "In che anno...")
- Domande con tolleranza numerica (es: "Rispondi con un numero, accetto uno scarto di +/- 2")
- Domande vero/falso

Evita di ripetere la stessa struttura di domanda all'interno della stessa categoria. Il tono delle domande deve essere sia serio che divertente.

IMPORTANTE: Restituisci SOLO un oggetto JSON valido, senza comandi LaTeX o markdown, con questa struttura esatta:
{
  "categories": [
    {
      "title": "Nome Categoria 1",
      "questions": [
        {"points": 100, "text": "Domanda da 100 punti", "answer": "Risposta alla domanda da 100 punti"},
        {"points": 200, "text": "Domanda da 200 punti", "answer": "Risposta alla domanda da 200 punti"},
        {"points": 300, "text": "Domanda da 300 punti", "answer": "Risposta alla domanda da 300 punti"},
        {"points": 400, "text": "Domanda da 400 punti", "answer": "Risposta alla domanda da 400 punti"},
        {"points": 500, "text": "Domanda da 500 punti", "answer": "Risposta alla domanda da 500 punti"}
      ]
    },
    // ... altre 4 categorie con lo stesso formato
  ]
}
`;

  // Verifica se ci sono API key disponibili
  if (API_KEYS.length === 0) {
    console.error('Nessuna API key disponibile. Restituisco categorie di fallback');
    return res.json(generateFallbackData(categories));
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
        "model": "meta-llama/llama-3.3-8b-instruct:free", // Modello gratuito di OpenRouter
        "messages": [
          {
            "role": "system",
            "content": "Sei un assistente specializzato nella creazione di quiz in stile Jeopardy in italiano. Rispondi SOLO con JSON valido, senza formattazione LaTeX o Markdown. Non aggiungere decorazioni o spiegazioni al JSON."
          },
          {
            "role": "user",
            "content": prompt
          }
        ]
      };
      
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
  res.json(generateFallbackData(categories));
});

// Funzione per generare dati di fallback
function generateFallbackData(categories) {
  return {
    categories: categories.map((categoryName) => {
      return {
        title: categoryName,
        questions: [100, 200, 300, 400, 500].map(points => {
          return {
            points,
            text: `Domanda di esempio per ${categoryName} da ${points} punti`,
            answer: `Risposta di esempio per ${categoryName}`
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