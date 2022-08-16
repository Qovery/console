import { CustomDomain } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { createCustomDomain, editCustomDomain, getCustomDomainsState } from '@console/domains/application'
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

  const onSubmit = methods.handleSubmit((data) => {
    if (!props.application) return

    if (props.customDomain) {
      dispatch(
        editCustomDomain({ applicationId: props.application.id, customDomain: props.customDomain, domain: data.domain })
      )
        .unwrap()
        .then(() => props.onClose())
        .catch((e) => console.error(e))
    } else {
      dispatch(createCustomDomain({ applicationId: props.application.id, domain: data.domain }))
        .unwrap()
        .then(() => props.onClose())
        .catch((e) => console.error(e))
    }
  })

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={props.onClose} loading={loadingStatus === 'loading'} />
    </FormProvider>
  )
}

export default CrudModalFeature
