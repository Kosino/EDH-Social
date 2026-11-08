'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

export type DeckBrowserCard = {
  id: string;
  name: string;
  quantity: number;
  board: 'main' | 'commander' | 'sideboard';
  manaCost: string | null;
  typeLine: string | null;
  imageUrl: string | null;
  isBasicLand: boolean;
  illegal: boolean;
  reasons?: string[];
  colorIdentity?: string[];
  oracleText?: string;
};

type SortMode = 'name' | 'cmc';
type ViewMode = 'grid' | 'dense' | 'list';

const GROUP_ORDER = [
  'Commander',
  'Creatures',
  'Planeswalkers',
  'Instants',
  'Sorceries',
  'Artifacts',
  'Enchantments',
  'Lands',
  'Other',
  'Sideboard',
] as const;

function classifyType(card: DeckBrowserCard): string {
  if (card.board === 'commander') return 'Commander';
  if (card.board === 'sideboard') return 'Sideboard';
  const t = card.typeLine || '';
  if (t.includes('Creature')) return 'Creatures';
  if (t.includes('Planeswalker')) return 'Planeswalkers';
  if (t.includes('Instant')) return 'Instants';
  if (t.includes('Sorcery')) return 'Sorceries';
  if (t.includes('Artifact')) return 'Artifacts';
  if (t.includes('Enchantment')) return 'Enchantments';
  if (t.includes('Land')) return 'Lands';
  return 'Other';
}

function cmcFromManaCost(manaCost: string | null): number {
  if (!manaCost) return 0;
  const generic = manaCost.match(/\{(\d+)\}/);
  if (generic) return parseInt(generic[1], 10);
  return (manaCost.match(/\{[WUBRGC]\}/g) || []).length;
}

export default function MoxfieldStyleDeckBuilder({
  cards: initialCards = [],
  onAddCard,
  onRemoveCard,
  onSetCommander,
}: {
  cards?: DeckBrowserCard[];
  onAddCard?: (name: string) => void;
  onRemoveCard?: (id: string) => void;
  onSetCommander?: (id: string) => void;
}) {
  const [cards, setCards] = useState<DeckBrowserCard[]>(initialCards);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('name');
  const [view, setView] = useState<ViewMode>('grid');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; card: DeckBrowserCard } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const searchCards = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.cards || data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const groups = useMemo(() => {
    const map = new Map<string, DeckBrowserCard[]>();
    for (const card of cards) {
      const key = classifyType(card);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(card);
    }
    return GROUP_ORDER.map((key) => {
      const list = map.get(key) ?? [];
      const sorted = [...list].sort((a, b) => {
        if (sort === 'cmc') {
          const d = cmcFromManaCost(a.manaCost) - cmcFromManaCost(b.manaCost);
          if (d !== 0) return d;
        }
        return a.name.localeCompare(b.name);
      });
      return { key, cards: sorted, count: sorted.reduce((s, c) => s + c.quantity, 0) };
    }).filter((g) => g.cards.length > 0);
  }, [cards, sort]);

  const preview = cards.find((c) => c.id === previewId) ?? cards.find((c) => c.board === 'commander') ?? cards[0];

  const handleContextMenu = (e: React.MouseEvent, card: DeckBrowserCard) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, card });
  };

  const addFromSearch = (card: any) => {
    const newCard: DeckBrowserCard = {
      id: card.oracle_id || crypto.randomUUID(),
      name: card.name,
      quantity: 1,
      board: 'main',
      manaCost: card.mana_cost || null,
      typeLine: card.type_line || null,
      imageUrl: card.image_uris?.normal || card.imageUrl || null,
      isBasicLand: /Basic Land/.test(card.type_line || ''),
      illegal: false,
      colorIdentity: card.color_identity,
      oracleText: card.oracle_text,
    };
    setCards((prev) => [...prev, newCard]);
    onAddCard?.(card.name);
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    onRemoveCard?.(id);
  };

  const setCommander = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        board: c.id === id ? 'commander' : c.board === 'commander' ? 'main' : c.board,
      }))
    );
    onSetCommander?.(id);
  };

  const gridClass =
    view === 'dense'
      ? 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6'
      : view === 'list'
      ? 'space-y-1'
      : 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5';

  return (
    <div className="min-h-screen bg-[#0f0f12] text-zinc-100">
      {/* Search bar */}
      <div className="border-b border-zinc-800 bg-[#16161a] px-4 py-3">
        <div className="flex gap-2 max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCards()}
            placeholder="Search cards..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={searchCards}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto border border-zinc-800 rounded bg-zinc-900">
            {results.slice(0, 10).map((card) => (
              <div
                key={card.oracle_id}
                onClick={() => addFromSearch(card)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  addFromSearch(card);
                }}
                className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800 cursor-pointer text-sm border-b border-zinc-800 last:border-0"
              >
                <span>{card.name}</span>
                <span className="text-zinc-500 text-xs">{card.mana_cost}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] p-4">
        {/* Preview sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
            <div className="relative mx-auto aspect-[5/7] w-full max-w-[260px] overflow-hidden rounded-xl bg-zinc-800">
              {preview?.imageUrl ? (
                <img src={preview.imageUrl} alt={preview.name} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  {preview ? preview.name : 'Hover a card'}
                </div>
              )}
            </div>
            {preview && (
              <div className="mt-3 space-y-1 px-1">
                <p className="font-semibold text-sm">{preview.name}</p>
                {preview.manaCost && <p className="text-xs text-zinc-400">{preview.manaCost}</p>}
                {preview.typeLine && <p className="text-xs text-zinc-500">{preview.typeLine}</p>}
                {preview.oracleText && <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{preview.oracleText.slice(0, 200)}...</p>}
              </div>
            )}
          </div>
        </aside>

        {/* Main deck */}
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs">
            <span className="text-zinc-500">View</span>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as ViewMode)}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1"
            >
              <option value="grid">Visual Grid</option>
              <option value="dense">Dense Grid</option>
              <option value="list">List</option>
            </select>
            <span className="ml-2 text-zinc-500">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1"
            >
              <option value="name">Name</option>
              <option value="cmc">CMC</option>
            </select>
            <span className="ml-auto text-zinc-400">{cards.reduce((s, c) => s + c.quantity, 0)} cards</span>
          </div>

          {groups.map((group) => (
            <section key={group.key}>
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-semibold text-zinc-300">
                  {group.key} <span className="font-normal text-zinc-500">({group.count})</span>
                </h3>
              </div>
              <ul className={gridClass}>
                {group.cards.map((card) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      className={`group relative w-full rounded-xl text-left transition ${previewId === card.id ? 'ring-2 ring-purple-500' : ''}`}
                      onMouseEnter={() => setPreviewId(card.id)}
                      onClick={() => setPreviewId(card.id)}
                      onContextMenu={(e) => handleContextMenu(e, card)}
                    >
                      {view === 'list' ? (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-zinc-900 text-sm">
                          <span>{card.quantity > 1 ? `${card.quantity}× ` : ''}{card.name}</span>
                          <span className="text-zinc-500 text-xs">{card.manaCost}</span>
                        </div>
                      ) : (
                        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                          <div className="aspect-[5/7] w-full bg-zinc-800">
                            {card.imageUrl ? (
                              <img src={card.imageUrl} alt={card.name} className="h-full w-full object-cover object-top" />
                            ) : (
                              <div className="flex h-full items-end p-2 text-xs">{card.name}</div>
                            )}
                            {card.quantity > 1 && (
                              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold">
                                {card.quantity}×
                              </span>
                            )}
                          </div>
                          <div className="truncate px-2 py-1.5 text-[11px] text-zinc-400">{card.name}</div>
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-zinc-900 border border-zinc-700 rounded-md shadow-xl py-1 z-50 text-sm min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800"
            onClick={() => { setCommander(contextMenu.card.id); setContextMenu(null); }}
          >
            Set as commander
          </button>
          <button
            className="w-full text-left px-3 py-1.5 hover:bg-red-900/50 text-red-300"
            onClick={() => { removeCard(contextMenu.card.id); setContextMenu(null); }}
          >
            Remove from deck
          </button>
        </div>
      )}
    </div>
  );
}
