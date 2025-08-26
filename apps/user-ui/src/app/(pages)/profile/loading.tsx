import { Bounded } from "@/components/common/Bounded";

export default function Loading() {
  return (
    <Bounded>
      <div className="py-12 md:py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* --- Sidebar Skeleton --- */}
          <aside className="lg:col-span-1">
            <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg">
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-800">
                <div className="w-16 h-16 rounded-full bg-neutral-800"></div>
                <div className="w-2/3 h-6 rounded bg-neutral-800"></div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-10 w-full rounded-md bg-neutral-800"></div>
                <div className="h-10 w-full rounded-md bg-neutral-700"></div>
                <div className="h-10 w-full rounded-md bg-neutral-700"></div>
                <div className="h-10 w-full rounded-md bg-neutral-700"></div>
              </div>
            </div>
          </aside>

          {/* --- Content Area Skeleton --- */}
          <main className="lg:col-span-3">
            <div className="space-y-4">
                <div className="h-10 w-1/3 rounded-lg bg-neutral-800"></div>
                <div className="h-5 w-2/3 rounded-lg bg-neutral-700"></div>
            </div>
            <div className="mt-12 p-6 border border-neutral-800 rounded-lg">
                <div className="h-24 w-full rounded-lg bg-neutral-800"></div>
            </div>
             <div className="mt-8 p-6 border border-neutral-800 rounded-lg">
                <div className="h-40 w-full rounded-lg bg-neutral-800"></div>
            </div>
          </main>

        </div>
      </div>
    </Bounded>
  );
}