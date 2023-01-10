import { ONBOARDING_MORE_URL, ONBOARDING_PROJECT_URL, ONBOARDING_URL } from '@qovery/shared/routes'
import { Button, ButtonSize, ButtonStyle, Icon } from '@qovery/shared/ui'

interface StepThanksProps {
  firstName: string
  email: string
  dxAuth: boolean
}

export function StepThanks(props: StepThanksProps) {
  const { firstName, email, dxAuth } = props

  return (
    <div className="pb-10">
      <h1 className="h3 text-text-700 mb-3">Almost there..</h1>
      <p className="text-sm mb-5 text-text-500">Hey {firstName}, thanks for signing up!</p>
      <p className="text-sm mb-5 text-text-500">
        To ensure that Qovery is the right product for you and that you get the best out of it, we have put in place an
        onboarding process requiring a validation by our teams.
      </p>
      <p className="text-sm mb-5 text-text-500">
        We will get back to you as soon as possible on the following email address:
      </p>
      <div className="text-sm text-center border border-element-light-lighter-500 bg-element-light-lighter-200 text-text-500 px-4 py-2.5 rounded mb-5">
        {email}
      </div>
      <p className="text-sm mb-5 text-text-500">
        <span role="img" aria-label="Warning">
          ⚠️
        </span>{' '}
        Because we receive hundreds of requests per day, we will prioritize access requests with a work email address.
        Please keep an eye on your inbox.
      </p>
      <p className="text-sm mb-5 text-text-500">
        In the meantime, have a look at{' '}
        <a
          href="https://hub.qovery.com/guides/"
          target="_blank"
          rel="noreferrer"
          className="link text-accent2-500 text-sm"
        >
          our guide <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>{' '}
        and{' '}
        <a
          href="https://hub.qovery.com/guides/tutorial/"
          target="_blank"
          rel="noreferrer"
          className="link text-accent2-500 text-sm"
        >
          tutorial <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>{' '}
        sections on our website, they will show you what you can achieve with Qovery and guide you step by step in your
        progress with our tool.
      </p>
      <form>
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          {dxAuth ? (
            <Button
              link={`${ONBOARDING_URL}${ONBOARDING_PROJECT_URL}`}
              size={ButtonSize.XLARGE}
              style={ButtonStyle.BASIC}
            >
              Continue
            </Button>
          ) : (
            <Button
              external
              link="https://www.youtube.com/watch?v=eX2qFMC8cFo"
              size={ButtonSize.XLARGE}
              style={ButtonStyle.BASIC}
            >
              Go to Youtube{' '}
              <span role="img" aria-label="cat">
                🐈
              </span>
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default StepThanks
