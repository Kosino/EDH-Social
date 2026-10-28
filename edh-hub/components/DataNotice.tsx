export default function DataNotice({ message }: { message: string }) {
  return (
    <p className="mb-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
      {message}
    </p>
  );
}
