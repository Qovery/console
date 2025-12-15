import { BlockContent, Button, CodeEditor, Icon, useModal } from '@qovery/shared/ui'
import DockerfileFragmentInlineModal from '../dockerfile-fragment-inline-modal/dockerfile-fragment-inline-modal'

export interface DockerfileFragmentInlineSettingProps {
  onSubmit: (value?: string) => void
  content?: string
}

export function DockerfileFragmentInlineSetting({ onSubmit, content }: DockerfileFragmentInlineSettingProps) {
  const { openModal, closeModal } = useModal()

  const openModalDockerfileFragment = () => {
    openModal({
      content: <DockerfileFragmentInlineModal content={content} onClose={closeModal} onSubmit={onSubmit} />,
      options: {
        fullScreen: true,
      },
    })
  }

  return (
    <BlockContent
      title="Commands"
      classNameContent="p-0"
      headRight={
        content && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={openModalDockerfileFragment}
            className="hover:text-neutral-400"
          >
            <Icon iconName="pen" />
          </Button>
        )
      }
    >
      {content ? (
        <CodeEditor value={content} readOnly height="200px" language="dockerfile" />
      ) : (
        <div className="my-4 px-10 py-5 text-center">
          <Icon iconName="wave-pulse" className="text-neutral-350" />
          <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No commands defined.</p>
          <Button type="button" size="md" onClick={openModalDockerfileFragment}>
            Add commands <Icon iconName="pen" className="ml-2" />
          </Button>
        </div>
      )}
    </BlockContent>
  )
}

export default DockerfileFragmentInlineSetting
