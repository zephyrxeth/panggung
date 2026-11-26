"use client";
// Auto-submitting filter form — select change langsung submit (dengan fallback tombol untuk no-JS).
export default function FilterForm({ children, className = "", action }: {
  children: React.ReactNode; className?: string; action?: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className={className}
      onChange={e => {
        const t = e.target as HTMLElement;
        if (t.tagName === "SELECT") (t.closest("form") as HTMLFormElement).requestSubmit();
      }}
    >
      {children}
      <noscript><button className="btn text-xs py-1.5">Terapkan</button></noscript>
    </form>
  );
}
