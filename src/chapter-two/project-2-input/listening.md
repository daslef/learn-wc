# Отслеживание атрибутов

Source of truth

Before we move forward, there is an important distinction to make between the custom element and the input. The form-associated custom element is where communication happens between the component and the form, while the input is where all user interac-tion typically takes place. When a user clicks the input or navigates there via the keyboard, focusing it, they are interacting with the input, not the custom element.

This poses a problem. Where is the source of truth for component state? So far, you’ve exposed methods on the class that suggests the source of truth is derived from properties and attributes on the custom element, but if you were to set a required attribute on the custom element, how does the input interpret this change to the required state? Conversely, when the input value updates, how does the custom element report the value to the outside world?

Part of the problem is that form controls usually expose getters that expose the state of required, disabled, the value, and so on, except the only stable way to set the state on the form control is via attributes. To make a HTMLInputElement required, for instance, you have to set the required attribute on the input.

1	<input type="text" required />

When developing reusable UI components, the outward-facing API of the component matters. If we expose the component state only through getters and setters, it would be awkward for engineers used to setting attributes on form controls to set state. Consider a problem we’ve already introduced concerning the design of the

Validator. In the condition declared in TextInput.stories.js, the first argument input checks if the input has a property required and validates if the input has a value by assessing input.value.length. But what is input? Is input referencing the TextInputComponent or the embedded HTMLInputElement?

```ts
validations: [
    {
        flag: { valueMissing: true },
        message: "Error: Required",
        condition: (input) => input.required && input.value.length <= 0,
    },
],
```

One solution is to treat the HTMLInputElement as the single source of truth for component state and essentially use TextInputComponent as a pass-thru, exposing properties of the HTMLInputElement with getters on the component class and using setters that change the state of the HTMLInputElement. That way, TextInputComponent exposes an outward-facing API. Let’s see how this works in action. To achieve this we need a way to set attributes on in-textinput and have the component react to changes to those attributes, similar to how a typical input element behaves.

## Listening for attribute changes

Luckily, custom elements provide an API for observing changes to attributes and reacting to those changes. Every custom element has access to a static getter called observedAttributes. Using observedAttributes, you can establish which attributes the com-ponent listens to for changes. For performance sake, you have to whitelist each attribute that should be observed.

Just below the constructor in the TextInputComponent class, de-clare the observedAttributes getter. observedAttributes returns an Array of String, each String corresponding to the name of the attribute that should be observed. Add required and value to the Array. You’re declaring observedAttributes so that developers can set the value and required attributes on TextInputComponent because those are the properties the condition in the Validator is referencing to validate whether or not the field has value. You’ll add more attributes that should be observed later, but for now, required and value should suffice.

```ts
static get observedAttributes() {
    return ["required", "value"];
}
```

After declaring which attributes should be observed, a second method named attributeChangedCallback handles attribute changes. attributeChangedCallback is another method available to all custom elements that must be used in conjunction with observedAttributes.

`attributeChangedCallback` has three arguments, name, previousValue, and currentValue that pass the name of the changed attribute, the previous value of the attribute, and the current value of the attribute, respectively. For the sake of brevity, we’ll call these arguments name, prev, and next. You could strictly type define the arguments and what the method returns, but for now we’ll ignore the types for this method. prev and next could have many different types, so type defining these attributes anything other than any can become tricky. name will most certainly always be of type string.

Looking at the attributeChangedCallback, it appears we need a way to do something based on the value of name passed through the first argument of attributeChangedCallback. A typical convention is to use a switch statement.

```ts
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
```

Add the switch to attributeChangedCallback, passing in the name. Set up case for value and required. If you try to set this.value and this.required based on the value of next, you’ll be prompted with errors the value and required properties do not exist, so let’s add them. When you are finished attributeChangedCallback should appear like the example below.

## Using getters and setters to communicate state

Existing form controls like HTMLInputElement and HTMLTextAreaElement set their own state through attributes, and in some cases, properties. value and disabled can reliably be set through properties on HTMLInputElement, but there is no equivalent setter for required; required state must be set through an attribute. In this section, you’ll wrangle these odd behaviors by adding getters and setters to TextInputComponent class.

Earlier, we tried to set value in the attributeChangedCallback, but it failed because there currently isn’t a value setter, so let’s add one. A setter method in JavaScript starts with the set keyboard, followed by the name of the method: value. The first argument of this method is the value that should be set. The setter passes the value argument to the HTMLInputElement by setting that element’s value property.

```ts
set value(value: string) {
    this.$input.value = value;
}
```

To allow the Validator access to the current value of the HTMLInputElement, make a getter on the TextInputComponent class. Getters in JavaScript start with the get keyword, followed by the method name: value. There’s no arguments here, but you can set the return value as string, then in the curly brackets of the method, return the HTMLInputElement current value state:
this.$input.value.

```ts
get value(): string {
    return this.$input.value;
}
```

Repeat the same process for getters and setters for the required state, although this time, you’ll have to set state of the HTMLInputElement by setting its required attribute. When passing the required state from the TextInputComponent attribute through attributesChangedCallback, the type of the required state will be string, because that’s usually the type of anything passed through attributes. This is a problem because when coding the getter for required, you can reliably access the required state of the HTMLInputElement through the required property, which returns the required value with the type boolean.

Add the required getter to TextInputComponent.

```ts
get required(): boolean {
    return this.$input.required;
}
```

In TypeScript, getter and setter types must match, so the setter has to accept both a string and boolean in the first argument. Code the required setter, adding conditions that check the value and either call setAttribute or removeAttribute on the HTMLInputElement.

```ts
set required(value: boolean | string) {
    if (value === "true" || value === true) {
        this.$input.setAttribute("required", "true");
    }

    if (value === "false" || value === false) {
        this.$input.removeAttribute("required");
    }
}
```

Once you’ve completed the value and required getters and setters, return to TextInput.stories.js and add the required attribute to in-textinput in the story template.

You’d expect to see a required attribute set on the HTMLInputElement. However, if you use Dev Tools to observe the changes in DOM, you’ll notice the required attribute is still missing.

This is something we need to fix since TextInputComponent relies on the state of HTMLInputElement, but what is the problem?

## Passing attribute values to children

It’s likely the HTMLInputElement hasn’t received a call to setAttribute because it doesn’t exist yet. Remember, the HTMLInputElement is encapsulated by Shadow DOM. When TextInputComponent instantiates, attributeChangedCallback fires almost immediately, but the browser hasn’t yet fully parsed all the nodes in the ShadowDOM.

To handle situations like this, custom elements include another lifecycle method named connectedCallback that runs when the custom element is added to DOM. connectedCallback offers a space where you can reliably query DOM nodes in the custom element
ShadowRoot.

So, what does this mean for setting attributes reliably when you need to pass the value of the attribute from parent to child node? This means you need to store the values of the attribute somehow and defer setting the child node’s attributes to connectedCallback. Eventually, you’re going to handle many more different attributes in attributeChangedCallback, so create a new property on the TextInputComponent class called $attr and make it equal to an empty Object.

```ts
private $attr = {};
```

In the first line of attributeChangedCallback, set properties on this.$attr with whatever passes through the callback.

```ts
this.$attr[name] = next;
```

Before or after the declaration of attributeChangedCallback in TextInputComponent, make a new method called connectedCallback.

```ts
connectedCallback() {
    for (let prop in this.$attr) {
        this.$input.setAttribute(prop, this.$attr[prop]);
    }
}
```

Inside the method implementation, loop over the properties on this.$attr and call setAttribute on the HTMLInputElement for every attribute currently stored in the $attr Object.

Inspect the DOM again in Storybook and notice the required attribute is now properly set on HTMLInputElement.

In this section, you learned about connectedCallback, a method that fires whenever the custom element is added to DOM. Com-bined with attributeChangedCallback, you developed a means to pass the values of attributes from parent to child whenever the custom element is instantiated, while getters and setters de-clared on the TextInputComponent class handle changing the value whenever it changes during the lifespan of the component.

connectedCallback and attributeChangedCallback are lifecycle methods available on all custom elements. Later in this chapter, you’ll learn about lifecycle methods available only to form-asso-ciated custom elements.


<!-- To achieve these goals, TextInputComponent has to use several lifecycle hooks provided by HTMLElement. Form controls usually provide an interface so that developers can set different properties via attributes, like in the case of making HTMLInputElement have a required state. You’ll provide a similar interface for TextInputComponent, requiring the use of two methods available to all custom elements:

•	observedAttributes to declare which attributes should listen for changes

•	attributeChangedCallback to handle changes to attributes declared in observedAttributes

•	connectedCallback when logic needs to run after the custom element is instantiated

By listening to attributes on TextInputComponent you’ll be able to pass attribute values to a HTMLInputElement embedded in the component Shadow DOM through attributeChangedCallback. An-other lifecycle hook named connectedCallback allows you reliably bind event listeners to child elements in Shadow DOM that don’t exist until after the component has been inserted into DOM and is a more reliable space to query for child elements than the
constructor.

Just like in the previous chapter, these new custom elements will extend from HTMLElement, use ShadowDOM for encapsulation, and register with the CustomElementRegistry in the same way. What sets form-associated custom elements apart from autonomous cus-tom elements is the addition of the ElementInternals interface and a new property named formAssociated. When formAssociated is true, the custom element provides a slew of other lifecycle hooks. In this chapter, you’ll use:

•	formDisabledCallback to react to changes in the disabled states of fieldset,

•	formStateRestoreCallback when the user agent makes at-tempts to restore form control state, and

•	formResetCallback to reset the value of the form control. -->

