context("Cypress test cases for day 2", () => {
    it("Adding items to cart", () => {
        cy.login("standart");
        cy.get("[data-test*=add-to-cart]").first().click();
        cy.get("[data-test*=remove]").first().should("have.text", "Remove");
        cy.get(".shopping_cart_badge").should("have.text", "1");
        cy.get(".inventory_item_name")
            .first()
            .invoke("text")
            .then((text) => {
                cy.get(".shopping_cart_link").click();
                cy.get(".inventory_item_name").should("have.text", text);
            });

        cy.get("[data-test=continue-shopping]").click();
        cy.get("[data-test*=remove]").first().click();
        cy.get(".shopping_cart_badge").should("not.exist");
    });

    it("Checking cookies added after login and removed after logout", () => {
        cy.login("standart");
        cy.getCookie("session-username").then((cookie) => {
            expect(cookie.value).to.be.eq("standard_user");
        });
        cy.get(".bm-burger-button").click();
        cy.get("#logout_sidebar_link").click();
        cy.getCookie("session-username").should("not.exist");
    });

    it("Checking if user is logged out if cookies expire", () => {
        cy.login("standart");
        cy.getCookie("session-username").then((cookie) => {
            expect(cookie.value).to.be.eq("standard_user");
        });
        cy.clearCookies();
        cy.reload();
        cy.get("[data-test=error]").should(
            "have.text",
            "Epic sadface: You can only access '/inventory.html' when you are logged in."
        );
    });
});

it("Reading login data fixtures", () => {
    cy.login("standart");
});

it("Checkout with data from fixtures", () => {
    cy.login("standart");
    cy.get("[data-test*=add-to-cart]").first().click();
    cy.get("[data-test*=remove]").first().should("have.text", "Remove");
    cy.get(".shopping_cart_badge").should("have.text", "1");
    cy.get(".shopping_cart_link").click();
    cy.get("[data-test=checkout]").click();
    cy.fixture("cypressUsers.json").then((fixture) => {
        cy.get("[data-test=firstName]").type(fixture["standart"].firstName);
        cy.get("[data-test=lastName]").type(fixture["standart"].lastName);
        cy.get("[data-test=postalCode]").type(fixture["standart"].zipCode);
    });
    cy.get("[data-test=continue]").click();
    cy.get("[data-test=finish]").click();
    cy.get(".complete-header").should("have.text", "THANK YOU FOR YOUR ORDER");
});

it("Mocking requests to produce error state of the application", () => {
    cy.visit(
        "https://app.superfluid.finance/streams/goerli/0x04c054715203c4c74d0a222c647106728971bbc357de456305fb4ee60a60c72d/26"
    );
    cy.intercept("POST", "superfluid-goerli", {
        statusCode: 400,
        body: {
            message: "Error loading the stream details",
        },
    });
    cy.contains("We are unable to fetch the stream details right now.").should(
        "be.visible"
    );
});

it("Dynamicly mocking Coingecko responses in Superfluid", () => {
    cy.fixture("currencies").then((fixture) => {
        cy.intercept("GET", "**markets**", (request) => {
            request.continue((response) => {
                response.body[0]["current_price"] =
                    fixture.tokenValues[request.query["ids"]] *
                    fixture.fiatValues[request.query["vs_currency"]].multiplier;
            });
        }).as("coingeckoRequest");
        cy.visit(
            "https://app.superfluid.finance/streams/goerli/0x04c054715203c4c74d0a222c647106728971bbc357de456305fb4ee60a60c72d/26"
        );
        let currencies = ["USD", "GBP", "EUR", "CNY"];
        currencies.forEach((currency) => {
            cy.get("[data-cy=fiat_currency]").click();
            cy.get("[data-cy=item-" + currency + "-multi")
                .filter(":visible")
                .click();
            cy.wait("@coingeckoRequest");
            let flowRate = 9645061728395;
            let secondsPerMonth = 2592000;
            let result = (
                ((flowRate * secondsPerMonth) / 1e18) *
                fixture.fiatValues[currency].multiplier
            ).toFixed(2);
            cy.get("[data-cy=per_month]", { timeout: 5000 }).should(
                "have.text",
                result + " " + currency
            );
        });
    });
});