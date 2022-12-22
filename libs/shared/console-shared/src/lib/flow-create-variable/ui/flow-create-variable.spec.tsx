import { render } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { FlowVariableData } from '@qovery/shared/interfaces'
import FlowCreateVariable, { FlowCreateVariableProps } from './flow-create-variable'

const props: FlowCreateVariableProps = {
  onBack: jest.fn(),
  availableScopes: [APIVariableScopeEnum.PROJECT, APIVariableScopeEnum.CONTAINER, APIVariableScopeEnum.APPLICATION],
  variables: [],
  onSubmit: jest.fn(),
  onRemove: jest.fn(),
  onAdd: jest.fn(),
}

describe('FlowCreateVariable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<FlowVariableData>(<FlowCreateVariable {...props} />, {
        defaultValues: {
          variables: [],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})
