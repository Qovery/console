import { type Healthcheck, type Probe, type ProbeType } from 'qovery-typescript-axios'
import { type UseFormReturn } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { formatHealthcheckProbe } from '@qovery/shared/util-js'

export type ProbeName = keyof Healthcheck

export const defaultReadinessProbe = {
  initial_delay_seconds: 30,
  period_seconds: 10,
  timeout_seconds: 1,
  success_threshold: 1,
  failure_threshold: 3,
}

export const defaultLivenessProbe = {
  initial_delay_seconds: 30,
  period_seconds: 10,
  timeout_seconds: 5,
  success_threshold: 1,
  failure_threshold: 3,
}

// Gives the service up to 10s + 30 x 10s to start before Kubernetes restarts it.
// The initial delay stays above 0, which the API requires.
export const defaultStartupProbe = {
  initial_delay_seconds: 10,
  period_seconds: 10,
  timeout_seconds: 5,
  success_threshold: 1,
  failure_threshold: 30,
}

const DEFAULT_PROBE_VALUES: Record<ProbeName, typeof defaultReadinessProbe> = {
  readiness_probe: defaultReadinessProbe,
  liveness_probe: defaultLivenessProbe,
  startup_probe: defaultStartupProbe,
}

export function getProbeType(probe?: Probe | null): ProbeTypeEnum {
  const types = probe?.type as ProbeType | undefined
  const probeKeys = Object.keys(types || {})
  const matchingKey = probeKeys.find((key) => (types as Record<string, unknown> | undefined)?.[key] !== null)

  return (matchingKey?.toUpperCase() as ProbeTypeEnum | undefined) ?? ProbeTypeEnum.NONE
}

function setProbeValues(methods: UseFormReturn<HealthcheckData>, probePath: string, values: Probe) {
  Object.entries(values).forEach(([field, value]) => {
    const fieldPath = `${probePath}.${field}`

    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      setProbeValues(methods, fieldPath, value as Probe)
    } else {
      methods.setValue(fieldPath as never, (Array.isArray(value) ? JSON.stringify(value) : value) as never, {
        shouldDirty: false,
      })
    }
  })
}

function probeFormDefaults(probeName: ProbeName, probeType: ProbeTypeEnum) {
  return {
    current_type: probeType,
    type: probeType === ProbeTypeEnum.NONE ? {} : { [probeType.toLowerCase()]: { port: 0 } },
    ...DEFAULT_PROBE_VALUES[probeName],
  }
}

export function resetHealthchecksFormFromValue(
  methods: UseFormReturn<HealthcheckData>,
  healthchecks?: HealthcheckData | null
) {
  const readinessType = getProbeType(healthchecks?.readiness_probe)
  const livenessType = getProbeType(healthchecks?.liveness_probe)
  const startupType = getProbeType(healthchecks?.startup_probe)

  methods.reset({
    readiness_probe: probeFormDefaults('readiness_probe', readinessType),
    liveness_probe: probeFormDefaults('liveness_probe', livenessType),
    startup_probe: probeFormDefaults('startup_probe', startupType),
  })

  const probeTypes: [ProbeName, ProbeTypeEnum][] = [
    ['readiness_probe', readinessType],
    ['liveness_probe', livenessType],
    ['startup_probe', startupType],
  ]
  probeTypes.forEach(([probeName, probeType]) => {
    const probe = healthchecks?.[probeName]

    if (probe) {
      methods.setValue(`${probeName}.current_type`, probeType)
      setProbeValues(methods, probeName, probe)
    }
  })
}

export function buildHealthchecksPayload(data: HealthcheckData, defaultPort: number | null | undefined) {
  const readinessType = data.readiness_probe?.current_type ?? ProbeTypeEnum.NONE
  const livenessType = data.liveness_probe?.current_type ?? ProbeTypeEnum.NONE
  const startupType = data.startup_probe?.current_type ?? ProbeTypeEnum.NONE

  const formatProbe = (probeType: string, probe?: HealthcheckData[ProbeName]) =>
    probeType !== ProbeTypeEnum.NONE && probe
      ? formatHealthcheckProbe(probe as unknown as Record<string, unknown>, defaultPort)
      : undefined

  return {
    typeReadiness: readinessType,
    typeLiveness: livenessType,
    typeStartup: startupType,
    item: {
      readiness_probe: formatProbe(readinessType, data.readiness_probe),
      liveness_probe: formatProbe(livenessType, data.liveness_probe),
      startup_probe: formatProbe(startupType, data.startup_probe),
    },
  }
}
