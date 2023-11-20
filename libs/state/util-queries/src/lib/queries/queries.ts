import { type inferQueryKeyStore, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { environments } from '@qovery/domains/environments/data-access'
import { organizations } from '@qovery/domains/organizations/data-access'
import { projects } from '@qovery/domains/projects/data-access'
import { services } from '@qovery/domains/services/data-access'
import { variables } from '@qovery/domains/variables/data-access'
import { user } from '@qovery/shared/iam/data-access'

export const queries = mergeQueryKeys(environments, services, user, organizations, projects, variables)

export type QueryKeys = inferQueryKeyStore<typeof queries>
