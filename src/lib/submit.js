import { monetisation } from '../config/monetisation';
import { load, save } from './storage';

/**
 * Form submission with a graceful fallback.
 * - If a form endpoint is configured (config → forms.endpoint), the data is
 *   POSTed there as JSON (works with Formspree, Getform, Basin, or your own API).
 * - If not, the submission is stored on the device and the caller is told,
 *   so the UI can be honest that no one has received it yet.
 * Returns { ok, delivered } where delivered=false means demo/local mode.
 */
export async function submitForm(kind, answers) {
  const endpoint = monetisation.forms.endpoint;
  const payload = { kind, ...answers, submittedAt: new Date().toISOString() };

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      return { ok: res.ok, delivered: res.ok };
    } catch {
      return { ok: false, delivered: false };
    }
  }

  const all = load('submissions', []);
  all.push(payload);
  save('submissions', all);
  return { ok: true, delivered: false };
}
