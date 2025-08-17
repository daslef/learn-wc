# Стилизация состояний `ButtonComponent`

По макетам [Figma](https://www.figma.com/file/QXGa6qN6AqgeerCtS28I8z/Web-Components-Book-Design-Library?node-id=0%3A1) стилизуем состояния кнопки. Все варианты имеют одинаковые состояния, поэтому достаточно стилизовать их единожды.

## Состояние `:focus`

Добавим в конец `buttonStyles` блок с псевдоселектором *:focus*

```ts
// src/lib/components/button/Button.ts

// ...

const buttonStyles = `
    // ...
    .button-component:focus {
        background: var(--color-white);
        color: var(--color-black);
        border: 2px solid var(--color-black);
        outline: none;
    }
`

// ...
```

Теперь во всех трех вариантах кнопки в `Storybook` при фокусировке должны применяться эти стили.  Для фокусировки кликните по пустому пространству на странице со стори и далее нажмите кнопку *Tab* на клавиатуре.

## Состояние `:active`

Добавим в конец `buttonStyles` блок с псевдоселектором *:active*

```ts
// src/lib/components/button/Button.ts

// ...

const buttonStyles = `
    // ...
    .button-component:active {
      background: var(--color-white);
      color: var(--color-neutral-500);
      border: 2px solid var(--color-neutral-500);
      outline: none;
    }
`

// ...
```

Теперь во всех трех вариантах кнопки в `Storybook` при фокусировке должны применяться эти стили.  Для проверки сначала сфокусируйтесь на элементе кнопкой *Tab*, а далее нажмите *пробел* либо *Enter*.

## Состояние `disabled`

Теперь нужно обработать неинтерактивное состояние. При этом нужно, чтобы это состояние могло быть наложено на любой из трех вариантов и работать одинаковым образом. Оно не является отдельным вариантом, поэтому для него создадим еще один параметр.

```ts
// src/lib/components/button/Button.stories.ts

// ...

type Args = (TextArgs | IconArgs) & { disabled?: boolean }

// ...

export const Disabled: StoryObj<Args> = {
  args: {
    variant: "primary",
    label: "Тест",
    disabled: true
  }
}

// ...

export default {
    // ...
    render: (args: Args) => {
        if (args.variant === "icon") {
            const icons = {
                bookmark: iconBookmark,
                x: iconX
            }

            return html`
                <button is="button-component" class=${args.variant} ?disabled=${args.disabled}>
                    <img src=${icons[args.icon]} alt=${args.icon} />
                </button>
            `
        }

        return html`<button is="button-component" class=${args.variant} ?disabled=${args.disabled}>${(args as TextArgs).label}</button>`
    }
}

```

Добавим в конец `buttonStyles` блок с селектором *[disabled]*

```ts
// src/lib/components/button/Button.ts

// ...

const buttonStyles = `
    // ...
    .button-component[disabled] {
      opacity: var(---color-disable);
      background: var(--color-disable);
      border: var(--border-disable);
      color: var(--color-neutral-500);
      cursor: default;
      pointer-events: none;
    }
`

// ...
```

Проверьте новую стори в `Storybook`. Заодно убедитесь, что неинтерактивный элемент не принимает фокус и активное состояние.

