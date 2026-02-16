import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type Organization } from 'qovery-typescript-axios'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { fireEvent, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useEditOrganization } from '../hooks/use-edit-organization/use-edit-organization'
import { useOrganization } from '../hooks/use-organization/use-organization'
import {
  PageOrganizationGeneral,
  type PageOrganizationGeneralProps,
  SettingsGeneral,
  handleSubmit,
} from './settings-general'

jest.mock('../hooks/use-edit-organization/use-edit-organization')
jest.mock('../hooks/use-organization/use-organization')

const mockOrganization: Organization = organizationFactoryMock(1)[0]

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '0' }),
}))

describe('SettingsGeneral', () => {
  const useOrganizationMock = useOrganization as jest.MockedFunction<typeof useOrganization>
  const useEditOrganizationMock = useEditOrganization as jest.MockedFunction<typeof useEditOrganization>

  beforeEach(() => {
    useEditOrganizationMock.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    })
    useOrganizationMock.mockReturnValue({
      data: mockOrganization,
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<SettingsGeneral />)
    await screen.findByTestId('input-name')
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch editOrganization if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<SettingsGeneral />)

    const input = await screen.findByTestId('input-name')
    await userEvent.clear(input)
    await userEvent.type(input, 'hello-world')

    expect(screen.getByTestId('submit-button')).toBeEnabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const organization = {
      name: 'hello-world',
      website_url: mockOrganization.website_url,
      logo_url: mockOrganization.logo_url,
      description: mockOrganization.description,
      admin_emails: ['test@test.com'],
    }

    const cloneOrganization = handleSubmit(organization, mockOrganization)

    expect(useEditOrganizationMock().mutateAsync).toHaveBeenCalledWith({
      organizationId: '0',
      organizationRequest: cloneOrganization,
    })
  })
})

describe('PageOrganizationGeneral', () => {
  const createdAt = '2024-01-15T10:00:00.000Z'
  const props: PageOrganizationGeneralProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    loading: false,
    created_at: createdAt,
  }

  const defaultValues = {
    logo_url: 'https://qovery.com',
    name: 'hello',
    description: 'hello world',
    website_url: 'https://qovery.com',
    admin_emails: ['test@test.com', 'test2@test.com'],
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    await screen.findByTestId('input-name')
    expect(baseElement).toBeTruthy()
  })

  it('should render inputs', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )
    await screen.findByTestId('input-name')
    expect(screen.getByTestId('input-file')).toBeInTheDocument()
    expect(screen.getByTestId('input-file-image')).toBeInTheDocument()
    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-area')).toBeInTheDocument()
    expect(screen.getByTestId('input-website')).toBeInTheDocument()
    expect(screen.getByTestId('input-emails')).toBeInTheDocument()
    expect(screen.getByText(`Created since ${dateMediumLocalFormat(createdAt)}`)).toBeInTheDocument()
  })

  it('should submit the form', async () => {
    const emptyNameValues = {
      ...defaultValues,
      name: '',
    }

    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(<PageOrganizationGeneral {...props} />, {
        defaultValues: emptyNameValues,
      })
    )

    const button = await screen.findByTestId('submit-button')
    const inputName = screen.getByTestId('input-name')

    expect(button).toBeDisabled()
    await userEvent.clear(inputName)
    await userEvent.type(inputName, 'hello world')

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    const form = container.querySelector('form')
    expect(form).toBeTruthy()
    if (form) {
      fireEvent.submit(form)
    }

    expect(props.onSubmit).toHaveBeenCalled()
  })
})
