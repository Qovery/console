import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { postApplicationActionsDeployByTag, selectApplicationById } from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import DeployOtherTagModal from '../ui/deploy-other-tag-modal'

export interface DeployOtherTagModalFeatureProps {
  organizationId: string
  projectId: string
  environmentId: string
  applicationId: string
}

export function DeployOtherTagModalFeature({
  organizationId,
  projectId,
  environmentId,
  applicationId,
}: DeployOtherTagModalFeatureProps) {
  const methods = useForm<{ tag: string }>({ mode: 'onChange', defaultValues: { tag: '' } })
  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
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
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
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
