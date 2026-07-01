import { useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { PlanEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useClusters } from '@qovery/domains/clusters/feature'
import { Button, Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useLocalStorage, useSupportChat } from '@qovery/shared/util-hooks'
import useOrganization from '../../hooks/use-organization/use-organization'

const SECRET_KEYS = [
  ['AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_REGION', 'AWS_ACCOUNT_ID'],
  ['AWS_SECURITY_TOKEN', 'AWS_DEFAULT_REGION', 'AWS_SERVICE_ENDPOINT', 'AWS_IAM_ROLE'],
  ['AWS_CREDENTIALS_FILE', 'AWS_PROFILE_NAME', 'AWS_ACCESS_POLICY', 'AWS_S3_BUCKET_NAME'],
  ['AWS_EC2_INSTANCE_ID', 'AWS_LAMBDA_FUNCTION_NAME', 'AWS_DYNAMODB_TABLE_NAME', 'AWS_SQS_QUEUE_URL'],
]
const SECRET_KEY_SEGMENTS = [0, 1, 2, 3]
const SECRET_MANAGER_HIGHLIGHT_VISIBLE_KEY = 'secret-manager-highlight-visible'
const SECRET_KEY_SCROLL_DURATION = 80

function canUseSecretManager(plan?: string): boolean {
  return (
    plan === PlanEnum.BUSINESS ||
    plan === PlanEnum.BUSINESS_2025 ||
    plan === PlanEnum.ENTERPRISE ||
    plan === PlanEnum.ENTERPRISE_YEARLY ||
    plan === PlanEnum.ENTERPRISE_2025
  )
}

export function SectionSecretManagerHighlight() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: clusters = [] } = useClusters({ organizationId })
  const { data: organization } = useOrganization({ organizationId })
  const { showPylonForm } = useSupportChat()
  const [isVisible, setIsVisible] = useLocalStorage(SECRET_MANAGER_HIGHLIGHT_VISIBLE_KEY, true)

  const getSecretManagerClusterId = useMemo(() => {
    return clusters.find((cluster) => cluster)?.id
  }, [clusters])
  const isSecretManagerAvailable = canUseSecretManager(organization?.plan)

  if (!isVisible || !getSecretManagerClusterId) {
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
        <button
          type="button"
          aria-label="Dismiss secret manager integration card"
          className="absolute right-1.5 top-1.5 z-dropdown flex h-5 w-5 items-center justify-center text-xs text-neutral-subtle transition-colors hover:text-neutral"
          onClick={() => setIsVisible(false)}
        >
          <Icon iconName="xmark" />
        </button>

        <div className="relative flex h-full flex-col items-center px-3 pb-3 pt-7">
          <div className="mb-3 flex flex-col items-center gap-7">
            <Heading level={2} className="text-center font-brand text-xl font-medium leading-6 text-neutral">
              Use your secret manager <br /> directly in Qovery
            </Heading>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white border-opacity-30 bg-white bg-opacity-30 dark:border-opacity-10 dark:bg-opacity-10">
                <Icon name="AWS" width={24} height={24} />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white border-opacity-30 bg-white bg-opacity-30 text-brand dark:border-opacity-10 dark:bg-opacity-10">
                <Icon name="GCP" width={22} height={22} />
              </span>
            </div>
          </div>

          {isSecretManagerAvailable ? (
            <Link
              as="button"
              to="/organization/$organizationId/cluster/$clusterId/settings/addons"
              params={{ organizationId, clusterId: getSecretManagerClusterId ?? '' }}
              color="brand"
              variant="solid"
              size="lg"
              className="absolute bottom-3 z-10 w-[calc(100%-24px)] justify-center"
            >
              Install it on your cluster here
            </Link>
          ) : (
            <Button
              type="button"
              color="brand"
              variant="solid"
              size="lg"
              className="absolute bottom-3 z-10 w-[calc(100%-24px)] justify-center"
              onClick={() => showPylonForm('request-upgrade-plan')}
            >
              Contact us
            </Button>
          )}

          <div className="relative mb-5 flex w-[calc(100%+96px)] flex-col gap-1 overflow-hidden [-webkit-mask-composite:source-in] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_24%,black_76%,transparent_100%),linear-gradient(to_bottom,black_0%,black_48%,transparent_100%)] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent_0%,black_24%,black_76%,transparent_100%),linear-gradient(to_bottom,black_0%,black_48%,transparent_100%)] [mask-repeat:no-repeat] [mask-size:100%_100%]">
            {SECRET_KEYS.map((keys, index) => (
              <motion.div
                key={keys.join('-')}
                animate={{ x: index % 2 === 0 ? ['0%', '-25%'] : ['-25%', '0%'] }}
                className="flex w-max whitespace-nowrap text-[8px] font-medium leading-4 text-neutral"
                transition={{
                  duration: SECRET_KEY_SCROLL_DURATION,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              >
                {SECRET_KEY_SEGMENTS.map((segment) => (
                  <div key={segment} className="flex">
                    {keys.map((key) => (
                      <span
                        key={`${segment}-${key}`}
                        className="ml-1.5 flex h-5 items-center justify-center rounded border border-white border-opacity-20 bg-white bg-opacity-30 px-1 dark:border-opacity-10 dark:bg-opacity-10"
                      >
                        <span className="relative top-[0.5px]">{key}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default SectionSecretManagerHighlight
