// src/components/sections/Hero.tsx
import Image from 'next/image';
import { FC } from 'react';
import { Bounded } from '../common/Bounded';
import { FadeIn } from '../animations/FadeIn';
import { RevealText } from '../animations/RevealText';
import { ButtonLink } from '../common/ButtonLink';

type HeroProps = {
  heading: string;
  body: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
};

export const Hero: FC<HeroProps> = ({ heading, body, buttonText, buttonLink, imageUrl }) => {
  return (
    <Bounded className="relative min-h-screen overflow-hidden ">
      {/* bounded- dark:bg-primary/20 bg-primary/80 */}
      {/* <FadeIn vars={{ scale: 1, opacity: 0.5 }} className="absolute inset-0 opacity-0 motion-safe:scale-125">
        <Image
          src='https://plus.unsplash.com/premium_photo-1753982324901-aecaf58fa83c?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          alt="Hero background for Artistry Cart"
          priority
          fill
          className="object-cover motion-reduce:opacity-70"
        />
      </FadeIn> */}

      <div className="relative flex h-screen flex-col justify-center">
        <RevealText
          text={heading}
          as="h1"
          className="font-display max-w-xl text-6xl leading-none text-primary md:text-7xl lg:text-8xl"
          staggerAmount={0.2}
          duration={1.7}
        />
        <FadeIn className="mt-6 max-w-md translate-y-8 text-lg text-primary" vars={{ delay: 1, duration: 1.3 }}>
          <p>{body}</p>
        </FadeIn>
        <FadeIn className="mt-8 translate-y-5" vars={{ delay: 1.7, duration: 1.1 }}>
            <ButtonLink href={buttonLink} variant="Secondary" className="w-fit">
                {buttonText}
            </ButtonLink>
        </FadeIn>
      </div>
    </Bounded>
  );
};