import { useContext } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceStageIdsContext, ServiceStageIdsProvider } from './service-stage-ids-context'

describe('ServiceStageIdsContext', () => {
  it('should provide the initial stage state', async () => {
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

    const { userEvent } = renderWithProviders(
      <ServiceStageIdsProvider>
        <TestComponent />
      </ServiceStageIdsProvider>
    )

    const stage = screen.getByTestId('stage')
    const setStageButton = screen.getByTestId('set-stage')

    await userEvent.click(setStageButton)

    waitFor(() => {
      expect(stage).toHaveTextContent('id')
    })
  })
})
