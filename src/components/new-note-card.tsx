import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let SpeechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){
    setContent(event.target.value)

    if(event.target.value === ''){
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent){
    event.preventDefault()

    if(content.trim() === ''){
      toast.error('O conteúdo da nota não pode estar vazio.')
      return
    }

    onNoteCreated(content)
    setContent('')
    setShouldShowOnboarding(true)

    toast.success('Nota salva com sucesso!')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable){
      toast.error('Seu navegador não suporta a API de reconhecimento de voz.')
      return
    }

    setIsRecording(true)

    setShouldShowOnboarding(false)


    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    SpeechRecognition = new SpeechRecognitionAPI()

    SpeechRecognition.lang = 'pt-BR'
    SpeechRecognition.continuous = true
    SpeechRecognition.maxAlternatives = 1
    SpeechRecognition.interimResults = true

    SpeechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)

    }

    SpeechRecognition.onerror = (event) => {
      console.error(event.error)
    }

    SpeechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if(SpeechRecognition){
      SpeechRecognition.stop()
    }
  }


  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 text-left gap-3 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-200">Adicionar nota</span>

        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:top-1/2 md:max-w-[640px] w-full bg-slate-700 md:rounded-md flex flex-col md:h-[60vh]'>
          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
            <X className='size-5' />
          </Dialog.Close>

          <form className='flex-1 flex flex-col'>
          <div className='flex flex-1 flex-col gap-3 p-5 '>
            <span className="text-sm font-medium text-slate-300">
              Adicionar nota
            </span>

            {shouldShowOnboarding ? (
              <p className="text-sm leading-6 text-slate-400">
                Começe <button type="button" onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto.</button>
              </p>
            ) : (
              <textarea autoFocus 
              className='text-sm leading-6 text-slate-400 bg-transparent outline-none resize-none flex-1'
              onChange={handleContentChange}
              value = {content}
              />
            )}
          </div>

          {isRecording ? (
            <button type='button' onClick={handleStopRecording} className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium group hover:text-slate-100' >
                <div className='size-3 rounded-full bg-red-500 animate-pulse'></div>
                Gravando ! (Clique para interromper)
              </button>

          ):(
            <button type='button' onClick={handleSaveNote} className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium group hover:bg-lime-500' >
                Salvar nota
              </button>
          )}

          </form>
        </Dialog.Content>
      </Dialog.Portal>

    </Dialog.Root>



  );
}