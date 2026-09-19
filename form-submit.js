/*
 * Shared by the Contact and Invest form pages: sends a form to the Google Apps Script web app
 * (which appends a row to the Google Sheet) and turns every way that can fail into a clear message.
 *
 * The web app address lives HERE ONLY. Editing the Apps Script does not change it as long as you
 * redeploy as a "New version" of the existing deployment (a "New deployment" makes a new address).
 *
 * Each form needs: a .submit-button, and a <p class="form-error" role="alert" hidden></p> inside the <form>.
 * Usage:  const outcome = await sendForm(form, { formType: 'contact', name: '...', ... });
 *         if (outcome.ok) showThankYou(form);   // showThankYou() is in thank-you.js
 */
var SHEET_URL = 'https://script.google.com/macros/s/AKfycbyZAc5-LouC4Ol6M1vs78YmJ__SivZTjeXhlHKa6oRNMB9LNR4mzt11KXNRA4xfQ95Tyg/exec';

var FORM_ERRORS = {
  // Google answered, but said it could not save the entry.
  rejected: "Something went wrong on our end. Please try again in a moment.",
  // No answer, or an answer we couldn't read. The entry may or may not have been saved,
  // so we say that honestly instead of showing a technical error.
  unconfirmed: "We couldn't confirm that your submission went through. Please wait a minute and try again. " +
               "If you've already tried, we may have received it."
};

async function submitToSheet(fields) {
  var response;
  try {
    response = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // form-style body avoids a CORS preflight
      body: new URLSearchParams(fields)
    });
  } catch (err) {
    console.error('Form submission: network error', err);
    return { ok: false, message: FORM_ERRORS.unconfirmed };
  }

  var text = await response.text();
  var result;
  try {
    result = JSON.parse(text);
  } catch (err) {
    // Usually a Google error page (HTML) instead of data. Keep a trace for debugging.
    console.error('Form submission: unreadable response', response.status, text.slice(0, 200));
    return { ok: false, message: FORM_ERRORS.unconfirmed };
  }

  if (result && result.result === 'success') return { ok: true };
  console.error('Form submission: rejected by the server', result);
  return { ok: false, message: FORM_ERRORS.rejected };
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
  button.classList.add('is-sending'); // shows the spinner (style.css)

  var outcome = await submitToSheet(fields);

  if (!outcome.ok) { // keep everything the visitor typed and let them retry
    errorEl.textContent = outcome.message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ block: 'nearest' }); // don't leave it below the fold (the modal hides its scrollbar)
    button.disabled = false;
    button.textContent = label;
    button.classList.remove('is-sending');
  }
  return outcome;
}
