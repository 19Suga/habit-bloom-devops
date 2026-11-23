const DAY_MS = 86_400_000;

export function todayKey(timeZone = process.env.APP_TIMEZONE || 'America/La_Paz') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function toDayNumber(value) {
  const [year, month, day] = value.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function shiftDate(value, amount) {
  const dayNumber = toDayNumber(value) + amount;
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

export function calculateStreaks(completionDates, today = todayKey()) {
  const dates = [...new Set(completionDates)].sort();
  if (!dates.length) return { currentStreak: 0, bestStreak: 0 };

  let bestStreak = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    if (toDayNumber(dates[index]) - toDayNumber(dates[index - 1]) === 1) {
      run += 1;
      bestStreak = Math.max(bestStreak, run);
    } else {
      run = 1;
    }
  }

  const completed = new Set(dates);
  const lastAllowed = completed.has(today) ? today : shiftDate(today, -1);
  let cursor = lastAllowed;
  let currentStreak = 0;
  while (completed.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return { currentStreak, bestStreak };
}
