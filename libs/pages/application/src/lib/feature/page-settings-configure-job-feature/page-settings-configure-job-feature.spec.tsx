import { act, fireEvent, getAllByLabelText, getByLabelText, getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeApplication from '@qovery/domains/application'
import { cronjobFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import PageSettingsConfigureJobFeature from './page-settings-configure-job-feature'

import SpyInstance = jest.SpyInstance

const mockJobApplication = cronjobFactoryMock(1)[0]
const mockSelectApplicationById = jest.fn()
jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    editApplication: jest.fn(),
    getApplicationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockJobApplication.id],
      entities: {
        [mockJobApplication.id]: { mockJobApplication },
      },
      error: null,
    }),
    selectApplicationById: () => mockSelectApplicationById(),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('PageSettingsPortsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsConfigureJobFeature />)
    expect(baseElement).toBeTruthy()
  })

  describe('when job is CRON', () => {
    it('should call edit application with correct payload', async () => {
      const editApplicationSpy: SpyInstance = jest.spyOn(storeApplication, 'editApplication')
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: {},
          }),
      }))

      mockSelectApplicationById.mockImplementation(() => ({
        ...mockJobApplication,
      }))

      const { baseElement } = render(<PageSettingsConfigureJobFeature />)

      await act(() => {
        fireEvent.change(getByLabelText(baseElement, 'Schedule - Cron expression'), {
          target: { value: '9 * * * *' },
        })
        fireEvent.change(getByLabelText(baseElement, 'Image Entrypoint'), { target: { value: 'some new text value' } })
        fireEvent.change(getByLabelText(baseElement, 'CMD Arguments'), { target: { value: "['string']" } })
        fireEvent.change(getByLabelText(baseElement, 'Number of restarts'), { target: { value: 12 } })
        fireEvent.change(getByLabelText(baseElement, 'Max duration in seconds'), { target: { value: 123 } })
        fireEvent.change(getByLabelText(baseElement, 'Port'), { target: { value: 123 } })
      })

      const submitButton = getByTestId(baseElement, 'submit-button')

      await act(() => {
        submitButton.click()
      })

      expect(editApplicationSpy.mock.calls[0][0].data).toStrictEqual({
        ...mockJobApplication,
        schedule: {
          cronjob: {
            arguments: ['string'],
            entrypoint: 'some new text value',
            scheduled_at: '9 * * * *',
          },
        },
        max_duration_seconds: '123',
        max_nb_restart: '12',
        port: '123',
      })
    })
  })

  describe('when job is Lifecycle', () => {
    it('should call edit application with correct payload', async () => {
      const editApplicationSpy: SpyInstance = jest.spyOn(storeApplication, 'editApplication')
      mockDispatch.mockImplementation(() => ({
        unwrap: () =>
          Promise.resolve({
            data: {},
          }),
      }))

      const mockLifecycleJobApplication = lifecycleJobFactoryMock(1)[0]
      mockSelectApplicationById.mockImplementation(() => ({
        ...mockLifecycleJobApplication,
      }))

      const { baseElement } = render(<PageSettingsConfigureJobFeature />)

      let checkbox = getByLabelText(baseElement, 'Start')
      await act(() => {
        checkbox.click()
      })

      checkbox = getByLabelText(baseElement, 'Delete')
      await act(() => {
        checkbox.click()
      })
      let entrypoints: HTMLElement[]
      let cmds: HTMLElement[]

      await waitFor(() => {
        entrypoints = getAllByLabelText(baseElement, 'Image Entrypoint')
        cmds = getAllByLabelText(baseElement, 'CMD Arguments')

        // must have close the Start inputs and open the Delete inputs
        // because we fetch the inputs by label and there are two elements with the same label on the page
        // which create a bug
        expect(entrypoints.length).toBe(1)
        expect(cmds.length).toBe(1)
      })

      await act(() => {
        fireEvent.change(entrypoints[0], { target: { value: '/' } })
        fireEvent.change(cmds[0], { target: { value: '["string"]' } })
      })

      await act(() => {
        fireEvent.change(getByLabelText(baseElement, 'Number of restarts'), { target: { value: 12 } })
        fireEvent.change(getByLabelText(baseElement, 'Max duration in seconds'), { target: { value: 123 } })
        fireEvent.change(getByLabelText(baseElement, 'Port'), { target: { value: 123 } })
      })

      const submitButton = getByTestId(baseElement, 'submit-button')

      await act(() => {
        submitButton.click()
      })

      expect(editApplicationSpy.mock.calls[0][0].data).toStrictEqual({
        ...mockLifecycleJobApplication,
        schedule: {
          on_delete: {
            arguments: ['string'],
            entrypoint: '/',
          },
        },
        max_duration_seconds: '123',
        max_nb_restart: '12',
        port: '123',
      })
    })
  })
})
