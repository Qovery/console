import { useParams } from '@tanstack/react-router'
import { Button, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const OPEN_POLICY_HIGHLIGHT_VISIBLE_KEY = 'open-policy-highlight-visible'

export function SectionOpenPolicyHighlight() {
  const { organizationId = '' } = useParams({ strict: false })
  const [isVisible, setIsVisible] = useLocalStorage(OPEN_POLICY_HIGHLIGHT_VISIBLE_KEY, true)

  if (!isVisible) {
    return null
  }

  return (
    <Section className="flex justify-center">
      <div className="relative w-full overflow-hidden rounded-lg border border-neutral bg-surface-neutral text-neutral">
        <img
          src="/assets/images/mesh-light.svg"
          alt="Mesh light"
          className="pointer-events-none absolute -left-[692px] -top-[338px] h-[956px] w-[1705px] max-w-none opacity-90 dark:hidden"
        />
        <img
          src="/assets/images/mesh-dark.svg"
          alt="Mesh dark"
          className="pointer-events-none absolute -left-[692px] -top-[338px] hidden h-[956px] w-[1705px] max-w-none dark:block"
        />
        <Button
          variant="plain"
          color="neutral"
          size="xs"
          iconOnly
          aria-label="Dismiss open policy integration card"
          className="absolute right-2 top-2 z-[1]"
          onClick={() => setIsVisible(false)}
        >
          <Icon iconName="xmark" />
        </Button>

        <div className="relative flex h-full flex-col items-center px-3 pb-3 pt-7">
          <div className="mb-7 flex flex-col items-center gap-7">
            <Heading level={2} className="text-center font-brand text-xl font-medium leading-6 text-neutral">
              Control what your AI agents can do <br /> with Open Policy
            </Heading>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white border-opacity-30 bg-white bg-opacity-30 text-brand dark:border-opacity-10 dark:bg-opacity-10">
                <Icon iconName="robot" iconStyle="solid" width={20} height={20} />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white border-opacity-30 bg-white bg-opacity-30 text-brand dark:border-opacity-10 dark:bg-opacity-10">
                <Icon iconName="shield-halved" iconStyle="solid" width={20} height={20} />
              </span>
            </div>
          </div>

          <Link
            as="button"
            to="/organization/$organizationId/settings/policy-api-token"
            params={{ organizationId }}
            color="brand"
            variant="solid"
            size="lg"
            className="w-full justify-center"
          >
            Create policy token
          </Link>
        </div>
      </div>
    </Section>
  )
}

export default SectionOpenPolicyHighlight
