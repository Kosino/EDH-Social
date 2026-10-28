export default function ProfilePage({ params }: { params: { username: string } }) {
  const username = params.username === "me" ? "AetherMaster" : params.username;

  return (
    <div className="max-w-5xl">
      <div className="bg-card border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{username}</h1>
            <p className="text-foreground/70 mt-1">EDH Enthusiast • Deck Builder</p>
            <p className="text-sm text-foreground/60 mt-3 max-w-xl">
              Exploring the multiverse one deck at a time. Building thematic high-synergy EDH decks.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Oblíbení commandři</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["Atraxa", "Yuriko", "Kinnan"].map((cmd) => (
            <div key={cmd} className="bg-card border border-white/10 rounded-xl p-4">
              <div className="aspect-[63/88] bg-gradient-to-br from-primary/20 to-accent/10 rounded-lg mb-3" />
              <p className="font-medium">{cmd}</p>
              <p className="text-xs text-foreground/50 mt-1">Placeholder art</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Decky</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeckCard name="Atraxa Superfriends" format="EDH" commander="Atraxa" />
          <DeckCard name="Yuriko Ninjas" format="cEDH" commander="Yuriko" />
          <DeckCard name="Kinnan Combo" format="cEDH" commander="Kinnan" />
        </div>
      </section>
    </div>
  );
}

function DeckCard({ name, format, commander }: { name: string; format: string; commander: string }) {
  return (
    <div className="bg-card border border-white/10 rounded-xl p-4 hover:border-primary/50 transition">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs px-2 py-1 rounded ${format === "cEDH" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>
          {format}
        </span>
      </div>
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-foreground/60 mt-1">{commander}</p>
      <a href="#" className="mt-4 inline-block text-sm text-primary hover:underline">
        View on Moxfield →
      </a>
    </div>
  );
}
