import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://tfehvezqsvzjhjyzbeeb.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZWh2ZXpxc3Z6amhqeXpiZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzI3NTksImV4cCI6MjEwNTU0ODc1OX0.dWP0S9GFCj6vTEP1zV1vONiz-t_LZk6gqsmIStwd-ZI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Storage bucket name for assets (logos, candidate photos)
export const BUCKET_NAME = 'eosis-assets';

/**
 * Upload an image file to Supabase Storage, with fallback to data URL if bucket is not yet configured.
 */
export async function uploadAssetImage(file: File, folder: 'candidates' | 'school' = 'candidates'): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error, falling back to Base64:', error.message);
      return await fileToBase64(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Upload failed, falling back to base64 data URL:', err);
    return await fileToBase64(file);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Check if the Supabase tables exist and are reachable
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesReady: boolean;
  message: string;
}> {
  try {
    const { error } = await supabase.from('settings').select('id').limit(1);

    if (!error) {
      return {
        connected: true,
        tablesReady: true,
        message: 'Terkoneksi ke Supabase Database dengan tabel siap pakai.',
      };
    }

    // PGRST205 means table doesn't exist in public schema
    if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      return {
        connected: true,
        tablesReady: false,
        message: 'Koneksi Supabase aktif, namun tabel database belum dibuat di SQL Editor.',
      };
    }

    return {
      connected: false,
      tablesReady: false,
      message: `Error koneksi: ${error.message}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesReady: false,
      message: `Tidak dapat menghubungi Supabase: ${err?.message || 'Network error'}`,
    };
  }
}
