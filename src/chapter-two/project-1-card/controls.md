# Контролы в `Storybook`

Перед тем, как перейти к стилизации, научимся определять в `Storybook` различные варианты использования нашего `CardComponent`, в том числе с использованием контролов.

Сейчас содержимое `CardComponent` задается через слоты, но они заданы хардкодом. Контролы в `Storybook` дают возможность динамически изменять содержимое через пользовательский интерфейс, в том числе для ручной проверки поведения компонента в тех или иных ситуациях.

Контролы настраиваются в том же файле, где описаны стори. Определим контролы и зададим им всем текстовый тип, который будет отображен в интерфейсе как текстовое поле ввода.

## Задание контролов

```ts
// src/lib/component/card/Card.stories.ts

// ...
export default {
    // ...
    argTypes: {
        image: {
            control: { type: 'text' },
        },
        headline: {
            control: { type: 'text' },
        },
        content: {
            control: { type: 'text' },
        },
        link: {
            control: { type: 'text' },
        },
    }
};
```

## Динамический рендер

Текстовые значения, переданные в контролы, будут отправляться в функцию рендера. Пришло время изменить ее, чтобы она начала принимать эти значения и встраивать их в разметку.

```ts
// src/lib/component/card/Card.stories.ts

// ...
export default {
    // ...
    render({ image, headline, content, link }) => `
        <card-component>
            <img slot="header" src="${image}">
            <h4 slot="header">${headline ?? ""}</h4>
            <p slot="content">${content ?? ""}</p>
            <a href="#" slot="footer">${link ?? ""}</a>
        </card-component>`;
}
```

Используя `Storybook`, проверьте, что контролы работают, то есть внесение в них значений отображается в стори компонента.

## Значения по умолчанию

Также контролам могут быть выставлены значения по умолчанию. Для этого используется свойство `args`, но уже не в экспорте по умолчанию, а в конкретных стори.

```ts
// src/lib/component/card/Card.stories.ts

// ...

export const Card = {
    args: {
        image: 'https://images.unsplash.com/photo-1612392167062-8f76710986ba?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        headline: 'Food',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr ud exercitation ullamco laboris nisi ut aliquip ex ea comamodo consequat.',
        link: 'Read'
    }
};

// ...
```

## Типизация

Добавим типизацию:
- импортируем типы *Meta* и *StoryObj* из модуля, отвечающего за взаимодействие с Веб Компонентами,
- опишем типы аргументов *Args*, приходящих в функцию рендера,
- зададим для стори дженерик с использованием типов аргументов,
- схожим дженериком опишем тип дефолтного экспорта.

```ts
// src/lib/component/card/Card.stories.ts

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { CardComponent } from "./Card";

type Args = {
  image: string,
  headline: string,
  content: string,
  link: string
}

export const Card: StoryObj<Args> = {
  args: {
    image: 'https://images.unsplash.com/photo-1612392167062-8f76710986ba?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    headline: 'Food',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr ud exercitation ullamco laboris nisi ut aliquip ex ea comamodo consequat.',
    link: 'Read'
  }
}

export default {
  title: 'Components/CardComponent',
  render: ({ image, headline, content, link }: Args) => {
    return `<card-component>
              <img slot="header" src=${image} alt="food image" />
              <h4 slot="header">${headline ?? ""}</h4>
              <p slot="content">${content ?? ""}</p>
              <a href="#" slot="footer">${link ?? ""}</a>
           </card-component>`
  },
  argTypes: {
    image: {
      control: { type: 'text' },
    },
    headline: {
      control: { type: 'text' },
    },
    content: {
      control: { type: 'text' },
    },
    link: {
      control: { type: 'text' },
    },
  }
} satisfies Meta<Args>
```

