export function onDrop(acceptedFiles: File[], handleData: (data: string) => void) {
  acceptedFiles.forEach((file) => {
    const reader = new FileReader()

    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = async () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result
      await handleData(binaryStr as string)
    }

    reader.readAsText(file)
  })
}
