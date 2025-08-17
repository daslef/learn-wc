# Завершаем валидацию `<input-text>`

Теперь, когда `TextInputComponent` может работать с состоянием необходимых атрибутов/свойств, можно завершить настройку валидации.

Вернемся к требованиям:
- валидация производится только на клиенте, значит требуется адекватное клиентское API;
- валидация производится когда пользователь снимает фокус с элемента;
- необходимы также предварительные шаги при инициализации, иначе форма посчитает элемент валидным и разрешит отправку данных.

Элементы должны заявить о себе как о части формы в `connectedCallback`, чтобы форма считала исходное их состояние невалидным. При этом фидбек пользователю о невалидности давать еще рано.

Реализуем функцию валидации в новом модуле `validate.ts`. Она будет принимать два аргумента: ссылку на элемент для валидации и флаг, определяющий, показывать ли ошибку пользователю.

```ts
// src/lib/components/input-text/validate.ts

export default function validate(element: any, showError: boolean) {}
```

Чтобы привязать валидацию к `TextInputComponent`, добавим метод `onValidate`, принимающий на вход описанный выше флаг, вызывающий импортированную функцию `validate`.

```ts
// src/lib/components/input-text/TextInput.ts

import type { Validator } from "./types";
import validate from "./validate";


export class TextInputComponent extends HTMLElement {
    // ...

    onValidate(showError: boolean) {
        validate(this, showError);
    }
}

// ...
```

Первично запустим этот метод в `connectedCallback`. Там же повесим обработчик на событие *blur* поля ввода.

```ts
// src/lib/components/input-text/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...

    connectedCallback() {
        this.input.onblur = () => {
            this.onValidate(true);
        };

        for (const prop in this.attr) {
            this.input.setAttribute(prop, this.attr[prop]);
        }

        this.onValidate(false);
    }

    // ...
}

// ...
```

## Функция `validate`

Так как мы решили делегировать задание правил валидации на пользователей компонента, свойство `validator` задается элементу снаружи.

Так, в стори мы передавали элементу следующее правило валидации:

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...

validations: [
    {
        flag: { valueMissing: true },
        message: "Error: Required",
        condition: (input) => input.required && input.value.length === 0,
    },
]

// ...
```

Тогда в функции `validate` нам нужно проверить, задано ли это свойство и не является ли массив валидаций пустым.

Далее будем перебирать массив с валидациями и для тех, чья проверка даст истину, будем вызывать метод `setValidity` для коммуникации с формой, внутри которой элемент потенциально размещен. Также создадим переменную флаг, определяющую, была ли выявлена хотя бы одна ошибки.

```ts
// src/lib/components/input-text/validate.ts

export function validate(element: any, showError: boolean) {
    if (!element.validator || !element.validator.validations) {
        return;
    }

    let invalid = false;

    for (const validator of element.validator.validations) {
        if (validator.condition(element)) {
            element.setValidity(validator.flag, validator.message);
            invalid = true;
        }
    }

    if (!invalid) {
        element.setValidity({});
    }
}
```

Если мы хотим проверить работу логики уже сейчас, придется прибегнуть к *пользовательским событиям*. Дело в том, что `HTMLFormElement` не предоставляет способов прослушивания изменений валидности.

Создадим всплывающий `CustomEvent`, который можно будет прослушать на уровне формы и реализуем реакцию на него в стори `Storybook`.

```ts
// src/lib/components/input-text/validate.ts

export function validate(element: any, showError: boolean) {
    // ...

    element.dispatchEvent(new CustomEvent("validate", { bubbles: true }));
}
```

## Стори

`Storybook` рендерит Веб Компонент с помощью `LitHTML` (может быть знакомым по теоретической главе о библиотеках). Это дает некоторые дополнительные возможности, например прослушивание событий.

Нужно лишь определить коллбэк `onValidate` в аргументах стори и функции рендера и передать его в хэндлер `@validate` формы.

Плюс, не забудем отключить программную установку атрибута *required*, т.к. теперь она может производиться декларативно.

```ts
// src/lib/components/input-text/TextInput.stories.ts

import { html } from "lit-html";
import { TextInputComponent } from "./TextInput";
import type { Validator, ValidatorsMapping, TextInputInterface } from './types'

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
  },
  args: {
    onValidate: () => {
      const element: TextInputInterface = document.querySelector("input-text[name]")!;
      console.log(element!.validity.valid ? 'VALID' : 'INVALID')
    }
  }
}

export default {
  title: "Components/Inputs/TextInput",
  component: "input-text",
  render: ({ onValidate }: typeof Primary.args) => html`<form @validate=${onValidate}><input-text name="username" required></input-text></form>`
}
```

Осталось поправить типизацию. Добавим свойство *validity* к описанию *TextInputInterface*.

```ts
// src/lib/components/input-text/types.ts

// ...
export type TextInputInterface = HTMLElement & Pick<HTMLInputElement, 'value' | 'required'> & {
  validator: Validator,
  validity: ValidityState
}
```

Теперь время для ручного тестирования. Откройте инструменты разработчика и в консоли понаблюдайте за изменением состояния элемента при потере фокуса и установке/удалении атрибута *required*.

На этом логика валидации завершена и нам остается лишь предоставить фидбек пользователю.

## Фидбек для пользователя

Согласно макету, в случае ошибки:

- граница поля ввода меняет цвет на красный,
- под полем ввода отображаются подсказки об ошибках.

В шаблоне `TextInputComponent` для этого заданы два элемента: `<input type="text" />` и `<section class="message"></section>`.

Внесем изменения в функцию `validate`. Сохраним в переменную ссылку на контейнер для сообщений. Учитывая, что позднее могут быть реализовываны и иные интерактивные элементы ввода, есть вероятность что в них этот элемент будет отсутствовать. Поэтому первично проверим его наличие. Также будем сбрасывать его содержимое при каждой валидации, чтобы сообщения не накапливались.

```ts
// src/lib/components/input-text/validate.ts

export default function validate(element: any, showError: boolean) {
    if (!element.validator || !element.validator.validations) {
        return;
    }

    const messageElement = element.shadowRoot.querySelector(".message");

    if (messageElement) {
        messageElement.innerHTML = "";
    }

    // ...
}
```

В случае, если `validator.condition(element)` дал истину и флаг `showError` активен, добавим логику для добавления и отображения сообщений. Наконец, если элемент валиден, сбросим визуальное состояние до исходного.

```ts
// src/lib/components/input-text/validate.ts

export function validate(element: any, showError: boolean) {
  if (!element.validator || !element.validator.validations) {
    return;
  }

  const messageElement = element.shadowRoot.querySelector('.message');

  if (messageElement) {
    messageElement.innerHTML = '';
  }

  let invalid = false;

  for (const validator of element.validator.validations) {
    if (validator.condition(element)) {
        element.setValidity(validator.flag, validator.message);
        invalid = true;

        if (!showError) {
            return
        }

        element.input?.classList.add('error');

        if (messageElement) {
            const pElement = document.createElement('p');
            pElement.innerHTML = validator.message;
            messageElement.appendChild(pElement);
        }
    }
  }

  if (!invalid) {
    element.setValidity({});

    if (element.input) {
      element.input.classList.remove('error');
    }

    messageElement.innerHTML = '';
  }

  element.dispatchEvent(new CustomEvent('validate', { bubbles: true }));
}
```

Протестируем добавленный функционал в `Storybook`, наблюдая за добавлением и удалением сообщений, выводами в консоль информации о статусе валидации и добавлении CSS-классов к элементам.

