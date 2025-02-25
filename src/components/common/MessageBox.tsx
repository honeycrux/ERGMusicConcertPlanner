export function MessageBox({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center py-2 px-4 mx-4 my-2 text-sm border border-zinc-400 text-zinc-800 rounded-md">{children}</div>;
}
