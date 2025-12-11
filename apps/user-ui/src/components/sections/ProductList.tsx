// src/components/sections/ProductList.tsx
'use client';
import { FC, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ProductCard } from '../products/ProductCard'; // Ensure this uses a compatible card
import { RevealText } from '../animations/RevealText';
import { ArtProduct } from '@/types/products';
import { ButtonLink } from '../common/ButtonLink';

export type ProductListProps = {
  eyebrow: string;
  heading: string;
  body: string;
  products: ArtProduct[];
};

export const ProductList: FC<ProductListProps> = ({ eyebrow, heading, body, products }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Transform scroll progress to x translation for horizontal scroll
  // We want to scroll [number of products] * 100vw roughly, but contained in a sticky section
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <div className="relative bg-background text-foreground">

      {/* Section Header */}
      <div className="pt-24 pb-12 px-6 md:px-12 lg:px-24">
        <p className="text-sm font-light tracking-[0.3em] uppercase mb-4 text-primary/60">{eyebrow}</p>
        <div className="max-w-5xl">
          <RevealText
            text={heading}
            as="h2"
            className="font-display text-5xl md:text-7xl lg:text-9xl leading-[0.9] uppercase tracking-tighter"
            staggerAmount={0.02} // Fast stagger for a snappy feel
          />
        </div>
        <p className="mt-8 text-xl md:text-2xl font-light text-primary/70 max-w-2xl leading-relaxed">
          {body}
        </p>
      </div>

      {/* Horizontal Scroll Section */}
      <section ref={targetRef} className="relative h-[300vh] bg-background"> {/* Taller height = slower scroll */}
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-16 px-6 md:px-12 lg:px-24">
            {products.map((product, index) => (
              <div key={index} className="relative w-[85vw] md:w-[60vw] lg:w-[45vw] h-[70vh] flex-shrink-0">
                {/* 
                     We are reusing the "Big" ProductCard but wrapping it to fit our gallery container.
                     The ProductCard has its own 'min-h-[85vh]' which might be conflicting.
                     We force a scale/container to make it fit nicely.
                  */}
                <div className="w-full h-full relative overflow-hidden group">
                  {/* 
                        Note: The existing ProductCard is designed as a full-screen hero. 
                        Embedding it here might be heavy. For a gallery, we ideally want a cleaner card.
                        However, reusing it preserves logic. Let's try to fit it.
                        If it breaks layout, we might need a streamlined version.
                        Given the request "make attractive ui", I will use the card but maybe scale it or use a simpler custom layout here
                        if the ProductCard brings too much baggage (like full screen fades). 
                        
                        Actually, looking at ProductCard step 288, it has FadeIn with absolute positioning. 
                        This might not work well inside a flex row.
                        
                        Let's rebuild a stripped-down "Gallery Card" inside here for maximum control and "Awwwards" feel.
                     */}

                  <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
                    {/* Image */}
                    {product.images[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                      <h3 className="text-3xl md:text-5xl font-display text-white mb-2 leading-tight">
                        {product.title}
                      </h3>
                      <p className="text-white/60 text-lg mb-6 line-clamp-2">{product.description}</p>
                      <ButtonLink href={`/product/${product.slug}`} variant="Secondary">
                        View Piece
                      </ButtonLink>
                    </div>

                    {/* Badge */}
                    {product.Shop && (
                      <div className="absolute top-8 right-8 text-white/50 text-sm tracking-widest uppercase border border-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
                        {product.Shop.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* End Card */}
            <div className="w-[50vw] h-[70vh] flex-shrink-0 flex items-center justify-center">
              <ButtonLink href="/shops" variant="Primary" className="text-3xl md:text-5xl font-display">
                View All Creations
              </ButtonLink>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Spacer to transition out naturally */}
      <div className="h-24 bg-background"></div>
    </div>
  );
};
