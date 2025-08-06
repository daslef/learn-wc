# Shadow DOM (Дополнительные главы)

В этой главе мы рассмотрим некоторые продвинутые техники для работы с Shadow DOM:
- слоты и композиция;
- спецификация Shadow Root API;
- спецификация CSS Shadow Parts;
- спецификация Constructable Stylesheets;
- спецификация Declarative Shadow DOM;
- селективная стилизация хост-элемента;
- контекстная стилизация хост-элемента.

## Подробнее о Shadow Root API

Итак, *ShadowRoot* это корневой узел теневого DOM-поддерева, которое отрисовывается отдельно от основного дерева документа. Именно к нему мы получали доступ через `someElement.shadowRoot`. Он обладает своим набором свойств и методов.

#### Свойства

`delegatesFocus` - доступное для чтения свойство, возвращает булево значение о том, было ли выставлено делегирование фокуса при прикреплении теневого дерева;

`host` - доступное для чтения свойство, возвращает ссылку на хост-элемент;

`innerHTML` - свойство для задания содержимого теневого поддерева либо получения ссылки на него;

`mode`: доступное для чтения свойство, возвращающее *open* или *closed*;

`activeElement`: доступное для чтения свойство, возвращает элемент теневого дерева, на котором находится пользовательский фокус (реализовано не всеми браузерами).

`styleSheets`: доступное для чтения свойство, возвращающее StyleSheetList из объектов CSSStyleSheet для тех таблиц стилей, которые явным образом импортируются или встраиваются в документ (реализовано не всеми браузерами).

#### Методы

`getSelection()`: A method that returns a Selection object representing the range of text selected by the user or the current position of the caret

`elementFromPoint()` и `elementsFromPoint()`: методы, которые возвращают верхний элемент либо массив всех элементов по заданным координатам соответственно;

`caretPositionFromPoint()`: метод, возвращающий объект CaretPosition с узлом, содержащим каретку, и смещением символа каретки относительно этого узла

## CSS Shadow Parts

Когда спецификация `Shadow DOM` только появилась, единственным способом стилизовать теневые элементы из глобальной области видимости было использование CSS-переменных. Они единственные могли проникнуть через границы теневого DOM-дерева.

Спецификация `CSS Shadow Parts` предоставила псевдо-селектор `::part`, позволяющий стилизовать любой элемент теневого дерева, помеченный аттрибутом `part`. Доступна в современных браузерах.

Вернемся к примеру из введения в Shadow DOM ...

<iframe src="/shadow-dom-example-3.html"  />

... и слегка модифицируем его:

```html
<head>
    <!-- ... -->
    <style>
        body {
            margin: 0;
            padding: 1rem;
            --padding-small: 0.5rem;
        }

        .entry {
            box-shadow: 0px 0px 3px 2px rgba(34, 60, 80, 0.23);
            padding: 8px;
        }

        .entry::part(entry-input) {
            padding: var(--padding-small);
        }

        .entry::part(entry-input):invalid {
            color: red;
        }
    </style>
</head>

<body>
    <section class="entry"></section>
    <script>
        const sectionElement = document.querySelector('.entry')
        const shadow = sectionElement.attachShadow({ mode: 'closed' })
        shadow.innerHTML = `
            <input part="entry-input" name="email" type="email" value="@test.com" placeholder="example@test.com" autocomplete="off" required>
            <p part="entry-tip">Invalid email</p>`
    </script>
</body>
```

<iframe src="/shadow-dom-example-4.html"  />

Опираясь на значения `part` теневых элементов, мы из глобального DOM-дерева настроили внутренние отступы поля ввода и его отображение в случае некорректного значения.

## Слоты и композиция

## Спецификация Constructable Stylesheets

## Спецификация Declarative Shadow DOM

## Селективная стилизация хост-элемента

## Контекстная стилизация хост-элемента
