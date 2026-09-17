(function () {
  var filterBar = document.getElementById("menu-filters");
  var chips = document.querySelectorAll(".filter-chip");
  var cards = document.querySelectorAll(".dish-card");
  var categories = document.querySelectorAll(".menu-cat");
  var noResults = document.getElementById("no-results");
  if (!filterBar || !chips.length) return;

  // Filtering is a progressive enhancement: without JS every category is a
  // plain, fully accessible <details> accordion with all dishes visible.
  filterBar.hidden = false;

  var openedByFilter = [];

  function applyFilter(filter) {
    var visibleCount = 0;

    cards.forEach(function (card) {
      var spice = parseInt(card.dataset.spice || "0", 10);
      var isVeg = card.dataset.veg === "true";
      var show = true;

      if (filter === "veg") show = isVeg;
      else if (filter === "spicy") show = spice >= 2;
      else if (filter === "mild") show = spice === 0;

      card.hidden = !show;
      if (show) visibleCount++;
    });

    categories.forEach(function (cat) {
      var hasVisible = cat.querySelectorAll(".dish-card:not([hidden])").length > 0;
      cat.hidden = !hasVisible;

      if (filter === "all") {
        if (openedByFilter.indexOf(cat) !== -1) {
          cat.open = false;
          openedByFilter.splice(openedByFilter.indexOf(cat), 1);
        }
      } else if (hasVisible && !cat.open) {
        cat.open = true;
        openedByFilter.push(cat);
      }
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      applyFilter(chip.dataset.filter);
    });
  });
})();
