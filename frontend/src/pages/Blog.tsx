import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Lightbulb,
  Code,
  Palette,
  Megaphone
} from 'lucide-react';
import { listBlogs, getBlogCategories, type Blog as BlogType } from '../api/blog';
import { subscribeNewsletter } from '../api/newsletter';
import { useAuth } from '../hooks/useAuth';
import { SEOHead } from '../components/shared/SEOHead';

const categoryIcons: Record<string, React.ReactNode> = {
  'Web Development': <Code className="h-5 w-5" />,
  'Design': <Palette className="h-5 w-5" />,
  'Marketing': <Megaphone className="h-5 w-5" />,
  'Development': <TrendingUp className="h-5 w-5" />,
  'Branding': <Lightbulb className="h-5 w-5" />,
};

export default function Blog() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, [selectedCategory]);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const params: any = { is_published: true };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const response = await listBlogs(params);
      setBlogs(response.data);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getBlogCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const allCategories = ['All', ...categories];
  const featuredPost = blogs.find(blog => blog.is_featured) || blogs[0];
  const regularPosts = blogs.filter(blog => blog.id !== featuredPost?.id);

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || <Code className="h-5 w-5" />;
  };

  const getAuthorInitial = (author: BlogType['author']) => {
    return author.first_name?.charAt(0) || author.username?.charAt(0) || 'U';
  };

  const getAuthorName = (author: BlogType['author']) => {
    return author.first_name && author.last_name 
      ? `${author.first_name} ${author.last_name}`
      : author.username;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SEOHead 
        title="Blog & Insights"
        description="Read the latest insights, tips, and stories about web development, design, and digital transformation from the experts at UdyogWorks."
        url="/blog"
      />
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B2545] to-[#1a365d] text-white py-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Insights, tips, and stories about web development, design, and digital transformation
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts available yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="grid md:grid-cols-2 gap-0">
                    {featuredPost.featured_image && (
                      <div className="relative h-64 md:h-auto">
                        <img 
                          src={featuredPost.featured_image} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Featured
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        {featuredPost.category && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {featuredPost.category}
                          </span>
                        )}
                        {featuredPost.read_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {featuredPost.read_time}
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">{featuredPost.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#0066FF] flex items-center justify-center text-white font-semibold">
                            {getAuthorInitial(featuredPost.author)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getAuthorName(featuredPost.author)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/blog/${featuredPost.id}`}
                          className="inline-flex items-center gap-2 text-[#0066FF] font-semibold hover:gap-3 transition-all"
                        >
                          Read More
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-[#00C2A8] to-[#0066FF] text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {post.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            {getCategoryIcon(post.category)}
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                      {post.read_time && (
                        <>
                          <span>•</span>
                          <Clock className="h-4 w-4" />
                          <span>{post.read_time}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#0066FF] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#0066FF] flex items-center justify-center text-white text-sm font-semibold">
                          {getAuthorInitial(post.author)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{getAuthorName(post.author)}</span>
                      </div>
                      <Link
                        to={`/blog/${post.id}`}
                        className="text-[#0066FF] font-semibold text-sm hover:gap-2 inline-flex items-center gap-1 transition-all"
                      >
                        Read
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Newsletter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 bg-gradient-to-br from-[#00C2A8] to-[#0066FF] rounded-2xl p-8 md:p-12 text-white text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Get the latest articles, insights, and updates delivered directly to your inbox.
              </p>
              {user ? (
                <div className="max-w-md mx-auto">
                   <p className="text-white mb-4">
                     Logged in as: <strong>{user.email}</strong>
                   </p>
                   <button
                     onClick={async () => {
                       try {
                         await subscribeNewsletter();
                         alert('Successfully subscribed to newsletter!');
                       } catch (err: any) {
                         alert(err.response?.data?.detail || 'Failed to subscribe.');
                       }
                     }}
                     className="px-8 py-3 bg-white text-[#0066FF] font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                   >
                     Subscribe Now
                   </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <p className="text-white mb-4">Please log in to subscribe to our newsletter.</p>
                  <Link
                    to="/login"
                    className="inline-block px-8 py-3 bg-white text-[#0066FF] font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Log In to Subscribe
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
