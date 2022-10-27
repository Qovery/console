import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { IconEnum } from '@qovery/shared/enums'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  SecretEnvironmentVariableEntity,
} from '@qovery/shared/interfaces'
import { APPLICATION_URL } from '@qovery/shared/router'
import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  PasswordShowHide,
  ScrollIntoView,
  Skeleton,
  TableHeadProps,
  TableRow,
  Tooltip,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@qovery/shared/utils'

export interface TableRowEnvironmentVariableProps {
  variable: EnvironmentVariableSecretOrPublic
  dataHead: TableHeadProps[]
  rowActions: ButtonIconActionElementProps[]
  columnsWidth?: string
  isLoading: boolean
  defaultShowHidePassword?: boolean
}

export function TableRowEnvironmentVariable(props: TableRowEnvironmentVariableProps) {
  const {
    variable,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    isLoading,
    rowActions,
    defaultShowHidePassword = false,
  } = props
  const { projectId = '', environmentId = '', organizationId = '' } = useParams()

  return (
    <>
      {props.variable.is_new && <ScrollIntoView />}
      <TableRow columnsWidth={columnsWidth} isNew={props.variable.is_new}>
        <>
          <div className="flex items-center px-4">
            <div className="mx-3 w-full">
              <Skeleton show={isLoading} width={250} height={16}>
                <div className="cursor-pointer w-full mt-0.5 text-text-600 text-ssm font-medium flex items-center">
                  {' '}
                  {(variable as EnvironmentVariableEntity).aliased_variable ||
                  (variable as SecretEnvironmentVariableEntity).aliased_secret ? (
                    <>
                      <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
                      <span className="bg-accent3-500 font-bold rounded-sm text-xxs text-text-100 px-1 inline-flex items-center h-4 mr-3">
                        ALIAS
                      </span>
                    </>
                  ) : (variable as EnvironmentVariableEntity).overridden_variable ||
                    (variable as SecretEnvironmentVariableEntity).overridden_secret ? (
                    <>
                      <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
                      <span className="bg-brand-500 font-bold rounded-sm text-xxs text-text-100 px-1 inline-flex items-center h-4 mr-3">
                        OVERRIDE
                      </span>
                    </>
                  ) : (
                    ''
                  )}
                  <Tooltip align="start" content={variable.key || ''}>
                    <span className="truncate w-full">{variable.key}</span>
                  </Tooltip>
                </div>
              </Skeleton>
            </div>
          </div>
          <div className="flex justify-end justify-items-center px-3">
            <Skeleton show={isLoading} width={200} height={16}>
              <div className="flex items-center">
                <p className="flex items-center leading-7 text-text-400 text-sm">
                  <Tooltip
                    content={
                      variable.updated_at
                        ? dateYearMonthDayHourMinuteSecond(new Date(variable.updated_at))
                        : dateYearMonthDayHourMinuteSecond(new Date(variable.created_at))
                    }
                  >
                    <span className="text-xs text-text-300 mx-3 font-medium">
                      {timeAgo(variable.updated_at ? new Date(variable.updated_at) : new Date(variable.created_at))} ago
                    </span>
                  </Tooltip>
                </p>
                <ButtonIconAction actions={rowActions} />
              </div>
            </Skeleton>
          </div>
          <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full max-w-3xl">
            <Skeleton show={isLoading} width={30} height={16} className="w-full">
              <div className="text-xs text-text-600 w-full">
                {variable.variable_type === 'public' ? (
                  <PasswordShowHide
                    value={(variable as EnvironmentVariableEntity).value}
                    defaultVisible={defaultShowHidePassword}
                    canCopy={true}
                  />
                ) : (
                  <PasswordShowHide value="" defaultVisible={false} isSecret={true} />
                )}
              </div>
            </Skeleton>
          </div>
          <div className="text-text-600 text-ssm font-medium px-4">
            {variable.scope === APIVariableScopeEnum.BUILT_IN && variable.service_type ? (
              <NavLink
                className="flex gap-2 items-center"
                to={APPLICATION_URL(organizationId, projectId, environmentId, variable.service_id) + '/general'}
              >
                <Icon name={variable.service_type?.toString() || ''} className="w-4" />
                {variable.service_name}
              </NavLink>
            ) : (
              ''
            )}
          </div>
          <div className="text-text-600 text-ssm capitalize font-medium px-4 ">{variable.scope.toLowerCase()}</div>
        </>
      </TableRow>
    </>
  )
}

export default TableRowEnvironmentVariable
