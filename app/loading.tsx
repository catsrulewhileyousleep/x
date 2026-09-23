export default function Loading() {
  return (
    <>
      <p role="status" className="sr-only">
        Loading page…
      </p>
      <div aria-hidden="true" className="space-y-10">
        <header className="space-y-5">
          <div className="h-10 w-4/5 max-w-lg rounded-md bg-surface sm:h-11" />
          <div className="max-w-[52ch] space-y-2">
            <div className="h-4 w-full rounded bg-surface" />
            <div className="h-4 w-3/4 rounded bg-surface" />
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-lg border border-hairline bg-surface" />
            <div className="h-10 w-24 rounded-lg border border-hairline bg-surface" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex min-h-16 items-center justify-between gap-4 border-b border-hairline px-3 py-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-2/5 max-w-56 rounded bg-surface" />
                  <div className="h-3 w-4/5 max-w-xl rounded bg-surface" />
                </div>
                <div className="h-5 w-12 shrink-0 rounded bg-surface" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
