import { CustomDomain } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  createCustomDomain,
  editCustomDomain,
  getCustomDomainsState,
  postApplicationActionsRestart,
} from '@console/domains/application'
import { getServiceType } from '@console/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
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

  const toasterCallback = () => {
    dispatch(
      postApplicationActionsRestart({
        applicationId: props.application?.id || '',
        environmentId: props.application?.environment?.id || '',
      })
    )
  }

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
