import React, { useEffect, useState } from 'react';
import api from '../api/api';

interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  caption: string;
  created_at: string;
  key?: string;
}

interface MediaDetailProps {
  mediaId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const MediaDetail: React.FC<MediaDetailProps> = ({ mediaId, onClose, onUpdated }) => {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMediaDetail = async () => {
      try {
        const res = await api.get<MediaItem>(`/media/${mediaId}/`);
        setMedia(res.data);
        setNewCaption(res.data.caption);
      } catch (err) {
        setError('Failed to load media details');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaDetail();
  }, [mediaId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media) return;

    setSaving(true);
    try {
      await api.patch(`/media/${mediaId}/`, { caption: newCaption });
      setMedia({ ...media, caption: newCaption });
      setEditing(false);
      onUpdated();
    } catch (err) {
      setError('Failed to update media');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!media) return;
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await api.delete(`/media/${mediaId}/`);
      onClose();
      onUpdated();
    } catch (err) {
      setError('Failed to delete media');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-red-600 text-center mb-4">{error || 'Media not found'}</div>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Media Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Media Preview */}
          <div className="mb-6">
            {media.media_type.startsWith('image') ? (
              <img
                src={media.url}
                alt={media.caption}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              />
            ) : (
              <video
                src={media.url}
                controls
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Media Info */}
          <div className="space-y-4">
            {editing ? (
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter caption..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setNewCaption(media.caption);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Caption</h4>
                  <p className="text-gray-900">
                    {media.caption || <span className="text-gray-400 italic">No caption</span>}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                  <p className="text-gray-900 capitalize">{media.media_type}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Created</h4>
                  <p className="text-gray-900">
                    {new Date(media.created_at).toLocaleDateString()} at{' '}
                    {new Date(media.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">URL</h4>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {media.url}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit Caption
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;
