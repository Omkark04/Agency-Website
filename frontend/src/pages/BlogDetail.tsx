import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { getBlog, type Blog as BlogType } from '../api/blog';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadBlog(slug);
    }
  }, [slug]);

  const loadBlog = async (blogSlug: string) => {
    try {
      setIsLoading(true);
      // Try to find blog by slug using search
      const response = await getBlog(parseInt(blogSlug));
      setBlog(response.data);
    } catch (error) {
      console.error('Failed to load blog:', error);
      navigate('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthorName = (author: BlogType['author']) => {
    return author.first_name && author.last_name 
      ? `${author.first_name} ${author.last_name}`
      : author.username;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Featured Image */}
          {blog.featured_image && (
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-2xl shadow-xl mb-8"
            />
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
            {blog.category && (
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                {blog.category}
              </span>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{getAuthorName(blog.author)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString()}</span>
            </div>
            {blog.read_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.read_time}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8 pt-8 border-t">
              <Tag className="h-5 w-5 text-gray-500" />
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#0066FF] flex items-center justify-center text-white text-2xl font-bold">
                {blog.author.first_name?.charAt(0) || blog.author.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{getAuthorName(blog.author)}</p>
                <p className="text-gray-600">{blog.author.email}</p>
              </div>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to All Posts
            </Link>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
