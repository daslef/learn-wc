# Валидация `<input-text>`

Теперь, когда связь между `TextInputComponent` и формой установлена, поработаем с валидацией. Информация о состоянии валидации сейчас находится в `this.internals`, а не в `this`, как у нативных элементов, что добавляет еще один уровень вложенности. Если мы оставим это как есть, то пользователи нашего компонента должны будут обращаться к `input.internals.validity`, тогда как для всех остальных компонентов - просто к `input.validity`.

Для начала предоставим наружу метод интерфейса `ElementInternals` для проверки валидности: `checkValidity`. Метод проверяет значение на заданные ограничения и в случае обнаружения нарушений вызывает событие о невалидности и возвращает `false`.

```ts
checkValidity() {
    return this.internals.checkValidity();
}
```

Метод `reportValidity` очень похож на него, но помимо прочего возвращает *validationMessage* для отображения.

```ts
reportValidity() {
    return this.internals.reportValidity();
}
```

Геттер `validity` возвращает объект `ValidationState`, который включает в себя свойства, описывающие распространенные ошибки валидации, такие как *tooShort*, *valueMissing* и  *patternMismatch*. Этот объект обновляется при вызовах `setValidity` и `reportValidity`.


```ts
get validity() {
    return this.internals.validity;
}
```

Следующий геттер, `validationMessages`, возвращает сообщения, соответствующие каждому из невалидных состояний элемента.

```ts
get validationMessage() {
    return this.internals.validationMessage;
}
```

## ElementInternals.setValidity

`ElementInternals` также включает метод `setValidity`, который участвует в большинстве задач валидации. Этот метод принимает три аргумента:

- *flags*, объект со свойствами, связанными с флагами валидации, известными браузеру;
- *message*, позволяющий передать предназначенную для пользователю строку с фидбеком;
- *anchor*, элемент, в котором мы желаем отобразить *message* для пользователя.

Добавим его в наш класс

```ts
setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement
): void {
    this.internals.setValidity(flags, message, anchor);
}
```

Согласно требованиям, мы должны проверять валидность значения в тот момент, когда пользователь перемещает фокус с элемента, т.е. вызывает событие *blur*.

```ts
if (input.value && input.value.length > 0) {
    input.setValidity(
        { valueMissing: true },
        "Error: This field is required, Please type in a value."
    );
}
```

Здесь первый аргумент - это сообщение для браузера (и разработчика), а второй - для пользователя.

Осталось решить, где реализовать прослушивание этого события и реакцию на него. Можно сделать это внутри самого `TextInputComponent`:

```ts
this.$input.addEventListener("blur", () => {
    if (
        this.getAttribute("required") &&
        this.$input.value &&
        this.$input.value.length > 0
    ) {
        this.setValidity(
            { valueMissing: true },
            "Error: This field is required, Please type in a value."
        );
    }
});
```

В коллбэке `onValidate` мы можем проверить наличие атрибута *required*, и если он установлен, то проверить существование значения и его длину. Если условие вернет ложь, мы сможем выставить `setValidity` с флагом `valueMissing` и передать пользователю сообщение.

Единственный недостаток такого подхода - что проверки теперь зашиты в компонент, и пользователям компонента будет непросто их перезадать и расширить для использования в новых сценариях.

Решение - вынести условия из уровня компонента на уровень приложения. Главное - чтобы компонент обрабатывал вызовы `setValidity`.

## Пишем интерфейс Validator

Создадим в той же директории файл `validator.ts`, в котором опишем API для валидации нашего компонента, на которое смогут опираться пользователи (разработчики).

```ts
// src/lib/components/TextInput/validator.ts

export type Validator = {
    validations: {
        flag: ValidityStateFlags;
        condition: (elem: HTMLElement) => boolean;
        message?: string;
    }[];
};
```

На данный момент `Validator` содержит лишь одно свойство, `validations`: массив объектов с флагом для браузера, проверкой и сообщением для пользователя.

## Принимаем validator в TextInputComponent

Импортируем созданный тип и зададим в классе `TextInputComponent` новое публичное свойство `validator`

```ts
public validator: Validator;
```

Наконец, определим новый геттер `input`, возвращающий вложенный `HTMLInputElement`.

```ts
get input(): HTMLInputElement {
    return this.shadowRoot.querySelector("input");
}
```

## Используем Validator в Storybook

В `TextInput.stories.ts` импортируем созданный тип и определим объект, в которым зададим валидатор для имени пользователя.

```ts
// src/lib/components/TextInput/TextInput.stories.ts

import { type Validator } from './validator'

const validators: { [ K extends string ] : Validator } = {
    username: {
        validations: [
            {
                flag: { valueMissing: true },
                message: "Error: Required",
                condition: (input) => input.required && input.value.length <= 0,
            },
        ],
    },
};
```

Идеально, если для задания правил пользователю не потребуется использовать JS, и он мог бы просто задать атрибут в HTML.

<form><text-input name="username"></text-input></form>

Запросим это значение в описании шаблона (таймаут нужен чтобы шаблон успел скомпилироваться) и зададим свойств `validator` опираясь на значение атрибута `name`.

```ts
const PrimaryTemplate = ({}) => {
    setTimeout(() => {
        const input = document.querySelector(`[name="username"]`);
        input.$validator = validators["username"];
    }, 0);

    return html`<form><text-input name="username"></text-input></form>`;
};
```
