// src/components/common/Footer.tsx
import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer aria-labelledby="footer-heading" className="bg-black py-16">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <NavGroup title="Shop">
            <NavLink href="/products">All Products</NavLink>
            <NavLink href="/products/terra-canvas">Terra Canvas</NavLink>
            <NavLink href="/products/aqua-hue">Aqua Hue</NavLink>
          </NavGroup>

          <NavGroup title="Artistry Cart">
            <NavLink href="/about">Our Story</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/journal">Journal</NavLink>
          </NavGroup>

          <NavGroup title="Social">
            <NavLink href="#">Instagram</NavLink>
            <NavLink href="#">X (Twitter)</NavLink>
            <NavLink href="#">Pinterest</NavLink>
          </NavGroup>
        </div>

        {/* Bottom footer section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-neutral-800 pt-8 md:flex-row">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Artistry Cart Inc. All rights reserved.
          </p>
          <Link
            href="/"
            aria-label="Artistry Cart Home"
            className="order-first md:order-none"
          >
            {/* Make sure your logo is in the `public` folder */}
            <Image src="/logo.svg" alt="Artistry Cart Logo" width={150} height={25} />
          </Link>
          <ul
            aria-label="Legal"
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"
          >
            <li>
              <a href="#" className="hover:text-white">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

// Internal component for organizing footer navigation groups
const NavGroup = ({ title, children }: { title: string; children?: ReactNode }) => (
  <nav aria-labelledby={`${title.toLowerCase()}-heading`}>
    <h3
      id={`${title.toLowerCase()}-heading`}
      className="mb-6 text-xl font-medium"
    >
      {title}
    </h3>
    <ul className="space-y-4" role="list">
      {children}
    </ul>
  </nav>
);

// Internal component for individual footer links
const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <li>
      <Link href={href} className="text-neutral-300 hover:text-white">
        {children}
      </Link>
    </li>
  );
};