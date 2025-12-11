
import { CallToAction } from '@/components/sections/CallToAction';
import { Hero } from '@/components/sections/Hero';
import { ProductFeature } from '@/components/sections/ProductFeature';
import { ProductList } from '@/components/sections/ProductList';
import { ScrollText } from '@/components/sections/ScrollText';
import { products } from '@/lib/data';
import { RecommendedProducts } from '@/components/products/RecommendedProducts';

export default function HomePage() {
  const featuredProduct = products[0]; // Example: feature the first product

  return (
    <>
      <Hero
        heading="Crafted with Nature’s Touch"
        body="Discover timeless handmade wooden creations that bring warmth, elegance, and artistry into your home."
        buttonText="Shop the Collection"
        buttonLink="/product"
        imageUrl="/images/wooden-hero.jpg"
      />

      <ScrollText
        eyebrow="The Philosophy"
        text="We believe wood is more than just material — it’s a canvas of nature. Each grain tells a story, each creation a legacy of craftsmanship."
      />

      <RecommendedProducts limit={3} />

      <ProductList
        eyebrow="Our Creations"
        heading="Handmade Wooden Masterpieces"
        body="Each product is meticulously crafted by skilled artisans, blending tradition with creativity to give you unique pieces that last a lifetime."
        products={products}
      />
      <ProductFeature
        heading="Featured Creation: Oak Harmony Bowl"
        description="Hand-carved from sustainably sourced oak, this timeless piece brings a natural elegance to any space. Perfect as a centerpiece or a thoughtful gift."
        product={featuredProduct}
      />



      <CallToAction
        eyebrow="Bring Art Home"
        heading="Find Your Wooden Masterpiece"
        body="Explore our curated collection of handmade wooden creations, crafted to add warmth, authenticity, and artistry to your everyday life."
        buttonText="Shop Now"
        buttonLink="/product"
      />

    </>
  );
}