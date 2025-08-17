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
