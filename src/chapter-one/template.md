# HTML Templates

Шаблоны, как концепция для создания переиспользуемых участков пользовательского интерфейса, активно применяются в веб-разработке уже долгие годы. На сервере примерами будут Razor (.NET), Haml (Ruby), Django Templates (Python), Pug (NodeJS) и Smarty (PHP). Компонентный подход, популярный на клиенте, несколько отличается от шаблонов концептуально и в реализации, но назначение обеих этих концепций схожее.

Одна из причин, почему появилось такое множество шаблонных нотаций и реализаций - отсутствие на тот момент подобного стандарта в HTML. Стандарт был разработан *WhatWG* под именем `HTML Template Specification` и представлен в *HTML5*.

В этом уроке, как и в случае с *Shadow DOM*, мы будем работать в отрыве от пользовательских компонентов.

## Элемент `<template>`

Элемент `<template>` является основой спецификации и служит хранилищем для участка HTML. Браузер игнорирует его содержимое в плане семантики, проверяя лишь синтаксис. Используются эти участки HTML уже средствами JS: мы можем получить к ним доступ и использовать для создания реальных элементов на их основе (или дополнения существующих).

Содержимым шаблона может быть любой HTML, в том числе участки разметки, которые будучи написанными вне шаблона были бы определены браузером как невалидные. Например, мы можем поместить в шаблон строку таблицы `<tr><td>Data</td></tr>` и она не будет автоматически обернута браузером в `<table>`, или поместить элемент `<option>`. Содержимое `<template>` остается ровно таким, каким мы его задаем, и браузер не пытается "починить" его.
Это порой помогает избавиться от лишней вложенности.

Мы также можем включать в шаблоны стили и скрипты. Они будут применены и исполнены в тот момент, когда мы вручную внесем его содержимое в DOM. До тех пор браузер расценивает содержимое шаблона как находящееся вне документа и недоступное к обращениям через `querySelector` или иные API.

Создавать шаблоны можно декларативно, помещая глобальные шаблоны в `<head>`, а относящиеся к конкретному компоненту - внутрь самого компонента. Например, шаблон строки таблицы логично разместить внутри таблицы. Помимо этого, можно создавать шаблоны и императивно, через JS.

## Активация шаблонов

Содержимое шаблона можно получить через свойство *content*, которое возвращает особый тип DOM-узла - `DocumentFragment`. Его отличие от остальных DOM-узлов в том, что мы можем оперировать только его дочерними элементами.

```html
<template id="tmpl">
    <script>
        document.querySelector('button').addEventListener('click', () => {
            alert("Hello");
        })
    </script>
    <button class="message">Hello, template!</button>
</template>
```

```js
const elem = document.createElement('div');
elem.append(tmpl.content.cloneNode(true));
document.body.append(elem);
```

<iframe height="50" src="/template-example-1.html" />

Обратите внимание, что мы обратились к шаблону по его идентификатору. Все шаблоны доступны глобально сразу после парсинга документа браузером, хотя классический способ через `document.querySelector('#tmpl')` также работает.

Можно заметить метод `cloneNode`, который запрашивает глубокую (задается параметром `true`) копию содержимого шаблона. Можно использовать шаблоны и без клонирования, но тогда содержимое будет не скопировано, а перемещено, и мы не сможем повторно использовать шаблон, что обычно критично. У этого метода есть альтернатива - `importNode` - но в курсе мы ее рассматривать не будем.

## Шаблоны и Shadow DOM

Совместим шаблоны с теневым DOM.

```html
<template id="tmpl2">
    <style>
        p {
            font-weight: bold;
        }
    </style>
    <p id="message">Hello Shadow!</p>
</template>
<div id="elem">Click me</div>
```

```js
elem.addEventListener("click", function() {
    elem.attachShadow({ mode: 'open' });
    elem.shadowRoot.append(tmpl2.content.cloneNode(true));
})
```

<iframe height="50" src="/template-example-2.html" />

Откройте инструменты разработчика, чтобы убедиться, что теневое дерево сформировано.

## Вложенные шаблоны

Представим следующую ситуацию

```html
<div id="host"></div>
<template id="sectionTemplate">
    <h2>Header</h2>
    <p>Text</p>
    <template id="detailsTemplate">
        <h3>Addition</h3>
        <p>Details</p>
    </template>
</template>
```

Это допустимо, но необходимо активировать как внутренний шаблон, так и внешний

```js
// узел с клонированным содержимым внешнего шаблона
const outer = sectionTemplate.content.cloneNode(true);
// записываем внутренний шаблон в переменную
const inner = outer.children.detailsTemplate;
// заменяем внутренний шаблон на его реальное содержимое
outer.removeChild(inner);
outer.appendChild(inner.content.cloneNode(true));

// прикрепляем к DOM
document.querySelector('#host').appendChild(outer);
```

<iframe height="150" src="/template-example-5.html" />

## Альтернативы

Того же результата, как в первом примере, мы можем добиться и без шаблонов, например через `innerHTML`:

```html
    <div id="elem">Click me</div>
    <script>
        elem.addEventListener("click", function () {
            elem.attachShadow({ mode: 'open' });
            elem.shadowRoot.innerHTML = `
                <style>
                    p {
                        font-weight: bold;
                    }
                </style>
                <p id="message">Hello Shadow!</p>`
        })
    </script>
```

<iframe height="50" src="/template-example-3.html" />

Или через императивное пошаговое создание дерева:

```html
    <div id="elem">Click me</div>
    <script>
        elem.addEventListener("click", function () {
            elem.attachShadow({ mode: 'open' });

            const styles = document.createElement('style')
            const message = document.createElement('p')
            message.setAttribute('id', 'message')
            message.textContent = 'Hello Shadow!'
            styles.textContent = 'p { font-weight: bold; }'

            elem.shadowRoot.innerHTML = styles.innerHTML + message.innerHTML
        })
    </script>
```

<iframe height="50" src="/template-example-4.html" />

Первый вариант удобен только для простых примеров, так как лишает нас поддержки IDE и повышает вероятность ошибок. Второй - отнимает много времени. Если команда принципиально отказывается использовать шаблоны, более здоровой альтернативой будет использование JSX либо импорт HTML из документов. Альтернативы будут рассмотрены позднее.
