# Component Readme Generator — Figma Plugin

Автоматически создаёт readme-фрейм для компонентов с вариантами и булеанами.

## Что делает

1. Читает выбранный ComponentSet (варианты + булеаны)
2. Отправляет структуру в Claude API
3. Получает описания для каждого состояния
4. Создаёт готовый readme-фрейм рядом с компонентом — с текстом и живыми инстансами

## Установка

1. В Figma: **Plugins → Development → Import plugin from manifest...**
2. Выбери файл `manifest.json` из этой папки
3. Плагин появится в **Plugins → Development → Component Readme Generator**

## Использование

1. Выдели ComponentSet (или любой вариант внутри него) на канвасе
2. Запусти плагин
3. Нажми **«Прочитать выбранный компонент»**
4. Введи Claude API Key (https://console.anthropic.com)
5. Выбери язык описаний (RU / EN)
6. Нажми **«Сгенерировать readme»**

## Файлы

- `manifest.json` — конфиг плагина
- `code.js` — основная логика (работает в Figma sandbox)
- `ui.html` — интерфейс плагина (iframe)

## Требования

- Figma Desktop
- Claude API Key (claude.ai → API Console)
- Компонент должен быть типа ComponentSet с Component Properties

## Кастомизация промпта

В `ui.html` найди функцию `generateDescriptions()` — там `userPrompt`.  
Можно добавить свои инструкции: тональность, длину описаний, формат.

## Примечания

- API ключ сохраняется в localStorage плагина (только локально)
- Фрейм создаётся с отступом 80px правее компонента
- Если readme уже есть — создаётся новый (старый не удаляется)
- Шрифт: Inter (должен быть в Figma)
