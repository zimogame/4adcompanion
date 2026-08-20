// ============================================================
// storage.js — Persistenza localStorage per 4AD Companion v2
// ============================================================

export const DEFAULT_CHARACTER = {
  nome: '',
  classe: '',
  livello: 1,
  vitaMax: 0,
  vitaAttuale: 0,
  oro: 0,
  attacco: 'd6',    // tipo dado
  difesa: 'd6',     // tipo dado
  lanterna: false,
  fasciato: false,
  ordineMarcia: 0,   // 0=nessuno, 1-4=posizione
  razioni: 6,
  abilita: [],       // [{nome, descrizione}]
  tratti: [],        // [{nome, descrizione}]
  equipaggiamento: [],// [{nome, descrizione}]
  armamento: [],     // [{nome, tipo:'M'|'D'|'A'|'S', equipaggiato:bool, bonus:number, dado:string}]
  tesoro: [],        // [{nome, descrizione}]
  maxIncantesimi: 0,
  incantesimi: [],   // [{nome, usi:[bool,bool,bool]}]
  note: '',          // (era: missioni)
  indizi: [
    { cerchi: [false, false, false], testo: '' }
  ],
  status: ''
};

export const DEFAULT_SESSION = {
  id: '',
  nome: 'Nuova Sessione',
  createdAt: 0,
  updatedAt: 0,
  characters: [],
  encounters: [],
  diceLog: []
};

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function deepClone(obj) {
  return structuredClone(obj);
}

export function createNewSession(name = 'Nuova Sessione') {
  const session = deepClone(DEFAULT_SESSION);
  session.id = generateId();
  session.nome = name;
  session.createdAt = Date.now();
  session.updatedAt = Date.now();
  session.characters = [
    deepClone(DEFAULT_CHARACTER),
    deepClone(DEFAULT_CHARACTER),
    deepClone(DEFAULT_CHARACTER),
    deepClone(DEFAULT_CHARACTER)
  ];
  return session;
}

/**
 * Migra un personaggio dal formato v1 al v2.
 */
function migrateCharacter(char) {
  // vita → vitaMax + vitaAttuale
  if (char.vita !== undefined && char.vitaMax === undefined) {
    char.vitaMax = char.vita;
    char.vitaAttuale = char.vita;
    delete char.vita;
  }
  // attacco/difesa: number → string dado
  if (typeof char.attacco === 'number') {
    char.attacco = 'd6';
  }
  if (typeof char.difesa === 'number') {
    char.difesa = 'd6';
  }
  // missioni → note
  if (char.missioni !== undefined && char.note === undefined) {
    char.note = char.missioni;
    delete char.missioni;
  }
  // Nuovi campi con default
  if (!char.tratti) char.tratti = [];
  if (!char.armamento) char.armamento = [];
  if (!char.tesoro) char.tesoro = [];
  if (char.razioni === undefined) char.razioni = 6;
  if (char.maxIncantesimi === undefined) char.maxIncantesimi = 0;
  if (char.vitaMax === undefined) char.vitaMax = 0;
  if (char.vitaAttuale === undefined) char.vitaAttuale = 0;
  if (char.note === undefined) char.note = '';
  // Indizi: ridurre a 1 riga se ce ne sono 2
  if (char.indizi && char.indizi.length > 1) {
    char.indizi = [char.indizi[0]];
  }
  if (!char.indizi || char.indizi.length === 0) {
    char.indizi = [{ cerchi: [false, false, false], testo: '' }];
  }
  return char;
}

/**
 * Migra un incontro al formato v2.
 */
function migrateEncounter(enc) {
  if (enc.completato === undefined) enc.completato = false;
  if (!enc.puntiVita) enc.puntiVita = new Array(20).fill(false);
  if (enc.livello === undefined) enc.livello = 1;
  if (enc.numero === undefined) enc.numero = 1;
  if (enc.attacchiPerRound === undefined) enc.attacchiPerRound = 1;
  if (enc.fuggito === undefined) enc.fuggito = false;
  if (enc.imboscata === undefined) enc.imboscata = false;
  if (enc.corrotto === undefined) enc.corrotto = false;
  // Migra vecchio tipo 'minion' a 'seguaci'
  if (enc.tipo === 'minion') enc.tipo = 'seguaci';
  if (enc.tipo === 'weird') enc.tipo = 'infestante';
  return enc;
}

/**
 * Migra una sessione intera al formato v2.
 */
function migrateSession(session) {
  if (session.characters) {
    session.characters = session.characters.map(migrateCharacter);
  }
  if (session.encounters) {
    session.encounters = session.encounters.map(migrateEncounter);
  }
  return session;
}

export function saveSession(session) {
  session.updatedAt = Date.now();
  localStorage.setItem(`4ad_session_${session.id}`, JSON.stringify(session));
  localStorage.setItem('4ad_current_session_id', session.id);
}

export function loadCurrentSession() {
  const currentId = localStorage.getItem('4ad_current_session_id');
  if (currentId) {
    return loadSession(currentId);
  }
  return null;
}

export function loadSession(id) {
  const data = localStorage.getItem(`4ad_session_${id}`);
  if (data) {
    try {
      const session = JSON.parse(data);
      return migrateSession(session);
    } catch (e) {
      console.error('Errore nel parse della sessione', e);
      return null;
    }
  }
  return null;
}

export function listSessions() {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('4ad_session_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        sessions.push({
          id: data.id,
          nome: data.nome,
          updatedAt: data.updatedAt
        });
      } catch (e) {
        console.error('Errore nel parse dei metadati', e);
      }
    }
  }
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteSession(id) {
  localStorage.removeItem(`4ad_session_${id}`);
  const currentId = localStorage.getItem('4ad_current_session_id');
  if (currentId === id) {
    localStorage.removeItem('4ad_current_session_id');
  }
}

export function exportSession(session) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `4ad_${session.nome.replace(/\s+/g, '_')}_${session.id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function importSession(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const session = JSON.parse(e.target.result);
        if (session.id && session.characters) {
          resolve(migrateSession(session));
        } else {
          reject(new Error('Formato sessione non valido'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Errore durante la lettura del file'));
    reader.readAsText(file);
  });
}

/**
 * Calcola i Punti Esperienza dagli incontri completati.
 * Boss: 1 PE, Maggiore: 1 PE, Seguaci: 1 PE ogni 10, Infestante: 0
 */
export function calcolaPE(encounters) {
  let pe = 0;
  let seguaciCompletati = 0;

  encounters.forEach(enc => {
    if (!enc.completato) return;
    switch (enc.tipo) {
      case 'boss':
        pe += 1;
        break;
      case 'maggiore':
        pe += 1;
        break;
      case 'seguaci':
        seguaciCompletati += (enc.numero || 1);
        break;
      case 'infestante':
        // Nessun PE
        break;
    }
  });

  pe += Math.floor(seguaciCompletati / 10);
  return { pe, seguaciCompletati };
}
