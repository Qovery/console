import { type ArgoCdInstanceMappingResponse } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useCheckArgoCdConnection, useClusters, useSaveArgoCdCredentials } from '@qovery/domains/clusters/feature'
import { CopyButton, ExternalLink, Heading, InputSelect, InputText, ModalCrud, Section } from '@qovery/shared/ui'

interface ConnectArgoCdFormValues {
  targetCluster: string
  argoCdApiUrl: string
  accessToken: string
}

export interface ConnectArgoCdModalProps {
  organizationId: string
  onClose: () => void
  configuredClusterIds: string[]
  integration?: ArgoCdInstanceMappingResponse
}

const ARGOCD_TOKEN_COMMAND = 'argocd account generate-token'
const ARGOCD_API_ENDPOINT_GUIDE_URL =
  'https://argo-cd.readthedocs.io/en/stable/operator-manual/ingress/#ui-and-api-content-path'

const getConnectionErrorMessage = (reason?: string) => {
  switch (reason) {
    case 'unreachable':
      return 'Qovery could not reach this ArgoCD URL. Please verify the endpoint and network access.'
    case 'authentication_failed':
      return 'The token was rejected by ArgoCD. Please generate a new token and try again.'
    case 'insufficient_permissions':
      return 'This token does not have enough permissions to inspect ArgoCD applications.'
    default:
      return 'Qovery could not validate this ArgoCD connection. Please verify the URL and token.'
  }
}

export function ConnectArgoCdModal({
  organizationId,
  onClose,
  configuredClusterIds,
  integration,
}: ConnectArgoCdModalProps) {
  const [connectionError, setConnectionError] = useState<string>()
  const isEdit = Boolean(integration)
  const methods = useForm<ConnectArgoCdFormValues>({
    mode: 'onChange',
    defaultValues: {
      targetCluster: integration?.agent_cluster_id ?? '',
      argoCdApiUrl: integration?.argocd_url ?? '',
      accessToken: '',
    },
  })

  const { data: clusters = [], isLoading: isLoadingClusters } = useClusters({
    organizationId,
    enabled: !!organizationId,
  })
  const { mutateAsync: checkArgoCdConnection, isLoading: isCheckingConnection } = useCheckArgoCdConnection()
  const { mutateAsync: saveArgoCdCredentials, isLoading: isSavingCredentials } = useSaveArgoCdCredentials({
    organizationId,
  })

  const clusterOptions = useMemo(() => {
    const allowedClusterIds = new Set(configuredClusterIds)

    if (integration?.agent_cluster_id) {
      allowedClusterIds.delete(integration.agent_cluster_id)
    }

    const options = clusters
      .filter((cluster) => !allowedClusterIds.has(cluster.id))
      .map((cluster) => ({
        label: cluster.name,
        value: cluster.id,
      }))

    if (integration && !options.some((option) => option.value === integration.agent_cluster_id)) {
      options.unshift({
        label: integration.agent_cluster_name,
        value: integration.agent_cluster_id,
      })
    }

    return options
  }, [clusters, configuredClusterIds, integration?.agent_cluster_id, integration?.agent_cluster_name])

  const onSubmit = methods.handleSubmit(async ({ targetCluster, argoCdApiUrl, accessToken }) => {
    methods.clearErrors()
    setConnectionError(undefined)

    const argoCdCredentialsRequest = {
      argocd_url: argoCdApiUrl.trim(),
      argocd_token: accessToken.trim(),
    }

    const checkResponse = await checkArgoCdConnection({
      clusterId: targetCluster,
      argoCdCredentialsRequest,
    })

    if (checkResponse.status !== 'connected') {
      const errorMessage = getConnectionErrorMessage(checkResponse.reason)
      const errorField = checkResponse.reason === 'unreachable' ? 'argoCdApiUrl' : 'accessToken'

      methods.setError(errorField, {
        message: errorMessage,
      })
      setConnectionError(errorMessage)
      return
    }

    await saveArgoCdCredentials({
      clusterId: targetCluster,
      argoCdCredentialsRequest,
    })

    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit ArgoCD connection' : 'Connect ArgoCD with Qovery'}
        description="Save the ArgoCD endpoint and token used by Qovery to discover the applications running on one of your clusters."
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isCheckingConnection || isSavingCredentials}
        submitLabel={isEdit ? 'Update connection' : 'Connect ArgoCD'}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>
              Qovery stores one ArgoCD connection per cluster. Before saving it, Qovery validates the URL and token by
              calling the ArgoCD API.
            </p>
            <p>To complete the setup you need:</p>
            <ul className="mb-2 ml-3 list-inside list-disc">
              <li>a Qovery cluster hosting the ArgoCD instance</li>
              <li>the ArgoCD API URL reachable from that cluster</li>
              <li>a token generated from the `argocd` CLI or UI</li>
            </ul>
            <ExternalLink className="mt-2" href={ARGOCD_API_ENDPOINT_GUIDE_URL}>
              ArgoCD API endpoint documentation
            </ExternalLink>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Section className="rounded-md border border-neutral bg-surface-neutral p-4">
            <Heading className="text-sm">1. Select the cluster hosting your ArgoCD instance</Heading>
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
                    disabled={isEdit}
                    error={error?.message}
                    isLoading={isLoadingClusters}
                  />
                )}
              />
            </div>
          </Section>

          <Section className="rounded-md border border-neutral bg-surface-neutral p-4">
            <Heading className="text-sm">2. ArgoCD API endpoint</Heading>
            <p className="mt-1 text-sm text-neutral-subtle">Enter the URL used to reach the ArgoCD API server.</p>
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
          </Section>

          <Section className="rounded-md border border-neutral bg-surface-neutral p-4">
            <Heading className="text-sm">
              {isEdit ? '3. Generate a new access token' : '3. Generate an access token'}
            </Heading>
            <p className="mt-1 text-sm text-neutral-subtle">
              {isEdit
                ? 'For security reasons, Qovery cannot show the saved token. Paste a new one to update the connection.'
                : 'Generate an API token from your ArgoCD instance and paste it below.'}
            </p>
            <div className="mt-2 flex items-center justify-between rounded-md border border-neutral bg-surface-neutral-subtle p-3">
              <span className="text-sm text-neutral">
                <span className="select-none">$ </span>
                {ARGOCD_TOKEN_COMMAND}
              </span>
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
                    type="password"
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                    autoComplete="off"
                  />
                )}
              />
            </div>
          </Section>

          {connectionError ? <p className="text-sm text-negative">{connectionError}</p> : null}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
