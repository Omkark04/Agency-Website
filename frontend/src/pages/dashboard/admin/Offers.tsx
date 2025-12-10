import { useEffect, useState } from 'react';
import { 
  listOffers, 
  getOfferStats, 
  deleteOffer, 
  type SpecialOffer 
} from '../../../api/offers';
import Modal from '../../../components/ui/Modal';
import OffersForm from './OffersForm';
import { Button } from '../../../components/ui/Button';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiTag, 
  FiCalendar, 
  FiPercent,
  FiStar,
  FiClock,
  FiSearch,
  FiImage,
  FiExternalLink,
  FiGift,
  FiCheckCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Offers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<SpecialOffer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<SpecialOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'featured' | 'limited'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'discount' | 'ending'>('newest');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [offersRes, statsRes] = await Promise.all([
        listOffers(),
        getOfferStats()
      ]);
      setOffers(offersRes.data);
      setFilteredOffers(offersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load offers:', error);
      // Fallback to empty arrays
      setOffers([]);
      setFilteredOffers([]);
      setStats({ active_offers: 0, limited_time_offers: 0, average_discount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    filterAndSortOffers();
  }, [offers, search, filter, sortBy]);

  const filterAndSortOffers = () => {
    let filtered = [...offers];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.description.toLowerCase().includes(search.toLowerCase()) ||
        offer.short_description?.toLowerCase().includes(search.toLowerCase()) ||
        offer.discount_code?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(offer => offer.is_active && !offer.is_expired);
    } else if (filter === 'featured') {
      filtered = filtered.filter(offer => offer.is_featured && offer.is_active && !offer.is_expired);
    } else if (filter === 'limited') {
      filtered = filtered.filter(offer => offer.is_limited_time && offer.is_active && !offer.is_expired);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'discount':
          return (b.discount_percentage || b.discount_percent || 0) - (a.discount_percentage || a.discount_percent || 0);
        case 'ending':
          return new Date(a.valid_until || a.valid_to).getTime() - new Date(b.valid_until || b.valid_to).getTime();
        default:
          return 0;
      }
    });

    setFilteredOffers(filtered);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) return;
    
    setDeleteLoading(id);
    try {
      await deleteOffer(id);
      // Remove from local state
      setOffers(prev => prev.filter(offer => offer.id !== id));
      // Reload stats
      const statsRes = await getOfferStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRemainingDays = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getStatusColor = (offer: SpecialOffer) => {
    if (!offer.is_active) return 'bg-gray-100 text-gray-700';
    if (offer.is_expired || getRemainingDays(offer.valid_until || offer.valid_to) === 0) {
      return 'bg-red-100 text-red-700';
    }
    if (offer.is_featured) return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
    if (offer.is_limited_time) return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white';
    return 'bg-green-100 text-green-700';
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      FiTag: FiTag,
      FiStar: FiStar,
      FiClock: FiClock,
      FiGift: FiGift,
      FiPercent: FiPercent,
      FiImage: FiImage,
      FiCheckCircle: FiCheckCircle
    };
    return icons[iconName] || FiTag;
  };

  const getDiscountDisplay = (offer: SpecialOffer) => {
    return offer.discount_percentage || offer.discount_percent || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <FiTag className="text-white text-2xl" />
                </div>
                Special Offers
              </h1>
              <p className="text-gray-600 mt-2">Manage your promotional offers and discounts</p>
            </div>
            <Button 
              onClick={() => { setEdit(null); setOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl"
            >
              <FiPlus className="text-lg" />
              Create New Offer
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Offers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{offers.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <FiTag className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Offers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.active_offers || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <FiStar className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Discount</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats?.average_discount ? stats.average_discount.toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <FiPercent className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Limited Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.limited_time_offers || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                  <FiClock className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search offers by title, description, or code..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                All Offers
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                <FiStar className="w-4 h-4" />
                Active
              </button>
              <button
                onClick={() => setFilter('featured')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === 'featured'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                <FiStar className="w-4 h-4" />
                Featured
              </button>
              <button
                onClick={() => setFilter('limited')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === 'limited'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                <FiClock className="w-4 h-4" />
                Limited Time
              </button>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="discount">Highest Discount</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <FiTag className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {search ? 'No matching offers found' : 'No offers yet'}
            </h3>
            <p className="text-gray-500 mb-8">
              {search ? 'Try a different search term' : 'Get started by creating your first special offer'}
            </p>
            <Button 
              onClick={() => { setEdit(null); setOpen(true); }}
              className="flex items-center gap-2 mx-auto bg-gradient-to-r from-orange-500 to-red-500"
            >
              <FiPlus />
              Create Your First Offer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              const IconComponent = getIconComponent(offer.icon_name);
              const remainingDays = getRemainingDays(offer.valid_until || offer.valid_to);
              const discount = getDiscountDisplay(offer);
              
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <div className={`w-full h-full bg-gradient-to-br ${offer.gradient_colors} flex items-center justify-center`}>
                      <div className="text-6xl text-white opacity-90">
                        <IconComponent />
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${getStatusColor(offer)}`}>
                        {!offer.is_active ? 'Inactive' : 
                         offer.is_expired || remainingDays === 0 ? 'Expired' :
                         offer.is_featured ? 'Featured' :
                         offer.is_limited_time ? 'Limited' : 'Active'}
                      </span>
                    </div>
                    
                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg">
                        {discount}% OFF
                      </span>
                    </div>
                    
                    {/* Discount Code */}
                    {offer.discount_code && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-lg font-mono text-sm">
                          Code: {offer.discount_code}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {offer.title}
                    </h3>
                    
                    {/* Short Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {offer.short_description || offer.description}
                    </p>
                    
                    {/* Features */}
                    {offer.features && offer.features.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Features:</div>
                        <div className="space-y-1">
                          {offer.features.slice(0, 2).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {offer.features.length > 2 && (
                            <div className="text-xs text-orange-600 font-medium">
                              +{offer.features.length - 2} more features
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Dates */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Ends: {formatDate(offer.valid_until || offer.valid_to)}</span>
                      </div>
                      {offer.is_limited_time && (
                        <div className={`font-semibold ${remainingDays <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                          {remainingDays} {remainingDays === 1 ? 'day' : 'days'} left
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => { setEdit(offer); setOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <FiEdit2 />
                        Edit
                      </Button>
                      <Button
                        onClick={() => onDelete(offer.id)}
                        disabled={deleteLoading === offer.id}
                        className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 min-w-[40px]"
                      >
                        {deleteLoading === offer.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <FiTrash2 />
                        )}
                      </Button>
                      {offer.button_url && (
                        <a
                          href={offer.button_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View offer"
                        >
                          <FiExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Results Counter */}
        {filteredOffers.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredOffers.length} of {offers.length} offers
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        title={edit ? 'Edit Offer' : 'Create New Offer'}
      >
        <OffersForm 
          initial={edit || undefined} 
          onSaved={() => { 
            setOpen(false); 
            load(); 
          }} 
        />
      </Modal>
    </div>
  );
};

export default Offers;