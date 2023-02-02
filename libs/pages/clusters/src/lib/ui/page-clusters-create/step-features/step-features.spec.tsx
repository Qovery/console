import { act, fireEvent } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import StepFeatures, { StepFeaturesProps } from './step-features'

const currentCloudProviders = {
  short_name: CloudProviderEnum.AWS,
  name: 'Amazon',
  region: [
    {
      name: 'Paris',
      city: 'paris',
      country_code: 'fr',
    },
  ],
}

const props: StepFeaturesProps = {
  onSubmit: jest.fn(),
  cloudProviders: [currentCloudProviders],
}

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('StepFeatures', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<StepFeatures {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { getByDisplayValue, getByTestId } = render(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
        },
      })
    )

    getByDisplayValue('my-cluster')
    getByDisplayValue('test')
    getByDisplayValue('false')
    getByTestId('input-cloud-provider')
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          name: 'my-cluster',
          description: 'test',
          production: false,
          cloud_provider: CloudProviderEnum.AWS,
          region: 'paris',
          credentials: '111-111-111',
        },
      })
    )

    const button = getByTestId('button-submit')

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'test' } })
    })

    await act(() => {
      button?.click()
    })

    expect(button).not.toBeDisabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
