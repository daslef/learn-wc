# Базовая реализация `ButtonComponent`

## Подготовка окружения

Можно взять за основу исходную версию репозитория либо его состояние после выполнения предыдущего проекта.

Создайте директорию `src/lib/components/button` и три файла:
- `Button.ts`,
- `Button.stories.ts`,
- `types.ts`.

## Базовая реализация

Начнем описывать наш пользовательский встроенный элемент

```ts
// src/lib/components/button/Button.ts

export class ButtonComponent extends HTMLButtonElement {
    constructor() {
        super();
    }
}

customElements.define('button-component', ButtonComponent, { extends: 'button' })
```

Здесь, как и ранее, мы регистрируем наш элемент в `CustomElementRegistry`, но добавляя третий аргумент: объект, в котором описываем, какой нативный элемент мы расширяем.

Для задания варианта отображения мы также можем использовать html-атрибут, назвав его, например, *variant*, добавить его в *observedAttributes* и реагировать на его изменения в *attributeChangedCallback*, как мы делали в прошлом проекте. Но здесь проще обойтись обычным CSS-классом.

Также, так как мы используем, по сути, обычную кнопку, задание текста в HTML будет производиться как `<button is="button-component">Текст кнопки</button>`, что тем более не требует какой-либо настройки.

```ts
// src/lib/components/button/Button.stories.ts

import { html } from "lit-html";
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { ButtonComponent } from "./Button";

type TextArgs = {
  label: string,
  variant: "primary" | "secondary"
}

type IconArgs = {
  variant: "icon",
  icon: "bookmark" | "x";
}

type Args = TextArgs | IconArgs

export const Primary: StoryObj<Args> = {
    args: {
        label: "Тест",
        variant: "primary"
    }
}

export default {
  title: "Components/Button",
  component: "button-component",
  render: (args: Args) => html`<button is="button-component" class=${args.variant}>${args.label}</button>`
} satisfies Meta<Args>
```

Здесь мы сразу определяем два параметра (текст кнопки и ее вариант), типизируем их и используем для динамической отрисовки. В отличии от предыдущего проекта, мы не отображаем наш элемент как `<button-component>`, а используем обычную кнопку, ссылаясь на имя нашего элемента через атрибут *is*.

Запустите `Storybook` и  проверьте наличие элемента.
