import { IconEnum } from '@console/shared/enums'
import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import Icon, { IconProps } from './icon'

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
  'icon-solid-angle-down',
  'icon-solid-gauge-high',
  'icon-solid-layer-group',
  'icon-solid-clock-rotate-left',
  'icon-solid-rocket',
  'icon-solid-bell',
  'icon-solid-wheel',
  'icon-solid-circle-info',
  'icon-solid-magnifying-glass',
  'icon-solid-xmark',
  'icon-brands-discord',
  'icon-solid-envelope',
  'icon-solid-keyboard',
  'icon-solid-wave-pulse',
  'icon-solid-book',
  'icon-solid-arrow-right',
  'icon-solid-globe',
  'icon-solid-cloud',
  'icon-solid-arrow-right-from-bracket',
  'icon-solid-camera',
  'icon-solid-caret-down',
  'icon-solid-terminal',
  'icon-solid-scroll',
  'icon-solid-copy',
  'icon-solid-play',
  'icon-solid-circle-stop',
  'icon-solid-circle-exclamation',
  'icon-solid-rotate-right',
  'icon-solid-rotate',
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
