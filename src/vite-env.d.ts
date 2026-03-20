/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_MISTRAL_API_KEY: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
interface Window {
  SpeechRecognition: typeof SpeechRecognition
  webkitSpeechRecognition: typeof SpeechRecognition
}