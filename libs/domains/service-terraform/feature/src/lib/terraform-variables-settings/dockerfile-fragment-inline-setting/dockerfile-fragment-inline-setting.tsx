import { CodeEditorInlineSetting, useModal } from '@qovery/shared/ui'
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
    <CodeEditorInlineSetting
      title="Commands"
      emptyStateText="No commands defined."
      addButtonLabel="Add commands"
      language="dockerfile"
      height="200px"
      content={content}
      onOpenModal={openModalDockerfileFragment}
    />
  )
}

export default DockerfileFragmentInlineSetting
