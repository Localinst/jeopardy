import { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

const createQuestion = (text: string, answer: string, points: number): any => ({
  id: uuidv4(),
  text,
  answer,
  points,
  isAnswered: false,
});

// Definizione di tutte le categorie disponibili
const allCategories: Category[] = [
  {
    id: uuidv4(),
    title: 'Scienza',
    questions: [
      createQuestion('Questo gas costituisce la maggior parte dell\'atmosfera terrestre', 'Cos\'è l\'Azoto?', 100),
      createQuestion('Questa è la più piccola unità della materia', 'Cos\'è un atomo?', 200),
      createQuestion('Questo scienziato ha formulato la teoria della relatività', 'Chi è Albert Einstein?', 300),
      createQuestion('Questo elemento ha il numero atomico 79', 'Cos\'è l\'Oro?', 400),
      createQuestion('Questo fisico ha sviluppato il principio di indeterminazione della meccanica quantistica', 'Chi è Werner Heisenberg?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Storia',
    questions: [
      createQuestion('Questa guerra si è svolta tra il 1939 e il 1945', 'Cos\'è la Seconda Guerra Mondiale?', 100),
      createQuestion('Questo famoso documento inizia con "Noi, il Popolo"', 'Cos\'è la Costituzione degli Stati Uniti?', 200),
      createQuestion('Questa antica meraviglia fu costruita come tomba per il faraone egizio Cheope', 'Cos\'è la Grande Piramide di Giza?', 300),
      createQuestion('Questo trattato pose fine alla Prima Guerra Mondiale nel 1919', 'Cos\'è il Trattato di Versailles?', 400),
      createQuestion('Questa antica civiltà costruì Machu Picchu in Perù', 'Chi sono gli Inca?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Geografia',
    questions: [
      createQuestion('Questo è l\'oceano più grande della Terra', 'Cos\'è l\'Oceano Pacifico?', 100),
      createQuestion('Questo paese è conosciuto come "La Terra del Sol Levante"', 'Cos\'è il Giappone?', 200),
      createQuestion('Questo fiume è il più lungo del mondo', 'Cos\'è il fiume Nilo?', 300),
      createQuestion('Questa catena montuosa separa l\'Europa dall\'Asia', 'Cosa sono i Monti Urali?', 400),
      createQuestion('Questo paese africano ha il maggior numero di piramidi al mondo', 'Cos\'è il Sudan?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Letteratura',
    questions: [
      createQuestion('Questo autore ha scritto "Romeo e Giulietta"', 'Chi è William Shakespeare?', 100),
      createQuestion('Questo romanzo di F. Scott Fitzgerald presenta il personaggio Jay Gatsby', 'Cos\'è Il Grande Gatsby?', 200),
      createQuestion('Questo autore ha scritto "Cent\'anni di solitudine"', 'Chi è Gabriel García Márquez?', 300),
      createQuestion('Questo poema epico inizia con "Cantami, o Diva, del Pelìde Achille l\'ira funesta"', 'Cos\'è l\'Iliade?', 400),
      createQuestion('Questo autore russo ha scritto "Delitto e Castigo"', 'Chi è Fëdor Dostoevskij?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Intrattenimento',
    questions: [
      createQuestion('Questo attore ha interpretato Iron Man nel Marvel Cinematic Universe', 'Chi è Robert Downey Jr.?', 100),
      createQuestion('Questo film ha vinto il premio Oscar come miglior film nel 2020', 'Cos\'è Parasite?', 200),
      createQuestion('Questa serie TV presenta draghi ed è basata sui libri di George R.R. Martin', 'Cos\'è Il Trono di Spade?', 300),
      createQuestion('Questo artista musicale ha il maggior numero di vittorie ai Grammy di tutti i tempi', 'Chi è Beyoncé?', 400),
      createQuestion('Questo regista ha creato sia il franchise di Star Wars che quello di Indiana Jones', 'Chi è George Lucas?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Musica',
    questions: [
      createQuestion('Questa band britannica ha pubblicato l\'album "The Dark Side of the Moon"', 'Chi sono i Pink Floyd?', 100),
      createQuestion('Questo strumento a corda ha tipicamente 6 corde ed è molto usato nel rock', 'Cos\'è la chitarra elettrica?', 200),
      createQuestion('Questo compositore italiano è famoso per le sue "Quattro Stagioni"', 'Chi è Antonio Vivaldi?', 300),
      createQuestion('Questo genere musicale è nato a New Orleans ed è caratterizzato dall\'improvvisazione', 'Cos\'è il Jazz?', 400),
      createQuestion('Questo compositore tedesco ha continuato a comporre anche dopo essere diventato completamente sordo', 'Chi è Ludwig van Beethoven?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Sport',
    questions: [
      createQuestion('Questo sport si gioca su un campo verde rettangolare con 11 giocatori per squadra', 'Cos\'è il calcio?', 100),
      createQuestion('Questo tennista spagnolo è noto come il "Re della terra rossa"', 'Chi è Rafael Nadal?', 200),
      createQuestion('In questo sport olimpico, gli atleti lanciano un disco di metallo', 'Cos\'è il lancio del disco?', 300),
      createQuestion('Questa competizione ciclistica francese si svolge in 21 tappe', 'Cos\'è il Tour de France?', 400),
      createQuestion('Questo pugile si è convertito all\'Islam e ha cambiato il suo nome da Cassius Clay', 'Chi è Muhammad Ali?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Arte',
    questions: [
      createQuestion('Questo artista italiano dipinse la "Gioconda"', 'Chi è Leonardo da Vinci?', 100),
      createQuestion('Questo stile pittorico, sviluppato in Francia, enfatizza l\'impressione visiva del momento', 'Cos\'è l\'Impressionismo?', 200),
      createQuestion('Questo architetto spagnolo progettò la Sagrada Familia a Barcellona', 'Chi è Antoni Gaudí?', 300),
      createQuestion('Questo artista olandese si tagliò parte di un orecchio e dipinse "Notte stellata"', 'Chi è Vincent van Gogh?', 400),
      createQuestion('Questa tecnica artistica prevede l\'uso di pezzi di carta incollati su una superficie', 'Cos\'è il collage?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Tecnologia',
    questions: [
      createQuestion('Questa azienda ha creato l\'iPhone', 'Cos\'è Apple?', 100),
      createQuestion('Questo linguaggio di programmazione è noto per essere usato nello sviluppo web frontend', 'Cos\'è JavaScript?', 200),
      createQuestion('Questa tecnologia consente la connessione wireless di dispositivi a corto raggio', 'Cos\'è il Bluetooth?', 300),
      createQuestion('Questo protocollo di rete è alla base di Internet e significa "Transmission Control Protocol/Internet Protocol"', 'Cos\'è TCP/IP?', 400),
      createQuestion('Questo algoritmo di consenso è alla base della blockchain di Bitcoin', 'Cos\'è Proof of Work?', 500),
    ],
  },
  {
    id: uuidv4(),
    title: 'Cibo e Cucina',
    questions: [
      createQuestion('Questo formaggio italiano è ingrediente essenziale di una vera pizza margherita', 'Cos\'è la mozzarella?', 100),
      createQuestion('Questo cereale è l\'ingrediente principale del sushi', 'Cos\'è il riso?', 200),
      createQuestion('Questo frutto tropicale è noto per il suo odore forte e controverso', 'Cos\'è il durian?', 300),
      createQuestion('Questa tecnica di cottura rapida a fiamma alta è tipica della cucina cinese', 'Cos\'è il saltare in padella (stir-fry)?', 400),
      createQuestion('Questo fungo è uno dei più costosi al mondo e viene cercato con l\'aiuto di cani addestrati', 'Cos\'è il tartufo?', 500),
    ],
  },
];

// Funzione per selezionare casualmente 5 categorie
const getRandomCategories = (): Category[] => {
  // Crea una copia dell'array per non modificare l'originale
  const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
  // Restituisce le prime 5 categorie
  return shuffled.slice(0, 5);
};

// Esporta 5 categorie casuali come predefinite
export const defaultCategories: Category[] = getRandomCategories();