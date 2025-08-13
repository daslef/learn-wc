# Завершаем валидацию `<input-text>`

Теперь, когда `TextInputComponent` может работать с состоянием необходимых атрибутов/свойств, можно завершить настройку Validator.

Вернемся к требованиям:
- валидация производится только на клиенте, значит требуется адекватное клиентское API;
- валидация производится когда пользователь снимает фокус с элемента;
- необходимы также предварительные шаги при инициализации, иначе форма посчитает элемент валидным и разрешит отправку данных.

Элементы должны заявить о себе как о части формы в `connectedCallback`, чтобы форма считала исходное их состояние невалидным. При этом фидбек пользователю о невалидности давать еще рано.

Реализуем функцию валидации в модуле `validator.ts`. Она будет принимать два аргумента: ссылку на элемент для валидации и флаг, определяющий, показывать ли ошибку пользователю.

```ts
// src/lib/components/TextInput/validator.ts

export function validate(elem: any, showError: boolean) {}
```

Чтобы привязать валидацию к `TextInputComponent`, добавим метод `onValidate`, принимающий на вход описанный выше флаг, вызывающий импортированную функцию `validate`.

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...

    onValidate(showError: boolean) {
        validate(this, showError);
    }

    // ...
}

// ...
```

Первично запустим этот метод в `connectedCallback`. Там же повесим обработчик на событие *blur* поля ввода.

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    // ...
    connectedCallback() {
        this.input.onblur = () => {
            this.onValidate(true);
        };

        for (const prop in this.attr) {
            this.input.setAttribute(prop, this.$attr[prop]);
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
validations: [
    {
        flag: { valueMissing: true },
        message: "Error: Required",
        condition: (input) => input.required && input.value.length <= 0,
    },
]
```

Тогда в функции `validate` нам нужно проверить, задано ли это свойство и не является ли массив валидаций пустым.

```ts
// src/lib/components/TextInput/validator.ts

export function validate(elem: any, showError: boolean) {
    if (!elem.validator || !elem.validator.validations) {
        return;
    }
}
```

Далее будем перебирать массив с валидациями и для тех, чья проверка даст истину, будем вызывать метод `setValidity` для коммуникации с формой, внутри которой элемент потенциально размещен. Также создадим переменную флаг, определяющую, была ли выявлена хотя бы одна ошибки.

```ts
// src/lib/components/TextInput/validator.ts

export function validate(elem: any, showError: boolean) {
    if (!elem.validator || !elem.validator.validations) {
        return;
    }

    let invalid = false;

    for (const validator of elem.validator.validations) {
        if (validator.condition(elem)) {
            elem.setValidity(validator.flag, validator.message);
            invalid = true;
        }
    }

    if (!invalid) {
        elem.setValidity({});
    }
}
```

Если мы хотим проверить работу логики уже сейчас, придется прибегнуть к *пользовательским событиям*. Дело в том, что `HTMLFormElement` не предоставляет способов прослушивания изменений валидности.

Создадим всплывающий `CustomEvent`, который можно будет прослушать на уровне формы и реализуем реакцию на него в стори `Storybook`.

```ts
// src/lib/components/TextInput/validator.ts

export function validate(elem: any, showError: boolean) {
    // ...

    elem.dispatchEvent(new CustomEvent("validate", { bubbles: true }));
}
```

## Стори

`Storybook` рендерит Веб Компонент с помощью `LitHTML` (может быть знакомым по теоретической главе о библиотеках). Это дает некоторые дополнительные возможности, например прослушивание событий в Storybook-шаблонах.

```ts
// src/lib/components/TextInput/TextInput.stories.ts

// ...

const PrimaryTemplate = ({}) => {
    setTimeout(() => {
        const input = document.querySelector(`[name="username"]`);
        input.$validator = validators["username"];
    }, 0);

    return html`<form @validate="${onValidate}"><input-text></input-text></form>`;
}
// ...
```

Осталось определить коллбэк `onValidate` в аргументах по умолчанию и принять их в `PrimaryTemplate`

```ts
// src/lib/components/TextInput/TextInput.stories.ts

import { html } from "lit-html";
import { TextInputComponent } from "./TextInput";

const PrimaryTemplate = ({ onValidate, validators }) => {
    setTimeout(() => {
        const input = document.querySelector(`[name="username"]`);
        input.validator = validators["username"];
    }, 0);
    return html`<form @validate="${onValidate}"><input-text></input-text></form>`;
}

export const Primary = PrimaryTemplate.bind({});

Primary.args = {
  validators,
  onValidate: (ev) => {
    console.log(document.querySelector(`[name="username"]`));
    if (!document.querySelector(`[name="username"]`).validity.valid) {
      console.warn('INVALID');
    } else {
      console.log('VALID');
    }
  },
};

export default {
    title: "Components/Inputs/TextInput",
    component: "input-text",
}
```

Теперь время для ручного тестирования. Откройте инструменты разработчика и в консоли понаблюдайте за изменением состояния элемента при потере фокуса.

На этом логика валидации завершена и нам остается лишь предоставить фидбек пользователю.

## Фидбек для пользователя

Согласно макету, в случае ошибки:

- граница поля ввода меняет цвет на красный,
- под полем ввода отображаются подсказки об ошибках.

В шаблоне `TextInputComponent` для этого заданы два элемента: `<input type="text" />`, доступный снаружи через `elem.input` и `<section class="message"></section>`.

Внесем изменения в функцию `validate`.

Сохраним в переменную ссылку на контейнер для сообщений. Учитывая, что позднее могут быть реализовываны и иные интерактивные элементы ввода, есть вероятность что в них этот элемент будет отсутствовать. Поэтому первично проверим его наличие. Также будем сбрасывать его содержимое при каждой валидации, чтобы сообщения не накапливались.

```ts
// src/lib/components/TextInput/validator.ts

export function validate(elem: any, showError: boolean) {
    const messageElement = elem.shadowRoot.querySelector(".message");

    if (messageElem) {
	    messageElem.innerHTML = "";
    }

    // ...
}
```

В случае, если `validator.condition(elem)` дал истину и флаг `showError` активен, добавим логику для добавления и отображения сообщений. Наконец, если элемент валиден, сбросим визуальное состояние до исходного.

```ts
// src/lib/components/TextInput/validator.ts

export type Validator = {
  validations: {
    flag: ValidityStateFlags;
    condition: (elem: HTMLElement) => boolean;
    message?: string;
  }[];
};

export function validate(elem: any, showError: boolean) {
  if (!elem.validator || !elem.validator.validations) {
    return;
  }

  const messageElement = elem.shadowRoot.querySelector('.message');
  let hasError = false;

  if (messageElement) {
    messageElement.innerHTML = '';
  }

  for (const validator of elem.validator.validations) {
    if (validator.condition(elem)) {
        elem.setValidity(validator.flag, validator.message);
        hasError = true;

        if (!showError) {
            return
        }

        elem.input?.classList.add('error');

        if (messageElement) {
            const pElement = document.createElement('p');
            pElement.innerHTML = validator.message;
            messageElement.appendChild(pElement);
        }
    }
  }

  if (!hasError) {
    elem.setValidity({});

    if (elem.input) {
      elem.input.classList.remove('error');
    }

    messageElement?.innerHTML = '';
  }

  elem.dispatchEvent(new CustomEvent('validate', { bubbles: true }));
}
```

Протестируем добавленный функционал в Storybook, наблюдая за добавлением и удалением сообщений, выводами в консоль информации о статусе валидации и добавлении CSS-классов к элементам.

