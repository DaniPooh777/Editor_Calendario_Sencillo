/**
 * Keep the exported PNG measuring exactly like the live layout.
 *
 * html-to-image copies every element's computed `font-size`, but when the
 * computed declaration has no `cssText` (Chromium's `getComputedStyle().cssText`
 * is always empty) it lowers the value to `Math.floor(px) - 0.1`
 * (node_modules/html-to-image/es/clone-node.js, cloneCSSStyle). The clone's text
 * is therefore narrower than the real one: 11.5px becomes 10.9px, a 5% shrink
 * that is enough to move line breaks in the notes panel.
 *
 * The fix: stamp each element with its live size, then hand html-to-image a
 * stylesheet (via the `fontEmbedCSS` hook, injected as a `<style>` inside the
 * clone) whose `!important` rules outrank the reduced inline values it writes.
 *
 * Generated technical artifacts stay in English, per repo convention.
 */

/** Attribute used only during one capture; cleared afterwards. */
export const EXPORT_FONT_ATTRIBUTE = 'data-export-font';

/** Read an element's live, layout-affecting font size. */
const computedFontSize = (el: Element): string => getComputedStyle(el).fontSize;

/**
 * Build the stylesheet that restores `sizes` inside the clone.
 * Index i matches the element stamped with `[data-export-font="i"]`.
 */
export function fontFixRules(sizes: readonly string[]): string {
  return sizes
    .map((size, index) => `[${EXPORT_FONT_ATTRIBUTE}="${index}"]{font-size:${size} !important}`)
    .join('');
}

/**
 * Tag `root` and every descendant with its live font size.
 * Returns the sizes in stamp order, ready for `fontFixRules`.
 */
export function stampFontSizes(root: Element, read: (el: Element) => string = computedFontSize): string[] {
  const sizes: string[] = [];
  for (const el of [root, ...root.querySelectorAll('*')]) {
    el.setAttribute(EXPORT_FONT_ATTRIBUTE, String(sizes.length));
    sizes.push(read(el));
  }
  return sizes;
}

/** Remove every stamp added by `stampFontSizes`, leaving the live tree untouched. */
export function clearFontStamps(root: Element): void {
  root.removeAttribute(EXPORT_FONT_ATTRIBUTE);
  for (const el of root.querySelectorAll(`[${EXPORT_FONT_ATTRIBUTE}]`)) {
    el.removeAttribute(EXPORT_FONT_ATTRIBUTE);
  }
}
