import { ReactNode } from "react";

interface HeroSectionProps {
  children: ReactNode;
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Bottom gradient fading into forest-900 */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-forest-900 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl text-center">
        <h1 className="font-heading text-5xl sm:text-6xl text-cream-50 leading-tight">
          Find your perfect hike
        </h1>
        <p className="text-lg text-cream-100/80">
          Describe what you are looking for in natural language
        </p>
        {children}
      </div>
    </section>
  );
}
