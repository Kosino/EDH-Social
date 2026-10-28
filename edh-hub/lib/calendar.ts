import { pragueDateKey, pragueLocalToUtc } from "@/lib/utils";

export type CalendarMonth = { year: number; month: number; key: string };

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

function monthFromParts(year: number, month: number): CalendarMonth {
  return { year, month, key: `${year}-${String(month).padStart(2, "0")}` };
}

export function currentPragueMonth(now = new Date()): CalendarMonth {
  const key = pragueDateKey(now);
  const match = MONTH.exec(key.slice(0, 7));
  if (!match) return monthFromParts(2026, 10);
  return monthFromParts(Number(match[1]), Number(match[2]));
}

export function shiftMonth(month: CalendarMonth, delta: number): CalendarMonth {
  const index = month.year * 12 + (month.month - 1) + delta;
  const year = Math.floor(index / 12);
  return monthFromParts(year, index - year * 12 + 1);
}

export function daysInMonth(month: CalendarMonth) {
  return new Date(Date.UTC(month.year, month.month, 0)).getUTCDate();
}

function weekdaySunday0(year: number, month: number, day: number) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const instant = pragueLocalToUtc(`${year}-${pad(month)}-${pad(day)}T12:00`);
  if (!instant) return 0;
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Prague",
    weekday: "short",
  }).format(instant);
  const index = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[name];
  return index ?? 0;
}

export type DayCell = { day: number; key: string };

export function calendarCells(month: CalendarMonth): Array<DayCell | null> {
  const count = daysInMonth(month);
  const cells: Array<DayCell | null> = Array.from({ length: weekdaySunday0(month.year, month.month, 1) }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push({ day, key: `${month.key}-${String(day).padStart(2, "0")}` });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function parseSelectedDay(value: string | undefined, month: CalendarMonth): string | null {
  if (!value) return null;
  const match = new RegExp(`^${month.key}-(0[1-9]|[12]\\d|3[01])$`).exec(value);
  if (!match) return null;
  if (Number(match[1]) > daysInMonth(month)) return null;
  return value;
}

export function resolveCalendarQuery(monthValue?: string, dayValue?: string, now = new Date()) {
  const match = MONTH.exec(monthValue ?? "");
  const month = match ? monthFromParts(Number(match[1]), Number(match[2])) : currentPragueMonth(now);
  return { month, day: parseSelectedDay(dayValue, month) };
}

export function pragueMonthRange(month: CalendarMonth): { start: Date; end: Date } | null {
  const start = pragueLocalToUtc(`${month.key}-01T00:00`);
  const end = pragueLocalToUtc(`${shiftMonth(month, 1).key}-01T00:00`);
  if (!start || !end) return null;
  return { start, end };
}

export function eventsPath(input: {
  month?: string;
  day?: string | null;
  error?: string;
  q?: string | null;
}) {
  const params = new URLSearchParams();
  if (input.month && MONTH.test(input.month)) params.set("month", input.month);
  if (input.day && input.month && parseSelectedDay(input.day, resolveCalendarQuery(input.month).month)) {
    params.set("day", input.day);
  }
  if (input.error) params.set("error", input.error.slice(0, 240));
  const q = input.q?.trim();
  if (q) params.set("q", q.slice(0, 80));
  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

export function formatMonthLabel(month: CalendarMonth) {
  const label = new Intl.DateTimeFormat("cs-CZ", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function rsvpRedirectPath(month?: string, day?: string, error?: string) {
  return eventsPath({ month, day, error });
}

export { pragueDateKey };
