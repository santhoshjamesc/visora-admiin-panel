// SupabaseUploader.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rjzfesfhyqvrzjlplqqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VFsmoJ6NPgzHYIBghSY58Q_ejbyw8MK';
const BUCKET_NAME = 'VizContent'; // replace with your bucket name

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type ContentType = 'IMG' | '3D';

class SupabaseUploader {
  private static instance: SupabaseUploader;

  private constructor() {}

  public static getInstance(): SupabaseUploader {
    if (!SupabaseUploader.instance) {
      SupabaseUploader.instance = new SupabaseUploader();
    }
    return SupabaseUploader.instance;
  }

  /**
   * Uploads a file to Supabase and returns the public URL via callback
   * @param file File object to upload
   * @param contentType 'IMG' | '3D'
   * @param callback function(publicUrl: string | null)
   */
  public async uploadFile(
    file: File,
    contentType: ContentType,
    callback: (publicUrl: string | null) => void
  ) {
    if (!file) {
      console.error('No file provided');
      callback(null);
      return;
    }

    const fileName = `${Date.now()}_${file.name}`;
    let options: any = {};

    if (contentType === 'IMG') options.contentType = 'image/png';
    else if (contentType === '3D') options.contentType = 'application/octet-stream';

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, options);

      if (uploadError) {
        console.error('Upload failed:', uploadError.message);
        callback(null);
        return;
      }

      // Fixed: getPublicUrl returns { data: { publicUrl } }, not { publicUrl, error }
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        console.error('Error getting public URL: No URL returned');
        callback(null);
        return;
      }

      console.log('Uploaded! Public URL:', data.publicUrl);
      callback(data.publicUrl);
    } catch (err: any) {
      console.error('Unexpected error:', err.message);
      callback(null);
    }
  }
}

// STATIC USAGE
export const uploadFileStatic = (
  file: File,
  contentType: ContentType,
  callback: (publicUrl: string | null) => void
) => {
  SupabaseUploader.getInstance().uploadFile(file, contentType, callback);
};