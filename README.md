# Component Readme Generator — Figma Plugin

Автоматически создаёт readme-фрейм для компонентов с вариантами и булеанами.

## Что делает

1. Читает выбранный ComponentSet (варианты + булеаны)
2. Отправляет структуру в выбранный LLM (Claude / OpenAI / Custom OpenAI-compatible)
3. Получает описания для каждого состояния
4. Создаёт готовый readme-фрейм рядом с компонентом — с текстом и живыми инстансами

## Установка для команды

1. Клонировать репозиторий:
   ```
   git clone https://github.com/sgoltsov-dev/figma-readme-plugin.git
   ```
2. Открыть **Figma Desktop**
3. **Plugins → Development → Import plugin from manifest...** → выбрать `plugin/manifest.json` из папки
4. Запустить: **Plugins → Development → Component Readme Generator**

> Для обновления — `git pull` в папке, затем перезапустить плагин в Figma.

## Установка локально (без git)

1. В Figma: **Plugins → Development → Import plugin from manifest...**
2. Выбери файл `plugin/manifest.json` из скачанной папки
3. Плагин появится в **Plugins → Development → Component Readme Generator**

## Использование

1. Выдели ComponentSet (или любой вариант внутри него) на канвасе
2. Запусти плагин
3. Нажми **«Прочитать выбранный компонент»**
4. Выбери провайдера генерации
5. Введи ключ / настройки провайдера
6. Выбери язык описаний (RU / EN)
7. Нажми **«Сгенерировать readme»**

## Провайдеры генерации

- **Claude**: вставь Claude API Key (см. [Anthropic Console](https://console.anthropic.com)).
- **OpenAI**: вставь OpenAI API Key и модель (по умолчанию `gpt-4.1-mini`).
- **Custom (OpenAI-compatible)**: укажи `base URL` (например `https://api.example.com`), `model`, и при необходимости `Bearer token`.

Важно: запросы выполняются **напрямую из UI iframe** (браузерный контекст), т.е. ключ нужен на стороне пользователя (BYOK).

## Файлы

- `plugin/manifest.json` — конфиг плагина
- `plugin/dist/code.js` — основная логика (работает в Figma sandbox)
- `plugin/dist/ui.html` — интерфейс плагина (iframe)

## Требования

- Figma Desktop
- API Key выбранного провайдера (если используешь LLM)
- Компонент должен быть типа ComponentSet с Component Properties (Variant +/или Boolean)

## Кастомизация промпта

В `plugin/dist/ui.html` найди функцию `generateDescriptions()` — там `userPrompt`.  
Можно добавить свои инструкции: тональность, длину описаний, формат.

## Поддерживаемые свойства

- **Variant properties**: поддерживаются любые имена variant-свойств (не только `State/Value/Trailing`). Для каждого variant property создаётся отдельная секция, карточка на каждое значение.
- **Boolean properties**: создаётся секция `Boolean options` с карточками `True/False`.

## Примечания

- API ключ сохраняется в localStorage плагина (только локально)
- Фрейм создаётся с отступом 80px правее компонента
- Если readme уже есть — создаётся новый (старый не удаляется)
- Шрифт: Inter (должен быть в Figma)

## Быстрый чеклист тестирования (в Figma)

1. Запусти плагин без выделения — должна быть понятная ошибка, без падения.
2. Выбери `COMPONENT_SET` → **Прочитать выбранный компонент** → отображаются variants/booleans.
3. Нажми **Сгенерировать readme** → рядом создаётся `<ComponentName> / Readme`.
4. Проверь, что создались секции по каждому variant property, и внутри карточки по каждому значению.
5. Если есть booleans — проверь карточки `True/False` и что инстансы реально меняются.
6. Проверь ошибку провайдера (неверный ключ/endpoint) — UI должен показать ошибку и вернуть кнопку в активное состояние.
