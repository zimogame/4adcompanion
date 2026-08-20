import { deepClone, calcolaPE } from './storage.js';

let encountersData = [];
let onChange = null;

const TIPO_LABELS = {
  seguaci: '👥 Seguaci',
  boss: '💀 Boss',
  maggiore: '⭐ Maggiore',
  infestante: '🕷️ Infestante'
};

const createEncounter = () => ({
  tipo: 'seguaci',
  nome: '',
  livello: 1,
  numero: 1,
  attacchiPerRound: 1,
  fuggito: false,
  imboscata: false,
  corrotto: false,
  completato: false,
  note: '',
  puntiVita: Array(20).fill(false)
});

export function initEncounters(session, onChangeCallback) {
  encountersData = session && session.encounters ? deepClone(session.encounters) : [];
  onChange = onChangeCallback;
  
  const listContainer = document.getElementById('encounters-list');
  const addBtnOld = document.getElementById('add-encounter-btn');
  
  if (addBtnOld) {
    const addBtn = addBtnOld.cloneNode(true);
    addBtnOld.parentNode.replaceChild(addBtn, addBtnOld);
    
    addBtn.addEventListener('click', () => {
      encountersData.push(createEncounter());
      if (onChange) onChange();
      renderAll(listContainer);
    });
  }
  
  renderAll(listContainer);
}

export function getEncountersData() {
  return deepClone(encountersData);
}

export function updatePECounter() {
  const { pe, seguaciCompletati } = calcolaPE(encountersData);
  const peValueEl = document.getElementById('pe-value');
  if (peValueEl) {
    peValueEl.textContent = pe;
    peValueEl.title = `Boss/Maggiori completati + ${seguaciCompletati} seguaci completati (1 PE ogni 10)`;
  }
}

function renderAll(listContainer) {
  if (!listContainer) return;
  listContainer.innerHTML = '';
  
  const activeEncounters = [];
  const completedEncounters = [];
  
  encountersData.forEach((encData, index) => {
    if (encData.completato) {
      completedEncounters.push({ encData, index });
    } else {
      activeEncounters.push({ encData, index });
    }
  });
  
  activeEncounters.forEach(({ encData, index }) => {
    renderEncounter(encData, index, listContainer);
  });
  
  completedEncounters.forEach(({ encData, index }) => {
    renderEncounter(encData, index, listContainer);
  });
  
  updatePECounter();
}

function bindEncCheckbox(card, selector, index, field, encData) {
  const cb = card.querySelector(selector);
  if (!cb) return;
  cb.checked = !!encData[field];
  cb.addEventListener('change', (e) => {
    encountersData[index][field] = e.target.checked;
    if (onChange) onChange();
  });
}

function renderEncounter(encData, index, listContainer) {
  const template = document.getElementById('encounter-card-template');
  if (!template) return;
  
  const cardFragment = template.content.cloneNode(true);
  const card = cardFragment.querySelector('.encounter-card');
  card.dataset.encounterIndex = index;
  
  const typeRadios = card.querySelectorAll('.enc-tipo');
  typeRadios.forEach(radio => {
    radio.name = `enc-tipo-${index}`;
    if (radio.value === encData.tipo) {
      radio.checked = true;
    }
    radio.addEventListener('change', (e) => {
      encountersData[index].tipo = e.target.value;
      if (onChange) onChange();
    });
  });
  
  const nomeInput = card.querySelector('.enc-nome');
  if (nomeInput) {
    nomeInput.value = encData.nome || '';
    nomeInput.addEventListener('input', (e) => {
      encountersData[index].nome = e.target.value;
      if (onChange) onChange();
    });
  }
  
  ['livello', 'numero', 'attacchi'].forEach(field => {
    const selector = field === 'attacchi' ? '.enc-attacchi' : `.enc-${field}`;
    const dataField = field === 'attacchi' ? 'attacchiPerRound' : field;
    const input = card.querySelector(selector);
    if (input) {
      // Default to 1 for numeric fields
      const fallback = (field === 'livello' || field === 'numero' || field === 'attacchi') ? 1 : '';
      input.value = encData[dataField] !== undefined ? encData[dataField] : fallback;
      input.addEventListener('input', (e) => {
        encountersData[index][dataField] = parseInt(e.target.value, 10) || 0;
        if (onChange) onChange();
      });
    }
  });
  
  bindEncCheckbox(card, '.enc-fuggito', index, 'fuggito', encData);
  bindEncCheckbox(card, '.enc-imboscata', index, 'imboscata', encData);
  bindEncCheckbox(card, '.enc-corrotto', index, 'corrotto', encData);
  
  const hpCirclesContainer = card.querySelector('.hp-circles');
  if (hpCirclesContainer) {
    hpCirclesContainer.innerHTML = '';
    const hpArray = encData.puntiVita || Array(20).fill(false);
    for (let i = 0; i < 20; i++) {
      const circle = document.createElement('span');
      circle.className = 'hp-circle' + (hpArray[i] ? ' active' : '');
      circle.addEventListener('click', () => {
        if (encData.completato) return;
        hpArray[i] = !hpArray[i];
        circle.classList.toggle('active', hpArray[i]);
        encountersData[index].puntiVita = hpArray;
        if (onChange) onChange();
      });
      hpCirclesContainer.appendChild(circle);
    }
  }
  
  const noteInput = card.querySelector('.enc-note');
  if (noteInput) {
    noteInput.value = encData.note || '';
    noteInput.addEventListener('input', (e) => {
      encountersData[index].note = e.target.value;
      if (onChange) onChange();
    });
  }
  
  const completeBtn = card.querySelector('.enc-complete');
  const deleteBtn = card.querySelector('.enc-delete');
  const body = card.querySelector('.encounter-body');
  const summary = card.querySelector('.encounter-summary');
  const typeGroup = card.querySelector('.encounter-type-group');
  
  if (encData.completato) {
    card.classList.add('completed');
    if (body) body.hidden = true;
    if (typeGroup) typeGroup.style.display = 'none';
    if (summary) {
      summary.hidden = false;
      const summaryType = summary.querySelector('.enc-summary-type');
      if (summaryType) summaryType.textContent = TIPO_LABELS[encData.tipo] || encData.tipo;
      const summaryName = summary.querySelector('.enc-summary-name');
      if (summaryName) summaryName.textContent = encData.nome || 'Senza Nome';
    }
    
    if (completeBtn) {
      completeBtn.innerHTML = '&#x21a9;'; // ↩ icon or text
      completeBtn.classList.add('btn-reopen');
      completeBtn.title = 'Riapri scontro';
      completeBtn.addEventListener('click', () => {
        encountersData[index].completato = false;
        if (onChange) onChange();
        renderAll(document.getElementById('encounters-list'));
      });
    }
    
    card.querySelectorAll('input, textarea, select').forEach(el => {
      el.disabled = true;
    });
  } else {
    if (completeBtn) {
      completeBtn.title = 'Completa scontro';
      completeBtn.addEventListener('click', () => {
        encountersData[index].completato = true;
        if (onChange) onChange();
        renderAll(document.getElementById('encounters-list'));
      });
    }
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmMsg = 'Sei sicuro di voler eliminare questo scontro?';
      const confirmed = window.showConfirm
        ? await window.showConfirm(confirmMsg)
        : confirm(confirmMsg);
      if (confirmed) {
        encountersData.splice(index, 1);
        if (onChange) onChange();
        renderAll(document.getElementById('encounters-list'));
      }
    });
  }
  
  listContainer.appendChild(card);
}
