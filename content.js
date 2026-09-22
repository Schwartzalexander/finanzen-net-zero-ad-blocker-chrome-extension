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

  function getCloseTargets(notification) {
    const closeIcon = notification.querySelector('web-design-system-icon.close-icon[name="cross"], web-design-system-icon[name="cross"], .close-icon');
    const svg = closeIcon?.querySelector("svg");

    return uniqueElements([closeIcon, svg]);
  }

  function clickFirstWorkingTarget(targets) {
    for (const target of targets) {
      clickOnce(target);
    }
  }

  function closeNotification(notification) {
    clickFirstWorkingTarget(getCloseTargets(notification));
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

    const checkbox = notification.querySelector('input[type="checkbox"]');

    if (checkbox && !checkbox.checked) {
      clickFirstWorkingTarget(getCheckboxTargets(notification));
    }

    window.setTimeout(() => {
      closeNotification(notification);

      if (notification.isConnected) {
        window.setTimeout(() => processNotification(notification), 300);
      }
    }, 250);
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
