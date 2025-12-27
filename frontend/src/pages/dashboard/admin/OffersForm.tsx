import { useState, useEffect } from "react";
import { createOffer, updateOffer } from "../../../api/offers";
import api from "../../../api/api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiTag,
  FiAlignLeft,
  FiFileText,
  FiClock,
  FiPercent,
  FiUpload,
  FiX,
  FiList,
  FiClipboard,
} from "react-icons/fi";

export default function OffersForm({ initial, onSaved }: any) {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);

  const [title, setTitle] = useState(initial?.title || "");
  const [shortDesc, setShortDesc] = useState(initial?.short_description || "");
  const [description, setDescription] = useState(initial?.description || "");

  const [offerType, setOfferType] = useState(initial?.offer_type || "seasonal");
  const [offerCategory, setOfferCategory] = useState(initial?.offer_category || "regular");
  const [serviceIds, setServiceIds] = useState<number[]>(
    initial?.services?.map((s: any) => s.id) || []
  );

  const [discountType, setDiscountType] = useState(
    initial?.discount_type || "percent"
  );
  const [discountValue, setDiscountValue] = useState(
    initial?.discount_value || 0
  );
  const [originalPrice, setOriginalPrice] = useState(
    initial?.original_price || ""
  );

  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const [ctaText, setCtaText] = useState(initial?.cta_text || "Claim Offer");
  const [ctaLink, setCtaLink] = useState(initial?.cta_link || "");

  const [validFrom, setValidFrom] = useState(
    initial?.valid_from?.slice(0, 16) || ""
  );
  const [validTo, setValidTo] = useState(initial?.valid_to?.slice(0, 16) || "");

  const [features, setFeatures] = useState<string[]>(initial?.features || []);
  const [conditions, setConditions] = useState<string[]>(
    initial?.conditions || []
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initial?.imageURL || initial?.image || null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      const params: any = {};
      
      // Filter by department for service heads
      if (user?.role === 'service_head' && (user as any).department) {
        const dept = (user as any).department;
        params.department = typeof dept === 'object' ? dept.id : dept;
      }
      
      const res = await api.get("/api/services/", { params });
      
      // FRONTEND FILTER: Ensure only user's department services are shown
      let filteredServices = res.data;
      if (user?.role === 'service_head' && (user as any).department) {
        const userDeptId = typeof (user as any).department === 'object' 
          ? (user as any).department.id 
          : (user as any).department;
        
        // Filter services to match user's department
        filteredServices = res.data.filter((s: any) => s.department === userDeptId);
      }
      
      setServices(filteredServices);
    };
    
    loadServices();
  }, [user]);

  /* ---------------- IMAGE UPLOAD (CLOUDINARY) ---------------- */
  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('offer-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  /* ---------------- FEATURE HANDLERS ---------------- */
  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (i: number, val: string) => {
    const copy = [...features];
    copy[i] = val;
    setFeatures(copy);
  };
  const deleteFeature = (i: number) =>
    setFeatures(features.filter((_, x) => x !== i));

  /* ---------------- CONDITION HANDLERS ---------------- */
  const addCondition = () => setConditions([...conditions, ""]);
  const updateCondition = (i: number, val: string) => {
    const copy = [...conditions];
    copy[i] = val;
    setConditions(copy);
  };
  const deleteCondition = (i: number) =>
    setConditions(conditions.filter((_, x) => x !== i));

  /* ---------------- SUBMIT ---------------- */
  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = initial?.imageURL || null;

      // Upload image to Cloudinary if new file selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadRes = await api.post('/api/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imageUrl = uploadRes.data.url; // Cloudinary URL
      }

      const FD = new FormData();

      FD.append("title", title);
      FD.append("short_description", shortDesc);
      FD.append("description", description);
      FD.append("offer_type", offerType);
      FD.append("offer_category", offerCategory);
      FD.append("discount_type", discountType);
      FD.append("discount_value", discountValue.toString());
      FD.append("original_price", originalPrice.toString());
      FD.append("valid_from", validFrom);
      FD.append("valid_to", validTo);
      FD.append("is_featured", isFeatured ? "true" : "false");
      FD.append("is_active", isActive ? "true" : "false");
      
      // Add CTA fields
      FD.append("cta_text", ctaText);
      FD.append("cta_link", ctaLink);

      FD.append("features", JSON.stringify(features));
      FD.append("conditions", JSON.stringify(conditions));
      FD.append("services", JSON.stringify(serviceIds));

      if (imageUrl) {
        FD.append("imageURL", imageUrl);  // Use imageURL for Cloudinary URLs
      }


      if (initial?.id) {
        await updateOffer(initial.id, FD);
      } else {
        await createOffer(FD);
      }
      onSaved();
    } catch (error: any) {
      console.error("Offer submission error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(`Failed to save offer: ${JSON.stringify(error.response?.data || error.message)}`);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================================= */
  /* =========================== FORM LAYOUT =============================== */
  /* ======================================================================= */

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 max-h-[85vh] overflow-y-auto"
    >
      {/* LEFT COLUMN */}
      <div className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiTag /> Offer Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter offer title"
          />
        </div>

        {/* SHORT DESC */}
        <div>
          <label className="text-sm font-semibold mb-2">
            <FiAlignLeft /> Short Description
          </label>
          <textarea
            rows={3}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            className="w-full border rounded p-3"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-semibold mb-2">
            <FiFileText /> Full Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-3"
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="text-sm font-semibold mb-2 flex gap-2 items-center">
            <FiUpload /> Offer Image
          </label>

          {imagePreview && (
            <div className="relative inline-block mb-3">
              <img
                src={imagePreview}
                className="w-32 h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          <input
            id="offer-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />

          <label
            htmlFor="offer-image"
            className="cursor-pointer block border-dashed border p-3 rounded text-center"
          >
            {imagePreview ? "Change Image" : "Upload Image"}
          </label>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">

        {/* OFFER TYPE */}
        <div>
          <label className="text-sm font-semibold mb-2">Offer Type *</label>
          <select
            value={offerType}
            onChange={(e) => setOfferType(e.target.value)}
            className="w-full border rounded p-3"
          >
            <option value="seasonal">Seasonal</option>
            <option value="limited">Limited Time</option>
            <option value="bundle">Bundle</option>
            <option value="launch">Launch</option>
          </select>
        </div>

        {/* OFFER CATEGORY */}
        <div>
          <label className="text-sm font-semibold mb-2">Offer Category *</label>
          <select
            value={offerCategory}
            onChange={(e) => {
              const newCategory = e.target.value;
              setOfferCategory(newCategory);
              // Reset services when switching categories
              if (newCategory === "regular" && serviceIds.length > 1) {
                setServiceIds([serviceIds[0]]);
              }
            }}
            className="w-full border rounded p-3"
            disabled={user?.role !== 'admin'}
          >
            <option value="regular">Regular Offer</option>
            <option value="special" disabled={user?.role !== 'admin'}>
              Special Offer {user?.role !== 'admin' ? '(Admin Only)' : ''}
            </option>
          </select>
          {user?.role !== 'admin' && (
            <p className="text-xs text-gray-500 mt-1">
              ℹ️ Only administrators can create Special Offers
            </p>
          )}
        </div>

        {/* SERVICES SELECTION */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            {offerCategory === "special" ? "Included Services (Multiple)" : "Service (Single)"}
          </label>
          <div className="bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
            {offerCategory === "regular" ? (
              // SINGLE SELECT FOR REGULAR OFFERS
              <select
                value={serviceIds[0] || ""}
                onChange={(e) => setServiceIds(e.target.value ? [Number(e.target.value)] : [])}
                className="w-full border rounded p-2"
              >
                <option value="">Select a service</option>
                {services
                  .filter((srv) => {
                    // Additional safety filter for service heads
                    if (user?.role === 'service_head' && (user as any).department) {
                      const userDeptId = typeof (user as any).department === 'object' 
                        ? (user as any).department.id 
                        : (user as any).department;
                      return srv.department === userDeptId;
                    }
                    return true; // Show all for admins
                  })
                  .map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.title}
                    </option>
                  ))}
              </select>
            ) : (
              // MULTI SELECT FOR SPECIAL OFFERS
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {services.map((srv) => (
                  <label key={srv.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={serviceIds.includes(srv.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setServiceIds([...serviceIds, srv.id]);
                        } else {
                          setServiceIds(serviceIds.filter((id) => id !== srv.id));
                        }
                      }}
                    />
                    {srv.title}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DISCOUNT */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FiPercent /> Discount Type *
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full border rounded p-3"
            >
              <option value="percent">Percentage</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2">Discount Value *</label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* ORIGINAL PRICE */}
        <div>
          <label className="text-sm font-semibold mb-2">Original Price</label>
          <Input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
        </div>

        {/* VALIDITY */}
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FiClock /> Validity Period
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </div>
        </div>

        {/* CTA */}
        <div>
          <label className="text-sm font-semibold mb-2">CTA Text</label>
          <Input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2">CTA Link</label>
          <Input
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
          />
        </div>
      </div>

      {/* FULL-WIDTH SECTIONS */}

      <div className="md:col-span-2 space-y-6">

        {/* FEATURES */}
        <div>
          <label className="text-sm font-semibold mb-2 flex gap-2 items-center">
            <FiList /> Features
          </label>

          {features.map((f, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                value={f}
                onChange={(e) => updateFeature(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => deleteFeature(i)}
                className="bg-red-600 text-white p-2 rounded"
              >
                <FiX />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addFeature}
            className="text-blue-600 text-sm font-semibold"
          >
            + Add Feature
          </button>
        </div>

        {/* CONDITIONS */}
        <div>
          <label className="text-sm font-semibold mb-2 flex gap-2 items-center">
            <FiClipboard /> Conditions
          </label>

          {conditions.map((c, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                value={c}
                onChange={(e) => updateCondition(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => deleteCondition(i)}
                className="bg-red-600 text-white p-2 rounded"
              >
                <FiX />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCondition}
            className="text-blue-600 text-sm font-semibold"
          >
            + Add Condition
          </button>
        </div>

        {/* TOGGLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between border p-4 rounded">
            <div>
              <p className="font-semibold">Featured Offer</p>
              <p className="text-sm text-gray-500">
                Highlight this offer across the site.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              className={`w-11 h-6 rounded-full ${
                isFeatured ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full transform transition ${
                  isFeatured ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border p-4 rounded">
            <div>
              <p className="font-semibold">Offer Active</p>
              <p className="text-sm text-gray-500">Enable / disable offer.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-11 h-6 rounded-full ${
                isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`block w-4 h-4 bg-white rounded-full transform transition ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <Button type="submit" isLoading={loading} className="w-full">
          {initial ? "Update Offer" : "Create Offer"}
        </Button>
      </div>
    </form>
  );
}
