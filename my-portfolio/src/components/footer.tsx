/**
 * FILLED IN — this file was previously empty.
 *
 * A deliberately short footer (fixed 52px on desktop) mounted globally in
 * layout.tsx. It exists for two reasons:
 *   1. It closes off the page, so the fourth section card no longer looks like
 *      it has been sliced off by the bottom of the window.
 *   2. Its height is a known constant, so the hero can size itself to
 *      `calc(100vh - var(--footer-h))` and the whole home page lands in a
 *      single viewport with nothing to scroll.
 *
 * If you change the height here, change `--footer-h` in globals.css to match.
 * This is a Server Component — no interactivity.
 */

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span className="footer-copy">
        © {new Date().getFullYear()} Temuulen Wang
      </span>
      <span className="footer-links">
        <a href="mailto:temuulenwang@gmail.com">temuulenwang@gmail.com</a>
        <a
          href="https://github.com/TWWT-ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <Link href="/contact">Contact</Link>
      </span>
    </footer>
  );
}
