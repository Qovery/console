import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationsApi,
  ContainersApi,
  DatabasesApi,
  type EnvironmentModeEnum,
  EnvironmentsApi,
  JobsApi,
  ProjectsApi,
} from 'qovery-typescript-axios'
import { isCronJob } from '@qovery/shared/enums'

const projectsApi = new ProjectsApi()
const environmentsApi = new EnvironmentsApi()
const applicationsApi = new ApplicationsApi()
const containersApi = new ContainersApi()
const databasesApi = new DatabasesApi()
const jobsApi = new JobsApi()

export interface Suggestion {
  name: string
  id: string
  suggestionType: 'PROJECT' | 'ENVIRONMENT' | 'SERVICE'
  serviceType?: 'APPLICATION' | 'CONTAINER' | 'DATABASE' | 'CRON_JOB' | 'LIFECYCLE_JOB'
  environmentName?: string
  environmentId?: string
  environmentMode?: keyof typeof EnvironmentModeEnum
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

      const suggestions: Suggestion[] = []
      const promises: Promise<unknown>[] = []

      for (const proj of projects) {
        suggestions.push({
          ...proj,
          suggestionType: 'PROJECT' as const,
        })

        const listEnvironmentPromises = environmentsApi.listEnvironment(proj.id)
        promises.push(listEnvironmentPromises)

        listEnvironmentPromises.then(({ data: { results: environments = [] } }) => {
          for (const env of environments) {
            suggestions.push({
              ...env,
              suggestionType: 'ENVIRONMENT' as const,
              projectId: proj.id ?? '',
              projectName: proj.name,
              environmentMode: env.mode,
            })

            const listApplicationPromises = applicationsApi.listApplication(env.id)
            promises.push(listApplicationPromises)

            listApplicationPromises.then(({ data: { results: applications = [] } }) => {
              for (const app of applications) {
                suggestions.push({
                  ...app,
                  name: app.name ?? '',
                  projectId: proj.id,
                  projectName: proj.name,
                  environmentId: env.id,
                  environmentName: env.name,
                  suggestionType: 'SERVICE' as const,
                  serviceType: 'APPLICATION' as const,
                })
              }
            })

            const listContainerPromises = containersApi.listContainer(env.id)
            promises.push(listContainerPromises)

            listContainerPromises.then(({ data: { results: containers = [] } }) => {
              for (const container of containers) {
                suggestions.push({
                  ...container,
                  projectId: proj.id,
                  projectName: proj.name,
                  environmentId: env.id,
                  environmentName: env.name,
                  suggestionType: 'SERVICE' as const,
                  serviceType: 'APPLICATION' as const,
                })
              }
            })

            const listDatabase = databasesApi.listDatabase(env.id)
            promises.push(listDatabase)

            listDatabase.then(({ data: { results: databases = [] } }) => {
              for (const database of databases) {
                suggestions.push({
                  ...database,
                  projectId: proj.id,
                  projectName: proj.name,
                  environmentId: env.id,
                  environmentName: env.name,
                  suggestionType: 'SERVICE' as const,
                  serviceType: 'DATABASE' as const,
                })
              }
            })

            const listJobs = jobsApi.listJobs(env.id)
            promises.push(listJobs)

            listJobs.then(({ data: { results: jobs = [] } }) => {
              for (const job of jobs) {
                suggestions.push({
                  ...job,
                  projectId: proj.id,
                  projectName: proj.name,
                  environmentId: env.id,
                  environmentName: env.name,
                  suggestionType: 'SERVICE' as const,
                  serviceType: isCronJob(proj) ? 'CRON_JOB' : ('LIFECYCLE_JOB' as const),
                })
              }
            })
          }
        })
      }

      for (const p of promises) {
        await p
      }

      return suggestions
    },
  }),
})

export const mutations = {}

export type SpotlightKeys = inferQueryKeys<typeof spotlight>
