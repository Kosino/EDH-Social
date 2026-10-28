import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  calendarCells,
  eventsPath,
  formatDayLabel,
  formatMonthLabel,
  shiftMonth,
  type CalendarMonth,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"] as const;

function eventCountLabel(count: number) {
  if (count === 1) return "1 event";
  if (count > 1 && count < 5) return `${count} eventy`;
  return `${count} eventů`;
}

export default function MonthCalendar({
  month,
  selectedDay,
  todayKey,
  counts,
}: {
  month: CalendarMonth;
  selectedDay: string | null;
  todayKey: string;
  counts: Record<string, number>;
}) {
  const title = formatMonthLabel(month);
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const cells = calendarCells(month);

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-card p-4 sm:p-6" data-testid="event-calendar">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={eventsPath({ month: previous.key })}
          aria-label="Předchozí měsíc"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 hover:bg-white/10"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="text-center">
          <p className="text-lg font-semibold">{title}</p>
          {month.key === todayKey.slice(0, 7) ? (
            <p className="text-xs text-foreground/50">Dnes {formatDayLabel(todayKey)}</p>
          ) : null}
          {month.key !== todayKey.slice(0, 7) ? (
            <Link href={eventsPath({ month: todayKey.slice(0, 7) })} className="text-xs text-primary hover:underline">
              Dnes
            </Link>
          ) : null}
        </div>
        <Link
          href={eventsPath({ month: next.key })}
          aria-label="Další měsíc"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 hover:bg-white/10"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-foreground/50 sm:gap-2 sm:text-sm">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} aria-hidden />;
          const count = counts[cell.key] ?? 0;
          const selected = cell.key === selectedDay;
          const today = cell.key === todayKey;
          const label = [
            `${cell.day}. ${title}`,
            today ? "dnes" : "",
            selected ? "vybraný den" : "",
            count > 0 ? eventCountLabel(count) : "",
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={cell.key}
              href={eventsPath({ month: month.key, day: cell.key })}
              aria-label={label}
              aria-current={selected ? "date" : undefined}
              data-day={cell.key}
              data-events={count}
              data-today={today ? "true" : undefined}
              data-selected={selected ? "true" : undefined}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-sm",
                selected ? "bg-primary font-semibold text-black" : "bg-white/5 hover:bg-white/10",
                today && "ring-2 ring-inset ring-accent"
              )}
            >
              {cell.day}
              {count > 1 ? (
                <span
                  className={cn(
                    "absolute bottom-1 text-[10px] font-semibold leading-none",
                    selected ? "text-black" : "text-primary"
                  )}
                >
                  {count}
                </span>
              ) : count === 1 ? (
                <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", selected ? "bg-black" : "bg-primary")} />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
