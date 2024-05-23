import { ONBOARDING_MORE_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { ExternalLink, Icon, Link } from '@qovery/shared/ui'

interface StepThanksProps {
  firstName: string
  email: string
  dxAuth: boolean
}

export function StepThanks(props: StepThanksProps) {
  const { firstName, email, dxAuth } = props

  return (
    <div className="pb-10">
      <h1 className="h3 mb-3 text-neutral-400">Almost there..</h1>
      <p className="mb-5 text-sm text-neutral-400">Hey {firstName}, thanks for signing up!</p>
      <p className="mb-5 text-sm text-neutral-400">
        To ensure that Qovery is the right product for you and that you get the best out of it, we have put in place an
        onboarding process requiring a validation by our teams.
      </p>
      <p className="mb-5 text-sm text-neutral-400">
        We will get back to you as soon as possible on the following email address:
      </p>
      <div className="mb-5 rounded border border-neutral-250 bg-neutral-100 px-4 py-2.5 text-center text-sm text-neutral-400">
        {email}
      </div>
      <p className="mb-5 text-sm text-neutral-400">
        <span role="img" aria-label="Warning">
          ⚠️
        </span>{' '}
        Because we receive hundreds of requests per day, we will prioritize access requests with a work email address.
        Please keep an eye on your inbox.
      </p>
      <p className="mb-5 text-sm text-neutral-400">
        In the meantime, have a look at{' '}
        <ExternalLink size="sm" href="https://hub.qovery.com/guides/" withIcon>
          our guide
        </ExternalLink>{' '}
        and{' '}
        <ExternalLink size="sm" href="https://hub.qovery.com/guides/tutorial/" withIcon>
          tutorial
        </ExternalLink>{' '}
        sections on our website, they will show you what you can achieve with Qovery and guide you step by step in your
        progress with our tool.
      </p>
      <form>
        <div className="mt-10 flex justify-between border-t border-neutral-200 pt-5">
          <Link
            as="button"
            color="neutral"
            variant="surface"
            size="lg"
            className="gap-2"
            to={ONBOARDING_URL + ONBOARDING_MORE_URL}
          >
            <Icon name="icon-solid-arrow-left" />
            Back
          </Link>
          {dxAuth ? (
            <Link as="button" size="lg" to={ONBOARDING_URL + ONBOARDING_PROJECT_URL}>
              Continue
            </Link>
          ) : (
            <ExternalLink
              as="button"
              size="lg"
              className="gap-2"
              href="https://www.loom.com/share/338f4e1600de48eda3fd8b4a32c4765b"
            >
              What's next?
              <span role="img" aria-label="star">
                ✨
              </span>
            </ExternalLink>
          )}
        </div>
      </form>
    </div>
  )
}

export default StepThanks
