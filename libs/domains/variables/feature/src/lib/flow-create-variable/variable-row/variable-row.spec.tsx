import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import VariableRow, { type VariableRowProps } from './variable-row'

jest.mock('../../hooks/use-variables/use-variables', () => {
  const variables = [
    {
      id: 'c0277184-1fe0-4f17-b09a-58eee2c05701',
      created_at: '2023-10-25T09:13:34.723567Z',
      updated_at: '2023-10-25T09:13:34.723568Z',
      key: 'QOVERY_CONTAINER_Z04308DE2_HOST_INTERNAL',
      value: 'app-z04308de2-back-end',
      mount_path: null,
      scope: 'BUILT_IN',
      overridden_variable: null,
      aliased_variable: null,
      variable_type: 'BUILT_IN',
      service_id: '04308de2-af27-405f-9e95-570fa94ed577',
      service_name: 'back-end-A',
      service_type: 'CONTAINER',
      owned_by: 'QOVERY',
      is_secret: false,
    },
  ]
  return {
    useVariables: () => ({
      data: variables,
      refetch: () => Promise.resolve({ data: variables }),
    }),
  }
})

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    environmentId: 'env-1',
  }),
}))

const props: VariableRowProps = {
  index: 0,
  onDelete: jest.fn(),
  gridTemplateColumns: '',
  availableScopes: [APIVariableScopeEnum.PROJECT, APIVariableScopeEnum.CONTAINER, APIVariableScopeEnum.APPLICATION],
}

describe('VariableRow', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<FlowVariableData>(<VariableRow {...props} />, {
        defaultValues: {
          variables: [],
          externalSecrets: [],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should hide the scope selector when requested', () => {
    renderWithProviders(
      wrapWithReactHookForm<FlowVariableData>(<VariableRow {...props} showScope={false} />, {
        defaultValues: {
          variables: [{ variable: 'TOKEN', value: 'secret', scope: APIVariableScopeEnum.AGENTIC_WORKFLOW }],
          externalSecrets: [],
        },
      })
    )

    expect(screen.queryByTestId('scope')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove variable 1' })).toBeInTheDocument()
  })
})
