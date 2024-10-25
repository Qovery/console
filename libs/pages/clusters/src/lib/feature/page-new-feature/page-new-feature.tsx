import clsx from 'clsx'
import AWS from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg'
import Azure from 'devicon/icons/azure/azure-original.svg'
import DigitalOcean from 'devicon/icons/digitalocean/digitalocean-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Kubernetes from 'devicon/icons/kubernetes/kubernetes-original.svg'
import { AnimatePresence, motion } from 'framer-motion'
import posthog from 'posthog-js'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type MutableRefObject, type ReactElement, cloneElement, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ClusterInstallationGuideModal } from '@qovery/domains/clusters/feature'
import { CLUSTERS_TEMPLATE_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Heading, Icon, Link, Section, useModal } from '@qovery/shared/ui'
import { useClickAway, useDocumentTitle } from '@qovery/shared/util-hooks'

const Qovery = '/assets/logos/logo-icon.svg'

type CardOptionProps = {
  title: string
  description?: string
  recommended?: boolean
  icon?: string | ReactElement
  selectedCloudProvider: Exclude<keyof typeof CloudProviderEnum, 'ON_PREMISE'>
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

  return match(props)
    .with({ selectedInstallationType: 'self-managed' }, ({ selectedInstallationType, openInstallationGuideModal }) => (
      <button
        className="flex h-32 flex-col items-start justify-start gap-3 rounded-sm border border-neutral-200 p-3 transition hover:bg-white"
        onClick={() => {
          posthog.capture('select-cluster', {
            selectedCloudProvider,
            selectedInstallationType,
          })
          openInstallationGuideModal()
        }}
      >
        {typeof icon === 'string' ? (
          <img className="mt-1 select-none" width={48} height={48} src={icon} alt={title} />
        ) : (
          cloneElement(icon as ReactElement, { className: 'w-[48px] mt-1 select-none' })
        )}
        <span className="text-start">
          <span className="inline-block items-center text-ssm font-medium text-neutral-400">{title}</span>
          <span className="inline-block text-xs text-neutral-350">{description}</span>
        </span>
      </button>
    ))
    .with({ selectedInstallationType: 'managed' }, ({ selectedInstallationType }) => (
      <NavLink
        to={CLUSTERS_URL(organizationId) + CLUSTERS_TEMPLATE_CREATION_URL(selectedCloudProvider)}
        className="flex items-start gap-3 rounded-sm border border-neutral-200 p-3 transition hover:bg-white"
        onClick={() =>
          posthog.capture('select-cluster', {
            selectedCloudProvider,
            selectedInstallationType,
          })
        }
      >
        {typeof icon === 'string' ? (
          <img className="mt-1 select-none" width={48} height={48} src={icon} alt={title} />
        ) : (
          cloneElement(icon as ReactElement, { className: 'w-[48px] mt-1 select-none' })
        )}
        <span className="text-start">
          <span className="inline-flex items-center text-ssm font-medium text-neutral-400">
            {title}
            {recommended && (
              <span className="relative ml-1.5 inline-block rounded bg-brand-500 px-1 text-2xs text-neutral-50">
                Recommended
              </span>
            )}
          </span>
          <span className="inline-block text-xs text-neutral-350">{description}</span>
        </span>
        <span className="ml-auto flex h-full items-center pr-1">
          <Icon iconName="chevron-right" className="text-xs text-neutral-400" />
        </span>
      </NavLink>
    ))
    .exhaustive()
}

type CardClusterProps = {
  title: string
  description?: string
  icon: string | ReactElement
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

function CardCluster({ title, description, icon, ...props }: CardClusterProps) {
  const [expanded, setExpanded] = useState(false)

  if ('options' in props) {
    const { options } = props

    const ref = useClickAway(() => {
      setExpanded(false)
    }) as MutableRefObject<HTMLDivElement>

    const handleOpenModal = () => {
      if (expanded === false) {
        setExpanded(true)
      }
    }

    return (
      <>
        <div
          onClick={handleOpenModal}
          className={clsx(
            'flex h-32 cursor-pointer justify-start gap-4 rounded border border-neutral-200 p-5 shadow-sm transition hover:bg-neutral-100',
            {
              'border-brand-500': expanded,
            }
          )}
        >
          <div className="flex flex-col gap-4">
            <div>
              {typeof icon === 'string' ? (
                <img className="select-none" width={52} height={52} src={icon} alt={title} />
              ) : (
                cloneElement(icon as ReactElement, { className: 'w-[52px] h-[52px]' })
              )}
            </div>
            <p className="text-base font-semibold">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2.5 text-neutral-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-200 text-xs font-medium">
              2
            </span>
            <Icon iconName="angle-up" iconStyle="regular" className="text-xs " />
          </div>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              ref={ref}
              className="col-span-3 row-start-2 flex w-full flex-col bg-neutral-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-3 gap-2">
                {options.map((props) => (
                  <CardOption key={props.title} {...props} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )

    // return (
    //   <div
    //     onClick={() => setExpanded(true)}
    //     className={clsx({
    //       'flex h-32 cursor-pointer flex-col justify-start gap-6 rounded border border-neutral-200 p-5 shadow-sm transition hover:bg-neutral-100':
    //         true,
    //       'col-span-3 bg-neutral-100 p-6': expanded,
    //     })}
    //   >
    //     {expanded ? (
    //       <div className="flex w-full flex-col gap-8">
    //         <div className="relative flex gap-6">
    // <div className="flex w-14 items-center justify-center">
    //   {typeof icon === 'string' ? (
    //     <img className="select-none" width={52} height={52} src={icon} alt={title} />
    //   ) : (
    //     cloneElement(icon as ReactElement, { className: 'w-[52px]' })
    //   )}
    // </div>
    //           <div>
    //             <h3 className="mb-1 text-base font-medium">{title}</h3>
    //             <p className="max-w-96 text-ssm text-neutral-350">{description}</p>
    //           </div>
    //           <Button
    //             className="absolute right-0 top-0"
    //             color="neutral"
    //             variant="surface"
    //             onClick={(e) => {
    //               e.stopPropagation()
    //               setExpanded(false)
    //             }}
    //           >
    //             <Icon iconName="xmark" />
    //           </Button>
    //         </div>
    // <div className="grid grid-cols-3 gap-2">
    //   {options.map((props) => (
    //     <CardOption key={props.title} {...props} />
    //   ))}
    // </div>
    //       </div>
    //     ) : (
    //       <>
    //         <span className="relative flex w-14 items-center justify-center">
    //           {typeof icon === 'string' ? (
    //             <img className="max-h-10 w-14 select-none" src={icon} alt={title} />
    //           ) : (
    //             cloneElement(icon as ReactElement, { className: 'w-10' })
    //           )}
    //         </span>
    //         <div className="flex h-full w-60 flex-col justify-between gap-2">
    //           <div>
    //             <h3 className="mb-1 text-ssm font-medium">{title}</h3>
    //           </div>
    //           <p className="text-xs font-medium text-neutral-400">
    //             Click to select an option <Icon iconName="chevron-right" className="ml-1 text-2xs" />
    //           </p>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // )
  } else {
    const { selectedCloudProvider, selectedInstallationType, openInstallationGuideModal } = props

    return (
      <button
        className="flex h-32 cursor-pointer justify-between gap-4 rounded border border-neutral-200 p-5 shadow-sm transition hover:bg-neutral-100"
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
              <img className="select-none" width={52} height={52} src={icon} alt={title} />
            ) : (
              cloneElement(icon as ReactElement, { className: 'w-[52px] h-[52px]' })
            )}
          </div>
          <p className="truncate text-base font-semibold">{title}</p>
        </div>
        {selectedInstallationType === 'demo' ? (
          <span className="flex h-5  min-w-min items-center justify-center truncate rounded-lg bg-brand-500 px-1.5 text-[11px] font-medium leading-6 text-neutral-50">
            3min to setup
          </span>
        ) : (
          <div className="ml-auto flex items-center gap-2.5 text-neutral-400">
            <span className="flex h-5 items-center justify-center truncate rounded-lg border border-neutral-200 px-1.5 text-[11px] font-semibold leading-6">
              Self-managed
            </span>
            <Icon iconName="arrow-up-right" iconStyle="regular" className="text-xs" />
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
      selectedCloudProvider: 'AZURE',
      selectedInstallationType: 'self-managed',
      icon: Azure,
      openInstallationGuideModal,
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
      <div className="flex w-full max-w-[1280px] flex-col gap-10">
        <div className="flex flex-col">
          <Heading className="mb-2 text-2xl">Install new cluster</Heading>
        </div>
        <Section>
          <div className="mb-5 flex flex-col gap-0.5">
            <Heading>Qovery on your local machine</Heading>
            <p className="text-sm text-neutral-350">Quickly test and validate the Qovery solution on your computer.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <CardCluster {...cloudProviders[0]} />
          </div>
        </Section>
        <Section>
          <div className="mb-5 flex flex-col gap-1">
            <Heading>Or choose your hosting mode</Heading>
            <p className="text-sm text-neutral-350">Manage your infrastructure across different hosting mode.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {cloudProviders.slice(1).map((props) => (
              <CardCluster key={props.title} {...props} />
            ))}
          </div>
        </Section>
      </div>
    </Section>
  )
}

export default PageNewFeature
