import { type CustomDomain } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { type AnyService, type Application, type Container } from '@qovery/domains/services/data-access'
import { useCreateCustomDomain, useEditCustomDomain, useLinks } from '@qovery/domains/services/feature'
import { useModal } from '@qovery/shared/ui'
import CrudModal from '../../../ui/page-settings-domains/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  service: Extract<AnyService, Application | Container>
  customDomain?: CustomDomain
  onClose: () => void
}

export function CrudModalFeature({ customDomain, service, onClose }: CrudModalFeatureProps) {
  const methods = useForm({
    defaultValues: {
      domain: customDomain ? customDomain.domain : '',
      generate_certificate: customDomain ? customDomain?.generate_certificate : true,
    },
    mode: 'onChange',
  })
  const { mutateAsync: editCustomDomain, isLoading: isLoadingEditCustomDomain } = useEditCustomDomain({
    environmentId: service?.environment.id ?? '',
  })
  const { mutateAsync: createCustomDomain, isLoading: isLoadingCreateCustomDomain } = useCreateCustomDomain({
    environmentId: service?.environment.id ?? '',
  })

  const { enableAlertClickOutside } = useModal()

  const { data: links = [] } = useLinks({
    serviceId: service?.id ?? '',
    serviceType: service?.serviceType,
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (service?.serviceType !== ('APPLICATION' || 'CONTAINER')) return

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
