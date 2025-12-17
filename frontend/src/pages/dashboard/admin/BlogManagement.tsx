import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Search,
  Calendar,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { listBlogs, deleteBlog, toggleBlogFeatured, toggleBlogPublish, type Blog } from '../../../api/blog';

export default function BlogManagement() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadBlogs();
  }, [filterCategory, filterStatus]);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (filterCategory) params.category = filterCategory;
      if (filterStatus === 'published') params.is_published = true;
      if (filterStatus === 'draft') params.is_published = false;
      if (filterStatus === 'featured') params.is_featured = true;
      
      const response = await listBlogs(params);
      setBlogs(response.data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(response.data.map(blog => blog.category).filter(Boolean)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await deleteBlog(id);
      loadBlogs();
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleBlogFeatured(id);
      loadBlogs();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await toggleBlogPublish(id);
      loadBlogs();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600 mt-1">Create and manage blog posts</p>
          </div>
          <Link
            to="/dashboard/blogs/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            New Blog Post
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No blog posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Featured Image */}
                  {blog.featured_image && (
                    <div className="flex-shrink-0">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{blog.title}</h3>
                          {blog.is_featured && (
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            blog.is_published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {blog.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2 mb-3">{blog.excerpt}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{blog.author.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                          </div>
                          {blog.category && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              {blog.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/blogs/${blog.id}/edit`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(blog.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            blog.is_featured 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`h-5 w-5 ${blog.is_featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(blog.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            blog.is_published 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title="Toggle Publish"
                        >
                          {blog.is_published ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
