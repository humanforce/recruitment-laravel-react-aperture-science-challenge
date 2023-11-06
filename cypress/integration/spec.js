describe('Aperture Science Enhancement Center Cypress Tests', () => {
  it('finds the home page', function () {
    cy.visit('http://host.docker.nextjs:3000')
    cy.get('h1');
  })

  it('cant find the subjects page without logging in', function () {
    cy.visit('http://host.docker.nextjs:3000/subjects')
    cy.location('pathname').should('eq', '/')
  })

  it('can log in and see a list of subjects', function () {
    cy.visit('http://host.docker.nextjs:3000')
    cy.get('#email').type(Cypress.env('email'));
    cy.get('#password').type(Cypress.env('password'));

    cy.get('#submit').click()

    cy.location('pathname').should('eq', '/subjects')
    cy.get('h1').contains('Testing Subjects');

    cy.intercept('POST', 'http://host.docker.webserver/graphql').as('graphql')

    cy.get('h1').contains('Testing Subjects');
    cy.get('div[data-testid="skeleton"]');

    cy.wait('@graphql')
    cy.get('table[data-testid="subjects-table"]');
  });

  it('can request subjects', function() {
    const query = `
      query {
        subjects {
          id
          name
          test_chamber
          date_of_birth
          score
          alive
          created_at
        }
      }
    `
    cy.request({
      method: 'POST',
      url: 'http://host.docker.webserver/graphql',
      body: { query }
    }).then((res) => {
      cy.log(res.body)
      expect(res.body, 'response body').property('data').property('subjects').to.have.lengthOf(10)
    })
  });

  it('cant request users without authentication', function() {
    const query = `
      query {
        users {
          id
          name
        }
      }
    `
    cy.request({
      method: 'POST',
      url: 'http://host.docker.webserver/graphql',
      body: { query }
    }).then((res) => {
      cy.log(res.body)
      expect(res.body, 'response body').property('errors').to.exist
    })
  })

})