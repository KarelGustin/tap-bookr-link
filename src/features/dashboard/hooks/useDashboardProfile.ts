import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useDashboardProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
    if (!error) setProfile(data as Profile | null)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { loadProfile() }, [loadProfile])

  return { profile, setProfile, loading, reload: loadProfile }
}


