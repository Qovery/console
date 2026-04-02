import { useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useClusters } from '@qovery/domains/clusters/feature'
import { CopyButton } from '@qovery/shared/ui'
import { ExternalLink, Icon, InputSelect, InputText, ModalCrud } from '@qovery/shared/ui'

export interface ConnectArgoCdModalProps {
  organizationId: string
  onClose: (response?: ConnectArgoCdModalResponse) => void
  isEdit?: boolean
  disableTargetClusterSelection?: boolean
  initialValues?: Partial<ConnectArgoCdFormValues>
  initialCluster?: {
    id: string
    name: string
    cloudProvider?: string
  }
}

interface ConnectArgoCdFormValues {
  targetCluster: string
  argoCdApiUrl: string
  accessToken: string
}

export interface ConnectArgoCdModalResponse {
  clusterId: string
  clusterName: string
  clusterCloudProvider?: string
  argoCdApiUrl: string
  accessToken: string
}

const ARGOCD_TOKEN_COMMAND = '$ argocd account generate-token'
const ARGOCD_API_ENDPOINT_GUIDE_URL = 'https://argo-cd.readthedocs.io/'

export function ConnectArgoCdModal({
  organizationId,
  onClose,
  isEdit = false,
  disableTargetClusterSelection = false,
  initialValues,
  initialCluster,
}: ConnectArgoCdModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const methods = useForm<ConnectArgoCdFormValues>({
    mode: 'onChange',
    defaultValues: {
      targetCluster: initialValues?.targetCluster ?? '',
      argoCdApiUrl: initialValues?.argoCdApiUrl ?? '',
      accessToken: initialValues?.accessToken ?? '',
    },
  })

  const { data: clusters = [], isLoading: isLoadingClusters } = useClusters({
    organizationId,
    enabled: !!organizationId,
  })

  const clusterOptions = useMemo(() => {
    const options = clusters.map((cluster) => ({
      label: cluster.name,
      value: cluster.id,
    }))

    if (initialCluster && !options.some((option) => option.value === initialCluster.id)) {
      options.unshift({
        label: initialCluster.name,
        value: initialCluster.id,
      })
    }

    return options
  }, [clusters, initialCluster])

  const onSubmit = methods.handleSubmit(async () => {
    setIsConnecting(true)
    // Temporary fake loading state until backend integration is implemented.
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsConnecting(false)

    const selectedClusterId = methods.getValues('targetCluster')
    const selectedCluster = clusters.find((cluster) => cluster.id === selectedClusterId)

    if (!selectedCluster && !initialCluster) {
      onClose()
      return
    }

    const resolvedCluster = selectedCluster ?? initialCluster

    onClose({
      clusterId: resolvedCluster?.id ?? '',
      clusterName: resolvedCluster?.name ?? '',
      clusterCloudProvider: selectedCluster?.cloud_provider ?? initialCluster?.cloudProvider,
      argoCdApiUrl: methods.getValues('argoCdApiUrl'),
      accessToken: methods.getValues('accessToken'),
    })
  })

  const onOpenHowItWorks = () => {
    window.open(ARGOCD_API_ENDPOINT_GUIDE_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit ArgoCD connection' : 'Connect ArgoCD with Qovery'}
        description="Set up the connection between ArgoCD and Qovery so you can monitor all your applications in one place."
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isConnecting}
        submitLabel={isEdit ? 'Update connection' : 'Connect ArgoCD'}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>
              You can define here the repository (HTTPS or OCI) that you want to use within your organization to deploy
              your helm charts.
            </p>
            <p>You can create a new repository by defining:</p>
            <ul className="mb-2 ml-3 list-inside list-disc">
              <li>its name and description</li>
              <li>kind (HTTPS or OCI)</li>
              <li>the repository URL (Starting with https:// or oci://)</li>
              <li>the credentials</li>
              <li>the skip TLS verification option (to activate the helm argument --insecure-skip-tls-verify)</li>
            </ul>
            <ExternalLink
              className="mt-2"
              href="https://www.qovery.com/docs/configuration/organization/helm-repository"
            >
              More information here
            </ExternalLink>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-neutral bg-surface-neutral p-4">
            <h3 className="text-sm font-medium text-neutral">1. Select the cluster hosting your ArgoCD instance</h3>
            <div className="mt-4">
              <Controller
                name="targetCluster"
                control={methods.control}
                rules={{
                  required: 'Please select a cluster.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    label="Target cluster"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={clusterOptions}
                    disabled={disableTargetClusterSelection}
                    error={error?.message}
                    isLoading={isLoadingClusters}
                  />
                )}
              />
            </div>
          </div>

          <div className="rounded-md border border-neutral bg-surface-neutral p-4">
            <h3 className="text-sm font-medium text-neutral">2. ArgoCD API endpoint</h3>
            <p className="mt-1 text-sm text-neutral-subtle">Enter the internal URL of the ArgoCD API server</p>
            <ExternalLink href={ARGOCD_API_ENDPOINT_GUIDE_URL} className="mt-1">
              How to find the ArgoCD API endpoint
            </ExternalLink>
            <div className="mt-4">
              <Controller
                name="argoCdApiUrl"
                control={methods.control}
                rules={{
                  required: 'Please enter an ArgoCD API URL.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    name={field.name}
                    label="ArgoCD API URL"
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                    autoComplete="off"
                  />
                )}
              />
            </div>
          </div>

          <div className="rounded-md border border-neutral bg-surface-neutral p-4">
            <h3 className="text-sm font-medium text-neutral">3. Generate an access token</h3>
            <p className="mt-1 text-sm text-neutral-subtle">
              Generate an API token from your ArgoCD instance and paste it below
            </p>
            <div className="mt-2 flex items-center justify-between rounded-md border border-neutral bg-surface-neutral-subtle p-3">
              <span className="text-sm text-neutral">{ARGOCD_TOKEN_COMMAND}</span>
              <CopyButton content={ARGOCD_TOKEN_COMMAND} />
            </div>
            <div className="mt-2">
              <Controller
                name="accessToken"
                control={methods.control}
                rules={{
                  required: 'Please enter an access token.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    name={field.name}
                    label="Access token"
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                    autoComplete="off"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default ConnectArgoCdModal
