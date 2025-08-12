# Компонент `<input-text>`

## Подготовка окружения

Можно взять за основу исходную версию репозитория либо его состояние после выполнения проекта `<card-component>`.

Создайте директорию `src/lib/components/TextInput` и два файла:
- `TextInput.ts`,
- `TextInput.stories.ts`.

Наполните содержимым для проверки связки со `Storybook`

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' })
    }
}

customElements.define('input-text', TextInputComponent)
```

```ts
// src/lib/components/TextInput/TextInput.stories.ts

import { html } from "lit-html";
import { TextInputComponent } from "./TextInput";

const PrimaryTemplate = ({}) =>
    html`<form><input-text></input-text></form>`;

export const Primary = PrimaryTemplate.bind({});

export default {
    title: "Components/Inputs/TextInput",
    component: "input-text",
}
```

Запустите `Storybook` и  проверьте наличие элемента.
