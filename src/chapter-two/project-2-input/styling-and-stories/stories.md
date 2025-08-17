# Стори

Сейчас у нас есть одна общая стори, в которой мы тестируем все возможные состояния вручную.

По хорошему, каждому визуальному состоянию (базовое, ошибка, недоступное) должна соответствовать отдельная стори. Выделим четыре стори:

- основную (без атрибута *required*),
- альтернативную (с атрибутом *required*),
- с отключенным полем ввода (с атрибутом *disabled*),
- с ошибкой (программно задав сценарий).

Чтобы нам хватило одной функции рендера, состояния *required* и *disabled* будем передавать в нее через аргументы. Сразу зададим им тип и отключим контрол для коллбэка.

```ts
// src/lib/components/input-text/TextInput.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components-vite';

// ...

type Args = {
  onValidate: () => void,
  disabled: boolean,
  required: boolean
}

// ...

export default {
  title: "Components/Inputs/TextInput",
  component: "input-text",
    argTypes: {
    onValidate: {
      control: false
    }
  },
  render: ({ onValidate, disabled, required }: Args) => html`<form @validate=${onValidate}><input-text name="username" required></input-text></form>`
} as Meta<Args>
```

## Основная стори

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...

export const Primary: StoryObj<Args> = {
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
    },
    disabled: false,
    required: false
  }
}

// ...
```

## Альтернативная стори

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...

export const Required: StoryObj<Args> = {
  play: () => {
    const element: TextInputInterface = document.querySelector(`[name="username"]`)!;
    element.validator = validators["username"];
    console.log(element.validator)

    for (const rule of element.validator.validations) {
      if (rule.condition(element)) {
        console.log(rule.message)
      }
    }

  },
  args: {
    onValidate: () => {
      const element: TextInputInterface = document.querySelector(`[name="username"]`)!;
      console.log(element!.validity.valid ? 'VALID' : 'INVALID')
    }
  },
  required: true,
  disabled: false,
}

// ...
```

## Состояние с ошибкой

Аналогично зададим шаблон и стори для состояния ошибки. Здесь мы принимаем на вход валидатор и помимо прочего имитируем пользовательские действия установки фокуса и снятия фокуса с элемента.

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...
export const Error: StoryObj<Args> = {
  args: {
    required: true,
    disabled: false
  },
  play: () => {
    const element: TextInputInterface = document.querySelector(`[name="username"]`)!;
    element.validator = validators["username"];
    element.input.focus();
    element.input.blur();
  }
}
// ...
```

Для исправления ошибки типов добавим свойство *input* в интерфейс нашего элемента

```ts
// src/lib/components/input-text/types.ts

// ...
export type TextInputInterface = HTMLElement & Pick<HTMLInputElement, 'value' | 'required'> & {
  validator: Validator,
  validity: ValidityState,
  input: HTMLInputElement
}
```


## Неинтерактивное состояние

Создадим шаблон и стори для недоступного состояния, реализованного ранее.

```ts
// src/lib/components/input-text/TextInput.stories.ts

// ...

export const Disabled: StoryObj<Args> = {
  args: {
    required: false,
    disabled: true
  },
}

// ...
```
