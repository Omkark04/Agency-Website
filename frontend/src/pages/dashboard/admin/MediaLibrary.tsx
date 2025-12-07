import { useEffect, useState } from 'react';
import { listMedia, uploadMedia, createMedia } from '../../../api/media';
import type { MediaItem } from '../../../api/media';
import { Sidebar } from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const loadMedia = async () => {
    try {
      const res = await listMedia();
      setMedia(res.data);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  useEffect(() => { 
    loadMedia(); 
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const uploadResponse = await uploadMedia(file);
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      
      await createMedia({ 
        url: uploadResponse.data.url,
        media_type: mediaType,
        caption: caption || file.name,
        // These fields will be set by the backend if needed
        owner: user?.id as number | undefined,
        project: null,
        service: null
      });
      
      await loadMedia();
      setFile(null);
      setCaption('');
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role || 'admin'}
      />
      <div className="flex-1">
        <Header 
          title="Media Library" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <main className="p-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter a caption for this file"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File
                </label>
                <div className="mt-1 flex">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="flex-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <Button 
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="ml-2"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {media.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
                {media.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                      {item.media_type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.caption || 'Media file'}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-400">
                            <svg
                              className="h-12 w-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-600 truncate">
                      {item.caption || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No media</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading a new file.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
