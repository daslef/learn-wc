# Стилизация `ButtonComponent`

## Макет

[Макет Figma](https://www.figma.com/file/QXGa6qN6AqgeerCtS28I8z/Web-Components-Book-Design-Library?node-id=0%3A1)

## Стилизация через классы

Итак, хоть расширение `HTMLButtomElement` имеет свои явные преимущества, простроить в нем теневое дерево мы не можем, поэтому стилизацию будем вести во вне, а внутри будем лишь задавать имена классов.

Наиболее безопасное место, где мы можем назначить классы, это метод `connectedCallback`, который выполняется после размещения элемента в DOM.

```ts
// src/lib/components/button/Button.ts

export class ButtonComponent extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('button-component')
    }
}

customElements.define('button-component', ButtonComponent, { extends: 'button' })
```

Открыв инструменты разработчика в стори `Storybook`, мы должны увидеть на нашем элементе два класса: *primary* заданный через стори и *button-component* заданный только что.

## Хелпер для добавления глобальных стилей

В `Button.ts` объявим переменную `buttonStyles`, в которую поместим стили согласно макету `Figma`.

```ts
// src/lib/components/button/Button.ts

// ...
const buttonStyles = `
    .button-component {
        box-sizing: border-box;
        font-size: var(--font-body-md);
        font-weight: var(--font-weight-button);
        cursor: pointer;
        padding: 0;
    }
`;
// ...
```

Чтобы разместить эти стили в глобальном DOM, создадим вспомогательный метод *addStylesheet* и вызовем его после размещения в DOM.

```ts
// src/lib/components/button/Button.ts

export class ButtonComponent extends HTMLButtonElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.classList.add('button-component');
        this.addStylesheet();
    }

    addStylesheet() {
        const head = document.head;
        if (document.querySelector(`#button-component-style`)) {
            return;
        }

        const style = document.createElement('style');
        style.setAttribute('id', `button-component-style`);
        style.textContent = buttonStyles;
        head.appendChild(style);
    }
}

// ...
```

Мы императивно создаем элемент `<style>`, задаем ему идентификатор для поиска, размещаем в нем заданные ранее `buttonStyles` и прикрепляем к `<head>` документа. Так как документ уже может содержать экземпляр(ы) нашей кнопки, проверяем, не был ли блок стилей добавлен ранее.

Используйте инструменты разработчика чтобы проверить, почему и как оно работает.
