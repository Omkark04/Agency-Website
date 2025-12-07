import { useEffect, useState } from 'react';
import { listMedia, uploadMedia, createMedia } from '../../../api/media';
import type { MediaItem } from '../../../api/media';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { 
  FiUpload, 
  FiImage, 
  FiVideo, 
  FiFile, 
  FiDownload,
  FiCopy,
  FiCalendar,
  FiSearch,
  FiX,
  FiCheck
} from 'react-icons/fi';

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
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
        owner: user?.id as number | undefined,
        project: null,
        service: null
      });
      
      await loadMedia();
      setFile(null);
      setCaption('');
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

  const filteredMedia = media.filter(item => {
    const matchesSearch = (item.caption || '').toLowerCase().includes(search.toLowerCase()) ||
                         item.url.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.media_type === filter;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImltZyIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaW1nKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FiImage className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Media Library</h1>
                <p className="text-white/90 text-lg mt-1">Upload and manage your media files</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-6 -left-6 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <FiFile className="h-4 w-4 text-purple-600" />
                </div>
                File Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium placeholder-gray-400"
                placeholder="Enter a descriptive caption..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <FiUpload className="h-4 w-4 text-purple-600" />
                </div>
                Upload File
              </label>
              <div className="mt-1">
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="relative group flex items-center justify-center w-full px-6 py-16 border-3 border-dashed border-gray-300 rounded-2xl hover:border-purple-500 transition-all bg-gradient-to-br from-gray-50 to-purple-50/30 hover:from-purple-50 hover:to-purple-100/50">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                        <FiUpload className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-base text-gray-700 font-semibold mb-2">
                        <span className="text-purple-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF, MP4 up to 10MB</p>
                    </div>
                  </div>
                </label>
              </div>
              {file && (
                <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <FiFile className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{formatFileSize(file.size)} • {file.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="ml-4 p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col justify-between">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <FiCheck className="text-purple-600" />
                Upload Guidelines
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-medium">Maximum file size: 10MB</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-medium">Supported formats: JPG, PNG, GIF, MP4</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-medium">Add descriptive captions for better organization</span>
                </li>
              </ul>
            </div>
            <Button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-5 mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 flex items-center justify-center gap-3 text-lg font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="h-5 w-5" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
              placeholder="Search media by name or URL..."
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-4 rounded-xl font-bold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === 'image'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <FiImage />
            Images
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === 'video'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <FiVideo />
            Videos
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  {item.media_type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.caption || 'Media file'}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
                      <div className="text-center">
                        <FiVideo className="h-16 w-16 text-white mb-3 mx-auto opacity-80" />
                        <span className="text-white text-sm font-bold">Video File</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className={`p-2.5 rounded-xl backdrop-blur-sm font-bold transition-all shadow-lg ${
                        copiedId === item.id 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/90 hover:bg-white text-gray-700'
                      }`}
                      title={copiedId === item.id ? 'Copied!' : 'Copy URL'}
                    >
                      {copiedId === item.id ? (
                        <FiCheck className="h-4 w-4" />
                      ) : (
                        <FiCopy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <p className="font-bold text-gray-900 truncate text-base" title={item.caption}>
                      {item.caption || 'Untitled'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                      item.media_type === 'image' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {item.media_type}
                    </span>
                    <button
                      onClick={() => window.open(item.url, '_blank')}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FiDownload className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <FiCalendar className="h-3.5 w-3.5" />
                      {new Date(item.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <FiImage className="text-5xl text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No media files found</h3>
            <p className="text-gray-500 text-lg mb-6">
              {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'Upload your first media file to get started'}
            </p>
            {!search && filter === 'all' && (
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg font-bold shadow-xl"
              >
                <FiUpload />
                Upload Media
              </Button>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
}