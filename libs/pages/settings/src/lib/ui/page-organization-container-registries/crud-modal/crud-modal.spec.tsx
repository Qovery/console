import { act, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import CrudModal, { CrudModalProps, getOptionsContainerRegistry } from './crud-modal'

const props: CrudModalProps = {
  loading: false,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  availableContainerRegistry: [
    {
      kind: ContainerRegistryKindEnum.DOCKER_HUB,
    },
  ],
}

describe('CrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with Docker', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
          config: {
            username: 'test',
            password: 'password',
          },
        },
      })
    )
    await act(() => {
      getByDisplayValue('hello')
      getByDisplayValue('description')
      getByDisplayValue('test')
      getByDisplayValue('password')
    })
  })

  it('should render the form with ECR', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.ECR,
          config: {
            region: 'region',
            access_key_id: 'test',
            secret_access_key: 'key',
          },
        },
      })
    )
    await act(() => {
      getByDisplayValue('hello')
      getByDisplayValue('https://qovery.com')
      getByDisplayValue('region')
      getByDisplayValue('test')
      getByDisplayValue('key')
    })
  })

  it('should render the form with PUBLIC_ECR', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.PUBLIC_ECR,
          config: {},
        },
      })
    )
    await act(() => {
      getByDisplayValue('hello')
      getByDisplayValue('https://qovery.com')
    })
  })

  it('should render the form with SCALEWAY_CR', async () => {
    const { getByDisplayValue } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.SCALEWAY_CR,
          config: {
            region: 'region',
            scaleway_access_key: 'test',
            scaleway_secret_key: 'key',
          },
        },
      })
    )
    await act(() => {
      getByDisplayValue('hello')
      getByDisplayValue('https://qovery.com')
      getByDisplayValue('test')
      getByDisplayValue('key')
    })
  })

  it('should have an array of container registry', async () => {
    const options = getOptionsContainerRegistry([
      {
        kind: ContainerRegistryKindEnum.DOCKER_HUB,
      },
      {
        kind: ContainerRegistryKindEnum.ECR,
      },
    ])

    expect(options[0].value).toBe(ContainerRegistryKindEnum.DOCKER_HUB)
  })

  it('should submit the form', async () => {
    const spy = jest.fn().mockImplementation((e) => e.preventDefault())
    props.onSubmit = spy
    const { findByTestId } = render(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
          config: {
            username: 'test',
            password: 'password',
          },
        },
      })
    )

    const button = await findByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
