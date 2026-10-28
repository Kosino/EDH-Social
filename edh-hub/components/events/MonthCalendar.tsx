import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventKindIcon from "@/components/events/EventKindIcon";
import {
  calendarCells,
  eventsPath,
  formatDayLabel,
  formatMonthLabel,
  shiftMonth,
  type CalendarMonth,
} from "@/lib/calendar";
import { eventTypeStyle } from "@/lib/brand";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"] as const;
const MAX_VISIBLE = 3;

export type DayMarker = {
  title: string;
  eventType: string;
  location?: string | null;
};

function eventCountLabel(count: number) {
  if (count === 1) return "1 event";
  if (count > 1 && count < 5) return `${count} eventy`;
  return `${count} eventů`;
}

export default function MonthCalendar({
  month,
  selectedDay,
  todayKey,
  markers,
}: {
  month: CalendarMonth;
  selectedDay: string | null;
  todayKey: string;
  markers: Record<string, DayMarker[]>;
}) {
  const title = formatMonthLabel(month);
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const cells = calendarCells(month);

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-card p-3 sm:p-6" data-testid="event-calendar">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={eventsPath({ month: previous.key })}
          aria-label="Předchozí měsíc"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 hover:bg-white/10"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="text-center">
          <p className="font-display text-lg font-semibold">{title}</p>
          {month.key === todayKey.slice(0, 7) ? (
            <p className="text-xs text-foreground/50">Dnes {formatDayLabel(todayKey)}</p>
          ) : (
            <Link href={eventsPath({ month: todayKey.slice(0, 7) })} className="text-xs text-primary hover:underline">
              Dnes
            </Link>
          )}
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
          const dayMarkers = markers[cell.key] ?? [];
          const count = dayMarkers.length;
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
                "flex min-h-[5.5rem] flex-col rounded-lg p-1 text-left transition sm:min-h-[7.25rem] sm:p-1.5",
                selected ? "bg-primary/25 ring-2 ring-inset ring-primary" : "bg-white/5 hover:bg-white/10",
                today && !selected && "ring-2 ring-inset ring-accent"
              )}
            >
              <span
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  today && "bg-primary font-semibold text-white"
                )}
              >
                {cell.day}
              </span>
              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {dayMarkers.slice(0, MAX_VISIBLE).map((marker, markerIndex) => {
                  const style = eventTypeStyle(marker.eventType);
                  const detail = marker.location?.trim() || style.label;
                  return (
                    <span
                      key={`${cell.key}-${markerIndex}`}
                      className={cn(
                        "flex min-w-0 items-start gap-1 rounded-md px-1 py-0.5",
                        style.pill
                      )}
                    >
                      <EventKindIcon
                        eventType={marker.eventType}
                        className="mt-px h-3.5 w-3.5 rounded-[3px] sm:h-4 sm:w-4"
                        alt=""
                      />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[9px] font-semibold sm:text-[10px]">
                          {marker.title}
                        </span>
                        <span className="hidden truncate text-[8px] opacity-80 sm:block sm:text-[9px]">
                          {detail}
                        </span>
                      </span>
                    </span>
                  );
                })}
                {count > MAX_VISIBLE ? (
                  <span className="px-1 text-[9px] text-foreground/50">+{count - MAX_VISIBLE}</span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
