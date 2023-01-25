// import {
//   CloneRequest,
//   CreateEnvironmentModeEnum,
//   CreateEnvironmentRequest,
//   EnvironmentModeEnum,
// } from 'qovery-typescript-axios'
// import { useState } from 'react'
import { AwsCredentialsRequest, CloudProviderEnum, ClusterCredentials } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { editCredentials, postCredentials } from '@qovery/domains/organization'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'
import CreateEditCredentialsModal from '../../ui/create-edit-credentials-modal/create-edit-credentials-modal'

// import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
// import { useModal } from '@qovery/shared/ui'
// import { AppDispatch, RootState } from '@qovery/store'

export interface CreateEditCredentialsModalFeatureProps {
  onClose: () => void
  cloudProvider: CloudProviderEnum
  organizationId: string
  currentCredential?: ClusterCredentials
}

export function CreateEditCredentialsModalFeature(props: CreateEditCredentialsModalFeatureProps) {
  const { cloudProvider, organizationId, onClose, currentCredential } = props
  const [loading, setLoading] = useState(false)

  const { enableAlertClickOutside } = useModal()

  // const clusters = useSelector<RootState, ClusterEntity[]>((state) =>
  //   selectClustersEntitiesByOrganizationId(state, props.organizationId)
  // )

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

    const aws: AwsCredentialsRequest = {
      name: data['name'],
      access_key_id: '',
      secret_access_key: '',
    }

    // is edit
    if (currentCredential) {
      dispatch(
        editCredentials({ cloudProvider, organizationId, credentialsId: currentCredential.id, credentials: aws })
      )
        .unwrap()
        .then(() => {
          setLoading(false)
          onClose()
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false))
    } else {
      dispatch(postCredentials({ cloudProvider, organizationId, credentials: aws }))
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
