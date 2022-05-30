Feature: Login

    Scenario: It should redirect to the privacy policy
        When I click on the privacy policy link
        Then I should be to the privacy policy

    Scenario: It should redirect to the deploy app doc
        When I click on the deploy app doc link
        Then I should be to the deploy app doc

    Scenario: It should redirect to the instant preview
        When I click on the instant preview link
        Then I should be to the instant preview

    Scenario: It should redirect to the reduce cloud doc
        When I click on the reduce cloud doc link
        Then I should be to the reduce cloud doc

    Scenario: It should redirect to the boost team experience
        When I click on the boost team experience link
        Then I should be to the boost team experience

    Scenario: It should display the onboarding
        Given I am logged with auth0
        Then I should see the onboarding

    Scenario: Responsive medium screen
        Given The screen size is medium
        Then Right section should be hidden
