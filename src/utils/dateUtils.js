// Temporal helpers. Dates are handled as LOCAL "date keys" (YYYY-MM-DD) and
// post start times as local strings (YYYY-MM-DDTHH:mm). This avoids timezone
// bugs and makes grouping posts by day / hour a cheap string operation.

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const pad = (n) => String(n).padStart(2, "0");

export const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toDateKey(new Date());

export const addDays = (key, n) => {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

/** Adds months and clamps the day (Jan 31 + 1 month -> Feb 28/29). */
export const addMonths = (key, n) => {
  const d = fromDateKey(key);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, daysInMonth));
  return toDateKey(d);
};

/** Week starts on Sunday. */
export const startOfWeek = (key) => {
  const d = fromDateKey(key);
  d.setDate(d.getDate() - d.getDay());
  return toDateKey(d);
};

export const getWeekDays = (key) => {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/** 6 rows x 7 columns = 42 date keys covering the month of `key`. */
export const getMonthGrid = (key) => {
  const d = fromDateKey(key);
  const first = toDateKey(new Date(d.getFullYear(), d.getMonth(), 1));
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
};

export const isSameMonth = (a, b) => a.slice(0, 7) === b.slice(0, 7);

export const formatHour = (h) => `${pad(h)}:00`;

export const makeStart = (dateKey, hour, minute = 0) => `${dateKey}T${pad(hour)}:${pad(minute)}`;

export const splitStart = (start) => ({
  dateKey: start.slice(0, 10),
  hour: Number(start.slice(11, 13)),
  minute: Number(start.slice(14, 16)),
  time: start.slice(11, 16),
});

/** Key identifying one hourly slot: "2026-11-18T11" */
export const slotKey = (dateKey, hour) => `${dateKey}T${pad(hour)}`;

export function formatTitle(view, key) {
  const d = fromDateKey(key);
  if (view === "month") return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  if (view === "day")
    return `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  const days = getWeekDays(key);
  const s = fromDateKey(days[0]);
  const e = fromDateKey(days[6]);
  if (s.getFullYear() !== e.getFullYear())
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  if (s.getMonth() !== e.getMonth())
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`;
}
