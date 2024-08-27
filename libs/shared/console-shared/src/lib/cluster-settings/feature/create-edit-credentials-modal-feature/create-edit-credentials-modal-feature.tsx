import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  useCreateCloudProviderCredential,
  useDeleteCloudProviderCredential,
  useEditCloudProviderCredential,
} from '@qovery/domains/cloud-providers/feature'
import { useModal } from '@qovery/shared/ui'
import CreateEditCredentialsModal from '../../ui/create-edit-credentials-modal/create-edit-credentials-modal'

export interface CreateEditCredentialsModalFeatureProps {
  onClose: (response?: ClusterCredentials) => void
  cloudProvider: CloudProviderEnum
  organizationId: string
  currentCredential?: ClusterCredentials
}

export const handleSubmit = (data: FieldValues, cloudProvider: CloudProviderEnum) => {
  const currentData = {
    name: data['name'],
  }

  return match(cloudProvider)
    .with(CloudProviderEnum.AWS, (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        access_key_id: data['access_key_id'],
        secret_access_key: data['secret_access_key'],
      },
    }))
    .with(CloudProviderEnum.SCW, (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        scaleway_access_key: data['scaleway_access_key'],
        scaleway_secret_key: data['scaleway_secret_key'],
        scaleway_project_id: data['scaleway_project_id'],
        scaleway_organization_id: data['scaleway_organization_id'],
      },
    }))
    .with(CloudProviderEnum.GCP, (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        gcp_credentials: data['gcp_credentials'],
      },
    }))
    .with(CloudProviderEnum.ON_PREMISE, (cp) => ({
      cloudProvider: cp,
      payload: undefined,
    }))
    .exhaustive()
}

export function CreateEditCredentialsModalFeature(props: CreateEditCredentialsModalFeatureProps) {
  const { cloudProvider, onClose, currentCredential, organizationId } = props
  const [loading, setLoading] = useState(false)

  const { enableAlertClickOutside } = useModal()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: currentCredential?.name || '',
      access_key_id:
        currentCredential && 'access_key_id' in currentCredential ? currentCredential.access_key_id : undefined,
      scaleway_organization_id:
        currentCredential && 'scaleway_organization_id' in currentCredential
          ? currentCredential.scaleway_organization_id
          : undefined,
      scaleway_project_id:
        currentCredential && 'scaleway_project_id' in currentCredential
          ? currentCredential.scaleway_project_id
          : undefined,
      scaleway_access_key:
        currentCredential && 'scaleway_access_key' in currentCredential
          ? currentCredential.scaleway_access_key
          : undefined,
    },
  })

  const { mutateAsync: createCloudProviderCredential } = useCreateCloudProviderCredential()
  const { mutateAsync: editCloudProviderCredential } = useEditCloudProviderCredential()
  const { mutateAsync: deleteCloudProviderCredential } = useDeleteCloudProviderCredential()

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    // Close without edit when no changes
    if (!methods.formState.isDirty) {
      onClose()
      return
    }

    const credentials = handleSubmit(data, cloudProvider)

    try {
      if (currentCredential) {
        const response = await editCloudProviderCredential({
          organizationId,
          credentialId: currentCredential.id,
          ...credentials,
        })
        onClose(response)
      } else {
        const response = await createCloudProviderCredential({
          organizationId,
          ...credentials,
        })
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  })

  const onDelete = async () => {
    if (currentCredential?.id) {
      try {
        await deleteCloudProviderCredential({
          organizationId,
          cloudProvider,
          credentialId: currentCredential.id,
        })
        onClose()
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <CreateEditCredentialsModal
        cloudProvider={cloudProvider}
        onSubmit={onSubmit}
        onClose={onClose}
        isEdit={!!currentCredential}
        onDelete={onDelete}
        loading={loading}
      />
    </FormProvider>
  )
}

export default CreateEditCredentialsModalFeature
