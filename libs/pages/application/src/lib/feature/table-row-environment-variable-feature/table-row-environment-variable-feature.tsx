import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  SecretEnvironmentVariableEntity,
} from '@console/shared/interfaces'
import { ButtonIconActionElementProps, Icon, MenuItemProps, ModalContext, TableHeadProps } from '@console/shared/ui'
import TableRowEnvironmentVariable from '../../ui/table-row-environment-variable/table-row-environment-variable'
import { useContext } from 'react'
import CrudEnvironmentVariableModalFeature, {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import { useParams } from 'react-router'
import { deleteEnvironmentVariable, deleteSecret } from '@console/domains/environment-variable'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'

export interface TableRowEnvironmentVariableFeatureProps {
  variable: EnvironmentVariableSecretOrPublic
  dataHead: TableHeadProps[]
  columnsWidth?: string
  isLoading: boolean
}

export function TableRowEnvironmentVariableFeature(props: TableRowEnvironmentVariableFeatureProps) {
  const { variable, dataHead, columnsWidth = '30% 10% 30% 15% 15%' } = props
  const { setOpenModal, setContentModal } = useContext(ModalContext)
  const { applicationId = '', projectId = '', environmentId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()

  const edit = {
    name: 'Edit',
    onClick: () => {
      setOpenModal(true)
      setContentModal(
        <CrudEnvironmentVariableModalFeature
          setOpen={setOpenModal}
          variable={variable}
          mode={EnvironmentVariableCrudMode.EDITION}
          applicationId={applicationId}
          projectId={projectId}
          environmentId={environmentId}
          type={EnvironmentVariableType.NORMAL}
        />
      )
    },
    contentLeft: <Icon name="icon-solid-pen" className="text-sm text-brand-500" />,
  }

  const createOverride = {
    name: 'Create override',
    onClick: () => {
      setOpenModal(true)
      setContentModal(
        <CrudEnvironmentVariableModalFeature
          setOpen={setOpenModal}
          variable={variable}
          type={EnvironmentVariableType.OVERRIDE}
          mode={EnvironmentVariableCrudMode.CREATION}
          applicationId={applicationId}
          projectId={projectId}
          environmentId={environmentId}
        />
      )
    },
    contentLeft: <Icon name="icon-solid-pen-line" className="text-sm text-brand-500" />,
  }

  const createAlias = {
    name: 'Create alias',
    onClick: () => {
      setOpenModal(true)
      setContentModal(
        <CrudEnvironmentVariableModalFeature
          setOpen={setOpenModal}
          variable={variable}
          type={EnvironmentVariableType.ALIAS}
          mode={EnvironmentVariableCrudMode.CREATION}
          applicationId={applicationId}
          projectId={projectId}
          environmentId={environmentId}
        />
      )
    },
    contentLeft: <Icon name="icon-solid-pen-swirl" className="text-sm text-brand-500" />,
  }

  const computeMenuActions = (): MenuItemProps[] => {
    const menu = []

    if (variable.scope !== EnvironmentVariableScopeEnum.BUILT_IN) menu.push(edit)

    if (
      !(
        (variable as EnvironmentVariableEntity).overridden_variable ||
        (variable as SecretEnvironmentVariableEntity).overridden_secret
      ) &&
      !(
        (variable as EnvironmentVariableEntity).aliased_variable ||
        (variable as SecretEnvironmentVariableEntity).aliased_secret
      )
    ) {
      menu.push(createAlias)

      if (variable.scope !== EnvironmentVariableScopeEnum.BUILT_IN) menu.push(createOverride)
    }

    return menu
  }

  const rowActions: ButtonIconActionElementProps[] = [
    {
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
      menus: [
        {
          items: computeMenuActions(),
        },
      ],
    },
  ]

  if (variable.scope !== EnvironmentVariableScopeEnum.BUILT_IN) {
    rowActions[0]?.menus?.push({
      items: [
        {
          name: 'Delete',
          textClassName: '!text-error-600',
          onClick: () => {
            let entityId: string
            switch (variable.scope) {
              case EnvironmentVariableScopeEnum.ENVIRONMENT:
                entityId = environmentId
                break
              case EnvironmentVariableScopeEnum.PROJECT:
                entityId = projectId
                break
              case EnvironmentVariableScopeEnum.APPLICATION:
              default:
                entityId = applicationId
                break
            }

            if (variable.variable_type === 'public') {
              dispatch(
                deleteEnvironmentVariable({ entityId, environmentVariableId: variable.id, scope: variable.scope })
              )
            } else {
              dispatch(
                deleteSecret({
                  entityId,
                  environmentVariableId: variable.id,
                  scope: variable.scope,
                })
              )
            }
          },
          contentLeft: <Icon name="icon-solid-trash" className="text-sm text-error-600" />,
        },
      ],
    })
  }

  return (
    <TableRowEnvironmentVariable
      variable={variable}
      dataHead={dataHead}
      rowActions={rowActions}
      isLoading={props.isLoading}
      columnsWidth={columnsWidth}
    />
  )
}

export default TableRowEnvironmentVariableFeature
