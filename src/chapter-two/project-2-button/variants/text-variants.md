# Стилизация `ButtonComponent`

## Макет

[Макет Figma](https://www.figma.com/file/QXGa6qN6AqgeerCtS28I8z/Web-Components-Book-Design-Library?node-id=0%3A1)

## Стилизация варианта *primary*

```ts
// src/lib/components/button/Button.ts

// ...
const buttonStyles = `
    .button-component.primary {
        background: var(--color-blue-500);
        border: 2px solid var(--color-blue-500);
        border-radius: 12px;
        min-height: 44px;
        min-width: 180px;
        color: var(--color-white);
    }
`;
// ...
```

## Стилизация варианта *secondary*

Определим новую стори и передадим туда соответствующий *variant*

```ts
// src/lib/components/button/Button.stories.ts

// ...
export const Secondary: StoryObj<Args> = {
    args: {
        label: "Тест",
        variant: "secondary"
    }
}
// ...
```

В макете этот вариант имеет белый фон с синей границей и синим текстом.
Добавим в `buttonStyles` следующие стили.

```ts
// src/lib/components/button/Button.stories.ts

// ...

const buttonStyles = `
    // ...
    .button-component.secondary {
        background: var(--color-white);
        border: 2px solid var(--color-blue-500);
        border-radius: 12px;
        min-height: 44px;
        min-width: 180px;
        color: var(--color-blue-500);
    }
`

// ...
```
