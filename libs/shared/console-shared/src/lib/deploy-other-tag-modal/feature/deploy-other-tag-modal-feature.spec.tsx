import { act, fireEvent, getByLabelText, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeApplication from '@qovery/domains/application'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import DeployOtherTagModalFeature, { DeployOtherTagModalFeatureProps } from './deploy-other-tag-modal-feature'

import SpyInstance = jest.SpyInstance

jest.mock('react-redux', () => ({
  ...(jest.requireActual('react-redux') as any),
  useDispatch: () =>
    jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    ),
  useSelector: (a: any) => {
    return a()
  },
}))

const mockApplication = applicationFactoryMock(1)[0]
jest.mock('@qovery/domains/application', () => ({
  ...(jest.requireActual('@qovery/domains/application') as any),
  selectApplicationById: () => mockApplication,
  postApplicationActionsDeployByTag: jest.fn(),
}))

const props: DeployOtherTagModalFeatureProps = {
  environmentId: 'environmentId',
  applicationId: 'applicationId',
}

describe('DeployOtherTagModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeployOtherTagModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should deploy with the correct tag', async () => {
    const deploySpy: SpyInstance = jest.spyOn(storeApplication, 'postApplicationActionsDeployByTag')
    deploySpy.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))
    const { baseElement } = render(<DeployOtherTagModalFeature {...props} />)

    const input = getByLabelText(baseElement, 'Tag')

    await act(() => {
      fireEvent.input(input, { target: { value: 'v1' } })
    })

    // click on submit button
    const submitButton = getByTestId(baseElement, 'submit-button')
    await act(() => {
      submitButton.click()
    })

    expect(deploySpy).toHaveBeenCalledWith({
      applicationId: 'applicationId',
      tag: 'v1',
      environmentId: 'environmentId',
      serviceType: ServiceTypeEnum.APPLICATION,
    })
  })
})
