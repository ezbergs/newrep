//Create a function that returns "fizz" if number is a multiple of 3 , return "buzz" if the number is a multiple of 5
// return "fizzbuzz" if the number is a multiple of 3 and 5
// 3 6 9 - returns fizz
// 10 20 25 - returns buzz
// 15 30 45 - returns fizzbuzz

function fizzBuzz(number) {
  if (number % 3 === 0 && number % 5 === 0) {
    return "fizzbuzz";
  }
  if (number % 3 === 0) {
    return "fizz";
  }
  if (number % 5 === 0) {
    return "buzz";
  }
  return "Oh no , number is not a multiple of 3 or 5";
}

function fizzMessageExpected(array, expected) {
  array.forEach((number) => {
    expect(fizzBuzz(number)).to.eq(expected);
  });
}

context("Fizz buzz test cases", () => {
  it("Returns fizz if the number is a multiple of 3", () => {
    fizzMessageExpected([3, 6, 9, 12], "fizz");
  });

  it("Returns buzz if the number is a multiple of 5", () => {
    fizzMessageExpected([10, 20, 25], "buzz");
  });

  it("Returns fizzbuzz if the number is a multiple of 5 and 3", () => {
    fizzMessageExpected([15, 30, 45], "fizzbuzz");
  });
});

context("Saucelabs demo page", () => {
  before(() => {
    cy.log("Running only once before the test cases");
  });

  after(() => {
    cy.log("Running only once after the test cases");
  });

  beforeEach(() => {
    cy.log("Before each of the test cases");
  });

  afterEach(() => {
    cy.log("After each of the test cases");
  });

  it("Logging in with a standart user", () => {
    cy.login("standard_user", "secret_sauce");
    //NEVER DO THIS -->
    //cy.get(":nth-child(1) > .inventory_item_description > .inventory_item_label > .inventory_item_desc")
    cy.url("https://www.saucedemo.com/inventory.html");
    cy.get(".shopping_cart_link").should("be.visible");
  });

  it("Logging in with a locked out user", () => {
    cy.login("locked_out_user", "secret_sauce");
    cy.get("[data-test=error]")
      .should("be.visible")
      .and("have.text", "Epic sadface: Sorry, this user has been locked out.");
  });

  it("Logging in with an invalid user", () => {
    cy.login("asdfasdfasdf", "sadffasdfasdf");
    cy.get("[data-test=error]")
      .should("be.visible")
      .and(
        "have.text",
        "Epic sadface: Username and password do not match any user in this service"
      );
  });

  it("Closing the error message", () => {
    // Before Cypress command:
    // cy.visit("/");
    // cy.get("[data-test=username]").type("asdfasdfasdf");
    // cy.get("[data-test=password]").type("seasdfasdfuce");
    // cy.get("[data-test=login-button]").click();
    // After Cypress command:
    cy.login("asdfasdfasdf", "sadffasdfasdf");
    cy.get("[data-test=error]").should("be.visible");
    cy.get(".error-button").click();
    cy.get("[data-test=error]").should("not.exist");
  });
});
