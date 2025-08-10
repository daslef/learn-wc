# Стилизация (Дополнительные главы)

В этой главе мы рассмотрим некоторые продвинутые техники для работы со стилями и Shadow DOM:
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

## Слоты

	Now let’s consider the situation with slots. Slots are explained in great detail in Chapter 6. Slotted elements come from the light DOM, so they use document styles. Local styles do not affect slotted content.
In Listing 7-4, the slotted <span> is bold, as per the document style, but it does not take a background from the local style.<style>  span {    font-weight: bold;  }</style> <user-card>  <div slot="username"><span>Joerg Krause</span></div></user-card><script>  customElements.define(    'user-card',    class extends HTMLElement {      connectedCallback() {        this.attachShadow({ mode: 'open' });        this.shadowRoot.innerHTML = `      <style>      span { background: red; }      </style>      Name: <slot name="username"></slot>    `;      }    }  );</script>Listing 7-4	Using Slots (chapter7/slots/index.html)

	The result is bold, but not red. If you’d like to style slotted elements in your component, there are two choices.
First, you can style the <slot> itself and rely on CSS inheritance as shown in Listing 7-5.<user-card>  <div slot="username"><span>Joerg Krause</span></div></user-card><script>  customElements.define(    'user-card',    class extends HTMLElement {      connectedCallback() {        this.attachShadow({ mode: 'open' });        this.shadowRoot.innerHTML = `      <style>      slot[name="username"] { font-weight: bold; }      </style>      Name: <slot name="username"></slot>    `;      }    }  );</script>Listing 7-5	Using Slots (chapter7/slotin/index.html)

	Here <p>Joerg Krause</p> becomes bold because CSS inheritance is in effect between the <slot> and its contents. But in CSS itself not all properties are inherited.
Another option is to use the ::slotted(selector) pseudo selector. It matches elements based on two conditions:	1.It must be a slotted element that comes from the light DOM. The slot’s name doesn’t matter. It behaves like any slotted element, but only the element itself is seen by the selector, not its children.
	2.The element matches the selector.
In this example, ::slotted(div) selects exactly <div slot="username">, but not its children, as shown in Listing 7-6.<user-card>  <div slot="username">    <div>Joerg Krause</div>  </div></user-card><script>  customElements.define(    'user-card',    class extends HTMLElement {      connectedCallback() {        this.attachShadow({ mode: 'open' });        this.shadowRoot.innerHTML = `      <style>      ::slotted(div) { border: 1px solid red; }      </style>      Name: <slot name="username"></slot>    `;      }    }  );</script>Listing 7-6	Using Slots (chapter7/slotted/index.html)

Please note that the ::slotted pseudo selector can’t descend any further into the slot. The following selectors are invalid:::slotted(div span) {  /* our slotted <div> does not match this */}::slotted(div) p {  /* can't go inside light DOM */}	Also, ::slotted can only be used in CSS. You can’t use it in querySelector to select. That’s not specific to Web Components: pseudo selectors can’t be used to select elements using the integrated selector API.
	The selector behavior is slightly different from libraries such as Sizzle (part of jQuery). Those libraries add some non-standard behavior and provide selector options the browser API doesn’t have. But I think that staying with the standard is the better option so avoid using such libraries just for convenience. If you need additional selections, add custom attributes.


## Слоты и композиция

## Спецификация Constructable Stylesheets

## Спецификация Declarative Shadow DOM

## Селективная стилизация хост-элемента

	Selecting a host element is the same as :host, but applied only if the shadow host matches the selector.
For example, say you’d like to center the <custom-dialog> only if it has a centered attribute, as shown in Listing 7-2.<template id="tmpl">  <style>    :host([centered]) {      position: fixed;      left: 50%;      top: 50%;      transform: translate(-50%, -50%);      border-color: blue;    }    :host {      display: inline-block;      border: 1px solid red;      padding: 10px;    }  </style>  <slot></slot></template><script>  customElements.define(     'custom-dialog',    class extends HTMLElement {      connectedCallback() {        this.attachShadow({ mode: 'open' }).append(tmpl.content.cloneNode(true));      }    }  );</script><custom-dialog centered> Centered! </custom-dialog><custom-dialog> Not centered. </custom-dialog>Listing 7-2	Applying the :host Selector (chapter7/select/index.html)

	Now the additional centering styles are only applied to the first dialog, <custom-dialog centered>.
	It’s a smart technique that unleashes the power of CSS on the level of custom attributes. In bigger and hence more complex applications it’s an advantage to avoid the usage of multiple data- attributes and nested classes and to replace them with simple top-level attributes. However, you should try to find a balance between those techniques. Creating a style system that is very closely bound to Web Components might be attractive at first glance. But the further away you go from established CSS, the bigger the risk is that using existing sets of style rules is almost impossible.

## Контекстная стилизация хост-элемента

There is another selector named :host-context that brings even more control. Using :host-context(selector) is done the same way as :host, but it’s applied only if the shadow host or any of its ancestors in the outer document matches the selector.
For example, :host-context(.dark-theme) matches only if there’s a dark-theme class on <custom-dialog> or anywhere above it (see Listing 7-3).<body class="dark-theme">  <!--    :host-context(.dark-theme) applies to custom-dialogs inside .dark-theme  -->  <custom-dialog>...</custom-dialog></body>Listing 7-3	Applying the :host-context Selector (chapter7/context/index.html)

	To summarize, you can use the :host family of selectors to style the main element of the component, depending on the context. These styles (unless !important) can be overridden by the document.
