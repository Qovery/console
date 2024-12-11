import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum } from 'qovery-typescript-axios'
import { type Application, type Container, type Job } from '@qovery/domains/services/data-access'
import {
  applicationFactoryMock,
  containerFactoryMock,
  cronjobFactoryMock,
  helmFactoryMock,
  organizationFactoryMock,
} from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageSettingsGeneral, { type PageSettingsGeneralProps } from './page-settings-general'

const mockApplication = applicationFactoryMock(1)[0] as Application
const mockContainer = containerFactoryMock(1)[0] as Container
const mockJob = cronjobFactoryMock(1)[0] as Job
const mockHelm = helmFactoryMock(1)[0]
const mockOrganization = organizationFactoryMock(1)[0]

describe('PageSettingsGeneral', () => {
  const props: PageSettingsGeneralProps = {
    service: mockApplication,
    organization: mockOrganization,
    isLoadingEditService: false,
    onSubmit: jest.fn((e) => e.preventDefault()),
  }

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with docker section', async () => {
    props.service = {
      ...mockApplication,
      name: 'hello-world',
      dockerfile_path: 'Dockerfile',
      build_mode: BuildModeEnum.DOCKER,
    }

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: props.service,
      })
    )

    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument()

    screen.getByDisplayValue('hello-world')
    screen.getByText('Docker')
    screen.getByDisplayValue('Dockerfile')
    screen.getByText(/The service will be automatically updated on every new commit on the branch./i)
  })

  it('should render application general settings fields', async () => {
    const service = {
      ...mockApplication,
      dockerfile_path: 'Dockerfile',
      build_mode: BuildModeEnum.DOCKER,
    }

    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral service={service} {...props} />, {
        defaultValues: service,
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Build and deploy')).toBeInTheDocument()
    // Necessary to get sub-component
    waitFor(() => {
      expect(screen.getByText('Source')).toBeInTheDocument()
      expect(screen.getByText('Auto-deploy')).toBeInTheDocument()
    })
  })

  it('should render container general settings fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} service={mockContainer} />, {
        defaultValues: mockContainer,
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
    // Necessary to get sub-component
    waitFor(() => {
      expect(screen.getByText('Auto-deploy')).toBeInTheDocument()
    })
  })

  it('should render jobs general settings fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} service={mockJob} />, {
        defaultValues: mockJob,
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    // Necessary to get sub-component
    waitFor(() => {
      expect(screen.getByText('Git repository')).toBeInTheDocument()
      expect(screen.getByText('Auto-deploy')).toBeInTheDocument()
    })
  })

  it('should render helm general settings fields', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} service={mockJob} />, {
        defaultValues: mockHelm,
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    // Necessary to get sub-component
    waitFor(() => {
      expect(screen.getByText('Source')).toBeInTheDocument()
      expect(screen.getByText('Auto-deploy')).toBeInTheDocument()
    })
  })
})
