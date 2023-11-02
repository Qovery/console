import { useQueryClient } from '@tanstack/react-query'
import { type CustomDomain } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  createCustomDomain,
  editCustomDomain,
  fetchApplicationLinks,
  getCustomDomainsState,
  postApplicationActionsRedeploy,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { type ApplicationEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import CrudModal from '../../../ui/page-settings-domains/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  organizationId: string
  projectId: string
  customDomain?: CustomDomain
  application?: ApplicationEntity
  onClose: () => void
}

export function CrudModalFeature({
  organizationId,
  projectId,
  customDomain,
  application,
  onClose,
}: CrudModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      domain: customDomain ? customDomain.domain : '',
      generate_certificate: customDomain ? customDomain?.generate_certificate : true,
    },
    mode: 'onChange',
  })
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => getCustomDomainsState(state).loadingStatus)
  const { enableAlertClickOutside } = useModal()
  const queryClient = useQueryClient()

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId: application.id,
          environmentId: application.environment?.id || '',
          serviceType: getServiceType(application),
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, application?.environment?.id) +
                DEPLOYMENT_LOGS_URL(application?.id)
            ),
          queryClient,
        })
      )
    }
  }

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  const onSubmit = methods.handleSubmit((data) => {
    if (!application) return

    const serviceType = getServiceType(application)

    if (customDomain) {
      dispatch(
        editCustomDomain({
          applicationId: application.id,
          id: customDomain.id,
          data,
          serviceType,
          toasterCallback,
        })
      )
        .unwrap()
        .then(() => {
          dispatch(fetchApplicationLinks({ applicationId: application?.id || '' }))
          onClose()
        })
        .catch((e) => console.error(e))
    } else {
      dispatch(
        createCustomDomain({
          applicationId: application.id,
          serviceType,
          data,
          toasterCallback,
        })
      )
        .unwrap()
        .then(() => {
          dispatch(fetchApplicationLinks({ applicationId: application?.id || '' }))
          onClose()
        })
        .catch((e) => console.error(e))
    }
  })

  const defaultLink = useMemo(() => {
    const links = application?.links?.items
    const defaultLinkItem = links?.find((link) => link.is_qovery_domain && link.is_default)

    return defaultLinkItem?.url?.replace('https://', '') || ''
  }, [application?.links?.items])

  return (
    <FormProvider {...methods}>
      <CrudModal
        customDomain={customDomain}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loadingStatus === 'loading'}
        isEdit={!!customDomain}
        link={defaultLink}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
