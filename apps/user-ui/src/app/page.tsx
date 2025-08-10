


import AnimatedHeader from '@/components/animations/AnimatedHeader';
import { CallToAction } from '@/components/sections/CallToAction';
import { Hero } from '@/components/sections/Hero';
import { ProductFeature } from '@/components/sections/ProductFeature';
import { ProductList } from '@/components/sections/ProductList';
import { ScrollText } from '@/components/sections/ScrollText';
import { products } from '@/lib/data';


export default function HomePage() {
  const featuredProduct = products[0]; // Example: feature the first product

  return (
    <>
      <AnimatedHeader />
      <Hero
        heading="Artistry in Every Bottle"
        body="Our fragrances are crafted to awaken your creativity. Discover a scent that tells your story."
        buttonText="Explore the Collection"
        buttonLink="/products"
        imageUrl="/images/placeholder-hero.jpg"
      />
      <ProductList
        eyebrow="The Collection"
        heading="Curated Essences"
        body="Each fragrance in our collection is a masterpiece, formulated with the finest ingredients to inspire your next creation."
        products={products}
      />
      <ProductFeature
        heading="Featured Creation: Terra Canvas"
        description="A sophisticated blend that captures the raw, grounding essence of nature. Perfect for moments of deep focus and inspiration."
        product={featuredProduct}
        
      />
      <ScrollText
        eyebrow="The Philosophy"
        text="We believe scent is a form of art. A medium of expression. A catalyst for creativity."
      />
      <CallToAction
        eyebrow="Ready to be Inspired?"
        heading="Find Your Signature Scent"
        body="Take our quiz to discover the perfect fragrance that matches your artistic spirit, or explore our sample sets to experience the full collection."
        buttonText="Discover Now"
        buttonLink="/discover"
      />
    </>
  );
}