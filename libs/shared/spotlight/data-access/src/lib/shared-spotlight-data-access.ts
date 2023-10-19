import { createQueryKeys, type inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  ApplicationsApi,
  ContainersApi,
  DatabasesApi,
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

      for (const proj of projects) {
        suggestions.push({
          ...proj,
          suggestionType: 'PROJECT' as const,
        })
        environmentsApi.listEnvironment(proj.id).then(({ data: { results: environments = [] } }) => {
          for (const env of environments) {
            suggestions.push({
              ...env,
              suggestionType: 'ENVIRONMENT' as const,
              projectId: proj.id ?? '',
              projectName: proj.name,
            })
            applicationsApi.listApplication(env.id).then(({ data: { results: applications = [] } }) => {
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
            containersApi.listContainer(env.id).then(({ data: { results: containers = [] } }) => {
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
            databasesApi.listDatabase(env.id).then(({ data: { results: databases = [] } }) => {
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
            jobsApi.listJobs(env.id).then(({ data: { results: jobs = [] } }) => {
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

      return suggestions
    },
  }),
})

export const mutations = {}

export type SpotlightKeys = inferQueryKeys<typeof spotlight>
