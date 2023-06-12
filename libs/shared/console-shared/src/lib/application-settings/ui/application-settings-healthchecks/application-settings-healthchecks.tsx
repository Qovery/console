import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  IconAwesomeEnum,
  IconFa,
  InputSelectSmall,
  InputTextSmall,
  TableEdition,
  TableEditionRow,
  Tooltip,
} from '@qovery/shared/ui'

export enum ProbeTypeEnum {
  HTTP = 'HTTP',
  GRPC = 'GRPC',
  TCP = 'TCP',
  EXEC = 'EXEC',
}

export interface ApplicationSettingsHealthchecksProps {
  ports?: number[]
}

export function ApplicationSettingsHealthchecks({ ports }: ApplicationSettingsHealthchecksProps) {
  const { control } = useFormContext()

  const [typeReadiness, setTypeReadiness] = useState<ProbeTypeEnum>(ProbeTypeEnum.HTTP)

  const tableHead: TableEditionRow[] = [
    {
      cells: [
        {
          content: 'Settings',
        },
        {
          content: (
            <div className="flex justify-between w-full">
              Readiness
              <Tooltip content="Verifies if the application is ready to receive traffic. If the probe fails, no traffic is sent to the application.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <div className="flex justify-between w-full">
              Liveness
              <Tooltip content="Verifies if the container is operating and it is not in a broken state. If the probe fails, the container is killed and restart.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
      ],
    },
  ]

  const tableBody: TableEditionRow[] = [
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Type
              <Tooltip content='Select the type of probe to use. "NONE" disables the probe, which we strongly advise against, as Kubernetes is then unable to check the state of your application.'>
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name="readiness_probe.type"
              control={control}
              render={({ field }) => (
                <InputSelectSmall
                  className="shrink-0 grow flex-1"
                  data-testid="value"
                  name={field.name}
                  onChange={(value) => {
                    setTypeReadiness(value as ProbeTypeEnum)
                    field.onChange(value)
                  }}
                  items={Object.values(ProbeTypeEnum).map((value) => ({
                    label: value,
                    value,
                  }))}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Port
              <Tooltip content="When configuring an HTTP liveness probe, this advanced setting allows you to set the path to access on the HTTP/HTTPS server to perform the health check.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.port`}
              control={control}
              render={({ field }) => (
                <InputSelectSmall
                  className="shrink-0 grow flex-1"
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  items={
                    ports
                      ? ports.map((value) => ({
                          label: value.toString(),
                          value: value.toString(),
                        }))
                      : []
                  }
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Path
              <Tooltip content="Allows to define the path to be used to run the probe check.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.path`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Initial Delay (in seconds)
              <Tooltip content="Allows you to specify an interval, in seconds, between the application container start and the first liveness check.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name="readiness_probe.initial_delay_seconds"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Period (in seconds)
              <Tooltip content="Allows you to specify an interval, in seconds, between each liveness probe.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name="readiness_probe.period_seconds"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Timeout (in seconds)
              <Tooltip content="Allows you to specify the interval, in seconds, after which the liveness probe times out.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name="readiness_probe.timeout_seconds"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Success Threshold
              <Tooltip content="Allows you to specify how many consecutive successes are needed, as a minimum, for the probe to be considered successful after having failed previously.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name="readiness_probe.success_threshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  disabled
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
    {
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Failure Threshold
              <Tooltip content="Allows you to specify how many consecutive failures are needed, as a minimum, for the probe to be considered failed after having succeeded previously.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <Controller
              name="readiness_probe.failure_threshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="value"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          content: '',
        },
      ],
    },
  ]

  const table = [...tableHead, ...tableBody]

  return <TableEdition className="bg-element-light-lighter-200 font-medium text-ssm" tableBody={table} />
}

export default ApplicationSettingsHealthchecks
