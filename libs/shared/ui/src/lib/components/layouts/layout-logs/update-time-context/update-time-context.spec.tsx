import { fireEvent, getByRole, render } from '@testing-library/react'
import { useContext } from 'react'
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
    const { baseElement } = render(
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
    const { baseElement } = render(
      <UpdateTimeContext.Provider
        value={{
          ...{ utc: false },
          setUpdateTimeContext: setUpdateTime,
        }}
      >
        <Content />
      </UpdateTimeContext.Provider>
    )

    const button = getByRole(baseElement, 'button')
    fireEvent.click(button)

    expect(baseElement.textContent).toBe('Click false')
  })
})
