import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import { fetchContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_RESOURCES_URL, SERVICES_URL } from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageApplicationCreateGeneral from '../../../ui/page-application-create/page-application-create-general/page-application-create-general'
import { GeneralData } from '../application-creation-flow.interface'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationCreateGeneralFeature() {
  const { setGeneralData, generalData, setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const dispatch = useDispatch<AppDispatch>()
  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Step 1 is cool"
      items={['because it smells good', 'and we do it with love']}
      helpSectionProps={{
        description: 'This is a description',
        links: [{ link: '#', linkLabel: 'link', external: true }],
      }}
    />
  )
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<GeneralData>({
    defaultValues: generalData,
    mode: 'onChange',
  })

  const watchServiceType = methods.watch('serviceType')

  useEffect(() => {
    if (watchServiceType === ServiceTypeEnum.CONTAINER) {
      dispatch(fetchContainerRegistries({ organizationId }))
    }
  }, [watchServiceType, dispatch])

  const onSubmit = methods.handleSubmit((data) => {
    setGeneralData(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <PageApplicationCreateGeneral organization={organization} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateGeneralFeature
