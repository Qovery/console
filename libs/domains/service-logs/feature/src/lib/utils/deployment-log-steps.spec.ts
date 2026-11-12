import { type EnvironmentLogs, type ServiceStepMetric } from 'qovery-typescript-axios'
import {
  filterDeploymentLogPhases,
  formatDeploymentLogDuration,
  getDeploymentLogLineStep,
  getDeploymentLogPhaseLabel,
  getDeploymentLogPhases,
  getDeploymentLogStepLabel,
  getDeploymentLogUngroupedStepLabel,
  getSlowestDeploymentLogStepKey,
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

function createErrorLog(message: string, stageStep: string, stepName?: string): EnvironmentLogs {
  return { ...createLog(message, stageStep, stepName), type: 'error' }
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

  it('puts the queueing lines in the wait of the stage, whatever their stage', () => {
    const stageQueueing = { phase: 'PRE_CHECK', name: 'STAGE_QUEUEING' }

    expect(getDeploymentLogLineStep(createLog('Your deployment is 1 in the Queue', 'Queueing', 'QUEUEING'))).toEqual(
      stageQueueing
    )
    expect(getDeploymentLogLineStep(createLog('Queued', 'Build', 'QUEUEING'))).toEqual(stageQueueing)
    expect(getDeploymentLogLineStep(createLog('Queued', 'Deploy', 'QUEUEING'))).toEqual(stageQueueing)
    expect(getDeploymentLogLineStep(createLog('Queued', 'Queueing'))).toEqual(stageQueueing)
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

  it('leaves the phase out when neither the step name nor the stage tells it', () => {
    expect(getDeploymentLogLineStep(createLog('Engine failure', 'GlobalError'))).toEqual({ name: undefined })
    expect(getDeploymentLogLineStep(createLog('Output', 'JobOutput', 'OUTPUT_UPLOAD'))).toEqual({
      name: 'OUTPUT_UPLOAD',
    })
  })
})

describe('groupDeploymentLogsByStep', () => {
  it('puts the lines without phase in the phase running when they were logged', () => {
    const linesByStep = groupDeploymentLogsByStep([
      createLog('Starting', 'Unknown'),
      createLog('Building', 'Build', 'BUILD'),
      createErrorLog('Engine failure', 'GlobalError'),
      createLog('Output', 'JobOutput', 'OUTPUT_UPLOAD'),
    ])

    expect([...linesByStep].map(([, { name, phase, lines }]) => [name, phase, lines.length])).toEqual([
      ['BUILD_UNGROUPED', 'BUILD', 2],
      ['BUILD', 'BUILD', 1],
      ['OUTPUT_UPLOAD', 'BUILD', 1],
    ])
  })

  it('puts the lines in the deployment when no line tells the phase', () => {
    const linesByStep = groupDeploymentLogsByStep([createLog('Engine failure', 'GlobalError')])

    expect([...linesByStep].map(([, { name, phase }]) => [name, phase])).toEqual([['DEPLOY_UNGROUPED', 'DEPLOY']])
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
  it('keeps repeated step names in their own phases', () => {
    const buildLine = createLog('Build output', 'Build', 'OUTPUT_UPLOAD')
    const deployLine = createLog('Deploy output', 'Deploy', 'OUTPUT_UPLOAD')
    const phases = getDeploymentLogPhases({
      linesByStep: groupDeploymentLogsByStep([buildLine, deployLine]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases.map((phase) => [phase.id, phase.steps.map((step) => step.lines)])).toEqual([
      ['BUILD', [[buildLine]]],
      ['DEPLOY', [[deployLine]]],
    ])
  })

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

  it('marks the steps without status after the running one as not started', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        { step_name: 'GIT_CLONE', status: 'SUCCESS', duration_sec: 7 },
        { step_name: 'BUILD', status: 'ONGOING', duration_sec: 0, started_at: '2026-10-26T08:39:00Z' },
      ],
      linesByStep: groupDeploymentLogsByStep([
        createLog('Registry ready', 'Build', 'REGISTRY_CREATE_REPOSITORY'),
        createLog('Deploying', 'Deploy', 'DEPLOYMENT'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases.flatMap((phase) => phase.steps.map((step) => [step.name, step.status]))).toEqual([
      // Before the running step: left as the API reports it
      ['REGISTRY_CREATE_REPOSITORY', undefined],
      ['GIT_CLONE', 'SUCCESS'],
      ['BUILD', 'ONGOING'],
      ['DEPLOYMENT', 'PENDING'],
    ])
    expect(phases[1]).toMatchObject({ id: 'DEPLOY', status: 'PENDING' })
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

  it.each(['ERROR', 'CANCEL'] as const)('skips the image build when provisioning ends with %s', (status) => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        {
          step_name: 'BUILD',
          status,
          duration_sec: 30,
          sub_steps: [{ name: 'PROVISION_BUILDER', status, duration_sec: 30 }],
        },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => [step.name, step.status])).toEqual([
      ['PROVISION_BUILDER', status],
      ['BUILD', 'SKIP'],
    ])
    expect(phases[0].status).toBe(status)
  })

  it.each(['IMAGE_PUSH', 'CACHE_EXPORT'] as const)('keeps the image build successful when %s is canceled', (name) => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        {
          step_name: 'BUILD',
          status: 'CANCEL',
          duration_sec: 40,
          sub_steps: [{ name, status: 'CANCEL', duration_sec: 10 }],
        },
      ],
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0].steps.map((step) => [step.name, step.status])).toEqual([
      ['BUILD', 'SUCCESS'],
      [name, 'CANCEL'],
    ])
    expect(phases[0].status).toBe('CANCEL')
  })

  it('lists the wait of the stage after the pre-checks, with its own time, apart from the deployment queue', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        { step_name: 'DEPLOYMENT_QUEUEING', status: 'SUCCESS', duration_sec: 0 },
        { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 20 },
      ],
      preCheckStage: {
        status: 'SUCCESS',
        total_duration_sec: 1,
        steps: [{ name: 'CLOUD_CREDENTIALS_CHECK', status: 'SUCCESS', duration_sec: 1 }],
      },
      stageSteps: [
        { step_name: 'QUEUEING', status: 'SUCCESS', duration_sec: 12 },
        { step_name: 'TOTAL', status: 'SUCCESS', duration_sec: 33 },
      ],
      linesByStep: groupDeploymentLogsByStep([
        createLog('Credentials checked', 'PreCheck', 'CLOUD_CREDENTIALS_CHECK'),
        createLog('Deployment request sent to the engine', 'Queueing', 'QUEUEING'),
        createLog('Your deployment is 1 in the Queue', 'Queueing', 'QUEUEING'),
        createLog('Deploying', 'Deploy', 'DEPLOYMENT'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(
      phases.map((phase) => [
        phase.id,
        phase.durationSec,
        phase.steps.map((step) => [step.name, step.status, step.durationSec, step.lines.length]),
      ])
    ).toEqual([
      [
        'PRE_CHECK',
        13,
        [
          ['CLOUD_CREDENTIALS_CHECK', 'SUCCESS', 1, 1],
          ['STAGE_QUEUEING', 'SUCCESS', 12, 2],
        ],
      ],
      // The deployment queue took no time and logged nothing
      ['DEPLOY', 20, [['DEPLOYMENT', 'SUCCESS', 20, 1]]],
    ])
    expect(getDeploymentLogStepLabel('STAGE_QUEUEING')).toBe('Waiting in stage queue')
  })

  it('adds the wait of the stage to the time of a pre-check stage without step metrics', () => {
    const phases = getDeploymentLogPhases({
      preCheckStage: { status: 'SUCCESS', total_duration_sec: 2 },
      stageSteps: [{ step_name: 'QUEUEING', status: 'SUCCESS', duration_sec: 12 }],
      linesByStep: groupDeploymentLogsByStep([
        createLog('Checking credentials', 'PreCheck'),
        createLog('Your deployment is 1 in the Queue', 'Queueing', 'QUEUEING'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0]).toMatchObject({ id: 'PRE_CHECK', status: 'SUCCESS', durationSec: 14 })
    expect(phases[0].steps.map((step) => [step.name, step.status, step.durationSec])).toEqual([
      ['STAGE_QUEUEING', 'SUCCESS', 12],
      ['PRE_CHECK_UNGROUPED', undefined, undefined],
    ])
  })

  it('keeps the Git check of this service only', () => {
    const phases = getDeploymentLogPhases({
      preCheckStage: {
        status: 'ERROR',
        total_duration_sec: 7,
        steps: [
          { name: 'CLOUD_CREDENTIALS_CHECK', status: 'SUCCESS', duration_sec: 1 },
          { name: 'GIT_CHECK', status: 'SUCCESS', duration_sec: 2, service_id: 'service-1' },
          { name: 'GIT_CHECK', status: 'ERROR', duration_sec: 3, service_id: 'service-2' },
        ],
      },
      linesByStep: new Map(),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases).toHaveLength(1)
    expect(phases[0]).toMatchObject({ id: 'PRE_CHECK', status: 'SUCCESS', durationSec: 3 })
  })

  it.each([
    ['SUCCESS', 2],
    ['ERROR', 5],
  ] as const)(
    'takes the %s status and time of the pre-check stage when it has no step metrics',
    (status, totalDurationSec) => {
      const phases = getDeploymentLogPhases({
        preCheckStage: { status, total_duration_sec: totalDurationSec },
        linesByStep: groupDeploymentLogsByStep([createLog('Checking credentials', 'PreCheck')]),
        serviceId: 'service-1',
        nowMs: NOW_MS,
      })

      expect(phases).toEqual([
        {
          id: 'PRE_CHECK',
          status,
          durationSec: totalDurationSec,
          isLive: false,
          steps: [expect.objectContaining({ name: 'PRE_CHECK_UNGROUPED', status, durationSec: totalDurationSec })],
        },
      ])
    }
  )

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

  it('fails a phase whose lines name no step when one of them is an error, whatever its metrics say', () => {
    // A Terraform deletion whose job pod never started: the engine reported the deletion as done and the execution as failed
    const phases = getDeploymentLogPhases({
      serviceSteps: [
        { step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 88 },
        { step_name: 'EXECUTING', status: 'ERROR', duration_sec: 1 },
      ],
      linesByStep: groupDeploymentLogsByStep([
        createLog('Deletion of terraform service is starting', 'Delete'),
        createErrorLog('Job was active longer than specified deadline', 'DeletedError'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(
      phases.map((phase) => [phase.id, phase.status, phase.steps.map((step) => [step.name, step.status])])
    ).toEqual([
      ['DEPLOY', 'ERROR', [['DEPLOY_UNGROUPED', 'ERROR']]],
      ['EXECUTE', 'ERROR', [['EXECUTING', 'ERROR']]],
    ])
  })

  it('does not take the success of the pre-check stage when its lines report an error', () => {
    // The checks went through, then the engine never answered: the timeout line was logged as a pre-check line
    const phases = getDeploymentLogPhases({
      preCheckStage: { status: 'SUCCESS', total_duration_sec: 2 },
      linesByStep: groupDeploymentLogsByStep([
        createLog('Checking Git configuration', 'PreCheck'),
        createErrorLog('Failed to get an answer from the engine in 10 min', 'PreCheck'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases).toEqual([
      expect.objectContaining({
        id: 'PRE_CHECK',
        status: 'ERROR',
        durationSec: 2,
        steps: [expect.objectContaining({ name: 'PRE_CHECK_UNGROUPED', status: 'ERROR', durationSec: 2 })],
      }),
    ])
  })

  it('keeps running a phase whose lines name no step while it runs, even with an error line', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [{ step_name: 'DEPLOYMENT', status: 'ONGOING', duration_sec: 30 }],
      linesByStep: groupDeploymentLogsByStep([createErrorLog('Readiness probe failed, retrying', 'Deploy')]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0]).toMatchObject({ id: 'DEPLOY', status: 'ONGOING', steps: [{ status: 'ONGOING' }] })
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

  it('fails a phase whose lines without step report an error, next to steps that went through', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [{ step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 30 }],
      linesByStep: groupDeploymentLogsByStep([
        createLog('Deploying', 'Deploy', 'DEPLOYMENT'),
        createErrorLog('Failed to expose the application', 'DeployedError'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases.map((phase) => [phase.status, phase.steps.map((step) => [step.name, step.status])])).toEqual([
      [
        'ERROR',
        [
          ['DEPLOYMENT', 'SUCCESS'],
          ['DEPLOY_UNGROUPED', 'ERROR'],
        ],
      ],
    ])
  })

  it('keeps running a phase whose lines without step report an error while it runs', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [{ step_name: 'DEPLOYMENT', status: 'ONGOING', duration_sec: 30 }],
      linesByStep: groupDeploymentLogsByStep([
        createLog('Deploying', 'Deploy', 'DEPLOYMENT'),
        createErrorLog('Readiness probe failed, retrying', 'Deploy'),
      ]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(phases[0]).toMatchObject({ status: 'ONGOING', steps: [{ status: 'ONGOING' }, { status: undefined }] })
  })

  it('puts the metrics of a step the API adds later in the phase of its lines', () => {
    const phases = getDeploymentLogPhases({
      // A step name the generated client doesn't know yet
      serviceSteps: [
        { step_name: 'IMAGE_SCAN' as ServiceStepMetric['step_name'], status: 'SUCCESS', duration_sec: 12 },
      ],
      linesByStep: groupDeploymentLogsByStep([createLog('Scanning', 'Build', 'IMAGE_SCAN')]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(
      phases.map((phase) => [phase.id, phase.steps.map((step) => [step.name, step.status, step.durationSec])])
    ).toEqual([['BUILD', [['IMAGE_SCAN', 'SUCCESS', 12]]]])
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

describe('getSlowestDeploymentLogStepKey', () => {
  it.each([
    { buildDuration: 12, deployDuration: 5, expected: 'BUILD:OUTPUT_UPLOAD' },
    { buildDuration: 5, deployDuration: 12, expected: 'DEPLOY:OUTPUT_UPLOAD' },
  ])('returns $expected when phases share a step name', ({ buildDuration, deployDuration, expected }) => {
    expect(
      getSlowestDeploymentLogStepKey([
        {
          id: 'BUILD',
          isLive: false,
          steps: [{ name: 'OUTPUT_UPLOAD', durationSec: buildDuration, isLive: false, lines: [] }],
        },
        {
          id: 'DEPLOY',
          isLive: false,
          steps: [{ name: 'OUTPUT_UPLOAD', durationSec: deployDuration, isLive: false, lines: [] }],
        },
      ])
    ).toBe(expected)
  })

  it('returns the key of the step that took the longest across the phases', () => {
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

    expect(getSlowestDeploymentLogStepKey(phases)).toBe('BUILD:BUILD')
  })

  it('returns nothing without at least two timed steps', () => {
    const phases = getDeploymentLogPhases({
      serviceSteps: [{ step_name: 'DEPLOYMENT', status: 'SUCCESS', duration_sec: 71 }],
      linesByStep: groupDeploymentLogsByStep([createLog('Building', 'Build')]),
      serviceId: 'service-1',
      nowMs: NOW_MS,
    })

    expect(getSlowestDeploymentLogStepKey(phases)).toBeUndefined()
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
