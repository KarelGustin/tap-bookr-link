// Firebase migration: This file now exports Firebase-compatible client
// Import Firebase adapter instead of Supabase
import { firebaseAdapter } from '@/integrations/firebase/adapter';
import { getProfileByUserId, getProfile, createProfile, updateProfile } from '@/integrations/firebase/db';
import { auth } from '@/integrations/firebase/client';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

// Create Supabase-compatible interface using Firebase
export const supabase = {
  auth: {
    getUser: async () => {
      const user = auth.currentUser;
      return {
        data: { user: user ? {
          id: user.uid,
          email: user.email,
          ...user
        } : null },
        error: null
      };
    },
    getSession: async () => {
      const user = auth.currentUser;
      return {
        data: { 
          session: user ? { 
            user: {
              id: user.uid,
              email: user.email,
              ...user
            },
            expires_at: null
          } : null 
        },
        error: null
      };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? {
          user: {
            id: user.uid,
            email: user.email,
            ...user
          }
        } : null);
      });
      return { data: { subscription: { unsubscribe } } };
    },
    signUp: async (options: { email: string; password: string; options?: any }) => {
      const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, options.email, options.password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
        }
        return { data: { user: userCredential.user, session: null }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error };
      }
    },
    signInWithPassword: async (options: { email: string; password: string }) => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, options.email, options.password);
        return { data: { user: userCredential.user, session: null }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error };
      }
    },
    signOut: async () => {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      return { error: null };
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
            if (column === 'handle') {
              const profilesRef = collection(db, 'profiles');
              const q = query(profilesRef, where('handle', '==', value));
              const querySnapshot = await getDocs(q);
              if (querySnapshot.empty) {
                return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
              }
              const doc = querySnapshot.docs[0];
              const data = { id: doc.id, ...doc.data() };
              return { data, error: null };
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
            if (column === 'handle') {
              const profilesRef = collection(db, 'profiles');
              const q = query(profilesRef, where('handle', '==', value));
              const querySnapshot = await getDocs(q);
              if (querySnapshot.empty) {
                return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
              }
              const doc = querySnapshot.docs[0];
              const data = { id: doc.id, ...doc.data() };
              return { data, error: null };
            }
          }
          return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Query not implemented' } };
        }
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        const updateFn = async () => {
          if (table === 'profiles' && column === 'id') {
            try {
              await updateProfile(value, data);
              const updated = await getProfile(value);
              return { data: updated, error: null };
            } catch (error: any) {
              return { data: null, error };
            }
          }
          if (table === 'profiles' && column === 'user_id') {
            const profile = await getProfileByUserId(value);
            if (!profile) {
              return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
            }
            try {
              await updateProfile(profile.id, data);
              const updated = await getProfile(profile.id);
              return { data: updated, error: null };
            } catch (error: any) {
              return { data: null, error };
            }
          }
          return { data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Update not implemented' } };
        };
        return updateFn();
      }
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => {
          if (table === 'profiles') {
            try {
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
        const { ref, uploadBytes } = await import('firebase/storage');
        const { storage } = await import('@/integrations/firebase/client');
        try {
          const storageRef = ref(storage, `${bucket}/${path}`);
          await uploadBytes(storageRef, file, {
            contentType: file.type,
            ...options
          });
          return { data: { path }, error: null };
        } catch (error: any) {
          return { data: null, error };
        }
      },
      getPublicUrl: (path: string) => {
        // Import storage dynamically to avoid circular dependencies
        import('@/integrations/firebase/client').then(({ storage }) => {
          // This is async but getPublicUrl should be sync in Supabase API
          // For now, construct URL directly
        });
        // Construct public URL - storage bucket is in env
        const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
        const publicUrl = `https://storage.googleapis.com/${storageBucket}/${bucket}/${path}`;
        return { data: { publicUrl } };
      },
      remove: async (paths: string[]) => {
        const { ref, deleteObject } = await import('firebase/storage');
        const { storage } = await import('@/integrations/firebase/client');
        try {
          await Promise.all(paths.map(p => deleteObject(ref(storage, `${bucket}/${p}`))));
          return { data: null, error: null };
        } catch (error: any) {
          return { data: null, error };
        }
      }
    })
  },
  
  channel: (name: string) => ({
    on: (event: string, config: any, callback: (payload: any) => void) => {
      if (event === 'postgres_changes' && config.table === 'profiles') {
        if (config.filter?.includes('user_id=eq.')) {
          const userId = config.filter.split('user_id=eq.')[1];
          const profilesRef = collection(db, 'profiles');
          const q = query(profilesRef, where('user_id', '==', userId));
          return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              callback({ new: { id: doc.id, ...doc.data() }, old: null });
            }
          });
        }
        if (config.filter?.includes('id=eq.')) {
          const profileId = config.filter.split('id=eq.')[1];
          const docRef = doc(db, 'profiles', profileId);
          return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              callback({ new: { id: docSnap.id, ...docSnap.data() }, old: null });
            }
          });
        }
      }
      return { unsubscribe: () => {} };
    },
    subscribe: () => ({})
  }),
  
  removeChannel: (channel: any) => {
    if (channel && typeof channel === 'function') {
      channel();
    }
  },
  
  functions: {
    invoke: async (functionName: string, options?: any) => {
      // Cloud Functions will be implemented separately
      return {
        data: null,
        error: { message: 'Cloud Functions migration in progress' }
      };
    }
  }
};