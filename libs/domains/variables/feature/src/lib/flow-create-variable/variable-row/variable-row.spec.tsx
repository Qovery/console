import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type FlowVariableData } from '@qovery/shared/interfaces'
import { renderWithProviders } from '@qovery/shared/util-tests'
import VariableRow, { type VariableRowProps } from './variable-row'

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
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
