import { HelmRepositoryKindEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { helmRepositoriesMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps } from './crud-modal-feature'

const mockHelmRepositories = helmRepositoriesMock(2)

const useEditHelmRepositoryMockSpy = jest.spyOn(organizationsDomain, 'useEditHelmRepository') as jest.Mock
const useCreateHelmRepositoryMockSpy = jest.spyOn(organizationsDomain, 'useCreateHelmRepository') as jest.Mock
const useAvailableHelmRepositoriesMockSpy = jest.spyOn(organizationsDomain, 'useAvailableHelmRepositories') as jest.Mock

const props: CrudModalFeatureProps = {
  onClose: jest.fn(),
  repository: mockHelmRepositories[0],
  organizationId: '0',
}

describe('CrudModalFeature', () => {
  beforeEach(() => {
    useEditHelmRepositoryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useCreateHelmRepositoryMockSpy.mockReturnValue({
      mutateAsync: jest.fn(),
    })
    useAvailableHelmRepositoriesMockSpy.mockReturnValue({
      data: [
        {
          kind: 'HTTPS',
        },
      ],
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should edit helm repository if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputLogin = screen.getByTestId('input-login')
    await userEvent.type(inputLogin, 'hello')

    const inputPassword = screen.getByTestId('input-password')
    await userEvent.type(inputPassword, 'password')

    expect(screen.getByTestId('submit-button')).not.toBeDisabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const mockHelmRepositoriesConfig = mockHelmRepositories[0]

    expect(useEditHelmRepositoryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      helmRepositoryId: '0',
      helmRepositoryRequest: {
        name: mockHelmRepositoriesConfig.name,
        description: mockHelmRepositoriesConfig.description,
        kind: mockHelmRepositoriesConfig.kind,
        url: mockHelmRepositoriesConfig.url,
        config: {
          login: 'hello',
          password: 'password',
        },
      },
    })
  })

  it('should create helm repository if form is submitted', async () => {
    props.repository = undefined

    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputName = screen.getByTestId('input-name')
    await userEvent.type(inputName, 'my-repository')

    const selectType = screen.getByLabelText('Kind')
    await selectEvent.select(selectType, HelmRepositoryKindEnum.HTTPS, { container: document.body })

    const inputLogin = screen.getByTestId('input-login')
    await userEvent.type(inputLogin, 'hello')

    const inputPassword = screen.getByTestId('input-password')
    await userEvent.type(inputPassword, 'password')

    const inputUrl = screen.getByTestId('input-url')
    await userEvent.type(inputUrl, 'https://helm-charts.io')

    const button = await screen.findByRole('button', { name: /Create/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const mockHelmRepositoriesConfig = mockHelmRepositories[0]
    console.log(mockHelmRepositoriesConfig)

    expect(useCreateHelmRepositoryMockSpy().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      helmRepositoryRequest: {
        name: 'my-repository',
        kind: mockHelmRepositoriesConfig.kind,
        description: undefined,
        url: 'https://helm-charts.io',
        config: {
          login: 'hello',
          password: 'password',
        },
      },
    })
  })
})
