# Slots API

A slot is a placeholder that users can fill with their own markup. The slot may exist outside a Web Component or inside, in conjunction with a template or a Shadow DOM (or both).
Slots Explained


	Many types of components, such as tabs, menus, image galleries, and so on, need dynamic content to render properly. Just like a browser’s built-in element <select> expects <option> items, a <custom-tabs> may expect the actual tab content to be passed. And a <custom-menu> may expect menu items.
The code that makes use of <custom-menu> could look like this:<custom-menu>  <title>Languages</title>  <menu-item>JavaScript</menu-item>  <menu-item>PHP</menu-item>  <menu-item>Ruby</menu-item></custom-menu>	Your component should render it properly as a nice menu with given title and items, handle menu events, etc.
Slot and Templates


Listing 6-1 shows a shadowed template with some neat styling.<template id="tmpl">  <style>    :host {      background: #f8f8f8;      padding: 10px;      transition: all 400ms ease-in-out;      box-sizing: border-box;      border-radius: 5px;      width: 450px;      max-width: 100%;    }    :host(:hover) {      background: #ccc;    }    div {      position: relative;    }    header {      padding: 5px;      border-bottom: 1px solid #aaa;    }    h3 {      margin: 0 !important;    }    textarea {      font-family: inherit;      width: 100%;      height: 100px;      box-sizing: border-box;      border: 1px solid #aaa;    }    footer {      position: absolute;      bottom: 10px;      right: 5px;    }  </style>  <div>    <header>      <h3>Add a Comment</h3>    </header>    <slot name="p"></slot>    <textarea></textarea>    <footer>      <button>Post</button>    </footer>  </div></template><div id="host">  <p slot="p">Instructions go here</p></div><script>   var shadow = document.querySelector('#host');  shadow.attachShadow({ mode: 'open' });  shadow.shadowRoot.appendChild(tmpl.content.cloneNode(true));</script>Listing 6-1	Slot Example (chapter6/host/index.html)

	The idea here is to provide some initial instruction to make the template more dynamic. The slot is some kind of parameter here: <slot name="p"></slot> (line 42).
The name attribute is a reference to the element that has a slot attribute with that name. That’s the way to get external information in the template at runtime. The result is shown in Figure 6-1.   Figure 6-1	Slot in the browser and debugger
Shadow DOM


	The Shadow DOM supports <slot> elements that are automatically filled by the content from the light DOM. The above example is already “shadowed,” but that’s just an option. There is no need for the slots to use a Shadow DOM.
Slots and Components


Let’s see how slots work on a simple example with Web Components. Listing 6-2 shows that the <user-card> shadow DOM provides two slots, filled from the light DOM.<user-card>  <span slot="username">Joerg</span>  <span slot="birthday">May, 26</span></user-card><script>customElements.define('user-card', class extends HTMLElement {  connectedCallback() {    this.attachShadow({mode: 'open'});    this.shadowRoot.innerHTML = `      <div>Name:        <slot name="username"></slot>      </div>      <div>Birthday:        <slot name="birthday"></slot>      </div>    `;  }});</script>Listing 6-2	Slots with a Shadow DOM (chapter6/card/index.html)

	Then the browser performs “composition:” it takes elements from the light DOM and renders them in corresponding slots of the Shadow DOM. At the end, you have exactly what you want: a component that can be filled with data.
Figure 6-2 shows the DOM structure after the script, not taking composition into account.   Figure 6-2	Slots in a Web Component’s Shadow DOM
	The shadow DOM is under #shadow-root. For rendering purposes, for each <slot name="..."> in the Shadow DOM, the browser looks for slot=“…” with the same name in the light DOM. These elements are rendered inside the slots. The flattened DOM exists only for rendering and event-handling purposes. It’s kind of “virtual.” That’s how things are shown. But the nodes in the document are actually not moved around!
The last proposition can be easily checked if you run querySelectorAll. All the nodes are still at their places. The example shows that the light DOM <span> nodes are still at the same place, under <user-card>. Check it by executing this piece of code:// Expected output: 2console.log(document.querySelectorAll('user-card span').length );	So, the flattened DOM is derived from the Shadow DOM by inserting slots. The browser renders it and uses it for style inheritance and event propagation. But JavaScript’s DOM API still sees the document “as is,” before flattening.
Slot Behavior


	In this section, I go a little deeper into the specific behaviors of slots.
Slot Positions


	Only top-level children may have a slot=“…” attribute. The slot=“…” attribute is only valid for direct children of the shadow host (in this example, the <user-card> element). For nested elements, it’s ignored.
In the example shown in Listing 6-3, the second <span> is ignored (as it’s not a top-level child of <user-card>).<user-card>  <span slot="username">Joerg Krause</span>  <div>    <!-- invalid slot, must be direct child of user-card →    <span slot="birthday">May, 26</span>  </div></user-card>Listing 6-3	Nested Slots (chapter6/cardwrong/index.html)

Multiple Slots


If there are multiple elements in a light DOM with the same slot name, they are appended into the slot, one after another. Listing 6-4 shows this and makes use of a list created by repeating slots.<user-card>  <li slot="username">Joerg</li>  <li slot="username">Clemens</li>  <li slot="username">Elest</li>  <span slot="birthday">May, 26</span></user-card><script>  customElements.define(    'user-card',    class extends HTMLElement {      connectedCallback() {        this.attachShadow({ mode: 'open' });        this.shadowRoot.innerHTML = `        <div>Name:          <ul>            <slot name="username"></slot>          </ul>        </div>        <div>Birthday:          <slot name="birthday"></slot>        </div>`;      }    }  );</script>Listing 6-4	Multiple Slots (chapter6/cardmany/index.html)

The <user-card> element is empty, so all slot content falls back to the default text provided in the slots’ definitions. Figure 6-3 shows the outcome in the browser and debug view.   Figure 6-3	Fallback text appears if slots are missing
Default Slots


	The first <slot> in the Shadow DOM that doesn’t have a name is a “default” slot. It gets all of the nodes from the light DOM that aren’t slotted elsewhere.
For example, let’s add the default slot to your <user-card> that shows all unslotted information about the user. See Listing 6-5.<user-card></user-card><script>  customElements.define(    'user-card',    class extends HTMLElement {      connectedCallback() {         this.attachShadow({ mode: 'open' });        this.shadowRoot.innerHTML = `      <div>Name:        <slot name="username">Not available</slot>      </div>      <div>Birthday:        <slot name="birthday">n/a</slot>      </div>    `;      }    }  );</script>Listing 6-5	Default Slot Content (chapter6/default/index.html)

	All the unslotted light DOM content gets into the “Other information” fieldset (line 20).
Elements are appended to a slot one after another (see Figure 6-4), so both unslotted pieces of information are in the default slot together. The named slots are stripped out and placed where the placeholders are as before.   Figure 6-4	Projected default content
Slot Events


Now let’s go back to the element <custom-menu>, mentioned at the beginning of this chapter. You can use slots to distribute menu items. Listing 6-6 shows the markup for <custom-menu>.<custom-menu>  <span slot="title">Technologies</span>  <menu-item slot="item">HTML 5</menu-item>  <menu-item slot="item">CSS 3</menu-item>  <menu-item slot="item">ECMAScript</menu-item></custom-menu>Listing 6-6	Custom Menu Items (chapter6/menu/index.html)

That’s much better than the generic <li> in the slot elements. It requires, however, an additional component. The code has now two components; see Listing 6-7.customElements.define(  'menu-item',  class extends HTMLElement {    connectedCallback() {      this.attachShadow({ mode: 'open' });      this.shadowRoot.innerHTML = `<li>${this.textContent}</li>`;    }  });customElements.define(   'custom-menu',  class extends HTMLElement {    connectedCallback() {      this.attachShadow({ mode: 'open' });      this.shadowRoot.innerHTML = `    <div>      <slot name="title"></div>      <ul>        <slot name="item"></slot>      </ul>    </div>`;    }  });Listing 6-7	Slot Events (chapter6/menu/index.html)

	The slots’ content is not further abstracted. Instead, it’s pulled directly as text using the textContent property.
Adding an Event Handler


	As it is a menu, as a last step you need to add event handlers. That’s not so much different from regular HTML, with just one exception. Attached event handlers are not copied in the clone process. Because slots need templates and templates need cloning, you must attach the events in the component and expose the event.
To expose custom events, you use the API call dispatchEvent like this:customElements.define(  'menu-item',  class extends HTMLElement {    connectedCallback() {      this.attachShadow({ mode: 'open' });      this.shadowRoot.innerHTML = `<li>${this.textContent}</li>`;      this.shadowRoot.addEventListener('click', (e) => {        if (e.target.tagName === 'LI') {          console.log(e);          this.dispatchEvent(new CustomEvent('menuclick', {            details: e.currentTarget.textContent          }));        }      });    }  });The event name is your personal choice. It’s as customizable as any name. If you want to transfer custom data, the class CustomEvent is better than just using Event. This type provides an additional property named detail. The receiving component must also access the content of the slot, not the actual definition. The complete example is written in TypeScript. Due to the types it gives a better understanding. See Listing 6-8.class MenuItem extends HTMLElement {  constructor() {    super();  }  connectedCallback() {    this.attachShadow({ mode: 'open' });    if (this.shadowRoot) {      this.shadowRoot.innerHTML = `<li>${this.textContent}</li>`;      this.shadowRoot.addEventListener('click', (e: Event) => {        if ((e.target as HTMLElement).tagName === 'LI') {          console.log(e);          const customEvent: CustomEventInit = {            detail: (e.currentTarget as HTMLElement).textContent          };          this.dispatchEvent(new CustomEvent('menuclick', customEvent));        }       });    }  }}class CustomMenu extends HTMLElement {  constructor() {    super();  }  connectedCallback() {    this.attachShadow({ mode: 'open' });    if (this.shadowRoot) {      this.shadowRoot.innerHTML = `              <div>                <slot name="title"></div>                <ul>                  <slot name="item"></slot>                </ul>              </div>`;      const slot = this            .shadowRoot            .querySelector<HTMLSlotElement>('slot[name="item"]');      if (slot) {        slot.assignedNodes()          .forEach((e: Node) => {            e.addEventListener('menuclick', (el: Event) =>              alert((el as CustomEvent).detail));          });      }    }  }}customElements.define('menu-item', MenuItem);customElements.define('custom-menu', CustomMenu);Listing 6-8	Exposing an Event (chapter6/menuevent/event.ts)

	In the event receiver, the slot is read by querySelector and the slot’s selector (line 43). This returns an HTMLSlotElement instance. This is the same as HTMLElement with just one exception: the method assignedNodes . That’s the way to access the projected content, the elements that fire the actual event. For all of the nodes, you attach an event handler that receives the custom event.
	Custom events work exactly like the standard events, but they provide an additional field detail that can be of type any or a type enforced by a generic. To fire a custom event properly, the type CustomEventInit is the right way (line 14 to 17).
Updating Slots


Let’s continue with the menu example. What if the outer code needs to add or remove menu items dynamically? The manipulation works as with any other element and goes directly into the DOM. Assume you have a single button on the page. The code in Listing 6-9 (lines 6 to 9) adds more items and re-renders the component immediately.document.querySelector('button')?.addEventListener('click', () => {  document.querySelector('custom-menu')?    .insertAdjacentHTML('beforeend',                        '<menu-item slot="item">This is new</menu-item>');});Listing 6-9	Exposing an Event (chapter6/menuevent/event.ts)

	The components are the same as in the previous example.
Slot Change Events


	If you want to monitor the changes, the API provides a special event, slotchange here. It fires one more than your actions because it also captures the initializing phase.
	If you’d like to track the internal modifications of the light DOM from JavaScript, that’s also possible using a more generic mechanism, the MutationObserver.
The Slot API


Finally, let’s look into the slot-related JavaScript methods. As you’ve seen before, JavaScript looks at the “real” DOM, without flattening. But, if the shadow tree has {mode: 'open'}, you can figure out which elements are assigned to a slot and, vise-versa, the slot itself by the elements inside it:	node.assignedSlot: Returns the <slot> element that the node is assigned to
	slot.assignedNodes({flatten: true/false}): DOM nodes assigned to the slot. The flatten option is false by default. If explicitly set to true, then it looks more deeply into the flattened DOM, returning nested slots in case of nested components and the fallback content if no node assigned.
	slot.assignedElements({flatten: true/false}): DOM elements assigned to the slot (same as above, but only element nodes)
These methods are useful when you don’t just need to show the slotted content, but also track it in JavaScript. For example, if the <custom-menu> component wants to know what it shows, then it could track slotchange and get the items from slot.assignedElements, as in Listing 6-10.this.shadowRoot  .querySelector('ul')  ?.addEventListener('slotchange', (s: Event) => {    const slot = s.target as HTMLSlotElement;    if (slot.name === 'item') {      let items = slot.assignedElements()        .map(e => e.textContent)        .join(' ');      const output = document.querySelector<HTMLDivElement>('#output');      if (output) {        output.innerText = items;      }    }  });Listing 6-10	Listening to an Event (chapter6/menuslotapi/event.ts)

	This is from the previously shown class called CustomMenu . First, the event source is the element where the slots’ content is assigned. Here you capture the change (<ul>). The sender is the slot itself of type HTMLSlotElement. Using the method assignedElements you can get access to the actual element after the change happened. The rest of the code is just for demonstration. It retrieves the content and makes a visible output into a <div> element.
Summary


	In this chapter, you captured the <slot> element and learned how to use it to parameterize templates. You explored some examples in JavaScript and TypeScript that showed the power of the underlying API, dealing with slot instances and handling slot-specific events.
