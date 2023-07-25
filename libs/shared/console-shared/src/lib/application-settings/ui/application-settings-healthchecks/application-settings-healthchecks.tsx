import { Controller, useFormContext } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
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
}

export function ApplicationSettingsHealthchecks({ ports, jobPort, isJob }: ApplicationSettingsHealthchecksProps) {
  const { control, watch } = useFormContext()

  const typeReadiness = watch('readiness_probe.current_type') || ProbeTypeEnum.NONE
  const typeLiveness = watch('liveness_probe.current_type') || ProbeTypeEnum.NONE

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
              Liveness
              <Tooltip content="Verifies if the container is operating and it is not in a broken state. If the probe fails, the container is killed and restarted.">
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
              Readiness
              <Tooltip content="Verifies if the application is ready to receive traffic. If the probe fails, no traffic is sent to the application.">
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
              name="liveness_probe.current_type"
              control={control}
              render={({ field }) => (
                <InputSelectSmall
                  className="shrink-0 grow flex-1"
                  inputClassName="!bg-white"
                  dataTestId="input-liveness-probe-current-type"
                  name={field.name}
                  defaultValue={field.value || ''}
                  onChange={field.onChange}
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
              name="readiness_probe.current_type"
              control={control}
              render={({ field }) => (
                <InputSelectSmall
                  className="shrink-0 grow flex-1"
                  inputClassName="!bg-white"
                  dataTestId="input-readiness-probe-current-type"
                  name={field.name}
                  defaultValue={field.value || ''}
                  onChange={field.onChange}
                  items={Object.values(ProbeTypeEnum).map((value) => ({
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

  if (typeReadiness !== ProbeTypeEnum.EXEC || typeLiveness !== ProbeTypeEnum.EXEC) {
    tableBody.push({
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Port
              <Tooltip content="When configuring an HTTP probe, this advanced setting allows you to set the path to access on the HTTP/HTTPS server to perform the health check.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeEnum.NONE && typeLiveness !== ProbeTypeEnum.EXEC && (
            <Controller
              key={`liveness_probe.type.${typeLiveness?.toLowerCase()}.port`}
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.port`}
              control={control}
              render={({ field }) =>
                isJob ? (
                  <InputTextSmall
                    className="shrink-0 grow flex-1"
                    dataTestId="input-job-liveness-probe-port"
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
                    dataTestId="input-liveness-probe-port"
                    name={field.name}
                    defaultValue={field.value || ''}
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
                )
              }
            />
          ),
        },
        {
          className: rowClassName,
          content: typeReadiness !== ProbeTypeEnum.NONE && typeReadiness !== ProbeTypeEnum.EXEC && (
            <Controller
              key={`readiness_probe.type.${typeReadiness?.toLowerCase()}.port`}
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.port`}
              control={control}
              render={({ field }) =>
                isJob ? (
                  <InputTextSmall
                    className="shrink-0 grow flex-1"
                    dataTestId="input-job-readiness-probe-port"
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
                    dataTestId="input-readiness-probe-port"
                    name={field.name}
                    defaultValue={field.value || ''}
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
                )
              }
            />
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.HTTP || typeLiveness === ProbeTypeEnum.HTTP) {
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
          content: typeLiveness === ProbeTypeEnum.HTTP && (
            <Controller
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.path`}
              control={control}
              defaultValue="/"
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-path"
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
          content: typeReadiness === ProbeTypeEnum.HTTP && (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.path`}
              control={control}
              defaultValue="/"
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-path"
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
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.EXEC || typeLiveness === ProbeTypeEnum.EXEC) {
    tableBody.push({
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Command
              <Tooltip content='Allows you to specify the command to run within your container to verify the status of your application. Expected format: ["cat", "/tmp/healthy"].'>
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness === ProbeTypeEnum.EXEC && (
            <Controller
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.command`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-command"
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
          content: typeReadiness === ProbeTypeEnum.EXEC && (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.command`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-command"
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

  if (typeReadiness === ProbeTypeEnum.GRPC || typeLiveness === ProbeTypeEnum.GRPC) {
    tableBody.push({
      cells: [
        {
          content: (
            <div className="flex justify-between w-full">
              Service
              <Tooltip content="Allows you to specify a different service name to be used for the health check. This lets you use the same endpoint for different kinds of container health check.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness === ProbeTypeEnum.GRPC && (
            <Controller
              name={`liveness_probe.type.${typeLiveness?.toLowerCase()}.service`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-service"
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
          content: typeReadiness === ProbeTypeEnum.GRPC && (
            <Controller
              name={`readiness_probe.type.${typeReadiness?.toLowerCase()}.service`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-service"
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
              <Tooltip content="Allows you to specify an interval, in seconds, between the application container start and the first check.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeEnum.NONE && (
            <Controller
              name="liveness_probe.initial_delay_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-delay"
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
          content: typeReadiness !== ProbeTypeEnum.NONE && (
            <Controller
              name="readiness_probe.initial_delay_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-delay"
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
          content: typeLiveness !== ProbeTypeEnum.NONE && (
            <Controller
              name="liveness_probe.period_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-period"
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
          content: typeReadiness !== ProbeTypeEnum.NONE && (
            <Controller
              name="readiness_probe.period_seconds"
              control={control}
              rules={{ required: 'This field is required' }}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-period"
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
              <Tooltip content="Allows you to specify the interval, in seconds, after which the probe times out.">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeEnum.NONE && (
            <Controller
              name="liveness_probe.timeout_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-timeout"
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
          content: typeReadiness !== ProbeTypeEnum.NONE && (
            <Controller
              name="readiness_probe.timeout_seconds"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-timeout"
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
              <Tooltip content="Allows you to specify how many consecutive successes are needed, as a minimum, for the probe to be considered successful after having failed previously. Kubernetes force this value to 1">
                <span>
                  <IconFa className="text-text-400" name={IconAwesomeEnum.CIRCLE_INFO} />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          className: rowClassName,
          content: typeLiveness !== ProbeTypeEnum.NONE && (
            <Controller
              name="liveness_probe.success_threshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  disabled
                  dataTestId="input-liveness-probe-threshold"
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
          content: typeReadiness !== ProbeTypeEnum.NONE && (
            <Controller
              name="readiness_probe.success_threshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  disabled
                  dataTestId="input-readiness-probe-threshold"
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
          content: typeLiveness !== ProbeTypeEnum.NONE && (
            <Controller
              name="liveness_probe.failure_threshold"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-liveness-probe-fail-threshold"
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
          content: typeReadiness !== ProbeTypeEnum.NONE && (
            <Controller
              name="readiness_probe.failure_threshold"
              rules={{ required: 'This field is required' }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputTextSmall
                  className="shrink-0 grow flex-1"
                  dataTestId="input-readiness-probe-fail-threshold"
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
