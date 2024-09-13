import { useContext } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { UpdateTimeContext } from './update-time-context'

const setUpdateTime = jest.fn()

function Content() {
  const { utc, setUpdateTimeContext } = useContext(UpdateTimeContext)

  return (
    <div>
      <button onClick={() => setUpdateTimeContext && setUpdateTimeContext({ utc: true })}>
        Click {utc.toString()}
      </button>
    </div>
  )
}

describe('UpdateTimeContext', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <UpdateTimeContext.Provider
        value={{
          ...{ utc: false },
          setUpdateTimeContext: setUpdateTime,
        }}
      >
        <Content />
      </UpdateTimeContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should change context UTC boolean', async () => {
    const { userEvent, baseElement } = renderWithProviders(
      <UpdateTimeContext.Provider
        value={{
          ...{ utc: false },
          setUpdateTimeContext: setUpdateTime,
        }}
      >
        <Content />
      </UpdateTimeContext.Provider>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(baseElement).toHaveTextContent('Click false')
  })
})
