export default function EventsPage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kalendář eventů</h1>
          <p className="text-foreground/60 mt-1">Turnaje, casual setkání a online pody</p>
        </div>
        <button className="bg-accent text-black font-medium px-4 py-2 rounded-lg text-sm hover:bg-accent/90">
          + Vytvořit event
        </button>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4 text-foreground/50">
          {["Ne", "Po", "Út", "St", "Čt", "Pá", "So"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-lg flex items-center justify-center text-sm relative">
              {i + 1}
              {(i === 4 || i === 15 || i === 22) && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Nadcházející</h2>
      <div className="space-y-3">
        <EventItem date="16. 5." title="cEDH Tournament" type="Competitive" />
        <EventItem date="18. 5." title="Friday Night EDH" type="Casual" />
        <EventItem date="22. 5." title="Casual Pod" type="Casual" />
      </div>
    </div>
  );
}

function EventItem({ date, title, type }: { date: string; title: string; type: string }) {
  return (
    <div className="bg-card border border-white/10 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-foreground/50">{date}</p>
        <h3 className="font-medium">{title}</h3>
        <span className="text-xs px-2 py-0.5 bg-white/10 rounded mt-1 inline-block">{type}</span>
      </div>
      <button className="text-sm border border-primary text-primary px-4 py-1.5 rounded-lg hover:bg-primary/10">
        Join
      </button>
    </div>
  );
}
