# Стилизация `<input-text>`

## Основная стори

Стили будем вносить в тег `<style>` в начале шаблона элемента. Как и ранее, используем дизайн-токены макета [Figma](https://www.figma.com/file/QXGa6qN6AqgeerCtS28I8z/Web-Components-Book-Design-Library?node-id=324%3A101), уже перенесенные в глобальную таблицу в виде CSS-переменных.

Стили для хостового элемента

```css
:host {
    display: block;
    font-family: var(--font-default);
    font-size: var(--font-body-sm);
}
```

Базовые стили для поля ввода

```css
input {
    height: var(--input-min-dimension);
    width: 100%;
    border-radius: var(--radius-sm);
    border: var(--border-default);
    font-size: var(--font-body-md);
    padding-left: var(--padding-sm);
    outline: none;
    box-sizing: border-box;
}
```

Стили для активного состояния поля ввода

```css
input:focus,
input:focus:hover,
input:active {
    border: var(--border-focus);
}
```

## Стори с ошибкой

Добавляем стили для состояния ошибки на поле ввода...

```css
.error,
.error:hover,
.error:focus,
.error:active {
    border: var(--border-error);
    outline: none;
    box-shadow: none;
    color: var(--color-error);
}
```

...и на контейнере с сообщениями

```css
.message {
    margin-top: var(--margin-xxs);
    color: var(--color-error);
    font-weight: var(--font-weight-default);
}
```

## Стори с выключенным элементом

Наконец, стили для выключенного состояния

```css
input[disabled] {
    opacity: var(---color-disable);
    background: var(--color-disable);
    border: var(--border-disable);
}

input[disabled]:hover,
input[disabled]:focus,
input[disabled]:active {
    border: var(--border-disable);
    outline: none;
    box-shadow: none;
}
```
