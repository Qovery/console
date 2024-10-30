import clsx from 'clsx'
import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Azure from 'devicon/icons/azure/azure-original.svg'
import DigitalOcean from 'devicon/icons/digitalocean/digitalocean-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Kubernetes from 'devicon/icons/kubernetes/kubernetes-original.svg'
import { AnimatePresence, motion } from 'framer-motion'
import posthog from 'posthog-js'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type MutableRefObject, type ReactElement, cloneElement, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ClusterInstallationGuideModal } from '@qovery/domains/clusters/feature'
import { CLUSTERS_TEMPLATE_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, ExternalLink, Heading, Icon, Link, Section, Tooltip, useModal } from '@qovery/shared/ui'
import { useClickAway, useDocumentTitle } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'

const Qovery = '/assets/logos/logo-icon.svg'

const ExtendedCloudProviderEnum = {
  ...CloudProviderEnum,
  AZURE: 'AZURE' as const,
}

type CardOptionProps = {
  title: string
  description?: string
  recommended?: boolean
  icon?: string | ReactElement
  selectedCloudProvider: Exclude<keyof typeof ExtendedCloudProviderEnum, 'ON_PREMISE'>
} & (
  | {
      selectedInstallationType: 'managed'
    }
  | {
      selectedInstallationType: 'self-managed'
      openInstallationGuideModal: () => void
    }
)

function CardOption({ icon, title, description, selectedCloudProvider, recommended, ...props }: CardOptionProps) {
  const { organizationId = '' } = useParams()

  const renderIcon = () => {
    return typeof icon === 'string' ? (
      <img className="mt-1 select-none" width={32} height={32} src={icon} alt={title} />
    ) : (
      cloneElement(icon as ReactElement, { className: 'w-[32px] mt-1 select-none' })
    )
  }

  const renderContent = () => (
    <span>
      <span
        className={twMerge(
          clsx('mb-2 inline-flex items-center text-base font-semibold text-neutral-400', {
            'text-neutral-350': selectedCloudProvider === 'AZURE' && recommended,
          })
        )}
      >
        {title}
        {recommended && (
          <>
            {selectedCloudProvider === 'AZURE' ? (
              <Tooltip
                content={
                  <span>
                    Follow the release on our{' '}
                    <ExternalLink size="xs" href="https://roadmap.qovery.com/p/support-aks-as-a-managed-cluster">
                      product roadmap
                    </ExternalLink>
                  </span>
                }
              >
                <span className="absolute right-5 top-5 h-5 rounded-lg border border-neutral-200 px-1.5 text-[11px] leading-[17px] text-neutral-350">
                  coming soon
                </span>
              </Tooltip>
            ) : (
              <span className="absolute right-5 top-5 h-5 rounded-lg bg-brand-500 px-1.5 text-[11px] font-semibold leading-5 text-neutral-50">
                recommended
              </span>
            )}
          </>
        )}
      </span>
      <span className="inline-block text-sm text-neutral-350">{description}</span>
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
    .with({ selectedInstallationType: 'managed' }, ({ selectedInstallationType }) =>
      selectedCloudProvider === 'AZURE' ? (
        <div
          className={twMerge(
            baseClassNames,
            'cursor-default shadow-none hover:border-neutral-200 hover:outline-transparent'
          )}
        >
          {renderIcon()}
          {renderContent()}
        </div>
      ) : (
        <NavLink
          to={CLUSTERS_URL(organizationId) + CLUSTERS_TEMPLATE_CREATION_URL(selectedCloudProvider)}
          className={baseClassNames}
          onClick={() => handleAnalytics(selectedInstallationType)}
        >
          {renderIcon()}
          {renderContent()}
        </NavLink>
      )
    )
    .exhaustive()
}

type CardClusterProps = {
  title: string
  description?: string
  icon: string | ReactElement
  index?: number
} & (
  | {
      options: CardOptionProps[]
    }
  | {
      openInstallationGuideModal: () => void
      selectedInstallationType: 'demo' | 'self-managed'
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

function CardCluster({ title, description, icon, index = 1, ...props }: CardClusterProps) {
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
                    <CardOption key={optionProps.title} {...optionProps} />
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

    return (
      <button
        className="relative flex h-32 w-[calc(100%/2-20px)] cursor-pointer justify-between gap-4 rounded border border-neutral-200 p-5 shadow-sm outline outline-transparent transition hover:border-brand-500 hover:-outline-offset-2 hover:outline-brand-500 lg:w-[calc(100%/3-20px)]"
        onClick={() => {
          posthog.capture('select-cluster', {
            selectedCloudProvider,
            selectedInstallationType,
          })
          openInstallationGuideModal()
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            {typeof icon === 'string' ? (
              <img className="select-none" width={48} height={48} src={icon} alt={title} />
            ) : (
              cloneElement(icon as ReactElement, { className: 'w-[48px] h-[48px]' })
            )}
          </div>
          <p className="truncate text-base font-semibold text-neutral-400">{title}</p>
        </div>
        {selectedInstallationType === 'demo' ? (
          <span className="absolute right-5 top-5 flex h-5 min-w-min items-center justify-center truncate rounded-lg bg-brand-500 px-1.5 text-[11px] font-medium leading-6 text-neutral-50">
            3min to setup
          </span>
        ) : (
          <div className="absolute right-5 top-5 flex items-center gap-2.5 text-neutral-400">
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
          <div className="flex w-[calc(100%+20px)] flex-wrap gap-5">
            {cloudProviders.slice(1).map((props, index) => (
              <CardCluster key={props.title} index={index} {...props} />
            ))}
          </div>
        </Section>
      </div>
    </Section>
  )
}

export default PageNewFeature
