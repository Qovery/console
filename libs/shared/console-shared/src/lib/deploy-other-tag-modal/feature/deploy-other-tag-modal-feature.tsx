import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { postApplicationActionsDeployByTag, selectApplicationById } from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import DeployOtherTagModal from '../ui/deploy-other-tag-modal'

export interface DeployOtherTagModalFeatureProps {
  applicationId: string
  environmentId: string
}

export function DeployOtherTagModalFeature(props: DeployOtherTagModalFeatureProps) {
  const { applicationId, environmentId } = props
  const methods = useForm<{ tag: string }>({ mode: 'onChange', defaultValues: { tag: '' } })
  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )
  const dispatch = useDispatch<AppDispatch>()
  const [deployLoading, setDeployLoading] = useState(false)
  const { closeModal } = useModal()

  const onSubmit = methods.handleSubmit((data) => {
    if (application) {
      setDeployLoading(true)
      dispatch(
        postApplicationActionsDeployByTag({
          applicationId,
          tag: data.tag,
          environmentId: environmentId,
          serviceType: getServiceType(application),
        })
      ).then(() => {
        closeModal()
        setDeployLoading(false)
      })
    }
  })

  return (
    <FormProvider {...methods}>
      <DeployOtherTagModal onSubmit={onSubmit} isLoading={deployLoading} serviceName={application?.name} />
    </FormProvider>
  )
}

export default DeployOtherTagModalFeature
