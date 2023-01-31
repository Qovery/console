import { CloudProviderEnum, ClusterCredentials } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { editCredentials, postCredentials } from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'
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

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    const credentials = handleSubmit(data, cloudProvider)

    if (currentCredential) {
      dispatch(
        editCredentials({
          cloudProvider,
          organizationId,
          credentialsId: currentCredential.id,
          credentials,
        })
      )
        .unwrap()
        .then(() => {
          setLoading(false)
          onClose()
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false))
    } else {
      dispatch(postCredentials({ cloudProvider, organizationId, credentials }))
        .unwrap()
        .then(() => {
          setLoading(false)
          onClose()
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <CreateEditCredentialsModal
        cloudProvider={cloudProvider}
        onSubmit={onSubmit}
        onClose={onClose}
        isEdit={!!currentCredential}
        loading={loading}
      />
    </FormProvider>
  )
}

export default CreateEditCredentialsModalFeature
