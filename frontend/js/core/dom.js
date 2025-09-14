// CSP-safe event delegation
export function delegate(eventType, selector, handler, root = document) {
  root.addEventListener(eventType, (e) => {
    const el = e.target.closest(selector);
    if (!el || !root.contains(el)) return;
    handler(e, el);
  });
}
