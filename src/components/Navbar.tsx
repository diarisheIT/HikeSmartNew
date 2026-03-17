"use client";

interface NavbarProps {
  onLogoClick: () => void;
  isTransparent: boolean;
}

export default function Navbar({ onLogoClick, isTransparent }: NavbarProps) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isTransparent
          ? "bg-transparent"
          : "bg-forest-700/90 backdrop-blur-md border-b border-white/10"
      }`}
    >
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="font-heading text-xl text-cream-50 hover:text-gold-400 transition-colors duration-200"
        >
          HikeSmart
        </button>
      </div>
    </nav>
  );
}
