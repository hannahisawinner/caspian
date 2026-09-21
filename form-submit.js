/*
 * Shared by the Contact and Invest form pages: sends a form to the Google Apps Script web app
 * (which appends a row to the Google Sheet) and turns every way that can fail into a clear message.
 *
 * The web app address lives HERE ONLY. Editing the Apps Script does not change it as long as you
 * redeploy as a "New version" of the existing deployment (a "New deployment" makes a new address).
 *
 * Each form needs: a .submit-button, a <p class="form-error" role="alert" hidden></p>, and the hidden
 * honeypot <div class="hp-field"> (copy it from contact/index.html) inside the <form>.
 * Usage:  const outcome = await sendForm(form, { formType: 'contact', name: '...', ... });
 *         if (outcome.ok) showThankYou(form);   // showThankYou() is in thank-you.js
 */
var SHEET_URL = 'https://script.google.com/macros/s/AKfycbyZAc5-LouC4Ol6M1vs78YmJ__SivZTjeXhlHKa6oRNMB9LNR4mzt11KXNRA4xfQ95Tyg/exec';

// Spam signals sent along with every submission (checked by the Apps Script, see PRIVATE-NOTES.md):
//  - "website": a hidden field real visitors never see or fill; bots that fill every input give themselves away
//  - "elapsed": seconds between the page loading and the click; bots submit instantly
var PAGE_LOADED_AT = Date.now();

var FORM_ERRORS = {
  // Google answered, but said it could not save the entry.
  rejected: "Something went wrong on our end. Please try again in a moment.",
  // No answer, or an answer we couldn't read. The entry may or may not have been saved,
  // so we say that honestly instead of showing a technical error.
  unconfirmed: "We couldn't confirm that your submission went through. Please wait a minute and try again. " +
               "If you've already tried, we may have received it."
};

// Google's reply step is flaky (roughly 1 in 5 requests answer with an HTML error page even though the
// entry WAS saved). So when we can't read the reply we quietly try once more.
// !! This is only safe because the Apps Script ignores an identical submission seen within 10 minutes
// !! (see apps-script/Code.gs, "Exact repeat"). If that check is ever removed, remove the retry too,
// !! or every flaky reply will create a duplicate row.
var SUBMIT_TIMEOUT_MS = 20000; // give up on one attempt after this long
var RETRY_DELAY_MS = 1500;

// One attempt. Returns { ok: true } or { ok: false, retryable: boolean, message }.
async function attemptSubmit(fields) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, SUBMIT_TIMEOUT_MS);
  var text, status;
  try {
    var response = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // form-style body avoids a CORS preflight
      body: new URLSearchParams(fields),
      signal: controller.signal
    });
    status = response.status;
    text = await response.text();
  } catch (err) {
    console.error('Form submission: no reply (network error or timeout)', err);
    return { ok: false, retryable: true, message: FORM_ERRORS.unconfirmed };
  } finally {
    clearTimeout(timer);
  }

  var result;
  try {
    result = JSON.parse(text);
  } catch (err) {
    // Usually a Google error page (HTML) instead of data. Keep a trace for debugging.
    console.error('Form submission: unreadable response', status, text.slice(0, 200));
    return { ok: false, retryable: true, message: FORM_ERRORS.unconfirmed };
  }

  if (result && result.result === 'success') return { ok: true };
  console.error('Form submission: rejected by the server', result);
  return { ok: false, retryable: false, message: FORM_ERRORS.rejected }; // Google answered "error": retrying won't help
}

async function submitToSheet(fields) {
  var outcome = await attemptSubmit(fields);
  if (!outcome.ok && outcome.retryable) {
    await new Promise(function (resolve) { setTimeout(resolve, RETRY_DELAY_MS); });
    outcome = await attemptSubmit(fields);
  }
  return outcome;
}

async function sendForm(form, fields) {
  var button = form.querySelector('.submit-button');
  var errorEl = form.querySelector('.form-error');
  if (button.disabled) return { ok: false }; // already sending: ignore a double-click

  var label = button.textContent;
  errorEl.hidden = true;
  errorEl.textContent = '';
  button.disabled = true;
  button.textContent = 'Sending…';

  var honeypot = form.querySelector('.hp-field input');
  fields = Object.assign({}, fields, {
    website: honeypot ? honeypot.value : '',
    elapsed: ((Date.now() - PAGE_LOADED_AT) / 1000).toFixed(1)
  });

  var outcome = await submitToSheet(fields);

  if (!outcome.ok) { // keep everything the visitor typed and let them retry
    errorEl.textContent = outcome.message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ block: 'nearest' }); // don't leave it below the fold (the modal hides its scrollbar)
    button.disabled = false;
    button.textContent = label;
  }
  return outcome;
}
