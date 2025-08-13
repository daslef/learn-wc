# Альтернативные состояния

## Состояние *disabled*

Последнее, что будет сделано перед стилизацией, это обработка состояния *disabled* и реализация стори для отображения поведения элемента в этом состоянии.

Элементы формы могут быть *disabled* через явное задание соответствующего атрибута либо наследуя его от родительского `<fieldset>`.

Пользовательские элементы, связанные с формой, имеют доступ к коллбэку `formDisabledCallback`: на вход он получает текущее состояние атрибута *disabled* и мы можем перенаправить его на поле ввода, аналогично атрибутам *required* и *value* ранее.

```ts

// ...

formDisabledCallback(disabled) {
    this.disabled = disabled;
}

set disabled(value: boolean | string) {
    if (String(value) === "true") {
        this.input.setAttribute("disabled", "true");
	}

	if (String(value) === "false") {
        this.input.removeAttribute("disabled");
	}
}

get disabled() {
    return this.input.disabled;
}

// ...
```

Добавьте атрибут *disabled* в массив наблюдаемых атрибутов и включите в свитч для реакции на его изменения.


## Альтернативные стори

До этого момента для визуальной репрезентации нашего компонента в `Storybook` всего использовался один и тот же шаблон *PrimaryTemplate* и одна стори *Primary*.

По хорошему, каждому визуальному состоянию (базовое, ошибка, недоступное) должна соответствовать отдельная стори.

Создадим шаблон и стори для недоступного состояния, реализованного ранее.

```ts
// src/lib/components/TextInput/TextInput.stories.ts

// ...
const DisabledTemplate = ({}) =>
    html`<input-text disabled name="test-input"></input-text>`;

export const Disabled = DisabledTemplate.bind({});

DisabledTemplate.args = {};
// ...
```

Аналогично зададим шаблон и стори для состояния ошибки. Здесь мы принимаем на вход валидатор и помимо прочего имитируем пользовательские действия установки фокуса и снятия фокуса с элемента.

```ts
// src/lib/components/TextInput/TextInput.stories.ts

// ...
const ErrorTemplate = ({}) => {
    setTimeout(() => {
        const input = document.querySelector(`[name="username"]`);
        input.validator = validators["username"];
        input.focus();
        input.blur();
    }, 0);

    return html`<input-text
        type="text"
        id="username"
        name="username"
        required
        class="form-control"
        ></input-text>`;
};

export const Error = ErrorTemplate.bind({});

ErrorTemplate.args = {};
// ...
```

Чтобы методы `input.focus()` и `input.blur()` работали, нужно вернуться к `TextInput.ts` и добавить эти методы по аналогии с тем, что мы уже не раз делали: переадресовывая их на соответствующие методы поля ввода.
