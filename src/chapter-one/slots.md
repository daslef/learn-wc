# Slots API

Слот - это место, куда может быть добавлена разметка. Слот работают в связке с теневыми деревьями, могут существовать вне Веб Компонента или внутри него, могут работать в связке с шаблонами (но это не является требованием).

## Компонент `<custom-nav>`

Многим типам компонентов, таким как вкладки, меню, галереи изображений и другие, нужно какое-то содержимое для отображения.

Так же, как встроенный в браузер `<select>` ожидает получить контент пунктов `<option>`, компонент `<custom-nav>` может ожидать логотип и ссылки для навигации.

#### Базовая реализация

Определим структуру

```html
<template id="tmpl">
    <style>
        :host {
            display: flex;
            gap: 1.5rem;
            align-items: baseline;
        }

        .brand_wrapper {
            margin-right: auto;
        }

        ::slotted([slot="brand"]) {
            color: pink;
        }

        ::slotted(a) {
            text-decoration: none;
        }
    </style>

    <h1 class="brand_wrapper">
        <slot name="brand"></slot>
    </h1>
    <slot name="item"></slot>
</template>
```

```js
customElements.define('custom-nav', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: "open" })
        this.shadowRoot.append(tmpl.content.cloneNode(true))
    }
});
```

Теперь используем

```html
<custom-nav>
    <a slot="brand" href="/">
        <img src="/brand.png" alt="logo" />
        <span>Smart</span>
    </a>
    <a slot="item" href="/products">Storefront</a>
    <a slot="item" href="/about">About Us</a>
</custom-nav>
```

<iframe src="/template/template-slots-nav-1.html" />

Итак, связка происходит через атрибуты `name` и `slot`. Браузер осуществляет для каждого элемента `<slot name="X">` в теневом DOM соответствующие ему элементы с атрибутом `slot="X"` в обычном DOM и отрисовывает их в слотах. Элементы `<slot>`, размещенные в теневом DOM, наполняются контентом из обычного, «светлого» DOM-дерева - этот процесс называют *композицией*. Тем самым образуется *flattened DOM*, по сути виртуальный, существующий только для отрисовки и обработки событий. Но реально узлы в документе никуда не перемещаются, что можно проверить программными вызовами `querySelector` и подобных ему API.

Рассмотрите пример в инструментах разработчика, чтобы понять, как это выглядит визуально.

## Особенности слотов

#### Подстановка нескольких элементов в один слот

Если сразу несколько элементов в обычном DOM имеют один и тот же атрибут `slot`, они будут добавлены в слот все, в порядке очереди.

Это уже было проиллюстрировано в примере выше

```html
<custom-nav>
    <!-- ... -->
    <a slot="item" href="/products">Storefront</a>
    <a slot="item" href="/about">About Us</a>
</custom-nav>
```

#### Доступны прямым наследникам

Атрибут `slot="..."` допускается только для прямых потомков теневого хоста (в нашем примере - элемента `<custom-nav>`). Для более глубоких элементов этот атрибут игнорируется.

```html
<custom-nav>
    <a slot="brand" href="/">
        <img src="/brand.png" alt="logo" />
        <span>Smart</span>
    </a>
    <ul>
        <li>
            <a slot="item" href="/products">Storefront</a>
        </li>
        <li>
            <a slot="item" href="/about">About Us</a>
        </li>
    </ul>
</custom-nav>
```

В этом примере оба элемента `<a slot="item" ...>` будут проигнорированы, так как не являются прямыми наследниками `<custom-nav>`.

#### Значения "по умолчанию"

Мы можем задавать слотам значения по умолчанию, которые будут применены, если на этот слот не будет запроса. Так, если для большинства случаев всплывающий диалог должен иметь кнопку для его закрытия, мы можем встроить ее по умолчанию. Возможность заменять его на свой у пользователя компонента останется.

###### Реализация

```html
<template id="tmpl">
    <dialog id="dialog">
        <slot name="header"><h2>Диалоговое окно<h2></slot>
        <slot name="content"></slot>

        <form method="dialog">
            <slot name="close-trigger">
                <button id="button-close">Ок</button>
            </slot>
        </form>
    </dialog>
    <button id="button-open">Открыть</button>
</template>

<custom-dialog></custom-dialog>
```

```js
customElements.define('custom-dialog', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: "open" })
        this.shadowRoot.append(tmpl.content.cloneNode(true))
        this.shadowRoot.querySelector('#button-open').addEventListener('click', () => {
            this.shadowRoot.querySelector('#dialog').showModal()
        })
    }
});
```

###### Результат

<iframe src="/template/template-slots-nav-2.html" />

При использовании мы не передали элементы ни в один из слотов. Так как *header* и *close-trigger* имели содержимое по умолчанию, оно отобразилось. Слот *content* остался пустым.

Если мы передадим туда свои значения, они применятся.

```html
<!-- ... -->
<custom-dialog>
    <h2 slot="header">Внимание</h2>
    <p slot="content">Подтвердите операцию</p>
</custom-dialog>
```

<iframe src="/template/template-slots-nav-3.html" />

*Задание: сейчас при перезадании кнопки открытия важно указывать верный идентификатор, иначе селектор не найдет элемент. Сделайте так, чтобы источником события открытия мог явиться любой элемент, не обязательно кнопка*

#### Слот без имени

Первый `<slot>` в теневом дереве без атрибута *name* является слотом по умолчанию. Он будет отображать данные со всех узлов светлого дерева, не добавленные в другие слоты. Все эти неотмеченные слотами узлы будут собираться в безымянный слот друг за другом, также в порядке очереди.

Например, в пользовательской реализации элемента карточки можно добавлять всю не занесенную в слоты информацию в выпадающий блок *детали*.

*Задание: реализовать пользовательский элемент `<custom-card>` с учетом требования абзаца выше*


#### Обновление слотов

Браузер наблюдает за слотами и обновляет отображение при добавлении и удалении элементов в слотах.

Таким образом, нам ничего не нужно делать для обновления отображения. Но если код компонента хочет узнать об изменениях в слотах, можно использовать событие `slotchange`.

```js
customElements.define('custom-nav', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: "open" })
        this.shadowRoot.append(tmpl.content.cloneNode(true))
        this.shadowRoot.querySelector('slot[name="item"]').addEventListener('slotchange', (e) => {
            console.log(e)
            this.animate()
        })
    }

    animate() {

    }
});

document.querySelector('#login-button').addEventListener('click', event => {
    event.target.remove()
    document.querySelector('custom-nav')?.insertAdjacentHTML(
        'beforeend',
        '<button slot="item">Log Out</button>'
    )
})
```

<iframe src="/template/template-slots-nav-4.html" />

*Задание: допишите метод `animate()` с использованием одной из популярных JS-библиотек (*Motion*, *Anima* и др.), чтобы добавление и удаление элементов в слотах происходило анимированно*

#### Вспомогательные API

Если у теневого дерева стоит открытый режим, то мы можем выяснить, какие элементы находятся в слоте, и, наоборот, определить слот по элементу, который в нём находится:

`node.assignedSlot` – возвращает элемент `<slot>`, в котором находится узел;

`slot.assignedNodes({ flatten: true/false })` и `slot.assignedElements({flatten: true/false})` – возвращают DOM-узлы и DOM-элементы, которые находятся в слоте (flatten по умолчанию false, если изменить значение на true, она просматривает развёрнутый DOM глубже и возвращает вложенные слоты).

Эти методы можно использовать не только для отображения содержимого, которое находится в слотах, но и для его отслеживания в JavaScript.
