import clsx from "clsx";
import { TransitionLink, TransitionLinkProps } from "./TransitionLink";


export type ButtonLinkProps = TransitionLinkProps & {
  variant?: "Primary" | "Secondary";
};

export const ButtonLink = ({
  className,
  variant = "Primary",
  ...restProps
}: ButtonLinkProps) => {
  return (
    <TransitionLink
      className={clsx(
        "inline-flex items-center justify-center px-12 py-4 text-center font-extrabold tracking-wider uppercase transition-colors duration-300",
        variant === "Secondary"
          ? "border-[2px] border-foreground text-foreground hover:bg-foreground/10"
          : "bg-foreground text-background hover:bg-foreground/80",
        className,
      )}
      {...restProps}
    />
  );
};