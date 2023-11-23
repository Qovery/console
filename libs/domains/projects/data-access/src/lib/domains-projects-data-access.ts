import { createQueryKeys } from '@lukemorales/query-key-factory'
import { ProjectMainCallsApi, type ProjectRequest, ProjectsApi } from 'qovery-typescript-axios'

const projectsApi = new ProjectsApi()
const projectMainCalls = new ProjectMainCallsApi()

export const projects = createQueryKeys('projects', {
  list: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      return (await projectsApi.listProject(organizationId)).data.results
    },
  }),
})

export const mutations = {
  async createProject({ organizationId, projectRequest }: { organizationId: string; projectRequest: ProjectRequest }) {
    return (await projectsApi.createProject(organizationId, projectRequest)).data
  },
  async editProject({ projectId, projectRequest }: { projectId: string; projectRequest: ProjectRequest }) {
    return (await projectMainCalls.editProject(projectId, projectRequest)).data
  },
  async deleteProject({ projectId }: { projectId: string; organizationId: string }) {
    // NOTE: organizationId is for invalidateQueries
    return (await projectMainCalls.deleteProject(projectId)).data
  },
}
