import { waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ContainerRegistryKindEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModal, { type CrudModalProps, getOptionsContainerRegistry } from './crud-modal'

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
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<CrudModal {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with DOCKER_HUB', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://docker.io',
          kind: ContainerRegistryKindEnum.DOCKER_HUB,
          config: {
            username: 'test',
            password: 'password',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://docker.io')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('password')
  })

  it('should render the form with ECR', async () => {
    renderWithProviders(
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
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('region')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('key')
  })

  it('should render the form with PUBLIC_ECR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          url: 'https://qovery.com',
          kind: ContainerRegistryKindEnum.PUBLIC_ECR,
          config: {},
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
  })

  it('should render the form with SCALEWAY_CR', async () => {
    renderWithProviders(
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
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('https://qovery.com')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('key')
  })
  it('should render the form with GITHUB_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://ghcr.io',
          kind: ContainerRegistryKindEnum.GITHUB_CR,
          config: {
            username: 'test',
            password: 'password',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://ghcr.io')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('password')
  })

  it('should render the form with GITLAB_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          url: 'https://registry.gitlab.com',
          kind: ContainerRegistryKindEnum.GITLAB_CR,
          config: {
            username: 'test',
            password: 'password',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('https://registry.gitlab.com')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('password')
  })

  it('should render the form with GENERIC_CR', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<CrudModal {...props} />, {
        defaultValues: {
          name: 'hello',
          description: 'description',
          kind: ContainerRegistryKindEnum.GENERIC_CR,
          config: {
            username: 'test',
            password: 'password',
          },
        },
      })
    )
    screen.getByDisplayValue('hello')
    screen.getByDisplayValue('description')
    screen.getByDisplayValue('test')
    screen.getByDisplayValue('password')
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
    renderWithProviders(
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

    const button = await screen.findByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spy).toHaveBeenCalled()
    })
  })
})
