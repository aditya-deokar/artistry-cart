"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Header from "@/shared/widgets/header";


// We don't need to register ScrollTrigger if we are not using it for the header entrance.
gsap.registerPlugin(useGSAP);

const AnimatedHeader = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Set initial states (invisible and slightly moved)
    

    // Create a timeline for a controlled animation sequence
    const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 }
    });

    // Stagger the animation of the top header elements
    tl.to(".top-header-element", {
        opacity: 1,
        y: 0,
        stagger: 0.15, // Animate each element 0.15s after the previous one
        delay: 0.2 // Start after a brief pause
    })
    // Animate the navigation bar after the top part is done
    .to(".nav-element", {
        opacity: 1,
        y: 0,
        stagger: 0.1,
    }, "-=0.4"); // Overlap with the end of the previous animation for a fluid transition

  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
        {/* We pass down the classNames to the Header component */}
        <Header
            topHeaderClassName="top-header-element"
            navClassName="nav-element"
            // className="absolute"
        />
    </div>
  );
};

export default AnimatedHeader;