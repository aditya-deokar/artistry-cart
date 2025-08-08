// src/components/products/ProductAttributes.tsx
import { IconType } from "react-icons";
import { LuCrown, LuDroplet, LuFlame, LuGem, LuTreePine, LuZap } from "react-icons/lu";
import type { Product } from "@/lib/data";

type AttributeData = {
  label: string;
  Icon: IconType;
};

const SCENT_PROFILES: Record<Product['scentProfile'], AttributeData> = {
  spicy: { label: "Spicy & Smoky", Icon: LuFlame },
  woody: { label: "Woody & Herbal", Icon: LuTreePine },
  fresh: { label: "Fresh & Aquatic", Icon: LuDroplet },
};

const MOODS: Record<Product['mood'], AttributeData> = {
  bold: { label: "Bold & Seductive", Icon: LuCrown },
  grounded: { label: "Grounded & Sophisticated", Icon: LuGem },
  refreshing: { label: "Refreshing & Invigorating", Icon: LuZap },
};

type ProductAttributesProps = {
  scentProfile: Product['scentProfile'];
  mood: Product['mood'];
  className?: string;
};

export const ProductAttributes = ({
  mood: providedMood,
  scentProfile: providedScentProfile,
  className,
}: ProductAttributesProps) => {
  const scentProfile = SCENT_PROFILES[providedScentProfile];
  const mood = MOODS[providedMood];

  return (
    <div className={className}>
      <p className="mb-2 text-base font-semibold uppercase">Features</p>
      <div className="grid gap-2">
        <p className="flex items-center gap-2">
          <scentProfile.Icon className="size-6" />
          {scentProfile.label}
        </p>
        <p className="flex items-center gap-2">
          <mood.Icon className="size-6" />
          {mood.label}
        </p>
      </div>
    </div>
  );
};