import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationsApi,
  ContainersApi,
  DatabasesApi,
  EnvironmentsApi,
  JobsApi,
  ProjectsApi,
} from 'qovery-typescript-axios'

const projectsApi = new ProjectsApi()
const environmentsApi = new EnvironmentsApi()
const applicationsApi = new ApplicationsApi()
const containersApi = new ContainersApi()
const databasesApi = new DatabasesApi()
const jobsApi = new JobsApi()

function assertFulfilled<T>(item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> {
  return item.status === 'fulfilled'
}

export interface Suggestion {
  name: string
  id: string
  suggestionType: 'PROJECT' | 'ENVIRONMENT' | 'SERVICE'
  serviceType?: 'APPLICATION' | 'CONTAINER' | 'DATABASE' | 'JOB'
  environmentName?: string
  environmentId?: string
  projectName?: string
  projectId?: string
}

export const spotlight = createQueryKeys('spotlight', {
  suggestions: (organizationId: string) => ({
    queryKey: [organizationId],
    async queryFn() {
      const {
        data: { results: projects = [] },
      } = await projectsApi.listProject(organizationId)

      const projectsSuggestions = projects.map((entity) => ({
        ...entity,
        suggestionType: 'PROJECT' as const,
      }))

      const projectsPromises = projects.map(({ id, name }) =>
        environmentsApi.listEnvironment(id).then((response) => ({
          response,
          projectName: name,
        }))
      )
      const environmentsSuggestions = (await Promise.allSettled(projectsPromises))
        .filter(assertFulfilled)
        .flatMap(({ value: { response, projectName } }) =>
          response.data.results?.map((entity) => ({
            ...entity,
            projectName,
            projectId: entity.project?.id ?? '',
            suggestionType: 'ENVIRONMENT' as const,
          }))
        )

      const servicesPromises = async ({
        projectId,
        projectName,
        environmentId,
        environmentName,
      }: {
        projectId: string
        projectName: string
        environmentId: string
        environmentName: string
      }) => [
        ...((await applicationsApi.listApplication(environmentId)).data.results ?? []).map((entity) => ({
          name: entity.name ?? '',
          projectId,
          projectName,
          environmentId,
          environmentName,
          suggestionType: 'SERVICE' as const,
          serviceType: 'APPLICATION' as const,
        })),
        ...((await containersApi.listContainer(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          projectId,
          projectName,
          environmentId,
          environmentName,
          suggestionType: 'SERVICE' as const,
          serviceType: 'CONTAINER' as const,
        })),
        ...((await databasesApi.listDatabase(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          projectId,
          projectName,
          environmentId,
          environmentName,
          suggestionType: 'SERVICE' as const,
          serviceType: 'DATABASE' as const,
        })),
        ...((await jobsApi.listJobs(environmentId)).data.results ?? []).map((entity) => ({
          ...entity,
          projectId,
          projectName,
          environmentId,
          environmentName,
          suggestionType: 'SERVICE' as const,
          serviceType: 'JOB' as const,
        })),
      ]

      const environmentsPromises = environmentsSuggestions.map(
        (env) =>
          env &&
          servicesPromises({
            projectId: env.project?.id ?? '',
            environmentId: env.id,
            projectName: env.projectName,
            environmentName: env.name,
          })
      )
      const servicesSuggestions = (await Promise.allSettled(environmentsPromises))
        .filter(assertFulfilled)
        .flatMap(({ value }) => value)

      return [...projectsSuggestions, ...environmentsSuggestions, ...servicesSuggestions] as Suggestion[]
    },
  }),
})

export const mutations = {}

export type SpotlightKeys = inferQueryKeys<typeof spotlight>
