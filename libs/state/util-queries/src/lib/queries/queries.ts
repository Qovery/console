import { type inferQueryKeyStore, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { services } from '@qovery/domains/services/data-access'

export const queries = mergeQueryKeys(services)

export type QueryKeys = inferQueryKeyStore<typeof queries>
