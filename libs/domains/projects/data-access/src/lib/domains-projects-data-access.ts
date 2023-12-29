import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  ProjectDeploymentRuleApi,
  type ProjectDeploymentRuleRequest,
  type ProjectDeploymentRulesPriorityOrderRequest,
  ProjectMainCallsApi,
  type ProjectRequest,
  ProjectsApi,
} from 'qovery-typescript-axios'

const projectsApi = new ProjectsApi()
const projectMainCalls = new ProjectMainCallsApi()
const deploymentRulesApi = new ProjectDeploymentRuleApi()

export const projects = createQueryKeys('projects', {
  list: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      return (await projectsApi.listProject(organizationId)).data.results
    },
  }),
  listDeploymentRules: ({ projectId }: { projectId: string }) => ({
    queryKey: [projectId],
    async queryFn() {
      return (await deploymentRulesApi.listProjectDeploymentRules(projectId)).data.results
    },
  }),
  detailsDeploymentRule: ({ projectId, deploymentRuleId }: { projectId: string; deploymentRuleId: string }) => ({
    queryKey: [projectId, deploymentRuleId],
    async queryFn() {
      return (await deploymentRulesApi.getProjectDeploymentRule(projectId, deploymentRuleId)).data
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
  async createDeploymentRule({
    projectId,
    deploymentRuleRequest,
  }: {
    projectId: string
    deploymentRuleRequest: ProjectDeploymentRuleRequest
  }) {
    return (await deploymentRulesApi.createDeploymentRule(projectId, deploymentRuleRequest)).data
  },
  async editDeploymentRule({
    projectId,
    deploymentRuleId,
    deploymentRuleRequest,
  }: {
    projectId: string
    deploymentRuleId: string
    deploymentRuleRequest: ProjectDeploymentRuleRequest
  }) {
    return (await deploymentRulesApi.editProjectDeployemtnRule(projectId, deploymentRuleId, deploymentRuleRequest)).data
  },
  async deleteDeploymentRule({ projectId, deploymentRuleId }: { projectId: string; deploymentRuleId: string }) {
    return (await deploymentRulesApi.deleteProjectDeploymentRule(projectId, deploymentRuleId)).data
  },
  async editDeploymentRulesPriorityOrder({
    projectId,
    deploymentRulesPriorityOrderRequest,
  }: {
    projectId: string
    deploymentRulesPriorityOrderRequest: ProjectDeploymentRulesPriorityOrderRequest
  }) {
    return (await deploymentRulesApi.updateDeploymentRulesPriorityOrder(projectId, deploymentRulesPriorityOrderRequest))
      .data
  },
}
