declare module 'marked' {
  export const marked: {
    parse(src: string): Promise<string>
  }
}
