import { LINKS } from "./collection";

export type Task = {
  id: string;
  /** Instruction text, shown as the row label. */
  label: string;
  /** Where the row sends people. Opening it marks the task done. */
  href: string;
};

const PROFILE_URL = LINKS.x;

/**
 * The pinned drop post. Until it exists, every post task falls back to the
 * profile so no row is a dead link.
 */
const PINNED_POST_URL = "";

/** The phrase entrants must quote. Specific to this drop. */
export const QUOTE_TEXT = "hoods up before the ice sets #h00dguins";

const postUrl = PINNED_POST_URL || PROFILE_URL;

const quoteIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(
  QUOTE_TEXT,
)}&url=${encodeURIComponent(postUrl)}`;

/** Entry tasks. Every one is required before an entry can be submitted. */
export const TASKS: readonly Task[] = [
  { id: "follow", label: "Follow @hoodguins", href: PROFILE_URL },
  { id: "like", label: "Like the pinned post", href: postUrl },
  { id: "quote", label: `Quote it: "${QUOTE_TEXT}"`, href: quoteIntentUrl },
  { id: "tag", label: "Tag 3 friends on the post", href: postUrl },
] as const;

export const TASK_IDS: readonly string[] = TASKS.map((task) => task.id);
