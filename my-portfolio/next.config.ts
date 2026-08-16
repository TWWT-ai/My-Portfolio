import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    /**
     * Ask the image optimizer for AVIF first, WebP second.
     *
     * Next's default is WebP only. AVIF is meaningfully smaller on flat,
     * large-area artwork, which is exactly what the two hero images are —
     * penguin.png is 417 KB of mostly solid colour as a PNG. The cost is a
     * slower first encode per size, cached from then on, which is a fine trade
     * for a site whose hero is 70% of its page weight.
     *
     * Order matters: the optimizer serves the first format the browser
     * advertises in its Accept header, so anything without AVIF support
     * quietly falls back to WebP and then to the original.
     */
    formats: ["image/avif", "image/webp"],

    /**
     * Trimmed from the defaults (640…3840, and 16…384 for imageSizes).
     *
     * Every entry is a size the optimizer may be asked to generate and cache.
     * The source images are 900x1072, so anything above 1080 would only
     * upscale — spending build time and cache on a blurrier file. The site
     * also has no thumbnails or icons going through next/image, so the small
     * scale can drop to the two values the layout can actually request.
     */
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [256, 384],

    /**
     * Allowed `quality` values. Next 16 rejects anything not listed here, so
     * this has to exist for the hero's quality={92} to work at all.
     *
     * 92 rather than the default 75 because both hero images are PIXEL ART.
     * Lossy codecs are tuned for photographs and spend their bit budget on
     * smooth gradients; the thing they throw away first is exactly what pixel
     * art is made of — hard, high-contrast block edges. At 75 those edges pick
     * up visible ringing. At 92 they are clean, and penguin.png still lands
     * around 55 KB against the 417 KB PNG it replaces, so the extra fidelity
     * costs about 30 KB out of a 490 KB saving. Worth it.
     */
    qualities: [75, 92],
  },
};

export default nextConfig;
