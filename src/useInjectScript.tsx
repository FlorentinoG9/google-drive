import { useEffect, useState } from 'react'

type ScriptStatus = 'init' | 'loading' | 'loaded' | 'error'

interface ScriptState {
  loaded: boolean
  error: boolean
}

interface InjectorState {
  queue: Record<string, ((error: boolean) => void)[]>
  scriptStatus: Record<string, ScriptStatus>
  scriptElements: Record<string, HTMLScriptElement>
}

const injectorState: InjectorState = {
  queue: {},
  scriptStatus: {},
  scriptElements: {},
}

export default function useInjectScript(url: string): [boolean, boolean] {
  const [state, setState] = useState<ScriptState>({
    loaded: false,
    error: false,
  })

  useEffect(() => {
    // Initialize script status if not already set
    if (!injectorState.scriptStatus[url]) {
      injectorState.scriptStatus[url] = 'init'
    }

    // Return early if script is already loaded or errored
    if (injectorState.scriptStatus[url] === 'loaded') {
      setState({ loaded: true, error: false })
      return
    }

    if (injectorState.scriptStatus[url] === 'error') {
      setState({ loaded: true, error: true })
      return
    }

    const handleScriptLoad = (error: boolean) => {
      // Update script status and notify all callbacks
      injectorState.queue[url]?.forEach(callback => callback(error))

      if (error) {
        console.error(`Failed to load script: ${url}`)
        injectorState.scriptElements[url]?.remove()
        injectorState.scriptStatus[url] = 'error'
      }
      else {
        injectorState.scriptStatus[url] = 'loaded'
      }

      // Cleanup script element reference
      delete injectorState.scriptElements[url]
    }

    const updateState = (error: boolean) => {
      setState({
        loaded: true,
        error,
      })
    }

    // Create and inject script element if not already present
    if (!injectorState.scriptElements[url]) {
      const script = document.createElement('script')
      script.src = url
      script.async = true

      script.addEventListener('load', () => handleScriptLoad(false))
      script.addEventListener('error', () => handleScriptLoad(true))

      injectorState.scriptElements[url] = script
      injectorState.scriptStatus[url] = 'loading'

      document.body.appendChild(script)
    }

    // Add state update callback to queue
    if (!injectorState.queue[url]) {
      injectorState.queue[url] = [updateState]
    }
    else {
      injectorState.queue[url].push(updateState)
    }

    // Cleanup function
    return () => {
      const script = injectorState.scriptElements[url]
      if (!script)
        return

      script.removeEventListener('load', () => handleScriptLoad(false))
      script.removeEventListener('error', () => handleScriptLoad(true))
    }
  }, [url])

  return [state.loaded, state.error]
}
