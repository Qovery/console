import { render } from '__tests__/utils/setup-jest'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { FlowVariableData } from '@qovery/shared/interfaces'
import { wrapWithReactHookForm } from '../../../../../../../__tests__/utils/wrap-with-react-hook-form'
import VariableRow, { VariableRowProps } from './variable-row'

const props: VariableRowProps = {
  index: 0,
  onDelete: jest.fn(),
  gridTemplateColumns: '',
  availableScopes: [APIVariableScopeEnum.PROJECT, APIVariableScopeEnum.CONTAINER, APIVariableScopeEnum.APPLICATION],
}

describe('VariableRow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<FlowVariableData>(<VariableRow {...props} />, {
        defaultValues: {
          variables: [],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
