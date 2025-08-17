# Микро-библиотека `easy-wc`

Coding a generic attachTemplate

We have coverage for every template so far with attachShadow and attachStyle. These functions handle CSS styles scoped to any component implementation whether or not the component relies on Shadow DOM. ButtonComponent uses attachStyle, but doesn’t employ it’s own custom template. Shadow DOM is only supported by a handful of DOM elements⁶⁰. For the rest we may need a way to append a template directly to the element using the Component decorator. In this section, you’ll code a simple function named attachTemplate that appends a HTML template to the element.

Make a new file named template.ts in the packages/common/src/template directory. In this file, export a new function named attachTemplate. This function takes one argument, the context, i.e. the element the template will be appended. context could be any element in DOM, so type define the argument as any. attachTemplate doesn’t return anything, so the return type is void.

1	export function attachTemplate(context: any): void {} attachTemplate should create a HTML template, set the template
innerHTML to the content of the ElementMeta template property, then append a clone of the template to the context. When com-pleted, the function should be as follows:

1	export function attachTemplate(context: any): void {

2	const template = document.createElement("template");

3template.innerHTML = context.elementMeta.template;

4	context.appendChild(template.content.cloneNode(true));

5   }

For some, this implementation may seem trivial, it simply takes a string and sets the content of the template, then appends that content to the element. This implementation could get more com-plicated over time. Perhaps the content needs to be injected into a child element or prepended before all other content in the element. Maybe the end-user wants to reference a HTML template already available in DOM, so we don’t need to create a new HTML template. These are valid use cases we may explore later, but for now we just need a function in the micro-library that can handle a very simple use case because the Component decorator supports a template string for any element, not just those that can use Shadow DOM.

To finish this implementation, ensure attachTemplate is properly exported.

## Enhancing developer experience with html and css

You’ve completed the necessary tasks to provide a micro-library that handles the component selector, styling, and template. Each component looks much cleaner since refactoring them to use the new Component decorator. There’s still one problem to solve though. Our IDE has no way to detect the strings setting style and template in the decorator function are CSS and HTML. This means no syntax highlighting, which developers have come to expect.

It is possible to gain syntax highlighting in the template strings with a little help from simple function and the proper extension for your IDE. es6-string-html⁶¹ is an extension for VS Code that adds syntax highlighting support for multi-line JavaScript template strings. After installing this extension, nothing happens at first to CardComponent, TextInputComponent, or ButtonComponent. If you poke around a little, you may notice the template returned by FormTemplate in packages/component/src/input/TextInput.stories.js has HTML that is syntax highlighted. That’s due to the template string being set as an argument on the html function imported from lit-html. This function has some superpowers, like being able to interpet @event attribute syntax, but we haven’t yet chosen to adopt lit-html in the component library. As alluring as that may be, the micro-library we just developed will produce a smaller bundle than lit-html. We’d lose that benefit. For some people this may also be confusing, because isn’t a function supposed to be called with parenthesis like html()? It turns out there’s an odd quirk with JavaScript that allows the html function to be called with a single argument, the template string sitting directly beside html This is known as a tagged template literal and has been around since ES2015.

In addition to the VS Code extension, we’ll need two functions exported from @in/common that let the extension interpret the template strings as HTML and CSS. All that is really needed for the extension to work is the keyword html or css prior to the multi-line string.

In packages/common/src/template/template.ts, export two new functions named css and html. These two functions will handle tagged template literals for CSS and HTML templates. As tagged template literals, both functions should take a TemplateStringsArray named template in their first argument and return a string. template must be properly typed TemplateStringsArray because tagged template literals pass as an immutable array-like Object TypeScript defines as TemplateStringsArray. The second argument is a bit more ambiguous. Template literals in JavaScript can accept variable members used for string interpolation, with the notation ${}. TemplateStringsArray is an Array of string separated by any instances of string interpolation. These instances are found in another Array that can be spread from the second argument. The items in this Array are ambiguous because they could be anything; a string, number, or function. If the engineer using these functions were to use string interpolation, you would need some special handling for this in html and css, so loop over the TemplateStringsArray and concatenate the same index of an item in the rest Array in every loop, handling the case where there is no such item. Finally, return the string. Make sure to export both
html and css.

```ts
export function html(template: TemplateStringsArray, ...rest: any): string {
    let str = "";

    template.forEach((string, i) => {
        str += `${string} ${rest[i] || ""}`;
    });

    return str;
}

export function css(template: TemplateStringsArray, ...rest: any): string {
    let str = "";

    template.forEach((string, i) => {
        str += `${string} ${rest[i] || ""}`;
    });

    return str;
}
```

Export html and css functions from packages/common/index.ts.

1	export { Component } from "./src/decorator";

2	export type { ElementMeta } from "./src/decorator";

3   export {

4	attachShadow,

5	attachStyle,

6	attachTemplate,

7	html,

8	css,

9	} from "./src/template";

In packages/component/src/card/Card.ts import both html and css from #in/common and apply each function to the template and style properties, respectively.

In ButtonComponent you’ll only need to import css and use it to provide syntax highlighting for the inline CSS. When all three components now display syntax highlighting for the template and style properties, your work is completed.

We’ve made some extraordinary progress with fairly little code exported from @in/common to support component development. There is so much functionality we could provide from the micro-library, but at the expense of bundle size and performance. Keeping the component implementation close to the metal, as they say, is beneficial for performance. Sticking to browser specification while providing some syntactical sugar for developers as they work with spec is the best of both worlds.
