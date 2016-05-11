# Directum

Скрипты для администрирования [Directum](http://www.directum.ru/).

## Запуск

Все утилиты запускаются с параметром сервер/база,
например `ca.bat Directum/Directum`.
Значения по умолчанию можно вписать в третью строку скрипта.

### add

Интерактивная настройка пользователей Directum по данным из AD.

### block

Блокирование пользователей Directum, которые неактивны в AD.

### ca

Копирование сертификатов пользователей из AD в Directum.

Скрипт запускает Directum (через SBLauncher) и снова выполняет себя же
из под него. В Directum должен быть установлен сценарий
[ca_bat](src/ca/ca.isb).

## Разработка

0. Установить [Node.js](https://nodejs.org/)

1. Установить зависимости `npm install`

2. Запуск с автоматической перестройкой `npm test`

3. Создание окончательных версий `npm start`

Используйте меню Far Manager.
