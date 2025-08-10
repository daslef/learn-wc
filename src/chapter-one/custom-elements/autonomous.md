# Автономные пользовательские элементы

Автономные пользовательские элементы - еще более мощный инструмент, позволяющий строить сложные компонентные композиции. Здесь мы уже не привязаны к нативным элементам: это значит, что теперь больше придется делать вручную, зато мы не связаны к их ограничениями. Это не значит, что они лучше, чем встроенные пользовательские элементы - факт в том, что они позволяют решать куда более серьезные задачи.

Начнем с адаптации классического примера про компонент для форматированного вывода даты и времени.

### Компонент `<date-format>`

Для отображения даты/времени в HTML  уже существует элемент `<time>`, но он не выполняет никакого форматирования. Создадим элемент `<date-formatted>`, который отображает дату в удобном формате с учётом языка.

##### Базовая реализация

```js
class DateFormatted extends HTMLElement {
    connectedCallback() {
        const [day, month, year] = this.getAttribute('date').split('.')
        const time = new Date(+year, +month - 1, +day)

        this.innerHTML = new Intl.DateTimeFormat("default", {
            day: this.getAttribute('day') || "numeric",
            month: this.getAttribute('month') || "long",
            year: this.getAttribute('year') || "numeric"
        }).format(time);
    }
}

customElements.define("date-formatted", DateFormatted);
```

```html
<date-formatted date="22.10.2025" year="2-digit"></date-formatted>
```

<iframe src="/custom-element/custom-element-time.html" height="50" />

Этот компонент использует встроенный форматировщик данных `Intl.DateTimeFormat`, хорошо поддерживаемый в браузерах, чтобы показать красиво отформатированные дату и время.

Содержимое элемента рендерится (создаётся) в `connectedCallback`. Когда вызывается `constructor`, рендерить его слишком рано, так как на этом этапе браузер ещё не обработал и не назначил атрибуты. Вызовы `getAttribute` вернули бы `null`.

`connectedCallback` срабатывает, когда элемент фактически добавляется в DOM-дерево документа. Таким образом, мы в `constructor` можем подготовить его к использованию, создать дочерние элементы, не добавляя в документ. А рендер произойдет только тогда, когда попадут на страницу.

В отличие от первого типа пользовательских элементов, при регистрации мы указываем только имя тега и класс с реализацией.

##### Свойства и атрибуты

В текущей реализации после того, как элемент отрендерился, дальнейшие изменения атрибутов не дают никакого эффекта. Это странно для HTML-элемента: когда мы изменяем атрибут, мы ожидаем, что изменение будет видно сразу. Важно, чтобы состояние элемента в JS было синхронизировано с отображением элемента в DOM-дереве.

Например, когда значения свойств `hidden` и `id` меняются через JS...

```js
div.id = 'my-id';
div.hidden = true;
```

...значения применяются и в DOM-дереве в виде атрибутов. И наоборот.

```<div id="my-id" hidden>```

##### Наблюдаемые атрибуты

Мы можем наблюдать за атрибутами, поместив их список в статический геттер `observedAttributes()`. При изменении указанных там атрибутов вызывается `attributeChangedCallback`.

```js
class DateFormatted extends HTMLElement {
    render() {
        const [day, month, year] = this.getAttribute('date').split('.')
        const time = new Date(+year, +month - 1, +day)

        this.innerHTML = new Intl.DateTimeFormat("default", {
            day: this.getAttribute('day') || "numeric",
            month: this.getAttribute('month') || "long",
            year: this.getAttribute('year') || "numeric"
        }).format(time);
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['date', 'year', 'month', 'day'];
    }

    attributeChangedCallback() {
        this.render();
    }
}

customElements.define("date-formatted", DateFormatted);

```

<iframe src="/custom-element/custom-element-time-2.html" height="50" />

Здесь логика рендеринга перенесена во вспомогательный метод `render()`. Мы вызываем его, когда элемент вставляется на страницу. При изменении одного из атрибутов, указанных в `observedAttributes()`, вызывается `attributeChangedCallback` и происходит перерисовка элемента.

Попробуйте поизменять значения атрибутов в инструментах разработчика: в отличие от стартовой реализации, оно отражается пользователю.

