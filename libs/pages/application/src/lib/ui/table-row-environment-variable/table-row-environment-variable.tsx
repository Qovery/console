import { type ClickEvent } from '@szhsin/react-menu'
import { LinkedServiceTypeEnum } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ExternalServiceEnum, IconEnum } from '@qovery/shared/enums'
import {
  type EnvironmentVariableEntity,
  type EnvironmentVariableSecretOrPublic,
  type SecretEnvironmentVariableEntity,
} from '@qovery/shared/interfaces'
import { APPLICATION_GENERAL_URL, APPLICATION_URL, DATABASE_GENERAL_URL, DATABASE_URL } from '@qovery/shared/routes'
import {
  ButtonIconAction,
  type ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  PasswordShowHide,
  ScrollIntoView,
  Skeleton,
  type TableFilterProps,
  type TableHeadProps,
  TableRow,
  Tooltip,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@qovery/shared/util-dates'
import { environmentVariableFile, getEnvironmentVariableFileMountPath } from '@qovery/shared/utils'

export interface TableRowEnvironmentVariableProps {
  variable: EnvironmentVariableSecretOrPublic
  dataHead: TableHeadProps<EnvironmentVariableEntity>[]
  rowActions: ButtonIconActionElementProps[]
  filter: TableFilterProps[]
  columnsWidth?: string
  isLoading: boolean
  defaultShowHidePassword?: boolean
}

export function TableRowEnvironmentVariable(props: TableRowEnvironmentVariableProps) {
  const {
    variable,
    dataHead,
    filter,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    isLoading,
    rowActions,
    defaultShowHidePassword = false,
  } = props
  const { projectId = '', environmentId = '', organizationId = '' } = useParams()

  const editFile = useMemo(() => {
    if (props.rowActions && props.rowActions.length > 0 && props.rowActions[0].menus) {
      return props.rowActions[0].menus[0].items[0].onClick
    }
    return
  }, [props.rowActions])

  return (
    <>
      {variable.is_new && <ScrollIntoView />}
      <TableRow data={variable} filter={filter} columnsWidth={columnsWidth} isNew={props.variable.is_new}>
        <>
          <div className="flex items-center px-4">
            <div className="mx-3 w-full">
              <Skeleton show={isLoading} width={250} height={16}>
                <div className="cursor-pointer w-full mt-0.5 text-neutral-400 text-ssm font-medium flex items-center">
                  {variable.owned_by === ExternalServiceEnum.DOPPLER && (
                    <span
                      data-testid="doppler-tag"
                      className="bg-[#3391FB] font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2"
                    >
                      {variable.owned_by}
                    </span>
                  )}{' '}
                  {(variable as EnvironmentVariableEntity).aliased_variable ||
                  (variable as SecretEnvironmentVariableEntity).aliased_secret ? (
                    <>
                      <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
                      <span className="bg-teal-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2">
                        ALIAS
                      </span>
                    </>
                  ) : (variable as EnvironmentVariableEntity).overridden_variable ||
                    (variable as SecretEnvironmentVariableEntity).overridden_secret ? (
                    <>
                      <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
                      <span className="bg-brand-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2">
                        OVERRIDE
                      </span>
                    </>
                  ) : (
                    ''
                  )}
                  {(variable as EnvironmentVariableEntity).mount_path ? (
                    <span className="bg-purple-500 font-bold rounded-sm text-2xs text-neutral-50 px-1 inline-flex items-center h-4 mr-2">
                      FILE
                    </span>
                  ) : (
                    ''
                  )}
                  <Tooltip align="start" content={variable.key || ''}>
                    <span className="truncate">{variable.key}</span>
                  </Tooltip>
                  {variable.owned_by === ExternalServiceEnum.DOPPLER && (
                    <Tooltip content="Sync with Doppler">
                      <span className="ml-2">
                        <Icon name={IconEnum.DOPPLER} width="11px" height="11px" />
                      </span>
                    </Tooltip>
                  )}
                </div>
              </Skeleton>
            </div>
          </div>
          <div className="flex justify-end justify-items-center px-3">
            <Skeleton show={isLoading} width={200} height={16}>
              <div className="flex items-center">
                <p className="flex items-center leading-7 text-neutral-350 text-sm">
                  <Tooltip
                    content={
                      variable.updated_at
                        ? dateYearMonthDayHourMinuteSecond(new Date(variable.updated_at))
                        : dateYearMonthDayHourMinuteSecond(new Date(variable.created_at))
                    }
                  >
                    <span className="text-xs text-neutral-300 mx-3 font-medium">
                      {timeAgo(variable.updated_at ? new Date(variable.updated_at) : new Date(variable.created_at))} ago
                    </span>
                  </Tooltip>
                </p>
                <ButtonIconAction actions={rowActions} />
              </div>
            </Skeleton>
          </div>
          <div className="flex items-center px-4 border-b-neutral-200 border-l h-full max-w-3xl">
            <Skeleton show={isLoading} width={30} height={16} className="w-full">
              <div className="text-xs text-neutral-400 w-full">
                {environmentVariableFile(variable) ? (
                  <div
                    className="flex items-center gap-3"
                    onClick={() => {
                      if (editFile) editFile({} as ClickEvent)
                    }}
                  >
                    {variable.variable_kind === 'public' ? (
                      <Icon className="ml-0.5 text-neutral-400" name={IconAwesomeEnum.FILE_LINES} />
                    ) : (
                      /* todo put FILE_LOCK back when we managed to update font awesome to the pro version */
                      // <Icon className="ml-0.5 text-neutral-400" name={IconAwesomeEnum.FILE_LOCK} />
                      <Icon className="ml-0.5 text-neutral-400" name={IconAwesomeEnum.FILE_LINES} />
                    )}
                    <span className="text-sky-500 hover:underline cursor-pointer">
                      {getEnvironmentVariableFileMountPath(variable)}
                    </span>
                  </div>
                ) : variable.variable_kind === 'public' ? (
                  <PasswordShowHide
                    value={variable.value || ''}
                    defaultVisible={defaultShowHidePassword}
                    canCopy={true}
                  />
                ) : (
                  <PasswordShowHide value="" defaultVisible={false} isSecret={true} />
                )}
              </div>
            </Skeleton>
          </div>
          <div className="text-neutral-400 text-ssm font-medium px-4">
            {variable.service_name && variable.service_type && variable.service_id ? (
              <NavLink
                className="flex gap-2 items-center"
                to={
                  variable.service_type !== LinkedServiceTypeEnum.DATABASE
                    ? APPLICATION_URL(organizationId, projectId, environmentId, variable.service_id) +
                      APPLICATION_GENERAL_URL
                    : DATABASE_URL(organizationId, projectId, environmentId, variable.service_id) + DATABASE_GENERAL_URL
                }
              >
                {variable.service_type !== LinkedServiceTypeEnum.JOB && (
                  <Icon name={variable.service_type?.toString() || ''} className="w-4" />
                )}
                {variable.service_name}
              </NavLink>
            ) : (
              ''
            )}
          </div>
          <div className="text-neutral-400 text-ssm capitalize font-medium px-4 ">{variable.scope.toLowerCase()}</div>
        </>
      </TableRow>
    </>
  )
}

export default TableRowEnvironmentVariable
