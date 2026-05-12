/** Плейсхолдер на один кадр до чтения dev-mоков из localStorage (useLayoutEffect). */
export function DevOrdersHydrateSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 py-1"
      role="status"
      aria-busy
      aria-label="Загрузка списка"
    >
      <div className="h-7 w-40 rounded-md bg-black/[0.08]" />
      <div className="h-4 w-full max-w-[320px] rounded-md bg-black/[0.06]" />
      <div className="mt-4 flex flex-col gap-3">
        <div className="h-[88px] w-full rounded-xl bg-black/[0.06]" />
        <div className="h-[88px] w-full rounded-xl bg-black/[0.06]" />
      </div>
    </div>
  );
}
