/** Single source of truth for collection facts shown across the site. */
export const COLLECTION = {
  name: "h00dguins",
  supply: 1000,
  chain: "Robinhood Chain",
  mintPrice: "TBA",
  allowlistPerWallet: 1,
} as const;

/**
 * Outbound links. Swap the placeholders once the real destinations exist:
 * OpenSea needs the collection slug, and mint points at the OpenSea drop for now.
 */
export const LINKS = {
  x: "https://x.com/hoodguins",
  opensea: "https://opensea.io/",
  mint: "https://opensea.io/",
} as const;

/**
 * Mint art. Honorary guins are deliberately absent: they are not part of the
 * 1000 supply and should never appear in the collection previews.
 */
export const ART = [
  "/Untitled680_20260828083906.png",
  "/Untitled684_20260822032624.png",
  "/Untitled685_20260822035755.png",
  "/Untitled689_20260825053718.png",
  "/Untitled691_20260825055930.png",
  "/Untitled704_20260829043518.png",
] as const;

/** Downscaled WebP copies of the same art, used as WebGL textures. */
export const TEXTURES = [
  "/tex/guin-01.webp",
  "/tex/guin-02.webp",
  "/tex/guin-03.webp",
  "/tex/guin-04.webp",
  "/tex/guin-05.webp",
  "/tex/guin-06.webp",
] as const;

export const BANNER = "/1500x500.jpeg";

/** Post-mint token section. Copy supplied by the team, kept verbatim. */
export const TOKEN = {
  ticker: "$RPENG",
  kicker: "Coming after mint",
  tagline: "The token powering The Cold Block.",
  body: `After the H00dguins mint, $RPENG will introduce a new layer to the ecosystem through H00dguin staking, rewards, character progression, ecosystem access and future experiences.`,
  loop: ["Hold", "Stake", "Earn", "Upgrade"],
  footnote:
    "Full $RPENG mechanics and tokenomics will be announced after mint and before token activation.",
  status: "Coming soon",
  /** Chapters of the post-mint story. Mechanics are indicative until tokenomics land. */
  story: [
    {
      id: "hold",
      title: "Hold",
      line: "Keep your guin in the wallet you minted from.",
      body: "Holding is the entry ticket. Every layer that follows reads from the guins you actually hold.",
    },
    {
      id: "stake",
      title: "Stake",
      line: "Send your guin into The Cold Block.",
      body: "Staked guins go to work on the ice. They stay yours the whole time, just busier.",
    },
    {
      id: "earn",
      title: "Earn",
      line: "Staked guins accrue $RPENG.",
      body: "The longer the winter runs, the deeper the reserve you build up.",
    },
    {
      id: "upgrade",
      title: "Upgrade",
      line: "Spend it on progression and access.",
      body: "Character progression, ecosystem access, and the experiences that come after.",
    },
  ],
} as const;
