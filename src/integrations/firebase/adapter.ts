// Compatibility adapter to convert Supabase-style calls to Firebase
// This allows gradual migration without breaking everything at once
import { 
  getProfile, 
  getProfileByUserId, 
  getProfileByHandle,
  createProfile,
  updateProfile,
  watchProfile,
  watchProfileByUserId
} from './db';
import { auth, storage } from './client';
import { ref, getDownloadURL } from 'firebase/storage';

// Supabase-like client interface
export const firebaseAdapter = {
  auth: {
    getUser: async () => {
      const user = auth.currentUser;
      return {
        data: { user },
        error: null
      };
    },
    getSession: async () => {
      const user = auth.currentUser;
      return {
        data: { 
          session: user ? { user, expires_at: null } : null 
        },
        error: null
      };
    }
  },
  
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        maybeSingle: async () => {
          if (table === 'profiles') {
            if (column === 'user_id') {
              const data = await getProfileByUserId(value);
              return { data, error: data ? null : { code: 'PGRST116', message: 'Not found' } };
            }
            if (column === 'id') {
              const data = await getProfile(value);
              return { data, error: data ? null : { code: 'PGRST116', message: 'Not found' } };
            }
          }
          return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Query not implemented' } };
        },
        single: async () => {
          if (table === 'profiles') {
            if (column === 'user_id') {
              const data = await getProfileByUserId(value);
              if (!data) {
                return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
              }
              return { data, error: null };
            }
            if (column === 'id') {
              const data = await getProfile(value);
              if (!data) {
                return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
              }
              return { data, error: null };
            }
          }
          return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Query not implemented' } };
        },
        limit: (count: number) => ({
          maybeSingle: async () => {
            // Same as above but with limit (not really needed for single)
            return this.maybeSingle();
          }
        })
      }),
      maybeSingle: async () => {
        // Handle direct queries without filters
        return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Query not implemented' } };
      }
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: async (callback?: (result: any) => void) => {
          if (table === 'profiles' && column === 'id') {
            try {
              const updated = await updateProfile(value, data);
              const result = { data: updated, error: null };
              if (callback) callback(result);
              return result;
            } catch (error: any) {
              const result = { data: null, error };
              if (callback) callback(result);
              return result;
            }
          }
          if (table === 'profiles' && column === 'user_id') {
            // First get profile by user_id, then update by id
            const profile = await getProfileByUserId(value);
            if (!profile) {
              const result = { data: null, error: { code: 'PGRST116', message: 'Not found' } };
              if (callback) callback(result);
              return result;
            }
            try {
              const updated = await updateProfile(profile.id, data);
              const result = { data: updated, error: null };
              if (callback) callback(result);
              return result;
            } catch (error: any) {
              const result = { data: null, error };
              if (callback) callback(result);
              return result;
            }
          }
          const result = { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Update not implemented' } };
          if (callback) callback(result);
          return result;
        }
      })
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => {
          if (table === 'profiles') {
            try {
              // Generate ID if not provided
              const profileId = data.id || crypto.randomUUID();
              const created = await createProfile(profileId, data);
              return { data: created, error: null };
            } catch (error: any) {
              return { data: null, error };
            }
          }
          return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Insert not implemented' } };
        }
      })
    })
  }),
  
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File, options?: any) => {
        // This is handled by use-image-upload hook now
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        const storageRef = ref(storage, `${bucket}/${path}`);
        return {
          data: {
            publicUrl: `https://storage.googleapis.com/${storage.app.options.storageBucket}/${bucket}/${path}`
          }
        };
      },
      remove: async (paths: string[]) => {
        // Delete is handled differently in Firebase
        return { data: null, error: null };
      }
    })
  },
  
  channel: (name: string) => ({
    on: (event: string, config: any, callback: (payload: any) => void) => {
      if (event === 'postgres_changes' && config.table === 'profiles') {
        if (config.filter?.includes('user_id=eq.')) {
          const userId = config.filter.split('user_id=eq.')[1];
          return watchProfileByUserId(userId, (data) => {
            callback({ new: data, old: null });
          });
        }
        if (config.filter?.includes('id=eq.')) {
          const profileId = config.filter.split('id=eq.')[1];
          return watchProfile(profileId, (data) => {
            callback({ new: data, old: null });
          });
        }
      }
      // Return unsubscribe function
      return () => {};
    },
    subscribe: () => ({})
  }),
  
  removeChannel: (channel: any) => {
    if (typeof channel === 'function') {
      channel(); // Unsubscribe
    }
  },
  
  functions: {
    invoke: async (functionName: string, options?: any) => {
      // Cloud Functions will be implemented separately
      // For now, return error
      return {
        data: null,
        error: { message: 'Cloud Functions not yet migrated' }
      };
    }
  }
};
