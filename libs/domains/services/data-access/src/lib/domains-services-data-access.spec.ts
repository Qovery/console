import { ApplicationBuildAnalysisApi, DatabaseTypeEnum, JobBuildAnalysisApi } from 'qovery-typescript-axios'
import {
  type Database,
  type Terraform,
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

  it('identifies Terraform services', () => {
    expect(isTerraform(terraform)).toBe(true)
    expect(isTerraform(postgresql)).toBe(false)
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
      services.buildAnalysis({ serviceId: 'service-1', serviceType: 'APPLICATION' }).queryFn({} as never)
    ).resolves.toBe(state)
    expect(getAnalysis).toHaveBeenCalledWith('service-1')
  })

  it('reads the build analysis of a job', async () => {
    const getAnalysis = jest
      .spyOn(JobBuildAnalysisApi.prototype, 'getJobBuildAnalysis')
      .mockReturnValue(response(state))

    await expect(services.buildAnalysis({ serviceId: 'job-1', serviceType: 'JOB' }).queryFn({} as never)).resolves.toBe(
      state
    )
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
