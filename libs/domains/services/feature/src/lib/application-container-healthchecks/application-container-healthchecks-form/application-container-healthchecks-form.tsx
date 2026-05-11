import { Controller, useFormContext } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { Icon, InputSelectSmall, InputTextSmall, TableEdition, type TableEditionRow, Tooltip } from '@qovery/shared/ui'

export interface ApplicationContainerHealthchecksFormProps {
  ports?: number[]
}

export function ApplicationContainerHealthchecksForm({ ports = [] }: ApplicationContainerHealthchecksFormProps) {
  const { control, watch } = useFormContext<HealthcheckData>()

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
            <div className="flex w-full justify-between">
              Liveness
              <Tooltip content="Verifies if the container is operating and it is not in a broken state.">
                <span>
                  <Icon className="text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
                </span>
              </Tooltip>
            </div>
          ),
        },
        {
          content: (
            <div className="flex w-full justify-between">
              Readiness
              <Tooltip content="Verifies if the application is ready to receive traffic.">
                <span>
                  <Icon className="text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
                </span>
              </Tooltip>
            </div>
          ),
        },
      ],
    },
  ]

  const rowClassName = '!p-1 hover:bg-initial'

  const selectType = (name: 'liveness_probe.current_type' | 'readiness_probe.current_type', testId: string) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <InputSelectSmall
          className="flex-1 shrink-0 grow"
          inputClassName="!bg-surface-neutral-component"
          dataTestId={testId}
          name={field.name}
          defaultValue={field.value || ''}
          onChange={field.onChange}
          items={Object.values(ProbeTypeEnum).map((value) => ({
            label: value,
            value,
          }))}
        />
      )}
    />
  )

  const renderPortSelect = (name: string, testId: string, enabled: boolean) =>
    enabled ? (
      <Controller
        key={name}
        name={name as never}
        control={control}
        render={({ field }) => (
          <InputSelectSmall
            className="flex-1 shrink-0 grow"
            inputClassName="!bg-surface-neutral-component"
            dataTestId={testId}
            name={field.name}
            defaultValue={field.value || ''}
            onChange={field.onChange}
            items={ports.map((value) => ({
              label: `${value}`,
              value: `${value}`,
            }))}
          />
        )}
      />
    ) : null

  const renderTextInput = (name: string, testId: string, enabled: boolean, defaultValue?: string) =>
    enabled ? (
      <Controller
        name={name as never}
        control={control}
        defaultValue={defaultValue as never}
        render={({ field, fieldState: { error } }) => (
          <InputTextSmall
            className="flex-1 shrink-0 grow"
            dataTestId={testId}
            name={field.name}
            onChange={field.onChange}
            value={`${field.value ?? ''}`}
            error={error?.message}
            errorMessagePosition="left"
            label={field.name}
          />
        )}
      />
    ) : null

  const tableBody: TableEditionRow[] = [
    {
      cells: [
        { content: 'Type' },
        {
          className: rowClassName,
          content: selectType('liveness_probe.current_type', 'input-liveness-probe-current-type'),
        },
        {
          className: rowClassName,
          content: selectType('readiness_probe.current_type', 'input-readiness-probe-current-type'),
        },
      ],
    },
  ]

  if (typeReadiness !== ProbeTypeEnum.EXEC || typeLiveness !== ProbeTypeEnum.EXEC) {
    tableBody.push({
      cells: [
        { content: 'Port' },
        {
          className: rowClassName,
          content: renderPortSelect(
            `liveness_probe.type.${typeLiveness?.toLowerCase()}.port`,
            'input-liveness-probe-port',
            typeLiveness !== ProbeTypeEnum.NONE && typeLiveness !== ProbeTypeEnum.EXEC
          ),
        },
        {
          className: rowClassName,
          content: renderPortSelect(
            `readiness_probe.type.${typeReadiness?.toLowerCase()}.port`,
            'input-readiness-probe-port',
            typeReadiness !== ProbeTypeEnum.NONE && typeReadiness !== ProbeTypeEnum.EXEC
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.HTTP || typeLiveness === ProbeTypeEnum.HTTP) {
    tableBody.push({
      cells: [
        { content: 'Path' },
        {
          className: rowClassName,
          content: renderTextInput(
            `liveness_probe.type.${typeLiveness?.toLowerCase()}.path`,
            'input-liveness-probe-path',
            typeLiveness === ProbeTypeEnum.HTTP,
            '/'
          ),
        },
        {
          className: rowClassName,
          content: renderTextInput(
            `readiness_probe.type.${typeReadiness?.toLowerCase()}.path`,
            'input-readiness-probe-path',
            typeReadiness === ProbeTypeEnum.HTTP,
            '/'
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.EXEC || typeLiveness === ProbeTypeEnum.EXEC) {
    tableBody.push({
      cells: [
        { content: 'Command' },
        {
          className: rowClassName,
          content: renderTextInput(
            `liveness_probe.type.${typeLiveness?.toLowerCase()}.command`,
            'input-liveness-probe-command',
            typeLiveness === ProbeTypeEnum.EXEC
          ),
        },
        {
          className: rowClassName,
          content: renderTextInput(
            `readiness_probe.type.${typeReadiness?.toLowerCase()}.command`,
            'input-readiness-probe-command',
            typeReadiness === ProbeTypeEnum.EXEC
          ),
        },
      ],
    })
  }

  if (typeReadiness === ProbeTypeEnum.GRPC || typeLiveness === ProbeTypeEnum.GRPC) {
    tableBody.push({
      cells: [
        { content: 'Service' },
        {
          className: rowClassName,
          content: renderTextInput(
            `liveness_probe.type.${typeLiveness?.toLowerCase()}.service`,
            'input-liveness-probe-service',
            typeLiveness === ProbeTypeEnum.GRPC
          ),
        },
        {
          className: rowClassName,
          content: renderTextInput(
            `readiness_probe.type.${typeReadiness?.toLowerCase()}.service`,
            'input-readiness-probe-service',
            typeReadiness === ProbeTypeEnum.GRPC
          ),
        },
      ],
    })
  }

  const probeFields: [string, string, string][] = [
    ['Initial Delay (in seconds)', 'initial_delay_seconds', 'delay'],
    ['Period (in seconds)', 'period_seconds', 'period'],
    ['Timeout (in seconds)', 'timeout_seconds', 'timeout'],
    ['Success Threshold', 'success_threshold', 'threshold'],
    ['Failure Threshold', 'failure_threshold', 'fail-threshold'],
  ]
  probeFields.forEach(([label, field, suffix]) => {
    tableBody.push({
      cells: [
        { content: label },
        {
          className: rowClassName,
          content: renderTextInput(
            `liveness_probe.${field}`,
            `input-liveness-probe-${suffix}`,
            typeLiveness !== ProbeTypeEnum.NONE
          ),
        },
        {
          className: rowClassName,
          content: renderTextInput(
            `readiness_probe.${field}`,
            `input-readiness-probe-${suffix}`,
            typeReadiness !== ProbeTypeEnum.NONE
          ),
        },
      ],
    })
  })

  return (
    <TableEdition
      key={`${typeLiveness}.${typeReadiness}`}
      className="mb-5 border border-neutral bg-surface-neutral-subtle text-sm font-medium text-neutral"
      tableBody={[...tableHead, ...tableBody]}
    />
  )
}

export default ApplicationContainerHealthchecksForm
