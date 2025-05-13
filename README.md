# Quiz Jeopardy con AI

Questo progetto è un'implementazione del classico gioco a quiz Jeopardy, arricchito con funzionalità di intelligenza artificiale per la generazione dinamica di domande e risposte.

![Screenshot del gioco](./screenshot.png)

## Caratteristiche

- **Interfaccia moderna e reattiva** realizzata con React, TypeScript e Tailwind CSS
- **Modalità di gioco predefinita** con categorie casuali in italiano
- **Generazione AI di quiz personalizzati** tramite integrazione con Grok (X.AI) o OpenAI
- **Editor di categorie e domande** per personalizzare il gioco
- **Salvataggio automatico** dello stato del gioco nel browser
- **Design responsivo** per giocare su qualsiasi dispositivo

## Requisiti

- Node.js 18+ e NPM
- Un account con chiave API per uno dei seguenti servizi:
  - [Grok (X.AI)](https://x.ai/) (opzione primaria)
  - [OpenAI](https://openai.com/) (opzione di fallback)

## Installazione

1. Clona il repository:
   ```
   git clone https://github.com/tuonome/jeopardy-quiz-game.git
   cd jeopardy-quiz-game
   ```

2. Installa le dipendenze:
   ```
   npm install
   ```

3. Configura le chiavi API:
   - Crea un file `.env` nella radice del progetto
   - Aggiungi le tue chiavi API nel seguente formato:
   ```
   VITE_GROK_API_KEY=xai-your-grok-api-key
   VITE_OPENAI_API_KEY=sk-your-openai-api-key
   ```
   - Nota: Almeno una delle due chiavi deve essere configurata. Se la chiave Grok non è disponibile o non funziona, il sistema utilizzerà automaticamente OpenAI come fallback.

4. Avvia l'applicazione:
   ```
   npm run dev
   ```

5. Apri nel browser:
   ```
   http://localhost:5173
   ```

## Come Giocare

1. Dalla schermata iniziale, scegli se giocare con le categorie predefinite o creare un gioco personalizzato
2. Se scegli la modalità personalizzata, inserisci 5 categorie di tua scelta e l'AI genererà domande e risposte
3. Seleziona una casella sulla griglia per rivelare una domanda
4. Dopo aver pensato alla risposta, clicca su "Mostra Risposta"
5. Seleziona "Corretta" o "Errata" per aggiornare il punteggio
6. Continua fino a completare tutte le domande o resetta il gioco per ricominciare

## Modalità Modifica

Puoi personalizzare il gioco usando la modalità modifica:

1. Clicca su "Modifica Domande" durante il gioco
2. Modifica i titoli delle categorie cliccandoci sopra
3. Clicca su una casella per modificare la domanda e la risposta
4. Clicca su "Salva e Gioca" per tornare al gioco

## Tecnologie Utilizzate

- React 18
- TypeScript
- Tailwind CSS
- Vite
- API di Grok (X.AI)
- API di OpenAI

## Gestione delle API

L'applicazione è configurata per utilizzare Grok come servizio AI principale. In caso di problemi di autenticazione o disponibilità, passerà automaticamente a OpenAI come fallback. Questo garantisce che il gioco funzioni anche se uno dei servizi non è disponibile.

## Crediti e Risorse

- Grok (X.AI): [grok-3-mini-beta](https://x.ai/)
- OpenAI: [gpt-3.5-turbo](https://openai.com/)
- Icone: [Lucide React](https://lucide.dev/icons/)
- Design ispirato al format televisivo Jeopardy!

## Licenza

MIT License

---

Fatto con ❤️ dalla community italiana di sviluppatori 