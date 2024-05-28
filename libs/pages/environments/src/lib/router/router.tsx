import {
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_VARIABLES_URL,
  type Route,
} from '@qovery/shared/routes'
import PageCreateDeploymentRuleFeature from '../feature/page-create-deployment-rule-feature/page-create-deployment-rule-feature'
import PageDeploymentRulesFeature from '../feature/page-deployment-rules-feature/page-deployment-rules-feature'
import PageEditDeploymentRuleFeature from '../feature/page-edit-deployment-rule-feature/page-edit-deployment-rule-feature'
import PageGeneralFeature from '../feature/page-general-feature/page-general-feature'
import { PageVariablesFeature } from '../feature/page-variables-feature/page-variables-feature'
import Container from '../ui/container/container'

export const ROUTER_ENVIRONMENTS: Route[] = [
  {
    path: ENVIRONMENTS_GENERAL_URL,
    component: (
      <Container>
        <PageGeneralFeature />
      </Container>
    ),
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_URL,
    component: (
      <Container>
        <PageDeploymentRulesFeature />
      </Container>
    ),
  },
  {
    path: ENVIRONMENTS_VARIABLES_URL,
    component: (
      <Container>
        <PageVariablesFeature />
      </Container>
    ),
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
    component: (
      <Container>
        <PageCreateDeploymentRuleFeature />
      </Container>
    ),
  },
  {
    path: ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL(),
    component: (
      <Container>
        <PageEditDeploymentRuleFeature />
      </Container>
    ),
  },
]
