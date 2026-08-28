/** Single source of truth for collection facts shown across the site. */
export const COLLECTION = {
  name: "h00dguins",
  supply: 1000,
  chain: "Robinhood Chain",
  mintPrice: "TBA",
  allowlistPerWallet: 1,
} as const;

/** Original full-resolution art, used for DOM imagery. */
export const ART = [
  "/Untitled680_20260828072252.png",
  "/Untitled680_20260828083906.png",
  "/Untitled684_20260822032624.png",
  "/Untitled685_20260822035755.png",
  "/Untitled686_20260825044516.png",
  "/Untitled688_20260825050229.png",
  "/Untitled689_20260825053718.png",
  "/Untitled691_20260825055930.png",
] as const;

/** Downscaled WebP copies of the same art, used as WebGL textures. */
export const TEXTURES = [
  "/tex/guin-01.webp",
  "/tex/guin-02.webp",
  "/tex/guin-03.webp",
  "/tex/guin-04.webp",
  "/tex/guin-05.webp",
  "/tex/guin-06.webp",
  "/tex/guin-07.webp",
  "/tex/guin-08.webp",
] as const;

export const BANNER = "/1500x500.jpeg";
