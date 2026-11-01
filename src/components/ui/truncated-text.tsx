/**
 * One line of text, ellipsised when it does not fit.
 *
 * Exists because Badge and Button are both `inline-flex`, and `text-overflow`
 * only applies to a block container — a `truncate` on either of them clips the
 * text mid-glyph with no ellipsis, which reads as a rendering bug rather than
 * as "there is more here". Their label needs its own block box, and this is it.
 *
 * `truncate` also sets `overflow: hidden`, which resolves the flex item's
 * automatic minimum size to zero — so the label shrinks inside its chip or
 * button instead of forcing the whole thing wider than the card.
 *
 * Every string on a listing card is editor-entered and none of it is
 * length-validated in the CMS, so the cap belongs in the component rather than
 * in an assumption about what an editor will type.
 */
export function TruncatedText({ children, title }: { children: string; title?: string }) {
  return (
    <span title={title} className="truncate">
      {children}
    </span>
  );
}
