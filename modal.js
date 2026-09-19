/*
 * Opens the Contact and Invest forms in a modal on top of the current page.
 *
 * The forms themselves still live in /contact/ and /invest/ (their own pages, listed in the sitemap).
 * This script intercepts clicks on links to those two pages and shows the page inside an <iframe>
 * in a <dialog>. Without JavaScript, or when a link is opened in a new tab (Cmd/Ctrl-click), the
 * links simply navigate to the standalone page.
 *
 * While it is open the page gets a "site-modal:open" event, and "site-modal:close" when it closes
 * (the homepage carousel uses these to pause itself).
 *
 * To add another modal form: add its path to FORMS below and give that page the "embedded" styles
 * (see the .embedded rules in style.css and the tiny <head> script in contact/index.html).
 */
(function () {
  if (!window.HTMLDialogElement || typeof HTMLDialogElement.prototype.showModal !== "function") return;

  var FORMS = {
    "/invest/": "Invest with Caspian Capital",
    "/contact/": "Contact Caspian Capital"
  };

  var dialog, frame, observer;
  var currentPath = null;
  var pressStartedOnBackdrop = false;

  function build() {
    dialog = document.createElement("dialog");
    dialog.className = "site-modal";

    var close = document.createElement("button");
    close.type = "button";
    close.className = "site-modal-close";
    close.setAttribute("aria-label", "Close");
    close.innerHTML = "&times;";
    close.addEventListener("click", closeModal);

    frame = document.createElement("iframe");
    frame.className = "site-modal-frame";
    frame.addEventListener("load", onFrameLoad);

    dialog.appendChild(close);
    dialog.appendChild(frame);
    document.body.appendChild(dialog);

    // Click on the dimmed area outside the box closes it. Only counts if the press also
    // started there, so dragging a text selection out of the form doesn't close it by accident.
    dialog.addEventListener("mousedown", function (e) { pressStartedOnBackdrop = e.target === dialog; });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog && pressStartedOnBackdrop) closeModal();
    });
    dialog.addEventListener("close", unlockScroll); // also fires when Esc is pressed
  }

  // Keep the iframe exactly as tall as the form inside it (up to the window height).
  function fit() {
    var doc;
    try { doc = frame.contentDocument; } catch (e) { return; }
    if (!doc || !doc.body) return;
    var contentHeight = Math.ceil(doc.body.getBoundingClientRect().height);
    frame.style.height = Math.min(contentHeight, Math.floor(window.innerHeight * 0.92)) + "px";
  }

  function onFrameLoad() {
    var doc;
    try { doc = frame.contentDocument; } catch (e) { return; }
    if (!doc || !doc.body) return;
    fit();
    if (observer) observer.disconnect();
    if (window.ResizeObserver) {
      observer = new ResizeObserver(fit); // form grows/shrinks (e.g. the thank-you message)
      observer.observe(doc.body);
    }
    // On desktop, start typing straight away. Skipped on touch so the keyboard doesn't pop up.
    if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
      var first = doc.querySelector("input, select, textarea");
      if (first) first.focus();
    }
  }

  function lockScroll() {
    var root = document.documentElement;
    var scrollbar = window.innerWidth - root.clientWidth; // stops the page jumping sideways
    root.style.setProperty("--scrollbar-width", scrollbar + "px");
    root.classList.add("modal-open");
    document.dispatchEvent(new CustomEvent("site-modal:open")); // lets pages pause animations
  }

  function closeModal() {
    dialog.close();
    unlockScroll(); // don't rely only on the "close" event (Esc still goes through it)
  }

  function unlockScroll() {
    var root = document.documentElement;
    if (!root.classList.contains("modal-open")) return; // already unlocked (X and "close" event both call this)
    root.classList.remove("modal-open");
    document.dispatchEvent(new CustomEvent("site-modal:close"));
  }

  function wasSubmitted() {
    try {
      var thanks = frame.contentDocument.getElementById("confirmation");
      return !!thanks && thanks.style.display !== "none";
    } catch (e) { return false; }
  }

  function open(path) {
    if (!dialog) build();
    dialog.setAttribute("aria-label", FORMS[path]);
    frame.title = FORMS[path];
    // Re-opening the same form keeps what was typed (in case of an accidental click outside),
    // unless it was already submitted.
    if (currentPath !== path || wasSubmitted()) {
      frame.style.height = "";
      frame.src = path;
      currentPath = path;
    }
    lockScroll();
    dialog.showModal();
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    var url;
    try { url = new URL(link.href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;

    var path = url.pathname.replace(/index\.html$/, "");
    if (!FORMS[path]) return;

    e.preventDefault();
    if (typeof closeMenu === "function") closeMenu(); // the mobile menu overlay, if it is open
    open(path);
  });
})();
