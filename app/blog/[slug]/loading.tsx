export default function Loading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e0f12' }}>
      {/* Header skeleton */}
      <header className="border-b animate-pulse" style={{ borderColor: '#1f232b' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-6 w-32 rounded" style={{ backgroundColor: '#1a1d24' }}></div>
        </div>
      </header>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          <article className="min-w-0 animate-pulse">
            {/* Header skeleton */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-20 rounded-full" style={{ backgroundColor: '#1a1d24' }}></div>
                <div className="h-6 w-16 rounded" style={{ backgroundColor: '#1a1d24' }}></div>
              </div>
              <div className="h-12 w-full rounded mb-4" style={{ backgroundColor: '#1a1d24' }}></div>
              <div className="h-6 w-3/4 rounded" style={{ backgroundColor: '#1a1d24' }}></div>
            </header>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-full rounded" style={{ backgroundColor: '#1a1d24' }}></div>
              <div className="h-4 w-full rounded" style={{ backgroundColor: '#1a1d24' }}></div>
              <div className="h-4 w-5/6 rounded" style={{ backgroundColor: '#1a1d24' }}></div>
              <div className="h-8 w-1/3 rounded mt-8" style={{ backgroundColor: '#1a1d24' }}></div>
              <div className="h-4 w-full rounded" style={{ backgroundColor: '#1a1d24' }}></div>
              <div className="h-4 w-full rounded" style={{ backgroundColor: '#1a1d24' }}></div>
            </div>
          </article>

          {/* TOC skeleton */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 p-6 rounded-2xl animate-pulse" style={{ backgroundColor: '#1a1d24' }}>
              <div className="h-6 w-24 rounded mb-4" style={{ backgroundColor: '#2d3441' }}></div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded" style={{ backgroundColor: '#2d3441' }}></div>
                <div className="h-4 w-5/6 rounded" style={{ backgroundColor: '#2d3441' }}></div>
                <div className="h-4 w-4/6 rounded ml-4" style={{ backgroundColor: '#2d3441' }}></div>
                <div className="h-4 w-full rounded" style={{ backgroundColor: '#2d3441' }}></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
