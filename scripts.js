// Переключатель темы

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

// Добавляю класс заголовку при пролистывании

window.addEventListener('scroll', function() {
  const element = document.querySelector('header');
  if (window.scrollY > 3) {
    element.classList.add('is-scrolled'); // Добавил класс
  } else {
    element.classList.remove('is-scrolled'); // Убрать, если вернулись на верх
  }
});

// Открываю мобильное меню при клике на кнопку

const button = document.getElementById('burger-button')
const menu = document.getElementById('mobile-menu')

button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
});

document.addEventListener('click', (e) => {
    if (e.target !== button) {
        menu.classList.remove('is-open');
    }
});

// Работа с модалкой
document.addEventListener('DOMContentLoaded', () => {
  // Переменная, куда мы сохраним данные после загрузки из файла
  let menuData = null;

  // 1. Функция загрузки данных из JSON
  async function loadMenuData() {
    try {
      // Отправляем запрос к файлу (укажите правильный путь к вашему json)
      const response = await fetch('menu.json'); 
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      // Превращаем текст json в JS-объект и сохраняем в нашу переменную
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
  const allergenToggle = modal.querySelector('.allergen-toggle-btn');
  const allergenDropdown = modal.querySelector('.allergen-dropdown');

  const mImage = document.getElementById('modal-image');
  const mTitle = document.getElementById('modal-title');
  const mIngredients = document.getElementById('modal-ingredients');
  const mCalories = document.getElementById('modal-calories');
  const mProteins = document.getElementById('modal-proteins');
  const mFats = document.getElementById('modal-fats');
  const mCarbs = document.getElementById('modal-carbs');
  const mAllergensList = document.getElementById('modal-allergens');

  // 3. Функция заполнения модалки
  function fillModal(dishId) {
    // Проверяем, успели ли загрузиться данные из файла
    if (!menuData) {
      console.warn('Данные еще не загрузились, подождите секунду.');
      return;
    }

    const dish = menuData[dishId];
    if (!dish) return;

    mImage.src = dish.image;
    mImage.alt = dish.title;
    mTitle.textContent = dish.title;
    mIngredients.textContent = dish.ingredients;
    
    mCalories.textContent = dish.nutrition.kcal;
    mProteins.textContent = dish.nutrition.p;
    mFats.textContent = dish.nutrition.f;
    mCarbs.textContent = dish.nutrition.c;

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

  // 4. Слушатели событий
  openButtons.forEach(button => {
    button.addEventListener('click', () => {
      const dishId = button.getAttribute('data-dish-id');
      fillModal(dishId);
      modal.showModal(); 
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

  function closeModal() {
    modal.close();
    allergenDropdown.classList.remove('is-active');
  }
});
