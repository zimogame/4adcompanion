import { deepClone } from './storage.js';
import { getCharactersData } from './characters.js';

let loreData = {
  nomeGruppo: '',
  eventi: []
};
let onChange = null;

// References to the UI
const groupNameInput = document.getElementById('group-name-input');
const displayGroupName = document.getElementById('display-group-name');
const eventsList = document.getElementById('lore-events-list');
const charactersGrid = document.getElementById('lore-characters-grid');

const eventModal = document.getElementById('lore-event-modal');
const eventDateInput = document.getElementById('lore-event-date');
const eventTypeInput = document.getElementById('lore-event-type');
const eventDescInput = document.getElementById('lore-event-desc');

export function initLore(session, onChangeCallback) {
  onChange = onChangeCallback;
  
  if (session && session.lore) {
    loreData = deepClone(session.lore);
  } else {
    loreData = { nomeGruppo: '', eventi: [] };
  }
  
  setupListeners();
  renderLore();
}

export function getLoreData() {
  return deepClone(loreData);
}

function setupListeners() {
  if (groupNameInput) {
    groupNameInput.removeEventListener('input', handleGroupNameChange);
    groupNameInput.addEventListener('input', handleGroupNameChange);
  }
  
  const addEventBtn = document.getElementById('add-lore-event-btn');
  if (addEventBtn) {
    addEventBtn.onclick = () => {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      eventDateInput.value = today;
      eventTypeInput.value = 'avventura';
      eventDescInput.value = '';
      
      eventModal.hidden = false;
    };
  }
  
  const saveBtn = document.getElementById('lore-event-save');
  const cancelBtn = document.getElementById('lore-event-cancel');
  
  if (saveBtn) {
    saveBtn.onclick = () => {
      if (!eventDescInput.value.trim()) {
        alert("Inserisci una descrizione dell'evento");
        return;
      }
      
      loreData.eventi.push({
        data: eventDateInput.value,
        tipo: eventTypeInput.value,
        descrizione: eventDescInput.value.trim()
      });
      
      // Sort eventi per data descrescente (più recenti prima)
      loreData.eventi.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      eventModal.hidden = true;
      if (onChange) onChange();
      renderEvents();
    };
  }
  
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      eventModal.hidden = true;
    };
  }
}

function handleGroupNameChange(e) {
  loreData.nomeGruppo = e.target.value;
  if (displayGroupName) {
    displayGroupName.textContent = loreData.nomeGruppo;
  }
  if (onChange) onChange();
}

export function renderLore() {
  if (groupNameInput) {
    groupNameInput.value = loreData.nomeGruppo || '';
  }
  if (displayGroupName) {
    displayGroupName.textContent = loreData.nomeGruppo || '';
  }
  
  renderEvents();
  renderCharactersLore();
}

function renderEvents() {
  if (!eventsList) return;
  eventsList.innerHTML = '';
  
  if (loreData.eventi.length === 0) {
    eventsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Nessun evento registrato.</p>';
    return;
  }
  
  const typeIcons = {
    'avventura': '⚔️',
    'nuovo_pg': '👤',
    'morte_pg': '💀',
    'traguardo': '🏆',
    'altro': '📝'
  };
  
  loreData.eventi.forEach((ev, idx) => {
    const div = document.createElement('div');
    div.style.background = 'var(--surface-light)';
    div.style.padding = '0.75rem';
    div.style.borderRadius = '4px';
    div.style.marginBottom = '0.5rem';
    div.style.borderLeft = '4px solid var(--accent-gold)';
    div.style.position = 'relative';
    
    // Header (Icon + Type + Date)
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '0.5rem';
    header.style.fontSize = '0.85rem';
    header.style.fontWeight = '600';
    header.style.color = 'var(--accent-gold)';
    
    const icon = typeIcons[ev.tipo] || '📝';
    let typeName = ev.tipo;
    if (ev.tipo === 'nuovo_pg') typeName = 'Nuovo Personaggio';
    else if (ev.tipo === 'morte_pg') typeName = 'Morte Personaggio';
    else typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
    
    header.innerHTML = `<span>${icon} ${typeName}</span><span>${new Date(ev.data).toLocaleDateString('it-IT')}</span>`;
    
    // Description
    const desc = document.createElement('p');
    desc.style.margin = '0';
    desc.style.fontSize = '0.95rem';
    desc.style.whiteSpace = 'pre-wrap';
    desc.textContent = ev.descrizione;
    
    // Delete Button
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-remove';
    delBtn.textContent = '✕';
    delBtn.style.position = 'absolute';
    delBtn.style.top = '0.5rem';
    delBtn.style.right = '0.5rem';
    delBtn.style.background = 'transparent';
    delBtn.style.border = 'none';
    delBtn.style.color = 'var(--text-muted)';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => {
      if (confirm('Eliminare questo evento?')) {
        loreData.eventi.splice(idx, 1);
        if (onChange) onChange();
        renderEvents();
      }
    };
    
    div.appendChild(header);
    div.appendChild(desc);
    div.appendChild(delBtn);
    eventsList.appendChild(div);
  });
}

// Chiamato anche quando cambiano i pg dalla tab Personaggi (tramite app.js)
export function renderCharactersLore() {
  if (!charactersGrid) return;
  const chars = getCharactersData();
  
  charactersGrid.innerHTML = '';
  
  if (chars.length === 0) {
    charactersGrid.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Aggiungi personaggi nel Gruppo per scrivere la loro storia.</p>';
    return;
  }
  
  chars.forEach((c, idx) => {
    const div = document.createElement('div');
    div.style.background = 'var(--surface-light)';
    div.style.padding = '1rem';
    div.style.borderRadius = '8px';
    div.style.marginBottom = '1rem';
    
    const h3 = document.createElement('h3');
    h3.style.margin = '0 0 0.5rem 0';
    h3.style.color = 'var(--accent-gold)';
    h3.textContent = c.nome || `Personaggio ${idx + 1}`;
    
    const textarea = document.createElement('textarea');
    textarea.className = 'field-input';
    textarea.rows = 4;
    textarea.placeholder = "Aspetto, legami, carattere, storia...";
    textarea.value = c.lore || '';
    
    textarea.addEventListener('change', (e) => {
      // Invia un update globalmente ai personaggi
      // Non è elegantissimo, ma dispatchamo un event window per far aggiornare `characters.js`
      const event = new CustomEvent('updateCharacterLore', { detail: { index: idx, lore: e.target.value } });
      window.dispatchEvent(event);
    });
    
    div.appendChild(h3);
    div.appendChild(textarea);
    charactersGrid.appendChild(div);
  });
}
