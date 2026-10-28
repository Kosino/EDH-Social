/** Original mark — stylized tree, not Wizards IP. */
export default function TreeMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 4c-1.2 3.5-4.5 6.2-7.5 8.2 2.2.2 4.4-.2 6.2-1.2C12.8 14.5 10 18 8.5 22c2.8-.6 5.4-1.2 7.5-2.8 2.1 1.6 4.7 2.2 7.5 2.8-1.5-4-4.3-7.5-6.2-11 1.8 1 4 1.4 6.2 1.2C20.5 10.2 17.2 7.5 16 4Z"
        className="fill-accent"
      />
      <path d="M15 20h2v8h-2z" className="fill-accent/80" />
      <circle cx="16" cy="11" r="1.4" className="fill-background" />
    </svg>
  );
}
