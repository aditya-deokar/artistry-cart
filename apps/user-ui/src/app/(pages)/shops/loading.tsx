import { Bounded } from "@/components/common/Bounded";

export default function Loading() {
  return (
    <Bounded>
      <div className="py-16 text-center animate-pulse">
        <div className="h-12 w-3/4 mx-auto rounded-lg bg-neutral-800"></div>
        <div className="mt-4 space-y-2">
            <div className="h-5 w-full max-w-2xl mx-auto rounded bg-neutral-800"></div>
            <div className="h-5 w-2/3 max-w-2xl mx-auto rounded bg-neutral-800"></div>
        </div>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
        <aside className="lg:col-span-1">
          <div className="p-6 h-64 border border-neutral-800 rounded-lg bg-neutral-900/50"></div>
        </aside>
        <section className="lg:col-span-3">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-square w-full rounded-lg bg-neutral-800"></div>
                        <div className="h-5 w-3/4 mt-4 rounded bg-neutral-800"></div>
                        <div className="h-4 w-1/2 mt-2 rounded bg-neutral-800"></div>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </Bounded>
  );
}