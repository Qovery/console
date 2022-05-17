/* eslint-disable-next-line */
import { BaseLink, Button, ButtonStyle, Icon } from '@console/shared/ui'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'

export interface AboutProps {
  description: string
  buildMode?: BuildModeEnum
  gitProvider?: GitProviderEnum
  link: BaseLink
}

export function About(props: AboutProps) {
  const { description, buildMode, link, gitProvider } = props
  return (
    <div className="pt-2 pb-8 px-8 flex flex-col items-start border-b border-element-light-lighter-400">
      <div className="text-subtitle mb-3 text-text-600">About</div>
      <p className="text-text-500 mb-5">{description ? description : <em>No description provided yet</em>}</p>
      {buildMode && (
        <div className="flex gap-1 items-center px-2 h-6 mb-5 capitalize border leading-0 rounded border-element-light-lighter-500 text-text-500 text-sm font-medium">
          <Icon name={buildMode} className="w-4" />
          {buildMode.toLowerCase()}
        </div>
      )}
      {gitProvider && (
        <Button
          link={link.link}
          style={ButtonStyle.STROKED}
          external={link.external}
          iconRight="icon-solid-arrow-up-right-from-square"
          className="capitalize"
        >
          {gitProvider.toLowerCase()}
        </Button>
      )}
    </div>
  )
}

export default About
