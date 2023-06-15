import { Probe } from 'qovery-typescript-axios'
import { FieldValues } from 'react-hook-form'
import { ProbeTypeEnum } from '../ui/application-settings-healthchecks/application-settings-healthchecks'

export function probeFormatted(currentData: FieldValues, defaultPort: number | null | undefined): Probe | undefined {
  if (!currentData['currentType']) {
    return undefined
  }

  const type = currentData['currentType'].toLowerCase()

  let dataType = null

  if (ProbeTypeEnum.HTTP === type.toUpperCase()) {
    dataType = {
      [type]: {
        port: parseInt(currentData?.['type']?.[type]?.['port'] || defaultPort, 10),
        path: currentData['type'][type]['path'] || null,
        scheme: 'HTTP',
      },
    }
  } else if (ProbeTypeEnum.TCP === type.toUpperCase()) {
    dataType = {
      [type]: {
        port: parseInt(currentData?.['type']?.[type]?.['port'] || defaultPort, 10),
      },
    }
  } else if (ProbeTypeEnum.GRPC === type.toUpperCase()) {
    dataType = {
      [type]: {
        port: parseInt(currentData?.['type']?.[type]?.['port'] || defaultPort, 10),
        service: currentData['type'][type]['service'] || null,
      },
    }
  } else {
    dataType = {
      [type]: {
        command: !Array.isArray(currentData?.['type']?.[type]?.['command'])
          ? currentData?.['type']?.[type]?.['command']?.split(',')
          : currentData?.['type'][type]['command'],
      },
    }
  }

  return {
    type: dataType,
    initial_delay_seconds: parseInt(currentData['initial_delay_seconds'], 10),
    period_seconds: parseInt(currentData['period_seconds'], 10),
    timeout_seconds: parseInt(currentData['timeout_seconds'], 10),
    success_threshold: parseInt(currentData['success_threshold'], 10),
    failure_threshold: parseInt(currentData['failure_threshold'], 10),
  } as Probe
}
