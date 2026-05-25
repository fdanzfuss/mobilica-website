(function () {
  var contrastStorageKey = "mobilica-high-contrast";
  var textSizeStorageKey = "mobilica-text-size";
  var themeLink = document.getElementById("high-contrast-theme");
  var toggles = document.querySelectorAll(".theme-toggle");
  var textSizeButtons = document.querySelectorAll(".text-size-button");
  var textSizeStatuses = document.querySelectorAll(".text-size-status");
  var menuButton = document.querySelector(".menu-button");
  var primaryNav = document.getElementById("primary-nav");
  var readMoreButtons = document.querySelectorAll(".read-more-button");
  var textSizeSteps = ["small", "normal", "large", "larger", "largest"];
  var textSizeLabels = {
    small: "small",
    normal: "normal",
    large: "large",
    larger: "larger",
    largest: "largest"
  };

  function setHighContrast(enabled) {
    if (themeLink) {
      themeLink.disabled = !enabled;
    }

    document.documentElement.dataset.theme = enabled ? "high-contrast" : "default";

    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.title = enabled ? "Default theme" : "High contrast";
    });

    try {
      window.localStorage.setItem(contrastStorageKey, enabled ? "true" : "false");
    } catch (error) {
      // Browsers can block localStorage for local files; the toggle still works for this page view.
    }
  }

  function storedContrastPreference() {
    try {
      return window.localStorage.getItem(contrastStorageKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function storedTextSizePreference() {
    try {
      var stored = window.localStorage.getItem(textSizeStorageKey);
      return textSizeSteps.indexOf(stored) === -1 ? "normal" : stored;
    } catch (error) {
      return "normal";
    }
  }

  function setTextSize(size) {
    document.documentElement.dataset.textSize = size;

    textSizeButtons.forEach(function (button) {
      var action = button.dataset.textSize;
      button.disabled = (size === "small" && action === "decrease") || (size === "largest" && action === "increase");
      button.setAttribute("aria-label", (action === "increase" ? "Increase" : "Decrease") + " text size. Current text size is " + textSizeLabels[size]);
    });

    textSizeStatuses.forEach(function (status) {
      status.textContent = "Text size " + textSizeLabels[size];
    });

    try {
      window.localStorage.setItem(textSizeStorageKey, size);
    } catch (error) {
      // The setting still applies until the page is reloaded.
    }

    refreshReadMoreControls();
  }

  function adjustTextSize(action) {
    var current = document.documentElement.dataset.textSize || "normal";
    var currentIndex = textSizeSteps.indexOf(current);
    var nextIndex = action === "increase" ? currentIndex + 1 : currentIndex - 1;
    var nextSize = textSizeSteps[Math.max(0, Math.min(textSizeSteps.length - 1, nextIndex))];
    setTextSize(nextSize);
  }

  setHighContrast(storedContrastPreference());
  setTextSize(storedTextSizePreference());

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      setHighContrast(toggle.getAttribute("aria-pressed") !== "true");
    });
  });

  textSizeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      adjustTextSize(button.dataset.textSize);
    });
  });

  function refreshReadMoreControls() {
    readMoreButtons.forEach(function (button) {
      var description = document.getElementById(button.getAttribute("aria-controls"));
      if (!description) {
        return;
      }

      var wasExpanded = description.classList.contains("is-expanded");
      description.classList.remove("is-expanded");
      description.classList.remove("has-overflow");

      var hasOverflow = description.scrollHeight > description.clientHeight + 1;
      button.hidden = !hasOverflow;
      description.classList.toggle("has-overflow", hasOverflow);

      if (wasExpanded && hasOverflow) {
        description.classList.add("is-expanded");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "Show less";
      } else {
        button.setAttribute("aria-expanded", "false");
        button.textContent = "Read more";
      }
    });
  }

  readMoreButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var description = document.getElementById(button.getAttribute("aria-controls"));
      if (!description) {
        return;
      }

      var isExpanded = description.classList.toggle("is-expanded");
      button.setAttribute("aria-expanded", String(isExpanded));
      button.textContent = isExpanded ? "Show less" : "Read more";
    });
  });

  refreshReadMoreControls();

  window.addEventListener("resize", refreshReadMoreControls);

  if (menuButton && primaryNav) {
    function closeMenu() {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
      primaryNav.classList.remove("is-open");
    }

    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
        return;
      }

      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Close menu");
      primaryNav.classList.add("is-open");
    });

    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    });
  }
})();
