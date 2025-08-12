# Связь `<input-text>` с формой

## Пользовательские элементы и формы

Формы - важнейший элемент взаимодействия приложения с пользователем, будь это форма логина, оформления заказа или редактируемая таблица.

Автономные пользовательские элементы имеют некоторые сложности при использовании в контексте форм. Когда интерактивный элемент, такой как пользовательское поле ввода, инкапсулирован в теневой DOM, он оказывается отрезан от родительского `HTMLFormElement`. По умолчанию `HTMLInputElement` должен передавать информацию о своей валидности и свое значение родителю, в том числе при отправке формы, но теневая граница блокирует эту коммуникацию. Более того, если не простроить корректную связь поля ввода с лэйблом, могут возникнуть проблемы с доступностью.

Если сейчас открыть стори в инструментах разработчика и обратиться к элементу `<form>`, оборачивающему наш элемент, то он не будет представлен в списке дочерних, а значит  взаимодействие с формой в данный момент невозможно.

## ElementInternals

Чтобы пользовательские элементы могли регистрироваться в составе `HTMLFormElement` и иметь полноценное взаимодействие, был представлен интерфейс `ElementInternals`. Он предоставляет методы для валидации контрола, настройки доступности, синхронизации его состояния.

Чтобы получить доступ к `ElementInternals`, нужно выставить свойство `formAssociated` в классе пользовательского элемента и вызвать метод `attachInternals()`. После этого такой пользовательский элемент называют *form-associated*, связанным с формой.

```ts
// src/lib/components/TextInput/TextInput.ts

export class TextInputComponent extends HTMLElement {
    static formAssociated = true;
    private internals: ElementInternals;

    constructor() {
        super();
        this.internals = this.attachInternals();

        const template = document.createElement('template')
        template.innerHTML = `
            <section class="control">
                <input type="text" />
            </section>
            <section class="message"></section>`

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.append(template.content.cloneNode(true))
    }
}

customElements.define('input-text', TextInputComponent)
```

Теперь наш элемент появится в списке дочерних элементов формы под индексом [0].
