import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { IconEnum } from '@qovery/shared/enums'
import Icon, { IconProps } from './icon'
import { IconAwesomeEnum } from './icon-awesome.enum'

export default {
  component: Icon,
  title: 'Icon',
} as Meta

// turn enum to array
const awesomeIconEnumNames = Object.entries(IconAwesomeEnum).map(([enumName, value]) => ({ enumName, value }))

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
      <button onClick={() => copyName(IconEnum.GITHUB_WHITE)}>
        <Icon name={IconEnum.GITHUB_WHITE} />
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
      <button onClick={() => copyName(IconEnum.CRON_JOB)}>
        <Icon name={IconEnum.CRON_JOB} />
      </button>
      <button onClick={() => copyName(IconEnum.LIFECYCLE_JOB)}>
        <Icon name={IconEnum.LIFECYCLE_JOB} />
      </button>
      <button onClick={() => copyName(IconEnum.LIFECYCLE_JOB_STROKE)}>
        <Icon name={IconEnum.LIFECYCLE_JOB_STROKE} />
      </button>
      <button onClick={() => copyName(IconEnum.CRON_JOB_STROKE)}>
        <Icon name={IconEnum.CRON_JOB_STROKE} />
      </button>
      <button onClick={() => copyName(IconEnum.AWS)}>
        <Icon name={IconEnum.AWS} />
      </button>
      <button onClick={() => copyName(IconEnum.AWS_GRAY)}>
        <Icon name={IconEnum.AWS_GRAY} />
      </button>
      <button onClick={() => copyName(IconEnum.SCW)}>
        <Icon name={IconEnum.SCW} />
      </button>
      <button onClick={() => copyName(IconEnum.SCW_GRAY)}>
        <Icon name={IconEnum.SCW_GRAY} />
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
      <button onClick={() => copyName(IconEnum.INFORMATION)}>
        <Icon name={IconEnum.INFORMATION} width="16" />
      </button>
      <button onClick={() => copyName(IconEnum.MYSQL)}>
        <Icon name={IconEnum.MYSQL} width="20" />
      </button>
      <button onClick={() => copyName(IconEnum.CHILDREN_ARROW)}>
        <Icon name={IconEnum.CHILDREN_ARROW} />
      </button>
    </div>
    <div className="storybook-icons__container max-w-sm w-full p-3 rounded bg-element-light-lighter-300 border-solid border-x border-y border-element-light-lighter-500 flex flex-wrap gap-x-2 justify-center mb-6 mx-auto">
      <h2 className="w-full mb-2">FontAwesome Icons</h2>
      {awesomeIconEnumNames.map((item) => (
        <button key={item.enumName} onClick={() => copyName(item.enumName)}>
          <Icon name={item.value} />
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
