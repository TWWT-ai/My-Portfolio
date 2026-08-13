/**
 * ADDED — the floating 16px pixel characters on /about.
 *
 * Drawn as inline SVG on a 16x16 grid with `shape-rendering: crispEdges`, one
 * <rect> per pixel block. Deliberately NOT image files: at 16px a PNG has no
 * room to be anything but mush, these stay sharp at any zoom or DPR, they
 * inherit colour from CSS so a palette change is free, and there is nothing to
 * put in public/ or keep in sync.
 *
 * Each sprite is placed absolutely around the text column and given one of four
 * motion paths (drift / bob / orbit / sway) plus its own duration and delay, so
 * nothing visibly loops in step. Positions are percentages, so they hold as the
 * column resizes. See .about-sprite in globals.css.
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
const WARM = "#e8b64c";
const LEAF = "#3f6f52";
const PALE = "#f4f1e8";

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
          fill: ACCENT,
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
          fill: ACCENT,
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

/**
 * The floating layer. Each entry pairs a sprite with a position and one of the
 * four motion classes; durations and delays are staggered so the group never
 * pulses in unison. aria-hidden because these are pure decoration.
 */
const FLOATERS = [
  { S: PixelStar, top: "12%", left: "8%", motion: "drift", dur: "11s", delay: "0s" },
  { S: PixelTerminal, top: "26%", left: "84%", motion: "bob", dur: "7s", delay: "0.6s" },
  { S: PixelHeart, top: "44%", left: "5%", motion: "orbit", dur: "15s", delay: "1.2s" },
  { S: PixelCoffee, top: "62%", left: "88%", motion: "sway", dur: "9s", delay: "0.3s" },
  { S: PixelDisk, top: "78%", left: "11%", motion: "bob", dur: "8.5s", delay: "1.8s" },
  { S: PixelLeaf, top: "18%", left: "72%", motion: "orbit", dur: "13s", delay: "2.4s" },
  { S: PixelBracket, top: "88%", left: "78%", motion: "drift", dur: "12s", delay: "0.9s" },
  { S: PixelSpark, top: "54%", left: "92%", motion: "bob", dur: "6.5s", delay: "1.5s" },
  { S: PixelStar, top: "70%", left: "3%", motion: "sway", dur: "10s", delay: "2.1s" },
  { S: PixelSpark, top: "34%", left: "14%", motion: "orbit", dur: "14s", delay: "0.4s" },
] as const;

export function FloatingSprites() {
  return (
    <div className="about-sprites" aria-hidden="true">
      {FLOATERS.map(({ S, top, left, motion, dur, delay }, i) => (
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
