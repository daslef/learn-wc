# Пользовательские встроенные элементы

Пользовательские встроенные элементы позволяют наследовать характеристики нативных элементов браузера, расширяя их функционал. Мы должны выбрать подходящий базовый класс, реализовать необходимую нам часть спецификации, описанной выше, добавить желаемый функционал и стили, зарегистрировать элемент в реестре, и его можно использовать.

Наследуясь от нативных элементов мы даем пользователю возможность взаимодействовать с чем-то уже знакомым ему. Также - снижаем сложность разработки, ведь нам не требуется переизобретать то, что уже работает - свойства, методы, синхронизацию с HTML-аттрибутами. С точки зрения доступности (a11y) такие элементы - также отличная точка старта для типовых задач.

### FancyButton

Допустим, мы хотим создать свою версию кнопки с некогда модным эффектом волны.

##### Реализация

Раз мы хотим создать свою версию `<button>`, значит наследоваться будем от `HTMLButtonElement`.

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

##### Результат

<iframe src="/custom-element/custom-element-button.html"  />

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

### Lazy Image

Закрепим навыки реализацией ленивой загрузки изображений, когда в случае медленного соединения мы первично загружаем заблёренную версию в низком разрешении и заменяем ее на оригинал по завершению его загрузки.

##### Реализация

Добавляем блёр к низкокачественному изображению

```css
body { height: 130px; }

img { height: 100%; }

.thumbnail { filter: blur(2px); }
```

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

##### Результат

Используем компонент в HTML

```html
    <img is="lazy-img" class="thumbnail" thumbnail="../lazy-load-thumbnail.jpg" original="../lazy-load-original.jpg">
```

...либо в JS

```js
const LazyImage = customElements.get('lazy-img');
const image = new LazyImage({ thumbnail: "../lazy-load-thumbnail.jpg", original: "../lazy-load-original.jpg" });
document.body.append(image)
```

<iframe id="lazyimage" src="/custom-element/custom-element-lazyimage.html"  />
<button onclick="document.querySelector('#lazyimage').contentDocument.location.reload(true);">Reload</button>
