import api from '../api';
import { useEffect, useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  caption: string;
  created_at: string;
}

const MediaDetail: React.FC<{ mediaId: string; onClose: () => void; onUpdated: () => void; }> = ({ mediaId, onClose, onUpdated }) => {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    api.get(`/media/${mediaId}/`).then(res => {
      setMedia(res.data);
      setEditCaption(res.data.caption || '');
    }).finally(() => setLoading(false));
  }, [mediaId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.patch(`/media/${mediaId}/`, {
        caption: editCaption,
      });
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update media');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this media item?')) return;
    await api.delete(`/media/${mediaId}/`);
    onClose();
    onUpdated();
  };

  if (loading) return <div>Loading...</div>;
  if (!media) return <div>Media not found.</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">Media Detail</h2>
        {media.media_type.startsWith('image') ? (
          <img src={media.url} alt={media.caption} className="w-full h-48 object-contain rounded mb-2" />
        ) : (
          <video src={media.url} controls className="w-full h-48 object-contain rounded mb-2" />
        )}
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <input className="border rounded px-3 py-2 w-full" value={editCaption} onChange={e => setEditCaption(e.target.value)} />
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-2"><strong>Caption:</strong> {media.caption}</div>
            <div className="mb-2"><strong>Created:</strong> {new Date(media.created_at).toLocaleDateString()}</div>
            <div className="flex gap-2 mt-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaDetail;
