import { FunnelFlowBody, FunnelFlowHelpCard } from '@console/shared/ui'
import PageApplicationCreateGeneral from '../../../../../../application/src/lib/ui/page-application-create/page-application-create-general/page-application-create-general'

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

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <PageApplicationCreateGeneral />
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateGeneralFeature
