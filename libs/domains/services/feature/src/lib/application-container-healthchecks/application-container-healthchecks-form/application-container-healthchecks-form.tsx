import { Controller, useFormContext } from 'react-hook-form'
import { ProbeTypeEnum } from '@qovery/shared/enums'
import { type HealthcheckData } from '@qovery/shared/interfaces'
import { Icon, InputSelectSmall, InputTextSmall, TableEdition, type TableEditionRow, Tooltip } from '@qovery/shared/ui'
import { type ProbeName } from '../healthchecks-utils'

export interface ApplicationContainerHealthchecksFormProps {
  ports?: number[]
}

interface ProbeColumn {
  name: ProbeName
  label: string
  description: string
  testId: string
  type: ProbeTypeEnum
}

export function ApplicationContainerHealthchecksForm({ ports = [] }: ApplicationContainerHealthchecksFormProps) {
  const { control, watch } = useFormContext<HealthcheckData>()

  const probeColumns: ProbeColumn[] = [
    {
      name: 'liveness_probe',
      label: 'Liveness',
      description: 'Verifies if the container is operating and it is not in a broken state.',
      testId: 'liveness-probe',
      type: (watch('liveness_probe.current_type') as ProbeTypeEnum | undefined) || ProbeTypeEnum.NONE,
    },
    {
      name: 'readiness_probe',
      label: 'Readiness',
      description: 'Verifies if the application is ready to receive traffic.',
      testId: 'readiness-probe',
      type: (watch('readiness_probe.current_type') as ProbeTypeEnum | undefined) || ProbeTypeEnum.NONE,
    },
    {
      name: 'startup_probe',
      label: 'Startup',
      description:
        'Verifies if the application has started. Liveness and readiness checks wait until it succeeds, so a slow start does not trigger a restart.',
      testId: 'startup-probe',
      type: (watch('startup_probe.current_type') as ProbeTypeEnum | undefined) || ProbeTypeEnum.NONE,
    },
  ]

  const anyProbe = (predicate: (type: ProbeTypeEnum) => boolean) => probeColumns.some(({ type }) => predicate(type))

  const tableHead: TableEditionRow[] = [
    {
      cells: [
        {
          className: 'pr-10',
          content: 'Settings',
        },
        ...probeColumns.map(({ label, description }) => ({
          content: (
            <div className="flex w-full justify-between">
              {label}
              <Tooltip content={description}>
                <span>
                  <Icon className="text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
                </span>
              </Tooltip>
            </div>
          ),
        })),
      ],
    },
  ]

  const rowClassName = '!p-1 hover:bg-initial'

  const selectType = (name: `${ProbeName}.current_type`, testId: string) => (
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

  const probeRow = (label: string, renderCell: (column: ProbeColumn) => ReturnType<typeof renderTextInput>) => ({
    cells: [
      { content: label },
      ...probeColumns.map((column) => ({
        className: rowClassName,
        content: renderCell(column),
      })),
    ],
  })

  const tableBody: TableEditionRow[] = [
    probeRow('Type', ({ name, testId }) => selectType(`${name}.current_type`, `input-${testId}-current-type`)),
  ]

  const usesPort = (type: ProbeTypeEnum) => type !== ProbeTypeEnum.NONE && type !== ProbeTypeEnum.EXEC

  if (anyProbe(usesPort)) {
    tableBody.push(
      probeRow('Port', ({ name, testId, type }) =>
        renderPortSelect(`${name}.type.${type.toLowerCase()}.port`, `input-${testId}-port`, usesPort(type))
      )
    )
  }

  if (anyProbe((type) => type === ProbeTypeEnum.HTTP)) {
    tableBody.push(
      probeRow('Path', ({ name, testId, type }) =>
        renderTextInput(
          `${name}.type.${type.toLowerCase()}.path`,
          `input-${testId}-path`,
          type === ProbeTypeEnum.HTTP,
          '/'
        )
      )
    )
  }

  if (anyProbe((type) => type === ProbeTypeEnum.EXEC)) {
    tableBody.push(
      probeRow('Command', ({ name, testId, type }) =>
        renderTextInput(
          `${name}.type.${type.toLowerCase()}.command`,
          `input-${testId}-command`,
          type === ProbeTypeEnum.EXEC
        )
      )
    )
  }

  if (anyProbe((type) => type === ProbeTypeEnum.GRPC)) {
    tableBody.push(
      probeRow('Service', ({ name, testId, type }) =>
        renderTextInput(
          `${name}.type.${type.toLowerCase()}.service`,
          `input-${testId}-service`,
          type === ProbeTypeEnum.GRPC
        )
      )
    )
  }

  const probeFields: [string, string, string][] = [
    ['Initial Delay (in seconds)', 'initial_delay_seconds', 'delay'],
    ['Period (in seconds)', 'period_seconds', 'period'],
    ['Timeout (in seconds)', 'timeout_seconds', 'timeout'],
    ['Success Threshold', 'success_threshold', 'threshold'],
    ['Failure Threshold', 'failure_threshold', 'fail-threshold'],
  ]
  probeFields.forEach(([label, field, suffix]) => {
    tableBody.push(
      probeRow(label, ({ name, testId, type }) =>
        renderTextInput(`${name}.${field}`, `input-${testId}-${suffix}`, type !== ProbeTypeEnum.NONE)
      )
    )
  })

  return (
    <TableEdition
      key={probeColumns.map(({ type }) => type).join('.')}
      className="mb-5 border border-neutral bg-surface-neutral-subtle text-sm font-medium text-neutral"
      tableBody={[...tableHead, ...tableBody]}
    />
  )
}

export default ApplicationContainerHealthchecksForm
