import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useForm } from 'react-hook-form'
import { type HelmValuesFileData } from '@qovery/domains/service-helm/feature'
import { renderHook, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type TerraformGeneralData } from '../page-helm-create-feature'
import { TerraformCreateContext } from '../page-helm-create-feature'
import StepValuesOverrideFilesFeature from './step-values-override-files-feature'

describe('StepValuesOverrideFilesFeature', () => {
  it('should render successfully', () => {
    const { result: generalForm } = renderHook(() =>
      useForm<TerraformGeneralData>({
        mode: 'onChange',
        defaultValues: {
          source_provider: 'HELM_REPOSITORY',
          repository: 'https://charts.bitnami.com/bitnami',
          chart_name: 'nginx',
          chart_version: '8.9.0',
          arguments: '',
        },
      })
    )

    const { result: valuesOverrideFileForm } = renderHook(() =>
      useForm<HelmValuesFileData>({
        mode: 'onChange',
        defaultValues: {
          type: 'NONE',
        },
      })
    )

    const { baseElement } = renderWithProviders(
      <TerraformCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalForm: generalForm.current,
          valuesOverrideFileForm: valuesOverrideFileForm.current,
        }}
      >
        <StepValuesOverrideFilesFeature />
      </TerraformCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit a form with a git repository', async () => {
    const { result: generalForm } = renderHook(() =>
      useForm<TerraformGeneralData>({
        mode: 'onChange',
        defaultValues: {
          source_provider: 'GIT',
          provider: 'GITHUB',
          repository: 'Qovery/github',
          branch: 'main',
          root_path: '/',
        },
      })
    )

    const { result: valuesOverrideFileForm } = renderHook(() =>
      useForm<HelmValuesFileData>({
        mode: 'onChange',
        defaultValues: {
          type: 'GIT_REPOSITORY',
          provider: 'GITHUB',
          repository: 'Qovery/github',
          branch: 'main',
          paths: '/',
        },
      })
    )

    const { baseElement, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <TerraformCreateContext.Provider
          value={{
            currentStep: 2,
            setCurrentStep: jest.fn(),
            generalForm: generalForm.current,
            valuesOverrideFileForm: valuesOverrideFileForm.current,
          }}
        >
          <StepValuesOverrideFilesFeature />
        </TerraformCreateContext.Provider>
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

  it('should submit a form with a yaml', async () => {
    const { result: generalForm } = renderHook(() =>
      useForm<TerraformGeneralData>({
        mode: 'onChange',
        defaultValues: {
          source_provider: 'GIT',
          provider: 'GITHUB',
          repository: 'Qovery/github',
          branch: 'main',
          root_path: '/',
        },
      })
    )

    const { result: valuesOverrideFileForm } = renderHook(() =>
      useForm<HelmValuesFileData>({
        mode: 'onChange',
        defaultValues: {
          type: 'YAML',
          content: 'test',
        },
      })
    )

    const { baseElement, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <TerraformCreateContext.Provider
          value={{
            currentStep: 2,
            setCurrentStep: jest.fn(),
            generalForm: generalForm.current,
            valuesOverrideFileForm: valuesOverrideFileForm.current,
          }}
        >
          <StepValuesOverrideFilesFeature />
        </TerraformCreateContext.Provider>
      )
    )

    const button = screen.getByRole('button', { name: 'Continue' })

    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(baseElement).toMatchSnapshot()
  })
})
