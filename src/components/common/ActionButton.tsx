export function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={() => onClick()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
      {children}
    </button>
  );
}
