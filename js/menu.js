(function () {
  // Balance each 2-column category group by measured height (instead of
  // relying on CSS multi-column, which can leave one column much emptier
  // than the other once every <details> defaults to open). Only runs above
  // the 2-column breakpoint; below it, categories stay in plain DOM order.
  if (window.matchMedia("(min-width: 861px)").matches) {
    document.querySelectorAll(".menu-categories").forEach(function (group) {
      var items = Array.prototype.slice.call(group.children).map(function (el) {
        return { el: el, height: el.offsetHeight };
      });
      if (items.length < 2) return;

      var colA = document.createElement("div");
      var colB = document.createElement("div");
      colA.className = "menu-col";
      colB.className = "menu-col";
      var heightA = 0, heightB = 0;

      items.forEach(function (item) {
        if (heightA <= heightB) {
          colA.appendChild(item.el);
          heightA += item.height;
        } else {
          colB.appendChild(item.el);
          heightB += item.height;
        }
      });

      group.innerHTML = "";
      group.appendChild(colA);
      group.appendChild(colB);
      group.classList.add("js-balanced");
    });
  }

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
