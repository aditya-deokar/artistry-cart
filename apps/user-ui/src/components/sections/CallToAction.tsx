// src/components/sections/CallToAction.tsx
import { FC } from "react";
import { Bounded } from "../common/Bounded";
import { FadeIn } from "../animations/FadeIn";
import { RevealText } from "../animations/RevealText";
import { ButtonLink } from "../common/ButtonLink";


type CallToActionProps = {
  eyebrow: string;
  heading: string;
  body: string;
  buttonText: string;
  buttonLink: string;
};

export const CallToAction: FC<CallToActionProps> = ({
  eyebrow,
  heading,
  body,
  buttonText,
  buttonLink,
}) => {
  return (
      
    <Bounded
      // Make sure you have a background.avif or change the path
      className="relative overflow-hidden bg-[url('/background.avif')] bg-cover bg-center py-16 text-gray-50 md:py-28 h-svh"
    >
      <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
        <FadeIn className="text-sm font-light tracking-[.2em] uppercase">
          {eyebrow}
        </FadeIn>

        <RevealText
          text={heading}
          as="h2"
          align="center"
          className="font-display mx-auto max-w-3xl text-5xl sm:text-6xl md:text-7xl"
        />

        <FadeIn
          className="mx-auto max-w-2xl text-balance text-lg text-gray-300"
          vars={{ delay: 0.4 }}
        >
          <p>{body}</p>
        </FadeIn>

        <FadeIn vars={{delay: 0.6}}>
            <ButtonLink href={buttonLink} variant="Primary">
                {buttonText}
            </ButtonLink>
        </FadeIn>
      </div>
    </Bounded>
   
  );
};