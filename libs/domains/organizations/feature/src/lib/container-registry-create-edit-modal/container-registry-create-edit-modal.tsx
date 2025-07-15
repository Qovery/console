import {
  ContainerRegistryKindEnum,
  type ContainerRegistryRequest,
  type ContainerRegistryResponse,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import { ExternalLink, ModalCrud, useModal } from '@qovery/shared/ui'
import ContainerRegistryForm from '../container-registry-form/container-registry-form'
import { useCreateContainerRegistry } from '../hooks/use-create-container-registry/use-create-container-registry'
import { useEditContainerRegistry } from '../hooks/use-edit-container-registry/use-edit-container-registry'

export interface ContainerRegistryCreateEditModalProps {
  onClose: (response?: ContainerRegistryResponse) => void
  organizationId: string
  isEdit?: boolean
  registry?: ContainerRegistryResponse
}
export function ContainerRegistryCreateEditModal({
  isEdit,
  registry,
  organizationId,
  onClose,
}: ContainerRegistryCreateEditModalProps) {
  const { enableAlertClickOutside } = useModal()
  const methods = useForm<
    ContainerRegistryRequest & {
      type: 'STATIC' | 'STS'
      config: { login_type: 'ACCOUNT' | 'ANONYMOUS'; azure_application_id?: string }
    }
  >({
    mode: 'onChange',
    defaultValues: {
      name: registry?.name,
      description: registry?.description,
      url: registry?.url,
      kind: registry?.kind,
      type: registry ? (registry.config?.role_arn ? 'STS' : 'STATIC') : 'STS',
      config: {
        username: registry?.config?.username,
        password: undefined,
        region: registry?.config?.region,
        access_key_id: registry?.config?.access_key_id,
        secret_access_key: undefined,
        scaleway_project_id: registry?.config?.scaleway_project_id,
        scaleway_access_key: registry?.config?.scaleway_access_key,
        scaleway_secret_key: undefined,
        json_credentials: undefined,
        azure_tenant_id: registry?.config?.azure_tenant_id,
        azure_subscription_id: registry?.config?.azure_subscription_id,
        azure_application_id: registry?.config?.azure_application_id,
        login_type: registry?.config?.username ? 'ACCOUNT' : 'ANONYMOUS',
      },
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const { mutateAsync: editContainerRegistry, isLoading: isLoadingEditContainerRegistry } = useEditContainerRegistry()
  const { mutateAsync: createContainerRegistry, isLoading: isLoadingCreateContainerRegistry } =
    useCreateContainerRegistry()

  const isAzure = methods.watch('kind') === ContainerRegistryKindEnum.AZURE_CR
  const watchAzureApplicationId = methods.watch('config.azure_application_id')

  useEffect(() => {
    setTimeout(() => methods.clearErrors('config'), 0)
  }, [methods])

  const onSubmit = methods.handleSubmit(async (containerRegistryRequest) => {
    const isAzureSubmitSuccessful = methods.formState.isSubmitSuccessful && isAzure

    // Close without edit when no changes
    if (!methods.formState.isDirty || isAzureSubmitSuccessful) {
      onClose()
      return
    }

    const {
      type,
      kind,
      config: { login_type, ...config },
      ...rest
    } = containerRegistryRequest
    try {
      const commonPayload = {
        organizationId: organizationId,
        containerRegistryRequest: {
          ...rest,
          kind,
          config:
            type === 'STS' && kind === 'ECR'
              ? {
                  role_arn: config?.role_arn,
                  region: config?.region,
                }
              : {
                  role_arn: undefined,
                  ...config,
                },
        },
      }

      const response = await match(registry)
        .with(P.nullish, () => createContainerRegistry(commonPayload))
        .with(P.select(), (registry) => editContainerRegistry({ ...commonPayload, containerRegistryId: registry.id }))
        .exhaustive()

      if (isAzure) {
        methods.setValue('config.azure_application_id', response.config?.azure_application_id)
      } else {
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }
  })

  const submitLabel = isEdit
    ? 'Confirm'
    : match({ isAzure, watchAzureApplicationId })
        .with(
          {
            isAzure: true,
            watchAzureApplicationId: P.not(P.string),
          },
          () => 'Next'
        )
        .with(
          {
            isAzure: true,
            watchAzureApplicationId: P.string,
          },
          () => 'Done'
        )
        .otherwise(() => 'Create')

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit container registry' : 'Set container registry'}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isLoadingEditContainerRegistry || isLoadingCreateContainerRegistry}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>
              Connect your private container registry to directly deploy your images. You can also access public
              container registries like DockerHub or AWS ECR. If the registry you need is not in the list and it
              supports the docker login format you can use the "Generic" registry.
            </p>
            <ExternalLink
              className="mt-2"
              href="https://hub.qovery.com/docs/using-qovery/configuration/organization/container-registry/"
            >
              More information here
            </ExternalLink>
          </>
        }
        submitLabel={submitLabel}
      >
        <ContainerRegistryForm isEdit={isEdit} registry={registry} />
      </ModalCrud>
    </FormProvider>
  )
}

export default ContainerRegistryCreateEditModal
