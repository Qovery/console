/**
 * Query keys for the prototype cost store.
 *
 * Kept local instead of joining `@qovery/state/util-queries` — none of this is
 * backed by the API, and it should be deletable in one folder.
 */
export const costQueryKeys = {
  projectCost: (projectId: string) => ['prototype-cost', 'project', projectId] as const,
  projectsCost: (projectIds: string[]) => ['prototype-cost', 'projects', ...projectIds] as const,
}
