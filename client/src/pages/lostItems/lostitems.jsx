import React, { useState, useRef } from "react";
import { toast, Toaster } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Sidebar from "../../components/sidebar/sidebar.jsx";
import Navbar from "../../components/navbar/navbar.jsx";
import { itemSchema } from "../../schema/item.schema.js";
import { useCreateItem } from "../../hooks/itemsHook/useCreateItem.hook.js";
import { Sparkles, Loader2, Wand2, UploadCloud, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

const ReportLost = () => {
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      date: "",
      keywords: "",
      lat: "",
      lng: "",
      type: "lost",
    },
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAutoFilled, setAiAutoFilled] = useState(false);

  const { mutateAsync: createItem } = useCreateItem({
    onSuccess: () => {
      toast.success("Item reported successfully!", {
        description: "Your report has been submitted.",
      });
      reset();
      setSelectedImageFile(null);
      setImagePreview(null);
      setAiAutoFilled(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Failed to submit report");
    },
  });

  const handleAnalyzeWithAI = async (fileToAnalyze) => {
    const file = fileToAnalyze || selectedImageFile;
    if (!file) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    setIsAnalyzing(true);
    setAiAutoFilled(false);

    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}items/analyze-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error?.message || json.message || "Failed to analyze image with AI."
        );
      }

      const aiData = json.data?.data || json.data || {};

      if (aiData.title) setValue("title", aiData.title, { shouldValidate: true, shouldDirty: true });
      if (aiData.category) setValue("category", aiData.category, { shouldValidate: true, shouldDirty: true });
      if (aiData.description) setValue("description", aiData.description, { shouldValidate: true, shouldDirty: true });
      if (aiData.keywords) setValue("keywords", aiData.keywords, { shouldValidate: true, shouldDirty: true });

      setAiAutoFilled(true);
      toast.success("✨ Item details and specifications auto-filled by Gemini AI!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "AI Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      try {
        setImagePreview(URL.createObjectURL(file));
      } catch (err) {}
      // Automatically trigger AI analysis when image is picked
      handleAnalyzeWithAI(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  async function onSubmit(data) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("category", data.category);
    formData.append("location", data.location);
    formData.append("date", data.date);
    formData.append("description", data.description);
    if (data.keywords) formData.append("keywords", data.keywords);
    if (data.lat) formData.append("lat", data.lat);
    if (data.lng) formData.append("lng", data.lng);

    const fileToUpload = selectedImageFile || (data.image && data.image[0]);
    if (fileToUpload) formData.append("image", fileToUpload);

    await createItem(formData);
  }

  const inputCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white disabled:opacity-50 transition";

  const labelCls = "block text-gray-600 text-sm font-medium mb-1";

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <Navbar />
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 md:p-6 flex items-start md:items-center justify-center mt-16 lg:mt-0">
        <div className="w-full max-w-2xl lg:mt-10">
          {/* ── Card ── */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-6 py-5">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Report Lost / Found Item
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Fill in the details below or let Gemini AI auto-fill them from your photo
              </p>
            </div>

            {/* ── Prominent AI Auto-Fill Hero Bar ── */}
            <div className="m-5 md:m-7 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles size={22} className={isAnalyzing ? "animate-spin" : ""} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    ✨ Gemini AI Auto-Fill
                    <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload a photo of your lost or found item. Gemini will automatically detect and fill the item name, category, description, and keywords.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                disabled={isSubmitting || isAnalyzing}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Gemini Analyzing Photo...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    <span>Upload & Auto-Fill</span>
                  </>
                )}
              </button>
            </div>

            {aiAutoFilled && (
              <div className="mx-5 md:mx-7 -mt-2 mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">✨ Item characteristics & specifications auto-filled!</p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Gemini AI filled the fields below. Review them and add location or date before submitting.
                  </p>
                </div>
              </div>
            )}

            <form
              className="p-5 md:p-7 pt-2 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* ── Title + Type ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Black Wallet"
                    className={inputCls}
                    disabled={isSubmitting}
                    {...register("title")}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                <div>
                  <label className={labelCls}>Report Type</label>
                  <select
                    className={inputCls}
                    disabled={isSubmitting}
                    {...register("type")}
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                  <FieldError message={errors.type?.message} />
                </div>
              </div>

              {/* ── Category + Location ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    disabled={isSubmitting}
                    {...register("category")}
                  >
                    <option value="">Select Category</option>
                    <option value="wallet">Wallet</option>
                    <option value="phone">Phone</option>
                    <option value="bag">Bag</option>
                    <option value="id">ID Card</option>
                    <option value="electronics">Electronics</option>
                    <option value="others">Others</option>
                  </select>
                  <FieldError message={errors.category?.message} />
                </div>

                <div>
                  <label className={labelCls}>Last Seen Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Library, Hostel"
                    className={inputCls}
                    disabled={isSubmitting}
                    {...register("location")}
                  />
                  <FieldError message={errors.location?.message} />
                </div>
              </div>

              {/* ── Date + Keywords ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date Lost / Found</label>
                  <input
                    type="date"
                    className={inputCls}
                    disabled={isSubmitting}
                    {...register("date")}
                  />
                  <FieldError message={errors.date?.message} />
                </div>

                <div>
                  <label className={labelCls}>Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. black, leather, id"
                    className={inputCls}
                    disabled={isSubmitting}
                    {...register("keywords")}
                  />
                  <FieldError message={errors.keywords?.message} />
                </div>
              </div>

              {/* ── Description ── */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Color, brand, distinguishing features..."
                  className={inputCls}
                  disabled={isSubmitting}
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </div>

              {/* ── Coordinates ── */}
              <div>
                <label className={labelCls}>
                  Coordinates{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      className={inputCls}
                      disabled={isSubmitting}
                      {...register("lat")}
                    />
                    <FieldError message={errors.lat?.message} />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      className={inputCls}
                      disabled={isSubmitting}
                      {...register("lng")}
                    />
                    <FieldError message={errors.lng?.message} />
                  </div>
                </div>
              </div>

              {/* ── Image Upload & Gemini Vision ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>
                    Upload Image <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                    <Sparkles size={12} className="text-purple-500" /> Auto-Fill Supported
                  </span>
                </div>

                <div className="border-2 border-dashed border-purple-200 rounded-2xl p-4 bg-purple-50/20 hover:border-purple-400 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 disabled:opacity-50 cursor-pointer"
                    disabled={isSubmitting || isAnalyzing}
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG or WEBP · Max 5MB
                  </p>

                  {/* Thumbnail and re-analyze button */}
                  {selectedImageFile && (
                    <div className="mt-3 pt-3 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-14 h-14 object-cover rounded-xl border border-purple-300 shadow-sm shrink-0"
                          />
                        )}
                        <div className="text-xs">
                          <p className="font-semibold text-gray-800 truncate max-w-[200px]">
                            {selectedImageFile.name}
                          </p>
                          <p className="text-gray-400">
                            {(selectedImageFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAnalyzeWithAI(selectedImageFile)}
                        disabled={isAnalyzing || isSubmitting}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Analyzing Photo...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>✨ Re-Analyze with Gemini AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <FieldError message={errors.image?.message} />
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isSubmitting || isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Report…
                  </span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default ReportLost;