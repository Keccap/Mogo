;(function(global, window, document, undefined) {
  'use strict';




  const scrollFast = new SmoothScroll('a[href^="#"]', { speed: 1000, easing: 'easeInOutQuad' });

  class HiddenMenu {
    constructor({ menuElement, buttonElement, openTransition = 0, callbackOn, callbackOff }) {
      this._menu = menuElement;
      this._button = buttonElement;
      this._transition = openTransition;
      this._callbackOn = callbackOn;
      this._callbackOff = callbackOff;
      this._open = false;

      this.init();
    }

    init() {
      this._button.addEventListener('mousedown', this._toggleMenu.bind(this));
    }

    _toggleMenu() {
      if (!this._open) {
        this._button.classList.add('is-active');
        this._menu.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollWidth() + 'px';

        setTimeout(() => {
          if (this._open) this._menu.classList.add('is-complete');
        }, this._transition);

        if (typeof this._callbackOn === 'function') this._callbackOn.call(null, this._menu, this._button);

        this._open = true;
      } else {
        this._button.classList.remove('is-active');
        this._menu.classList.remove('is-active', 'is-complete');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        if (typeof this._callbackOff === 'function') this._callbackOff.call(null, this._menu, this._button);

        this._open = false;
      }
    }
  }

  const menuLinks = [...document.querySelectorAll('.hide-menu__navigation .navigation__item')];
  let transition = 0;
  menuLinks.forEach(link => {
    link.style['transition-delay'] = transition + 'ms';
    transition += 100;
  });

  void new HiddenMenu({
    menuElement: document.querySelector('#hide-menu'),
    buttonElement: document.querySelector('.hamburger'),
    openTransition: 300,

    callbackOn(menu, button) {
      const header = document.querySelector('.header');
      header.classList.add('no-bg');
      header.style.paddingRight = getScrollWidth() + 'px';
    },

    callbackOff() {
      const header = document.querySelector('.header');
      header.classList.remove('no-bg');
      header.style.paddingRight = '';
    }
  });





  class SyncHeight {
    constructor(selector) {
      this._selector = selector;
      this._elements = null;
      this._maxHeight = null;

      this.init();
    }

    init() {
      this._elements = [...document.querySelectorAll(this._selector)];
      this._calculateMaxHeight();
      this._setHeight();
      this._lazyloadFix(this._elements[0].parentNode);

      window.addEventListener('resize', this._resize.apply(this));
    }

    _calculateMaxHeight() {
      this._maxHeight = 0;
      this._elements.forEach(element => {
        this._resetHeight(element);
        this._maxHeight = Math.max(this._maxHeight, element.offsetHeight);
      });
    }

    _setHeight() {
      this._elements.forEach(element => {
        element.style.height = this._maxHeight + 'px';
      });
    }

    _resetHeight(element) {
      element.style.height = '';
      element.style.minHeight = '';
    };

    _resize() {
      return throttle(() => {
        this._calculateMaxHeight();
        this._setHeight();
      }, 100);
    }

    _lazyloadFix(element) {
      const lazyimg = [...element.querySelectorAll('.lazyload')];
      if (lazyimg === null) {
        return;
      }
      lazyimg.forEach(img => {
        img.addEventListener('load', function () {
          window.dispatchEvent(new Event('resize'));
        });
      });
    }
  }

  const companySyncHeight = new SyncHeight('.company');


  class SwiperOnMaxElements {
    constructor({selector, maxElements, containerClassName = '', options = null}) {
      this._selector = selector;
      this._maxElements = maxElements;
      this._containerClassName = containerClassName;
      this._options = options;

      this.init();
    }

    init() {
      this._elements = [...document.querySelectorAll(this._selector)];

      if (this._elements.length > this._maxElements) {
        const parent = this._elements[0].parentNode;
        const container = document.createElement('div');
        const wrapper = document.createElement('div');

        container.appendChild(wrapper);
        container.className = `swiper-container ${this._containerClassName}`;
        wrapper.className = 'swiper-wrapper';

        this._elements.forEach(element => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          slide.appendChild(element);
          wrapper.appendChild(slide);
        });

        parent.appendChild(container);
        this.swiperInit();
      }
    }

    swiperInit() {
      const options = this._options;
      options.slidesPerView = options.slidesPerView || this._maxElements;
      const companiesCarousel = new Swiper('.' + this._containerClassName, options);
    }
  }

  const companiesCarousel = new SwiperOnMaxElements({
    selector: '.company',
    maxElements: 6,
    containerClassName: 'companies-carousel',
    options: {
      speed: 650,
      breakpoints: {
        320: {
          slidesPerView: 2,
          spaceBetween: 10
        },
        480: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        650: {
          slidesPerView: 4,
          spaceBetween: 30
        },
        850: {
          slidesPerView: 5,
          spaceBetween: 30
        }
      }
    }
  });


  const reviewsCarousel = new Swiper('.reviews-carousel', {
    loop: true,
    speed: 650,
    autoplay: {
      delay: 6000,
      disableOnInteraction: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  });

  class Tabs {
    constructor({ tabSelector, targetSelector, contentSelector, scrollbar = null, scrollbarOptions = null, tabHeightTransition = 550 }) {
      this._tabs = null;
      this._tabSelector = tabSelector;
      this._targetSelector = targetSelector;
      this._contentSelector = contentSelector;
      this._contentElements = [];
      this._scrollbar = scrollbar;
      this._scrollbarOptions = scrollbarOptions;
      this._tabHeightTransition = tabHeightTransition;

      this.init();
    }

    init() {
      this._tabs = [...document.querySelectorAll(this._tabSelector)];
      this._tabs.forEach(tab => {
        const target = tab.querySelector(this._targetSelector);
        const content = tab.querySelector(this._contentSelector);
        const scrollzone = document.createElement('div');
        scrollzone.className = 'scrollzone';

        this._contentElements.push({content, scrollzone});

        target.addEventListener('click', this._handleClickToHeader.bind(this));
      });

      this._initScrollzone();

      window.addEventListener('resize', this.resize.apply(this));
    }

    _handleClickToHeader(event) {
      this._tabs.forEach(el => el.classList.remove('is-active'));
      const tab = event.target.closest(this._tabSelector);
      tab.classList.add('is-active');
      setTimeout(this.resize.bind(this, tab), this._tabHeightTransition);
    }

    _initScrollzone() {
      this._contentElements.forEach(({content, scrollzone}) => {
        scrollzone.innerHTML = content.innerHTML;
        this._calculateScrollzone(content, scrollzone);
        content.innerHTML = '';
        if (typeof this._scrollbar === 'function') this._scrollbar(scrollzone, this._scrollbarOptions);
        content.classList.add('scrollzone-container');
        content.appendChild(scrollzone);
      });
    }

    _calculateScrollzone(container, scrollzone) {
      scrollzone.style.height = (container.offsetHeight - parseInt(getComputedStyle(container).paddingTop) * 2) + 'px';
    }

    resize(elem) {
      if (!elem) {
        return throttle(() => {
          this._contentElements.forEach(({content, scrollzone}) => {
            this._calculateScrollzone(content, scrollzone);
          });
        }, 200);
      } else {
        const content = elem.querySelector(this._contentSelector);
        const scrollzone = content.querySelector('.scrollzone');
        this._calculateScrollzone(content, scrollzone);
      }
    }

  }



  const tb = new Tabs({
    tabSelector: '.activities-tab',
    targetSelector: '.activities-tab__header',
    contentSelector: '.activities-tab__content',
    scrollbar: Scrollbar.init.bind(Scrollbar),
    scrollbarOptions: { alwaysShowTracks: true },
    tabHeightTransition: 350
  });


  // ONLOAD
  window.addEventListener('load', () => {
    OFIwithLazyload();
    noDragElements('img, a');
    preloaderLoad();


    // AOS
    if (window.innerWidth > 700) {
      AOS.init({
        duration: 600,
        offset: 200,
        delay: 100,
        easing: 'cubic-bezier(0.77, 0, 0.17, 1)'
      });
    } else {
      AOS.init({
        duration: 600,
        offset: 100,
        delay: 100,
        easing: 'cubic-bezier(0.77, 0, 0.17, 1)'
      });
    }

    aosAnim('.about-gallery__item', 100);
    aosAnim('.s-adv__item', 100);
    aosAnim('.service', 100);
    aosAnim('.activities > div', 100);
    aosAnim('.team-gallery__item', 100);
    aosAnim('.client-review', 100);
    aosAnim('.blog', 100);
    if (getWidth() <= 850) {
      const works = [...document.querySelectorAll('.work')];
      works.forEach(work => work.setAttribute('data-aos', 'fade-up'))
      aosAnim('.work', 100);
    }
  });
  // ONLOAD END




  function preloaderLoad({selector = '#preloader', transition = 1000} = {}) {
    const preloader = document.querySelector(selector);
    if (!preloader) return;

    preloader.style.transition = `opacity ${transition}ms ease, visibility ${transition}ms ease`;
    preloader.classList.add('loaded');
    setTimeout(() => preloader.remove(), transition);
  }


  function OFIwithLazyload() {
    objectFitImages('img:not(.lazyload)');
    OFIbyLazyloadEvent();

    function OFIbyLazyloadEvent() {
      const imgs = [...document.getElementsByTagName('img')];
      if (!imgs.length) return;

      imgs.forEach(img => {
        img.addEventListener('lazyloaded', () => objectFitImages('img.lazyloaded'));
      });
    }
  }


  function noDragElements(selector) {
    const noDragObjects = [...document.querySelectorAll(selector)];
    noDragObjects.forEach(el => {
      el.addEventListener('dragstart', event => event.preventDefault());
    });
  }


  function throttle(func, ms) {
    let isThrottled = false;
    let savedArgs;
    let savedThis;

    function wrapper() {
      if (isThrottled) {
        savedArgs = arguments;
        savedThis = this;
        return;
      }

      func.apply(this, arguments);
      isThrottled = true;

      setTimeout(() => {
        isThrottled = false;
        if (savedArgs) {
          wrapper.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, ms);
    }

    return wrapper;
  }


  function aosAnim(selector, delay) {
    const elements = [...document.querySelectorAll(selector)];
    delay = !isNaN(delay) ? delay : 100;

    function core() {
      if (elements[0]) {
        let topNumber = elements[0].getBoundingClientRect().top;
        let num = 1;

        elements.forEach(element => {
          if (element.getBoundingClientRect().top === topNumber) {
            element.setAttribute('data-aos-delay', num * delay);
            num++;
          } else {
            element.setAttribute('data-aos-delay', delay);
            num = 2;
            topNumber = element.getBoundingClientRect().top;
          }
        });
      }

    };

    core();
    window.addEventListener('resize', core);
  }


  function getScrollWidth() {
    const element = document.createElement('div');
    Object.assign(element.style, {
      overflowY: 'scroll',
      height: '50px',
      width: '50px',
      visibility: 'hidden'
    });
    document.body.append(element);
    const scrollWidth = element.offsetWidth - element.clientWidth;
    element.remove();

    return scrollWidth;
  }

  function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  function getHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }

})(this, window, window.document);
