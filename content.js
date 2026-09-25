(function () {
  "use strict";

  const closeAttempts = new WeakMap();
  const maxCloseAttempts = 10;
  let processingTimer = null;

  function findNotifications(root) {
    const scope = root instanceof Element ? root : document;
    const candidates = [];

    if (scope.matches?.(".notification")) {
      candidates.push(scope);
    }

    candidates.push(...scope.querySelectorAll?.(".notification") || []);

    return candidates.filter((notification) => getCheckboxTargets(notification).length > 0 && getCloseTargets(notification).length > 0);
  }

  function clickOnce(element) {
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    element.click();
  }

  function uniqueElements(elements) {
    return [...new Set(elements.filter(Boolean))];
  }

  function getCheckboxTargets(notification) {
    const checkbox = notification.querySelector('web-design-system-checkbox[data-zid="user-note-checkbox"] input[type="checkbox"], input[type="checkbox"]');
    const customCheckbox = checkbox?.closest("web-design-system-checkbox");
    const label = checkbox?.closest("label");
    const labelText = [...notification.querySelectorAll("label, span")].find((element) => {
      return element.textContent?.trim().toLowerCase() === "nicht mehr anzeigen";
    });

    return uniqueElements([label, customCheckbox, checkbox, labelText]);
  }

  function getCheckbox(notification) {
    return notification.querySelector('web-design-system-checkbox[data-zid="user-note-checkbox"] input[type="checkbox"], input[type="checkbox"]');
  }

  function getCloseTargets(notification) {
    const closeIcon = notification.querySelector('web-design-system-icon.close-icon[name="cross"], web-design-system-icon[name="cross"], .close-icon');
    const svg = closeIcon?.querySelector("svg");

    return uniqueElements([closeIcon, svg]);
  }

  function clickPreferredTarget(targets) {
    if (targets[0]) {
      clickOnce(targets[0]);
    }
  }

  function setCheckboxChecked(checkbox) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");

    descriptor?.set?.call(checkbox, true);
    checkbox.dispatchEvent(new Event("input", { bubbles: true }));
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function ensureDoNotShowAgain(notification) {
    const checkbox = getCheckbox(notification);

    if (!checkbox || checkbox.checked) {
      return Boolean(checkbox?.checked);
    }

    clickPreferredTarget(getCheckboxTargets(notification));

    if (!checkbox.checked) {
      setCheckboxChecked(checkbox);
    }

    return checkbox.checked;
  }

  function closeNotification(notification) {
    clickPreferredTarget(getCloseTargets(notification));
  }

  function processNotification(notification) {
    if (!notification.isConnected) {
      return;
    }

    const attempts = closeAttempts.get(notification) || 0;

    if (attempts >= maxCloseAttempts) {
      return;
    }

    closeAttempts.set(notification, attempts + 1);

    const isDoNotShowAgainChecked = ensureDoNotShowAgain(notification);

    window.setTimeout(() => {
      if (!isDoNotShowAgainChecked && !ensureDoNotShowAgain(notification)) {
        window.setTimeout(() => processNotification(notification), 300);
        return;
      }

      closeNotification(notification);

      if (notification.isConnected) {
        window.setTimeout(() => processNotification(notification), 700);
      }
    }, 900);
  }

  function processNotifications(root) {
    for (const notification of findNotifications(root)) {
      processNotification(notification);
    }
  }

  function scheduleProcessing() {
    window.clearTimeout(processingTimer);
    processingTimer = window.setTimeout(() => processNotifications(document), 100);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          scheduleProcessing();
          return;
        }
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  processNotifications(document);
  window.addEventListener("load", scheduleProcessing, { once: true });
})();
