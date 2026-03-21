/// <reference types="vite/client" />

declare module '*.jsx' {
  const component: any
  export default component
}

interface SpeechRecognitionResultItem {
  transcript: string
}

interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultItem
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: SpeechRecognitionResultListLike
  }
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike
}

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_MISTRAL_API_KEY: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}