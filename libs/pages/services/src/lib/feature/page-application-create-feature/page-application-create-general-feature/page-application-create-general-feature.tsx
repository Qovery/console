import { FormProvider, useForm } from 'react-hook-form'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@console/shared/ui'
import PageApplicationCreateGeneral from '../../../../../../application/src/lib/ui/page-application-create/page-application-create-general/page-application-create-general'
import { GlobalData } from '../interfaces.interface'

export function PageApplicationCreateGeneralFeature() {
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
  const methods = useForm<GlobalData>({
    defaultValues: {
      name: '',
      applicationSource: undefined,
      registry: '',
    },
    mode: 'all',
  })

  const onSubmit = methods.handleSubmit((data) => {})

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <PageApplicationCreateGeneral onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateGeneralFeature
