(function () {
  "use strict";

  // Функция для создания эффекта "сломанной" надписи
  function createBrokenTextEffect() {
    // Находим все элементы с классом r-fit-text
    const textElements = document.querySelectorAll(".js-broken");

    textElements.forEach((element, elementIndex) => {
      // Сохраняем оригинальный текст
      const originalText = element.textContent.trim();
      if (!originalText) return;

      // Очищаем элемент
      element.innerHTML = "";
      element.style.position = "relative";
      element.style.overflow = "visible";

      // Создаем контейнер для букв
      const letterContainer = document.createElement("div");
      letterContainer.style.display = "inline";

      // Разбиваем текст на символы
      Array.from(originalText).forEach((char, charIndex) => {
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.style.position = "relative";

        if (char === " ") {
          span.innerHTML = "&nbsp;";
          span.style.width = "0.3em";
        } else {
          span.textContent = char;

          // Генерируем случайные параметры для каждой буквы
          const randomDelay = Math.random() * 1.2 + elementIndex * 0.4;
          const randomRotation = (Math.random() - 0.5) * 60; // -30 to 30 degrees
          const randomOffsetX = (Math.random() - 0.5) * 80; // -40 to 40 px
          const randomFallHeight = Math.random() * 100 + 120; // 120-220px
          const randomDuration = Math.random() * 0.6 + 1.0; // 1.0-1.6s

          // Устанавливаем начальное состояние
          span.style.opacity = "0";
          span.style.transform = `translateY(-${randomFallHeight}px) translateX(${randomOffsetX}px) rotate(${randomRotation}deg) scale(0.7)`;
          span.style.filter = "blur(3px)";
          span.style.transition = `all ${randomDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          span.style.transitionDelay = `${randomDelay}s`;

          // Добавляем класс для идентификации
          span.classList.add("broken-letter");
          span.setAttribute("data-original-char", char);
        }

        letterContainer.appendChild(span);
      });

      element.appendChild(letterContainer);

      // Запускаем анимацию через небольшую задержку
      setTimeout(() => {
        const letters = element.querySelectorAll(".broken-letter");
        letters.forEach((letter, index) => {
          // Финальное состояние - буквы встают на места
          setTimeout(
            () => {
              letter.style.opacity = "1";
              letter.style.transform =
                "translateY(0px) translateX(0px) rotate(0deg) scale(1)";
              letter.style.filter = "blur(0px)";
            },
            50 + index * 5,
          ); // Небольшая задержка между буквами
        });
      }, 100);
    });
  }

  // Функция сброса анимации
  function resetAnimation() {
    const brokenLetters = document.querySelectorAll(".broken-letter");
    brokenLetters.forEach((letter) => {
      // Убираем все переходы для мгновенного сброса
      letter.style.transition = "none";
      letter.style.opacity = "0";

      // Возвращаем случайные начальные позиции
      const randomRotation = (Math.random() - 0.5) * 60;
      const randomOffsetX = (Math.random() - 0.5) * 80;
      const randomFallHeight = Math.random() * 100 + 120;

      letter.style.transform = `translateY(-${randomFallHeight}px) translateX(${randomOffsetX}px) rotate(${randomRotation}deg) scale(0.7)`;
      letter.style.filter = "blur(3px)";
    });

    // Принудительный reflow
    document.body.offsetHeight;

    // Возвращаем переходы
    brokenLetters.forEach((letter) => {
      const randomDuration = Math.random() * 0.6 + 1.0;
      const randomDelay = Math.random() * 1.2;
      letter.style.transition = `all ${randomDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      letter.style.transitionDelay = `${randomDelay}s`;
    });
  }

  // Функция инициализации
  function initBrokenTextEffect() {
    // Проверяем, есть ли уже обработанные элементы
    const existingLetters = document.querySelectorAll(".broken-letter");
    if (existingLetters.length > 0) {
      resetAnimation();
      setTimeout(() => {
        const letters = document.querySelectorAll(".broken-letter");
        letters.forEach((letter, index) => {
          setTimeout(
            () => {
              letter.style.opacity = "1";
              letter.style.transform =
                "translateY(0px) translateX(0px) rotate(0deg) scale(1)";
              letter.style.filter = "blur(0px)";
            },
            50 + index * 5,
          );
        });
      }, 100);
    } else {
      createBrokenTextEffect();
    }
  }

  // Обработчик для Reveal.js
  function handleRevealSlideChange(event) {
    const currentSlide = event.currentSlide || event.target;
    const hasTargetElements =
      currentSlide && currentSlide.querySelector(".js-broken");

    if (hasTargetElements) {
      setTimeout(() => {
        initBrokenTextEffect();
      }, 300);
    }
  }

  // Инициализация
  function initialize() {
    // Проверяем наличие Reveal.js
    if (typeof Reveal !== "undefined") {
      // Подписываемся на события Reveal.js
      Reveal.on("slidechanged", handleRevealSlideChange);

      // Обрабатываем текущий слайд
      const currentSlide = Reveal.getCurrentSlide();
      if (currentSlide && currentSlide.querySelector(".js-broken")) {
        setTimeout(() => {
          initBrokenTextEffect();
        }, 500);
      }
    } else {
      // Если Reveal.js не найден, запускаем сразу
      setTimeout(() => {
        initBrokenTextEffect();
      }, 100);
    }
  }

  // Запуск после загрузки DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Экспорт функций для ручного управления
  window.BrokenTextEffect = {
    init: initBrokenTextEffect,
    reset: resetAnimation,
  };
})();
