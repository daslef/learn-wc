# Компонент `<card-component>`

## Флоу разработки

В этом проекте будет использован следующий флоу разработки: компонент реализуется в `<X>.ts` и представляется в `<X>.stories.ts`.

## Проверка связки реализации и стори

Создадим директорию `src/lib/component/hello`, а в ней два файла: `Hello.ts` и `Hello.stories.ts`.

Для тестирования связки реализации и стори создадим в `Hello.ts` игрушечный компонент `<hello-component>`

```ts
export class HelloComponent extends HTMLElement {
    constructor() {
        super();
    }
}
```

После вызова конструктора базового класса зададим открытое теневое дерево, разместим в нем шаблон и зарегистрируем компонент.

```ts
export class HelloComponent extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `<span>Hello World</span>`;

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('hello-component', HelloComponent);
```

Пусть этот компонент слишком прост и не требует сам по себе использования теневого DOM и шаблонов, мы реализуем его с их помощью для проверки работоспособности этих API.

Чтобы представить компонент в Storybook, импортируем его в файле `Hello.stories.ts` и настроем стори.

```ts
import { HelloComponent } from "./Hello";

export const Hello = {}

export default {
  title: "Components/HelloComponent",
  render: () => `<hello-component></hello-component>`,
}
```

Storybook отслеживает файлы `*.stories.{(j|t)s}`, экспортирующие объект, описанный в соответствии с *Component Story Format*.

В этом объекте пока лишь два свойства, так как компонент простой:

- свойство *title*, заданное через слэш, будет отрисовано в боковой панели навигации Storybook как список `Components` с вложенной директорией `HelloComponent` - такой подход помогает структурировать компоненты.

- свойство *render* - функция, возвращающая разметку для отрисовки. В нашем случае, она должна вернуть `<hello-component>`. Позже мы будем передавать в нее аргументы для более тонкой настройки под различные динамические стори.

Сама стори здесь именуется *Hello*. Фигурные скобки определяют объект с настройками, передаваемыми в стори. Здесь он пустой, так как компонент не настраиваемый, но далее мы начнем передавать туда значения. Важно экспортировать его, чтобы `Storybook` добавил стори в каталог.

Добавим типизацию:
- импортируем типы *Meta* и *StoryObj* из модуля, реализующего отображение Веб Компонентов;
- добавим тип *StoryObj* для переменной *Hello*,
- и проверим, что наши настройки удовлетворяют типу *Meta*

Итоговый код `Hello.stories.ts`

```ts
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { HelloComponent } from "./Hello";

export const Hello: StoryObj<{}> = {}

export default {
  title: "Components/HelloComponent",
  render: () => `<hello-component></hello-component>`,
} satisfies Meta<{}>
```

В браузере перейдем по `http://localhost:6006/`, откроем директорию `HelloComponent`, выберем `Hello`. Должен отобразиться "Hello World"
