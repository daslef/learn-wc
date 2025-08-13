# Отслеживание атрибутов

# TODO!!!

<!-- вставить в последующий раздел

```ts
this.input.addEventListener("blur", () => {
    if (
        this.getAttribute("required") &&
        (!this.input.value || this.input.value.length === 0)
    ) {
        this.setValidity(
            { valueMissing: true },
            "Error: This field is required, Please type in a value."
        );
    }
});
```

В коллбэке `onValidate` мы можем проверить наличие атрибута *required*, и если он установлен, то проверить существование значения и его длину. Если условие вернет ложь, мы сможем выставить `setValidity` с флагом `valueMissing` и передать пользователю сообщение. -->

# TODO!!!2

<!-- вставить в последующий раздел

Создадим в той же директории файл `validator.ts`, в котором опишем API для валидации нашего компонента, на которое смогут опираться пользователи (разработчики). -->


## Источник правды

С точки зрения пользователя, он взаимодействует с полем ввода. Но логика работы поля ввода упакована в наш пользовательский элемент. Это ставит вопрос, что считать источником правды для состояния элемента. Сейчас за основу берутся начальные настройки, либо передающиеся в качестве аргументов при программном создании элемента или при взаимодействии с ним через открытые API.

Но помимо этого, в HTML принято настраивать элементы в том числе декларативно, через HTML-атрибуты. Если пользователь выставит на элементе атрибут *required*, как передать его на уровень вложенного поля ввода? Или наоборот, когда состояние вложенного поля ввода меняется, как нам передать его значение наружу?

Чтобы разрабатываемые нами элементы были удобны в переиспользовании, важно предоставить удобное API наружу. Если мы даем возможность работать с элементом только через геттеры и сеттеры, их можно будет настроить только через JS, что в том числе потребует экспертности от пользователей нашей библиотеки компонентов.

Одно из решений - считать единым источником правды элемент `HTMLInputElement`, дав возможность запросам проходить сквозь `TextInputComponent`, открывая доступ к свойствам поля ввода через геттеры и сеттеры `HTMLInputElement`.

Чтобы достичь этого, нужен способ задания HTML-атрибутов на `<input-text>` и реагирования элемента на них по аналогии с тем, как работают нативные поля ввода.

## Коммуникация через геттеры и сеттеры

Как было определено ранее, будем реализовывать идею коммуникации "сквозь" пользовательский элемент к вложенному полю ввода. Поэтому и в сеттерах, и в геттерах мы просто передаем или запрашиваем свойства у поля ввода.

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    set value(value: string) {
        this.input.value = value;
    }

    get value(): string {
        return this.input.value;
    }
    // ...
}
```

В случае атрибута *required* важно провести корректную конверсию типов. В HTML этот атрибут задается в формате строки, но его состояние в JS описывается логическим типом.

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    get required(): boolean {
        return this.input.required;
    }

    set required(value: boolean | string) {
        if (String(value) === "true") {
            this.input.setAttribute("required", "true");
        }

        if (String(value) === "false") {
            this.input.removeAttribute("required");
        }
    }

    // ...
}

// ...
```

## Отслеживание атрибутов

Спецификация предоставляет нам API для отслеживания изменений атрибутов через статический геттер `observedAttributes`, где мы указываем массив атрибутов, которые хотим отслеживать, и `attributeChangedCallback` для реакции на изменения этих атрибутов.

Начнем отслеживать атрибуты *value* и *required*.

```ts
// src/lib/components/TextInput/TextInput.ts

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
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    attributeChangedCallback(name, prev, next) {
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

Теперь зададим свойства *required* или *value* в стори.

Они не будут обработаны.

В теоретической части курса мы говорили о том, что рендеринг элементов происходит от родителей к детям. Поэтому при инициализации элемента, так как теневой DOM еще не простроен, `attributeChangedCallback` отрабатывает впустую. Был рекомендован способ обработки подобных ситуаций: метод жизненного цикла `connectedCallback`, который выполняется в тот момент, когда дерево полностью простроено и элемент добавлен в DOM документа.

Пока элемент не добавлен в DOM, мы можем собирать данные об атрибутах во вспомогательный объект, а уже в `connectedCallback` перебрать их и протранслировать на вложенное поле ввода.

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    private attr = {};

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

Теперь мы можем увидеть в `Storybook`, что атрибуты передаются на уровень `HTMLInputElement`.
