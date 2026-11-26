import {
  ApplicationBuildAnalysisApi,
  ApplicationDeploymentRestrictionApi,
  DatabaseTypeEnum,
  DeploymentRestrictionModeEnum,
  DeploymentRestrictionTypeEnum,
  JobBuildAnalysisApi,
  ServiceMainCallsApi,
} from 'qovery-typescript-axios'
import {
  type Container,
  type Database,
  type Terraform,
  isGitContainer,
  isServiceMYSQL,
  isServicePostgreSQL,
  isTerraform,
  mutations,
  services,
} from './domains-services-data-access'

describe('service type guards', () => {
  // Shared factories depend on this library, so these fixtures contain only the fields read by the guards.
  const postgresql = { service_type: 'DATABASE', type: DatabaseTypeEnum.POSTGRESQL } as Database
  const mysql = { ...postgresql, type: DatabaseTypeEnum.MYSQL }
  const terraform = { service_type: 'TERRAFORM' } as Terraform
  const imageContainer = { service_type: 'CONTAINER', source: { image: {} } } as Container
  const gitContainer = { service_type: 'CONTAINER', source: { git_repository: {} } } as Container

  it('identifies Terraform services', () => {
    expect(isTerraform(terraform)).toBe(true)
    expect(isTerraform(postgresql)).toBe(false)
  })

  it('identifies containers built from a Git repository only', () => {
    expect(isGitContainer(gitContainer)).toBe(true)
    expect(isGitContainer(imageContainer)).toBe(false)
    expect(isGitContainer(terraform)).toBe(false)
  })

  it('identifies PostgreSQL databases only', () => {
    expect(isServicePostgreSQL(postgresql)).toBe(true)
    expect(isServicePostgreSQL(mysql)).toBe(false)
    expect(isServicePostgreSQL(terraform)).toBe(false)
  })

  it('identifies MySQL databases only', () => {
    expect(isServiceMYSQL(mysql)).toBe(true)
    expect(isServiceMYSQL(postgresql)).toBe(false)
    expect(isServiceMYSQL(terraform)).toBe(false)
  })
})

describe('build analysis', () => {
  const state = { latest_build_execution_id: 'exec-1', analysis: null }
  const analysis = { service_id: 'service-1', execution_id: 'exec-1', status: 'PENDING' }
  // Only the response data is read
  const response = <T>(data: T) => Promise.resolve({ data }) as never

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('reads the build analysis of an application', async () => {
    const getAnalysis = jest
      .spyOn(ApplicationBuildAnalysisApi.prototype, 'getApplicationBuildAnalysis')
      .mockReturnValue(response(state))

    await expect(
      services
        .buildAnalysis({ serviceId: 'service-1', serviceType: 'APPLICATION', executionId: 'exec-1' })
        .queryFn({} as never)
    ).resolves.toBe(state)
    expect(getAnalysis).toHaveBeenCalledWith('service-1')
  })

  it('reads the build analysis of a job', async () => {
    const getAnalysis = jest
      .spyOn(JobBuildAnalysisApi.prototype, 'getJobBuildAnalysis')
      .mockReturnValue(response(state))

    await expect(
      services.buildAnalysis({ serviceId: 'job-1', serviceType: 'JOB', executionId: 'exec-1' }).queryFn({} as never)
    ).resolves.toBe(state)
    expect(getAnalysis).toHaveBeenCalledWith('job-1')
  })

  it('starts the analysis of the given build of an application', async () => {
    const startAnalysis = jest
      .spyOn(ApplicationBuildAnalysisApi.prototype, 'startApplicationBuildAnalysis')
      .mockReturnValue(response(analysis))

    await expect(
      mutations.startBuildAnalysis({ serviceId: 'service-1', serviceType: 'APPLICATION', executionId: 'exec-1' })
    ).resolves.toBe(analysis)
    expect(startAnalysis).toHaveBeenCalledWith('service-1', { execution_id: 'exec-1' })
  })

  it('starts the analysis of the given build of a job', async () => {
    const startAnalysis = jest
      .spyOn(JobBuildAnalysisApi.prototype, 'startJobBuildAnalysis')
      .mockReturnValue(response(analysis))

    await expect(
      mutations.startBuildAnalysis({ serviceId: 'job-1', serviceType: 'JOB', executionId: 'exec-1' })
    ).resolves.toBe(analysis)
    expect(startAnalysis).toHaveBeenCalledWith('job-1', { execution_id: 'exec-1' })
  })
})

describe('deployment restrictions', () => {
  const restriction = {
    id: 'restriction-1',
    created_at: '2026-11-25T00:00:00Z',
    mode: DeploymentRestrictionModeEnum.EXCLUDE,
    type: DeploymentRestrictionTypeEnum.PATH,
    value: 'docs/',
  }
  const payload = { mode: restriction.mode, type: restriction.type, value: restriction.value }
  const response = <T>(data: T) => Promise.resolve({ data }) as never

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('lists the restrictions of a container from the service endpoint', async () => {
    const listRestrictions = jest
      .spyOn(ServiceMainCallsApi.prototype, 'listServiceDeploymentRestrictions')
      .mockReturnValue(response({ results: [restriction] }))

    await expect(
      services.deploymentRestrictions({ serviceId: 'container-1', serviceType: 'CONTAINER' }).queryFn({} as never)
    ).resolves.toEqual([restriction])
    expect(listRestrictions).toHaveBeenCalledWith('container-1')
  })

  it('creates a restriction of a container from the service endpoint', async () => {
    const createRestriction = jest
      .spyOn(ServiceMainCallsApi.prototype, 'createServiceDeploymentRestriction')
      .mockReturnValue(response(restriction))

    await expect(
      mutations.createDeploymentRestriction({ serviceId: 'container-1', serviceType: 'CONTAINER', payload })
    ).resolves.toBe(restriction)
    expect(createRestriction).toHaveBeenCalledWith('container-1', payload)
  })

  it('edits a restriction of a container from the service endpoint', async () => {
    const editRestriction = jest
      .spyOn(ServiceMainCallsApi.prototype, 'editServiceDeploymentRestriction')
      .mockReturnValue(response(restriction))

    await expect(
      mutations.editDeploymentRestriction({
        serviceId: 'container-1',
        serviceType: 'CONTAINER',
        deploymentRestrictionId: 'restriction-1',
        payload,
      })
    ).resolves.toBe(restriction)
    expect(editRestriction).toHaveBeenCalledWith('container-1', 'restriction-1', payload)
  })

  it('deletes a restriction of a container from the service endpoint', async () => {
    const deleteRestriction = jest
      .spyOn(ServiceMainCallsApi.prototype, 'deleteServiceDeploymentRestriction')
      .mockReturnValue(response(undefined))

    await mutations.deleteDeploymentRestriction({
      serviceId: 'container-1',
      serviceType: 'CONTAINER',
      deploymentRestrictionId: 'restriction-1',
    })
    expect(deleteRestriction).toHaveBeenCalledWith('container-1', 'restriction-1')
  })

  it('keeps listing the restrictions of an application from the application endpoint', async () => {
    const listRestrictions = jest
      .spyOn(ApplicationDeploymentRestrictionApi.prototype, 'getApplicationDeploymentRestrictions')
      .mockReturnValue(response({ results: [restriction] }))

    await expect(
      services.deploymentRestrictions({ serviceId: 'application-1', serviceType: 'APPLICATION' }).queryFn({} as never)
    ).resolves.toEqual([restriction])
    expect(listRestrictions).toHaveBeenCalledWith('application-1')
  })
})
