# Custom Elements

Эта спецификация является основой для разработки Веб Компонентов, ведь именно она дала возможность разработчикам расширять существующие нативные элементы, а также создавать новые HTML-элементы с нуля или на основе внешних кодовых баз. Это поддерживаемый веб-стандартами путь к созданию переиспользуемых компонентов на ванильных JS/HTML/CSS.

Мы можем создавать пользовательские HTML-элементы, описываемые нашим классом, со своими методами и свойствами, событиями и так далее. Мы можем определить их с помощью специального класса, а затем использовать, как если бы они всегда были частью HTML.

Когда мы добавляем элемент на страницу, нас редко волнует, как он работает внутри, но сейчас придется разобраться. Вспомним концепцию наследования, основу объектно-ориентированного программирования. Почти все элементы, которые мы размещаем в HTML/DOM, наследуются от класса `HTMLElement`. Так, элементы `<span>`, `<div>` и `<button>` создаются через `HTMLSpanElement`, `HTMLDivElement` и `HTMLButtonElement` соответственно. Все они наследуются от `HTMLElement`.

![htmlelement inheritance model](./assets/html-element-inheritance.jpg)

Если выполнить в браузере команду `document.createElement('div').constructor`, консоль вернет `ƒ HTMLDivElement() { [native code] }`.

Существует два вида пользовательских элементов:
1. Автономные пользовательские элементы – «полностью новые» элементы, расширяющие абстрактный класс HTMLElement.
2. Пользовательские встроенные элементы – элементы, расширяющие встроенные, например кнопку HTMLButtonElement и т.п.

Сначала мы познакомимся с их общими чертами, затем - с пользовательскими встроенными элементами, а после - перейдем к автономным.

## Спецификация пользовательских компонентов

Чтобы создать пользовательский элемент, нам нужно сообщить браузеру ряд деталей о нём: как его показать, что делать, когда элемент добавляется или удаляется со страницы и т.д.

```js
{
  constructor() {
    super();
    // элемент создан
    // можно выполнить предварительную настройку, но рендерить еще рано
  }

  connectedCallback() {
    // браузер вызывает этот метод при добавлении элемента в документ
    // может вызываться много раз, если элемент многократно добавляется/удаляется
    // здесь мы обычно задаем содержимое элемента (разметку) и рендерим его
  }

  disconnectedCallback() {
    // браузер вызывает этот метод при удалении элемента из документа
    // может вызываться много раз, если элемент многократно добавляется/удаляется
  }

  static get observedAttributes() {
    return [/* массив имён атрибутов для отслеживания их изменений */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // вызывается при изменении одного из перечисленных выше атрибутов
  }

  adoptedCallback() {
    // вызывается, когда элемент перемещается в новый документ
    // используется очень редко
  }

  // специфичные для элемента свойства и методы

  // пользовательские вспомогательные свойства и методы
}
```

Видим, что методов не много, и все они являются необязательными.

Итак, мы создаем класс с необходимыми нам методами, наследуясь от класса `HTMLElement` в случае автономных пользовательских элементов либо от более специфичного класса в случае со встроенными пользовательскими элементами. Далее - реализуем собственные вспомогательные функции, если нужно - стилизуем.

После этого регистрируем элемент через предназначенный для этого метод `customElements.define`, задавая ему название. Важно, что название должно содержать дефис, во избежание коллизий с нативными элементами. Так, *ui-div* будет корректным именованием, а *uidiv* и *div* - нет.

Готово - теперь можем использовать элемент как через HTML (просто добавить в документ, как любой нативный тег), так и через JS (createElement).

Важно понимать порядок рендеринга: когда HTML-парсер строит DOM, элементы обрабатываются друг за другом, родители до детей. Например, если у нас есть `<outer><inner></inner></outer>`, то элемент `<outer>` создаётся и включается в DOM первым, а затем `<inner>`. Это приводит к важным последствиям для пользовательских элементов: так, если пользовательский элемент пытается получить доступ к *innerHTML* в *connectedCallback*, он ничего не получает. Это происходит именно потому, что на этой стадии ещё не существуют дочерние элементы, DOM не завершён. HTML-парсер подключил пользовательский элемент `<user-info>` и теперь собирается перейти к его дочерним элементам, но пока не сделал этого. Если мы хотим передать информацию в пользовательский элемент, мы можем использовать атрибуты (они доступны сразу), отложить доступ к ним через setTimeout с нулевой задержкой (костыль, но работает), либо реализовать свой механизм общения между родителями и детьми через механизм `Custom Events`.

## Пользовательские встроенные элементы

Пользовательские встроенные элементы позволяют наследовать характеристики нативных элементов браузера, расширяя их функционал. Мы должны выбрать подходящий базовый класс, реализовать необходимую нам часть спецификации, описанной выше, добавить желаемый функционал и стили, зарегистрировать элемент в реестре, и его можно использовать.

Наследуясь от нативных элементов мы даем пользователю возможность взаимодействовать с чем-то уже знакомым ему. Также - снижаем сложность разработки, ведь нам не требуется переизобретать то, что уже работает - свойства, методы, синхронизацию с HTML-аттрибутами. С точки зрения доступности (a11y) такие элементы - также отличная точка старта для типовых задач.

#### FancyButton

Допустим, мы хотим создать свою версию `<button>`, значит наследоваться будем от `HTMLButtonElement`.

###### JS

```js
class FancyButton extends HTMLButtonElement {
    constructor() {
        super();
        this.addEventListener('click', e => this.drawRipple(e));
    }

    drawRipple(event) {
        const circle = document.createElement("span");
        const radius = Math.max(this.clientWidth, this.clientHeight) / 2;
        circle.style.width = circle.style.height = `${radius}px`;
        circle.style.left = `${event.clientX - (this.offsetLeft + radius)}px`;
        circle.style.top = `${event.clientY - (this.offsetTop + radius)} px`;
        circle.classList.add("ripple");
        this.appendChild(circle);
    }
}

customElements.define('fancy-button', FancyButton, { extends: 'button' });
```

Здесь вызовом `super()` мы получаем все свойства и методы `<button>`, нам не нужно заботиться о состоянии *disabled*, методе *click()*, слушателях событий и так далее. От себя мы добавили только функционал анимации. Его можно было бы добавить и извне, получив обычную кнопку и обернув ее дополнительным функционалом, и это было бы равноценной альтернативой, но без инкапсуляции. Аналогично, если бы анимация решалась только CSS-стилями, можно было бы ограничиться добавлением к элементу CSS-класса, и это также можно было бы сделать без создания отдельного пользовательского встроенного элемента. Всё решается командой разработки.

При регистрации элемента мы указываем название тега, название класса с реализацией и третий аргумент, определяющий имя тега, который мы расширяем. Третий аргумент важен потому, что многие HTML-теги шерят между собой общий DOM-интерфейс: например, `<section>`, `<address>` и `<em>` используют `HTMLElement`, а `<q>` и `<blockquote>` оба являются HTMLQuoteElement. Уточняя `{extends: 'blockquote'}` мы даем браузеру знать, что мы регистрируем надстройку над `<blockquote>`, а не над `<q>`.

###### Результат

<iframe src="/custom-element-button.html"  />

Теперь мы можем использовать этот элемент декларативно, в HTML

```html
<button is="fancy-button" disabled>Fancy button!</button>
```

...а также создавать императивно в JS

```js
const button = document.createElement('button', { is: 'fancy-button' });
button.textContent = 'Fancy button!';
button.disabled = true;
document.body.appendChild(button);

const button2 = new FancyButton();
button2.textContent = 'Fancy button!';
document.body.appendChild(button2);
```

#### Lazy Image

Закрепим навыки реализацией ленивой загрузки изображений, когда в случае медленного соединения мы первично загружаем заблёренную версию в низком разрешении и заменяем ее на оригинал по завершению его загрузки.

###### CSS

Добавляем блёр к низкокачественному изображению

```css
body { height: 130px; }

img { height: 100%; }

.thumbnail { filter: blur(2px); }
```

###### JS

Определяем элемент, давая возможность задать ссылки на тамбнэйл и оригинал изображения как через HTML-атрибуты, так и программно через параметры конструктора

```js
customElements.define('lazy-img', class extends HTMLImageElement {
    constructor(props = {}) {
        super();
        const originalSrc = this.getAttribute('original') || props.original
        const thumbnailSrc = this.getAttribute('thumbnail') || props.thumbnail
        this.src = thumbnailSrc
        this.loadOriginal(originalSrc).then(originalImage => {
            this.src = originalImage.src
            this.classList.remove('thumbnail')
        })
    }

    loadOriginal(originalSrc) {
        const originalImage = new Image()
        return new Promise((resolve, reject) => {
            originalImage.onload = () => resolve(originalImage);
            originalImage.onerror = reject;
            setTimeout(() => {
                originalImage.src = originalSrc;
            }, 2_000)
        })
    }
}, { extends: 'img' });
```

###### Результат

Используем компонент в HTML

```html
    <img is="lazy-img" class="thumbnail" thumbnail="./lazy-load-thumbnail.jpg" original="./lazy-load-original.jpg">
```

...либо в JS

```js
const LazyImage = customElements.get('lazy-img');
const image = new LazyImage({ thumbnail: "./lazy-load-thumbnail.jpg", original: "./lazy-load-original.jpg" });
document.body.append(image)
```

<iframe id="lazyimage" src="/custom-element-lazyimage.html"  />
<button onclick="document.querySelector('#lazyimage').contentDocument.location.reload(true);">Reload</button>

## Автономные пользовательские элементы



## Примечания

####

There is a catch, though—and it’s one that won’t really affect you until you get into more complex things. All the same, it’s good to bring this up now: customElements .define will throw an error if you’ve already defined a tag. This will definitely come up later when we use a newer JS feature called import, where we include our element anywhere we need to reference something in it.
 	For now, we can mimic this bad behavior by calling customElements.define twice in a row: customElements.define('my-custom-tag', class extends HTMLElement {}); customElements.define('my-custom-tag', class extends HTMLElement {});
We get the following error: Failed to execute 'define' on 'CustomElementRegistry': this name has already been used with this registry
Thankfully, this is easy enough to handle. We can determine if our custom element has already been defined by asking if customElements.get('my-custom-tag') returns something. By wrapping it in an if/then statement, we ensure that our element is defined only when we first call it:
 if (!customElements.get('my-custom-tag')) { customElements.define('my-custom-tag', class extends HTMLElement {}); }

####

## Поддержка браузерами
Полифилл https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements
