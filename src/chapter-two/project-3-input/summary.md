# Компонент `<input-text>`

## Итоги проекта

In this chapter, you accomplished a lot! You developed a form-associated custom element, TextInputComponent, that handles several states for a text input: default, error, and disabled. By setting formAssociated on the component class, you enabled TextInputComponent to participate in form validation and submission. ElementInternals provided several methods to aid in validation, but didn’t provide a handy method for validating an entire form using the value from TextInputComponent, so you dispatched a validate Event to the HTMLFormElement, which allowed you to hook into a custom validation model. setFormValue on ElementInternals allowed you to update form FormData and loop over the form’s entries on submission.

Later in this book in Chapter Nine, you’ll reuse some of the functionality mocked in Storybook to develop the login view in the application.

Examples in this chapter are practical, so the potential of form-associated custom elements may not be obvious. Adding ElementInternals to a custom element gives you the best of both worlds:

•	Template and styling encapsulation with Shadow DOM

•	The ability to participate in form validation and submission

Form-associated custom elements don’t have to include a typical form control like input or textarea. You can craft new user inter-faces and with ElementInternals have these custom experiences participate in forms like any other form control. That is the real potential of form-associated custom elements: completely new user interfaces that work seamlessly with HTML forms as if they were native form control in the browser.

In the next chapter, you’ll expand on the topic of forms by making the TextInputComponent follow Accessibility best practices, and
you’ll enhance the submit button with another Web Components specification: customized built-in elements.

