import { FunnelFlowBody, FunnelFlowHelpCard } from '@console/shared/ui'

export function PageApplicationCreateGeneralFeature() {
  //todo explode this in feature

  const funnelCardHelp = (
    <FunnelFlowHelpCard title="Step 1 is cool" items={['because it smells good', 'and we do it with love']} />
  )

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <p>Welcome to PageApplicationCreateGeneralFeature!</p>
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateGeneralFeature
