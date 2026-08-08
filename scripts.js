// ПЕРЕЗАГРУЗКА ОТКРЫВАЕТ САЙТ С СТАРТОВОЙ ТОЧКИ

if (window.history && history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

const navEntries = window.performance?.getEntriesByType('navigation');
const isReload = navEntries && navEntries[0] && navEntries[0].type === 'reload';

if (isReload && window.location.hash) {
  window.history.replaceState(null, null, window.location.pathname + window.location.search);
}


// ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ

let darkmode = localStorage.getItem('dark-mode')

const themeSwitcher = document.getElementById('theme-switcher')

const enableDarkmode = () => {
  document.body.classList.add('dark-mode')
  localStorage.setItem('dark-mode', 'active')

}

const disableDarkmode = () => {
  document.body.classList.remove('dark-mode')
  localStorage.setItem('dark-mode', null)
}

if(darkmode === "active") enableDarkmode()

themeSwitcher.addEventListener("click", () => {
  darkmode = localStorage.getItem('dark-mode')
  darkmode !=="active" ? enableDarkmode() : disableDarkmode()
});

// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ В ЗАВИСИМОСТИ ОТ НАСТРОЕК ПОЛЬЗОВАТЕЛЯ

const themeCheckbox = document.getElementById('theme-switcher');
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applySystemTheme(e) {
  if (e.matches) {
    document.body.classList.add('dark-mode');
    if (themeCheckbox) themeCheckbox.checked = true;
  } else {
    document.body.classList.remove('dark-mode');
    if (themeCheckbox) themeCheckbox.checked = false;
  }
}

// 1. Проверяем тему сразу при загрузке сайта
applySystemTheme(darkModeMediaQuery);

// 2. Следим за изменениями в системе на лету (например, если сработал таймер ночного режима)
darkModeMediaQuery.addEventListener('change', applySystemTheme);

// ДОБОВЛЯЮ КЛАСС HEADER'У ПРИ ПРОЛИСТЫВАНИИ

window.addEventListener('scroll', function() {
  const element = document.querySelector('header');
  if (window.scrollY > 3) {
    element.classList.add('is-scrolled'); // Добавил класс
  } else {
    element.classList.remove('is-scrolled'); // Убрать, если вернулись на верх
  }
});

// МОБИЛЬНОЕ МЕНЮ ПРИ КЛИКЕ НА КНОПКУ

const button = document.getElementById('burger-button');
const menu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('[data-js-mobile-menu-navigation-link]');

// Находим первую и последнюю ссылку в мобильном меню для зацикливания фокуса
const firstMenuLink = mobileLinks[0];
const lastMenuLink = mobileLinks[mobileLinks.length - 1];

// Функция обновления доступных состояний кнопки и меню
function updateMenuState(isOpen) {
  button.setAttribute('aria-expanded', isOpen);
  button.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  menu.setAttribute('aria-hidden', !isOpen);
}


button.addEventListener('click', () => {
  menu.classList.toggle('is-open');
  button.classList.toggle('is-open');
  document.body.classList.toggle('no-scroll', menu.classList.contains('is-open'));
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#burger-button')) {
    menu.classList.remove('is-open');
    button.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }
});

// 4. Логика клавиатуры: Клавиша Escape и Ловушка фокуса (Focus Trap)
document.addEventListener('keydown', (e) => {
  // Если меню закрыто — клавиатурные перехваты ниже нам не нужны
  if (!menu.classList.contains('is-open')) return;

  // Закрытие по кнопке Escape
  if (e.key === 'Escape') {
    menu.classList.remove('is-open');
    button.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    updateMenuState(false);
    button.focus(); // Возвращаем фокус на бургер, чтобы не потеряться
    return;
  }

  // Зацикливание фокуса при нажатии Tab
  if (e.key === 'Tab') {
    // Если идем назад (Shift + Tab) и стоим на бургер-кнопке
    if (e.shiftKey && document.activeElement === button) {
      e.preventDefault();
      lastMenuLink.focus(); // Перекидываем фокус на ссылку "Контакты"
    } 
    // Если идем вперед (просто Tab) и стоим на ссылке "Контакты"
    else if (!e.shiftKey && document.activeElement === lastMenuLink) {
      e.preventDefault();
      button.focus(); // Возвращаем фокус на бургер-кнопку
    }
  }
});

// КРЕПИМ СЛАЙДЕР В МЕСТО header'а

const header = document.querySelector('header');
const slider = document.querySelector('.menu__slider-container');
const anchor = document.querySelector('#menu__anchor');
const menuBackBtn = document.querySelector('.menu-back-btn');

// Получаем точную высоту хедера динамически (например, 60px или 80px)
const headerHeight = header.offsetHeight;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Проверяем, ушел ли маяк выше установленной границы хедера
    if (!entry.isIntersecting && entry.boundingClientRect.top < headerHeight) {
      header.classList.add('header-hidden');
      slider.classList.add('is-sticky');
      if (menuBackBtn) {
        menuBackBtn.removeAttribute('inert');
      }
    } else {
      header.classList.remove('header-hidden');
      slider.classList.remove('is-sticky');
      if (menuBackBtn) {
        menuBackBtn.setAttribute('inert', '');
      }
    }
  });
}, { 
  // rootMargin создает виртуальную зону срабатывания. 
  // Отрицательное значение сверху (например, -60px) заставит JS реагировать ДО того, 
  // как слайдер доедет до физического верха экрана.
  rootMargin: `-${headerHeight}px 0px 0px 0px`,
  threshold: 0 
});

observer.observe(anchor);

/// ДЕЛАЕМ КНОПКИ МЕНЮ АКТИВНОЙ В СЛАЙДЕРЕ

// 1. Находим все ссылки в нашем слайдере
const menuLinks = document.querySelectorAll('.menu__slider-track .menu__category-button');

// 2. Собираем массив ID из атрибутов href (например, ['#burgers', '#pizza', '#salads'])
const targetIds = Array.from(menuLinks).map(link => link.getAttribute('href'));

// 3. Находим на странице сами заголовки секций по этим ID
const menuSections = targetIds.map(id => document.querySelector(id)).filter(section => section !== null);

// 4. Находим сам трек слайдера, который мы будем прокручивать
const sliderTrack = document.querySelector('.menu__slider-track');

// 5. Настраиваем наблюдатель для секций меню
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Если секция (заголовок) появилась в верхней части экрана
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      
      menuLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');
          
          // --- БЕЗОПАСНАЯ АВТОДОКРУТКА (БЕЗ КОНФЛИКТОВ И БАГОВ) ---
          // Высчитываем, сколько нужно прокрутить трек, чтобы кнопка встала по центру
          const trackWidth = sliderTrack.offsetWidth;
          const linkOffsetLeft = link.offsetLeft;
          const linkWidth = link.offsetWidth;
          
          // Формула центра: позиция кнопки минус половина ширины трека плюс половина ширины самой кнопки
          const scrollTarget = linkOffsetLeft - (trackWidth / 2) + (linkWidth / 2);
          
          // Прокручиваем СТРОГО трек слайдера по горизонтали, не трогая страницу
          sliderTrack.scrollTo({
            left: Math.max(0, scrollTarget), // Не уходим в отрицательные значения
            behavior: 'smooth'
          });
          
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
  });
}, {
  // На десктопе и мобилках зона отслеживания (чуть ниже липкого слайдера)
  rootMargin: '-12% 0px -80% 0px', 
  threshold: 0
});

// 6. Запускаем слежку за каждым заголовком категории
menuSections.forEach(section => sectionObserver.observe(section));

// РАБОТА МОДАЛЬНОГО ОКНА

document.addEventListener('DOMContentLoaded', () => {
  // Переменная, куда мы сохраним данные после загрузки из файла
  let menuData = null;

  // 1. Функция загрузки данных из JSON
  async function loadMenuData() {
    try {
      const response = await fetch('menu.json'); 
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      menuData = await response.json();
      console.log('Данные меню успешно загружены:', menuData);
    } catch (error) {
      console.error('Не удалось загрузить меню:', error);
    }
  }

  // Сразу запускаем загрузку данных при старте страницы
  loadMenuData();

  // 2. Поиск элементов в DOM
  const modal = document.getElementById('dish-modal');
  const openButtons = document.querySelectorAll('.open-dish-btn');
  const closeButton = modal.querySelector('.close-modal-btn');
  const allergenToggle = modal.querySelector('.allergen__toggle-button');
  const allergenDropdown = modal.querySelector('.allergen-dropdown');

  const mImage = document.getElementById('modal-image');
  const mTitle = document.getElementById('modal-title');
  const mIngredients = document.getElementById('modal-ingredients');
  const mCalories = document.getElementById('modal-calories');
  const mProteins = document.getElementById('modal-proteins');
  const mFats = document.getElementById('modal-fats');
  const mCarbs = document.getElementById('modal-carbs');
  const mAllergensList = document.getElementById('modal-allergens');

  // Элементы переключения контента (Блюда / Сеты)
  const mIngredientsTitle = document.getElementById('ingredients-title');
  const mSaucesBlock = document.getElementById('modal-sauces-block');
  const mSauces = document.getElementById('modal-sauces');
  const mNutritionBlock = document.getElementById('modal-nutrition-block');

  // 3. Функция заполнения модалки
  function fillModal(dishId) {
    if (!menuData) return;

    const dish = menuData[dishId];
    if (!dish) return;

    mImage.src = dish.image;
    mImage.alt = dish.title;
    mTitle.textContent = dish.title;
    mIngredients.textContent = dish.ingredients;
    
    // === ПРОВЕРКА: ЕСЛИ ЭТО СЕТ (есть поле sauces) ===
    if (dish.sauces) {
      mIngredientsTitle.textContent = 'В сет входят:'; 
      mSauces.textContent = dish.sauces;               
      mSaucesBlock.style.display = 'block';            
      mNutritionBlock.style.display = 'none';          
    } else {
      // === ЕСЛИ ЭТО ОБЫЧНОЕ БЛЮДО ===
      mIngredientsTitle.textContent = 'Состав:';       
      mSaucesBlock.style.display = 'none';             
      mNutritionBlock.style.display = 'block';         

      mCalories.textContent = dish.nutrition.kcal;
      mProteins.textContent = dish.nutrition.p;
      mFats.textContent = dish.nutrition.f;
      mCarbs.textContent = dish.nutrition.c;
    }

    // Блок аллергенов (работает одинаково и для блюд, и для сетов)
    mAllergensList.innerHTML = '';

    if (dish.allergens && dish.allergens.length > 0) {
      allergenToggle.style.display = 'block';
      dish.allergens.forEach(allergen => {
        const li = document.createElement('li');
        li.textContent = allergen;
        mAllergensList.appendChild(li);
      });
    } else {
      allergenToggle.style.display = 'none';
    }
  }

  // Находим все карточки товаров на странице
  const cardContainers = document.querySelectorAll('.dish__card-content');

  cardContainers.forEach(card => {
    card.addEventListener('click', (event) => {
      // 1. Всегда ищем кнопку внутри текущей карточки, на которую кликнули
      const button = card.querySelector('.open-dish-btn');
      if (!button) return;

      // 2. Получаем ID блюда прямо из кнопки
      const dishId = button.getAttribute('data-dish-id');

      // 3. Открываем модальное окно
      fillModal(dishId);
      modal.showModal();
    });
  });

  openButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // Защита от всплытия

      // Запоминаем кнопку, на которую кликнули, чтобы потом вернуть фокус
      lastActiveElement = button; 

      const dishId = button.getAttribute('data-dish-id');
      fillModal(dishId);
      
      // 1. Сначала открываем окно
      modal.showModal();
      
      // =====================================================================
      // ИСПРАВЛЕНИЕ ДЛЯ SAFARI: Принудительно передаем фокус на крестик, 
      // чтобы браузер зафиксировал курсор внутри модального окна
      // =====================================================================
      //closeButton.focus(); 
      const mTitle = document.getElementById('modal-title');
      if (mTitle) {
        mTitle.focus();
      }
    });
  });

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  allergenToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    allergenDropdown.classList.toggle('is-active');
  });

  document.addEventListener('click', () => {
    allergenDropdown.classList.remove('is-active');
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Если идем назад (Shift + Tab) и стоим на КРЕСТИКЕ
      if (e.shiftKey && (document.activeElement === closeButton || document.activeElement === modal.querySelector('.modal-focus-trap'))) {
        e.preventDefault();
        allergenToggle.focus(); // Перекидываем фокус вперед на КНОПКУ АЛЛЕРГЕНОВ
      } 
      // Если идем вперед (просто Tab) и стоим на КНОПКЕ АЛЛЕРГЕНОВ
      else if (!e.shiftKey && document.activeElement === allergenToggle) {
        e.preventDefault();
        closeButton.focus(); // Возвращаем фокус назад на КРЕСТИК
      }
    }
  });

  function closeModal() {
    modal.close();
    allergenDropdown.classList.remove('is-active');
  }
});


// АНИМАЦИИ

document.addEventListener('DOMContentLoaded', () => {

  const elementsToAnimate = document.querySelectorAll('.anim-target');

  const isMobile = window.innerWidth <= 768;

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // Как только край секции пересекает границу видимости
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Убираем слежку, чтобы анимация сработала строго один раз при первом заходе
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: isMobile ? '0px 0px 10% 0px' : '0px 0px -5% 0px',
    threshold: isMobile ? 0 : 0.02
  });
  elementsToAnimate.forEach(element => animationObserver.observe(element));
});