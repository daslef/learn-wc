# Итоги проекта

In this chapter, you coded the first autonomous custom element us-ing several specifications that comprise Web Components: Shadow DOM, HTML templates, and ES Modules. You used Shadow DOM to provide encapsulation around the component template, isolating component styles and elements from the global scope of Light DOM. CSS variables came in handy when you styled the com-ponent because they pierce the shadow boundary unlike styles from a global stylesheet. Slots provide a dynamic template for the component, allowing you to project different content into the header, content, and footer.

CardComponent was exported using ES Modules and imported into Card.stories.js, a file where Storybook Stories are declared. You scaffolded the ImageCard Story, which provided a development environment for coding CardComponent and test bed for testing the component with Cypress and StoryShots.

Subsequent chapters follow a similar trajectory. You’ll develop several user interface components using custom elements and browser specifications, importing the component class into a Story, then use Storybook as a development environment for coding the template, styling, and behavior of the component you’re focusing on in each chapter.

This chapter about autonomous custom elements was broad in scope to introduce you to the set of specifications known as Web Components. Later chapters narrow the scope of the material, while reinforcing the concepts you learned in this chapter. If you’ve made it this far you are prepared to continue onward and learn about the other two kinds of custom elements: form-associated and customized built-in elements.
