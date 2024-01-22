import { type inferQueryKeyStore, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { cloudProviders } from '@qovery/domains/cloud-providers/data-access'
import { clusters } from '@qovery/domains/clusters/data-access'
import { customDomains } from '@qovery/domains/custom-domains/data-access'
import { environments } from '@qovery/domains/environments/data-access'
import { organizations } from '@qovery/domains/organizations/data-access'
import { projects } from '@qovery/domains/projects/data-access'
import { serviceHelm } from '@qovery/domains/service-helm/data-access'
import { services } from '@qovery/domains/services/data-access'
import { usersSignUp } from '@qovery/domains/users-sign-up/data-access'
import { variables } from '@qovery/domains/variables/data-access'
import { user } from '@qovery/shared/iam/data-access'

export const queries = mergeQueryKeys(
  cloudProviders,
  clusters,
  environments,
  organizations,
  projects,
  serviceHelm,
  services,
  user,
  usersSignUp,
  variables,
  customDomains
)

export type QueryKeys = inferQueryKeyStore<typeof queries>
