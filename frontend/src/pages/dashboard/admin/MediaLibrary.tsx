import { useEffect, useState } from 'react';
import { 
  listCloudinaryResources, 
  deleteCloudinaryResource, 
  formatFileSize,
  getThumbnailUrl,
  type CloudinaryResource 
} from '../../../api/cloudinary';
import { uploadMedia } from '../../../api/media';
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
  FiCheck,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
  FiExternalLink,
  FiFolder,
  FiRefreshCw
} from 'react-icons/fi';

export default function MediaLibrary() {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'raw'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<CloudinaryResource | null>(null);
  const { user } = useAuth();

  // Load resources from Cloudinary
  const loadResources = async () => {
    try {
      setIsLoading(true);
      const params = filter !== 'all' ? { resource_type: filter } : {};
      const res = await listCloudinaryResources(params);
      setResources(res.data.resources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    loadResources(); 
  }, [filter]);

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    try {
      await uploadMedia(file, caption || file.name);
      await loadResources();
      
      setFile(null);
      setCaption('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMsg = error.response?.data?.error || 'Failed to upload file. Please try again.';
      alert(`Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete resource
  const handleDelete = async (item: CloudinaryResource) => {
    try {
      await deleteCloudinaryResource(item.public_id, item.resource_type);
      loadResources();
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete resource');
    }
  };

  // Filter resources based on search
  const filteredResources = resources.filter(item => {
    const matchesSearch = item.public_id.toLowerCase().includes(search.toLowerCase()) ||
                         item.format.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Copy URL to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get file icon based on type
  const getFileIcon = (item: CloudinaryResource) => {
    if (item.resource_type === 'video') return <FiVideo className="h-16 w-16 text-white mb-3 mx-auto opacity-80" />;
    if (item.resource_type === 'raw') return <FiFile className="h-16 w-16 text-gray-400 mb-3 mx-auto" />;
    return <FiImage className="h-16 w-16 text-blue-500 mb-3 mx-auto" />;
  };

  const totalSize = resources.reduce((acc, item) => acc + (item.bytes || 0), 0);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImltZyIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaW1nKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FiImage className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">Cloudinary Media Library</h1>
                  <p className="text-white/90 text-lg mt-1">Manage all your cloud-hosted media assets</p>
                </div>
              </div>
              <button
                onClick={loadResources}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <span className="text-white font-bold">{resources.length} Files</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <span className="text-white font-bold">{formatFileSize(totalSize)} Total</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <span className="text-white font-bold">{user?.username || 'Guest'}</span>
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
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
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
                  disabled={uploading}
                  accept="image/*,video/*"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className={`relative group flex items-center justify-center w-full px-6 py-16 border-3 border-dashed rounded-2xl transition-all bg-gradient-to-br from-gray-50 to-purple-50/30 hover:from-purple-50 hover:to-purple-100/50 ${
                    uploading 
                      ? 'border-gray-300 cursor-not-allowed opacity-70' 
                      : 'border-gray-300 hover:border-purple-500'
                  }`}>
                    <div className="text-center">
                      <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                        uploading ? 'animate-pulse' : 'group-hover:scale-110'
                      }`} style={{
                        background: uploading 
                          ? 'linear-gradient(135deg, #a855f7, #ec4899, #f43f5e)' 
                          : 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                      }}>
                        {uploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        ) : (
                          <FiUpload className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <p className="text-base text-gray-700 font-semibold mb-2">
                        {uploading ? 'Uploading...' : <span className="text-purple-600">Click to upload</span>} or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF, WebP, SVG, MP4 up to 10MB</p>
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
                      disabled={uploading}
                      className="ml-4 p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Caption Input Field */}
            {file && (
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <FiInfo className="h-4 w-4 text-purple-600" />
                  </div>
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter a caption for this media..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-2">Add a descriptive caption to help identify this media later</p>
              </div>
            )}
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
                  <span className="font-medium">Supported formats: JPG, PNG, GIF, WebP, SVG, MP4</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-medium">Files are automatically optimized by Cloudinary</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-medium">Secure cloud storage with CDN delivery</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100 mt-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <FiInfo className="text-blue-600" />
                Special Media Captions
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Use these exact captions to display images in specific sections:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                  <span className="font-medium">Landing Hero BG</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-blue-600 font-mono">Hero Background</code>
                </li>
                <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                  <span className="font-medium">Mobile Hero BG</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-blue-600 font-mono">Mobile Hero</code>
                </li>
                <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                  <span className="font-medium">About Us Images</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-blue-600 font-mono">about</code>
                </li>
                 <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                  <span className="font-medium">Pricing Desktop Header</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-blue-600 font-mono">desktop price</code>
                </li>
                 <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                  <span className="font-medium">Pricing Mobile Header</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-blue-600 font-mono">price mobile</code>
                </li>
              </ul>
            </div>
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-5 mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 flex items-center justify-center gap-3 text-lg font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="h-5 w-5" />
                  Upload to Cloudinary
                </>
              )}
            </button>
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
              placeholder="Search by filename or format..."
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
          <button
            onClick={() => setFilter('raw')}
            className={`px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === 'raw'
                ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <FiFile />
            Files
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center animate-fade-in">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Media Library</h3>
          <p className="text-gray-600 text-lg">Fetching your Cloudinary assets...</p>
        </div>
      ) : (
        /* Media Grid */
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
              {filteredResources.map((item) => (
                <div key={item.public_id} className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                  <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                    {item.resource_type === 'image' && item.secure_url ? (
                      <img
                        src={getThumbnailUrl(item, 300)}
                        alt={item.public_id}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
                        {getFileIcon(item)}
                        <span className="text-white text-sm font-bold">{item.resource_type.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {/* COPY URL */}
                      <button
                        onClick={() => copyToClipboard(item.secure_url, item.public_id)}
                        className={`p-2.5 rounded-xl backdrop-blur-sm font-bold transition-all shadow-lg ${
                          copiedId === item.public_id 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/90 hover:bg-white text-gray-700'
                        }`}
                        title="Copy URL to clipboard"
                      >
                        {copiedId === item.public_id ? (
                          <FiCheck className="h-4 w-4" />
                        ) : (
                          <FiCopy className="h-4 w-4" />
                        )}
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
                        title="Delete Media"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>

                      {/* OPEN IN NEW TAB */}
                      <button
                        onClick={() => window.open(item.secure_url, '_blank')}
                        className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
                        title="Open in new tab"
                      >
                        <FiExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <p className="font-bold text-gray-900 truncate text-sm" title={item.public_id}>
                        {item.public_id.split('/').pop()}
                      </p>
                      {item.folder && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <FiFolder className="h-3 w-3" />
                          <span className="truncate">{item.folder}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                        item.resource_type === 'image' 
                          ? 'bg-blue-100 text-blue-700' 
                          : item.resource_type === 'video'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.format.toUpperCase()}
                      </span>
                      <button
                        onClick={() => window.open(item.secure_url, '_blank')}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <FiDownload className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <FiCalendar className="h-3.5 w-3.5" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {formatFileSize(item.bytes)}
                      </div>
                      {item.width && item.height && (
                        <div className="text-xs text-gray-500">
                          {item.width} × {item.height}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                {search || filter !== 'all' ? (
                  <FiAlertCircle className="text-5xl text-purple-400" />
                ) : (
                  <FiImage className="text-5xl text-purple-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {search || filter !== 'all' ? 'No matching media found' : 'No media files yet'}
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Upload your first media file to get started'
                }
              </p>
              {!search && filter === 'all' && (
                <button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="inline-flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg font-bold shadow-xl rounded-2xl text-white"
                >
                  <FiUpload />
                  Upload Your First Media
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Media?</h3>
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">"{itemToDelete.public_id.split('/').pop()}"</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(itemToDelete)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {copiedId && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <FiCheck className="h-5 w-5" />
            <span className="font-bold">URL copied to clipboard!</span>
          </div>
        </div>
      )}

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