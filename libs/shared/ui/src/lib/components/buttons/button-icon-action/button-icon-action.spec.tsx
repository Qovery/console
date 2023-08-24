import { render } from '__tests__/utils/setup-jest'
import Icon from '../../icon/icon'
import ButtonIconAction, { type ButtonIconActionProps } from './button-icon-action'

describe('ButtonIconAction', () => {
  let props: ButtonIconActionProps

  beforeEach(() => {
    props = {
      actions: [
        {
          iconLeft: <Icon name="icon-solid-play" />,
          iconRight: <Icon name="icon-solid-angle-down" />,
          menus: [
            {
              items: [
                {
                  name: 'Deploy',
                  onClick: () => console.log('Deploy'),
                  contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
                },
                {
                  name: 'Stop',
                  onClick: () => console.log('Stop'),
                  contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
                },
              ],
            },
          ],
          menusClassName: 'border-r border-r-neutral-250',
        },
      ],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<ButtonIconAction {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
