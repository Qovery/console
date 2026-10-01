import { Link, useParams } from '@tanstack/react-router'
import Azure from 'devicon/icons/azure/azure-original.svg'
import DigitalOcean from 'devicon/icons/digitalocean/digitalocean-original.svg'
import GCP from 'devicon/icons/googlecloud/googlecloud-original.svg'
import Kubernetes from 'devicon/icons/kubernetes/kubernetes-original.svg'
import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type ReactElement, type ReactNode, cloneElement, useState } from 'react'
import { Callout, Heading, Icon, Modal, Section, useModal } from '@qovery/shared/ui'
import { useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { ClusterInstallationGuideModal } from '../cluster-installation-guide-modal/cluster-installation-guide-modal'
import { useClusterCreationRestriction } from '../hooks/use-cluster-creation-restriction/use-cluster-creation-restriction'
import {
  SELF_MANAGED_CLUSTER_CREATION_MODAL_WIDTH,
  SelfManagedClusterCreationFlow,
  type SelfManagedClusterCreationStep,
} from '../self-managed-cluster-creation/self-managed-cluster-creation-flow'

type ProviderCardProps = {
  title: string
  icon: string | ReactElement
  disabled?: boolean
  analytics: { selectedCloudProvider: string; selectedInstallationType: string }
} & ({ slug: string } | { onClick: () => void })

function ProviderIcon({ icon, title }: { icon: string | ReactElement; title: string }) {
  return typeof icon === 'string' ? (
    <img className="size-5 select-none" src={icon} alt={title} />
  ) : (
    cloneElement(icon, { className: 'size-5 select-none' })
  )
}

function ProviderCard({ title, icon, disabled = false, analytics, ...props }: ProviderCardProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const className = twMerge(
    'flex h-[52px] items-center gap-2 rounded-md border border-neutral bg-surface-neutral px-4 text-left text-sm font-medium text-neutral transition-colors',
    disabled ? 'cursor-not-allowed bg-surface-neutral-component text-neutral-subtle' : 'hover:border-brand-strong'
  )
  const content = (
    <>
      <ProviderIcon icon={icon} title={title} />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <Icon iconName="angle-right" iconStyle="regular" className="text-neutral-subtle" />
    </>
  )
  const capture = () => posthog.capture('select-cluster', analytics)

  if ('slug' in props && !disabled) {
    return (
      <Link
        to="/organization/$organizationId/cluster/create/$slug"
        params={{ organizationId, slug: props.slug }}
        className={className}
        onClick={capture}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-disabled={disabled}
      className={className}
      onClick={() => {
        if (disabled || !('onClick' in props)) return
        capture()
        props.onClick()
      }}
    >
      {content}
    </button>
  )
}

function ProviderSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Heading>{title}</Heading>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </Section>
  )
}

export function ClusterAdd() {
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const { showPylonForm } = useSupportChat()
  const isEksAnywhereEnabled = useFeatureFlagEnabled('eks-anywhere')
  const { isClusterCreationRestricted: disabled } = useClusterCreationRestriction({ organizationId })
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false)
  const [creationStep, setCreationStep] = useState<SelfManagedClusterCreationStep>('general')

  const openInstallationGuideModal = ({ isDemo = false }: { isDemo?: boolean } = {}) =>
    openModal({
      options: { width: 500 },
      content: <ClusterInstallationGuideModal mode="CREATE" isDemo={isDemo} type="ON_PREMISE" onClose={closeModal} />,
    })

  const openCreationFlow = () => {
    setCreationStep('general')
    setIsCreationFlowOpen(true)
  }

  const managed = (selectedCloudProvider: string) => ({
    selectedCloudProvider,
    selectedInstallationType: 'managed',
  })
  const selfManaged = (selectedCloudProvider: string) => ({
    selectedCloudProvider,
    selectedInstallationType: 'self-managed',
  })

  return (
    <div className="mt-8 flex w-full flex-col gap-10">
      {disabled && (
        <Callout.Root color="red">
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
      )}

      <ProviderSection
        title="Create managed cluster"
        description="Qovery creates and manages the cluster for you, in your cloud account"
      >
        <ProviderCard
          title="Amazon Web Services"
          icon={<Icon name="AWS" />}
          slug="aws"
          disabled={disabled}
          analytics={managed('AWS')}
        />
        {isEksAnywhereEnabled ? (
          <ProviderCard
            title="Amazon Web Services EKS Anywhere"
            icon={<Icon name="AWS" />}
            slug="aws-eks-anywhere"
            disabled={disabled}
            analytics={{ selectedCloudProvider: 'AWS', selectedInstallationType: 'partially-managed' }}
          />
        ) : (
          <ProviderCard
            title="Amazon Web Services EKS Anywhere"
            icon={<Icon name="AWS" />}
            onClick={() => showPylonForm('request-access-eks-anywhere')}
            analytics={{ selectedCloudProvider: 'AWS', selectedInstallationType: 'partially-managed' }}
          />
        )}
        <ProviderCard
          title="Google Cloud Platform"
          icon={GCP}
          slug="gcp"
          disabled={disabled}
          analytics={managed('GCP')}
        />
        <ProviderCard
          title="Scaleway"
          icon={<Icon name="SCW" />}
          slug="scw"
          disabled={disabled}
          analytics={managed('SCW')}
        />
        <ProviderCard
          title="Microsoft Azure"
          icon={Azure}
          slug="azure"
          disabled={disabled}
          analytics={managed('AZURE')}
        />
      </ProviderSection>

      <ProviderSection
        title="Connect existing cluster (BYOK)"
        description="Install the Qovery operator on a cluster you already run"
      >
        <ProviderCard
          title="Local machine (Demo)"
          icon={Kubernetes}
          onClick={() => openInstallationGuideModal({ isDemo: true })}
          analytics={{ selectedCloudProvider: 'OTHER', selectedInstallationType: 'demo' }}
        />
        <ProviderCard
          title="AWS"
          icon={<Icon name="AWS" />}
          onClick={openCreationFlow}
          disabled={disabled}
          analytics={selfManaged('AWS')}
        />
        {[
          { title: 'GCP', icon: GCP, provider: 'GCP' },
          { title: 'Microsoft Azure', icon: Azure, provider: 'AZURE' },
          { title: 'OVH Cloud', icon: <Icon name="OVH_CLOUD" />, provider: 'OVH_CLOUD' },
          { title: 'Digital Ocean', icon: DigitalOcean, provider: 'DIGITAL_OCEAN' },
          { title: 'CIVO', icon: <Icon name="CIVO" />, provider: 'CIVO' },
          { title: 'Oracle Cloud Infrastructure', icon: <Icon name="ORACLE_CLOUD" />, provider: 'ORACLE_CLOUD' },
          { title: 'Hetzner', icon: <Icon name="HETZNER" />, provider: 'HETZNER' },
          { title: 'IBM Cloud', icon: <Icon name="IBM_CLOUD" />, provider: 'IBM_CLOUD' },
        ].map(({ title, icon, provider }) => (
          <ProviderCard
            key={title}
            title={title}
            icon={icon}
            onClick={() => openInstallationGuideModal()}
            disabled={disabled}
            analytics={selfManaged(provider)}
          />
        ))}
      </ProviderSection>

      <Modal
        externalOpen={isCreationFlowOpen}
        setExternalOpen={setIsCreationFlowOpen}
        width={SELF_MANAGED_CLUSTER_CREATION_MODAL_WIDTH[creationStep]}
        // Once the cluster exists, the modal only closes itself when its Operator connects.
        dismissible={creationStep !== 'install'}
      >
        {/* The dialog unmounts its content once closed, so each opening starts a fresh flow. */}
        <SelfManagedClusterCreationFlow
          organizationId={organizationId}
          onStepChange={setCreationStep}
          onClose={() => setIsCreationFlowOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default ClusterAdd
