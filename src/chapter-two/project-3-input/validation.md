# Валидация `<input-text>`

Теперь, когда связь между `TextInputComponent` и формой установлена, поработаем с валидацией. Информация о состоянии валидации сейчас находится в `this.internals`, а не в `this`, как у нативных элементов, что добавляет еще один уровень вложенности. Если мы оставим это как есть, то пользователи нашего компонента должны будут обращаться к `input.internals.validity`, тогда как для всех остальных компонентов - просто к `input.validity`.

Для начала предоставим наружу метод интерфейса `ElementInternals` для проверки валидности: `checkValidity`. Метод проверяет значение на заданные ограничения и в случае обнаружения нарушений вызывает событие о невалидности и возвращает `false`.

Метод `reportValidity` очень похож на него, но помимо прочего возвращает *validationMessage* для отображения.

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...

    checkValidity() {
        return this.internals.checkValidity();
    }

    reportValidity() {
        return this.internals.reportValidity();
    }

    // ...
}
```

Геттер `validity` возвращает объект `ValidationState`, который включает в себя свойства, описывающие распространенные ошибки валидации, такие как *tooShort*, *valueMissing* и  *patternMismatch*. Этот объект обновляется при вызовах `setValidity` и `reportValidity`.

Следующий геттер, `validationMessages`, возвращает сообщения, соответствующие каждому из невалидных состояний элемента.

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    get validity() {
        return this.internals.validity;
    }

    get validationMessage() {
        return this.internals.validationMessage;
    }
    // ...
}
```

## ElementInternals.setValidity

`ElementInternals` также включает метод `setValidity`, который участвует в большинстве задач валидации. Этот метод принимает три аргумента:

- *flags*, объект со свойствами, связанными с флагами валидации, известными браузеру;
- *message*, позволяющий передать предназначенную для пользователю строку с фидбеком;
- *anchor*, элемент, в котором мы желаем отобразить *message* для пользователя.

Добавим его в наш класс

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...

    setValidity(
        flags: ValidityStateFlags,
        message?: string,
        anchor?: HTMLElement
    ): void {
        this.internals.setValidity(flags, message, anchor);
    }

    // ...
}
```

## Прослушивание триггерного события

Согласно требованиям, мы должны проверять валидность значения в тот момент, когда пользователь перемещает фокус с элемента, т.е. вызывает событие *blur*.

Реагируя на него, мы должны проверить наличие значения в поле ввода (если оно является обязательным), и что длина этой строки больше нуля. Если одно из правил не соблюдается, мы вызовем `setValidity` и передадим в него два аргумента: один для браузера и разработчика, второй для пользователя.

Осталось решить, где реализовать прослушивание этого события и реакцию на него. Можно сделать это внутри самого `TextInputComponent`. Единственный недостаток такого подхода - что проверки теперь зашиты в компонент, и пользователям компонента будет непросто их перезадать и расширить для использования в новых сценариях.

Решение - вынести условия из уровня компонента на уровень приложения. Главное - чтобы компонент обрабатывал вызовы `setValidity`.

## Validator

Опишем тип нашего будущего валидатора в `types.ts`.

```ts
// src/lib/components/input-text/types.ts

export type Validator = {
    validations: {
        flag: ValidityStateFlags;
        condition: (elem: HTMLElement) => boolean;
        message?: string;
    }[];
};
```

На данный момент `Validator` содержит лишь одно свойство, `validations`: массив объектов с флагом для браузера, проверкой и сообщением для пользователя.

Также создадим композитный тип для хранения отображения имен наших пользовательских элементов (как и у обычных полей ввода, наш элемент будет ожидать задания атрибута *name*) на объекты типа *Validator*.

```ts
// src/lib/components/input-text/types.ts

export type Validator = {
    validations: {
        flag: ValidityStateFlags;
        condition: (elem: HTMLElement) => boolean;
        message?: string;
    }[];
};

export type ValidatorsMapping = {
    [K: string]: Validator
}

```

Импортируем созданный тип и зададим в классе `TextInputComponent` новое публичное свойство `validator`. Изначально оно неизвестно, поэтому дадим ему возможность быть *nullable*.

```ts
// src/lib/components/input-text/TextInput.ts

import type { Validator } from "./types";

export class TextInputComponent extends HTMLElement {
    // ...
    public validator: Validator | null = null;
    // ...
}
```

Наконец, определим новый геттер `input`, возвращающий вложенный `HTMLInputElement`. Мы уверены в наличии теневого дерева и вложенного поля ввода, поэтому используем *!*.

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...

    get input(): HTMLInputElement {
        return this.shadowRoot!.querySelector("input")!;
    }

    // ...
}
```

В `TextInput.stories.ts` импортируем созданные типы и определим объект, в которым зададим валидатор для имени пользователя.

```ts
// src/lib/components/input-text/TextInput.stories.ts

import { html } from "lit-html";
import { TextInputComponent } from "./TextInput";
import type { Validator, ValidatorsMapping } from './types'

const validators: ValidatorsMapping = {
    username: {
        validations: [
            {
                flag: { valueMissing: true },
                message: "Error: Required",
                condition: (input) => input.required && input.value.length === 0,
            },
        ],
    },
};

export const Primary = {}

export default {
  title: "Components/Inputs/TextInput",
  component: "input-text",
  render: () => html`<form><input-text></input-text></form>`
}
```

## Свойства *required* и *value*

Если ваш IDE работает корректно, то после этого действия функция *condition* должна подсветиться: TypeScript сомневается, что у нашего элемента, расширяющего `HTMLElement`, присутствуют свойства *required* и *value*. И действительно, сейчас они не объявлены.

Тут возникает классический вопрос об источнике правды для состояния элемента: с точки зрения пользователя, он взаимодействует с полем ввода, но логика работы поля ввода упакована в наш пользовательский элемент.

Чтобы разрабатываемые нами элементы были удобны в переиспользовании, важно предоставить удобное API наружу. Одно из решений - считать единым источником правды элемент `HTMLInputElement`, дав возможность запросам проходить сквозь `TextInputComponent`, открывая доступ к свойствам поля ввода через геттеры и сеттеры `HTMLInputElement`.

Итак, будем реализовывать идею коммуникации "сквозь" пользовательский элемент к вложенному полю ввода. Поэтому и в сеттерах, и в геттерах мы просто передаем или запрашиваем свойства у поля ввода.

В случае сеттера для *required* важно провести корректную конверсию типов: в HTML этот атрибут задается в формате строки, но его состояние в JS описывается логическим типом.

```ts
// src/lib/components/input-text/TextInput.ts
import type { Validator } from "./types";

export class TextInputComponent extends HTMLElement {
    // ...
    get value(): string {
        return this.input.value;
    }

    set(value: string) {
        return this.input.value = value
    }

    get required(): boolean {
        return this.input.required;
    }

    set required(value: boolean | string) {
        if (String(value) === "true") {
            this.input.setAttribute("required", "required");
        }

        if (String(value) === "false") {
            this.input.removeAttribute("required");
        }
    }
    // ...
}

customElements.define('input-text', TextInputComponent)
```

Вроде написали, но IDE всё равно не убедили. Время написать тип для нашего элемента `<input-text>`.

```ts
// src/lib/components/input-text/types.ts

// ...

export type TextInputInterface = HTMLElement & Pick<HTMLInputElement, 'value' | 'required'>
```

На и наконец изменим в том же файле сигнатуру свойства *condition*, из-за которой эта ошибка и возникла:

```ts
// src/lib/components/input-text/types.ts

export type Validator = {
  validations: {
    flag: ValidityStateFlags;
    condition: (elem: TextInputInterface) => boolean;
    message?: string;
  }[];
};

// ...
```

Проблема решена.

## Привязка правил валидации

Чтобы привязать правила валидации, нам нужно задать полю ввода имя *username*. Добавим его в функцию рендера.

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...
export default {
  title: "Components/Inputs/TextInput",
  component: "input-text",
  render: () => html`<form><input-text name="username"></input-text></form>`
}
```

Наши следующие шаги:
- обратиться к элементу селектором по наличию атрибута *name*,
- узнать значение этого атрибута (здесь мы его знаем изначально, но делаем на будущее),
- обратиться по значению атрибута к объекту *validators* и получить соответствующий *Validator*,
- задать этот валидатор свойству *validator* нашего элемента.

Все эти программные действия можно описать в стори

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...

import type { Validator, ValidatorsMapping, TextInputInterface } from './types'

// ...

export const Primary = {
    play: () => {
        const element: TextInputInterface = document.querySelector("input-text[name]")!;
        const elementName = element.getAttribute("name")!
        element.validator = validators[elementName];
        console.log(element.validator)

        for (const rule of element.validator.validations) {
            if (rule.condition(element)) {
                console.log(rule.message)
            }
        }
    }
}

// ...
```

Вновь требуется поправить тип `TextInputInterface`, на этот раз добавить свойство *validator*

```ts
// src/lib/components/input-text/types.ts

// ...

export type TextInputInterface = HTMLElement & Pick<HTMLInputElement, 'value' | 'required'> & { validator: Validator }
```

Если всё сделано правильно, в консоли инструментов разработчика выведется прикрепленный валидатор. Но мы также ожидали сообщение об ошибке - его нет, так как в правиле сказано `input.required && input.value.length === 0`, а у нашего элемента *required* не выставлен.

Выставим его программно

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...

export const Primary = {
    play: () => {
        const element: TextInputInterface = document.querySelector("input-text[name]")!;
        const elementName = element.getAttribute("name")!
        element.validator = validators[elementName];
        console.log(element.validator)

        element.required = true

        for (const rule of element.validator.validations) {
            if (rule.condition(element)) {
                console.log(rule.message)
            }
        }
    }
}

// ...
```

В консоли должно появиться сообщение об ошибке, т.к. атрибут *required* теперь задан, а длина строки внутри поля ввода при старте равна нулю.

Валидаторы прикреплены, но работают пока только через стори и не коммуницируют с формой. Мы продолжим работу над ними позже.

А пока - сделаем так, чтобы свойство *required* (и подобные ему) можно было задавать не только программно через JS, но и декларативно через HTML-атрибуты.
