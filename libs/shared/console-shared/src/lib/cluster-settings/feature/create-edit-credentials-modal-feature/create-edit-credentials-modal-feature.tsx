import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import {
  useCreateCloudProviderCredential,
  useDeleteCloudProviderCredential,
  useEditCloudProviderCredential,
} from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import CreateEditCredentialsModal from '../../ui/create-edit-credentials-modal/create-edit-credentials-modal'

export interface CreateEditCredentialsModalFeatureProps {
  onClose: () => void
  cloudProvider: CloudProviderEnum
  organizationId: string
  currentCredential?: ClusterCredentials
}

export const handleSubmit = (data: FieldValues, cloudProvider: CloudProviderEnum) => {
  const currentData = {
    name: data['name'],
  }

  if (cloudProvider === CloudProviderEnum.AWS) {
    return {
      ...currentData,
      access_key_id: data['access_key_id'],
      secret_access_key: data['secret_access_key'],
    }
  }

  if (cloudProvider === CloudProviderEnum.SCW) {
    return {
      ...currentData,
      scaleway_access_key: data['scaleway_access_key'],
      scaleway_secret_key: data['scaleway_secret_key'],
      scaleway_project_id: data['scaleway_project_id'],
    }
  }

  return currentData
}

export function CreateEditCredentialsModalFeature(props: CreateEditCredentialsModalFeatureProps) {
  const { cloudProvider, onClose, currentCredential, organizationId } = props
  const [loading, setLoading] = useState(false)

  const { enableAlertClickOutside } = useModal()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: currentCredential?.name || '',
    },
  })

  const { mutateAsync: createCloudProviderCredential } = useCreateCloudProviderCredential({
    organizationId,
    cloudProvider,
  })
  const { mutateAsync: editCloudProviderCredential } = useEditCloudProviderCredential({
    organizationId,
    cloudProvider,
  })
  const { mutateAsync: deleteCloudProviderCredential } = useDeleteCloudProviderCredential({
    organizationId,
    cloudProvider,
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    const credentials = handleSubmit(data, cloudProvider)

    try {
      if (currentCredential) {
        await editCloudProviderCredential({
          organizationId,
          cloudProvider,
          credentialId: currentCredential.id,
          credentialRequest: credentials,
        })
        onClose()
      } else {
        await createCloudProviderCredential({
          organizationId,
          cloudProvider,
          credentialRequest: credentials,
        })
        onClose()
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
