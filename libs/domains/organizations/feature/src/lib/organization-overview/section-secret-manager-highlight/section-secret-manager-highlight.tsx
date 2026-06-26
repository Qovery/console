import { motion } from 'framer-motion'
import { useState } from 'react'
import { Icon, Link } from '@qovery/shared/ui'

const SECRET_MANAGER_ORGANIZATION_ID = '51937012-8377-4e0f-84cf-7f5f38a0154b'
const SECRET_MANAGER_CLUSTER_ID = '8a14ee85-a66b-46f7-83e3-5cbeb4d5ed8b'
const SECRET_KEYS = [
  ['AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_REGION', 'AWS_ACCOUNT_ID'],
  ['AWS_SECURITY_TOKEN', 'AWS_DEFAULT_REGION', 'AWS_SERVICE_ENDPOINT', 'AWS_IAM_ROLE'],
  ['AWS_CREDENTIALS_FILE', 'AWS_PROFILE_NAME', 'AWS_ACCESS_POLICY', 'AWS_S3_BUCKET_NAME'],
  ['AWS_EC2_INSTANCE_ID', 'AWS_LAMBDA_FUNCTION_NAME', 'AWS_DYNAMODB_TABLE_NAME', 'AWS_SQS_QUEUE_URL'],
  ['AWS_SNS_TOPIC_ARN', 'AWS_ECR_REPOSITORY', 'AWS_CLOUDFRONT_DISTRIBUTION_ID', 'AWS_VPC_ID'],
]
const SECRET_KEY_SEGMENTS = [0, 1, 2, 3]

export function SectionSecretManagerHighlight() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <section className="flex justify-center">
      <div className="relative aspect-[8/7] w-full max-w-[320px] overflow-hidden rounded-lg border border-neutral bg-surface-neutral text-neutral">
        <img
          src="/assets/images/mesh-light.svg"
          alt="Mesh light"
          className="absolute inset-0 h-full w-full object-cover dark:hidden"
        />
        <img
          src="/assets/images/mesh-dark.svg"
          alt="Mesh dark"
          className="absolute inset-0 hidden h-full w-full object-cover dark:block"
        />
        <button
          type="button"
          aria-label="Dismiss secret manager integration card"
          className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center text-neutral-subtle transition-colors hover:text-neutral"
          onClick={() => setIsVisible(false)}
        >
          <Icon iconName="xmark" />
        </button>

        <div className="relative flex h-full flex-col items-center px-3 pb-3 pt-7">
          <div className="mb-3 flex flex-col items-center gap-7">
            <h2 className="text-center font-brand text-xl font-medium leading-6 text-neutral">
              Use your secret manager <br /> directly in Qovery
            </h2>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white border-opacity-10 bg-white bg-opacity-10">
                <Icon name="AWS" width={24} height={24} />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white border-opacity-10 bg-white bg-opacity-10 text-brand">
                <Icon name="QOVERY" width={24} height={24} />
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-surface-neutral via-surface-neutral to-transparent" />

          <Link
            as="button"
            to="/organization/$organizationId/cluster/$clusterId/settings/addons"
            params={{ organizationId: SECRET_MANAGER_ORGANIZATION_ID, clusterId: SECRET_MANAGER_CLUSTER_ID }}
            color="brand"
            variant="solid"
            size="lg"
            className="absolute bottom-3 z-10 w-[calc(100%-24px)] justify-center"
          >
            Install it on your cluster here
          </Link>

          <div className="relative flex w-[calc(100%+96px)] flex-col gap-1 overflow-hidden">
            {SECRET_KEYS.map((keys, index) => (
              <motion.div
                key={keys.join('-')}
                animate={{ x: index % 2 === 0 ? ['0%', '-25%'] : ['-25%', '0%'] }}
                className="flex w-max whitespace-nowrap text-[8px] font-medium leading-4 text-neutral"
                transition={{
                  duration: 18 + index * 2,
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
                        className="ml-1.5 flex h-5 items-center justify-center rounded border border-white border-opacity-10 bg-white bg-opacity-10 px-1"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SectionSecretManagerHighlight
