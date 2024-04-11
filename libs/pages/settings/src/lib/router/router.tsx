import {
  type Route,
  SETTINGS_API_URL,
  SETTINGS_BILLING_SUMMARY_URL,
  SETTINGS_BILLING_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_DANGER_ZONE_URL,
  SETTINGS_GENERAL_URL,
  SETTINGS_GIT_REPOSITORY_ACCESS_URL,
  SETTINGS_HELM_REPOSITORIES_URL,
  SETTINGS_LABELS_ANNOTATIONS_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_PROJECT_DANGER_ZONE_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_ROLES_EDIT_URL,
  SETTINGS_ROLES_URL,
  SETTINGS_WEBHOOKS,
} from '@qovery/shared/routes'
import PageOrganizationApiFeature from '../feature/page-organization-api-feature/page-organization-api-feature'
import PageOrganizationBillingFeature from '../feature/page-organization-billing-feature/page-organization-billing-feature'
import PageOrganizationBillingSummaryFeature from '../feature/page-organization-billing-summary-feature/page-organization-billing-summary-feature'
import { PageOrganizationContainerRegistriesFeature } from '../feature/page-organization-container-registries-feature/page-organization-container-registries-feature'
import { PageOrganizationDangerZoneFeature } from '../feature/page-organization-danger-zone-feature/page-organization-danger-zone-feature'
import { PageOrganizationGeneralFeature } from '../feature/page-organization-general-feature/page-organization-general-feature'
import { PageOrganizationGithubRepositoryAccessFeature } from '../feature/page-organization-github-repository-access-feature/page-organization-github-repository-access-feature'
import { PageOrganizationHelmRepositoriesFeature } from '../feature/page-organization-helm-repositories-feature/page-organization-helm-repositories-feature'
import { PageOrganizationLabelsAnnotationsFeature } from '../feature/page-organization-labels-annotations-feature/page-organization-labels-annotations-feature'
import { PageOrganizationMembersFeature } from '../feature/page-organization-members-feature/page-organization-members-feature'
import { PageOrganizationRolesEditFeature } from '../feature/page-organization-roles-edit-feature/page-organization-roles-edit-feature'
import { PageOrganizationRolesFeature } from '../feature/page-organization-roles-feature/page-organization-roles-feature'
import { PageOrganizationWebhooksFeature } from '../feature/page-organization-webhooks-feature/page-organization-webhooks-feature'
import { PageProjectDangerZoneFeature } from '../feature/page-project-danger-zone-feature/page-project-danger-zone-feature'
import { PageProjectGeneralFeature } from '../feature/page-project-general-feature/page-project-general-feature'

export const ROUTER_SETTINGS: Route[] = [
  {
    path: SETTINGS_GENERAL_URL,
    component: <PageOrganizationGeneralFeature />,
  },
  {
    path: SETTINGS_MEMBERS_URL,
    component: <PageOrganizationMembersFeature />,
  },
  {
    path: SETTINGS_ROLES_URL,
    component: <PageOrganizationRolesFeature />,
  },
  {
    path: SETTINGS_ROLES_EDIT_URL(),
    component: <PageOrganizationRolesEditFeature />,
  },
  {
    path: SETTINGS_WEBHOOKS,
    component: <PageOrganizationWebhooksFeature />,
  },
  {
    path: SETTINGS_BILLING_SUMMARY_URL,
    component: <PageOrganizationBillingSummaryFeature />,
  },
  {
    path: SETTINGS_BILLING_URL,
    component: <PageOrganizationBillingFeature />,
  },
  {
    path: SETTINGS_CONTAINER_REGISTRIES_URL,
    component: <PageOrganizationContainerRegistriesFeature />,
  },
  {
    path: SETTINGS_LABELS_ANNOTATIONS_URL,
    component: <PageOrganizationLabelsAnnotationsFeature />,
  },
  {
    path: SETTINGS_HELM_REPOSITORIES_URL,
    component: <PageOrganizationHelmRepositoriesFeature />,
  },
  {
    path: SETTINGS_API_URL,
    component: <PageOrganizationApiFeature />,
  },
  {
    path: SETTINGS_GIT_REPOSITORY_ACCESS_URL,
    component: <PageOrganizationGithubRepositoryAccessFeature />,
  },
  {
    path: SETTINGS_DANGER_ZONE_URL,
    component: <PageOrganizationDangerZoneFeature />,
  },
  {
    path: SETTINGS_PROJECT_URL() + SETTINGS_PROJECT_GENERAL_URL,
    component: <PageProjectGeneralFeature />,
  },
  {
    path: SETTINGS_PROJECT_URL() + SETTINGS_PROJECT_DANGER_ZONE_URL,
    component: <PageProjectDangerZoneFeature />,
  },
]
