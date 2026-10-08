// Single source for every string of the authentication page (login + sign-up).
// English only for now: the console has no i18n library, keep the keys stable so they can be wired to one later.
export const AUTH_PAGE_COPY = {
  shared: {
    backToWebsite: 'Back to website',
    logoAlt: 'Qovery logo black',
    legalPrefix: "By logging in or signing up, you agree to Qovery's",
    termsOfService: 'Terms of Service',
    legalAnd: 'and',
    privacyPolicy: 'Privacy Policy',
  },
  login: {
    title: 'Connect to your workspace',
    continueWithGoogle: 'Continue with Google',
    continueWithGithub: 'Continue with Github',
    continueWithSamlSso: 'Continue with SAML SSO',
    or: 'OR',
    lastUsed: 'Last used',
  },
  sso: {
    title: 'Enterprise single sign-on',
    description: 'Enter your company domain to connect with SSO',
    domainLabel: 'Company domain',
    domainPlaceholder: 'Enter your domain (e.g., company.com)',
    domainRequired: 'Please enter a domain.',
    domainInvalid: 'Invalid domain format',
    connect: 'Connect',
    changeLoginMethod: 'Change login method',
  },
  signUp: {
    title: 'Create your free Qovery account',
    reassurances: [
      '14 days free · no credit card',
      'Connect your AWS, GCP or Azure account in ~20\u00a0min',
      'Your first app live in ~30\u00a0min',
    ],
    signUpWithGoogle: 'Sign up with Google',
    signUpWithGithub: 'Sign up with GitHub',
    signUpWithBitbucket: 'Sign up with Bitbucket',
    signUpWithGitlab: 'Sign up with GitLab',
    signUpWithMicrosoft: 'Sign up with Microsoft',
    demoPrompt: 'Not ready yet?',
    demoLink: 'Book a 20-min demo',
    logInPrompt: 'Already have an account?',
    logInLink: 'Log in',
    trustedBy: 'Trusted by 200+ engineering teams',
  },
} as const
