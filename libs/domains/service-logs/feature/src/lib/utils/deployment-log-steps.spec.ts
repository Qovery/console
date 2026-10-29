import { type EnvironmentLogs, type ServiceStepMetric } from 'qovery-typescript-axios'
import {
  filterDeploymentLogPhases,
  formatDeploymentLogDuration,
  getDeploymentLogLineStep,
  getDeploymentLogPhaseLabel,
  getDeploymentLogPhases,
  getDeploymentLogStepLabel,
  getDeploymentLogUngroupedStepLabel,
  getSlowestDeploymentLogStepName,
  groupDeploymentLogsByStep,
} from './deployment-log-steps'

const NOW_MS = Date.parse('2026-10-26T08:40:00Z')

function createLog(message: string, stageStep: string, stepName?: string): EnvironmentLogs {
  return {
    type: 'info',
    timestamp: '2026-10-26T08:38:30Z',
    details: { stage: { step: stageStep }, step_name: stepName },
    message: { safe_message: message },
  }
}

describe('getDeploymentLogLineStep', () => {
  it('uses the step name of the line', () => {
    expect(getDeploymentLogLineStep(createLog('Cloning', 'Build', 'GIT_CLONE'))).toEqual({
      phase: 'BUILD',
      name: 'GIT_CLONE',
    })
    expect(getDeploymentLogLineStep(createLog('Checking', 'PreCheck', 'CLOUD_CREDENTIALS_CHECK'))).toEqual({
      phase: 'PRE_CHECK',
      name: 'CLOUD_CREDENTIALS_CHECK',
    })
  })

  it('tells the build queue from the deployment queue with the stage', () => {
    expect(getDeploymentLogLineStep(createLog('Queued', 'Build', 'QUEUEING')).name).toBe('BUILD_QUEUEING')
    expect(getDeploymentLogLineStep(createLog('Queued', 'Deploy', 'QUEUEING')).name).toBe('DEPLOYMENT_QUEUEING')
  })

  it('keeps the lines without step name apart, in the phase of their stage', () => {
    expect(getDeploymentLogLineStep(createLog('Building', 'Built'))).toEqual({
      phase: 'BUILD',
      name: 'BUILD_UNGROUPED',
    })
    expect(getDeploymentLogLineStep(createLog('Deploying', 'Deploy'))).toEqual({
      phase: 'DEPLOY',
      name: 'DEPLOY_UNGROUPED',
    })
  })

  it('puts unknown step names in the phase of their stage', () => {
    expect(getDeploymentLogLineStep(createLog('Scanning', 'Build', 'IMAGE_SCAN'))).toEqual({
      phase: 'BUILD',
      name: 'IMAGE_SCAN',
    })
  })
})

describe('filterDeploymentLogPhases', () => {
  const phases = getDeploymentLogPhases({
    linesByStep: groupDeploymentLogsByStep([
      createLog('Pushing layer', 'Build', 'IMAGE_PUSH'),
      createLog('Pushing manifest', 'Build', 'IMAGE_PUSH'),
      createLog('Pod started', 'Deploy', 'DEPLOYMENT'),
    ]),
    serviceId: 'service-1',
    nowMs: NOW_MS,
  })

  it('keeps the lines matching the query, ignoring case, and the steps and phases that have some', () => {
    const filteredPhases = filterDeploymentLogPhases(phases, 'MANIFEST')

    expect(filteredPhases.map((phase) => phase.id)).toEqual(['BUILD'])
    expect(filteredPhases[0].steps.map((step) => step.name)).toEqual(['IMAGE_PUSH'])
    expect(filteredPhases[0].steps[0].lines.map((log) => log.message?.safe_message)).toEqual(['Pushing manifest'])
  })

  it('returns no phase when no line matches', () => {
    expect(filterDeploymentLogPhases(phases, 'nowhere')).toEqual([])
  })

  it('returns every line without query', () => {
    expect(filterDeploymentLogPhases(phases, '  ')).toBe(phases)
  })
})

describe('getDeploymentLogPhases', () => {
  const serviceSteps: ServiceStepMetric[] = [
    { step_name: 'BUILD_QUEUEING', status: 'SUCCESS', duration_sec: 0 },
    { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
    {
      step_name: 'BUILD',
      status: 'SUCCESS',
      duration_sec: 150,
      sub_steps: [
        { name: 'IMAGE_PUSH', status: 'SUCCESS', duration_sec: 13 },
        { name: 'CACHE_EXPORT', status: 'SUCCESS', duration_sec: 9 },
      ],
    },
    { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 71 },
    { step_name: 'ROUTER_DEPLOYMENT', status: 'SUCCESS', duration_sec: 5 },
  ]

  it('groups steps by phase, with sub-steps as their own steps', () => {
    const linesByStep = groupDeploymentLogsByStep([
      createLog('Cloning', 'Build', 'GIT_CLONE'),
      createLog('Building', 'Build', 'BUILD'),
      createLog('Pushing', 'Build', 'IMAGE_PUSH'),
      createLog('Deploying', 'Deploy', 'DEPLOYMENT'),
    ])

    const phases = getDeploymentLogPhases({ serviceSteps, linesByStep, serviceId: 'service-1', nowMs: NOW_MS })

    expect(phases.map((phase) => phase.id)).toEqual(['BUILD', 'DEPLOY'])
    expect(phases[0].steps.map((step) => [step.name, step.durationSec, step.lines.length])).toEqual([
      ['GIT_CLONE', 7, 1],
      // The image build alone: BUILD minus its sub-steps
      ['BUILD', 128, 1],
      ['IMAGE_PUSH', 13, 1],
      ['CACHE_EXPORT', 9, 0],
    ])
    expect(phases[0]).toMatchObject({ status: 'SUCCESS', durationSec: 157 })
    expect(phases[1]).toMatchObject({ status: 'SUCCESS', durationSec: 76 })
  })

  it('hides steps that took no time and logged nothing', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps,
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => step.name)).not.toContain('BUILD_QUEUEING')
  })

  it('lists only the steps the API reports while the deployment runs', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
        {
          step_name: 'BUILD',
          status: 'ONGOING',
          duration_sec: 0,
          started_at: '2026-10-26T08:39:00Z',
        },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases).toHaveLength(1)
    expect(phases[0].steps.map((step) => [step.name, step.status])).toEqual([
      ['GIT_CLONE', 'SUCCESS'],
      ['BUILD', 'ONGOING'],
    ])
    expect(phases[0]).toMatchObject({ status: 'ONGOING', durationSec: 67, isLive: true })
  })

  it('keeps the steps the API reports as skipped', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [{ step_name: 'BUILD', status: 'SKIP', duration_sec: 0 }],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => [step.name, step.status])).toEqual([['BUILD', 'SKIP']])
  })

  it('marks the image build done once a later sub-step runs', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        {
          step_name: 'BUILD',
          status: 'ONGOING',
          duration_sec: 0,
          started_at: '2026-10-26T08:38:00Z',
          sub_steps: [{ name: 'IMAGE_PUSH', status: 'ONGOING', duration_sec: 0, started_at: '2026-10-26T08:39:50Z' }],
        },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => [step.name, step.status, step.durationSec, step.isLive])).toEqual([
      ['BUILD', 'SUCCESS', 110, false],
      ['IMAGE_PUSH', 'ONGOING', 10, true],
    ])
  })

  it('shows the failing sub-step as the one that failed', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        {
          step_name: 'BUILD',
          status: 'ERROR',
          duration_sec: 140,
          sub_steps: [{ name: 'IMAGE_PUSH', status: 'ERROR', duration_sec: 13 }],
        },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases).toHaveLength(1)
    expect(phases[0].steps.map((step) => [step.name, step.status])).toEqual([
      ['BUILD', 'SUCCESS'],
      ['IMAGE_PUSH', 'ERROR'],
    ])
    expect(phases[0].status).toBe('ERROR')
  })

  it('keeps the Git check of this service only', () => {
    const phases = getDeploymentLogPhases({
      preCheckSteps: [
        { name: 'CLOUD_CREDENTIALS_CHECK', status: 'SUCCESS', duration_sec: 1 },
        { name: 'GIT_CHECK', status: 'SUCCESS', duration_sec: 2, service_id: 'service-1' },
        { name: 'GIT_CHECK', status: 'ERROR', duration_sec: 3, service_id: 'service-2' },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases).toHaveLength(1)
    expect(phases[0]).toMatchObject({ id: 'PRE_CHECK', status: 'SUCCESS', durationSec: 3 })
  })

  it('shows every line of a phase when none names its step, with the time of the phase', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps,
      linesByStep: groupDeploymentLogsByStep([
        createLog('Cloning', 'Build'),
        createLog('Building', 'Build'),
        createLog('Deploying', 'Deploy'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases.map((phase) => phase.steps)).toEqual([
      [
        {
          name: 'BUILD_UNGROUPED',
          status: 'SUCCESS',
          durationSec: 157,
          isLive: false,
          lines: [expect.objectContaining({ message: { safe_message: 'Cloning' } }), expect.anything()],
          isUngrouped: true,
        },
      ],
      [expect.objectContaining({ name: 'DEPLOY_UNGROUPED', status: 'SUCCESS', durationSec: 76 })],
    ])
    expect(getDeploymentLogUngroupedStepLabel(phases[0])).toBe('Build logs')
  })

  it('lists the lines without step after the steps of their phase', () => {
    const phases = getDeploymentLogPhases({
      linesByStep: groupDeploymentLogsByStep([
        createLog('Environment queued', 'Deploy'),
        createLog('Deploying', 'Deploy', 'DEPLOYMENT'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => [step.name, step.lines.length, step.isUngrouped])).toEqual([
      ['DEPLOYMENT', 1, undefined],
      ['DEPLOY_UNGROUPED', 1, true],
    ])
    expect(getDeploymentLogUngroupedStepLabel(phases[0], 'STOP')).toBe('Other logs')
  })

  it('lists step names the API adds later after the known ones', () => {
    const phases = getDeploymentLogPhases({
      linesByStep: groupDeploymentLogsByStep([
        createLog('Scanning', 'Build', 'IMAGE_SCAN'),
        createLog('Building', 'Build', 'BUILD'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => step.name)).toEqual(['BUILD', 'IMAGE_SCAN'])
  })
})

describe('getSlowestDeploymentLogStepName', () => {
  it('returns the step that took the longest across the phases', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
        {
          step_name: 'BUILD',
          status: 'SUCCESS',
          duration_sec: 150,
          sub_steps: [{ name: 'IMAGE_PUSH', status: 'SUCCESS', duration_sec: 13 }],
        },
        { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 71 },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(getSlowestDeploymentLogStepName(phases)).toBe('BUILD')
  })

  it('returns nothing without at least two timed steps', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [{ step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 71 }],
      linesByStep: groupDeploymentLogsByStep([createLog('Building', 'Build')]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(getSlowestDeploymentLogStepName(phases)).toBeUndefined()
  })
})

describe('formatDeploymentLogDuration', () => {
  it.each([
    [0, '0s'],
    [7, '7s'],
    [60, '1min'],
    [128, '2min 8s'],
    [3600, '1h'],
    [3900, '1h 5min'],
  ])('formats %i seconds as %s', (durationSec, expected) => {
    expect(formatDeploymentLogDuration(durationSec)).toBe(expected)
  })
})

describe('labels', () => {
  it('names the deployment step after the action and the service type', () => {
    expect(getDeploymentLogStepLabel('DEPLOYMENT', { action: 'DEPLOY', serviceType: 'APPLICATION' })).toBe(
      'Deploying application'
    )
    expect(getDeploymentLogStepLabel('DEPLOYMENT', { action: 'STOP', serviceType: 'DATABASE' })).toBe(
      'Stopping database'
    )
    expect(getDeploymentLogPhaseLabel('DEPLOY', 'RESTART')).toBe('Restart')
  })

  it('labels known steps and reads unknown ones', () => {
    expect(getDeploymentLogStepLabel('IMAGE_PUSH')).toBe('Pushing image')
    expect(getDeploymentLogStepLabel('IMAGE_SCAN')).toBe('Image scan')
  })
})
