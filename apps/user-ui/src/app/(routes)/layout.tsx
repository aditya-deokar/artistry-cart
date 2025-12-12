import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Scrollable Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 overflow-auto">
        {/* Navigation / Back Button */}
        <div className="p-6 md:p-10 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-2 rounded-full bg-accent/50 group-hover:bg-accent transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span>Back to Gallery</span>
          </Link>
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            Artistry<span className="text-primary">Cart</span>
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Artistry Cart. All rights reserved.
        </div>
      </div>

      {/* Fixed Creative Sidebar */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Abstract Background Image */}
        <div className="absolute inset-0 z-0 opacity-80">
          <Image
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt="Abstract Art"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />
        </div>

        {/* Content in Sidebar */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-4 max-w-lg">
            <p className="font-display text-4xl font-light leading-tight">
              "Every artist dips his brush in his own soul, and paints his own nature into his pictures."
            </p>
            <footer className="text-lg font-medium text-white/80">— Henry Ward Beecher</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
