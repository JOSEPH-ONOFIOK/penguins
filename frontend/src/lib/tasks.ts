import { LINKS } from "./collection";

export type Task = {
  id: string;
  title: string;
  detail: string;
  cta: string;
  href: string;
};

/** The exact phrase entrants must include in their quote post. */
export const QUOTE_TEXT = "Hoods up. Minting 1000 on Robinhood Chain.";

/** Entry tasks. Every one is required before an entry can be submitted. */
export const TASKS: readonly Task[] = [
  {
    id: "follow",
    title: "Follow h00dguins on X",
    detail: "The account you follow from is the handle we review.",
    cta: "Open X",
    href: LINKS.x,
  },
  {
    id: "repost",
    title: "Like and repost the pinned post",
    detail: "Find the pinned drop post on the profile and boost it.",
    cta: "Open post",
    href: LINKS.x,
  },
  {
    id: "quote",
    title: "Quote the post",
    detail: `Include this line in your quote: "${QUOTE_TEXT}"`,
    cta: "Open post",
    href: LINKS.x,
  },
] as const;

export const TASK_IDS: readonly string[] = TASKS.map((task) => task.id);
