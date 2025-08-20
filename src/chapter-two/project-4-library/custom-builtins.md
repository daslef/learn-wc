# Микро-библиотека `easy-wc`

## Пользовательские встроенные элементы

Пока наша библиотека поддерживает только автономные и ассоциированные с формой элементы. Для поддержки пользовательских встроенных элементов и последующего рефакторинга *ButtonComponent* нам нужно учесть отличия при регистрации элементов (объект со свойством *extends*) и ограничения по теневому DOM (отсутствие его поддержки в большинстве встроенных элементов).

## Изменения в *@Component* и *ElementMeta*

Добавим новое опциональное свойство *custom* к интерфейсу *ElementMeta* и выставим его тип как *ElementDefinitionOptions*.

В декораторе будем определять, задано ли свойство *custom*, и если да, то передавать его значение в `customElements.define`

```ts
// src/lib/easy-wc/decorator/component.ts

export interface ElementMeta {
    custom?: ElementDefinitionOptions;
    selector?: string;
    style?: string;
    template?: string;
}

export function Component(meta: ElementMeta) {
  return (target: CustomElementConstructor) => {
    target.prototype.elementMeta = {
      style: meta.style ?? "",
      template: meta.template ?? "",
    };

    if (meta.selector && !meta.custom) {
      customElements.define(meta.selector, target)
    } else if (meta.selector && meta.custom) {
      customElements.define(meta.selector, target, meta.custom)
    }

    return target;
  };
}
```

## Особенности стилизации

Сейчас в *ButtonComponent* стили добавляются в элемент `<style>`, который прикрепляется к `<head>` документа. Это происходит в методе *addStylesheet()*

```ts
addStylesheet() {
    const head = document.head;
    if (document.getElementById(`in-button-style`)) {
        return;
    }

    const style = document.createElement('style');
    style.setAttribute('id', `in-button-style`);
    style.textContent = buttonStyles;

    head.appendChild(style);
}
```

В этом коде довольно легко выделить общий паттерн и вынести в отдельную функцию, но аналогии с *attachShadow*.

Но представим случай, когда *пользовательский встроенный элемент* добавляется в теневой DOM *автономного пользовательского элемента*. Тогда теневой DOM не даст этим стилям примениться: в теневой DOM снаружи проникают только CSS-переменные.

Поэтому мы должны смотреть по ситуации: либо прикреплять стили в теневой DOM, либо в `<head>` документа. Напишем алгоритм всплытия по DOM дереву с проверкой теневой границы: если мы обнаруживаем ее, то крепим стили туда, иначе - всплываем до уровня глобальных стилей.


Создадим файл `src/lib/easy-wc/template/style.ts` и определим в нем функцию `closestRoot`. Наша задача - найти ближайший к стилизуемому элементу корневой узел. Метод `getRootNode`, определенный на HTML-элементах, возвращает корневой узел: `ShadowRoot` либо `document`. Если это `document` - крепим стили в `<head>`, если найден иной корневой узел - мы нашли `ShadowRoot`.

```ts
function closestRoot(baseElement: Element): any {
    if (baseElement.getRootNode() !== document) {
        return baseElement.getRootNode();
    }

    return document.head;
}
```

## Функция *attachStyle*

Теперь можем написать функцию *attachStyle*, которая будет объединять исходную логику с проверкой корневых узлов.

```ts
export function attachStyle(context: any): void {
    const closest = closestRoot(context);

    const styleElement = document.createElement("style");
    styleElement.innerText = context.elementMeta.style;

    closest.appendChild(styleElement);
}
```

Это будет работать для одного экземпляра элемента. Представим, что работаем над списком или таблицей - там будет много экземпляров. В таком случае мы добавим большое количество дубликатов стилей. Один из подходов - выставлять на `<style>` идентификаторы согласно свойству *selector* и проверять, не были ли соответствующие стили уже добавлены.

```ts
export function attachStyle(context: any): void {
    const id = `${context.elementMeta.selector}`;
    const closest = closestRoot(context);

    if (closest.tagName === "HEAD" && document.querySelector(`#${id}-component-style`)) {
        return;
    }

    if (closest.querySelector(`#${id}-component-style`)) {
        return;
    }

    const styleElement = document.createElement("style");
    styleElement.setAttribute("id", `${id}-component-style`);
    styleElement.innerText = context.elementMeta.style;

    closest.appendChild(styleElement);
}
```
