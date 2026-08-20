import { deepClone } from './storage.js';

const CLASSES_DB = {
  "Acrobata": { pvFormula: L => L + 3, attBase: L => Math.floor(L / 2), difBase: L => L, speciale: "Acrobazie (Punti = L+3), Furtività +L. Salvezza caduta/nuoto/arrampicata +L, trappole +½L." },
  "Assassino": { pvFormula: L => L + 3, attBase: L => Math.floor(L / 2), difBase: L => 0, speciale: "" },
  "Baluardo": { pvFormula: L => L + 7, attBase: L => Math.floor(L / 2), difBase: L => Math.floor(L / 2), speciale: "" },
  "Barbaro": { pvFormula: L => L + 7, attBase: L => L, difBase: L => 0, speciale: "Furia barbarica." },
  "Chierico": { pvFormula: L => L + 4, attBase: L => Math.floor(L / 2), difBase: L => 0, speciale: "Guarigione, Bonus +L contro non morti." },
  "Dimachærus": { pvFormula: L => L + 5, attBase: L => Math.floor(L / 2), difBase: L => Math.floor(L / 2), speciale: "Combatte con due armi." },
  "Druido": { pvFormula: L => L + 3, attBase: L => 0, difBase: L => 0, speciale: "Magia druidica." },
  "Elfo": { pvFormula: L => L + 4, attBase: L => L, difBase: L => 0, speciale: "Magia. +L attacco mischia/distanza (tranne armi a due mani). +1 contro Orchi." },
  "Furfante": { pvFormula: L => L + 3, attBase: L => 0, difBase: L => L, speciale: "+L attacco contro Nemici Minori in inferiorità numerica. Furtività +L, Trappole +L." },
  "Gnomo": { pvFormula: L => L + 4, attBase: L => 0, difBase: L => Math.floor(L / 2), speciale: "Magia gnomesca. Furtività." },
  "Guerriero": { pvFormula: L => L + 6, attBase: L => L, difBase: L => 0, speciale: "Nessuna restrizione su armi o armature." },
  "Illusionista": { pvFormula: L => L + 2, attBase: L => 0, difBase: L => 0, speciale: "Magia illusoria." },
  "Kukla": { pvFormula: L => L + 5, attBase: L => 1, difBase: L => Math.floor(L / 2), speciale: "+1 fisso attacco con armi leggere da taglio." },
  "Mago": { pvFormula: L => L + 2, attBase: L => 0, difBase: L => 0, speciale: "+L ai Tiri Incantesimo." },
  "Mezzuomo": { pvFormula: L => L + 3, attBase: L => 0, difBase: L => 0, speciale: "+L Difesa contro Giganti, Troll, Ogre. +L Attacco con Fionda. Furtività +L." },
  "Monaco Fungoide": { pvFormula: L => L + 4, attBase: L => L, difBase: L => 0, speciale: "+L attacco con armi del monaco o mani nude." },
  "Nano": { pvFormula: L => L + 5, attBase: L => L, difBase: L => 0, speciale: "+L mischia, nessun bonus a distanza. +1 Difesa contro giganti/troll/ogre. Cercare oro." },
  "Paladino": { pvFormula: L => L + 6, attBase: L => L, difBase: L => 0, speciale: "Aura e abilità sacre." },
  "Ranger": { pvFormula: L => L + 6, attBase: L => L, difBase: L => 0, speciale: "Maestria terre selvagge." },
  "Spadaccino": { pvFormula: L => L + 4, attBase: L => Math.floor(L / 2), difBase: L => Math.floor(L / 2), speciale: "Due attacchi per turno. Punti Maestria." }
};

let characters = [];
let onStateChange = () => {};

export function getCharactersData() {
  return deepClone(characters);
}

function getDefaultCharacter() {
  return {
    nome: '', classe: '', livello: 1,
    vitaMax: 0, vitaAttuale: 0,
    oro: 0,
    attacco: 'd6',
    difesa: 'd6',
    lanterna: false, fasciato: false,
    ordineMarcia: 0,
    razioni: 6,
    abilita: [],
    tratti: [],
    equipaggiamento: [],
    armamento: [],
    tesoro: [],
    maxIncantesimi: 0,
    incantesimi: [],
    note: '',
    indizi: [{cerchi: [false, false, false], testo: ''}],
    status: ''
  };
}

export function initCharacters(session, onChangeCallback) {
  onStateChange = onChangeCallback;
  
  if (!session.characters || !Array.isArray(session.characters)) {
    characters = Array.from({ length: 4 }, getDefaultCharacter);
  } else {
    characters = deepClone(session.characters);
    while (characters.length < 4) {
      characters.push(getDefaultCharacter());
    }
  }

  const grid = document.getElementById('characters-grid');
  const template = document.getElementById('character-card-template');
  
  if (!grid || !template) return;
  
  grid.innerHTML = '';
  
  characters.forEach((char, index) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.character-card');
    card.dataset.charIndex = index;
    
    bindCharacterCard(card, char, index);
    
    grid.appendChild(clone);
  });
}

function bindCharacterCard(card, char, index) {
  // Populate class select
  const classSelect = card.querySelector('.char-classe');
  if (classSelect && classSelect.options.length === 0) {
    const emptyOpt = document.createElement('option');
    emptyOpt.value = "";
    emptyOpt.textContent = "— Seleziona —";
    classSelect.appendChild(emptyOpt);
    
    Object.keys(CLASSES_DB).sort().forEach(className => {
      const opt = document.createElement('option');
      opt.value = className;
      opt.textContent = className;
      classSelect.appendChild(opt);
    });
  }

  // Simple field bindings
  bindInput(card, '.char-nome', char, 'nome', 'text');
  bindInput(card, '.char-classe', char, 'classe', 'select');
  bindInput(card, '.char-livello', char, 'livello', 'number');
  bindInput(card, '.char-vita-attuale', char, 'vitaAttuale', 'number');
  bindInput(card, '.char-vita-max', char, 'vitaMax', 'number');
  bindInput(card, '.char-oro', char, 'oro', 'number');
  bindInput(card, '.char-attacco', char, 'attacco', 'select');
  bindInput(card, '.char-difesa', char, 'difesa', 'select');
  bindInput(card, '.char-ordine-marcia', char, 'ordineMarcia', 'select');
  bindInput(card, '.char-lanterna', char, 'lanterna', 'checkbox');
  bindInput(card, '.char-fasciato', char, 'fasciato', 'checkbox');
  bindInput(card, '.char-status', char, 'status', 'text');
  bindInput(card, '.char-note', char, 'note', 'text');

  // Razioni
  setupRazioni(card, char, index);

  // Lists
  setupSimpleList(card, char, index, 'abilita', '.char-abilita', '[data-action="add-abilita"]');
  setupSimpleList(card, char, index, 'tratti', '.char-tratti', '[data-action="add-tratti"]');
  setupSimpleList(card, char, index, 'equipaggiamento', '.char-equipaggiamento', '[data-action="add-equipaggiamento"]');
  setupSimpleList(card, char, index, 'tesoro', '.char-tesoro', '[data-action="add-tesoro"]');
  
  setupArmamento(card, char, index);
  setupIncantesimi(card, char, index);
  setupIndizi(card, char, index);

  // Combat buttons
  const btnMelee = card.querySelector('[data-action="roll-melee"]');
  if (btnMelee) btnMelee.addEventListener('click', () => rollMelee(char));
  
  const btnRanged = card.querySelector('[data-action="roll-ranged"]');
  if (btnRanged) btnRanged.addEventListener('click', () => rollRanged(char));
  
  const btnDefense = card.querySelector('[data-action="roll-defense"]');
  if (btnDefense) btnDefense.addEventListener('click', () => rollDefense(char));

  // Initialize UI state
  updateClassStats(card, char, false);
}

function bindInput(card, selector, char, field, type) {
  const el = card.querySelector(selector);
  if (!el) return;
  
  if (type === 'checkbox') {
    el.checked = !!char[field];
    el.addEventListener('change', (e) => {
      char[field] = e.target.checked;
      onStateChange();
    });
  } else if (type === 'select') {
    el.value = String(char[field] ?? '');
    el.addEventListener('change', (e) => {
      // If the field holds a number, convert
      const raw = e.target.value;
      char[field] = isNaN(raw) ? raw : Number(raw);
      onStateChange();
    });
  } else {
    el.value = char[field] ?? (type === 'number' ? 0 : '');
    el.addEventListener('input', (e) => {
      let val = e.target.value;
      if (type === 'number') val = Number(val);
      char[field] = val;
      
      if (field === 'livello') {
        updateClassStats(card, char);
      }
      onStateChange();
    });
  }

  // Special listener for class change (since it's a select)
  if (field === 'classe') {
    el.addEventListener('change', (e) => {
      updateClassStats(card, char, true);
      onStateChange();
    });
  }
}

function updateClassStats(card, char, isClassChange = false) {
  if (!char.classe || !CLASSES_DB[char.classe]) {
    card.querySelector('.char-innato-att').textContent = "+0";
    card.querySelector('.char-innato-dif').textContent = "+0";
    return;
  }
  
  const cls = CLASSES_DB[char.classe];
  const L = char.livello || 1;
  
  // Update Max HP
  const oldMax = char.vitaMax;
  const newMax = cls.pvFormula(L);
  char.vitaMax = newMax;
  const vitaMaxInput = card.querySelector('.char-vita-max');
  if (vitaMaxInput) vitaMaxInput.value = newMax;
  
  // Clamp current HP if it exceeds new max
  if (char.vitaAttuale > newMax) {
    char.vitaAttuale = newMax;
    const vitaAttualeInput = card.querySelector('.char-vita-attuale');
    if (vitaAttualeInput) vitaAttualeInput.value = newMax;
  }
  
  // Update Innate Bonuses Display
  const attInnato = cls.attBase(L);
  const difInnato = cls.difBase(L);
  card.querySelector('.char-innato-att').textContent = (attInnato >= 0 ? "+" : "") + attInnato;
  card.querySelector('.char-innato-dif').textContent = (difInnato >= 0 ? "+" : "") + difInnato;
  
  // If class just changed, add special traits to abilities if not present
  if (isClassChange && cls.speciale) {
    if (!char.abilita) char.abilita = [];
    if (!char.abilita.includes(cls.speciale)) {
      char.abilita.push(cls.speciale);
      // Re-render abilita list
      const abilitaContainer = card.querySelector('.char-abilita');
      if (abilitaContainer) {
        // Find the index to re-setup or just trigger a re-render.
        // It's easier to just call setupSimpleList again.
        setupSimpleList(card, char, card.dataset.charIndex, 'abilita', '.char-abilita', '[data-action="add-abilita"]');
      }
    }
  }
}

function setupRazioni(card, char, index) {
  const display = card.querySelector('.char-razioni-display');
  const countDisplay = card.querySelector('.char-razioni-count');
  const btnMinus = card.querySelector('[data-action="razioni-minus"]');
  const btnPlus = card.querySelector('[data-action="razioni-plus"]');
  
  if (!display || !countDisplay || !btnMinus || !btnPlus) return;
  
  if (typeof char.razioni !== 'number') char.razioni = 6;
  
  function render() {
    display.textContent = '🍞'.repeat(char.razioni);
    countDisplay.textContent = `(${char.razioni})`;
  }
  
  btnMinus.addEventListener('click', () => {
    if (char.razioni > 0) {
      char.razioni--;
      onStateChange();
      render();
    }
  });
  
  btnPlus.addEventListener('click', () => {
    char.razioni++;
    onStateChange();
    render();
  });
  
  render();
}

function setupSimpleList(card, char, charIndex, field, containerSelector, addBtnSelector) {
  const container = card.querySelector(containerSelector);
  const btnAdd = card.querySelector(addBtnSelector);
  if (!container || !btnAdd) return;

  function render() {
    container.innerHTML = '';
    if (!char[field]) char[field] = [];
    
    char[field].forEach((item, itemIndex) => {
      const div = document.createElement('div');
      div.className = 'list-item';
      
      const inpNome = document.createElement('input');
      inpNome.className = 'field-input';
      inpNome.value = item.nome || '';
      inpNome.placeholder = 'Nome...';
      inpNome.addEventListener('input', (e) => { item.nome = e.target.value; onStateChange(); });
      
      const inpDesc = document.createElement('input');
      inpDesc.className = 'field-input';
      inpDesc.value = item.descrizione || '';
      inpDesc.placeholder = 'Descrizione...';
      inpDesc.addEventListener('input', (e) => { item.descrizione = e.target.value; onStateChange(); });
      
      const btnRemove = document.createElement('button');
      btnRemove.className = 'btn-remove';
      btnRemove.title = 'Rimuovi';
      btnRemove.textContent = '✕';
      btnRemove.addEventListener('click', () => {
        char[field].splice(itemIndex, 1);
        onStateChange();
        render();
      });
      
      div.appendChild(inpNome);
      div.appendChild(inpDesc);
      div.appendChild(btnRemove);
      container.appendChild(div);
    });
  }
  
  btnAdd.addEventListener('click', () => {
    if (!char[field]) char[field] = [];
    char[field].push({nome: '', descrizione: ''});
    onStateChange();
    render();
  });
  
  render();
}

function setupArmamento(card, char, charIndex) {
  const container = card.querySelector('.char-armamento');
  const btnAdd = card.querySelector('[data-action="add-armamento"]');
  if (!container || !btnAdd) return;

  function render() {
    container.innerHTML = '';
    if (!char.armamento) char.armamento = [];
    
    char.armamento.forEach((item, itemIndex) => {
      const div = document.createElement('div');
      div.className = 'armamento-item';
      
      const inpNome = document.createElement('input');
      inpNome.className = 'field-input arm-nome';
      inpNome.value = item.nome || '';
      inpNome.placeholder = 'Nome...';
      inpNome.addEventListener('input', (e) => { item.nome = e.target.value; onStateChange(); });
      
      const selTipo = document.createElement('select');
      selTipo.className = 'field-select arm-tipo';
      const options = [
        {val: 'M', text: '⚔️ Mischia'},
        {val: 'D', text: '🏹 Distanza'},
        {val: 'A', text: '🛡️ Armatura'},
        {val: 'S', text: '🛡️ Scudo'}
      ];
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.val;
        option.textContent = opt.text;
        if (item.tipo === opt.val) option.selected = true;
        selTipo.appendChild(option);
      });
      selTipo.addEventListener('change', (e) => { item.tipo = e.target.value; onStateChange(); });
      
      const lblCheckbox = document.createElement('label');
      lblCheckbox.className = 'checkbox-label';
      const inpEquip = document.createElement('input');
      inpEquip.type = 'checkbox';
      inpEquip.className = 'arm-equipaggiato';
      inpEquip.checked = !!item.equipaggiato;
      inpEquip.addEventListener('change', (e) => { item.equipaggiato = e.target.checked; onStateChange(); });
      lblCheckbox.appendChild(inpEquip);
      lblCheckbox.appendChild(document.createTextNode(' Equip.'));
      
      const lblBonus = document.createElement('label');
      lblBonus.className = 'field-label';
      lblBonus.textContent = 'Bonus';
      
      const inpBonus = document.createElement('input');
      inpBonus.type = 'number';
      inpBonus.className = 'field-input field-sm arm-bonus';
      inpBonus.value = item.bonus || 0;
      inpBonus.addEventListener('change', (e) => { item.bonus = Number(e.target.value); onStateChange(); });
      
      const selDado = document.createElement('select');
      selDado.className = 'field-select arm-dado';
      const dadoOpts = [
        {val: '', text: '—'},
        {val: 'd4', text: 'D4'},
        {val: 'd6', text: 'D6'},
        {val: 'd8', text: 'D8'},
        {val: 'd10', text: 'D10'},
        {val: 'd12', text: 'D12'}
      ];
      dadoOpts.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.val;
        option.textContent = opt.text;
        if (item.dado === opt.val) option.selected = true;
        selDado.appendChild(option);
      });
      selDado.addEventListener('change', (e) => { item.dado = e.target.value; onStateChange(); });
      
      const btnRemove = document.createElement('button');
      btnRemove.className = 'btn-remove';
      btnRemove.title = 'Rimuovi';
      btnRemove.textContent = '✕';
      btnRemove.addEventListener('click', () => {
        char.armamento.splice(itemIndex, 1);
        onStateChange();
        render();
      });
      
      div.appendChild(inpNome);
      div.appendChild(selTipo);
      div.appendChild(lblCheckbox);
      div.appendChild(lblBonus);
      div.appendChild(inpBonus);
      div.appendChild(selDado);
      div.appendChild(btnRemove);
      
      container.appendChild(div);
    });
  }
  
  btnAdd.addEventListener('click', () => {
    if (!char.armamento) char.armamento = [];
    char.armamento.push({nome: '', tipo: 'M', equipaggiato: false, bonus: 0, dado: ''});
    onStateChange();
    render();
  });
  
  render();
}

function checkSpellWarning(card, char) {
  const max = Number(char.maxIncantesimi) || 0;
  let usedCount = 0;
  if (char.incantesimi) {
    char.incantesimi.forEach(spell => {
      if (spell.usi) {
        usedCount += spell.usi.filter(u => u).length;
      }
    });
  }
  
  const warning = card.querySelector('.char-spells-warning');
  if (warning) {
    if (usedCount > max && max > 0) {
      warning.hidden = false;
    } else {
      warning.hidden = true;
    }
  }
}

function setupIncantesimi(card, char, index) {
  const container = card.querySelector('.char-incantesimi');
  const btnAdd = card.querySelector('[data-action="add-incantesimo"]');
  const maxInput = card.querySelector('.char-max-incantesimi');
  
  if (maxInput) {
    maxInput.value = char.maxIncantesimi || 0;
    maxInput.addEventListener('change', (e) => {
      char.maxIncantesimi = Number(e.target.value);
      onStateChange();
      checkSpellWarning(card, char);
    });
  }
  
  if (!container || !btnAdd) return;

  function render() {
    container.innerHTML = '';
    if (!char.incantesimi) char.incantesimi = [];
    
    char.incantesimi.forEach((spell, itemIndex) => {
      const div = document.createElement('div');
      div.className = 'spell-row';
      
      const inpNome = document.createElement('input');
      inpNome.className = 'field-input';
      inpNome.value = spell.nome || '';
      inpNome.placeholder = 'Nome incantesimo...';
      inpNome.addEventListener('input', (e) => { spell.nome = e.target.value; onStateChange(); });
      div.appendChild(inpNome);
      
      if (!spell.usi) spell.usi = [false, false, false];
      
      spell.usi.forEach((used, i) => {
        const span = document.createElement('span');
        span.className = 'spell-circle' + (used ? ' used' : '');
        span.dataset.use = i.toString();
        span.addEventListener('click', () => {
          spell.usi[i] = !spell.usi[i];
          span.className = 'spell-circle' + (spell.usi[i] ? ' used' : '');
          onStateChange();
          checkSpellWarning(card, char);
        });
        div.appendChild(span);
      });
      
      const btnRemove = document.createElement('button');
      btnRemove.className = 'btn-remove';
      btnRemove.title = 'Rimuovi';
      btnRemove.textContent = '✕';
      btnRemove.addEventListener('click', () => {
        char.incantesimi.splice(itemIndex, 1);
        onStateChange();
        render();
        checkSpellWarning(card, char);
      });
      div.appendChild(btnRemove);
      
      container.appendChild(div);
    });
    checkSpellWarning(card, char);
  }
  
  btnAdd.addEventListener('click', () => {
    if (!char.incantesimi) char.incantesimi = [];
    char.incantesimi.push({nome: '', usi: [false, false, false]});
    onStateChange();
    render();
  });
  
  render();
}

function setupIndizi(card, char, index) {
  const container = card.querySelector('.char-indizi');
  if (!container) return;
  
  if (!char.indizi || char.indizi.length === 0) {
    char.indizi = [{cerchi: [false,false,false], testo: ''}];
  }
  
  const data = char.indizi[0];
  container.innerHTML = '';
  
  const div = document.createElement('div');
  div.className = 'clue-row';
  
  data.cerchi.forEach((val, i) => {
    const span = document.createElement('span');
    span.className = 'clue-circle' + (val ? ' active' : '');
    span.dataset.clue = `0-${i}`;
    span.addEventListener('click', () => {
      data.cerchi[i] = !data.cerchi[i];
      span.className = 'clue-circle' + (data.cerchi[i] ? ' active' : '');
      onStateChange();
    });
    div.appendChild(span);
  });
  
  const inpTesto = document.createElement('input');
  inpTesto.type = 'text';
  inpTesto.className = 'field-input clue-text';
  inpTesto.value = data.testo || '';
  inpTesto.placeholder = 'Indizio...';
  inpTesto.addEventListener('change', (e) => {
    data.testo = e.target.value;
    onStateChange();
  });
  
  div.appendChild(inpTesto);
  container.appendChild(div);
}

function rollDie(dieType) {
  if (!dieType || typeof dieType !== 'string' || !dieType.startsWith('d')) return 0;
  const sides = parseInt(dieType.substring(1), 10);
  if (isNaN(sides) || sides <= 0) return 0;
  return Math.floor(Math.random() * sides) + 1;
}

function rollMelee(char) {
  const equipped = (char.armamento || []).filter(a => a.equipaggiato && a.tipo === 'M');
  if (equipped.length === 0) {
    if (window.showToast) {
      window.showToast("Nessuna arma da mischia equipaggiata!");
    } else {
      alert("Nessuna arma da mischia equipaggiata!");
    }
    return;
  }
  
  const attInnato = (char.classe && CLASSES_DB[char.classe]) ? CLASSES_DB[char.classe].attBase(char.livello || 1) : 0;
  
  const results = equipped.map(arma => {
    const dado = arma.dado || char.attacco || 'd6';
    const roll = rollDie(dado);
    const bonus = Number(arma.bonus) || 0;
    const totalBonus = bonus + attInnato;
    return {
      arma: arma.nome || 'Arma',
      dado: dado,
      roll: roll,
      bonus: totalBonus,
      totale: roll + totalBonus
    };
  });
  
  if (window.showCombatResults) {
    window.showCombatResults(`Attacco in Mischia: ${char.nome || 'Eroe'}`, results);
  }
}

function rollRanged(char) {
  const equipped = (char.armamento || []).filter(a => a.equipaggiato && a.tipo === 'D');
  if (equipped.length === 0) {
    if (window.showToast) {
      window.showToast("Nessuna arma a distanza equipaggiata!");
    } else {
      alert("Nessuna arma a distanza equipaggiata!");
    }
    return;
  }
  
  const attInnato = (char.classe && CLASSES_DB[char.classe]) ? CLASSES_DB[char.classe].attBase(char.livello || 1) : 0;
  
  const results = equipped.map(arma => {
    const dado = arma.dado || char.attacco || 'd6';
    const roll = rollDie(dado);
    const bonus = Number(arma.bonus) || 0;
    const totalBonus = bonus + attInnato;
    return {
      arma: arma.nome || 'Arma',
      dado: dado,
      roll: roll,
      bonus: totalBonus,
      totale: roll + totalBonus
    };
  });
  
  if (window.showCombatResults) {
    window.showCombatResults(`Attacco a Distanza: ${char.nome || 'Eroe'}`, results);
  }
}

function rollDefense(char) {
  const dado = char.difesa || 'd6';
  const roll = rollDie(dado);
  
  const difInnato = (char.classe && CLASSES_DB[char.classe]) ? CLASSES_DB[char.classe].difBase(char.livello || 1) : 0;
  
  const equipped = (char.armamento || []).filter(a => a.equipaggiato && (a.tipo === 'A' || a.tipo === 'S'));
  const bonusSum = equipped.reduce((sum, arma) => sum + (Number(arma.bonus) || 0), 0);
  const totalBonus = bonusSum + difInnato;
  
  const results = [{
    arma: 'Difesa (Armatura/Scudo)',
    dado: dado,
    roll: roll,
    bonus: totalBonus,
    totale: roll + totalBonus
  }];
  
  if (window.showCombatResults) {
    window.showCombatResults(`Difesa: ${char.nome || 'Eroe'}`, results);
  }
}
