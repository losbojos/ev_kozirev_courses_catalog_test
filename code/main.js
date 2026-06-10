(function () {
  "use strict";

  const COURSES_URL = "data/courses.json";
  const CARD_TEMPLATE_ID = "card-template";
  const CARDS_PORTION = 6;  // количество карточек в порции\странице загрузки

  /** Порядок категорий в фильтре */
  const CATEGORY_ORDER = [
    "marketing",
    "management",
    "hr",
    "design",
    "development",
  ];

  const cardTemplate = document.getElementById(CARD_TEMPLATE_ID);

  const state = {
    activeCategory: "all",
    searchQuery: "",
    visibleCount: CARDS_PORTION,
  };

  const elements = {
    grid: document.querySelector(".catalog__grid"),
    empty: document.querySelector(".catalog__empty"),
    filters: document.querySelector(".filters"),
    searchInput: document.querySelector(".search__input"),
    loadMore: document.querySelector(".next"),
    loadMoreButton: document.querySelector(".next__button"),
  };

  let courses = [];
  /** @type {{ id: string, label: string }[]} */
  let categories = [];
  /** @type {Record<string, number>} */
  let courseCounts = {};

  /**
   * @param {Course | CourseData} course
   */
  function createCardElement(course) {
    const cardData = course instanceof Course ? course : Course.fromJSON(course);
    const cardElem = cardTemplate.content.querySelector(".card").cloneNode(true);

    cardElem.dataset.id = cardData.id; // data-id
    cardElem.dataset.category = cardData.category; // data-category

    const image = cardElem.querySelector(".card__image");
    image.src = cardData.imageUrl;

    const category = cardElem.querySelector(".card__category");
    category.className = "card__category card__category_" + cardData.categoryModifier;
    category.textContent = cardData.categoryLabel;

    cardElem.querySelector(".card__title").textContent = cardData.title;
    cardElem.querySelector(".card__price").textContent = cardData.formattedPrice;
    cardElem.querySelector(".card__speaker").textContent = cardData.formattedSpeaker;

    return cardElem;
  }

  function normalizeText(text) {
    return text.toLowerCase().trim();
  }

  /**
   * @param {Course[]} list
   * @returns {{ id: string, label: string }[]}
   */
  function buildCategories(list) {
    const labelById = new Map();

    list.forEach(function (course) {
      if (!labelById.has(course.category)) {
        labelById.set(course.category, course.categoryLabel);
      }
    });

    const result = [{ id: "all", label: "All" }];

    CATEGORY_ORDER.forEach(function (id) {
      if (labelById.has(id)) {
        result.push({ id: id, label: labelById.get(id) });
        labelById.delete(id);
      }
    });

    labelById.forEach(function (label, id) {
      result.push({ id: id, label: label });
    });

    return result;
  }

  /**
   * @param {Course[]} list
   * @returns {Record<string, number>}
   */
  function buildCourseCounts(list) {
    const counts = { all: list.length };

    list.forEach(function (course) {
      counts[course.category] = (counts[course.category] || 0) + 1;
    });

    return counts;
  }

  /**
   * @returns {Course[]}
   */
  function getFilteredCourses() {
    const query = normalizeText(state.searchQuery);

    return courses.filter(function (course) {
      const matchesSearch =
        !query || normalizeText(course.title).includes(query);
      const matchesCategory =
        state.activeCategory === "all" || course.category === state.activeCategory;

      return matchesSearch && matchesCategory;
    });
  }

  function clearCards() {
    elements.grid.querySelectorAll(".card").forEach(function (card) {
      card.remove();
    });
  }

  function toggleLoadMore(isVisible) {
    if (!elements.loadMore) {
      return;
    }

    elements.loadMore.classList.toggle("next_visible", isVisible);
  }

  function renderFilters() {
    if (!elements.filters) {
      return;
    }

    elements.filters.innerHTML = "";

    categories.forEach(function (category) {
      const button = document.createElement("button");
      const isActive = category.id === state.activeCategory;
      const count = courseCounts[category.id] || 0;

      const label = document.createElement("span");
      label.className = "filters__label";
      label.textContent = category.label;

      const countElem = document.createElement("span");
      countElem.className = "filters__count";
      countElem.textContent = String(count);

      button.type = "button";
      button.className = "filters__button";
      button.dataset.category = category.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("aria-label", category.label + " (" + count + ")");
      button.appendChild(label);
      button.appendChild(countElem);

      if (isActive) {
        button.classList.add("filters__button_active");
      }

      button.addEventListener("click", function () {
        state.activeCategory = category.id;
        state.visibleCount = CARDS_PORTION;
        renderFilters();
        renderCatalog();
      });

      elements.filters.appendChild(button);
    });
  }

  function renderCatalog() {
    const filteredCourses = getFilteredCourses();
    const isAllVisible = state.visibleCount >= filteredCourses.length;

    clearCards();

    if (filteredCourses.length === 0) {
      elements.empty.classList.add("catalog__empty_visible");
      toggleLoadMore(false);
      return;
    }

    elements.empty.classList.remove("catalog__empty_visible");

    const limit = Math.min(state.visibleCount, filteredCourses.length);

    for (let i = 0; i < limit; i++) {
      elements.grid.appendChild(createCardElement(filteredCourses[i]));
    }

    toggleLoadMore(!isAllVisible);
  }

  function handleSearchInput(event) {
    state.searchQuery = event.target.value;
    state.visibleCount = CARDS_PORTION;
    renderCatalog();
  }

  function loadCourses() {
    return fetch(COURSES_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load courses");
        }
        return response.json();
      })
      .then(function (data) {
        courses = Course.listFromJSON(data.courses);
        categories = buildCategories(courses);
        courseCounts = buildCourseCounts(courses);
        state.activeCategory = "all";
        state.searchQuery = "";
        state.visibleCount = CARDS_PORTION;
        renderFilters();
        renderCatalog();
      })
      .catch(function (error) {
        console.error(error);
        courses = [];
        categories = buildCategories(courses);
        courseCounts = buildCourseCounts(courses);
        state.activeCategory = "all";
        renderFilters();
        renderCatalog();
      });
  }

  if (elements.loadMoreButton) {
    elements.loadMoreButton.addEventListener("click", function () {
      state.visibleCount += CARDS_PORTION;
      renderCatalog();
    });
  }

  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", handleSearchInput);
  }

  loadCourses();
})();
