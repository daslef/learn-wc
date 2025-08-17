# Отслеживание атрибутов

## Декларативное задание атрибутов

Итак, после задания геттеров и сеттеров мы можем задавать и/или считывать состояние элемента программным путем.

Но если мы даем возможность работать с элементом только через геттеры и сеттеры, их можно будет настроить только через JS, что в том числе потребует экспертности от пользователей нашей библиотеки компонентов.

В HTML принято настраивать элементы в том числе декларативно, через HTML-атрибуты. Если пользователь выставит на элементе атрибут *required*, как передать его на уровень вложенного поля ввода? Или наоборот, когда состояние вложенного поля ввода меняется, как нам передать его значение наружу?

Чтобы достичь этого, нужен способ задания HTML-атрибутов на `<input-text>` и реагирования элемента на них по аналогии с тем, как работают нативные поля ввода.

## Отслеживание атрибутов

Спецификация предоставляет нам API для отслеживания изменений атрибутов через статический геттер `observedAttributes`, где мы указываем массив атрибутов, которые хотим отслеживать, и `attributeChangedCallback` для реакции на изменения этих атрибутов.

Начнем отслеживать атрибуты *value* и *required*.

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    static get observedAttributes() {
        return ["required", "value"];
    }
    // ...
}

// ...
```

`attributeChangedCallback` принимает на вход три аргумента: имя атрибута, предыдущее его значение и новое значение. Для разграничения логики изменения атрибутов на основе их имен можно использовать конструкцию *switch*

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    attributeChangedCallback(name: string, prev: string | null, next: string | null) {
        switch (name) {
            case "value":
                this.value = next;
                break;
            case "required":
                this.required = next;
                break;
        }
    }
    // ...
}

// ...
```

## Передача значений атрибутов дочерним элементам

В теоретической части курса мы говорили о том, что рендеринг элементов происходит от родителей к детям. Поэтому при инициализации элемента, так как теневой DOM еще не простроен, `attributeChangedCallback` отрабатывает впустую. Был рекомендован способ обработки подобных ситуаций: метод жизненного цикла `connectedCallback`, который выполняется в тот момент, когда дерево полностью простроено и элемент добавлен в DOM документа.

Пока элемент не добавлен в DOM, мы можем собирать данные об атрибутах во вспомогательный объект, а уже в `connectedCallback` перебрать их и протранслировать на вложенное поле ввода.

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    private attr: { [K: string]: string } = {};

    // ...

    static get observedAttributes() {
        return ["required", "value"];
    }

    connectedCallback() {
        for (const prop in this.attr) {
            this.input.setAttribute(prop, this.attr[prop]);
        }
    }

    attributeChangedCallback(name, prev, next) {
        this.attr[name] = next;

        switch (name) {
            case "value":
                this.value = next;
                break;
            case "required":
                this.required = next;
                break;
        }
    }

    // ...
}

// ...
```

Теперь мы можем увидеть в `Storybook`, задав атрибуты *required* и *value*, что они передаются на уровень `HTMLInputElement`.
