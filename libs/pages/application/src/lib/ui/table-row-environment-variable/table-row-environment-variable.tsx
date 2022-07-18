import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  PasswordShowHide,
  Skeleton,
  TableHeadProps,
  TableRow,
  Tooltip,
} from '@console/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@console/shared/utils'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  SecretEnvironmentVariableEntity,
} from '@console/shared/interfaces'
import { IconEnum } from '@console/shared/enums'

export interface TableRowEnvironmentVariableProps {
  variable: EnvironmentVariableSecretOrPublic
  dataHead: TableHeadProps[]
  rowActions: ButtonIconActionElementProps[]
  columnsWidth?: string
  isLoading: boolean
}

export function TableRowEnvironmentVariable(props: TableRowEnvironmentVariableProps) {
  const { variable, dataHead, columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`, isLoading, rowActions } = props

  return (
    <TableRow columnsWidth={columnsWidth}>
      <>
        <div onClick={() => console.log(props.variable)} className="flex items-center px-4">
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
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <Skeleton show={isLoading} width={30} height={16} className="w-full">
            <div className="text-xs text-text-600 w-full">
              {variable.variable_type === 'public' ? (
                <PasswordShowHide
                  value={(variable as EnvironmentVariableEntity).value}
                  defaultVisible={false}
                  canCopy={true}
                />
              ) : (
                <PasswordShowHide value="" defaultVisible={false} isSecret={true} />
              )}
            </div>
          </Skeleton>
        </div>
        <div className="text-text-600 text-ssm font-medium px-4">{variable.service_name}</div>
        <div className="text-text-600 text-ssm capitalize font-medium px-4 ">{variable.scope.toLowerCase()}</div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironmentVariable
