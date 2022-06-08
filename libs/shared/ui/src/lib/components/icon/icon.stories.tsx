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
  'icon-solid-link',
  'icon-solid-ellipsis-v',
  'icon-solid-clock',
  'icon-solid-browser',
  'icon-solid-ellipsis-vertical',
  'icon-solid-chart-area',
  'icon-solid-circle-xmark',
  'icon-solid-arrow-down',
  'icon-solid-trash',
  'icon-solid-code-commit',
  'icon-solid-pen',
  'icon-solid-grip-lines',
  'icon-solid-arrow-left',
  // schema: favicons name
]

function copyName(name: string) {
  navigator.clipboard.writeText(name)
}

const Template: Story<IconProps> = () => (
  <div className="storybook-icons text-center">
    <div className="storybook-icons__container max-w-sm w-full p-3 rounded bg-element-light-lighter-300 border-solid border-x border-y border-element-light-lighter-500 flex flex-wrap gap-x-2 justify-center mb-6 mx-auto">
      <h2 className="w-full mb-2">SVG Icons</h2>
      <button onClick={() => copyName(IconEnum.GITHUB)}>
        <Icon name={IconEnum.GITHUB} />
      </button>
      <button onClick={() => copyName(IconEnum.GITLAB)}>
        <Icon name={IconEnum.GITLAB} />
      </button>
      <button onClick={() => copyName(IconEnum.BITBUCKET)}>
        <Icon name={IconEnum.BITBUCKET} />
      </button>
      <button onClick={() => copyName(IconEnum.ENVIRONMENT)}>
        <Icon name={IconEnum.ENVIRONMENT} />
      </button>
      <button onClick={() => copyName(IconEnum.APPLICATION)}>
        <Icon name={IconEnum.APPLICATION} />
      </button>
      <button onClick={() => copyName(IconEnum.DATABASE)}>
        <Icon name={IconEnum.DATABASE} />
      </button>
      <button onClick={() => copyName(IconEnum.AWS)}>
        <Icon name={IconEnum.AWS} />
      </button>
      <button onClick={() => copyName(IconEnum.AWS_GRAY)}>
        <Icon name={IconEnum.AWS_GRAY} />
      </button>
      <button onClick={() => copyName(IconEnum.SCALEWAY)}>
        <Icon name={IconEnum.SCALEWAY} />
      </button>
      <button onClick={() => copyName(IconEnum.SCALEWAY_GRAY)}>
        <Icon name={IconEnum.SCALEWAY_GRAY} />
      </button>
      <button onClick={() => copyName(IconEnum.DO)}>
        <Icon name={IconEnum.DO} />
      </button>
      <button onClick={() => copyName(IconEnum.DO_GRAY)}>
        <Icon name={IconEnum.DO_GRAY} />
      </button>
      <button onClick={() => copyName(IconEnum.SUCCESS)}>
        <Icon name={IconEnum.SUCCESS} />
      </button>
      <button onClick={() => copyName(IconEnum.ERROR)}>
        <Icon name={IconEnum.ERROR} />
      </button>
      <button onClick={() => copyName(IconEnum.PAUSE)}>
        <Icon name={IconEnum.PAUSE} />
      </button>
      <button onClick={() => copyName(IconEnum.DELETE)}>
        <Icon name={IconEnum.DELETE} />
      </button>
      <button onClick={() => copyName(IconEnum.PROGRESS)}>
        <Icon name={IconEnum.PROGRESS} />
      </button>
      <button onClick={() => copyName(IconEnum.DOCKER)}>
        <Icon name={IconEnum.DOCKER} width="24" />
      </button>
      <button onClick={() => copyName(IconEnum.POSTGRESQL)}>
        <Icon name={IconEnum.POSTGRESQL} width="24" />
      </button>
      <button onClick={() => copyName(IconEnum.REDIS)}>
        <Icon name={IconEnum.REDIS} width="24" />
      </button>
      <button onClick={() => copyName(IconEnum.BUILDPACKS)}>
        <Icon name={IconEnum.BUILDPACKS} width="24" />
      </button>
      <button onClick={() => copyName(IconEnum.MONGODB)}>
        <Icon name={IconEnum.MONGODB} width="16" />
      </button>
      <button onClick={() => copyName(IconEnum.MYSQL)}>
        <Icon name={IconEnum.MYSQL} width="20" />
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
