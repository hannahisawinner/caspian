/*
 * Shared by the Contact and Invest form pages (loaded before their own inline form scripts).
 * Swaps the form for the #confirmation block (logo + thank-you message, see .thank-you in style.css).
 * Inside the modal it also asks modal.js to fade out and close the modal after a few seconds.
 * Each page keeps its own message text inside its #confirmation markup.
 */
function showThankYou(form) {
  form.style.display = 'none';
  document.querySelector('.form-wrapper').classList.add('is-thankyou');
  document.getElementById('confirmation').hidden = false;
  if (window.self !== window.top) {
    setTimeout(function () {
      window.parent.postMessage({ type: 'site-modal:request-close' }, window.location.origin);
    }, 4500);
  }
}
