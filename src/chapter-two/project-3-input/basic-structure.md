# Базовая структура `<input-text>`

## Стартовый код

После предыдущего шага мы остановились на следующей реализации

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

## Структура элемента

Ориентируясь на описание функционала и дизайн компонента в [Figma](https://www.figma.com/file/QXGa6qN6AqgeerCtS28I8z/Web-Components-Book-Design-Library?node-id=324%3A101), наш элемент должен содержать в своем структуре `HTMLInputElement` (как минимум чтобы не реализовывать весь его функционал с нуля).

Мог возникнуть вопрос, почему не наследовать сам `TextInputComponent` от класса `HTMLInputElement`? Дело в том, что (а) в таком случае мы потеряем возможность использовать теневой DOM и (б) наш элемент не будет связан с формой.

Теневой DOM должен содержать два важных узла:
- `HTMLSectionElement`, содержащий текстовый `HTMLInputElement`;
- `HTMLSectionElement` с сообщением о состоянии валидации.


```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template')
        template.innerHTML = `
            <section class="control">
                <input type="text" />
            </section>
            <section class="message"></section>`

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.append(template.content.cloneNode(true))
    }
}

customElements.define('input-text', TextInputComponent)
```

Можно было вложить внутрь и элемент `HTMLLabelElement`, но в текущей реализации предлагаем размещать его не внутри нашего `TextInputComponent`, а рядом с ним.

Проверьте отображение элемента в `Storybook`.
