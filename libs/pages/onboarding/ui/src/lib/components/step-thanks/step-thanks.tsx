import { Button, ButtonSize, ButtonType, Icon } from '@console/shared/ui'
import { ONBOARDING_MORE_URL, ONBOARDING_URL } from '@console/shared/utils'

export function StepThanks() {
  return (
    <div>
      <h1 className="h3 text-text-700 mb-3">Almost there..</h1>
      <p className="text-sm mb-6 text-text-500">Thanks for signing up!</p>
      <p className="text-sm mb-6 text-text-500">
        To ensure that Qovery is the right product for you and that you get the best out of it, we have put in place an
        onboarding process requiring a validation by our teams.
      </p>
      <p className="text-sm mb-6 text-text-500">We will try to get back to you as soon as possible!</p>
      <p className="text-sm mb-6 text-text-500">
        <span role="img" aria-label="Warning">
          ⚠️
        </span>{' '}
        Because we receive hundreds of requests per day, we will prioritize access requests with a work email address.
        Please keep an eye on your inbox.
      </p>
      <p className="text-sm mb-6 text-text-500 italic">
        In the meantime, have a look at <strong>our guide</strong> and <strong>tutorial</strong> sections on our
        website, they will show you what you can achieve with Qovery and guide you step by step in your progress with
        our tool.
      </p>
      <div className="flex flex-col">
        <a
          href="https://hub.qovery.com/docs/using-qovery/configuration/organization/"
          target="_blank"
          rel="noreferrer"
          className="link text-accent2-500 text-sm mb-3"
        >
          How to configure an Organization <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>
        <a
          href="https://hub.qovery.com/docs/using-qovery/configuration/project/"
          target="_blank"
          rel="noreferrer"
          className="link text-accent2-500 text-sm mb-3"
        >
          How to configure a Project <Icon name="icon-solid-arrow-up-right-from-square" />
        </a>
      </div>
      <form>
        <div className="mt-10 pt-5 flex justify-between border-t border-element-light-lighter-400">
          <Button
            link={`${ONBOARDING_URL}${ONBOARDING_MORE_URL}`}
            size={ButtonSize.BIG}
            type={ButtonType.STROKED}
            iconLeft="icon-solid-arrow-left"
          >
            Back
          </Button>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="btn btn--big btn--basic">
            Go to Youtube{' '}
            <span role="img" aria-label="Warning">
              🐈
            </span>
          </a>
        </div>
      </form>
    </div>
  )
}

export default StepThanks
