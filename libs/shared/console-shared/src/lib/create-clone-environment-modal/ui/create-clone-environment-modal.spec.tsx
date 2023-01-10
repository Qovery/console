import {
  act,
  fireEvent,
  getAllByTestId,
  getByDisplayValue,
  getByLabelText,
  getByRole,
  getByTestId,
} from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import CreateCloneEnvironmentModal, { CreateCloneEnvironmentModalProps } from './create-clone-environment-modal'

const mockClusters = clusterFactoryMock(3)
const props: CreateCloneEnvironmentModalProps = {
  environmentToClone: undefined,
  closeModal: jest.fn(),
  clusters: mockClusters,
  loading: false,
  onSubmit: jest.fn(),
}

describe('CreateCloneEnvironmentModal', () => {
  let defaultValues: {
    mode: EnvironmentModeEnum
    cluster: string
    name: string
  }

  beforeEach(() => {
    defaultValues = {
      mode: EnvironmentModeEnum.DEVELOPMENT,
      cluster: mockClusters[0].id,
      name: '',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should reformat name by replacing special char by hyphens', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )
    const input = getByTestId(baseElement, 'input-text')
    await act(() => {
      fireEvent.input(input, { target: { value: 'ben et remi' } })
    })

    getByDisplayValue(baseElement, 'ben-et-remi')
  })

  it('should submit form on click on button', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { baseElement } = render(
      wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )

    const submitButton = getByTestId(baseElement, 'submit-button')

    const input = getByTestId(baseElement, 'input-text')
    await act(() => {
      fireEvent.input(input, { target: { value: 'test' } })
    })

    await act(() => {
      fireEvent.click(submitButton)
    })

    expect(spy).toHaveBeenCalled()
  })

  describe('create mode', () => {
    it('should render 1 input and 2 selects with default values', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />))

      getByTestId(baseElement, 'input-text')
      getByTestId(baseElement, 'input-select-cluster')
      getByTestId(baseElement, 'input-select-mode')
    })

    it('should render input with a specific label for create', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />))

      getByLabelText(baseElement, 'Environment name')
    })

    it('should render confirm button with Create', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...props} />))

      getByRole(baseElement, 'button', { name: 'Create' })
    })
  })

  describe('clone mode', () => {
    const propsUpdated: CreateCloneEnvironmentModalProps = {
      ...props,
      environmentToClone: environmentFactoryMock(1)[0],
    }

    it('should render 2 input and 2 selects with default values', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...propsUpdated} />))

      const inputs = getAllByTestId(baseElement, 'input-text')
      getByTestId(baseElement, 'input-select-cluster')
      getByTestId(baseElement, 'input-select-mode')

      expect(inputs).toHaveLength(2)
      if (propsUpdated.environmentToClone) getByDisplayValue(baseElement, propsUpdated.environmentToClone?.name)
    })

    it('should render input with a specif label for clone', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...propsUpdated} />))

      getByLabelText(baseElement, 'New environment name')
    })

    it('should render confirm button with Clone', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CreateCloneEnvironmentModal {...propsUpdated} />))

      getByRole(baseElement, 'button', { name: 'Clone' })
    })
  })
})
