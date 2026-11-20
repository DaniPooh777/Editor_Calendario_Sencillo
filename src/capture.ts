/** Capture the calendar as a clean professional image (no editor UI). */

import { getFontEmbedCSS, toPng } from 'html-to-image';
import { clearFontStamps, fontFixRules, stampFontSizes } from './export-font';

/**
 * Render #capture-area to PNG without editor-only controls
 * (hidden via .export-mode + [data-export-exclude]), then copy to
 * the clipboard. Falls back to downloading a PNG file when the
 * browser blocks clipboard image writes.
 */
export async function copyCalendarImage(): Promise<'clipboard' | 'download'> {
  const node = document.getElementById('capture-area');
  if (!node) throw new Error('Missing #capture-area');

  document.body.classList.add('export-mode');
  try {
    // html-to-image shrinks every cloned font-size, which shifts line breaks
    // (see src/export-font.ts). Stamp the live sizes and restore them in the
    // clone through the stylesheet hook, keeping any real webfont CSS too.
    const liveFontSizes = stampFontSizes(node);
    const backgroundColor = getComputedStyle(node).backgroundColor || '#f7f3ea';
    const webFontCss = await getFontEmbedCSS(node);
    const fontEmbedCSS = [webFontCss, fontFixRules(liveFontSizes)].filter(Boolean).join('\n');
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      backgroundColor,
      fontEmbedCSS,
    });

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return 'clipboard';
    } catch {
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.download = `calendario-${stamp}.png`;
      link.href = dataUrl;
      link.click();
      return 'download';
    }
  } finally {
    clearFontStamps(node);
    document.body.classList.remove('export-mode');
  }
}
