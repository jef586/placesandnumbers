import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref(null)
const session = ref(null)
const loading = ref(true)

export function useSupabaseAuth() {
  onMounted(async () => {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
    loading.value = false

    supabase.auth.onAuthStateChange((_event, _session) => {
      session.value = _session
      user.value = _session?.user ?? null
    })
  })

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      user.value = data.user
      session.value = data.session
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }
}
