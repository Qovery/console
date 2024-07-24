import { type CustomDomain, type CustomDomainRequest } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateCustomDomain, useEditCustomDomain } from '@qovery/domains/custom-domains/feature'
import { type Application, type Container, type Helm } from '@qovery/domains/services/data-access'
import { useLinks } from '@qovery/domains/services/feature'
import { useModal } from '@qovery/shared/ui'
import CrudModal from '../../../ui/page-settings-domains/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  service: Application | Container | Helm
  customDomain?: CustomDomain
  onClose: () => void
}

export function CrudModalFeature({ customDomain, service, onClose }: CrudModalFeatureProps) {
  const methods = useForm<CustomDomainRequest>({
    defaultValues: {
      domain: customDomain ? customDomain.domain : '',
      generate_certificate: customDomain ? customDomain?.generate_certificate : true,
      use_cdn: false,
    },
    mode: 'onChange',
  })
  const { mutateAsync: editCustomDomain, isLoading: isLoadingEditCustomDomain } = useEditCustomDomain({
    environmentId: service.environment.id,
  })
  const { mutateAsync: createCustomDomain, isLoading: isLoadingCreateCustomDomain } = useCreateCustomDomain({
    environmentId: service.environment.id,
  })

  const { enableAlertClickOutside } = useModal()

  const { data: links = [] } = useLinks({
    serviceId: service.id,
    serviceType: service.serviceType,
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (customDomain) {
        await editCustomDomain({
          serviceId: service.id,
          serviceType: service.serviceType,
          customDomainId: customDomain.id,
          payload: data,
        })
      } else {
        await createCustomDomain({
          serviceId: service.id,
          serviceType: service.serviceType,
          payload: data,
        })
      }
      onClose()
    } catch (error) {
      console.error(error)
    }
  })

  const defaultLink = useMemo(() => {
    const defaultLinkItem = links?.find((link) => link.is_qovery_domain && link.is_default)

    return defaultLinkItem?.url?.replace('https://', '') || ''
  }, [links])

  return (
    <FormProvider {...methods}>
      <CrudModal
        customDomain={customDomain}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={isLoadingEditCustomDomain || isLoadingCreateCustomDomain}
        isEdit={!!customDomain}
        link={defaultLink}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
