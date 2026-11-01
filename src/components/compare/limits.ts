/**
 * How many universities /compare puts side by side.
 *
 * Lives here rather than in the route because two other surfaces enforce the
 * same cap before the user ever reaches /compare — the picker and the program
 * page's compare tray. Three copies of `3` is how the tray ends up offering a
 * fourth slot the comparison then silently drops.
 */
export const MAX_COMPARE = 3;
