# Тестирование

Integration tests are important for TextInputComponent because you can validate the component’s outward facing API: the at-tributes, getters, and setters you defined in previous sections op-erate as expected. Snapshot tests will validate the interaction states you styled.

For the integration tests, you’ll be using the Form Story from the previous section as a test bed. Before you begin writing integration tests, ensure there is a submit classname added to the submit button in the FormTemplate so it can be easily queried during testing.

Создайте соответствующий файл

Убедитесь, что Storybook запущен

In TestInput.spec.js, set up the test by declaring a describe block.

1	describe("TextInputComponent", () => {

2

3  }

1	it("should display error message on blur", () => {

2	cy.visit("iframe.html?id=components-inputs-textinput-\ 3 -form");

Make an assertion that tests if the error message displays on blur. First tell Cypress to navigate to the Form story in Storybook, referencing the URL of the story in the browser address bar

Query for each element in Light DOM with get, checking each element is visible using should, and then use Cypress to click on each input and the submit button by chaining click().

1	cy.get("#root").get('[id="username"]').should("be.vis\ 2 ible").click();
3	cy.get("#root").get('[id="password"]').should("be.vis\ 4 ible").click();
5	cy.get("#root").get(".submit").should("be.visible").c\ 6 lick()


Find the message container elements in Shadow DOM, and check they contain the appropriate error messages using similar chained methods, but this time querying in ShadowDOM using the shadow and find methods.

1	cy.get("#root")

2	.get('[id="username"]')

3	.shadow()

4	.find(".message")

5	.contains("Error: Required, please enter a username\

6   .");

7	cy.get("#root")

8	.get('[id="password"]')

9	.shadow()

10	.find(".message")

11	.contains(

12	"Minimum length not met, please supply a value wi\

13	th at least 8 characters."

14	);


Test that both inputs in the FormTemplate don’t display error messages when the inputs are valid. Write a new test titled should not display error message when valid and visit the same story in Storybook.

1	it("should not display error message when valid", () =>\

2	{

3	cy.visit("iframe.html?id=components-inputs-textinput-\ 4 -form");

Select each input, and call type to enter a value that should pass validation.

1	cy.get("#root")

2	.get('[id="username"]')

3	.shadow()

4	.find("input")

5	.type("jane@doe.com");

6	cy.get("#root")

7	.get('[id="password"]')

8	.shadow()

9	.find("input")

10	.type("W3BC0mpon3nts!");


Use Cypress to click the submit button.

1	cy.get("#root").get(".submit").should("be.visible").c\ 2 lick();

Verify that both message containers are empty.

1	cy.get("#root")

2	.get('[id="username"]')

3	.shadow()

4	.find(".message")

5	.should("include.text", "");

6	cy.get("#root")

7	.get('[id="password"]')

8	.shadow()

9	.find(".message")

10	.should("include.text", "");

You just tested the validations you developed in this chapter work when the value of TextInputComponent is invalid and that no user feedback is visible when TextInputComponent is valid. There are many more aspects to the TextInputComponent that could be validated with integration tests, although we’ll stop here for the sake of brevity.


