// pages/_app.js
import '../styles/globals.css'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Dynamically import Supabase only on client side after env vars are available
    let cleanup = () => {}
    const initAuth = async () => {
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess)
      })
      cleanup = () => subscription.unsubscribe()
    }
    initAuth()
    return () => cleanup()
  }, [])

  return <Component {...pageProps} session={session} />
}
