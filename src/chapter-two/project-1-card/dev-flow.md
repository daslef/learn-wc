# Компонент <card-component>

## Флоу разработки

В этом проекте будет использован следующий флоу разработки: компонент реализуется в `<X>.ts` и представляется в `<X>.stories.ts`.

## Проверка связки реализации и стори

Создадим директорию `src/lib/component/hello`, а в ней два файла: `Hello.ts` и `Hello.stories.ts`.

Для тестирования связки реализации и стори создадим в `Hello.ts` игрушечный компонент <hello-component>

```js
export class CardComponent extends HTMLElement {
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

export default {
    title: "Components/Hello",
};
```

Storybook отслеживает файлы `*.stories.{(j|t)s}`, экспортирующие объект, описанный в соответствии с *Component Story Format*. Свойство *title*, заданное через слэш, будет отрисовано в боковой панели навигации Storybook как список `Components` с вложенной директорией `Hello` - такой подход помогает структурировать компоненты.

Помимо экспорта по умолчанию с настройками стори мы делаем один или несколько именованных экспортов с самими стори.

Для начала зададим Storybook-шаблон. Это всего лишь функция, возвращающая разметку. В нашем случае, она должна вернуть `<hello-component>`.

```js
const PrimaryTemplate = () => `<hello-component></hello-component>`;
```

Теперь делаем именованный экспорт `HelloComponent` на основе `PrimaryTemplate`.

```js
export const HelloStory = PrimaryTemplate.bind({});
```

Фигурные скобки определяют объект с настройками, передаваемыми в стори. Здесь он пустой, так как компонент не настраиваемый, но далее мы начнем передавать туда значения.

Итоговый код `Hello.stories.ts`

```ts
import { HelloComponent } from "./Hello";

const PrimaryTemplate = () => `<hello-component></hello-component>`;

export const HelloStory = PrimaryTemplate.bind({});

export default {
    title: "Components/HelloComponent",
};
```

В браузере перейдем по `http://localhost:6006/`, откроем директорию `Components`, выберем `HelloComponent`. Должен отобразиться "Hello World"
