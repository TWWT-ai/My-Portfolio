/**
 * The floating 16px pixel drawings. Now used on ALL FOUR inner pages, not just
 * /about.
 *
 * Drawn as inline SVG on a 16x16 grid with `shape-rendering: crispEdges`, one
 * <rect> per pixel block. Deliberately NOT image files: at 16px a PNG has no
 * room to be anything but mush, these stay sharp at any zoom or DPR, they
 * inherit colour from CSS so a palette change is free, and there is nothing to
 * put in public/ or keep in sync. Eighteen sprites cost about 6 KB of markup
 * with no extra network requests at all.
 *
 * ON THE TECH ICONS — worth reading before you swap any of them.
 *
 * The brief asked for VS Code, JetBrains, Python and Java. What is below is
 * deliberately one step to the side of that: a generic code-editor window
 * rather than the VS Code ribbon, concentric squares rather than the JetBrains
 * mark, a snake rather than the Python logo, a coffee cup rather than Duke.
 * Company logos are trademarks, and a pixel-art redraw is still a derivative
 * of the mark — fine in a "technologies I use" grid where the point is to name
 * the tool, less obviously fine as free-floating decoration.
 *
 * The shapes still read as what they are, which is all decoration needs to do.
 * If you would rather have the real marks, simple-icons ships every one of
 * them as an SVG and dropping them in is a small change — say the word.
 *
 * Each sprite is placed absolutely around the content and given one of four
 * motion paths (drift / bob / orbit / sway) plus its own duration and delay, so
 * nothing visibly loops in step. Positions are percentages, so they hold as the
 * page resizes. See .about-sprite in globals.css.
 *
 * Server Component — pure markup, no interactivity.
 */

type SpriteProps = { className?: string };

/** 16x16 grid; each entry is [x, y, w, h] in grid units. */
type Px = [number, number, number, number];

function Sprite({
  blocks,
  className,
  label,
}: {
  blocks: { fill: string; px: Px[] }[];
  className?: string;
  label: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={className}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      {blocks.map((group, gi) =>
        group.px.map(([x, y, w, h], i) => (
          <rect
            key={`${gi}-${i}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={group.fill}
          />
        )),
      )}
    </svg>
  );
}

const INK = "#111111";
const ACCENT = "#75c5de";
const DEEP = "#1f6c84";
const WARM = "#e8b64c";
const LEAF = "#3f6f52";
const PALE = "#f4f1e8";

/* ------------------------------------------------------------------ *
 * Original set
 * ------------------------------------------------------------------ */

export function PixelStar({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: WARM,
          px: [
            [7, 2, 2, 12],
            [2, 7, 12, 2],
            [5, 5, 2, 2],
            [9, 5, 2, 2],
            [5, 9, 2, 2],
            [9, 9, 2, 2],
          ],
        },
      ]}
    />
  );
}

export function PixelHeart({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: "#d9534f",
          px: [
            [3, 3, 3, 2],
            [10, 3, 3, 2],
            [2, 5, 12, 3],
            [3, 8, 10, 2],
            [4, 10, 8, 2],
            [6, 12, 4, 2],
          ],
        },
      ]}
    />
  );
}

export function PixelTerminal({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: INK, px: [[1, 2, 14, 12]] },
        { fill: PALE, px: [[1, 2, 14, 2]] },
        {
          fill: ACCENT,
          px: [
            [3, 7, 2, 2],
            [5, 9, 2, 2],
            [3, 11, 2, 2],
            [8, 11, 5, 2],
          ],
        },
      ]}
    />
  );
}

export function PixelCoffee({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: PALE, px: [[2, 6, 10, 8]] },
        { fill: "#6f4e37", px: [[3, 7, 8, 3]] },
        {
          fill: INK,
          px: [
            [12, 7, 2, 4],
            [11, 11, 2, 1],
          ],
        },
        {
          fill: ACCENT,
          px: [
            [4, 2, 1, 3],
            [7, 1, 1, 4],
            [10, 2, 1, 3],
          ],
        },
      ]}
    />
  );
}

export function PixelDisk({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: INK, px: [[2, 2, 12, 12]] },
        { fill: PALE, px: [[5, 2, 6, 5]] },
        { fill: ACCENT, px: [[8, 3, 2, 3]] },
        { fill: PALE, px: [[4, 9, 8, 5]] },
      ]}
    />
  );
}

export function PixelLeaf({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: LEAF,
          px: [
            [8, 2, 4, 2],
            [6, 4, 6, 2],
            [4, 6, 8, 2],
            [3, 8, 8, 2],
            [3, 10, 6, 2],
          ],
        },
        { fill: INK, px: [[2, 12, 3, 2]] },
      ]}
    />
  );
}

export function PixelBracket({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        // Reads as "<>" at 16px. An earlier version used tall side bars and
        // a centre dot, which rendered as a letter H.
        {
          fill: DEEP,
          px: [
            [6, 5, 2, 2],
            [4, 7, 2, 2],
            [6, 9, 2, 2],
            [8, 5, 2, 2],
            [10, 7, 2, 2],
            [8, 9, 2, 2],
          ],
        },
      ]}
    />
  );
}

export function PixelSpark({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        // Short arms plus corner specks, so it reads as a sparkle rather than
        // a thin plus sign.
        {
          fill: DEEP,
          px: [
            [7, 2, 2, 3],
            [7, 11, 2, 3],
            [2, 7, 3, 2],
            [11, 7, 3, 2],
            [5, 5, 1, 1],
            [10, 5, 1, 1],
            [5, 10, 1, 1],
            [10, 10, 1, 1],
          ],
        },
        { fill: WARM, px: [[6, 6, 4, 4]] },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Coding-technology set (see the note at the top of this file)
 * ------------------------------------------------------------------ */

/** Code editor: window with a coloured activity bar and three lines of code. */
export function PixelEditor({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: INK, px: [[1, 3, 14, 10]] },
        { fill: PALE, px: [[2, 4, 12, 8]] },
        { fill: ACCENT, px: [[2, 4, 3, 8]] },
        {
          fill: DEEP,
          px: [
            [6, 5, 6, 1],
            [6, 7, 4, 1],
            [6, 9, 5, 1],
          ],
        },
      ]}
    />
  );
}

/** IDE: concentric squares. Reads as a heavyweight tool next to the editor. */
export function PixelIde({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: INK, px: [[2, 2, 12, 12]] },
        { fill: PALE, px: [[4, 4, 8, 8]] },
        { fill: DEEP, px: [[6, 6, 4, 4]] },
        { fill: WARM, px: [[3, 11, 2, 2]] },
      ]}
    />
  );
}

/** Snake — the scripting language, without borrowing the actual logo. */
export function PixelSnake({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: LEAF,
          px: [
            [3, 3, 7, 2],
            [8, 5, 2, 2],
            [4, 7, 6, 2],
            [4, 9, 2, 2],
            [4, 11, 8, 2],
          ],
        },
        { fill: WARM, px: [[10, 3, 2, 2]] },
        { fill: INK, px: [[11, 3, 1, 1]] },
      ]}
    />
  );
}

/** Database: the universal stacked cylinder. */
export function PixelDatabase({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: DEEP, px: [[3, 2, 10, 2]] },
        { fill: INK, px: [[3, 4, 10, 3]] },
        { fill: DEEP, px: [[3, 7, 10, 2]] },
        { fill: INK, px: [[3, 9, 10, 3]] },
        { fill: DEEP, px: [[3, 12, 10, 2]] },
      ]}
    />
  );
}

/** Version control: a trunk with one branch off it. */
export function PixelBranch({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: INK, px: [[6, 4, 2, 8]] },
        { fill: INK, px: [[8, 7, 3, 2]] },
        {
          fill: DEEP,
          px: [
            [5, 1, 4, 3],
            [5, 12, 4, 3],
            [11, 6, 4, 4],
          ],
        },
      ]}
    />
  );
}

/** Bug. Every stack has them. */
export function PixelBug({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: INK,
          px: [
            [2, 6, 3, 1],
            [2, 9, 3, 1],
            [11, 6, 3, 1],
            [11, 9, 3, 1],
            [4, 2, 1, 2],
            [11, 2, 1, 2],
          ],
        },
        { fill: INK, px: [[5, 4, 6, 9]] },
        { fill: "#d9534f", px: [[6, 6, 4, 4]] },
        {
          fill: PALE,
          px: [
            [6, 5, 1, 1],
            [9, 5, 1, 1],
          ],
        },
      ]}
    />
  );
}

/** Processor. */
export function PixelChip({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: INK,
          px: [
            [5, 2, 1, 2],
            [8, 2, 1, 2],
            [11, 2, 1, 2],
            [5, 12, 1, 2],
            [8, 12, 1, 2],
            [11, 12, 1, 2],
            [2, 5, 2, 1],
            [2, 8, 2, 1],
            [2, 11, 2, 1],
            [12, 5, 2, 1],
            [12, 8, 2, 1],
            [12, 11, 2, 1],
          ],
        },
        { fill: INK, px: [[4, 4, 8, 8]] },
        { fill: ACCENT, px: [[6, 6, 4, 4]] },
      ]}
    />
  );
}

/** Curly braces. */
export function PixelBraces({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        {
          fill: DEEP,
          px: [
            [5, 3, 2, 2],
            [4, 5, 2, 2],
            [3, 7, 2, 2],
            [4, 9, 2, 2],
            [5, 11, 2, 2],
            [9, 3, 2, 2],
            [10, 5, 2, 2],
            [11, 7, 2, 2],
            [10, 9, 2, 2],
            [9, 11, 2, 2],
          ],
        },
      ]}
    />
  );
}

/** Cloud — deploys, hosting, the bit that costs money. */
export function PixelCloud({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: ACCENT, px: [[6, 4, 5, 3]] },
        { fill: ACCENT, px: [[4, 6, 9, 3]] },
        { fill: ACCENT, px: [[3, 9, 11, 3]] },
        {
          fill: PALE,
          px: [
            [7, 5, 2, 1],
            [5, 8, 3, 1],
          ],
        },
      ]}
    />
  );
}

/** Source file, with a tiny "<>" on it. */
export function PixelFile({ className }: SpriteProps) {
  return (
    <Sprite
      className={className}
      label=""
      blocks={[
        { fill: INK, px: [[3, 1, 10, 14]] },
        { fill: PALE, px: [[4, 2, 8, 12]] },
        {
          fill: DEEP,
          px: [
            [6, 6, 1, 1],
            [5, 7, 1, 1],
            [6, 8, 1, 1],
            [9, 6, 1, 1],
            [10, 7, 1, 1],
            [9, 8, 1, 1],
          ],
        },
        { fill: ACCENT, px: [[5, 4, 6, 1]] },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Per-page arrangements
 * ------------------------------------------------------------------ */

type Floater = {
  S: (p: SpriteProps) => React.JSX.Element;
  top: string;
  left: string;
  motion: "drift" | "bob" | "orbit" | "sway";
  dur: string;
  delay: string;
};

/**
 * THESE COORDINATES WERE MEASURED, NOT EYEBALLED.
 *
 * The first pass put everything at "left: 4%" and "left: 92%" on the theory
 * that every page has side gutters. /projects and /experience do not — the
 * card panel spans almost the full width — so six sprites ended up crawling
 * underneath cards and page titles, which reads as a rendering bug rather than
 * decoration.
 *
 * The fix was to render each page, collect the bounding box of every heading,
 * paragraph, card and fixed nav element, then scan a 1% grid for positions
 * whose sprite box PLUS its motion envelope (~34px of travel, padded) touches
 * none of them, and pick the required number by farthest-point spread. That is
 * why the values look irregular: they are the actual empty space on each page,
 * which differs per layout. /about has narrow side margins, so its sprites hug
 * 2-3% and 95-96%; the grid pages have room above and below the panel instead.
 *
 * If you substantially change a page's layout, re-check it — a sprite that
 * drifts under a card is the one failure mode this arrangement has.
 *
 * Durations are all mutually indivisible-ish (6.5s, 7s, 8.5s, 9s, 11s, 13s...)
 * so the group takes a very long time to sync up and never pulses in unison.
 */

const ABOUT_FLOATERS: Floater[] = [
  { S: PixelStar, top: "14.5%", left: "2%", motion: "drift", dur: "11s", delay: "0s" },
  { S: PixelEditor, top: "37%", left: "2%", motion: "orbit", dur: "14s", delay: "0.4s" },
  { S: PixelHeart, top: "59.5%", left: "3%", motion: "sway", dur: "15s", delay: "1.2s" },
  { S: PixelSnake, top: "94%", left: "2%", motion: "bob", dur: "8.5s", delay: "1.8s" },
  { S: PixelTerminal, top: "14.5%", left: "96%", motion: "bob", dur: "7s", delay: "0.6s" },
  { S: PixelLeaf, top: "34%", left: "95%", motion: "orbit", dur: "13s", delay: "2.4s" },
  { S: PixelSpark, top: "53.5%", left: "95%", motion: "bob", dur: "6.5s", delay: "1.5s" },
  { S: PixelCoffee, top: "74.5%", left: "95%", motion: "sway", dur: "9s", delay: "0.3s" },
  { S: PixelBracket, top: "94%", left: "96%", motion: "drift", dur: "12s", delay: "0.9s" },
  { S: PixelDisk, top: "83.5%", left: "69%", motion: "bob", dur: "10s", delay: "2.1s" },
];

const PROJECT_FLOATERS: Floater[] = [
  { S: PixelEditor, top: "4%", left: "11%", motion: "bob", dur: "7.5s", delay: "0s" },
  { S: PixelTerminal, top: "7%", left: "34%", motion: "drift", dur: "12s", delay: "0.7s" },
  { S: PixelBraces, top: "7%", left: "64%", motion: "sway", dur: "9.5s", delay: "1.4s" },
  { S: PixelFile, top: "4%", left: "96%", motion: "orbit", dur: "14.5s", delay: "2.6s" },
  { S: PixelChip, top: "85%", left: "31%", motion: "bob", dur: "8s", delay: "0.5s" },
  { S: PixelBug, top: "88%", left: "60%", motion: "drift", dur: "11.5s", delay: "1.1s" },
  { S: PixelDatabase, top: "85%", left: "79%", motion: "bob", dur: "6.8s", delay: "1.7s" },
  { S: PixelBranch, top: "94%", left: "2%", motion: "sway", dur: "10.5s", delay: "0.2s" },
  { S: PixelSpark, top: "94%", left: "97%", motion: "orbit", dur: "13.5s", delay: "2s" },
];

const EXPERIENCE_FLOATERS: Floater[] = [
  { S: PixelIde, top: "4%", left: "11%", motion: "drift", dur: "11.5s", delay: "0.2s" },
  { S: PixelCoffee, top: "7%", left: "64%", motion: "bob", dur: "7.2s", delay: "1s" },
  { S: PixelChip, top: "4%", left: "96%", motion: "sway", dur: "10.8s", delay: "1.3s" },
  { S: PixelSnake, top: "61%", left: "28%", motion: "sway", dur: "9.8s", delay: "1.9s" },
  { S: PixelDatabase, top: "76%", left: "60%", motion: "orbit", dur: "13s", delay: "0.6s" },
  { S: PixelBranch, top: "61%", left: "84%", motion: "bob", dur: "8.2s", delay: "2.3s" },
  { S: PixelStar, top: "94%", left: "2%", motion: "drift", dur: "12.5s", delay: "0.4s" },
  { S: PixelDisk, top: "94%", left: "39%", motion: "bob", dur: "6.6s", delay: "2.7s" },
  { S: PixelBraces, top: "94%", left: "97%", motion: "orbit", dur: "15s", delay: "1.6s" },
];

const CONTACT_FLOATERS: Floater[] = [
  { S: PixelCloud, top: "4%", left: "5%", motion: "drift", dur: "12s", delay: "0s" },
  { S: PixelSpark, top: "4%", left: "30%", motion: "bob", dur: "6.9s", delay: "0.8s" },
  { S: PixelStar, top: "4%", left: "97%", motion: "sway", dur: "10.2s", delay: "1.8s" },
  { S: PixelBracket, top: "22%", left: "51%", motion: "drift", dur: "11.8s", delay: "1.1s" },
  { S: PixelEditor, top: "22%", left: "76%", motion: "orbit", dur: "13.8s", delay: "2.5s" },
  { S: PixelHeart, top: "70%", left: "45%", motion: "orbit", dur: "14s", delay: "1.5s" },
  { S: PixelTerminal, top: "71.5%", left: "81%", motion: "sway", dur: "9.2s", delay: "0.4s" },
  { S: PixelFile, top: "94%", left: "14%", motion: "bob", dur: "8.4s", delay: "2.2s" },
];

const SETS = {
  about: ABOUT_FLOATERS,
  projects: PROJECT_FLOATERS,
  experience: EXPERIENCE_FLOATERS,
  contact: CONTACT_FLOATERS,
} as const;

export type SpriteSet = keyof typeof SETS;

/**
 * The floating layer. `set` picks which arrangement to render, so no two pages
 * show the same sprites in the same places — the point of putting them on every
 * page is lost if all four look identical.
 *
 * aria-hidden because these are pure decoration: a screen reader announcing
 * nine unlabelled images before the actual content would be actively hostile.
 */
export function FloatingSprites({ set = "about" }: { set?: SpriteSet }) {
  return (
    <div className="about-sprites" aria-hidden="true">
      {SETS[set].map(({ S, top, left, motion, dur, delay }, i) => (
        <span
          key={i}
          className={`about-sprite sprite-${motion}`}
          style={{
            top,
            left,
            animationDuration: dur,
            animationDelay: delay,
          }}
        >
          <S />
        </span>
      ))}
    </div>
  );
}
