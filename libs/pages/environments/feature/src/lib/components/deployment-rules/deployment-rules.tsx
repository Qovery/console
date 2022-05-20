import { DeploymentRulesPage } from '@console/pages/environments/ui'
import { BaseLink } from '@console/shared/ui'

export function DeploymentRules() {
  const listHelpfulLinks: BaseLink[] = [{ link: '#', linkLabel: 'How to configure my application', external: true }]

  return <DeploymentRulesPage listHelpfulLinks={listHelpfulLinks} />
}

export default DeploymentRules
