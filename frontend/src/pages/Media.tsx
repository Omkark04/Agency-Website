import React from 'react';

import api from '../api/api';
import { useEffect, useState } from 'react';

import MediaDetail from '../../src/pages/MediaDetail'

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  caption: string;
  created_at: string;
}

const Media: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<string | null>(null);

  const fetchMedia = () => {
    setLoading(true);
    api.get<MediaItem[]>('/media/')
      .then((res: { data: MediaItem[] }) => setMedia(res.data))
      .catch(() => setError('Failed to load media'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  if (loading) return <div>Loading media...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      // Step 1: Get presigned URL
      const presignRes = await api.post('/media/presign/', {
        filename: file.name,
        content_type: file.type,
      });
      const { upload_url, public_url, key } = presignRes.data;
      // Step 2: Upload file to S3
      await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      // Step 3: Notify backend
      await api.post('/media/', {
        key,
        public_url,
        media_type: file.type.startsWith('image') ? 'image' : 'video',
        caption,
      });
      setFile(null);
      setCaption('');
      // Refresh media list
      setLoading(true);
      const res = await api.get('/media/');
      setMedia(res.data);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Your Media</h2>
      <form className="mb-6" onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="mb-2"
          required
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          className="border rounded px-3 py-2 mb-2 w-full"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
        {uploadError && <div className="text-red-600 text-sm mb-1">{uploadError}</div>}
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload Media'}
        </button>
      </form>
      {media.length === 0 ? (
        <div className="text-gray-500">No media found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {media.map(item => (
            <div key={item.id} className="border rounded p-2 cursor-pointer" onClick={() => setSelected(item.id)}>
              {item.media_type.startsWith('image') ? (
                <img src={item.url} alt={item.caption} className="w-full h-32 object-cover rounded" />
              ) : (
                <video src={item.url} controls className="w-full h-32 object-cover rounded" />
              )}
              <div className="text-xs mt-2 text-gray-700 truncate">{item.caption}</div>
              <div className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <MediaDetail
          mediaId={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchMedia}
        />
      )}
    </div>
  );
};

export default Media;
