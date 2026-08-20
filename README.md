# 4AD Companion

4AD Companion è un'applicazione web sviluppata per assistere i giocatori durante le partite di **Four Against Darkness**. Permette di gestire il proprio party di 4 eroi, tenere traccia degli incontri, lanciare i dadi e calcolare automaticamente i punti esperienza.

## ✨ Funzionalità Principali

### 🛡️ Gestione Personaggi (Party)
L'app permette di creare e tenere traccia di un party composto da 4 personaggi. Per ogni personaggio è possibile definire:
- **Statistiche di base:** Nome, Classe, Livello, Oro, Ordine di Marcia.
- **Salute:** Gestione dei Punti Vita attuali e massimi, status, lanterna, e se il personaggio è fasciato.
- **Razioni:** Contatore visuale e numerico delle razioni di cibo (🍞).
- **Tratti, Abilità e Tesoro:** Liste testuali libere.
- **Magia:** Tracciamento degli incantesimi preparati e del numero massimo di incantesimi lanciabili, con sistema di avviso automatico in caso di superamento del limite.
- **Indizi:** Tracciamento fino a 3 indizi raccolti dal personaggio.

### ⚔️ Combattimento e Armamento
- Ogni eroe ha una sezione **Armamento** in cui definire armi (Mischia/Distanza), Armature e Scudi, specificandone il bonus e il dado assegnato.
- **Simulatore di dadi integrato:** Tasti di azione rapida per attaccare in *Mischia* (⚔️), a *Distanza* (🏹), o *Difendersi* (🛡️). L'app lancerà i dadi corretti e sommerà automaticamente i bonus delle armi/armature equipaggiate.
- Selezionatori globali per il dado di base di Attacco e Difesa.

### 🐉 Gestione Incontri
- Tracciamento dei mostri e dei nemici incontrati (Seguaci, Boss, Maggiore, Infestante).
- Sistema a cerchi (20) per tenere conto dei punti vita del mostro.
- Pulsanti di completamento (✓) per **archiviare l'incontro**, tenendo pulita la schermata pur mantenendo lo storico.
- Calcolo **automatico dei Punti Esperienza (PE)** totali: 1 PE per ogni Boss o Maggiore, 1 PE ogni 10 Seguaci, e 0 PE per gli Infestanti.

### 💾 Salvataggio e Sessioni
- **Autosave intelligente:** Ogni modifica viene salvata in locale (nel `localStorage` del tuo browser) istantaneamente. Non perderai mai i tuoi progressi in caso di chiusura accidentale della scheda.
- Gestione **multi-sessione:** Crea nuove sessioni, carica sessioni passate o eliminale dalla tab *Sessioni*.
- **Import/Export:** Puoi scaricare le tue sessioni come file `.json` per fare backup o trasferirle su un altro dispositivo (es: dal PC al cellulare).

## 🚀 Come usare l'applicazione

Trattandosi di un'applicazione basata su tecnologie web standard (HTML, CSS, JavaScript Vanilla), **non c'è bisogno di installare nulla**, né di disporre di un server backend. 

### Opzione 1: Direttamente nel Browser
Scarica o clona la repository, ed apri semplicemente il file `index.html` con il tuo browser web preferito (Chrome, Firefox, Safari, Edge). Tutto funzionerà localmente e offline (eccetto eventuali web fonts).

### Opzione 2: Tramite Server Locale (Consigliato per Sviluppo)
Se preferisci eseguire l'app tramite un server web locale:
1. Apri un terminale nella cartella del progetto.
2. Esegui il comando:
   ```bash
   python3 -m http.server 8080
   ```
3. Vai all'indirizzo `http://localhost:8080` nel tuo browser.

## 🛠️ Architettura Tecnica

- `index.html`: La struttura dell'applicazione, formata da un layout a schede (Tab) e modali (per dadi e conferme).
- `css/style.css`: Foglio di stile personalizzato in *Dark Mode* con effetti di glassmorphism e palette fantasy (oro, rame, accenti dinamici).
- `js/app.js`: Script principale, gestore di tab, autosave e del sistema globale modali.
- `js/storage.js`: Motore di persistenza su `localStorage`, sistema di esportazione/importazione JSON e logica di migrazione e calcolo PE.
- `js/characters.js`: Modulo dedicato al rendering e interazione con le schede personaggio e i loro combattimenti.
- `js/encounters.js`: Modulo dedicato alla gestione degli incontri e tracciamento nemici.
- `js/dice.js`: Motore di roll dei dadi (D4, D6, D8, D10, D12, D20, D100).

## 📜 Licenza
Questo progetto è un companion non ufficiale di *Four Against Darkness* sviluppato per puro scopo di utilità e passione. Tutti i marchi registrati o proprietà intellettuali relative al gioco *Four Against Darkness* appartengono ai rispettivi autori ed editori (Ganesha Games, MS Edizioni, Andrea Sfiligoi).
