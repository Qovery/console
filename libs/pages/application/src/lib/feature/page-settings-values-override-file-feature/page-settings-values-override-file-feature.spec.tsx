import selectEvent from 'react-select-event'
import * as servicesDomains from '@qovery/domains/services/feature'
import { helmFactoryMock } from '@qovery/shared/factories'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsValuesOverrideFileFeature from './page-settings-values-override-file-feature'

import SpyInstance = jest.SpyInstance

const useServiceSpy: SpyInstance = jest.spyOn(servicesDomains, 'useService')
const useEditServiceSpy: SpyInstance = jest.spyOn(servicesDomains, 'useEditService')

const helm = helmFactoryMock(1)[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ applicationId: '1' }),
}))

describe('PageSettingsPortsFeature', () => {
  beforeEach(() => {
    useServiceSpy.mockReturnValue({
      data: helm,
    })
    useEditServiceSpy.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsValuesOverrideFileFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit mutation successfully', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsValuesOverrideFileFeature />)

    const select = screen.getByLabelText('File source')
    await selectEvent.select(select, 'None', {
      container: document.body,
    })

    const submitButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(submitButton)

    expect(useEditServiceSpy().mutate).toHaveBeenCalledWith({
      serviceId: '1',
      payload: buildEditServicePayload({ service: helm }),
    })
  })
})
