import { CustomDomain } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  createCustomDomain,
  editCustomDomain,
  getCustomDomainsState,
  postApplicationActionsRestart,
} from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import CrudModal from '../../../ui/page-settings-domains/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  customDomain?: CustomDomain
  application?: ApplicationEntity
  onClose: () => void
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const methods = useForm({
    defaultValues: { domain: props.customDomain ? props.customDomain.domain : '' },
    mode: 'onChange',
  })
  const dispatch = useDispatch<AppDispatch>()
  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => getCustomDomainsState(state).loadingStatus)
  const { enableAlertClickOutside } = useModal()

  const toasterCallback = () => {
    if (props.application) {
      dispatch(
        postApplicationActionsRestart({
          applicationId: props.application.id,
          environmentId: props.application.environment?.id || '',
          serviceType: getServiceType(props.application),
        })
      )
    }
  }

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) return

    if (props.customDomain) {
      dispatch(
        editCustomDomain({
          applicationId: props.application.id,
          customDomain: props.customDomain,
          domain: data.domain,
          serviceType: getServiceType(props.application),
          toasterCallback,
        })
      )
        .unwrap()
        .then(() => props.onClose())
        .catch((e) => console.error(e))
    } else {
      dispatch(
        createCustomDomain({
          applicationId: props.application.id,
          domain: data.domain,
          serviceType: getServiceType(props.application),
          toasterCallback,
        })
      )
        .unwrap()
        .then(() => props.onClose())
        .catch((e) => console.error(e))
    }
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        customDomain={props.customDomain}
        onSubmit={onSubmit}
        onClose={props.onClose}
        loading={loadingStatus === 'loading'}
        isEdit={!!props.customDomain}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
