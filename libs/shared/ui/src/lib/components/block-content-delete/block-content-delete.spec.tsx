import { render, screen } from '__tests__/utils/setup-jest'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import BlockContentDelete, { type BlockContentDeleteProps } from './block-content-delete'

describe('BlockContentDelete', () => {
  const props: BlockContentDeleteProps = {
    title: 'Delete',
    description: 'my-description',
    callback: jest.fn(),
    modalConfirmation: {
      title: 'title',
      description: 'description',
      mode: EnvironmentModeEnum.DEVELOPMENT,
      name: 'test',
    },
  }

  it('should render successfully', () => {
    const { baseElement } = render(<BlockContentDelete {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have custom icon', () => {
    props.list = [
      {
        text: 'Databases',
      },
      {
        text: 'Applications',
        icon: 'icon-solid-chart-area',
      },
    ]

    render(<BlockContentDelete {...props} />)

    const firstElement = screen.getByTestId(props.list[0].text)
    const secondElement = screen.getByTestId(props.list[1].text)

    expect(firstElement.querySelector('.icon-solid-trash')?.classList.contains('icon-solid-trash')).toBe(true)
    expect(secondElement.querySelector('.icon-solid-chart-area')?.classList.contains('icon-solid-chart-area')).toBe(
      true
    )
  })
})
