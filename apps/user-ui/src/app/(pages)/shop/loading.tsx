const SkeletonCard = () => (
    <div className="space-y-3 animate-pulse">
        <div className="w-full aspect-[4/5] bg-primary/10 rounded-lg"></div>
        <div className="h-5 w-3/4 bg-primary/10 rounded-md"></div>
        <div className="h-4 w-1/2 bg-primary/10 rounded-md"></div>
    </div>
);

export default function Loading() {
    return (
        <div>
             {/* Hero Skeleton */}
            <div className="w-full h-[30vh] bg-accent animate-pulse"></div>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filter Skeleton */}
                    <aside className="lg:col-span-1 space-y-6 animate-pulse">
                        <div className="h-10 w-full bg-primary/10 rounded-md"></div>
                        <div className="h-24 w-full bg-primary/10 rounded-md"></div>
                        <div className="h-16 w-full bg-primary/10 rounded-md"></div>
                    </aside>
                    {/* Grid Skeleton */}
                    <section className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </section>
                </div>
            </main>
        </div>
    );
}