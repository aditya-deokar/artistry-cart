import { Bounded } from "@/components/common/Bounded";

export default function Loading() {
  return (
    <section className="relative min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
      </div>

      <Bounded>
        <div className="relative py-12 md:py-16 lg:py-20 animate-pulse">
          {/* Header skeleton */}
          <div className="mb-10 md:mb-12">
            <div className="h-3 w-24 rounded-full bg-[var(--ac-gold)]/20 mb-3" />
            <div className="h-10 w-80 rounded-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mb-3" />
            <div className="h-5 w-96 rounded-lg bg-[var(--ac-linen)]/60 dark:bg-[var(--ac-slate)]/60" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* --- Sidebar Skeleton --- */}
            <aside className="lg:col-span-1">
              <div className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl">
                {/* Avatar skeleton */}
                <div className="flex flex-col items-center pb-6 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                  <div className="w-24 h-24 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
                    {/* Shimmer effect */}
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-transparent via-[var(--ac-sand)]/30 to-transparent animate-shimmer" />
                  </div>
                  <div className="mt-4 space-y-2 w-full text-center">
                    <div className="h-6 w-32 mx-auto rounded-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    <div className="h-4 w-40 mx-auto rounded-lg bg-[var(--ac-linen)]/60 dark:bg-[var(--ac-slate)]/60" />
                  </div>
                  <div className="mt-3 h-6 w-36 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                </div>

                {/* Nav skeleton */}
                <div className="mt-6 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-full rounded-lg bg-[var(--ac-linen)]/50 dark:bg-[var(--ac-slate)]/50"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Logout skeleton */}
                <div className="mt-6 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                  <div className="h-12 w-full rounded-lg bg-[var(--ac-linen)]/30 dark:bg-[var(--ac-slate)]/30" />
                </div>
              </div>
            </aside>

            {/* --- Content Area Skeleton --- */}
            <main className="lg:col-span-3 space-y-8">
              {/* Section header skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[var(--ac-gold)]/30" />
                  <div className="h-3 w-24 rounded-full bg-[var(--ac-gold)]/20" />
                </div>
                <div className="h-8 w-40 rounded-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                <div className="h-5 w-80 rounded-lg bg-[var(--ac-linen)]/60 dark:bg-[var(--ac-slate)]/60" />
              </div>

              {/* Avatar card skeleton */}
              <div className="p-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                  <div className="w-32 h-32 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div className="h-6 w-32 rounded-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                    <div className="space-y-2">
                      <div className="h-4 w-full max-w-sm rounded-lg bg-[var(--ac-linen)]/60 dark:bg-[var(--ac-slate)]/60" />
                      <div className="h-4 w-48 rounded-lg bg-[var(--ac-linen)]/40 dark:bg-[var(--ac-slate)]/40" />
                    </div>
                    <div className="h-10 w-36 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                  </div>
                </div>
              </div>

              {/* Form card skeleton */}
              <div className="p-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)] pb-4 mb-6">
                  <div className="h-6 w-48 rounded-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                  <div className="h-4 w-72 mt-2 rounded-lg bg-[var(--ac-linen)]/60 dark:bg-[var(--ac-slate)]/60" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 rounded bg-[var(--ac-linen)]/70 dark:bg-[var(--ac-slate)]/70" />
                      <div className="h-12 w-full rounded-xl bg-[var(--ac-linen)]/40 dark:bg-[var(--ac-slate)]/40 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                  <div className="h-12 w-36 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]" />
                </div>
              </div>
            </main>
          </div>
        </div>
      </Bounded>
    </section>
  );
}