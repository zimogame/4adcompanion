import { createNewSession, saveSession, loadCurrentSession, listSessions, deleteSession, exportSession, importSession, loadSession } from './storage.js';
import { initCharacters, getCharactersData } from './characters.js';
import { initEncounters, getEncountersData, updatePECounter } from './encounters.js';
import { initDice, getDiceLog, setDiceLog } from './dice.js';

let currentSession = null;
let saveTimeout = null;

// ============================================================
// Utility globali
// ============================================================

/**
 * Modal di conferma riutilizzabile.
 */
window.showConfirm = function(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    if (!modal) {
      resolve(confirm(message));
      return;
    }
    document.getElementById('confirm-modal-message').textContent = message;
    modal.hidden = false;
    document.getElementById('confirm-modal-yes').onclick = () => { modal.hidden = true; resolve(true); };
    document.getElementById('confirm-modal-no').onclick = () => { modal.hidden = true; resolve(false); };
  });
};

/**
 * Mostra i risultati di un tiro di combattimento in un modal.
 * @param {string} title - Titolo del modal (es. "Attacco in Mischia")
 * @param {Array} results - Array di {arma, dado, tiro, bonus, totale}
 */
window.showCombatResults = function(title, results) {
  const modal = document.getElementById('combat-modal');
  const titleEl = document.getElementById('combat-modal-title');
  const resultsEl = document.getElementById('combat-results');
  const closeBtn = document.getElementById('combat-modal-close');

  if (!modal || !titleEl || !resultsEl) return;

  titleEl.textContent = title;
  resultsEl.innerHTML = '';

  results.forEach(r => {
    const row = document.createElement('div');
    row.className = 'combat-result-row';

    const weapon = document.createElement('span');
    weapon.className = 'cr-weapon';
    weapon.textContent = r.arma || 'Tiro';

    const detail = document.createElement('span');
    detail.className = 'cr-detail';
    const bonusStr = r.bonus >= 0 ? `+${r.bonus}` : `${r.bonus}`;
    detail.textContent = `${r.dado.toUpperCase()}: ${r.roll} ${bonusStr}`;

    const total = document.createElement('span');
    total.className = 'cr-total';
    total.textContent = r.totale;

    row.appendChild(weapon);
    row.appendChild(detail);
    row.appendChild(total);
    resultsEl.appendChild(row);
  });

  modal.hidden = false;
  closeBtn.onclick = () => { modal.hidden = true; };
};

/**
 * Toast notification.
 */
function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-message').textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, duration);
}
window.showToast = showToast;

// ============================================================
// Autosave
// ============================================================

function requestAutosave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    performSave();

    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
      indicator.classList.add('saved');
      setTimeout(() => indicator.classList.remove('saved'), 1000);
    }
  }, 500);
}

function performSave() {
  if (!currentSession) return;

  currentSession.characters = getCharactersData();
  currentSession.encounters = getEncountersData();
  currentSession.diceLog = getDiceLog();

  const nameInput = document.getElementById('session-name');
  if (nameInput) {
    currentSession.nome = nameInput.value || 'Nuova Sessione';
  }

  saveSession(currentSession);
}

// ============================================================
// Inizializzazione App
// ============================================================

function initApp(session) {
  currentSession = session;

  const nameInput = document.getElementById('session-name');
  if (nameInput) {
    nameInput.value = session.nome || '';
  }

  initCharacters(session, requestAutosave);
  initEncounters(session, requestAutosave);
  setDiceLog(session.diceLog || []);

  // Aggiorna contatore PE
  updatePECounter();

  renderSessionsList();
}

// ============================================================
// Tab Navigation
// ============================================================

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab') + '-panel';
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// ============================================================
// Gestione Sessione
// ============================================================

function setupSessionManagement() {
  const nameInput = document.getElementById('session-name');
  if (nameInput) {
    nameInput.addEventListener('input', requestAutosave);
  }

  // Salvataggio manuale
  const saveBtn = document.getElementById('save-session-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      performSave();
      showToast('Sessione salvata!');
    });
  }

  // Nuova sessione
  const newBtn = document.getElementById('new-session-btn');
  if (newBtn) {
    newBtn.addEventListener('click', async () => {
      const res = await window.showConfirm('Sei sicuro di voler creare una nuova sessione? La sessione corrente verrà salvata.');
      if (res) {
        performSave();
        const newSess = createNewSession();
        initApp(newSess);
        showToast('Nuova sessione creata!');
      }
    });
  }

  // Esporta
  const exportBtn = document.getElementById('export-session-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      performSave();
      exportSession(currentSession);
    });
  }

  // Importa
  const importBtn = document.getElementById('import-session-btn');
  const importInput = document.getElementById('import-file-input');

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => {
      importInput.click();
    });

    importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const session = await importSession(file);
        saveSession(session);
        initApp(session);
        showToast('Sessione importata con successo!');
      } catch (err) {
        alert(err.message);
      }

      e.target.value = '';
    });
  }
}

// ============================================================
// Lista Sessioni Salvate
// ============================================================

function renderSessionsList() {
  const listContainer = document.getElementById('sessions-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  const sessions = listSessions();

  if (sessions.length === 0) {
    listContainer.innerHTML = '<p>Nessuna sessione salvata.</p>';
    return;
  }

  sessions.forEach(sess => {
    const div = document.createElement('div');
    div.className = 'session-list-item';

    const dateStr = new Date(sess.updatedAt).toLocaleString('it-IT');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'sess-name';
    nameSpan.textContent = sess.nome;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'sess-date';
    dateSpan.textContent = dateStr;

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Carica';
    loadBtn.addEventListener('click', async () => {
      if (currentSession && currentSession.id !== sess.id) {
        const res = await window.showConfirm('Sei sicuro di voler caricare questa sessione? Le modifiche non salvate andranno perse.');
        if (res) {
          const loaded = loadSession(sess.id);
          if (loaded) {
            initApp(loaded);
            showToast('Sessione caricata!');
          }
        }
      }
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Elimina';
    delBtn.className = 'btn-danger';
    delBtn.addEventListener('click', async () => {
      const res = await window.showConfirm(`Sei sicuro di voler eliminare la sessione "${sess.nome}"?`);
      if (res) {
        deleteSession(sess.id);
        renderSessionsList();

        if (currentSession && currentSession.id === sess.id) {
          const newSess = createNewSession();
          initApp(newSess);
        }
        showToast('Sessione eliminata!');
      }
    });

    const btnContainer = document.createElement('div');
    btnContainer.className = 'sess-actions';
    btnContainer.appendChild(loadBtn);
    btnContainer.appendChild(delBtn);

    div.appendChild(nameSpan);
    div.appendChild(dateSpan);
    div.appendChild(btnContainer);

    if (currentSession && sess.id === currentSession.id) {
      div.classList.add('active-session');
    }

    listContainer.appendChild(div);
  });
}

// ============================================================
// Boot
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  let initialSession = loadCurrentSession();
  if (!initialSession) {
    initialSession = createNewSession();
  }

  setupTabs();
  setupSessionManagement();

  // Init dice (indipendente dalla sessione per UI)
  initDice((rollData) => {
    requestAutosave();
  });

  initApp(initialSession);

  // Shrink header on scroll
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.app-header');
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
});
