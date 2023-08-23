import { type inferQueryKeyStore, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { environments } from '@qovery/domains/environments/data-access'
import { services } from '@qovery/domains/services/data-access'
import { user } from '@qovery/domains/user/data-access'

export const queries = mergeQueryKeys(environments, services, user)

export type QueryKeys = inferQueryKeyStore<typeof queries>
