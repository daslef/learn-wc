# Микро-библиотека `easy-wc`

## Функция `attachShadow`

Теперь каждый класс, декорированный через *@Component*, имеет в своем прототипе *ElementMeta* с информацией о разметке и стилях. Напишем функцию, которую можно будет вызывать в конструкторе такого класса, и которая абстрагирует пользователя библиотеки от деталей встраивания теневого DOM.

Задача этой функции - позволить пользователю библиотеки перейти от...

```ts
const shadowRoot = this.attachShadow(options);
const template = document.createElement("template");
// ...
shadowRoot.appendChild(template.content.cloneNode(true));
```

...к одной строке `attachShadow(this, options)`.

## Реализация

Создадим отдельную директорию `src/lib/easy-wc/template` с файлами `index.ts` и `shadow.ts`.

В `shadow.ts` создадим и экспортируем новую функцию *attachShadow*.

Согласно спецификациям, для создания и прикрепления теневого DOM нужны экземпляр класса и объект, принимающий опциональные настройки *mode*, *delegatesFocus* и *slotAssignment*. Поэтому определим в нашей функции два параметра: для контекста и настроек.

```ts
export function attachShadow(context: any, options?: ShadowRootInit) {
    const shadowRoot: ShadowRoot = context.attachShadow(
        options || { mode: "open" }
    );

    const template = document.createElement("template");
    template.innerHTML = ''
    shadowRoot.appendChild(template.content.cloneNode(true));
}
```

Наконец, зададим содержимое шаблона на основе информации из декоратора

```ts
template.innerHTML = `<style>${context.elementMeta.style}</style>${context.elementMeta.template}`;
```

Как в предыдущем шаге, выполним необходимые экспорты и попробуем импортировать функцию в *ButtonComponent*
