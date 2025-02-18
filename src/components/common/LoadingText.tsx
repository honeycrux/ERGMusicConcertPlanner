export function LoadingText({ text }: { text?: string }) {
  return <div className="flex justify-center text-xl font-bold p-4">{text ?? "Loading..."}</div>;
}
