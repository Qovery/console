import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { useForm } from 'react-hook-form'
import { renderHook, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type HelmValuesAsFileData } from '../page-helm-create-feature'
import { HelmCreateContext } from '../page-helm-create-feature'
import StepValuesOverrideFilesFeature from './step-values-override-files-feature'

describe('StepValuesOverrideFilesFeature', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() =>
      useForm<HelmValuesAsFileData>({
        mode: 'onChange',
      })
    )

    const { baseElement } = renderWithProviders(
      <HelmCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          valuesOverrideFileForm: result.current,
        }}
      >
        <StepValuesOverrideFilesFeature />
      </HelmCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit a form with a git repository', async () => {
    const { result } = renderHook(() =>
      useForm<HelmValuesAsFileData>({
        mode: 'onChange',
        defaultValues: {
          repository: 'Qovery/.github',
          branch: 'main',
        },
      })
    )

    const { baseElement, userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <HelmCreateContext.Provider
          value={{
            currentStep: 2,
            setCurrentStep: jest.fn(),
            valuesOverrideFileForm: result.current,
          }}
        >
          <StepValuesOverrideFilesFeature />
        </HelmCreateContext.Provider>
      )
    )

    const button = screen.getByRole('button', { name: 'Continue' })

    // wait for form to be valid because we have selects (necessary with react hook form)
    waitFor(async () => {
      expect(button).not.toBeDisabled()
      await userEvent.click(button)
    })

    expect(baseElement).toMatchSnapshot()
  })
})
