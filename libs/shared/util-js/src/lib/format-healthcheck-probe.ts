import { type Probe } from 'qovery-typescript-axios'
import { ProbeTypeEnum } from '@qovery/shared/enums'

export function formatHealthcheckProbe(
  currentData: Record<string, unknown>,
  defaultPort: number | null | undefined
): Probe | undefined {
  const currentType = currentData['current_type']

  if (typeof currentType !== 'string' || currentType.length === 0) {
    return undefined
  }

  const type = currentType.toLowerCase()
  const probeTypes = (currentData['type'] as Record<string, Record<string, unknown>> | undefined) ?? {}
  const currentProbeType = probeTypes[type] ?? {}

  let dataType: Record<string, unknown>

  if (ProbeTypeEnum.HTTP === type.toUpperCase()) {
    dataType = {
      [type]: {
        port: parseInt(`${currentProbeType['port'] ?? defaultPort ?? 0}`, 10),
        path: currentProbeType['path'] || null,
        scheme: 'HTTP',
      },
    }
  } else if (ProbeTypeEnum.TCP === type.toUpperCase()) {
    dataType = {
      [type]: {
        port: parseInt(`${currentProbeType['port'] ?? defaultPort ?? 0}`, 10),
      },
    }
  } else if (ProbeTypeEnum.GRPC === type.toUpperCase()) {
    dataType = {
      [type]: {
        port: parseInt(`${currentProbeType['port'] ?? defaultPort ?? 0}`, 10),
        service: currentProbeType['service'] || null,
      },
    }
  } else {
    const command = currentProbeType['command']

    dataType = {
      [type]: {
        command: !Array.isArray(command) ? JSON.parse(`${command ?? '[]'}`) : command,
      },
    }
  }

  return {
    type: dataType,
    initial_delay_seconds: parseInt(`${currentData['initial_delay_seconds'] ?? 0}`, 10),
    period_seconds: parseInt(`${currentData['period_seconds'] ?? 0}`, 10),
    timeout_seconds: parseInt(`${currentData['timeout_seconds'] ?? 0}`, 10),
    success_threshold: parseInt(`${currentData['success_threshold'] ?? 0}`, 10),
    failure_threshold: parseInt(`${currentData['failure_threshold'] ?? 0}`, 10),
  } as Probe
}
