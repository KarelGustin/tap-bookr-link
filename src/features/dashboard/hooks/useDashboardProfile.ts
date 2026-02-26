import { useCallback, useEffect, useState } from 'react'
import { getProfileByUserId } from '@/integrations/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

type Profile = {
  id: string;
  user_id: string;
  [key: string]: any;
}

export function useDashboardProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    try {
      const profileData = await getProfileByUserId(user.id)
      setProfile(profileData as Profile | null)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { loadProfile() }, [loadProfile])

  return { profile, setProfile, loading, reload: loadProfile }
}


