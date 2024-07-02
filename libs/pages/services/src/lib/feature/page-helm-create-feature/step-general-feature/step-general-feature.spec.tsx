import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useForm } from 'react-hook-form'
import * as serviceHelmDomain from '@qovery/domains/service-helm/feature'
import { renderHook, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type HelmGeneralData } from '../page-helm-create-feature'
import { HelmCreateContext } from '../page-helm-create-feature'
import StepGeneralFeature from './step-general-feature'

import SpyInstance = jest.SpyInstance

const useHelmRepositoriesSpy: SpyInstance = jest.spyOn(serviceHelmDomain, 'useHelmRepositories')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

describe('StepGeneralFeature', () => {
  beforeEach(() => {
    useHelmRepositoriesSpy.mockReturnValue({
      data: [
        {
          id: '000-000-000',
          name: 'my-helm-repository',
          created_at: '',
        },
      ],
      isFetched: true,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { result } = renderHook(() =>
      useForm<HelmGeneralData>({
        mode: 'onChange',
      })
    )

    const { baseElement } = renderWithProviders(
      <HelmCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalForm: result.current,
        }}
      >
        <StepGeneralFeature />
      </HelmCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit a form with a helm repository and match snapshots', async () => {
    const { result } = renderHook(() =>
      useForm<HelmGeneralData>({
        mode: 'onChange',
        defaultValues: {
          name: 'my-helm-app',
          description: 'description',
          source_provider: 'HELM_REPOSITORY',
          arguments: '--wait',
          timeout_sec: 600,
          allow_cluster_wide_resources: true,
          chart_name: 'name',
          chart_version: '10',
          repository: '958c6fca-8576-403d-887e-376da5d3987a',
        },
      })
    )

    const { baseElement, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <HelmCreateContext.Provider
          value={{
            currentStep: 1,
            setCurrentStep: jest.fn(),
            generalForm: result.current,
          }}
        >
          <StepGeneralFeature />
        </HelmCreateContext.Provider>
      )
    )

    const button = screen.getByRole('button', { name: 'Continue' })

    // wait for form to be valid because we have selects (necessary with react hook form)
    waitFor(async () => {
      expect(button).toBeEnabled()
      await userEvent.click(button)
    })

    expect(baseElement).toMatchSnapshot()
  })

  it('should submit a form with a git repository', async () => {
    const { result } = renderHook(() =>
      useForm<HelmGeneralData>({
        mode: 'onChange',
        defaultValues: {
          name: 'my-helm-app',
          source_provider: 'GIT',
          arguments: '--wait',
          timeout_sec: 600,
          allow_cluster_wide_resources: false,
          provider: 'GITHUB',
          auto_deploy: false,
          repository: 'Qovery/.github',
          branch: 'main',
          root_path: '/',
        },
      })
    )

    const { baseElement, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <HelmCreateContext.Provider
          value={{
            currentStep: 1,
            setCurrentStep: jest.fn(),
            generalForm: result.current,
          }}
        >
          <StepGeneralFeature />
        </HelmCreateContext.Provider>
      )
    )

    const button = screen.getByRole('button', { name: 'Continue' })

    // wait for form to be valid because we have selects (necessary with react hook form)
    waitFor(async () => {
      expect(button).toBeEnabled()
      await userEvent.click(button)
    })

    expect(baseElement).toMatchSnapshot()
  })

  it('should submit a form with a public git repository', async () => {
    const { result } = renderHook(() =>
      useForm<HelmGeneralData>({
        mode: 'onChange',
        defaultValues: {
          name: 'my-helm-app',
          source_provider: 'GIT',
          arguments: '--wait',
          timeout_sec: 600,
          allow_cluster_wide_resources: false,
          provider: 'GITHUB',
          auto_deploy: false,
          is_public_repository: true,
          repository: 'https://github.com/Qovery/console.git',
          branch: 'main',
          root_path: '/',
        },
      })
    )

    const { baseElement, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <HelmCreateContext.Provider
          value={{
            currentStep: 1,
            setCurrentStep: jest.fn(),
            generalForm: result.current,
          }}
        >
          <StepGeneralFeature />
        </HelmCreateContext.Provider>
      )
    )

    const button = screen.getByRole('button', { name: 'Continue' })

    // wait for form to be valid because we have selects (necessary with react hook form)
    waitFor(async () => {
      expect(button).toBeEnabled()
      await userEvent.click(button)
    })

    expect(baseElement).toMatchSnapshot()
  })
})
