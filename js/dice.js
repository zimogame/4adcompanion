let diceLog = [];
let onRoll = null;

export function initDice(onRollCallback) {
  onRoll = onRollCallback;
  
  // Dadi standard (d4, d6, d8, d10, d12)
  const diceBtns = document.querySelectorAll('.dice-btn[data-die]');
  diceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dieType = btn.getAttribute('data-die');
      rollDie(dieType);
    });
  });
  
  // Dadi speciali (D66, 2D6)
  const specialBtns = document.querySelectorAll('.btn-special[data-die]');
  specialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dieType = btn.getAttribute('data-die');
      rollDie(dieType);
    });
  });
  
  renderLog();
}

export function getDiceLog() {
  return [...diceLog];
}

export function setDiceLog(log) {
  diceLog = log ? [...log] : [];
  renderLog();
}

function rollDie(dieType) {
  const resultElem = document.getElementById('dice-result-number');
  const labelElem = document.getElementById('dice-result-label');
  
  if (!resultElem || !labelElem) return;
  
  resultElem.classList.add('rolling');
  
  setTimeout(() => {
    let result = '';
    let displayLabel = dieType.toUpperCase();
    
    if (dieType === 'd66') {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      result = `${d1}${d2}`;
      displayLabel = `D66: ${d1}-${d2} = ${result}`;
    } else if (dieType === '2d6') {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      result = `${sum}`;
      displayLabel = `2D6: ${d1}+${d2} = ${sum}`;
    } else {
      // standard die
      const sides = parseInt(dieType.substring(1), 10);
      result = `${Math.floor(Math.random() * sides) + 1}`;
    }
    
    resultElem.classList.remove('rolling');
    resultElem.textContent = result;
    labelElem.textContent = displayLabel;
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const rollData = {
      tipo: dieType,
      risultato: result,
      timestamp: timeStr
    };
    
    diceLog.unshift(rollData);
    if (diceLog.length > 30) {
      diceLog.pop();
    }
    
    renderLog();
    
    if (onRoll) {
      onRoll(rollData);
    }
    
  }, 400);
}

function renderLog() {
  const logContainer = document.getElementById('dice-log-entries');
  if (!logContainer) return;
  
  logContainer.innerHTML = '';
  
  diceLog.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'dice-log-entry';
    div.innerHTML = `
      <span class="log-die">${entry.tipo.toUpperCase()}</span>
      <span class="log-result">${entry.risultato}</span>
      <span class="log-time">${entry.timestamp}</span>
    `;
    logContainer.appendChild(div);
  });
}
