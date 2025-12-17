import { type IconName } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { type ReactNode, useMemo } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import { Heading, Icon, LogoIcon, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useClusters } from '../hooks/use-clusters/use-clusters'

const CLUSTERS_OPTIONS: {
  highlight: boolean
  tag: string
  title: string
  description: string
  icon: IconName | ReactNode
  compatibleWith?: IconEnum[]
}[] = [
  {
    highlight: true,
    tag: 'Recommended',
    title: 'Qovery managed',
    description:
      'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
    icon: <LogoIcon width="14" height="14" />,
    compatibleWith: [IconEnum.AWS, IconEnum.GCP, IconEnum.AZURE, IconEnum.SCW_GRAY],
  },
  {
    highlight: false,
    tag: 'Self-managed',
    title: 'Bring your own cluster',
    icon: 'cloud-fog',
    description:
      'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
    compatibleWith: [
      IconEnum.AWS,
      IconEnum.GCP,
      IconEnum.AZURE,
      IconEnum.SCW_GRAY,
      IconEnum.OVH_CLOUD,
      IconEnum.DO,
      IconEnum.ORACLE_CLOUD,
      IconEnum.HETZNER,
      IconEnum.IBM_CLOUD,
      IconEnum.CIVO,
    ],
  },
  {
    highlight: false,
    tag: 'Demo',
    title: 'Local machine (demo)',
    icon: 'laptop-code',
    description:
      'Deploy a local Kubernetes cluster on your laptop using Docker Desktop. No cloud account or credit card required!',
  },
]

const RELATED_DOCUMENTATION: { title: string; url: string }[] = [
  {
    title: 'What is a cluster?',
    url: 'https://www.qovery.com/docs/configuration/clusters/#what-is-a-cluster',
  },
  {
    title: 'What does the qovery managed cluster offers me?',
    url: 'https://www.qovery.com/docs/configuration/clusters/#creating-a-cluster',
  },
  {
    title: 'What is a self-managed cluster?',
    url: 'https://www.qovery.com/docs/configuration/clusters/#what-is-a-self-managed-cluster',
  },
]

export function SectionProductionHealth({ organizationId }: { organizationId: string }) {
  const { data: clusters = [] } = useClusters({ organizationId })
  const clusterProduction = useMemo(() => clusters?.filter((cluster) => cluster.production), [clusters]) ?? []

  return (
    <Section className="flex w-full flex-col gap-3">
      <Heading className="flex items-center gap-2">
        {clusterProduction.length > 0 ? 'Your production health' : 'Production health'}
      </Heading>
      {clusterProduction.length === 0 ? (
        <div className="flex flex-col gap-5 rounded-lg border border-neutral bg-surface-neutral p-4 text-sm">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-neutral">
              Install your first cluster and start tracking your production health
            </p>
            <p className="text-neutral-subtle">
              Create a cluster on your cloud provider to be able to deploy apps later
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {CLUSTERS_OPTIONS.map((option) => (
              <button
                key={option.title}
                className={twMerge(
                  clsx(
                    'flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4 text-left transition-colors',
                    {
                      'border-brand-subtle bg-surface-brand-subtle hover:border-brand-component hover:bg-surface-brand-component':
                        option.highlight,
                      'hover:bg-surface-neutral-subtle': !option.highlight,
                    }
                  )
                )}
              >
                <span
                  className={twMerge(
                    clsx(
                      'flex h-5 max-w-max items-center justify-center rounded-full bg-surface-neutral-component px-2 text-xs font-medium text-neutral-subtle',
                      {
                        'bg-surface-brand-solid text-neutralInvert': option.highlight,
                      }
                    )
                  )}
                >
                  {option.tag}
                </span>
                <span className="flex flex-col gap-2">
                  <p className="flex items-center gap-1 text-ssm font-medium text-neutral">
                    {typeof option.icon === 'string' ? (
                      <Icon iconName={option.icon as IconName} className="text-xs text-neutral-subtle" />
                    ) : (
                      option.icon
                    )}
                    {option.title}
                  </p>
                  <p className="text-ssm text-neutral-subtle">{option.description}</p>
                </span>
                <span className="mt-auto flex flex-col gap-1">
                  <span className="font-code text-2xs uppercase text-neutral">Compatible with</span>
                  {option.compatibleWith ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {option.compatibleWith.map((provider) => (
                        <Icon key={provider} name={provider} width={16} height={16} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-ssm text-neutral-subtle">Every computer</span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-neutral">Related docs</p>
            <div className="overflow-hidden rounded border border-neutral">
              {RELATED_DOCUMENTATION.map((doc) => (
                <a
                  key={doc.title}
                  href={doc.url}
                  title={doc.title}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-component group flex h-12 w-full items-center justify-between border-b border-neutral p-4 text-ssm text-neutral transition-colors last:border-b-0 hover:bg-surface-neutral-subtle"
                >
                  {doc.title}
                  <Icon
                    iconName="external-link"
                    className="text-xs text-neutral-subtle transition-colors group-hover:text-neutral"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        clusterProduction.map((cluster) => (
          <div
            key={cluster.id}
            className="rounded-lg border border-neutral bg-surface-neutral p-4 text-ssm text-neutral"
          >
            <p>{cluster.name}</p>
          </div>
        ))
      )}
    </Section>
  )
}

export default SectionProductionHealth
