export default function PixelDivider() {
  return (
    <div className="flex w-full">
      <div className="flex-1 h-[4px] bg-[var(--c-accent)]" />
      <div className="flex-1 h-[4px] bg-[var(--c-bg)]" />
      <div className="flex-1 h-[4px] bg-[var(--c-accent)]" />
      <div className="flex-1 h-[4px] bg-[var(--c-bg)]" />
      <div className="flex-1 h-[4px] bg-[var(--c-accent)]" />
    </div>
  );
}
