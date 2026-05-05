import { Link, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import Azure from 'devicon/icons/azure/azure-original.svg'
import DigitalOcean from 'devicon/icons/digitalocean/digitalocean-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Kubernetes from 'devicon/icons/kubernetes/kubernetes-original.svg'
import { AnimatePresence, motion } from 'framer-motion'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type MutableRefObject, type ReactElement, cloneElement, useState } from 'react'
import { match } from 'ts-pattern'
import { Button, Link as ButtonLink, Callout, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import { useClickAway, useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { AddCreditCardModalFeature } from '../../add-credit-card-modal-feature/add-credit-card-modal-feature'
import { ClusterInstallationGuideModal } from '../../cluster-installation-guide-modal/cluster-installation-guide-modal'
import { useClusterCreationRestriction } from '../../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction'

const Qovery = '/assets/logos/logo-icon.svg'

const ExtendedCloudProviderEnum = {
  ...CloudProviderEnum,
}

type RestrictedActionProps = {
  disabled?: boolean
  onDisabledClick?: () => void
}

type CardOptionProps = RestrictedActionProps & {
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
    | {
        selectedInstallationType: 'partially-managed'
      }
  )

function CardOption({ icon, title, description, selectedCloudProvider, recommended, ...props }: CardOptionProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { showPylonForm } = useSupportChat()
  const { disabled = false, onDisabledClick } = props

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
        className={twMerge('flex flex-col text-base font-semibold', disabled ? 'text-neutral-subtle' : 'text-neutral')}
      >
        {title}
        {!disabled && recommended && (
          <span>
            {match({ selectedCloudProvider })
              .with({ selectedCloudProvider: 'AZURE' }, () => (
                <div className="absolute right-5 top-5 flex h-5 gap-2">
                  <span className="rounded-full bg-surface-brand-solid px-1.5 text-[11px] font-semibold leading-5 text-neutralInvert">
                    recommended
                  </span>
                </div>
              ))
              .otherwise(() => (
                <span className="absolute right-5 top-5 h-5 rounded-full bg-surface-brand-solid px-1.5 text-[11px] font-semibold leading-5 text-neutralInvert">
                  recommended
                </span>
              ))}
          </span>
        )}
      </span>
      <span className={twMerge('inline-block text-sm', disabled ? 'text-neutral-disabled' : 'text-neutral-subtle')}>
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
    'flex text-left items-start gap-4 relative rounded border border-neutral transition-all hover:border-brand-strong bg-surface-neutral p-4 transition w-[397px]'
  const disabledClassNames = disabled
    ? twMerge(
        'border-neutral bg-surface-neutral-component shadow-none hover:border-neutral hover:bg-surface-neutral-component',
        onDisabledClick ? 'cursor-pointer' : 'cursor-default'
      )
    : undefined

  return match(props)
    .with({ selectedInstallationType: 'self-managed' }, ({ selectedInstallationType, openInstallationGuideModal }) => (
      <button
        type="button"
        aria-disabled={disabled}
        className={twMerge(baseClassNames, disabledClassNames)}
        onClick={(e) => {
          e.preventDefault()
          if (disabled) {
            onDisabledClick?.()
            return
          }
          handleAnalytics(selectedInstallationType)
          openInstallationGuideModal()
        }}
      >
        {renderIcon(disabled ? 'opacity-60' : undefined)}
        {renderContent()}
        <span className="absolute right-5 top-5">
          <Icon iconName="arrow-up-right" className={disabled ? 'text-neutral-disabled' : 'text-neutral-subtle'} />
        </span>
      </button>
    ))
    .with({ selectedInstallationType: 'managed' }, ({ selectedInstallationType }) =>
      disabled ? (
        <button
          type="button"
          aria-disabled="true"
          className={twMerge(baseClassNames, disabledClassNames)}
          onClick={(e) => {
            e.preventDefault()
            onDisabledClick?.()
          }}
        >
          {renderIcon('opacity-60')}
          {renderContent()}
        </button>
      ) : (
        <Link
          to="/organization/$organizationId/cluster/create/$slug"
          params={{ organizationId, slug: selectedCloudProvider.toLowerCase() }}
          className={baseClassNames}
          onClick={() => handleAnalytics(selectedInstallationType)}
        >
          {renderIcon()}
          {renderContent()}
        </Link>
      )
    )
    .with({ selectedInstallationType: 'partially-managed' }, ({ selectedInstallationType }) => {
      if (isEksAnywhereEnabled && disabled) {
        return (
          <button
            type="button"
            aria-disabled="true"
            className={twMerge(baseClassNames, disabledClassNames)}
            onClick={(e) => {
              e.preventDefault()
              onDisabledClick?.()
            }}
          >
            {renderIcon('opacity-60')}
            {renderContent()}
          </button>
        )
      }

      if (isEksAnywhereEnabled) {
        return (
          <Link
            to="/organization/$organizationId/cluster/create/$slug"
            params={{ organizationId, slug: `${selectedCloudProvider.toLowerCase()}-eks-anywhere` }}
            className={baseClassNames}
            onClick={() => handleAnalytics(selectedInstallationType)}
          >
            {renderIcon()}
            {renderContent()}
          </Link>
        )
      } else {
        return (
          <div
            className={twMerge(
              baseClassNames,
              'cursor-default bg-surface-neutral-component shadow-none hover:border-neutral hover:outline-transparent'
            )}
          >
            {renderIcon()}
            <div className="grid w-full grid-cols-[1fr_auto] gap-2">
              <div>
                <span className="flex flex-col text-base font-semibold text-neutral-subtle">{title}</span>
                <span className="inline-block text-sm text-neutral-disabled">
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
        )
      }
    })

    .exhaustive()
}

type CardClusterProps = RestrictedActionProps & {
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

function CardCluster({ title, description, icon, index = 1, ...props }: CardClusterProps) {
  const [expanded, setExpanded] = useState(false)
  const { disabled = false, onDisabledClick } = props

  const ref = useClickAway(() => {
    setExpanded(false)
  }) as MutableRefObject<HTMLDivElement>

  if ('options' in props) {
    const { options } = props

    const getExpanderPosition = (className: string, index: number) => {
      const position = (index + 1) % 3

      return clsx(className, {
        '-ml-[calc(100%+16px)] w-[calc(200%+16px)] lg:w-[calc(300%+32px)]': position === 2, // 3n+2
        'w-[calc(200%+16px)] lg:-ml-[calc(200%+32px)] lg:w-[calc(300%+32px)]': position === 0, // 3n+3
        'w-[calc(200%+16px)] lg:w-[calc(300%+32px)]': position === 1, // 3n+1
        '-ml-[calc(100%+16px)] lg:-ml-0': index === 3,
      })
    }

    return (
      <div ref={ref} className="h-fit w-[calc(100%/2-16px)] lg:w-[calc(100%/3-16px)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className={twMerge(
            clsx(
              'flex h-32 w-full cursor-pointer justify-start gap-4 rounded-md border border-neutral p-4 shadow-sm transition hover:border-brand-strong',
              {
                'border-brand-strong': expanded,
              }
            )
          )}
        >
          <div className="flex flex-col justify-between">
            <div>
              {typeof icon === 'string' ? (
                <img className="select-none" width={32} height={32} src={icon} alt={title} />
              ) : (
                cloneElement(icon as ReactElement, { className: 'w-[32px] h-[32px]' })
              )}
            </div>
            <p className="text-base font-semibold text-neutral">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2.5 text-neutral-subtle">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral text-xs font-medium">
              {options.length}
            </span>
            <Icon iconName={expanded ? 'angle-up' : 'angle-down'} />
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.25, pointerEvents: 'none' }}
              transition={{ duration: 0.15 }}
              className={getExpanderPosition('relative mt-4 overflow-hidden', index)}
            >
              <div className="flex flex-col gap-6 rounded-md border border-neutral bg-surface-neutral-subtle p-4">
                <div className="flex gap-3 font-medium">
                  <div>
                    {typeof icon === 'string' ? (
                      <img className="select-none" width={24} height={24} src={icon} alt={title} />
                    ) : (
                      cloneElement(icon as ReactElement, { className: 'w-[24px] h-[24px]' })
                    )}
                  </div>
                  <span className="text-base text-neutral">{title}</span>
                </div>
                <div className="flex gap-3">
                  {options.map((optionProps) => (
                    <CardOption key={optionProps.title} {...optionProps} />
                  ))}
                </div>
                <Button
                  className="absolute right-4 top-4"
                  variant="plain"
                  size="xs"
                  iconOnly
                  color="neutral"
                  onClick={() => setExpanded(false)}
                >
                  <Icon iconName="xmark" iconStyle="regular" className="text-base text-neutral-subtle" />
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
        type="button"
        aria-disabled={disabled}
        className={twMerge(
          'relative flex h-32 w-[calc(100%/2-16px)] justify-between gap-4 rounded-md border border-neutral p-4 shadow-sm transition lg:w-[calc(100%/3-16px)]',
          disabled
            ? twMerge(
                'bg-surface-neutral-component shadow-none hover:border-neutral hover:bg-surface-neutral-component',
                onDisabledClick ? 'cursor-pointer' : 'cursor-default'
              )
            : 'cursor-pointer hover:border-brand-strong'
        )}
        onClick={() => {
          if (disabled) {
            onDisabledClick?.()
            return
          }
          posthog.capture('select-cluster', {
            selectedCloudProvider,
            selectedInstallationType,
          })
          openInstallationGuideModal()
        }}
      >
        <div className="flex flex-col justify-between">
          <div>
            {typeof icon === 'string' ? (
              <img
                className={twMerge('select-none', disabled && 'opacity-60')}
                width={32}
                height={32}
                src={icon}
                alt={title}
              />
            ) : (
              cloneElement(icon as ReactElement, { className: twMerge('h-[32px] w-[32px]', disabled && 'opacity-60') })
            )}
          </div>
          <p className={twMerge('truncate text-base font-semibold', disabled ? 'text-neutral-subtle' : 'text-neutral')}>
            {title}
          </p>
        </div>
        {selectedInstallationType === 'demo' ? (
          <span className="absolute right-5 top-5 flex h-5 min-w-min items-center justify-center truncate rounded-full bg-surface-brand-solid px-1.5 text-[11px] font-medium leading-6 text-neutralInvert">
            3min to setup
          </span>
        ) : (
          <div
            className={twMerge(
              'absolute right-5 top-5 flex items-center gap-2.5',
              disabled ? 'text-neutral-disabled' : 'text-neutral-subtle'
            )}
          >
            <span className="flex h-5 items-center justify-center truncate rounded-lg border border-neutral px-1.5 text-[11px] font-semibold leading-6">
              Self-managed
            </span>
            <Icon iconName="arrow-up-right" iconStyle="regular" className="text-base" />
          </div>
        )}
      </button>
    )
  }
}

export function ClusterNew() {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { isClusterCreationRestricted, isNoCreditCardRestriction } = useClusterCreationRestriction({
    organizationId,
  })

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

  const disabledCloudProviderProps: RestrictedActionProps = isClusterCreationRestricted
    ? {
        disabled: true,
        onDisabledClick: isNoCreditCardRestriction ? openCreditCardModal : undefined,
      }
    : {}

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
          ...disabledCloudProviderProps,
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="AWS" />,
          selectedCloudProvider: 'AWS',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
          ...disabledCloudProviderProps,
        },
        {
          title: 'EKS Anywhere',
          description:
            'AWS EKS Anywhere is a fully managed Kubernetes service that allows you to deploy and manage Kubernetes clusters on your own infrastructure.',
          icon: <Icon name="AWS" />,
          selectedCloudProvider: 'AWS',
          selectedInstallationType: 'partially-managed',
          ...disabledCloudProviderProps,
        },
      ],
      icon: <Icon name="AWS" />,
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
          ...disabledCloudProviderProps,
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="GCP" />,
          selectedCloudProvider: 'GCP',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
          ...disabledCloudProviderProps,
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
          ...disabledCloudProviderProps,
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="SCW" />,
          selectedCloudProvider: 'SCW',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
          ...disabledCloudProviderProps,
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
          ...disabledCloudProviderProps,
        },
        {
          title: 'Self-managed',
          description:
            'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
          icon: <Icon name="AZURE" />,
          selectedCloudProvider: 'AZURE',
          selectedInstallationType: 'self-managed',
          openInstallationGuideModal,
          ...disabledCloudProviderProps,
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
      ...disabledCloudProviderProps,
    },
    {
      title: 'Digital Ocean',
      selectedCloudProvider: 'DIGITAL_OCEAN',
      selectedInstallationType: 'self-managed',
      icon: DigitalOcean,
      openInstallationGuideModal,
      ...disabledCloudProviderProps,
    },
    {
      title: 'Oracle Cloud Infrastructure',
      selectedCloudProvider: 'ORACLE_CLOUD',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="ORACLE_CLOUD" />,
      openInstallationGuideModal,
      ...disabledCloudProviderProps,
    },
    {
      title: 'Hetzner',
      selectedCloudProvider: 'HETZNER',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="HETZNER" />,
      openInstallationGuideModal,
      ...disabledCloudProviderProps,
    },
    {
      title: 'IBM Cloud',
      selectedCloudProvider: 'IBM_CLOUD',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="IBM_CLOUD" />,
      openInstallationGuideModal,
      ...disabledCloudProviderProps,
    },
    {
      title: 'Civo',
      selectedCloudProvider: 'CIVO',
      selectedInstallationType: 'self-managed',
      icon: <Icon name="CIVO" />,
      openInstallationGuideModal,
      ...disabledCloudProviderProps,
    },
    {
      title: 'Other',
      selectedCloudProvider: 'OTHER',
      selectedInstallationType: 'self-managed',
      icon: Kubernetes,
      openInstallationGuideModal,
      ...disabledCloudProviderProps,
    },
  ]

  return (
    <div className="mt-8 flex w-full flex-col gap-10">
      <Section>
        <div className="mb-5 flex flex-col gap-0.5">
          <Heading>Qovery on your local machine</Heading>
          <p className="text-sm text-neutral-subtle">Quickly test and validate the Qovery solution on your computer.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <CardCluster {...cloudProviders[0]} />
        </div>
      </Section>
      <Section>
        <div className="mb-5 flex flex-col gap-1">
          <Heading>Or choose your hosting mode</Heading>
          <p className="text-sm text-neutral-subtle">Manage your infrastructure across different hosting mode.</p>
        </div>
        {isClusterCreationRestricted &&
          (isNoCreditCardRestriction ? (
            <Callout.Root color="sky" className="mb-5 items-start">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Add a credit card to create a cluster</Callout.TextHeading>
                <Callout.TextDescription>
                  You need to add a credit card to your account before creating a cluster on a cloud provider. You
                  won&apos;t be charged until your trial ends.
                  <br />
                  <ButtonLink
                    as="button"
                    color="neutral"
                    variant="outline"
                    className="mt-2"
                    to="/organization/$organizationId/settings/billing-summary"
                    params={{ organizationId }}
                  >
                    Add credit card
                    <Icon iconName="arrow-right" className="ml-1" iconStyle="regular" />
                  </ButtonLink>
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
                  Your organization has a billing restriction that prevents cluster creation. Please contact support to
                  resolve this issue.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          ))}
        <div className="flex w-[calc(100%+16px)] flex-wrap gap-4">
          {cloudProviders.slice(1).map((props, index) => (
            <CardCluster key={props.title} index={index} {...props} />
          ))}
        </div>
      </Section>
    </div>
  )
}

export default ClusterNew
