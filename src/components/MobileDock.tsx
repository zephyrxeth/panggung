"use client";
import HamburgerMenu from "./HamburgerMenu";

export default function MobileDock() {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]" aria-label="Menu utama">
      <div className="flex justify-center">
        <HamburgerMenu direction="up" align="center" />
      </div>
    </nav>
  );
}
