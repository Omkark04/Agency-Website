import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiGift, FiSearch, FiEye, FiDollarSign, FiCalendar, FiUser } from "react-icons/fi";
import api from "../../../api/api";

export default function SpecialOffersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, [categoryFilter, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Fetch all form submissions (which create orders)
      const submissionsResponse = await api.get("/api/form-submissions/");
      const submissions = submissionsResponse.data.results || submissionsResponse.data || [];
      
      // Fetch all forms to get offer information
      const formsResponse = await api.get("/api/forms/");
      const forms = formsResponse.data.results || formsResponse.data || [];
      
      // Fetch all offers to get category information
      const offersResponse = await api.get("/api/offers/");
      const offers = offersResponse.data.results || offersResponse.data || [];
      
      // Create a map of form_id -> offer info
      const formOfferMap = new Map();
      forms.forEach((form: any) => {
        if (form.selected_offer_id) {
          const offer = offers.find((o: any) => o.id === form.selected_offer_id);
          formOfferMap.set(form.id, {
            offer_id: form.selected_offer_id,
            offer_title: offer?.title || "Unknown Offer",
            offer_category: offer?.offer_category || "regular",
            card_type: form.card_type
          });
        }
      });
      
      // Filter submissions that came through offer forms and enrich with offer data
      const offerOrders = submissions
        .filter((sub: any) => formOfferMap.has(sub.form))
        .map((sub: any) => {
          const offerInfo = formOfferMap.get(sub.form);
          return {
            ...sub,
            ...offerInfo,
            // Extract price from submission data if available
            price: sub.data?.price || sub.data?.total_price || 0,
            client_name: sub.submitted_by_name || sub.data?.name || "N/A",
            client_email: sub.client_email || sub.data?.email || "N/A",
            status: sub.status || "pending",
            order_number: sub.order_id ? `#${sub.order_id}` : `SUB-${sub.id}`
          };
        });
      
      // Apply filters
      let filtered = offerOrders;
      
      if (categoryFilter !== "all") {
        filtered = filtered.filter((o: any) => o.offer_category === categoryFilter);
      }
      
      if (statusFilter !== "all") {
        filtered = filtered.filter((o: any) => o.status === statusFilter);
      }
      
      setOrders(filtered);
    } catch (error) {
      console.error("Failed to load special offer orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.offer_title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      approved: "bg-blue-100 text-blue-700 border-blue-300",
      in_progress: "bg-indigo-100 text-indigo-700 border-indigo-300",
      completed: "bg-green-100 text-green-700 border-green-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
      closed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const stats = {
    total: filteredOrders.length,
    special: filteredOrders.filter((o) => o.offer_category === "special").length,
    regular: filteredOrders.filter((o) => o.offer_category === "regular").length,
    pending: filteredOrders.filter((o) => o.status === "pending").length,
    revenue: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.price || 0)), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex items-center gap-4 text-white mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <FiGift className="text-4xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Special Offers Orders</h1>
                  <p className="opacity-90 text-lg">Manage orders from offer campaigns</p>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-white">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm opacity-80">Total Orders</span>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm opacity-80">Special Offers</span>
                  <p className="text-2xl font-bold">{stats.special}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm opacity-80">Pending</span>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* SEARCH */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by client, email, order number, or offer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* CATEGORY FILTER */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium"
            >
              <option value="all">All Categories</option>
              <option value="special">Special Offers</option>
              <option value="regular">Regular Offers</option>
            </select>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-block p-6 bg-purple-50 rounded-full mb-4">
                <FiGift className="text-6xl text-purple-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No special offer orders found</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here when clients submit offer forms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Offer Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FiGift className="text-purple-600" />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-bold text-gray-900">
                              {order.order_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {order.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {order.offer_title}
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              order.offer_category === "special"
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            }`}
                          >
                            {order.offer_category === "special" ? "⭐ Special Offer" : "📦 Regular Offer"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FiUser className="text-blue-600 text-sm" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.client_name}</div>
                            <div className="text-xs text-gray-500">{order.client_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FiDollarSign className="text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            ₹{order.price || "0"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
                          {order.status?.replace("_", " ").toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="text-gray-400" />
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            // Navigate to order management page if order_id exists
                            if (order.order_id) {
                              navigate(`/dashboard/admin/orders/${order.order_id}`);
                            } else {
                              alert("This submission hasn't been converted to an order yet.");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <FiEye size={16} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-sm opacity-90 font-medium">Total Orders</div>
            <div className="text-4xl font-bold mt-2">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-sm opacity-90 font-medium">Special Offers</div>
            <div className="text-4xl font-bold mt-2">{stats.special}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-sm opacity-90 font-medium">Pending</div>
            <div className="text-4xl font-bold mt-2">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-sm opacity-90 font-medium">Total Revenue</div>
            <div className="text-4xl font-bold mt-2">₹{stats.revenue.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
