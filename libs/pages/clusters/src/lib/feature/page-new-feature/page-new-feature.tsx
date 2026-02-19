import clsx from 'clsx'
import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Azure from 'devicon/icons/azure/azure-original.svg'
import DigitalOcean from 'devicon/icons/digitalocean/digitalocean-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Kubernetes from 'devicon/icons/kubernetes/kubernetes-original.svg'
import { AnimatePresence, motion } from 'framer-motion'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type MutableRefObject, type ReactElement, cloneElement, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ClusterInstallationGuideModal } from '@qovery/domains/clusters/feature'
import { useClusterCreationRestriction } from '@qovery/domains/organizations/feature'
import { AddCreditCardModalFeature } from '@qovery/shared/console-shared'
import { CLUSTERS_TEMPLATE_CREATION_URL, CLUSTERS_URL, SETTINGS_BILLING_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Button, Callout, Heading, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useClickAway, useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'

const Qovery = '/assets/logos/logo-icon.svg'

const ExtendedCloudProviderEnum = {
  ...CloudProviderEnum,
}

type CardOptionProps = {
  title: string
  description?: string
  recommended?: boolean
  icon?: string | ReactElement
  selectedCloudProvider: Exclude<keyof typeof ExtendedCloudProviderEnum, 'ON_PREMISE'>
  disabled?: boolean
  onDisabledClick?: () => void
} & (
  | {
      selectedInstallationType: 'managed'
    }
  | {
      selectedInstallationType: 'self-managed'
      openInstallationGuideModal: () => void
    }
  | {
      selectedInstallationType: 'partially-managed'
    }
)

function CardOption({
  icon,
  title,
  description,
  selectedCloudProvider,
  recommended,
  disabled,
  onDisabledClick,
  ...props
}: CardOptionProps) {
  const { organizationId = '' } = useParams()
  const { showPylonForm } = useSupportChat()

  const isEksAnywhereEnabled = useFeatureFlagEnabled('eks-anywhere')

  const renderIcon = (className?: string) => {
    return typeof icon === 'string' ? (
      <img className={twMerge('mt-1 select-none', className)} width={32} height={32} src={icon} alt={title} />
    ) : (
      cloneElement(icon as ReactElement, { className: twMerge('mt-1 w-[32px] select-none', className) })
    )
  }

  const renderContent = () => (
    <span>
      <span
        className={twMerge('flex flex-col text-base font-semibold text-neutral-400', disabled && 'text-neutral-300')}
      >
        {title}
        {recommended && !disabled && (
          <span>
            {match({ selectedCloudProvider })
              .with({ selectedCloudProvider: 'AZURE' }, () => (
                <div className="absolute right-5 top-5 flex h-5 gap-2">
                  <span className="rounded-lg bg-brand-500 px-1.5 text-[11px] font-semibold leading-5 text-neutral-50">
                    recommended
                  </span>
                </div>
              ))
              .otherwise(() => (
                <span className="absolute right-5 top-5 h-5 rounded-lg bg-brand-500 px-1.5 text-[11px] font-semibold leading-5 text-neutral-50">
                  recommended
                </span>
              ))}
          </span>
        )}
      </span>
      <span className={twMerge('inline-block text-sm text-neutral-350', disabled && 'text-neutral-300')}>
        {description}
      </span>
    </span>
  )

  const handleAnalytics = (selectedInstallationType: string) => {
    posthog.capture('select-cluster', {
      selectedCloudProvider,
      selectedInstallationType,
    })
  }

  const baseClassNames =
    'flex text-left items-start gap-4 relative rounded shadow border border-neutral-200 outline outline-2 outline-transparent transition-all hover:border-brand-500 -outline-offset-2 hover:outline-brand-500 bg-white p-5 transition w-[397px] xl:w-[calc(100%/3-20px)]'

  const disabledClassNames =
    'cursor-not-allowed opacity-60 shadow-none hover:border-neutral-200 hover:outline-transparent'

  if (disabled) {
    return (
      <button
        className={twMerge(baseClassNames, disabledClassNames, 'cursor-pointer')}
        onClick={onDisabledClick}
        type="button"
      >
        {renderIcon('opacity-70')}
        {renderContent()}
      </button>
    )
  }

  return match(props)
    .with({ selectedInstallationType: 'self-managed' }, ({ selectedInstallationType, openInstallationGuideModal }) => (
      <button
        className={baseClassNames}
        onClick={(e) => {
          e.preventDefault()
          handleAnalytics(selectedInstallationType)
          openInstallationGuideModal()
        }}
      >
        {renderIcon()}
        {renderContent()}
        <span className="absolute right-5 top-5">
          <Icon iconName="arrow-up-right" className="text-neutral-400" />
        </span>
      </button>
    ))
    .with({ selectedInstallationType: 'managed' }, ({ selectedInstallationType }) => (
      <NavLink
        to={CLUSTERS_URL(organizationId) + CLUSTERS_TEMPLATE_CREATION_URL(selectedCloudProvider)}
        className={baseClassNames}
        onClick={() => handleAnalytics(selectedInstallationType)}
      >
        {renderIcon()}
        {renderContent()}
      </NavLink>
    ))
    .with({ selectedInstallationType: 'partially-managed' }, ({ selectedInstallationType }) => {
      return match({ isEksAnywhereEnabled })
        .with({ isEksAnywhereEnabled: true }, () => (
          <NavLink
            to={CLUSTERS_URL(organizationId) + CLUSTERS_TEMPLATE_CREATION_URL(selectedCloudProvider + '-eks-anywhere')}
            className={baseClassNames}
            onClick={() => handleAnalytics(selectedInstallationType)}
          >
            {renderIcon()}
            {renderContent()}
          </NavLink>
        ))
        .otherwise(() => (
          <div
            className={twMerge(
              baseClassNames,
              'cursor-default shadow-none hover:border-neutral-200 hover:outline-transparent'
            )}
          >
            {renderIcon('opacity-70')}
            <div className="grid w-full grid-cols-[1fr_auto] gap-2">
              <div>
                <span className="flex flex-col text-base font-semibold text-neutral-350">{title}</span>
                <span className="inline-block text-sm text-neutral-300">
                  EKS Anywhere is not available for your organization yet. Please contact us to enable it.
                </span>
              </div>
              <Button
                className="self-start"
                variant="outline"
                color="neutral"
                onClick={() => showPylonForm('request-access-eks-anywhere')}
              >
                Contact us
              </Button>
            </div>
          </div>
        ))
    })

    .exhaustive()
}

type CardClusterProps = {
  title: string
  description?: string
  icon: string | ReactElement
  index?: number
  disabled?: boolean
  onDisabledClick?: () => void
} & (
  | {
      options: CardOptionProps[]
    }
  | {
      openInstallationGuideModal: () => void
      selectedInstallationType: 'demo' | 'self-managed' | 'partially-managed'
      selectedCloudProvider:
        | 'DIGITAL_OCEAN'
        | 'AZURE'
        | 'OVH_CLOUD'
        | 'ORACLE_CLOUD'
        | 'IBM_CLOUD'
        | 'CIVO'
        | 'HETZNER'
        | 'OTHER'
    }
)

function CardCluster({ title, description, icon, index = 1, disabled, onDisabledClick, ...props }: CardClusterProps) {
  const [expanded, setExpanded] = useState(false)

  const ref = useClickAway(() => {
    setExpanded(false)
  }) as MutableRefObject<HTMLDivElement>

  if ('options' in props) {
    const { options } = props

    const getExpanderPosition = (className: string, index: number) => {
      const position = (index + 1) % 3

      return clsx(className, {
        '-ml-[calc(100%+20px)] w-[calc(200%+20px)] lg:w-[calc(300%+40px)]': position === 2, // 3n+2
        'w-[calc(200%+20px)] lg:-ml-[calc(200%+40px)] lg:w-[calc(300%+40px)]': position === 0, // 3n+3
        'w-[calc(200%+20px)] lg:w-[calc(300%+40px)]': position === 1, // 3n+1
        '-ml-[calc(100%+20px)] lg:-ml-0': index === 3,
      })
    }

    return (
      <div ref={ref} className="h-fit w-[calc(100%/2-20px)] lg:w-[calc(100%/3-20px)]">
        <div
          onClick={() => setExpanded(!expanded)}
          className={twMerge(
            clsx(
              'flex h-32 cursor-pointer justify-start gap-4 rounded border border-neutral-200 p-5 shadow-sm outline outline-2 outline-transparent transition hover:border-brand-500 hover:-outline-offset-2 hover:outline-brand-500',
              {
                'border-brand-500 -outline-offset-2 outline-brand-500': expanded,
              }
            )
          )}
        >
          <div className="flex flex-col gap-4">
            <div>
              {typeof icon === 'string' ? (
                <img className="select-none" width={48} height={48} src={icon} alt={title} />
              ) : (
                cloneElement(icon as ReactElement, { className: 'w-[48px] h-[48px]' })
              )}
            </div>
            <p className="text-base font-semibold text-neutral-400">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2.5 text-neutral-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-200 text-xs font-medium">
              {options.length}
            </span>
            <Icon iconName={expanded ? 'angle-up' : 'angle-up'} className={expanded ? 'rotate-180' : 'rotate-0'} />
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.25, pointerEvents: 'none' }}
              transition={{ duration: 0.15 }}
              className={getExpanderPosition('relative mt-5 overflow-hidden', index)}
            >
              <div className="flex flex-col gap-6 rounded border border-neutral-200 bg-neutral-100 p-5">
                <div className="flex gap-6 font-bold">
                  <div>
                    {typeof icon === 'string' ? (
                      <img className="select-none" width={32} height={32} src={icon} alt={title} />
                    ) : (
                      cloneElement(icon as ReactElement, { className: 'w-[32px] h-[32px]' })
                    )}
                  </div>
                  <span className="text-lg text-neutral-400">{title}</span>
                </div>
                <div className="flex gap-5">
                  {options.map((optionProps) => (
                    <CardOption
                      key={optionProps.title}
                      {...optionProps}
                      disabled={disabled}
                      onDisabledClick={onDisabledClick}
                    />
                  ))}
                </div>
                <Button
                  className="absolute right-4 top-4 h-9 w-9 items-center justify-center"
                  variant="outline"
                  color="neutral"
                  onClick={() => setExpanded(false)}
                >
                  <Icon iconName="xmark" iconStyle="regular" className="text-base text-neutral-400" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  } else {
    const { selectedCloudProvider, selectedInstallationType, openInstallationGuideModal } = props

    const isDisabled = disabled && selectedInstallationType !== 'demo'

    const disabledButtonClassNames =
      'cursor-not-allowed opacity-60 shadow-none hover:border-neutral-200 hover:outline-transparent'

    return (
      <button
        className={twMerge(
          'relative flex h-32 w-[calc(100%/2-20px)] cursor-pointer justify-between gap-4 rounded border border-neutral-200 p-5 shadow-sm outline outline-transparent transition hover:border-brand-500 hover:-outline-offset-2 hover:outline-brand-500 lg:w-[calc(100%/3-20px)]',
          isDisabled && disabledButtonClassNames
        )}
        onClick={() => {
          if (isDisabled) {
            onDisabledClick?.()
            return
          }
          posthog.capture('select-cluster', {
            selectedCloudProvider,
            selectedInstallationType,
          })
          openInstallationGuideModal()
        }}
        type="button"
      >
        <div className="flex flex-col gap-4">
          <div>
            {typeof icon === 'string' ? (
              <img
                className={twMerge('select-none', isDisabled && 'opacity-70')}
                width={48}
                height={48}
                src={icon}
                alt={title}
              />
            ) : (
              cloneElement(icon as ReactElement, {
                className: twMerge('h-[48px] w-[48px]', isDisabled && 'opacity-70'),
              })
            )}
          </div>
          <p className={twMerge('truncate text-base font-semibold text-neutral-400', isDisabled && 'text-neutral-300')}>
            {title}
          </p>
        </div>
        {selectedInstallationType === 'demo' ? (
          <span className="absolute right-5 top-5 flex h-5 min-w-min items-center justify-center truncate rounded-lg bg-brand-500 px-1.5 text-[11px] font-medium leading-6 text-neutral-50">
            3min to setup
          </span>
        ) : (
          <div
            className={twMerge(
              'absolute right-5 top-5 flex items-center gap-2.5 text-neutral-400',
              isDisabled && 'text-neutral-300'
            )}
          >
            <span className="flex h-5 items-center justify-center truncate rounded-lg border border-neutral-200 px-1.5 text-[11px] font-semibold leading-6">
              Self-managed
            </span>
            <Icon iconName="arrow-up-right" iconStyle="regular" className="text-base" />
          </div>
        )}
      </button>
    )
  }
}

export function PageNewFeature() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('Create new cluster - Qovery')
  const { openModal, closeModal } = useModal()
  const { isClusterCreationRestricted, billingDeploymentRestriction } = useClusterCreationRestriction({
    organizationId,
  })

  const isNoCreditCardRestriction = billingDeploymentRestriction === 'NO_CREDIT_CARD'

  const openInstallationGuideModal = ({ isDemo = false }: { isDemo?: boolean } = {}) =>
    openModal({
      options: {
        width: 500,
      },
      content: (
        <ClusterInstallationGuideModal
          mode="CREATE"
          isDemo={isDemo}
          type="ON_PREMISE"
          onClose={() => {
            closeModal()
          }}
        />
      ),
    })

  const openCreditCardModal = () =>
    openModal({
      content: <AddCreditCardModalFeature organizationId={organizationId} />,
    })

  const cloudProviders: CardClusterProps[] = [
    {
      title: 'Local machine (demo)',
      icon: Kubernetes,
      selectedCloudProvider: 'OTHER',
      selectedInstallationType: 'demo',
      openInstallationGuideModal: () => openInstallationGuideModal({ isDemo: true }),
    },
    {
      title: 'Amazon Web Services',
      options: [
        {
          title: 'Qovery Managed',
          description:
            'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
          icon: Qovery,
          recommended: true,
          selectedCloudProvider: 'AWS',
          selectedInstallationType: 'managed',
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: AWS,
          selectedCloudProvider: 'AWS',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
        },
        {
          title: 'EKS Anywhere',
          description:
            'AWS EKS Anywhere is a fully managed Kubernetes service that allows you to deploy and manage Kubernetes clusters on your own infrastructure.',
          icon: AWS,
          selectedCloudProvider: 'AWS',
          selectedInstallationType: 'partially-managed',
        },
      ],
      icon: AWS,
    },
    {
      title: 'Google Cloud Platform',
      options: [
        {
          title: 'Qovery Managed',
          description:
            'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
          icon: Qovery,
          recommended: true,
          selectedCloudProvider: 'GCP',
          selectedInstallationType: 'managed',
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="GCP" />,
          selectedCloudProvider: 'GCP',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
        },
      ],
      icon: GCP,
    },
    {
      title: 'Scaleway',
      options: [
        {
          title: 'Qovery Managed',
          description:
            'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
          icon: Qovery,
          recommended: true,
          selectedCloudProvider: 'SCW',
          selectedInstallationType: 'managed',
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="SCW" />,
          selectedCloudProvider: 'SCW',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
        },
      ],
      icon: <Icon name="SCW" />,
    },
    {
      title: 'Microsoft Azure',
      options: [
        {
          title: 'Qovery Managed',
          description:
            'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
          icon: Qovery,
          recommended: true,
          selectedCloudProvider: 'AZURE',
          selectedInstallationType: 'managed',
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="AZURE" />,
          selectedCloudProvider: 'AZURE',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
        },
      ],
      icon: Azure,
    },
    {
      title: 'OVH Cloud',
      selectedCloudProvider: 'OVH_CLOUD',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="OVH_CLOUD" />,
      openInstallationGuideModal,
    },
    {
      title: 'Digital Ocean',
      selectedCloudProvider: 'DIGITAL_OCEAN',
      selectedInstallationType: 'self-managed',
      icon: DigitalOcean,
      openInstallationGuideModal,
    },
    {
      title: 'Oracle Cloud Infrastructure',
      selectedCloudProvider: 'ORACLE_CLOUD',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="ORACLE_CLOUD" />,
      openInstallationGuideModal,
    },
    {
      title: 'Hetzner',
      selectedCloudProvider: 'HETZNER',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="HETZNER" />,
      openInstallationGuideModal,
    },
    {
      title: 'IBM Cloud',
      selectedCloudProvider: 'IBM_CLOUD',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="IBM_CLOUD" />,
      openInstallationGuideModal,
    },
    {
      title: 'Civo',
      selectedCloudProvider: 'CIVO',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="CIVO" />,
      openInstallationGuideModal,
    },
    {
      title: 'Other',
      selectedCloudProvider: 'OTHER',
      selectedInstallationType: 'self-managed',
      icon: Kubernetes,
      openInstallationGuideModal,
    },
  ]

  return (
    <Section className="flex w-full flex-1 flex-col gap-8 rounded-t bg-white p-8 pb-48">
      <Link color="brand" to={CLUSTERS_URL(organizationId)} className="text-sm">
        <Icon iconName="arrow-left" className="mr-1" />
        Back to clusters
      </Link>
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col">
          <Heading className="mb-2 text-2xl">Install cluster</Heading>
        </div>
        <Section>
          <div className="mb-5 flex flex-col gap-0.5">
            <Heading>Qovery on your local machine</Heading>
            <p className="text-sm text-neutral-350">Quickly test and validate the Qovery solution on your computer.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <CardCluster {...cloudProviders[0]} />
          </div>
        </Section>
        <Section>
          <div className="mb-5 flex flex-col gap-1">
            <Heading>Or choose your hosting mode</Heading>
            <p className="text-sm text-neutral-350">Manage your infrastructure across different hosting mode.</p>
          </div>
          {isClusterCreationRestricted &&
            (isNoCreditCardRestriction ? (
              <Callout.Root color="sky" className="mb-5">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Add a credit card to create a cluster</Callout.TextHeading>
                  <Callout.TextDescription>
                    You need to add a credit card to your account before creating a cluster on a cloud provider. You
                    won't be charged until your trial ends.
                    <br />
                    <Link
                      as="button"
                      color="neutral"
                      variant="outline"
                      className="mt-2"
                      to={SETTINGS_URL(organizationId) + SETTINGS_BILLING_URL}
                    >
                      Add credit card
                      <Icon iconName="arrow-right" className="ml-1" iconStyle="regular" />
                    </Link>
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            ) : (
              <Callout.Root color="red" className="mb-5">
                <Callout.Icon>
                  <Icon iconName="circle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Cluster creation is restricted</Callout.TextHeading>
                  <Callout.TextDescription>
                    Your organization has a billing restriction that prevents cluster creation. Please contact support
                    to resolve this issue.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            ))}
          <div className="flex w-[calc(100%+20px)] flex-wrap gap-5">
            {cloudProviders.slice(1).map((props, index) => (
              <CardCluster
                key={props.title}
                index={index}
                disabled={isClusterCreationRestricted}
                onDisabledClick={isNoCreditCardRestriction ? openCreditCardModal : undefined}
                {...props}
              />
            ))}
          </div>
        </Section>
      </div>
    </Section>
  )
}

export default PageNewFeature
