import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--ac-sand)] dark:bg-[var(--ac-slate)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
