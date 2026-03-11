import { type Probe, type ProbeType } from 'qovery-typescript-axios'
import { type UseFormReturn } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { formatHealthcheckProbe } from '@qovery/shared/util-js'

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

export function getProbeType(probe?: Probe | null): ProbeTypeEnum {
  const types = probe?.type as ProbeType | undefined
  const probeKeys = Object.keys(types || {})
  const matchingKey = probeKeys.find((key) => (types as Record<string, unknown> | undefined)?.[key] !== null)

  return (matchingKey?.toUpperCase() as ProbeTypeEnum | undefined) ?? ProbeTypeEnum.NONE
}

function setProbeValues(
  methods: UseFormReturn<HealthcheckData>,
  probeName: 'liveness_probe' | 'readiness_probe',
  values: Probe
) {
  Object.entries(values).forEach(([field, value]) => {
    const probePath = `${probeName}.${field}`

    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      setProbeValues(methods, probePath as 'liveness_probe' | 'readiness_probe', value as Probe)
    } else {
      methods.setValue(probePath as never, (Array.isArray(value) ? JSON.stringify(value) : value) as never, {
        shouldDirty: false,
      })
    }
  })
}

export function resetHealthchecksFormFromValue(
  methods: UseFormReturn<HealthcheckData>,
  healthchecks?: HealthcheckData | null
) {
  const readinessType = getProbeType(healthchecks?.readiness_probe)
  const livenessType = getProbeType(healthchecks?.liveness_probe)

  methods.reset({
    readiness_probe: {
      current_type: readinessType,
      type: readinessType === ProbeTypeEnum.NONE ? {} : { [readinessType.toLowerCase()]: { port: 0 } },
      ...defaultReadinessProbe,
    },
    liveness_probe: {
      current_type: livenessType,
      type: livenessType === ProbeTypeEnum.NONE ? {} : { [livenessType.toLowerCase()]: { port: 0 } },
      ...defaultLivenessProbe,
    },
  })

  if (healthchecks?.readiness_probe) {
    methods.setValue('readiness_probe.current_type', readinessType)
    setProbeValues(methods, 'readiness_probe', healthchecks.readiness_probe)
  }

  if (healthchecks?.liveness_probe) {
    methods.setValue('liveness_probe.current_type', livenessType)
    setProbeValues(methods, 'liveness_probe', healthchecks.liveness_probe)
  }
}

export function buildHealthchecksPayload(data: HealthcheckData, defaultPort: number | null | undefined) {
  const readinessType = data.readiness_probe?.current_type ?? ProbeTypeEnum.NONE
  const livenessType = data.liveness_probe?.current_type ?? ProbeTypeEnum.NONE

  return {
    typeReadiness: readinessType,
    typeLiveness: livenessType,
    item: {
      readiness_probe:
        readinessType !== ProbeTypeEnum.NONE && data.readiness_probe
          ? formatHealthcheckProbe(data.readiness_probe as unknown as Record<string, unknown>, defaultPort)
          : undefined,
      liveness_probe:
        livenessType !== ProbeTypeEnum.NONE && data.liveness_probe
          ? formatHealthcheckProbe(data.liveness_probe as unknown as Record<string, unknown>, defaultPort)
          : undefined,
    },
  }
}
