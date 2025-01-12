document.addEventListener('DOMContentLoaded', async () => await displayContent());

// Confetti
const isReadCheck = document.getElementById('isReadCheck');
isReadCheck.addEventListener('change', (e) => {
  if (e.target.checked) {
    // trigger confetti
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.8 },
    });
  }
});

async function displayContent() {
  const TODAY = new Date();
  const DAYS_IN_YEAR = numberOfDays(TODAY.getFullYear);
  const CURRENT_DAY = dayOfTheYear();

  // Show today's date
  const timeEl = document.createElement('time');
  timeEl.setAttribute('datetime', TODAY.toISOString());
  timeEl.innerText = TODAY.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  document.getElementById('todaysDate').appendChild(timeEl);

  // Content for result card
  const dayEl = document.getElementById('day');
  dayEl.innerHTML = `DAY <span>${CURRENT_DAY}</span> <small>OF</small> ${DAYS_IN_YEAR}`;

  const chaptersEl = document.getElementById('chapters');
  let todaysChapters = [];
  await getChapters(CURRENT_DAY).then((r) => (todaysChapters = r));
  todaysChapters.forEach((c) => {
    const li = document.createElement('li');
    li.innerText = c;
    chaptersEl.appendChild(li);
  });

  const goToBibleEl = document.getElementById('goToBible');
  const chaptersStr = todaysChapters.join();
  goToBibleEl.setAttribute('href', `https://www.biblegateway.com/passage/?search=${chaptersStr}&version=NKJV`);

  // Display info in card
  const resultEl = document.getElementById('result');
  resultEl.appendChild(dayEl);
  resultEl.appendChild(chaptersEl);
  resultEl.appendChild(goToBibleEl);

  // Update document title
  document.title = `Day ${CURRENT_DAY} of ${DAYS_IN_YEAR} | Bible in a Year`;
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
 * Gets the bible chapters for the specified day.
 * @param {number} day
 * @returns {[string]} The bible chapters.
 */
async function getChapters(day) {
  let bibleInAYear = [];
  let todaysChapters = [];

  await fetchData('./bibleinayear.json')
    .then((b) => (bibleInAYear = b.openheavens))
    .catch((e) => console.error(e));

  todaysChapters = bibleInAYear.filter((d) => d.day === day)[0].chapters;

  console.log('todaysChapters:\n', todaysChapters);
  console.log('Days added:', bibleInAYear.length);

  return todaysChapters;
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
