"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useState,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  createInitialState,
  hasCommandZone,
  playtestReducer,
} from "@/lib/deckbuilder/playtest-engine";
import type {
  PlaytestCard,
  PlaytestDeckCard,
  PlaytestZone,
} from "@/lib/deckbuilder/playtest-types";
import { cn } from "@/lib/utils";

type Props = {
  deckName: string;
  format: string;
  cards: PlaytestDeckCard[];
};

const DROP_ZONES: PlaytestZone[] = [
  "library",
  "hand",
  "battlefield",
  "graveyard",
  "exile",
  "command",
];

export default function PlaytestSandbox({ deckName, format, cards }: Props) {
  const [state, dispatch] = useReducer(playtestReducer, null, () =>
    createInitialState(cards, format)
  );
  const [hoverPreview, setHoverPreview] = useState<PlaytestCard | null>(null);
  const showCommand = hasCommandZone(format);

  const newGame = useCallback(() => {
    dispatch({ type: "REPLACE", state: createInitialState(cards, format) });
  }, [cards, format]);

  const moveSelected = useCallback(
    (to: PlaytestZone) => {
      if (!state.selectedId) return;
      dispatch({ type: "MOVE", instanceId: state.selectedId, to });
    },
    [state.selectedId]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === "d") {
        e.preventDefault();
        dispatch({ type: "DRAW" });
      } else if (key === "m") {
        e.preventDefault();
        dispatch({ type: "MULLIGAN" });
      } else if (key === "g") {
        e.preventDefault();
        moveSelected("graveyard");
      } else if (key === "e") {
        e.preventDefault();
        moveSelected("exile");
      } else if (key === "b") {
        e.preventDefault();
        moveSelected("battlefield");
      } else if (key === "h") {
        e.preventDefault();
        moveSelected("hand");
      } else if (key === "escape") {
        dispatch({ type: "SELECT", instanceId: null });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveSelected]);

  function onDragStart(e: DragEvent, instanceId: string) {
    e.dataTransfer.setData("text/plain", instanceId);
    e.dataTransfer.effectAllowed = "move";
    dispatch({ type: "SELECT", instanceId });
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDropZone(e: DragEvent, zone: PlaytestZone) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id || !DROP_ZONES.includes(zone)) return;
    if (zone === "command" && !showCommand) return;
    dispatch({ type: "MOVE", instanceId: id, to: zone });
  }

  const rightCards =
    state.rightStack === "graveyard" ? state.zones.graveyard : state.zones.exile;

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-3">
      {/* Top bar: life + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-card/60 px-3 py-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/45">
              Life
            </span>
            <button
              type="button"
              aria-label="Snížit life"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-lg text-foreground/70 transition hover:bg-white/5"
              onClick={() => dispatch({ type: "LIFE", delta: -1 })}
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center font-display text-3xl font-bold tabular-nums text-accent">
              {state.life}
            </span>
            <button
              type="button"
              aria-label="Zvýšit life"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-lg text-foreground/70 transition hover:bg-white/5"
              onClick={() => dispatch({ type: "LIFE", delta: 1 })}
            >
              +
            </button>
          </div>
          <div className="hidden text-sm text-foreground/50 sm:block">
            <span className="font-medium text-foreground/80">{deckName}</span>
            <span className="mx-2 text-foreground/30">·</span>
            {format} playtest
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={() => dispatch({ type: "DRAW" })} hint="D">
            Draw
          </ActionButton>
          <ActionButton onClick={() => dispatch({ type: "MULLIGAN" })} hint="M">
            Mulligan
          </ActionButton>
          <ActionButton onClick={newGame}>New Game</ActionButton>
          <ActionButton onClick={() => dispatch({ type: "DICE" })} hint="d6">
            Dice
          </ActionButton>
          {state.lastDice != null ? (
            <span className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 font-display text-lg font-bold tabular-nums text-accent">
              {state.lastDice}
            </span>
          ) : null}
          <ActionButton
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={!state.past.length}
            hint="⌘Z"
          >
            Undo
          </ActionButton>
        </div>
      </div>

      {state.selectedId ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm">
          <span className="text-foreground/55">Vybraná karta →</span>
          <ActionButton onClick={() => moveSelected("battlefield")} hint="B">
            Battlefield
          </ActionButton>
          <ActionButton onClick={() => moveSelected("hand")} hint="H">
            Hand
          </ActionButton>
          <ActionButton onClick={() => moveSelected("graveyard")} hint="G">
            Graveyard
          </ActionButton>
          <ActionButton onClick={() => moveSelected("exile")} hint="E">
            Exile
          </ActionButton>
        </div>
      ) : null}

      {/* Command zone */}
      {showCommand ? (
        <ZoneRail
          label="Command"
          count={state.zones.command.length}
          onDragOver={onDragOver}
          onDrop={(e) => onDropZone(e, "command")}
          className="min-h-[7.5rem]"
        >
          <div className="flex flex-wrap gap-2">
            {state.zones.command.map((card) => (
              <PlaytestCardView
                key={card.instanceId}
                card={card}
                selected={state.selectedId === card.instanceId}
                size="md"
                onDragStart={(e) => onDragStart(e, card.instanceId)}
                onSelect={() =>
                  dispatch({
                    type: "SELECT",
                    instanceId:
                      state.selectedId === card.instanceId ? null : card.instanceId,
                  })
                }
                onHover={setHoverPreview}
              />
            ))}
            {state.zones.command.length === 0 ? (
              <p className="text-xs text-foreground/40">Přetáhni commandera sem</p>
            ) : null}
          </div>
        </ZoneRail>
      ) : null}

      {/* Middle: library | battlefield | GY/exile */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[7.5rem_minmax(0,1fr)_8.5rem]">
        <ZoneRail
          label="Library"
          count={state.zones.library.length}
          onDragOver={onDragOver}
          onDrop={(e) => onDropZone(e, "library")}
          className="flex flex-col items-center justify-center gap-2 py-6"
        >
          <div className="relative h-28 w-20 rounded-lg border border-white/15 bg-gradient-to-br from-primary/30 to-black/40 shadow-inner">
            <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold tabular-nums">
              {state.zones.library.length}
            </span>
          </div>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => dispatch({ type: "DRAW" })}
          >
            Draw (D)
          </button>
        </ZoneRail>

        <ZoneRail
          label="Battlefield"
          count={state.zones.battlefield.length}
          onDragOver={onDragOver}
          onDrop={(e) => onDropZone(e, "battlefield")}
          className="min-h-[16rem] lg:min-h-0"
        >
          <div className="flex flex-wrap content-start gap-2 p-1">
            {state.zones.battlefield.length === 0 ? (
              <p className="m-auto text-sm text-foreground/40">
                Battlefield — přetáhni karty z ruky (B)
              </p>
            ) : (
              state.zones.battlefield.map((card) => (
                <PlaytestCardView
                  key={card.instanceId}
                  card={card}
                  selected={state.selectedId === card.instanceId}
                  size="md"
                  showTap
                  onDragStart={(e) => onDragStart(e, card.instanceId)}
                  onSelect={() => {
                    if (state.selectedId === card.instanceId) {
                      dispatch({ type: "TOGGLE_TAP", instanceId: card.instanceId });
                    } else {
                      dispatch({ type: "SELECT", instanceId: card.instanceId });
                    }
                  }}
                  onHover={setHoverPreview}
                />
              ))
            )}
          </div>
        </ZoneRail>

        <div className="flex flex-col gap-2">
          <div className="flex gap-1 rounded-xl border border-white/10 bg-card/40 p-1">
            {(["graveyard", "exile"] as const).map((stack) => (
              <button
                key={stack}
                type="button"
                onClick={() => dispatch({ type: "SET_RIGHT_STACK", stack })}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 text-[11px] capitalize transition",
                  state.rightStack === stack
                    ? "bg-primary/25 text-foreground"
                    : "text-foreground/55 hover:bg-white/5"
                )}
              >
                {stack === "graveyard" ? "GY" : "Exile"} ({state.zones[stack].length})
              </button>
            ))}
          </div>
          <ZoneRail
            label={state.rightStack === "graveyard" ? "Graveyard" : "Exile"}
            count={rightCards.length}
            onDragOver={onDragOver}
            onDrop={(e) => onDropZone(e, state.rightStack)}
            className="min-h-[12rem] flex-1"
          >
            <div className="relative mx-auto h-36 w-24">
              {rightCards.length === 0 ? (
                <p className="pt-10 text-center text-[11px] text-foreground/40">Prázdné</p>
              ) : (
                rightCards.slice(-4).map((card, i, arr) => (
                  <div
                    key={card.instanceId}
                    className="absolute left-0 right-0"
                    style={{ top: `${(arr.length - 1 - i) * 10}px`, zIndex: i }}
                  >
                    <PlaytestCardView
                      card={card}
                      selected={state.selectedId === card.instanceId}
                      size="sm"
                      onDragStart={(e) => onDragStart(e, card.instanceId)}
                      onSelect={() =>
                        dispatch({
                          type: "SELECT",
                          instanceId:
                            state.selectedId === card.instanceId
                              ? null
                              : card.instanceId,
                        })
                      }
                      onHover={setHoverPreview}
                    />
                  </div>
                ))
              )}
            </div>
          </ZoneRail>
        </div>
      </div>

      {/* Hand */}
      <ZoneRail
        label={`Hand (${state.zones.hand.length})`}
        count={state.zones.hand.length}
        onDragOver={onDragOver}
        onDrop={(e) => onDropZone(e, "hand")}
        className="shrink-0"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
          {state.zones.hand.map((card) => (
            <PlaytestCardView
              key={card.instanceId}
              card={card}
              selected={state.selectedId === card.instanceId}
              size="lg"
              onDragStart={(e) => onDragStart(e, card.instanceId)}
              onSelect={() =>
                dispatch({
                  type: "SELECT",
                  instanceId:
                    state.selectedId === card.instanceId ? null : card.instanceId,
                })
              }
              onPlay={() =>
                dispatch({
                  type: "MOVE",
                  instanceId: card.instanceId,
                  to: "battlefield",
                })
              }
              onHover={setHoverPreview}
            />
          ))}
          {state.zones.hand.length === 0 ? (
            <p className="py-6 text-sm text-foreground/40">Ruka je prázdná</p>
          ) : null}
        </div>
      </ZoneRail>

      <p className="text-[11px] text-foreground/35">
        Dvojklik v ruce → battlefield · 2. klik na battlefield = tap · Hotkeys: D/M/B/H/G/E · Ctrl/⌘Z undo
      </p>

      {hoverPreview?.imageUrl ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 hidden w-48 overflow-hidden rounded-xl border border-white/15 bg-black/80 shadow-2xl md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hoverPreview.imageUrl}
            alt={hoverPreview.name}
            className="aspect-[5/7] w-full object-cover object-top"
          />
          <p className="truncate px-2 py-1.5 text-xs text-foreground/80">{hoverPreview.name}</p>
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  hint,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm transition",
        disabled
          ? "cursor-not-allowed text-foreground/30"
          : "text-foreground/85 hover:border-primary/40 hover:bg-primary/10"
      )}
    >
      {children}
      {hint ? <span className="ml-1.5 text-[10px] text-foreground/35">{hint}</span> : null}
    </button>
  );
}

function ZoneRail({
  label,
  count,
  children,
  className,
  onDragOver,
  onDrop,
}: {
  label: string;
  count: number;
  children: ReactNode;
  className?: string;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-3",
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-foreground/45">
          {label}
        </h2>
        <span className="text-[10px] tabular-nums text-foreground/30">{count}</span>
      </div>
      {children}
    </section>
  );
}

function PlaytestCardView({
  card,
  selected,
  size,
  showTap,
  onDragStart,
  onSelect,
  onPlay,
  onHover,
}: {
  card: PlaytestCard;
  selected: boolean;
  size: "sm" | "md" | "lg";
  showTap?: boolean;
  onDragStart: (e: DragEvent) => void;
  onSelect: () => void;
  onPlay?: () => void;
  onHover: (card: PlaytestCard | null) => void;
}) {
  const sizeClass =
    size === "lg"
      ? "h-36 w-[6.5rem]"
      : size === "md"
        ? "h-28 w-20"
        : "h-24 w-[4.25rem]";

  function onKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.preventDefault();
        onPlay?.();
      }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => onHover(card)}
      onMouseLeave={() => onHover(null)}
      title={card.name}
      className={cn(
        "relative shrink-0 cursor-grab overflow-hidden rounded-lg border bg-black/40 text-left shadow transition duration-150 active:cursor-grabbing",
        sizeClass,
        selected ? "border-primary ring-2 ring-primary/50" : "border-white/10 hover:border-white/25",
        showTap && card.tapped && "rotate-90"
      )}
    >
      {card.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.imageUrl}
          alt={card.name}
          className="pointer-events-none h-full w-full object-cover object-top"
          draggable={false}
        />
      ) : (
        <span className="flex h-full items-end p-1.5 text-[10px] font-medium leading-tight">
          {card.name}
        </span>
      )}
    </div>
  );
}
