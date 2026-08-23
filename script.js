let activeDay = dayOfTheYear();
let bibleData = null;
let readDays = JSON.parse(localStorage.getItem('readDays') || '[]');

document.addEventListener('DOMContentLoaded', async () => {
  // 1. (Removed date initialization, handled dynamically in updateCardContent)

  // 2. Load JSON data once
  bibleData = await fetchData('./bibleinayear.json');

  // 3. Initialize translation logic
  const translationSelect = document.getElementById('translationSelect');
  const savedTranslation = localStorage.getItem('bibleTranslation') || 'NKJV';
  translationSelect.value = savedTranslation;

  translationSelect.addEventListener('change', () => {
    localStorage.setItem('bibleTranslation', translationSelect.value);
    updateCardContent(activeDay);
  });

  // 4. Initialize navigation buttons
  document.getElementById('prevDayBtn').addEventListener('click', () => {
    if (activeDay > 1) {
      activeDay--;
      updateCardContent(activeDay);
    }
  });

  document.getElementById('jumpToTodayBtn').addEventListener('click', () => {
    activeDay = dayOfTheYear();
    updateCardContent(activeDay);
  });


  document.getElementById('nextDayBtn').addEventListener('click', () => {
    const DAYS_IN_YEAR = numberOfDays(new Date().getFullYear());
    if (activeDay < DAYS_IN_YEAR) {
      activeDay++;
      updateCardContent(activeDay);
    }
  });

  // Modal logic
  const modal = document.getElementById('progressModal');
  document.getElementById('viewProgressBtn').onclick = () => {
    renderProgressGrid();
    modal.style.display = 'flex';
  };
  document.getElementById('closeModalBtn').onclick = () => {
    modal.style.display = 'none';
  };
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };

  // 5. Initial load
  updateCardContent(activeDay);
});

// Checkbox logic
const isReadCheck = document.getElementById('isReadCheck');
isReadCheck.addEventListener('change', (e) => {
  if (e.target.checked) {
    if (!readDays.includes(activeDay)) {
      readDays.push(activeDay);
      localStorage.setItem('readDays', JSON.stringify(readDays));
    }
    // trigger confetti
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.8 },
    });
  } else {
    readDays = readDays.filter((d) => d !== activeDay);
    localStorage.setItem('readDays', JSON.stringify(readDays));
  }
});

function updateCardContent(day) {
  const TODAY = new Date();
  const currentYear = TODAY.getFullYear();
  const DAYS_IN_YEAR = numberOfDays(currentYear);

  // Calculate Date for the active day
  const targetDate = new Date(currentYear, 0, day);
  const actualCurrentDay = dayOfTheYear();
  const isToday = day === actualCurrentDay;

  const pillEl = document.getElementById('relativeDayPill');
  const jumpBtn = document.getElementById('jumpToTodayBtn');
  
  if (day === actualCurrentDay) {
    pillEl.innerText = 'Today';
    pillEl.style.display = 'inline-block';
    jumpBtn.style.display = 'none';
  } else if (day === actualCurrentDay - 1) {
    pillEl.innerText = 'Yesterday';
    pillEl.style.display = 'inline-block';
    jumpBtn.style.display = 'block';
  } else if (day === actualCurrentDay + 1) {
    pillEl.innerText = 'Tomorrow';
    pillEl.style.display = 'inline-block';
    jumpBtn.style.display = 'block';
  } else {
    pillEl.style.display = 'none';
    jumpBtn.style.display = 'block';
  }

  const todaysDateEl = document.getElementById('todaysDate');
  todaysDateEl.innerHTML = `<i class="bi bi-calendar-event-fill"></i> <time datetime="${targetDate.toISOString()}">${targetDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}</time>`;

  const dayEl = document.getElementById('day');
  dayEl.innerHTML = `DAY <span>${day}</span> <small>OF</small> ${DAYS_IN_YEAR}`;

  const chaptersEl = document.getElementById('chapters');
  chaptersEl.innerHTML = ''; // clear existing

  const dayData = bibleData.openheavens.find((d) => d.day === day);
  const todaysChapters = dayData ? dayData.chapters : bibleData.openheavens[bibleData.openheavens.length - 1].chapters;

  todaysChapters.forEach((c) => {
    const li = document.createElement('li');
    li.innerText = c;
    chaptersEl.appendChild(li);
  });

  const goToBibleEl = document.getElementById('goToBible');
  const chaptersStr = todaysChapters.join();
  const translationSelect = document.getElementById('translationSelect');
  const version = translationSelect.value;
  goToBibleEl.setAttribute('href', `https://www.biblegateway.com/passage/?search=${chaptersStr}&version=${version}`);

  // Disable buttons at boundaries
  document.getElementById('prevDayBtn').disabled = day <= 1;
  document.getElementById('nextDayBtn').disabled = day >= DAYS_IN_YEAR;

  // Sync checkbox state
  document.getElementById('isReadCheck').checked = readDays.includes(day);

  document.title = `Day ${day} of ${DAYS_IN_YEAR} | Bible in a Year`;
}

/**
 * Fetches data from the specified file path.
 * @param {string} filepath The file path.
 * @returns The data.
 */
async function fetchData(filepath) {
  const res = await fetch(filepath);
  const data = await res.json();
  return data;
}

/**
 * Gets the number of days in a specified year.
 * @param {number} year The year.
 * @returns The number of days in the year.
 */
function numberOfDays(year) {
  return new Date(year, 1, 29).getDate() === 29 ? 366 : 365;
}

/**
 * Returns the current day of the year.
 */
function dayOfTheYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
dayOfTheYear();

function renderProgressGrid() {
  const gridContainer = document.getElementById('progressGrid');
  gridContainer.innerHTML = '';
  
  const TODAY = new Date();
  const currentYear = TODAY.getFullYear();
  const DAYS_IN_YEAR = numberOfDays(currentYear);
  const actualCurrentDay = dayOfTheYear();
  
  for (let i = 1; i <= DAYS_IN_YEAR; i++) {
    const box = document.createElement('div');
    box.classList.add('grid-box');
    box.title = `Day ${i}`;
    
    if (readDays.includes(i)) {
      box.classList.add('read');
    } else if (i <= actualCurrentDay) {
      box.classList.add('missed');
    } else {
      box.classList.add('future');
    }
    
    if (i <= actualCurrentDay || readDays.includes(i)) {
      box.onclick = () => {
        activeDay = i;
        updateCardContent(activeDay);
        document.getElementById('progressModal').style.display = 'none';
      };
    }
    
    gridContainer.appendChild(box);
  }
}
