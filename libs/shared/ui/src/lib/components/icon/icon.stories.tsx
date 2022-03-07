import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import Icon, { IconProps } from './icon'
import { IconEnum } from '../../enums/icon.enum'

export default {
  component: Icon,
  title: 'Icon',
} as Meta

const FaIcons = [
  'icon-brands-accessible',
  'icon-solid-star',
  'icon-solid-plus',
  'icon-solid-circle-plus',
  'icon-solid-check',
  'icon-solid-infinity',
  // schema: favicons name
]

function copyName(name: string) {
  navigator.clipboard.writeText(name)
}

const Template: Story<IconProps> = (args) => (
  <div className="storybook-icons text-center">
    <div className="storybook-icons__container max-w-sm w-full p-3 rounded bg-element-light-lighter-300 border-solid border-x border-y border-element-light-lighter-500 flex flex-wrap gap-x-2 justify-center mb-6 mx-auto">
      <h2 className="w-full mb-2">SVG Icons</h2>
      <button onClick={() => copyName('GITHUB')}>
        <Icon name={IconEnum.GITHUB} />
      </button>
      <button onClick={() => copyName('GITLAB')}>
        <Icon name={IconEnum.GITLAB} />
      </button>
      <button onClick={() => copyName('BITBUCKET')}>
        <Icon name={IconEnum.BITBUCKET} />
      </button>
    </div>
    <div className="storybook-icons__container max-w-sm w-full p-3 rounded bg-element-light-lighter-300 border-solid border-x border-y border-element-light-lighter-500 flex flex-wrap gap-x-2 justify-center mb-6 mx-auto">
      <h2 className="w-full mb-2">FontAwesome Icons</h2>
      {FaIcons.map((fa) => (
        <button key={fa} onClick={() => copyName(fa)}>
          <Icon name={fa} />
        </button>
      ))}
    </div>
  </div>
)

export const Primary = Template.bind({})
Primary.args = {
  name: select('Icon', IconEnum, IconEnum.GITHUB),
  className: '',
}
