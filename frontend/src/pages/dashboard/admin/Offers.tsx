import { useEffect, useState } from "react";
import { listOffers, deleteOffer } from "../../../api/offers";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import OffersForm from "./OffersForm";

import {
  FiTag,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiImage,
} from "react-icons/fi";

export default function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await listOffers();
      const data = res.data.results || res.data;
      setOffers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    await deleteOffer(id);
    load();
  };

  const filtered = offers.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.short_description?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === "all" || o.offer_type === filterType;

    const matchesFeatured =
      filterFeatured === "all" ||
      (filterFeatured === "featured" && o.is_featured) ||
      (filterFeatured === "nonfeatured" && !o.is_featured);

    return matchesSearch && matchesType && matchesFeatured;
  });

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <FiTag className="text-4xl" />
              <div>
                <h1 className="text-4xl font-bold">Offers</h1>
                <p className="opacity-90">Manage promotional offers</p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 bg-white text-purple-700 px-6 py-3 font-bold rounded-xl"
            >
              <FiPlus /> Create Offer
            </Button>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers..."
            className="w-full pl-10 py-3 border rounded-lg"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="seasonal">Seasonal</option>
          <option value="limited">Limited Time</option>
          <option value="bundle">Bundle</option>
          <option value="launch">Launch</option>
        </select>

        <select
          value={filterFeatured}
          onChange={(e) => setFilterFeatured(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="all">All Featured</option>
          <option value="featured">Featured Only</option>
          <option value="nonfeatured">Non-Featured</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border">
        {loading ? (
          <div className="py-20 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Discount</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Featured</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((offer) => (
                <tr key={offer.id} className="border-t hover:bg-gray-50">

                  {/* IMAGE */}
                  <td className="p-4">
                    {offer.image ? (
                      <img
                        src={offer.image}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded text-gray-500">
                        <FiImage />
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-semibold">{offer.title}</td>

                  <td className="p-4">
                    {offer.discount_type === "percent"
                      ? `${offer.discount_value}%`
                      : `₹${offer.discount_value}`}
                  </td>

                  <td className="p-4 capitalize">{offer.offer_type}</td>

                  <td className="p-4">
                    {offer.is_featured ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Featured
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                        No
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEdit(offer);
                        setOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => onDelete(offer.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-500">No offers found</div>
        )}
      </div>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)} title="Offer Form">
        <OffersForm
          initial={edit}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}
