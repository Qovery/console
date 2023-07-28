import { getByDisplayValue, getByLabelText, getByRole, getByTestId, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import {
  applicationFactoryMock,
  databaseFactoryMock,
  environmentFactoryMock,
  projectsFactoryMock,
} from '@qovery/shared/factories'
import CloneEnvironmentModal, { CloneServiceModalProps } from './clone-service-modal'

const mockProjects = projectsFactoryMock(3)
const mockEnvironments = environmentFactoryMock(3)

const props: CloneServiceModalProps = {
  closeModal: jest.fn(),
  environments: mockEnvironments,
  loading: false,
  onSubmit: jest.fn(),
  projects: mockProjects,
  serviceToClone: applicationFactoryMock(1)[0],
}

describe('CloneEnvironmentModal', () => {
  let defaultValues: {
    environment: string
    name: string
  }

  beforeEach(() => {
    defaultValues = {
      environment: mockEnvironments[0].id,
      name: '',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<CloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should reformat name by replacing special char by hyphens', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<CloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )

    const input = screen.getByLabelText('New service name')
    await userEvent.type(input, 'ben et remi')

    getByDisplayValue(baseElement, 'ben-et-remi')
  })

  it('should submit form on click on button', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    render(
      wrapWithReactHookForm(<CloneEnvironmentModal {...props} />, {
        defaultValues,
      })
    )

    const submitButton = screen.getByRole('button', { name: /clone/i })

    const input = screen.getByLabelText('New service name')
    await userEvent.type(input, 'test')

    await userEvent.click(submitButton)

    expect(spy).toHaveBeenCalled()
  })

  describe('with application', () => {
    it('should render 2 input and 2 selects with default values', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CloneEnvironmentModal {...props} />))

      const inputs = screen.getAllByRole('textbox')
      getByTestId(baseElement, 'input-select-environment')
      getByTestId(baseElement, 'input-select-project')

      expect(inputs).toHaveLength(2)
      if (props.serviceToClone) getByDisplayValue(baseElement, props.serviceToClone?.name)
    })

    it('should render input with a specific label for clone', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CloneEnvironmentModal {...props} />))

      getByLabelText(baseElement, 'New service name')
    })

    it('should render confirm button with Clone', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CloneEnvironmentModal {...props} />))

      getByRole(baseElement, 'button', { name: 'Clone' })
    })
  })

  describe('with database', () => {
    const propsUpdated: CloneServiceModalProps = {
      ...props,
      serviceToClone: databaseFactoryMock(1)[0],
    }

    it('should render 2 input and 2 selects with default values', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CloneEnvironmentModal {...propsUpdated} />))

      const inputs = screen.getAllByRole('textbox')
      getByTestId(baseElement, 'input-select-environment')
      getByTestId(baseElement, 'input-select-project')

      expect(inputs).toHaveLength(2)
      if (propsUpdated.serviceToClone) getByDisplayValue(baseElement, propsUpdated.serviceToClone?.name)
    })

    it('should render input with a specif label for clone', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CloneEnvironmentModal {...propsUpdated} />))

      getByLabelText(baseElement, 'New service name')
    })

    it('should render confirm button with Clone', () => {
      const { baseElement } = render(wrapWithReactHookForm(<CloneEnvironmentModal {...propsUpdated} />))

      getByRole(baseElement, 'button', { name: 'Clone' })
    })
  })
})
