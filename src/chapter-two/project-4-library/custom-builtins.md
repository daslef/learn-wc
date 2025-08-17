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

Appending a style sheet to the custom element’s template without Shadow DOM poses a host of problems, so we opted to add the style tag to the document.head before. That implementation has another problem we haven’t encountered yet. Suppose there is a customized built-in element appended to the Shadow DOM of an autonomous custom element. Shadow DOM would prohibit the styles located in the `<style>` tag in document.head to penetrate the shadow boundary and style the customized built-in element. We’ve observed only CSS variables can penetrate the shadow boundary thus far. How could we work around this problem? Luckily we always know where the instance of the customized built-in element exists in DOM. We can write an algorithm that walks up the DOM tree, checking for shadow boundaries, and if the algorithm encounters one, append the `<style>` tag there, otherwise inject the style sheet into the document.head like we did before.

getRootNode⁵⁹ is a method that exists on HTML elements to solve problems like this one. Calling getRootNode() returns the element’s known root, which could be a ShadowRoot or document. We need a function that returns the nearest root node so we can append the `<style>` tag to it.

In packages/common/src/template make a new file named style.ts. In this new file, make a new function called closestRoot. This function takes one argument we’ll call base, and type define that argument as Element. closestRoot will return a Node, but unfortunately there isn’t a type definition in lib.dom.d.ts that can satisfy how we need to interact with the Node, so we’ll opt for any here.

Write an algorithm that checks if the base.getRootNode() equals document and if truthy return document.head, the Node we want to append the `<style>` tag. Next, check if base.getRootNode() is truthy, that means the algorithm has found a ShadowRoot, and return the Node returned by base.getRootNode(). Finally, return document.head if neither condition is satisfied. When you are done, the closestRoot function should be as follows:

```ts
function closestRoot(base: Element): any {
    if (el.getRootNode() === document) {
        return document.head;
    }

    if (el.getRootNode()) {
        return el.getRootNode();
    }

    return document.head;
}
```

## Функция *attachStyle*

Next, make a function named attachStyle, which takes one argu-ment named context, type defined as any. This function doesn’t return anything so you can type define the return as void.

attachStyle needs to create a `<style>` tag, set the content of the el-ement with the style property from elementMeta and then append the `<style>` tag to the closest root node. In attachStyle, make a new const called closest equal to closestRoot(context). Make another const named template and create a new HTMLStyleElement with it. Set the innerText of template to context.elementMeta.style.
Finally, append the template to closest.

```ts
function attachStyle(context: any): void {
    const closest = closestRoot(context);

    const template = document.createElement("style");
    template.innerText = context.elementMeta.style;

    closest.appendChild(template);
}
```

That would work if there was one instance of the element. That element would call attachStyle, appending the styling it requires to display correctly. If there are many instances of the element though, a `<style>` tag would get appended for each instance, so we need to find a way to mitigate that. One solution is to get the HTMLStyleElement a unique id and check if the element exists before appending another. We have a unique identifier of sorts: the selector property on ElementMeta. Use that to set an id attribute on the template, appending another string to the selector. -in-style should work. This reduces the chances of any two elements having the same unique id attribute.

```ts
function attachStyle(context: any): void {
    const id = `${context.elementMeta.selector}`;
    const closest = closestRoot(context);

    const template = document.createElement("style");
    template.setAttribute("id", `${id}-in-style`);
    template.innerText = context.elementMeta.style;

    closest.appendChild(template);
}
```

Next, implement two checks to determine if the HTMLStyleElement already exists. If closest is equal to document.head, the element will have a tagName of HEAD. There we can query the document for the HTMLStyleElement. If closest has the method getElementById, it’s an Element near a shadow boundary, where we can implement a similar check. If either condition returns truthy, return so that any new HTMLStyleElement isn’t created. When you are finished, attachStyle should appear like below.

```ts
function attachStyle(context: any): void {
    const id = `${context.elementMeta.selector}`;
    const closest = closestRoot(context);

    if (closest.tagName === "HEAD" && document.getElementById(`${id}-component-style`)) {
        return;
    }

    if (closest?.getElementById(`${id}-component-style`)) {
        return;
    }

    const template = document.createElement("style");
    template.setAttribute("id", `${id}-in-style`);
    template.innerText = context.elementMeta.style;

    closest.appendChild(template);
}
```

When you are finished coding attachStyle, ensure it is exported.
