import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import VariableRow, { type VariableRowProps } from './variable-row'

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
