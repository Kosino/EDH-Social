"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { fieldClass } from "@/components/forms/fields";
import {
  fetchCardNameSuggestions,
  type AutocompleteMode,
} from "@/lib/deckbuilder/scryfall-autocomplete";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  mode?: AutocompleteMode;
  className?: string;
  id?: string;
};

const DEBOUNCE_MS = 280;

export default function ScryfallCardInput({
  name,
  defaultValue = "",
  placeholder,
  required,
  maxLength = 200,
  mode = "any",
  className,
  id,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const runSearch = useEffectEvent(async (q: string, signal: AbortSignal) => {
    if (q.trim().length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const names = await fetchCardNameSuggestions(q, mode, signal);
      if (signal.aborted) return;
      startTransition(() => {
        setItems(names);
        setActive(names.length ? 0 : -1);
        setOpen(names.length > 0);
      });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setItems([]);
      setOpen(false);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void runSearch(value, controller.signal);
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value, mode]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function pick(name: string) {
    setValue(name);
    setOpen(false);
    setItems([]);
    setActive(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        name={name}
        value={value}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className={cn(fieldClass, className)}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (items.length) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {loading || pending ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/40">
          …
        </span>
      ) : null}
      {open && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/15 bg-[#12121c] py-1 shadow-lg"
        >
          {items.map((item, i) => (
            <li key={item} role="option" aria-selected={i === active} id={`${listId}-${i}`}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition",
                  i === active ? "bg-primary/25 text-foreground" : "text-foreground/85 hover:bg-white/5"
                )}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(item);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
