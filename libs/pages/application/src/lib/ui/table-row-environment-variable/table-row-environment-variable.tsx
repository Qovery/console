import {
  ButtonIconAction,
  ButtonIconActionElementProps,
  Icon,
  Skeleton,
  TableHeadProps,
  TableRow,
} from '@console/shared/ui'
import { timeAgo } from '@console/shared/utils'
import { EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'
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

  // const buttonActionsDefault = [
  //   {
  //     iconLeft: <Icon name="icon-solid-play" />,
  //     iconRight: <Icon name="icon-solid-angle-down" />,
  //     menusClassName: 'border-r border-r-element-light-lighter-500',
  //   },
  // ]

  return (
    <TableRow columnsWidth={columnsWidth}>
      <>
        <div className="flex items-center px-4">
          <div className="mx-3">
            <Skeleton show={isLoading} width={16} height={16}>
              <div className="cursor-pointer mt-0.5 text-text-600 text-ssm font-medium flex items-center">
                {' '}
                {variable.aliased_variable ? (
                  <>
                    <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
                    <span className="bg-accent3-500 font-bold rounded-sm text-xxs text-text-100 px-1 inline-flex items-center h-4 mr-3">
                      ALIAS
                    </span>
                  </>
                ) : variable.overridden_variable ? (
                  <>
                    <Icon name={IconEnum.CHILDREN_ARROW} className="mr-2 ml-1" />
                    <span className="bg-brand-500 font-bold rounded-sm text-xxs text-text-100 px-1 inline-flex items-center h-4 mr-3">
                      ALIAS
                    </span>
                  </>
                ) : (
                  ''
                )}
                {variable.key}
              </div>
            </Skeleton>
          </div>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center">
              <p className="flex items-center leading-7 text-text-400 text-sm">
                <span className="text-xs text-text-300 mx-3 font-medium">
                  {timeAgo(variable.updated_at ? new Date(variable.updated_at) : new Date(variable.created_at))} ago
                </span>
              </p>
              <ButtonIconAction actions={rowActions} />
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <Skeleton show={isLoading} width={30} height={16}>
            <span className="text-xs text-text-600">{variable.value}</span>
          </Skeleton>
        </div>
        <div className="text-text-600 text-ssm font-medium px-4">{variable.service_name}</div>
        <div className="text-text-600 text-ssm capitalize font-medium px-4 ">{variable.scope.toLowerCase()}</div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironmentVariable
