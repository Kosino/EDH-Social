import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold">Stránka nenalezena</h1>
      <p className="mt-2 text-foreground/60">Ten profil, příspěvek nebo článek tu není.</p>
      <Link href="/" className="mt-6 inline-block text-primary hover:underline">
        Zpět na feed
      </Link>
    </div>
  );
}
