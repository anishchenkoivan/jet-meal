export default function RestaurantsLoading() {
  return (
    <div className="flex flex-1 flex-col min-h-0 box-border w-full max-w-none mx-0 p-6">
      <div className="grid flex-1 grid-cols-1 gap-5 items-start w-full wide:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] wide:gap-6">
        {/* Sidebar skeleton */}
        <div className="hidden wide:flex flex-col gap-3 p-4 border border-black/[0.06] rounded-lg bg-white">
          <div className="h-5 w-24 rounded-md bg-black/[0.06]" />
          <div className="h-8 w-full rounded-md bg-black/[0.06]" />
          <div className="h-5 w-28 rounded-md bg-black/[0.06]" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-7 w-20 rounded-lg bg-black/[0.06]" />
            ))}
          </div>
        </div>

        {/* Restaurant cards skeleton */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border border-black/[0.06] bg-white"
            >
              <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-black/[0.06]" />
              <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
                <div className="h-5 w-2/3 rounded-md bg-black/[0.06]" />
                <div className="h-4 w-full rounded-md bg-black/[0.06]" />
                <div className="h-4 w-1/2 rounded-md bg-black/[0.06]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
