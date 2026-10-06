import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const code = readFileSync(new URL('../js/day.js', import.meta.url), 'utf8');

function dateControls() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', innerHTML: '', style: {}, showPicker() { this.opened = true }, 
      classList: { toggle() {} }, setAttribute() {},
    });
    return elements.get(id);
  };
  const context = {
    $: get, document: { querySelectorAll: () => [], addEventListener() {} },
    BANDS: [{ n: 'Good', m: 50 }], SW: () => '', TC: () => '', bi: () => 0,
    TY: 2026, TD: 100, DAILY: { 2026: Array(101).fill(35) }, DMIN: {},
    sel: { y: 2026, d: 100 }, LD: { arch: 0, live: 0 },
    iso: (y, d) => new Date(Date.UTC(y, 0, d + 1)).toISOString().slice(0, 10),
    dt: (y, d) => new Date(y, 0, d + 1),
    info() {}, loadDay2() {},
  };
  vm.runInNewContext(code, context);
  return { get, context };
}

test('one labelled button opens the native date picker, not a dialog', () => {
  assert.match(html, /<div class="ctl"><button id="today"[^>]*>Today<\/button><input type="date" id="dp"[^>]*tabindex="-1"[^>]*><\/div>/);
  assert.doesNotMatch(html, /<dialog id="dpd"/);
  const { get, context } = dateControls();
  get('today').onclick();
  assert.equal(get('dp').opened, true);
  assert.equal(context.sel.d, 100);
});

test('date label reflects today, yesterday and other selected dates', () => {
  const { get, context } = dateControls();
  const input = get('dp');
  assert.equal(input.max, '2026-04-11');
  assert.equal(input.value, '2026-04-11');
  context.select(2026, 100);
  assert.equal(get('today').textContent, 'Today, Sat 11 Apr');
  input.value = '2026-04-10';
  input.onchange({ target: input });
  assert.equal(context.sel.d, 99);
  assert.equal(get('today').textContent, 'Yesterday, Fri 10 Apr');
  context.select(2026, 98);
  assert.equal(get('today').textContent, 'Thu 9 Apr 2026');
  assert.equal(input.value, '2026-04-09');
  input.value = '';
  input.onchange({ target: input });
  assert.equal(context.sel.d, 98);
  assert.equal(input.value, '2026-04-09');
});
