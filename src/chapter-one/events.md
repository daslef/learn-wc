# Обработка событий

Идеи, которые стоят за Веб Компонентами, предполагают более сложную работу с событиями, чем мы привыкли. В этом разделе предварительно освежим событийную модель JS, а потом поговорим о различных техниках работы с пользовательскими элементами и теневым деревом.

## Событийная модель JS

#### Обработчики событий

Каждый HTML-элемент содержит набор событий, ассоциированных с ним. При возникновении события, приложение исполняет набор относящихся к нему задач, описанных в *обработчиках событий*. Назначить обработчик можно либо через атрибут HTML-элемента, начинающийся с *on*, например, *onclick*, либо через метод *addEventListener*. Второй вариант рекомендован, так как позволяет назначить событию сразу несколько обработчиков. Если назначить элементу и событию несколько обработчиков, они будут исполняться в том порядке, в котором были назначены.

Удалить обработчик возможно только программно, через JS, методом `removeEventListener` с теми же параметрами, которые передавались при его установке.

Некоторые события формируют цепочки. Например событию `keypress` предшествуют `keydown` и `keyup`, а событие `click` следует за `mousedown` и `mouseup`.

Порой выбрать правильное событие для обработки сложнее, чем реализовать обработчик. Рекомендуется пользоваться [справочником MDN](https://developer.mozilla.org/en-US/docs/Web/Events)

#### Предотвращение поведения по умолчанию

Многие элементы запрограммированы реагировать на некоторые события "из коробки". Например, при щелчке по ссылке автоматически происходит переход в согласии с ее атрибутом *href*.

Если мы прикрепим к ссылке свой обработчик, он будет выполнен первым, но после него отработает и встроенная функциональность. Чтобы подавить поведение элемента по умолчанию, мы используем метод `preventDefault` в случае обработчиков, назначенных через `addEventListener`, либо через `return false` из обработчиков, назначенных через атрибут *on[event]*.

#### Всплытие событий

Чтобы понять, что такое всплытие, мы можем посмотреть на HTML-страницу как на стопку слоев. Каждый уровень DOM-дерева в документе формирует слой.

Допустим, у нас есть документ, содержащий элемент `<div>`. Тогда нижний слой - это `body`, а верхний слой - это `div`. Если пользователь кликает внутри элемента `div`, то именно этот элемент получает событий первым. Если к нему привязаны обработчики, они выполняются. Иначе событие передается на следующий слой - в нашем случае на тело документа. В браузере всплытие происходит даже дальше: от тела документа `<body>` к корню документа `html`, а далее - к элементу `Window`. Это и есть всплытие события, которое происходит до тех пор, пока не остановится на каком-либо из элементов.

Передача событий называется *propagation*, и мы можем работать с ним программно. Получив объект `event` в обработчике события, его можно использовать для остановки всплытия.

```js
element.addEventListener("click", event => {
    event.stopPropagation();
});
```

Если на элементе закреплено несколько обработчиков одного и того же события, то даже если мы остановим всплытие в одном из обработчиков, остальные продолжат исполнение. Чтобы остановить всплытие и остановить исполнение остальных обработчиков, существует метод `event.stopImmediatePropagation`.

#### Event.target и Event.currentTarget

Объект события предоставляет множество информации. Например, при щелчке мышью мы можем узнать координаты клика и кнопку мыши. Но для работы со всплытием нам интересны его свойства `target` и `currentTarget`. Первое свойство отдает ссылку на элемент, на котором произошло событие, а второе - на элемент, на котором реализован обработчик этого события.

Если обработчик сработал на том элементе, на котором произошло событие, то эти два свойства будут ссылаться на один и тот же элемент. Но обработчик может быть назначен не конкретно на этот элемент, а на более высоких слоях. Например, карточка товара может содержать описание товара в элементе `<p>`: мы кликаем по элементу `<p>` с описанием товара, но обработчик клика назначен на карточке товара `<article>`, которая расположена выше в иерархии DOM-дерева. Тогда через `event.target` мы получим элемент с описанием, а через `event.currentTarget` - элемент, на котором назначен обработчик, то есть элемент с карточкой.

Если мы представим маркированный список, то вместо того, чтобы вешать обработчики на каждый из элементов `<li>` это позволяет нам назначить один обработчик на элемент `<ul>`. Если событие произойдет на `<li>`, он будет являться `event.target`, тогда как `event.currentTarget` отдаст нам `<ul>`.

Благодаря всплытию событий, существует подход, при котором некоторые обработчики устанавливаются прямо на документ. Тогда дополнительную информацию о событии мы получаем через `e.target` и выполняем действия ориентируясь на него.

Большая часть событий всплывают, но не все. Например, событие `focus` происходит на полях ввода и не всплывает, и либо мы обрабатываем его, либо оно отбрасывается.

#### Захват события

Захват события - альтернатива всплытию, направленная не от источника события к корню документа, а наоборот. Например, в случае с описанием товара это может быть следующий путь: Window -> Document -> HTML -> Body -> Article -> Target (p).

Чтобы переключиться на этот метод распространения события, нужно передать `true` в качестве третьего аргумента метода `addEventListener`.

#### Пассивные события

При движении пальцем на мобильных устройствах срабатывает событие `touchmove`, за которым по цепочке следует скроллинг. Обычно браузер сначала исполняет пользовательские обработчики, и лишь затем, если в них не вызывается `preventDefault`, исполняет встроенные обработчики. Это может приводит к задержкам в UI. Опция `{ passive: true }` сообщает браузеру, что пользовательский обработчик не будет его отменять, и тогда встроенная реализация отрабатывает до пользовательской, обеспечивая плавный пользовательский опыт.

## События в Веб Компонентах

```html
<user-card></user-card>
<script>
    customElements.define('user-card', class extends HTMLElement {
        connectedCallback() {
            this.attachShadow({mode: 'open'});
            this.shadowRoot.innerHTML = `<p><button>Click me</button></p>`;
            this.shadowRoot.firstElementChild.onclick = e => alert("Inner target: " + e.target.tagName);
        }
    });

    document.onclick =  e => alert("Outer target: " + e.target.tagName);
</script>
```

В этом примере обработчик прикреплен к Shadow DOM через его первого наследника. При клике будет выведено *Inner target: BUTTON* и *Outer target: USER-CARD*. Как и требует инкапсуляция, извне информация о внутренней реализации недоступна и ограничена границами теневого DOM, а внутри самого дерева - доступна. Это называется `event retargeting`, перенаправление событий.

Если событие происходит на элементе, размещенном в слоте, перенаправление события не происходит. Всё потому, что элементы, размещаемые в слотах, находятся в обычном DOM. Например, при щелчке на некоторый элемент `<span slot="username">` таргетом события по обе границы теневого DOM будет `span`.

Чтобы теневое дерево не ограничивало процессы всплытия событий, применяется *flattened DOM*. При описанном выше клике на элемент `<span slot="username">` событие всплывает на уровень элемента `<slot>`, после чего через `#shadow-root` и пользовательский компонент последовательно всплывает к объекту `window`.

Тем не менее, есть несколько событий, которые не преодолевают границы теневого DOM при всплытии. Это поведение определяется свойством событий *composed*: при *true* оно преодолевает границы, при *false* нет. События *load*, *unload*, *select*, *slotchange* не преодолевают границы теневого DOM и могут быть обработаны только внутри него, а события `mouseenter` и `mouseleave` настроены так, что даже не всплывают.

## Пользовательские события

Пользовательские (синтетические) события позволяют определять и генерировать свои события: `new CustomEvent('test', { detail: 'additional info' })`

Если мы хотим, чтобы такие события всплывали за пределы теневого DOM, важно выставить им при создании свойства `{ bubbles: true, composed: true }`.

Для генерации события на элементе используется `dispatchEvent API`: `someElement.dispatchEvent(new CustomEvent('test', { detail: 'additional info', bubbles: true, composed: true }))`

```html
<div id="outer"></div>
<script>
    outer.attachShadow({mode: 'open'});
    outer.shadowRoot.innerHTML = 'div';
    
    document.addEventListener('test', event => alert(event.detail));
    inner.dispatchEvent(new CustomEvent('test', {  bubbles: true,  composed: true,  detail: "composed" }));
    inner.dispatchEvent(new CustomEvent('test', {  bubbles: true,  composed: false,  detail: "not composed" }));
</script>

В этом примере The code shown in Listing 4-4 creates div#inner in the Shadow DOM of div#outer and triggers two events on it. Only the one with composed: true makes it outside to the document.


The structure internally looks like this:div(id=outer)  #shadow-dom    div(id=inner)	This is the view of the content in the browser’s developers tools. It shows the Shadow DOM’s boundary.

The dispatchEvent API

In the last example, I used the dispatchEvent API . It dispatches an event on a target. The listeners are invoked synchronously in their appropriate order. The normal event processing rules apply. An outside viewer can’t distinguish between such custom events and those fired by the internal parts of the document. The “event” itself is described by an interface and exists as an instantiable class with the same name. If you work with TypeScript, you have the type and can make instances like this:const evt = new Event("look", {  "bubbles":true,  "cancelable":false});document.dispatchEvent(evt);The options dictionary is of type EventInit, with just the three already-mentioned properties:	bubbles: An optional Boolean indicating whether the event bubbles. The default is false.
cancelable: An optional Boolean indicating whether the event can be cancelled. The default is false.
composed: An optional Boolean indicating whether the event will trigger listeners outside of a shadow root. The default is false.The internal events may fire asynchronously and the internal processing will continue while executing the handlers. This is different with custom events fired by dispatchEvent. This method calls blocks and waits for the handlers to execute. Consider using async techniques if you need a different behavior.

In TypeScript, the definition looks like this:interface EventInit {    bubbles?: boolean;    cancelable?: boolean;    composed?: boolean;}interface Event {     readonly bubbles: boolean;    cancelBubble: boolean;    readonly cancelable: boolean;    readonly composed: boolean;    readonly currentTarget: EventTarget | null;    readonly defaultPrevented: boolean;    readonly eventPhase: number;    readonly isTrusted: boolean;    returnValue: boolean;    /** deprecated (only for old browsers) */    readonly srcElement: EventTarget | null;    readonly target: EventTarget | null;    readonly timeStamp: number;    readonly type: string;    composedPath(): EventTarget[];    initEvent(      type: string,      bubbles?: boolean,      cancelable?: boolean): void;    preventDefault(): void;    stopImmediatePropagation(): void;    stopPropagation(): void;    readonly AT_TARGET: number;    readonly BUBBLING_PHASE: number;    readonly CAPTURING_PHASE: number;    readonly NONE: number;}declare var Event: {    prototype: Event;    new(type: string, eventInitDict?: EventInit): Event;    readonly AT_TARGET: number;    readonly BUBBLING_PHASE: number;    readonly CAPTURING_PHASE: number;    readonly NONE: number;};Customize Events

Apart from the common Event interface, there is another type you can use: CustomEvent. Despite the name, you don’t need to use it to fire a custom event, but it’s often helpful to get clearer information about the nature of the event. The only difference is that CustomEvent provides an additional property called detail. This is an object you define on the source and the receiver can get custom data here. The sheer existence clarifies the custom nature of the event. The option is part of the initializer, now named CustomEventInit.// this.process omitted for brevityobj.addEventListener("loop", (e) => { this.process(e.detail) });// create and dispatch the eventvar event = new CustomEvent("loop", {  detail: {    loops: 100  }});obj.dispatchEvent(event);	The CustomEventInit type accepts all properties from EventInit, too.
In TypeScript, the definition looks like this:interface CustomEventInit<T = any> extends EventInit {    detail?: T;}interface CustomEvent<T = any> extends Event {    readonly detail: T;    initCustomEvent(      typeArg: string,      canBubbleArg: boolean,      cancelableArg: boolean,      detailArg: T): void;}declare var CustomEvent: {    prototype: CustomEvent;    new<T>(      typeArg: string,      eventInitDict?: CustomEventInit<T>): CustomEvent<T>;};	This provides both a type definition and a constructor description.
Smart Events


Adding events requires script work. To make it easier to use, some global code can be helpful. However, this doesn’t change the basic behavior and flow as described before. Events are defined by a special instruction. They are attached to document objects, regardless of usage.
Events are easy to add directly using a dataset like data-onclick. All JavaScript events are supported this way. Just replace onclick in the example with any other JavaScript event:<button data-on-click="clickId">OK</button>Now, on an applications global start script (see Listing 4-5), attach handlers to anything with such an event definition.document.querySelectorAll('[^data-on-]').forEach(elem => {  const events = elem.dataSet.filter(d => d.startsWidth('on'));  events.forEach(event =>  {    elem.addEventHandler(event, e => {      // global handler      const instruction = e.target.dataSet(event);      // deal with it    });  });});Listing 4-5	Smart Events (chapter4/smart/index.html)

The effect here is, depending on the number of such events, to drastically reduce the amount of code for attaching events. However, it’s not that easy to add similar removeEventHandler calls. The code is more appropriate for a single-page app, where the final state of the code is static and held in memory anyway.
Summary


In this chapter, I explained event handling in the browser, the way to attach events to normal and shadowed Web Components and how to extend the event system. By using custom events, the way components communicate to each other can be easily extended. Some TypeScript definitions show how the objects are built internally. Attaching events globally using the document object shows how to minimize the effort to attach multiple events.


<!-- /// -->
As it is a menu, as a last step you need to add event handlers. That’s not so much different from regular HTML, with just one exception. Attached event handlers are not copied in the clone process. Because slots need templates and templates need cloning, you must attach the events in the component and expose the event.

To expose custom events, you use the API call dispatchEvent like this:

```js
customElements.define('menu-item', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<li>${this.textContent}</li>`;
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                console.log(e);
                this.dispatchEvent(new CustomEvent('menuclick', {
                    details: e.currentTarget.textContent
                }));
            }
        });
    }
});
```

The event name is your personal choice. It’s as customizable as any name. If you want to transfer custom data, the class CustomEvent is better than just using Event. This type provides an additional property named detail. The receiving component must also access the content of the slot, not the actual definition. The complete example is written in TypeScript. Due to the types it gives a better understanding.

```js
class MenuItem extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        if (!this.shadowRoot) {
            return
        }

        this.shadowRoot.innerHTML = `<li>${this.textContent}</li>`;
        this.shadowRoot.addEventListener('click', (e: Event) => {
            if ((e.target as HTMLElement).tagName === 'LI') {
                console.log(e);
                const customEvent: CustomEventInit = {
                    detail: (e.currentTarget as HTMLElement).textContent
                };
                this.dispatchEvent(new CustomEvent('menuclick', customEvent));
            }
        });
    }
}

class CustomMenu extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        if (this.shadowRoot) {
            return
        }
        this.shadowRoot.innerHTML = `
            <div>
                <slot name="title"></slot>
                <ul>
                    <slot name="item"></slot>
                </ul>
            </div>`;
        const slot = this.shadowRoot.querySelector<HTMLSlotElement>('slot[name="item"]');
        if (slot) {
            slot.assignedNodes().forEach((e: Node) => {
                e.addEventListener('menuclick', (el: Event) => alert((el as CustomEvent).detail));
            });
        }
    }
}

customElements.define('menu-item', MenuItem);
customElements.define('custom-menu', CustomMenu);
```

In the event receiver, the slot is read by querySelector and the slot’s selector (line 43). This returns an HTMLSlotElement instance. This is the same as HTMLElement with just one exception: the method assignedNodes . That’s the way to access the projected content, the elements that fire the actual event. For all of the nodes, you attach an event handler that receives the custom event.

Custom events work exactly like the standard events, but they provide an additional field detail that can be of type any or a type enforced by a generic. To fire a custom event properly, the type CustomEventInit is the right way (line 14 to 17).
