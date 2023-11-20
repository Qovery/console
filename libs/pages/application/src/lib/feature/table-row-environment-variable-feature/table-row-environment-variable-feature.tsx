import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useActionRedeployEnvironment } from '@qovery/domains/environment'
import { useDeleteVariable } from '@qovery/domains/variables/feature'
import { ExternalServiceEnum, type ServiceTypeEnum } from '@qovery/shared/enums'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import {
  type ButtonIconActionElementProps,
  Icon,
  IconAwesomeEnum,
  type MenuItemProps,
  type TableFilterProps,
  type TableHeadProps,
  ToastEnum,
  toast,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { environmentVariableFile } from '@qovery/shared/util-js'
import { ApplicationContext } from '../../ui/container/container'
import TableRowEnvironmentVariable from '../../ui/table-row-environment-variable/table-row-environment-variable'
import CrudEnvironmentVariableModalFeature, {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'

export interface TableRowEnvironmentVariableFeatureProps {
  variable: EnvironmentVariableSecretOrPublic
  dataHead: TableHeadProps<EnvironmentVariableSecretOrPublic>[]
  filter: TableFilterProps[]
  isLoading: boolean
  columnsWidth?: string
  serviceType?: ServiceTypeEnum
}

export function TableRowEnvironmentVariableFeature(props: TableRowEnvironmentVariableFeatureProps) {
  const { variable, filter, dataHead, columnsWidth = '30% 10% 30% 15% 15%' } = props
  const { openModal, closeModal } = useModal()
  const { organizationId = '', applicationId = '', projectId = '', environmentId = '' } = useParams()
  const { openModalConfirmation } = useModalConfirmation()
  const { showHideAllEnvironmentVariablesValues: defaultShowHideValue } = useContext(ApplicationContext)
  const navigate = useNavigate()

  const actionRedeployEnvironment = useActionRedeployEnvironment(projectId, environmentId, false, undefined, () =>
    navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId))
  )

  const { mutateAsync: deleteVariable } = useDeleteVariable()

  const edit = (type: EnvironmentVariableType) => ({
    name: 'Edit',
    onClick: () => {
      openModal({
        content: (
          <CrudEnvironmentVariableModalFeature
            closeModal={closeModal}
            variable={variable}
            mode={EnvironmentVariableCrudMode.EDITION}
            organizationId={organizationId}
            applicationId={applicationId}
            projectId={projectId}
            environmentId={environmentId}
            type={type}
            serviceType={props.serviceType}
            isFile={environmentVariableFile(variable)}
          />
        ),
      })
    },
    contentLeft: <Icon name="icon-solid-pen" className="text-sm text-brand-500" />,
  })

  const disableOverride = match(variable.scope)
    .with('APPLICATION', 'CONTAINER', 'JOB', () => true)
    .otherwise(() => false)
  const createOverride = {
    name: 'Create override',
    disabled: disableOverride,
    tooltip: disableOverride ? 'You can’t override variables on the application scope' : undefined,
    onClick: () => {
      openModal({
        content: (
          <CrudEnvironmentVariableModalFeature
            closeModal={closeModal}
            variable={variable}
            type={EnvironmentVariableType.OVERRIDE}
            mode={EnvironmentVariableCrudMode.CREATION}
            organizationId={organizationId}
            applicationId={applicationId}
            projectId={projectId}
            environmentId={environmentId}
            serviceType={props.serviceType}
            isFile={environmentVariableFile(variable)}
          />
        ),
      })
    },
    contentLeft: <Icon name="icon-solid-pen-line" className="text-sm text-brand-500" />,
  }

  const createAlias = {
    name: 'Create alias',
    onClick: () => {
      openModal({
        content: (
          <CrudEnvironmentVariableModalFeature
            closeModal={closeModal}
            variable={variable}
            type={EnvironmentVariableType.ALIAS}
            mode={EnvironmentVariableCrudMode.CREATION}
            organizationId={organizationId}
            applicationId={applicationId}
            projectId={projectId}
            environmentId={environmentId}
            serviceType={props.serviceType}
            isFile={environmentVariableFile(variable)}
          />
        ),
      })
    },
    contentLeft: <Icon name="icon-solid-pen-swirl" className="text-sm text-brand-500" />,
  }

  const computeMenuActions = (): MenuItemProps[] => {
    const menu = []
    let variableType: EnvironmentVariableType = EnvironmentVariableType.NORMAL

    if (variable.overridden_variable) {
      variableType = EnvironmentVariableType.OVERRIDE
    } else if (variable.aliased_variable) {
      variableType = EnvironmentVariableType.ALIAS
    }

    if (variable.scope !== APIVariableScopeEnum.BUILT_IN) menu.push(edit(variableType))

    if (!variable.overridden_variable && !variable.aliased_variable) {
      menu.push(createAlias)

      if (variable.scope !== APIVariableScopeEnum.BUILT_IN) menu.push(createOverride)
    }

    return menu
  }

  const rowActions: ButtonIconActionElementProps[] = [
    {
      iconLeft: <Icon name={IconAwesomeEnum.ELLIPSIS_V} />,
      menus: [
        {
          items:
            variable.owned_by === ExternalServiceEnum.DOPPLER
              ? [
                  {
                    name: 'Edit in Doppler',
                    contentLeft: (
                      <Icon name={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE} className="text-sm text-brand-500" />
                    ),
                    link: {
                      url: 'https://dashboard.doppler.com',
                      external: true,
                    },
                  },
                ]
              : computeMenuActions(),
        },
      ],
    },
  ]

  if (variable.owned_by === 'QOVERY' && variable.scope !== APIVariableScopeEnum.BUILT_IN) {
    rowActions[0]?.menus?.push({
      items: [
        {
          name: 'Delete',
          textClassName: '!text-red-600',
          onClick: () => {
            openModalConfirmation({
              title: 'Delete variable',
              name: variable.key,
              isDelete: true,
              action: async () => {
                await deleteVariable({ variableId: variable.id })
                let name = variable.key
                if (name && name.length > 30) {
                  name = name.substring(0, 30) + '...'
                }
                const toasterCallback = () => actionRedeployEnvironment.mutate()
                toast(
                  ToastEnum.SUCCESS,
                  'Deletion success',
                  `${name} has been deleted. You need to redeploy your environment for your changes to be applied.`,
                  toasterCallback,
                  undefined,
                  'Redeploy'
                )
              },
            })
          },
          contentLeft: <Icon name={IconAwesomeEnum.TRASH} className="text-sm text-red-600" />,
        },
      ],
    })
  }

  return (
    <TableRowEnvironmentVariable
      variable={variable}
      filter={filter}
      dataHead={dataHead}
      rowActions={rowActions}
      isLoading={props.isLoading}
      columnsWidth={columnsWidth}
      defaultShowHidePassword={defaultShowHideValue}
    />
  )
}

export default TableRowEnvironmentVariableFeature
