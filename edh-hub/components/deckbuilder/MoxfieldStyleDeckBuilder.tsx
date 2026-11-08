'use client';

import { useState, useRef, useEffect } from 'react';

interface Card {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  color_identity?: string[];
  oracle_id?: string;
  image_uris?: { normal?: string; small?: string };
}

const BASIC_LANDS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];

function isBasicLand(card: Card): boolean {
  return BASIC_LANDS.some(land => card.name === land || card.type_line?.includes(`Basic Land — ${land}`));
}

function getCardType(card: Card, isCommander: boolean): string {
  if (isCommander) return 'Commander';
  const t = card.type_line || '';
  if (t.includes('Creature')) return 'Creatures';
  if (t.includes('Instant')) return 'Instants';
  if (t.includes('Sorcery')) return 'Sorceries';
  if (t.includes('Artifact')) return 'Artifacts';
  if (t.includes('Enchantment')) return 'Enchantments';
  if (t.includes('Planeswalker')) return 'Planeswalkers';
  if (t.includes('Land')) return 'Lands';
  return 'Other';
}

function validateDeck(deck: Card[], commander: Card | null): string[] {
  const errors: string[] = [];
  if (!commander) {
    errors.push('Chybí commander (Legendary Creature).');
    return errors;
  }
  if (deck.length !== 100) {
    errors.push(`Deck má ${deck.length} karet, musí mít přesně 100.`);
  }
  const nameCounts = new Map<string, number>();
  for (const card of deck) {
    if (isBasicLand(card)) continue;
    nameCounts.set(card.name, (nameCounts.get(card.name) || 0) + 1);
  }
  for (const [name, count] of nameCounts) {
    if (count > 1) errors.push(`Singleton: ${name} je ${count}×`);
  }
  const cmdIdentity = new Set(commander.color_identity || []);
  for (const card of deck) {
    for (const color of card.color_identity || []) {
      if (!cmdIdentity.has(color)) {
        errors.push(`Color identity: ${card.name} má ${color}`);
        break;
      }
    }
  }
  return errors;
}

export default function MoxfieldStyleDeckBuilder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [commander, setCommander] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; card: Card; index?: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const searchCards = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.cards || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const addToDeck = (card: Card) => {
    if (deck.length >= 100) return;
    const newDeck = [...deck, card];
    setDeck(newDeck);
    setErrors(validateDeck(newDeck, commander));
  };

  const setAsCommander = (card: Card) => {
    if (!card.type_line?.includes('Legendary Creature')) {
      alert('Commander musí být Legendary Creature');
      return;
    }
    setCommander(card);
    let newDeck = deck.filter(c => c.oracle_id !== card.oracle_id);
    newDeck = [card, ...newDeck];
    setDeck(newDeck);
    setErrors(validateDeck(newDeck, card));
  };

  const removeFromDeck = (index: number) => {
    const removed = deck[index];
    const newDeck = deck.filter((_, i) => i !== index);
    setDeck(newDeck);
    const newCommander = commander && removed.oracle_id === commander.oracle_id ? null : commander;
    setCommander(newCommander);
    setErrors(validateDeck(newDeck, newCommander));
  };

  const handleContextMenu = (e: React.MouseEvent, card: Card, index?: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, card, index });
  };

  const grouped = deck.reduce((acc, card, index) => {
    const type = getCardType(card, !!(commander && card.oracle_id === commander.oracle_id));
    if (!acc[type]) acc[type] = [];
    acc[type].push({ card, index });
    return acc;
  }, {} as Record<string, { card: Card; index: number }[]>);

  const typeOrder = ['Commander', 'Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Planeswalkers', 'Lands', 'Other'];

  const curve: Record<number, number> = {};
  deck.forEach(card => {
    if (isBasicLand(card)) return;
    const cmc = (card.mana_cost || '').replace(/[^0-9]/g, '').split('').reduce((s, n) => s + parseInt(n || '0'), 0) || 0;
    curve[cmc] = (curve[cmc] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#0f0f12] text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-[#16161a] px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">MTG Commander Deck Builder</h1>
        <div className="text-sm text-zinc-400">
          {deck.length}/100 • {commander ? commander.name : 'No commander'}
        </div>
      </header>

      {errors.length > 0 && (
        <div className="bg-red-950/80 border-b border-red-900 px-6 py-2 text-sm text-red-200">
          {errors.map((e, i) => <div key={i}>• {e}</div>)}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-zinc-800 bg-[#16161a] flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex gap-2">
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
                className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? '...' : 'Go'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {results.map((card) => (
              <div
                key={card.oracle_id}
                onContextMenu={(e) => handleContextMenu(e, card)}
                onMouseEnter={() => setHoveredCard(card)}
                onMouseLeave={() => setHoveredCard(null)}
                className="flex items-center gap-2 p-2 rounded hover:bg-zinc-800 cursor-pointer text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{card.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{card.type_line}</div>
                </div>
                <span className="text-xs text-zinc-400">{card.mana_cost}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {typeOrder.map(type => {
              const items = grouped[type];
              if (!items || items.length === 0) return null;
              return (
                <section key={type}>
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    {type} ({items.length})
                  </h2>
                  <div className="space-y-0.5">
                    {items.map(({ card, index }) => (
                      <div
                        key={index}
                        onContextMenu={(e) => handleContextMenu(e, card, index)}
                        onMouseEnter={() => setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-zinc-900 text-sm group"
                      >
                        <span className="flex-1 truncate">{card.name}</span>
                        <span className="text-zinc-500 text-xs mx-3">{card.mana_cost}</span>
                        <button
                          onClick={() => removeFromDeck(index)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        <aside className="w-72 border-l border-zinc-800 bg-[#16161a] p-4 flex flex-col gap-6">
          {hoveredCard ? (
            <div>
              <div className="aspect-[5/7] bg-zinc-900 rounded overflow-hidden mb-3 border border-zinc-800">
                {hoveredCard.image_uris?.normal ? (
                  <img src={hoveredCard.image_uris.normal} alt={hoveredCard.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No image</div>
                )}
              </div>
              <div className="text-sm font-medium">{hoveredCard.name}</div>
              <div className="text-xs text-zinc-400 mt-1">{hoveredCard.type_line}</div>
              {hoveredCard.oracle_text && (
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{hoveredCard.oracle_text}</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">Hover a card to preview</div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase mb-3">Mana Curve</h3>
            <div className="flex items-end gap-1 h-24">
              {[0,1,2,3,4,5,6,7].map(cmc => (
                <div key={cmc} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-purple-600 rounded-t"
                    style={{ height: `${Math.min((curve[cmc] || 0) * 12, 80)}px` }}
                  />
                  <div className="text-[10px] text-zinc-500 mt-1">{cmc}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-zinc-900 border border-zinc-700 rounded-md shadow-xl py-1 z-50 text-sm min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.index === undefined ? (
            <>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800"
                onClick={() => { addToDeck(contextMenu.card); setContextMenu(null); }}
              >
                Add to deck
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800"
                onClick={() => { setAsCommander(contextMenu.card); setContextMenu(null); }}
              >
                Set as commander
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800"
                onClick={() => { setAsCommander(contextMenu.card); setContextMenu(null); }}
              >
                Set as commander
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-red-900/50 text-red-300"
                onClick={() => { removeFromDeck(contextMenu.index!); setContextMenu(null); }}
              >
                Remove from deck
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
