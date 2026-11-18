// Tests du cycle de vie de présence, sans navigateur ni réseau externe.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const events = {};
const sent = [];
const intervals = [];
const formEvents = {};
let cleared = false;
let reset = false;
const next = { style: {}, setAttribute: () => {}, addEventListener: (name, fn) => { formEvents.next = fn; } };
const steps = Array.from({ length: 4 }, (_, index) => ({
  dataset: { title: 'Étape ' + (index + 1) }, classList: { toggle: () => {} },
  querySelectorAll: () => [], querySelector: () => ({ setAttribute: () => {}, focus: () => {} })
}));
const form = {
  querySelectorAll: () => steps,
  querySelector: selector => selector === '[data-next-step]' ? next : null,
  addEventListener: (name, fn) => { formEvents[name] = fn; },
  reset: () => { reset = true; }
};
const document = {
  visibilityState: 'visible',
  querySelector: selector => selector === '[data-project-form]' ? form : null,
  querySelectorAll: () => [],
  addEventListener: (name, fn) => { events[name] = fn; }
};
const context = {
  crypto: webcrypto, document, console, URLSearchParams, Blob, AbortSignal,
  window: { location: { hostname: 'localhost', search: '' }, SYNUMANUS_CONFIG: { projectEndpoint: '/api/project.php' },
    addEventListener: (name, fn) => { events[name] = fn; } },
  sessionStorage: { getItem: () => JSON.stringify({ token: 'a'.repeat(64) }), removeItem: () => { cleared = true; }, setItem: () => {} },
  FormData: class { *entries() {} },
  navigator: { sendBeacon: (_, body) => { sent.push(body.text().then(JSON.parse)); return true; } },
  fetch: async (_, options) => {
    if (_ === '/api/project.php') return { ok: true, json: async () => ({ ok: true, trackingToken: 'a'.repeat(64) }) };
    sent.push(Promise.resolve(JSON.parse(options.body)));
    return { ok: true, json: async () => ({ appointment_booked: false }) };
  },
  setInterval: (fn, delay) => { intervals.push({ fn, delay }); return intervals.length; },
  clearInterval: () => {}
};
(async () => {
  vm.runInNewContext(fs.readFileSync('src/static/project.js', 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(cleared, true);
  assert.equal(reset, true);
  assert.equal(form.hidden, false);
  assert.equal(intervals.length, 0);
  for (let i = 0; i < 3; i++) formEvents.next();
  await formEvents.submit({ preventDefault() {} });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(intervals[0].delay, 30000);
  events.pagehide();
  document.visibilityState = 'hidden';
  events.visibilitychange();
  intervals[0].fn();
  assert.deepEqual((await Promise.all(sent)).map(x => x.event), ['present', 'leave']);
  document.visibilityState = 'visible';
  events.pageshow();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual((await Promise.all(sent)).map(x => x.event), ['present', 'leave', 'present']);
  console.log('OK : actualisation réinitialisée, intervalle 30 s, aucun signal de présence après pagehide, reprise au retour.');
})().catch(error => { console.error(error); process.exitCode = 1; });
