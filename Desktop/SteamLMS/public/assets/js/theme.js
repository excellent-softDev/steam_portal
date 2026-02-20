"use strict";

var _excluded = ["endValue"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* -------------------------------------------------------------------------- */

/*                                    Utils                                   */

/* -------------------------------------------------------------------------- */
var docReady = function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    setTimeout(fn, 1);
  }
};

var isRTL = function isRTL() {
  return document.querySelector('html').getAttribute('dir') === 'rtl';
};

var resize = function resize(fn) {
  return window.addEventListener('resize', fn);
};
/*eslint consistent-return: */


var isIterableArray = function isIterableArray(array) {
  return Array.isArray(array) && !!array.length;
};

var camelize = function camelize(str) {
  if (str) {
    var text = str.replace(/[-_\s.]+(.)?/g, function (_, c) {
      return c ? c.toUpperCase() : '';
    });
    return "".concat(text.substr(0, 1).toLowerCase()).concat(text.substr(1));
  }
};

var getData = function getData(el, data) {
  try {
    return JSON.parse(el.dataset[camelize(data)]);
  } catch (e) {
    return el.dataset[camelize(data)];
  }
};
/* ----------------------------- Colors function ---------------------------- */


var hexToRgb = function hexToRgb(hexValue) {
  var hex;
  hexValue.indexOf('#') === 0 ? hex = hexValue.substring(1) : hex = hexValue; // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")

  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  }));
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

var rgbaColor = function rgbaColor() {
  var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#fff';
  var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
  return "rgba(".concat(hexToRgb(color), ", ").concat(alpha, ")");
};
/* --------------------------------- Colors --------------------------------- */


var getColor = function getColor(name) {
  var dom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.documentElement;
  return getComputedStyle(dom).getPropertyValue("--sparrow-".concat(name)).trim();
};

var getColors = function getColors(dom) {
  return {
    primary: getColor('primary', dom),
    secondary: getColor('secondary', dom),
    success: getColor('success', dom),
    info: getColor('info', dom),
    warning: getColor('warning', dom),
    danger: getColor('danger', dom),
    light: getColor('light', dom),
    dark: getColor('dark', dom)
  };
};

var getSoftColors = function getSoftColors(dom) {
  return {
    primary: getColor('soft-primary', dom),
    secondary: getColor('soft-secondary', dom),
    success: getColor('soft-success', dom),
    info: getColor('soft-info', dom),
    warning: getColor('soft-warning', dom),
    danger: getColor('soft-danger', dom),
    light: getColor('soft-light', dom),
    dark: getColor('soft-dark', dom)
  };
};

var getGrays = function getGrays(dom) {
  return {
    white: getColor('white', dom),
    100: getColor('100', dom),
    200: getColor('200', dom),
    300: getColor('300', dom),
    400: getColor('400', dom),
    500: getColor('500', dom),
    600: getColor('600', dom),
    700: getColor('700', dom),
    800: getColor('800', dom),
    900: getColor('900', dom),
    1000: getColor('1000', dom),
    1100: getColor('1100', dom),
    black: getColor('black', dom)
  };
};

var hasClass = function hasClass(el, className) {
  !el && false;
  return el.classList.value.includes(className);
};

var addClass = function addClass(el, className) {
  el.classList.add(className);
};

var getOffset = function getOffset(el) {
  var rect = el.getBoundingClientRect();
  var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft
  };
};

var isScrolledIntoView = function isScrolledIntoView(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    // eslint-disable-next-line no-param-reassign
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return {
    all: top >= window.pageYOffset && left >= window.pageXOffset && top + height <= window.pageYOffset + window.innerHeight && left + width <= window.pageXOffset + window.innerWidth,
    partial: top < window.pageYOffset + window.innerHeight && left < window.pageXOffset + window.innerWidth && top + height > window.pageYOffset && left + width > window.pageXOffset
  };
};

var isElementIntoView = function isElementIntoView(el) {
  var position = el.getBoundingClientRect(); // checking whether fully visible

  if (position.top >= 0 && position.bottom <= window.innerHeight) {
    return true;
  } // checking for partial visibility


  if (position.top < window.innerHeight && position.bottom >= 0) {
    return true;
  }
};

var breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

var getBreakpoint = function getBreakpoint(el) {
  var classes = el && el.classList.value;
  var breakpoint;

  if (classes) {
    breakpoint = breakpoints[classes.split(' ').filter(function (cls) {
      return cls.includes('navbar-expand-');
    }).pop().split('-').pop()];
  }

  return breakpoint;
};

var getCurrentScreenBreakpoint = function getCurrentScreenBreakpoint() {
  var currentBreakpoint = '';

  if (window.innerWidth >= breakpoints.xl) {
    currentBreakpoint = 'xl';
  } else if (window.innerWidth >= breakpoints.lg) {
    currentBreakpoint = 'lg';
  } else if (window.innerWidth >= breakpoints.md) {
    currentBreakpoint = 'md';
  } else {
    currentBreakpoint = 'sm';
  }

  var breakpointStartVal = breakpoints[currentBreakpoint];
  return {
    currentBreakpoint: currentBreakpoint,
    breakpointStartVal: breakpointStartVal
  };
};
/* --------------------------------- Cookie --------------------------------- */


var setCookie = function setCookie(name, value, expire) {
  var expires = new Date();
  expires.setTime(expires.getTime() + expire);
  document.cookie = "".concat(name, "=").concat(value, ";expires=").concat(expires.toUTCString());
};

var getCookie = function getCookie(name) {
  var keyValue = document.cookie.match("(^|;) ?".concat(name, "=([^;]*)(;|$)"));
  return keyValue ? keyValue[2] : keyValue;
};

var settings = {
  tinymce: {
    theme: 'oxide'
  },
  chart: {
    borderColor: 'rgba(255, 255, 255, 0.8)'
  }
};
/* -------------------------- Chart Initialization -------------------------- */

var newChart = function newChart(chart, config) {
  var ctx = chart.getContext('2d');
  return new window.Chart(ctx, config);
};
/* ---------------------------------- Store --------------------------------- */


var getItemFromStore = function getItemFromStore(key, defaultValue) {
  var store = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : localStorage;

  try {
    return JSON.parse(store.getItem(key)) || defaultValue;
  } catch (_unused) {
    return store.getItem(key) || defaultValue;
  }
};

var setItemToStore = function setItemToStore(key, payload) {
  var store = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : localStorage;
  return store.setItem(key, payload);
};

var getStoreSpace = function getStoreSpace() {
  var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : localStorage;
  return parseFloat((escape(encodeURIComponent(JSON.stringify(store))).length / (1024 * 1024)).toFixed(2));
};
/* get Dates between */


var getDates = function getDates(startDate, endDate) {
  var interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000 * 60 * 60 * 24;
  var duration = endDate - startDate;
  var steps = duration / interval;
  return Array.from({
    length: steps + 1
  }, function (v, i) {
    return new Date(startDate.valueOf() + interval * i);
  });
};

var getPastDates = function getPastDates(duration) {
  var days;

  switch (duration) {
    case 'week':
      days = 7;
      break;

    case 'month':
      days = 30;
      break;

    case 'year':
      days = 365;
      break;

    default:
      days = duration;
  }

  var date = new Date();
  var endDate = date;
  var startDate = new Date(new Date().setDate(date.getDate() - (days - 1)));
  return getDates(startDate, endDate);
};
/* Get Random Number */


var getRandomNumber = function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
};

var utils = {
  docReady: docReady,
  resize: resize,
  isIterableArray: isIterableArray,
  camelize: camelize,
  getData: getData,
  hasClass: hasClass,
  addClass: addClass,
  hexToRgb: hexToRgb,
  rgbaColor: rgbaColor,
  getColor: getColor,
  getColors: getColors,
  getSoftColors: getSoftColors,
  getGrays: getGrays,
  getOffset: getOffset,
  isScrolledIntoView: isScrolledIntoView,
  getBreakpoint: getBreakpoint,
  setCookie: setCookie,
  getCookie: getCookie,
  newChart: newChart,
  settings: settings,
  getItemFromStore: getItemFromStore,
  setItemToStore: setItemToStore,
  getStoreSpace: getStoreSpace,
  getDates: getDates,
  getPastDates: getPastDates,
  getRandomNumber: getRandomNumber,
  getCurrentScreenBreakpoint: getCurrentScreenBreakpoint,
  breakpoints: breakpoints,
  isElementIntoView: isElementIntoView,
  isRTL: isRTL
};
/* -------------------------------------------------------------------------- */

/*                                  Detector                                  */

/* -------------------------------------------------------------------------- */

var detectorInit = function detectorInit() {
  var _window = window,
      is = _window.is;
  var html = document.querySelector('html');
  is.opera() && addClass(html, 'opera');
  is.mobile() && addClass(html, 'mobile');
  is.firefox() && addClass(html, 'firefox');
  is.safari() && addClass(html, 'safari');
  is.ios() && addClass(html, 'ios');
  is.iphone() && addClass(html, 'iphone');
  is.ipad() && addClass(html, 'ipad');
  is.ie() && addClass(html, 'ie');
  is.edge() && addClass(html, 'edge');
  is.chrome() && addClass(html, 'chrome');
  is.mac() && addClass(html, 'osx');
  is.windows() && addClass(html, 'windows');
  navigator.userAgent.match('CriOS') && addClass(html, 'chrome');
};
/*-----------------------------------------------
|   DomNode
-----------------------------------------------*/


var DomNode = /*#__PURE__*/function () {
  function DomNode(node) {
    _classCallCheck(this, DomNode);

    this.node = node;
  }

  _createClass(DomNode, [{
    key: "addClass",
    value: function addClass(className) {
      this.isValidNode() && this.node.classList.add(className);
    }
  }, {
    key: "removeClass",
    value: function removeClass(className) {
      this.isValidNode() && this.node.classList.remove(className);
    }
  }, {
    key: "toggleClass",
    value: function toggleClass(className) {
      this.isValidNode() && this.node.classList.toggle(className);
    }
  }, {
    key: "hasClass",
    value: function hasClass(className) {
      this.isValidNode() && this.node.classList.contains(className);
    }
  }, {
    key: "data",
    value: function data(key) {
      if (this.isValidNode()) {
        try {
          return JSON.parse(this.node.dataset[this.camelize(key)]);
        } catch (e) {
          return this.node.dataset[this.camelize(key)];
        }
      }

      return null;
    }
  }, {
    key: "attr",
    value: function attr(name) {
      return this.isValidNode() && this.node[name];
    }
  }, {
    key: "setAttribute",
    value: function setAttribute(name, value) {
      this.isValidNode() && this.node.setAttribute(name, value);
    }
  }, {
    key: "removeAttribute",
    value: function removeAttribute(name) {
      this.isValidNode() && this.node.removeAttribute(name);
    }
  }, {
    key: "setProp",
    value: function setProp(name, value) {
      this.isValidNode() && (this.node[name] = value);
    }
  }, {
    key: "on",
    value: function on(event, cb) {
      this.isValidNode() && this.node.addEventListener(event, cb);
    }
  }, {
    key: "isValidNode",
    value: function isValidNode() {
      return !!this.node;
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "camelize",
    value: function camelize(str) {
      var text = str.replace(/[-_\s.]+(.)?/g, function (_, c) {
        return c ? c.toUpperCase() : '';
      });
      return "".concat(text.substr(0, 1).toLowerCase()).concat(text.substr(1));
    }
  }]);

  return DomNode;
}(); // import utils from './utils';

/* -------------------------------------------------------------------------- */

/*                                Carousel                                 */

/* -------------------------------------------------------------------------- */


var carouselInit = function carouselInit() {
  var heroCarousel = document.getElementById('hero-carousel');
  var counterEl = document.getElementById('heroSlidercounter');
  heroCarousel.addEventListener('slide.bs.carousel', function (e) {
    var count = "0".concat(e.to + 1);
    counterEl.innerHTML = count;
  });
};
/* -------------------------------------------------------------------------- */

/*                                  Count Up                                  */

/* -------------------------------------------------------------------------- */


var countupInit = function countupInit() {
  if (window.countUp) {
    var countups = document.querySelectorAll('[data-countup]');
    countups.forEach(function (node) {
      var _utils$getData = utils.getData(node, 'countup'),
          endValue = _utils$getData.endValue,
          options = _objectWithoutProperties(_utils$getData, _excluded);

      var countUp = new window.countUp.CountUp(node, endValue, _objectSpread({
        duration: 5
      }, options));

      if (!countUp.error) {
        countUp.start();
      } else {
        console.error(countUp.error);
      }
    });
  }
}; // Course Filtering Functionality

/* eslint-disable no-use-before-define, no-param-reassign, no-unused-vars */


document.addEventListener('DOMContentLoaded', function () {
  var filterCheckboxes = document.querySelectorAll('.form-check-input');
  var courseCards = document.querySelectorAll('.course-card'); // Add change event listeners to all filter checkboxes

  filterCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', filterCourses);
  });

  function filterCourses() {
    var activeFilters = getActiveFilters();
    courseCards.forEach(function (card) {
      if (matchesFilters(card, activeFilters)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    updateCourseCount();
  }

  function getActiveFilters() {
    var filters = {
      categories: [],
      gradeLevels: [],
      formats: [],
      difficulties: [],
      prices: []
    }; // Category filters

    if (document.getElementById('cat-math').checked) filters.categories.push('mathematics');
    if (document.getElementById('cat-science').checked) filters.categories.push('science');
    if (document.getElementById('cat-arts').checked) filters.categories.push('arts');
    if (document.getElementById('cat-language').checked) filters.categories.push('language');
    if (document.getElementById('cat-tech').checked) filters.categories.push('technology'); // Grade level filters

    if (document.getElementById('grade-elementary').checked) filters.gradeLevels.push('elementary');
    if (document.getElementById('grade-middle').checked) filters.gradeLevels.push('middle');
    if (document.getElementById('grade-high').checked) filters.gradeLevels.push('high');
    if (document.getElementById('grade-college').checked) filters.gradeLevels.push('college'); // Format filters

    if (document.getElementById('format-video').checked) filters.formats.push('video');
    if (document.getElementById('format-interactive').checked) filters.formats.push('interactive');
    if (document.getElementById('format-live').checked) filters.formats.push('live'); // Difficulty filters

    if (document.getElementById('diff-beginner').checked) filters.difficulties.push('beginner');
    if (document.getElementById('diff-intermediate').checked) filters.difficulties.push('intermediate');
    if (document.getElementById('diff-advanced').checked) filters.difficulties.push('advanced'); // Price filters

    if (document.getElementById('price-free').checked) filters.prices.push('free');
    if (document.getElementById('price-paid').checked) filters.prices.push('paid');
    return filters;
  }

  function matchesFilters(card, filters) {
    // This is a simplified matching logic
    // In a real application, you would have data attributes on the cards
    // or fetch course data from an API
    var matches = true; // For demo purposes, we'll show all cards if any filter is active

    var hasActiveFilters = Object.values(filters).some(function (arr) {
      return arr.length > 0;
    });

    if (!hasActiveFilters) {
      return true; // Show all if no filters are active
    } // In a real implementation, you would check against course data attributes
    // For now, we'll randomly show/hide for demonstration


    return Math.random() > 0.3;
  }

  function updateCourseCount() {
    var visibleCards = Array.from(courseCards).filter(function (card) {
      return card.style.display !== 'none';
    });
    var countElement = document.querySelector('.text-muted');

    if (countElement && countElement.textContent.includes('Showing')) {
      countElement.textContent = "Showing ".concat(visibleCards.length, " of ").concat(courseCards.length, " courses");
    }
  } // Apply Filters button functionality


  var applyFiltersBtn = document.querySelector('.btn-primary.w-100');

  if (applyFiltersBtn && applyFiltersBtn.textContent.includes('Apply Filters')) {
    applyFiltersBtn.addEventListener('click', function () {
      filterCourses(); // Scroll to top of course grid

      var courseGrid = document.querySelector('.row.g-4');

      if (courseGrid) {
        courseGrid.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  } // Sort functionality


  var sortSelect = document.querySelector('.form-select');

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortCourses(this.value);
    });
  }

  function sortCourses(sortBy) {
    var courseGrid = document.querySelector('.row.g-4');
    if (!courseGrid) return;
    var cards = Array.from(courseGrid.querySelectorAll('.col-md-6, .col-lg-4'));
    cards.sort(function () {
      // This is a simplified sort - in real implementation, you would sort based on actual data
      switch (sortBy) {
        case 'Most Popular':
          return Math.random() - 0.5;

        case 'Newest First':
          return Math.random() - 0.5;

        case 'Price: Low to High':
          return Math.random() - 0.5;

        case 'Price: High to Low':
          return Math.random() - 0.5;

        case 'Rating: High to Low':
          return Math.random() - 0.5;

        default:
          return 0;
      }
    }); // Re-append sorted cards

    cards.forEach(function (card) {
      return courseGrid.appendChild(card);
    });
  }
}); // import utils from './utils';

/* -------------------------------------------------------------------------- */

/*                                  Hero header                                  */

/* -------------------------------------------------------------------------- */

var heroHeaderInit = function heroHeaderInit() {
  var topNav = document.getElementById('topNav');
  var heroCarouselInner = document.getElementById('hero-carousel');
  var heroCarouselContainer = document.getElementById('heroCarouselContainer');
  var heroSlidercounterContainer = document.getElementById('heroSlidercounterContainer');

  var setCarouselContainerMargin = function setCarouselContainerMargin() {
    heroCarouselContainer.style.paddingLeft = getComputedStyle(topNav).marginLeft;
  };

  var setHeroCarouselInnerheight = function setHeroCarouselInnerheight() {
    heroSlidercounterContainer.style.height = getComputedStyle(heroCarouselInner).height;
  };

  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) {
      setCarouselContainerMargin();
      setHeroCarouselInnerheight();
    }
  });
  setTimeout(function () {
    window.dispatchEvent(new Event('resize'));
  }, 5);
}; // Search Functionality for Courses

/* eslint-disable no-use-before-define */

/* global bootstrap */


document.addEventListener('DOMContentLoaded', function () {
  var searchModal = document.getElementById('searchModal');
  var searchInput = searchModal ? searchModal.querySelector('input[type="text"]') : null;
  var searchButton = searchModal ? searchModal.querySelector('button[type="submit"]') : null;
  var topSearchInput = document.querySelector('#formGroupExampleInput'); // Course data (in real app, this would come from API)

  var courses = [{
    title: 'Introduction to Algebra',
    category: 'mathematics',
    gradeLevel: 'middle',
    description: 'Learn the fundamentals of algebraic thinking',
    price: 'free',
    rating: 4.8
  }, {
    title: 'Biology: Life Sciences',
    category: 'science',
    gradeLevel: 'high',
    description: 'Explore the fascinating world of living organisms',
    price: 'paid',
    rating: 4.6
  }, {
    title: 'Digital Art Fundamentals',
    category: 'arts',
    gradeLevel: 'high',
    description: 'Master the basics of digital illustration',
    price: 'free',
    rating: 4.9
  }, {
    title: 'Creative Writing Workshop',
    category: 'language',
    gradeLevel: 'high',
    description: 'Develop your writing skills through exercises',
    price: 'free',
    rating: 4.7
  }, {
    title: 'Introduction to Coding',
    category: 'technology',
    gradeLevel: 'middle',
    description: 'Learn programming fundamentals with projects',
    price: 'paid',
    rating: 4.9
  }]; // Search functionality

  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  if (topSearchInput) {
    topSearchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        performTopSearch();
      }
    });
  }

  function performSearch() {
    var query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    var results = searchCourses(query);
    displaySearchResults(results, query); // Close modal and redirect to courses page with results

    if (searchModal) {
      var modal = bootstrap.Modal.getInstance(searchModal);
      if (modal) modal.hide();
    } // Redirect to courses page with search parameter


    window.location.href = "courses.html?search=".concat(encodeURIComponent(query));
  }

  function performTopSearch() {
    var query = topSearchInput.value.trim().toLowerCase();
    if (!query) return;
    window.location.href = "courses.html?search=".concat(encodeURIComponent(query));
  }

  function searchCourses(query) {
    return courses.filter(function (course) {
      return course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query) || course.category.toLowerCase().includes(query);
    });
  }

  function displaySearchResults(results, query) {
    console.log("Search results for \"".concat(query, "\":"), results); // In a real implementation, this would update the UI
  } // Popular search tags


  var popularTags = document.querySelectorAll('.badge.bg-light');
  popularTags.forEach(function (tag) {
    tag.addEventListener('click', function handleTagClick() {
      var searchTerm = this.textContent.trim();

      if (searchInput) {
        searchInput.value = searchTerm;
        performSearch();
      }
    });
  }); // Category badges in search modal

  var categoryBadges = document.querySelectorAll('.badge.bg-primary, .badge.bg-info, .badge.bg-danger, .badge.bg-success, .badge.bg-dark');
  categoryBadges.forEach(function (badge) {
    badge.addEventListener('click', function handleBadgeClick(e) {
      e.preventDefault();
      var category = this.textContent.trim();

      if (searchInput) {
        searchInput.value = category;
        performSearch();
      }
    });
  }); // URL parameter handling for search

  function handleSearchParameters() {
    var urlParams = new URLSearchParams(window.location.search);
    var searchQuery = urlParams.get('search');
    var category = urlParams.get('category');
    var grade = urlParams.get('grade');

    if (searchQuery && searchInput) {
      searchInput.value = searchQuery;
      performSearch();
    }

    if (category) {
      // Auto-select category filter
      var categoryCheckbox = document.getElementById("cat-".concat(category.toLowerCase()));

      if (categoryCheckbox) {
        categoryCheckbox.checked = true; // Trigger filter update

        var event = new Event('change');
        categoryCheckbox.dispatchEvent(event);
      }
    }

    if (grade) {
      // Auto-select grade filter
      var gradeCheckbox = document.getElementById("grade-".concat(grade.toLowerCase()));

      if (gradeCheckbox) {
        gradeCheckbox.checked = true; // Trigger filter update

        var _event = new Event('change');

        gradeCheckbox.dispatchEvent(_event);
      }
    }
  } // Initialize search parameters if on courses page


  if (window.location.pathname.includes('courses.html')) {
    handleSearchParameters();
  } // Auto-suggestions (simplified version)


  if (searchInput) {
    searchInput.addEventListener('input', function handleSearchInput() {
      var query = this.value.trim().toLowerCase();

      if (query.length > 2) {
        // In a real implementation, this would show a dropdown with suggestions
        console.log('Auto-suggestions for:', query);
      }
    });
  }
});
/*-----------------------------------------------
|  Swiper
-----------------------------------------------*/

var swiperInit = function swiperInit() {
  var swipers = document.querySelectorAll('[data-swiper]');
  swipers.forEach(function (swiper) {
    var options = utils.getData(swiper, 'swiper');
    var thumbsOptions = options.thumb;
    var thumbsInit;

    if (thumbsOptions) {
      var thumbImages = swiper.querySelectorAll('img');
      var slides = '';
      thumbImages.forEach(function (img) {
        slides += "\n          <div class='swiper-slide '>\n            <img class='img-fluid rounded mt-1' src=".concat(img.src, " alt=''/>\n          </div>\n        ");
      });
      var thumbs = document.createElement('div');
      thumbs.setAttribute('class', 'swiper-container thumb');
      thumbs.innerHTML = "<div class='swiper-wrapper'>".concat(slides, "</div>");

      if (thumbsOptions.parent) {
        var parent = document.querySelector(thumbsOptions.parent);
        parent.parentNode.appendChild(thumbs);
      } else {
        swiper.parentNode.appendChild(thumbs);
      }

      thumbsInit = new window.Swiper(thumbs, thumbsOptions);
    } // const swiperNav = swiper.querySelector('.swiper-nav');


    return new window.Swiper(swiper, _objectSpread(_objectSpread({}, options), {}, {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      thumbs: {
        swiper: thumbsInit
      }
    }));
  });
};
/* -------------------------------------------------------------------------- */

/*                            Theme Initialization                            */

/* -------------------------------------------------------------------------- */


docReady(detectorInit);
docReady(countupInit);
docReady(swiperInit);
docReady(carouselInit);
docReady(heroHeaderInit);
//# sourceMappingURL=theme.js.map
