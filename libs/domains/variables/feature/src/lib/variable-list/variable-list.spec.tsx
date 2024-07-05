import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { VariableList, type VariableListProps } from './variable-list'

jest.mock('../hooks/use-variables/use-variables', () => ({
  useVariables: () => ({
    data: [
      {
        id: 'ade79b9c-8515-47f2-8069-83c1e8c35c4d',
        created_at: '2023-10-25T09:58:34.202571Z',
        updated_at: '2024-04-10T09:56:19.908145Z',
        key: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_USERNAME',
        value: 'admin2',
        mount_path: null,
        scope: 'BUILT_IN',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'BUILT_IN',
        variable_kind: 'Public',
        service_id: '33962e52-7883-42fd-8613-85e04229a9b6',
        service_name: 'rds_terraform',
        service_type: 'JOB',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '810e3ca6-6e42-40b1-952a-4cfcef3c9fd1',
        created_at: '2023-10-25T09:58:34.216404Z',
        updated_at: '2023-10-25T09:58:34.216407Z',
        key: 'DB_USERNAME',
        value: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_USERNAME',
        mount_path: null,
        scope: 'ENVIRONMENT',
        overridden_variable: null,
        aliased_variable: {
          id: 'ade79b9c-8515-47f2-8069-83c1e8c35c4d',
          key: 'QOVERY_OUTPUT_JOB_Z33962E52_DB_USERNAME',
          value: 'admin2',
          scope: 'BUILT_IN',
          variable_type: 'BUILT_IN',
          mount_path: null,
        },
        variable_type: 'ALIAS',
        variable_kind: 'Public',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'fcdbdda7-3133-4bba-9a72-36f8a0519848',
        created_at: '2024-02-28T10:23:01.453995Z',
        updated_at: '2024-02-28T10:23:01.454Z',
        key: 'DB_HOST',
        value: 'QOVERY_OUTPUT_JOB_ZEDE360F7_DB_HOST',
        mount_path: null,
        scope: 'ENVIRONMENT',
        overridden_variable: null,
        aliased_variable: {
          id: '37c4cf8d-9dbd-4bfc-8efd-f236f25973cc',
          key: 'QOVERY_OUTPUT_JOB_ZEDE360F7_DB_HOST',
          value: 'mydbhostname',
          scope: 'BUILT_IN',
          variable_type: 'BUILT_IN',
          mount_path: null,
        },
        variable_type: 'ALIAS',
        variable_kind: 'Public',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'fb121e5a-ff31-4835-a328-8ed561133174',
        created_at: '2023-11-07T14:58:46.9274Z',
        updated_at: '2023-11-07T14:58:46.927402Z',
        key: 'grafana_config',
        value: '{\ngrafana_config1=23,\ngrafana_config2=24\n}',
        mount_path: '/tmp/config',
        scope: 'APPLICATION',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'FILE',
        variable_kind: 'Public',
        service_id: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
        service_name: 'FRONT-END',
        service_type: 'APPLICATION',
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '57658166-0318-430c-8d8a-610a34d98910',
        created_at: '2023-06-16T14:54:17.234302Z',
        updated_at: '2023-07-03T13:41:40.23109Z',
        key: 'myvar_project',
        value: 'abc',
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        variable_kind: 'Public',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: 'acac4cee-5627-437b-9fd3-d0947d92da4b',
        created_at: '2023-10-25T09:02:13.581505Z',
        updated_at: '2023-10-25T09:02:13.581507Z',
        key: 'variable_name',
        value: null,
        mount_path: null,
        scope: 'APPLICATION',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        variable_kind: 'Private',
        service_id: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
        service_name: 'FRONT-END',
        service_type: 'APPLICATION',
        owned_by: 'QOVERY',
        is_secret: true,
      },
      {
        id: '831751ab-ebfb-4036-97f7-31689e3d8ed9',
        created_at: '2024-04-25T09:32:32.493711Z',
        updated_at: '2024-04-25T09:34:03.532389Z',
        key: 'DOPPLER_PROJECT',
        value: null,
        mount_path: null,
        scope: 'APPLICATION',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        service_id: 'ff84535f-49cc-450b-a878-f654c98c0a25',
        service_name: 'tetris',
        service_type: 'APPLICATION',
        owned_by: 'DOPPLER',
        is_secret: true,
      },
      {
        id: '3486e37c-5cdc-4e50-bcf7-75b1c818eb5f',
        created_at: '2023-11-20T14:02:45.128221Z',
        updated_at: '2023-11-20T14:02:45.128223Z',
        key: 'FOO',
        value: 'fdgsdfg',
        description: 'foo',
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: null,
        variable_type: 'VALUE',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
      {
        id: '7d1b18cf-9ea1-4b00-b82a-4b5d152aa6eb',
        created_at: '2024-06-10T12:53:23.97647Z',
        updated_at: '2024-06-10T12:53:23.976472Z',
        key: 'BAR',
        value: 'bar',
        mount_path: null,
        scope: 'PROJECT',
        overridden_variable: null,
        aliased_variable: {
          id: '3486e37c-5cdc-4e50-bcf7-75b1c818eb5f',
          key: 'FOO',
          value: 'fdgsdfg',
          scope: 'PROJECT',
          variable_type: 'VALUE',
          mount_path: null,
        },
        variable_type: 'ALIAS',
        service_id: null,
        service_name: null,
        service_type: null,
        owned_by: 'QOVERY',
        is_secret: false,
      },
    ],
  }),
}))

const variableListProps: VariableListProps = {
  organizationId: '3d542888-3d2c-474a-b1ad-712556db66da',
  projectId: 'cf021d82-2c5e-41de-96eb-eb69c022eddc',
  environmentId: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
  serviceId: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
  scope: 'APPLICATION',
  onCreateVariable: jest.fn(),
  onEditVariable: jest.fn(),
  onDeleteVariable: jest.fn(),
}

describe('VariableList', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<VariableList {...variableListProps} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const now = new Date('2024-04-23T12:00:00Z')
    jest.useFakeTimers()
    jest.setSystemTime(now)
    const { container } = renderWithProviders(<VariableList {...variableListProps} />)
    expect(container).toMatchSnapshot()
    jest.useRealTimers()
  })
  it('should display all variables', () => {
    renderWithProviders(<VariableList {...variableListProps} />)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(10)
    expect(screen.getAllByTestId('doppler-tag')).toHaveLength(1)
  })
  it('should filter variables by name', async () => {
    const { userEvent } = renderWithProviders(<VariableList {...variableListProps} />)
    await userEvent.click(screen.getByRole('button', { name: /value/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /private/i }))
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
  })
  it('should have actions', async () => {
    const { userEvent } = renderWithProviders(<VariableList {...variableListProps} />)
    const actions = screen.getAllByRole('button', { name: /actions/i })
    await userEvent.click(actions[0])
    const menuItems0 = screen.getAllByRole('menuitem')
    expect(menuItems0).toHaveLength(1)
    expect(menuItems0[0]).toHaveTextContent(/alias/i)
    userEvent.keyboard('{Escape}')
    await userEvent.click(actions[1])
    const menuItems1 = screen.getAllByRole('menuitem')
    expect(menuItems1).toHaveLength(2)
    expect(menuItems1[0]).toHaveTextContent(/edit/i)
    expect(menuItems1[1]).toHaveTextContent(/delete/i)
    userEvent.keyboard('{Escape}')
    await userEvent.click(actions[2])
    const menuItems2 = screen.getAllByRole('menuitem')
    expect(menuItems2).toHaveLength(2)
    expect(menuItems2[0]).toHaveTextContent(/edit/i)
    expect(menuItems2[1]).toHaveTextContent(/delete/i)
    userEvent.keyboard('{Escape}')
    await userEvent.click(actions[3])
    const menuItems3 = screen.getAllByRole('menuitem')
    expect(menuItems3).toHaveLength(4)
    expect(menuItems3[0]).toHaveTextContent(/edit/i)
    expect(menuItems3[1]).toHaveTextContent(/alias/i)
    expect(menuItems3[2]).toHaveTextContent(/override/i)
    expect(menuItems3[2]).toHaveAttribute('aria-disabled')
    expect(menuItems3[3]).toHaveTextContent(/delete/i)
    userEvent.keyboard('{Escape}')
  })
  it('should search variables by name', async () => {
    const { userEvent } = renderWithProviders(<VariableList {...variableListProps} />)
    await userEvent.type(screen.getByRole('textbox'), 'FOO')
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
  })
  it('should search variables by name with aliases', async () => {
    const { userEvent } = renderWithProviders(<VariableList {...variableListProps} />)
    await userEvent.type(screen.getByRole('textbox'), 'BAR')
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
  })
})
