import { act, render, waitFor } from '__tests__/utils/setup-jest'
import { useContext } from 'react'
import { ServiceStageIdsContext, ServiceStageIdsProvider } from './service-stage-ids-context'

describe('ServiceStageIdsContext', () => {
  it('should provide the initial stage state', () => {
    const TestComponent = () => {
      const { stageId, updateStageId } = useContext(ServiceStageIdsContext)
      return (
        <div>
          <p data-testid="stage">{stageId}</p>
          <button data-testid="set-stage" onClick={() => updateStageId('id')}>
            Set Stage
          </button>
        </div>
      )
    }

    const { getByTestId } = render(
      <ServiceStageIdsProvider>
        <TestComponent />
      </ServiceStageIdsProvider>
    )

    const stage = getByTestId('stage')
    const setStageButton = getByTestId('set-stage')

    act(() => {
      setStageButton.click()
    })

    waitFor(() => {
      expect(stage.textContent).toBe('id')
    })
  })
})
