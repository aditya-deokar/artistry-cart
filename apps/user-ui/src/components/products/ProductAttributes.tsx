import { cn } from '@/lib/utils';

type ProductAttributesProps = {
  className?: string;
  mood: string;
  scentProfile: string;
};

export function ProductAttributes({
  className,
  mood,
  scentProfile,
}: ProductAttributesProps) {
  const attributes = [
    { label: 'Scent Profile', value: scentProfile },
    { label: 'Mood', value: mood },
  ];

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {attributes.map((attribute) => (
        <div
          key={attribute.label}
          className="border border-border bg-card px-4 py-3"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {attribute.label}
          </p>
          <p className="mt-2 text-base font-medium capitalize text-foreground">
            {attribute.value}
          </p>
        </div>
      ))}
    </div>
  );
}
