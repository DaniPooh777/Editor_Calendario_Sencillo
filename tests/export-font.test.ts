/**
 * Regression tests for src/export-font.ts.
 *
 * Pin the compensation CSS that makes the PNG clone measure exactly like the
 * live layout. html-to-image copies each element's computed font-size but
 * lowers it (Math.floor(px) - 0.1), which narrows the text enough to move line
 * breaks; the rule below restores the live size with !important.
 *
 * Run with: npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXPORT_FONT_ATTRIBUTE, fontFixRules } from '../src/export-font.ts';

test('fontFixRules pins every stamped element to its live size with !important', () => {
  assert.equal(
    fontFixRules(['16px', '11.5px', '14px']),
    '[data-export-font="0"]{font-size:16px !important}' +
      '[data-export-font="1"]{font-size:11.5px !important}' +
      '[data-export-font="2"]{font-size:14px !important}',
  );
});

test('fontFixRules keeps the selector tied to the exported attribute name', () => {
  assert.ok(fontFixRules(['12px']).startsWith(`[${EXPORT_FONT_ATTRIBUTE}="0"]`));
});

test('fontFixRules returns no CSS when nothing was stamped', () => {
  assert.equal(fontFixRules([]), '');
});
