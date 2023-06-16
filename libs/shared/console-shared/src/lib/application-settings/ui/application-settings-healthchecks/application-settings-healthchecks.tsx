import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ProbeTypeEnum, ProbeTypeWithNoneEnum } from '@qovery/shared/enums'
import {
  IconAwesomeEnum,
  IconFa,
  InputSelectSmall,
  InputTextSmall,
  TableEdition,
  TableEditionRow,
  Tooltip,
} from '@qovery/shared/ui'

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

export interface ApplicationSettingsHealthchecksProps {
  ports?: number[]
  isJob?: boolean
  jobPort?: number | null
  defaultTypeReadiness: ProbeTypeEnum
  defaultTypeLiveness: ProbeTypeWithNoneEnum
}

export function ApplicationSettingsHealthchecks({
  ports,
  jobPort,
  defaultTypeReadiness,
  defaultTypeLiveness,
  isJob,
}: ApplicationSettingsHealthchecksProps) {
  const { control, trigger } = useFormContext()

  const [typeReadiness, setTypeReadiness] = useState<ProbeTypeEnum>(defaultTypeReadiness)
  const [typeLiveness, setTypeLiveness] = useState<ProbeTypeWithNoneEnum>(defaultTypeLiveness)

  useEffect(() => {
    setTypeReadiness(defaultTypeReadiness)
  }, [defaultTypeReadiness])

  useEffect(() => {
    setTypeLiveness(defaultTypeLiveness)
  }, [defaultTypeLiveness])

  const tableHead: TableEditionRow[] = [
    {
      cells: [
        {
          className: 'pr-10',
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

  const rowClassName = '!p-1'

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
          className: rowClassName,
          content: (
            <Controller
              name="readiness_probe.current_type"
              control={control}
              render={({ field }) => (
                <InputSelectSmall
                  className="shrink-0 grow flex-1"
                  inputClassName="!bg-white"
                  data-testid="input-readiness-probe-current-type"
                  name={field.name}
                  defaultValue={field.value || ''}
                  onChange={(value) => {
                    field.onChange(value)
                    setTypeReadiness(value as ProbeTypeEnum)
                    trigger().then()
                  }}
                  items={Object.values(ProbeTypeEnum).map((value) => ({
                    label: value,
                    value: value,
                  }))}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: (
            <Controller
              name="liveness_probe.current_type"
              control={control}
              render={({ field }) => (
                <InputSelectSmall
                  className="shrink-0 grow flex-1"
                  inputClassName="!bg-white"
                  data-testid="input-liveness-probe-current-type"
                  name={field.name}
                  defaultValue={field.value || ''}
                  onChange={(value) => {
                    field.onChange(value)
                    setTypeLiveness(value as ProbeTypeWithNoneEnum)
                    trigger().then()
                  }}
                  items={Object.values(ProbeTypeWithNoneEnum).map((value) => ({
                    label: value,
                    value: value,
                  }))}
                />
              )}
            />
          ),
        },
      ],
    },
  ]

  if (typeReadiness !== ProbeTypeEnum.EXEC || typeLiveness !== ProbeTypeWithNoneEnum.EXEC) {
    tableBody.push({
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
          className: rowClassName,
          content: typeReadiness !== ProbeTypeEnum.EXEC && (
            <Controller
              key={`readiness_probe.type.${typeReadiness?.toLowerCase()}.port`}
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.port`}
              control={control}
              render={({ field }) =>
                isJob ? (
                  <InputTextSmall
                    className="shrink-0 grow flex-1"
                    data-testid="input-job-readiness-probe-port"
                    name={field.name}
                    onChange={field.onChange}
                    value={jobPort?.toString() || ''}
                    label={field.name}
                    disabled
                  />
                ) : (
                  <InputSelectSmall
                    className="shrink-0 grow flex-1"
                    inputClassName="!bg-white"
                    data-testid="input-readiness-probe-port"
                    name={field.name}
                    defaultValue={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value)
                      trigger().then()
                    }}
                    items={
                      ports
                        ? ports.map((value) => ({
                            label: value.toString(),
                            value: value.toString(),
                          }))
                        : []
                    }
                  />
                )
              }
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeWithNoneEnum.NONE && typeLiveness !== ProbeTypeWithNoneEnum.EXEC && (
            <Controller
              key={`liveness_probe.type.${typeLiveness?.toLowerCase()}.port`}
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.port`}
              control={control}
              render={({ field }) =>
                isJob ? (
                  <InputTextSmall
                    className="shrink-0 grow flex-1"
                    data-testid="input-job-liveness-probe-port"
                    name={field.name}
                    onChange={field.onChange}
                    value={jobPort?.toString() || ''}
                    label={field.name}
                    disabled
                  />
                ) : (
                  <InputSelectSmall
                    className="shrink-0 grow flex-1"
                    inputClassName="!bg-white"
                    data-testid="input-liveness-probe-port"
                    name={field.name}
                    defaultValue={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value)
                      trigger().then()
                    }}
                    items={
                      ports
                        ? ports.map((value) => ({
                            label: value.toString(),
                            value: value.toString(),
                          }))
                        : []
                    }
                  />
                )
              }
            />
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.HTTP || typeLiveness === ProbeTypeWithNoneEnum.HTTP) {
    tableBody.push({
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
          className: rowClassName,
          content: typeReadiness === ProbeTypeEnum.HTTP && (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.path`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-path"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness === ProbeTypeWithNoneEnum.HTTP && (
            <Controller
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.path`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-path"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.EXEC || typeLiveness === ProbeTypeWithNoneEnum.EXEC) {
    tableBody.push({
      cells: [
        {
          content: <div className="flex justify-between w-full">Command</div>,
        },

        {
          className: rowClassName,
          content: typeReadiness === ProbeTypeEnum.EXEC && (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.command`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-command"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness === ProbeTypeWithNoneEnum.EXEC && (
            <Controller
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.command`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-command"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.GRPC || typeLiveness === ProbeTypeWithNoneEnum.GRPC) {
    tableBody.push({
      cells: [
        {
          content: <div className="flex justify-between w-full">Service</div>,
        },
        {
          className: rowClassName,
          content: typeReadiness === ProbeTypeEnum.GRPC && (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.service`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-service"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness === ProbeTypeWithNoneEnum.GRPC && (
            <Controller
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.service`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-service"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
      ],
    })
  }

  tableBody.push(
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
          className: rowClassName,
          content: (
            <Controller
              name="readiness_probe.initial_delay_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-delay"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeWithNoneEnum.NONE && (
            <Controller
              name="liveness_probe.initial_delay_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-delay"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
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
          className: rowClassName,
          content: (
            <Controller
              name="readiness_probe.period_seconds"
              control={control}
              rules={{ required: 'This field is required' }}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-period"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeWithNoneEnum.NONE && (
            <Controller
              name="liveness_probe.period_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-period"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
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
          className: rowClassName,
          content: (
            <Controller
              name="readiness_probe.timeout_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-timeout"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeWithNoneEnum.NONE && (
            <Controller
              name="liveness_probe.timeout_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-timeout"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
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
          className: rowClassName,
          content: (
            <Controller
              name="readiness_probe.success_threshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  disabled
                  data-testid="input-readiness-probe-threshold"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeWithNoneEnum.NONE && (
            <Controller
              name="liveness_probe.success_threshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  disabled
                  data-testid="input-liveness-probe-threshold"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
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
          className: rowClassName,
          content: (
            <Controller
              name="readiness_probe.failure_threshold"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-readiness-probe-fail-threshold"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeWithNoneEnum.NONE && (
            <Controller
              name="liveness_probe.failure_threshold"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  data-testid="input-liveness-probe-fail-threshold"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value || ''}
                  error={error?.message}
                  errorMessagePosition="left"
                  label={field.name}
                />
              )}
            />
          ),
        },
      ],
    }
  )

  const table = [...tableHead, ...tableBody]

  return (
    <TableEdition
      key={`${typeLiveness}.${typeReadiness}`}
      className="bg-element-light-lighter-200 font-medium text-ssm mb-5"
      tableBody={table}
    />
  )
}

export default ApplicationSettingsHealthchecks
