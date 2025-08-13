# Компонент `<input-text>`

## Подготовка окружения

Можно взять за основу исходную версию репозитория либо его состояние после выполнения проекта `<card-component>`.

Создайте директорию `src/lib/components/input-text` и три файла:
- `TextInput.ts`,
- `TextInput.stories.ts`,
- `types.ts`.

Наполните их содержимым для проверки связки со `Storybook`

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' })
    }
}

customElements.define('input-text', TextInputComponent)
```

```ts
// src/lib/components/input-text/TextInput.stories.ts

import { html } from "lit-html";
import { TextInputComponent } from "./TextInput";

export const Primary = {}

export default {
    title: "Components/Inputs/TextInput",
    component: "input-text",
    render: () => html`<form><input-text></input-text></form>`
}
```

Запустите `Storybook` и  проверьте наличие элемента.
