# Стилизация `ButtonComponent`

## Макет

[Макет Figma](https://www.figma.com/file/QXGa6qN6AqgeerCtS28I8z/Web-Components-Book-Design-Library?node-id=0%3A1)

## Стилизация варианта с иконкой

Здесь будет немного сложнее, так как предстоит поработать с *svg*. Добавим два встроенных варианта иконки, но пользователь компонента будет иметь возможность добавлять и свои.

Используем иконки *x-mark* и *bookmark* с ресурса [heroicons](https://heroicons.com/). Скопируем их *svg* и разместим в соответствующих файлах *icon-x.svg* и *icon-bookmark.svg* в директории `src/lib/components/button/assets`. Наконец, импортируем в `Button.stories.ts`.

```ts
// src/lib/components/button/Button.stories.ts

// ...

import iconBookmark from './assets/icon-bookmark.svg'
import iconX from './assets/icon-x.svg'

// ...

export const Icon: StoryObj<Args> = {
  args: {
    variant: "icon",
    icon: "bookmark"
  }
}

// ...
```

Добавим в `buttonStyles` стили для кнопки и вложенной иконки

```ts
// src/lib/components/button/Button.ts

// ...

const buttonStyles = `
    // ...
    .button-component.icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-white);
      border: 2px solid var(--color-blue-500);
      border-radius: 12px;
      height: 44px;
      width: 44px;
      color: var(--color-blue-500);
      padding: var(--padding-xs);
    }
    .button-component.icon svg {
        width: 100%;
        height: 100%;
    }
`

// ...
```

Наконец, обновим функцию рендера

```ts
// src/lib/components/button/Button.stories.ts

// ...

export default {
  title: "Components/Button",
  component: "button-component",
  render: (args: Args) => {
    if (args.variant === "icon") {
      const icons = {
        bookmark: iconBookmark,
        x: iconX
      }

      return html`
        <button is="button-component" class=${args.variant}>
          <img src=${icons[args.icon]} alt=${args.icon} />
        </button>
      `
    }

    return html`<button is="button-component" class=${args.variant}>${(args as TextArgs).label}</button>`
  }
} satisfies Meta<Args>
```

В стори должна отрисоваться иконка с закладкой.

## Контрол для иконок

Если поменять значение поля *icon* в контролах на *x*, отрисуется иконка закрытия. Но можно сделать удобнее: предоставить выпадающий список с доступными вариантами.

```ts
// src/lib/components/button/Button.stories.ts

// ...
export default {
    // ...
    argTypes: {
        icon: {
            control: { type: "select" },
            options: ['x', 'bookmark']
        }
    },
    // ...
} satisfies Meta<Args>
```
