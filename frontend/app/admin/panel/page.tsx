"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "../../../lib/api";
import { clearAdminSessionToken, getAdminSessionToken } from "../../../lib/adminSession";

const DEFAULT_CATEGORIES = [
  "PAINTINGS",
  "POTTERY",
  "HOME DECOR",
  "TEXTILES",
  "JEWELRY",
];

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  message: string;
  created_at: string;
};

type ProductImage = {
  id: number;
  image_data_url: string;
  image_order: number;
};

type Product = {
  id: number;
  title: string;
  category: string;
  artisan: string | null;
  price: string;
  image_url: string | null;
  image_data_urls: ProductImage[];
  description: string | null;
  created_at: string;
};

type SelectedImage = {
  base64: string;
  mimeType: string;
  name: string;
  dataUrl: string;
  order: number;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
};

type AnalyticsCategory = {
  category: string;
  count: number;
};

type DailyLead = {
  date: string;
  count: number;
};

type AdminAnalytics = {
  total_products: number;
  total_leads: number;
  leads_last_7_days: number;
  products_added_last_7_days: number;
  categories: AnalyticsCategory[];
  daily_leads_last_14_days: DailyLead[];
};

type AdminSection = "dashboard" | "add-product" | "products" | "reachouts";

type ProductEditForm = {
  title: string;
  category: string;
  artisan: string;
  price: string;
  description: string;
};

const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;
const NO_IMAGE_PLACEHOLDER = "/no-image.svg";

export default function AdminPanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isEditDragOver, setIsEditDragOver] = useState(false);
  const [editSelectedImages, setEditSelectedImages] = useState<SelectedImage[]>([]);
  const [editForm, setEditForm] = useState<ProductEditForm>({
    title: "",
    category: "",
    artisan: "",
    price: "",
    description: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null);

  const sidebarItems: Array<{ key: AdminSection; label: string; count?: number }> = [
    { key: "dashboard", label: "Dashboard" },
    { key: "add-product", label: "Add Product" },
    { key: "products", label: "Products", count: products.length },
    { key: "reachouts", label: "Reachouts", count: leads.length },
  ];

  const addToast = (message: string, type: "success" | "error" | "info" = "info", duration: number = 4000) => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const totalImages = selectedImages.length + files.length;
    if (totalImages > 10) {
      addToast(`Maximum 10 images allowed. You've already selected ${selectedImages.length}.`, "error");
      return;
    }

    const newImages: SelectedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        addToast(`File "${file.name}" is not an image. Please select image files only.`, "error");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        addToast(`File "${file.name}" is too large. Max 2MB per image.`, "error");
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const parts = dataUrl.split(",");
        if (parts.length !== 2) {
          throw new Error("Invalid image data");
        }

        newImages.push({
          base64: parts[1],
          mimeType: file.type,
          name: file.name,
          dataUrl: dataUrl,
          order: selectedImages.length + i,
        });
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Could not process image", "error");
        return;
      }
    }

    setSelectedImages([...selectedImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) =>
      prev.filter((_, i) => i !== index).map((img, idx) => ({ ...img, order: idx }))
    );
  };

  const handleEditImageSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const totalImages = editSelectedImages.length + files.length;
    if (totalImages > 10) {
      addToast(`Maximum 10 images allowed. You've already selected ${editSelectedImages.length}.`, "error");
      return;
    }

    const newImages: SelectedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        addToast(`File "${file.name}" is not an image. Please select image files only.`, "error");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        addToast(`File "${file.name}" is too large. Max 2MB per image.`, "error");
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const parts = dataUrl.split(",");
        if (parts.length !== 2) {
          throw new Error("Invalid image data");
        }

        newImages.push({
          base64: parts[1],
          mimeType: file.type,
          name: file.name,
          dataUrl: dataUrl,
          order: editSelectedImages.length + i,
        });
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Could not process image", "error");
        return;
      }
    }

    setEditSelectedImages([...editSelectedImages, ...newImages]);
  };

  const removeEditImage = (index: number) => {
    setEditSelectedImages((prev) =>
      prev.filter((_, i) => i !== index).map((img, idx) => ({ ...img, order: idx }))
    );
  };

  const formatPrice = (price: string) => {
    const value = String(price || "").trim();
    if (!value) return "Rs 0";

    const numericPart = value
      .replace(/^(rs\.?\s*|₹)\s*/i, "")
      .replace(/,/g, "")
      .trim();
    const amount = Number(numericPart);

    if (Number.isFinite(amount)) {
      const decimalDigits = (numericPart.split(".")[1] || "").length;
      const formatted = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimalDigits > 0 ? Math.min(decimalDigits, 2) : 0,
        maximumFractionDigits: 2,
      }).format(amount);
      return `Rs ${formatted}`;
    }

    return /^(rs\.?\s*|₹)/i.test(value) ? value : `Rs ${value}`;
  };

  const loadPanelData = async (token: string) => {
    const apiBase = getApiBaseUrl();
    const [leadsResponse, productsResponse, analyticsResponse] = await Promise.all([
      fetch(`${apiBase}/api/admin/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiBase}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiBase}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const leadsData = await leadsResponse.json();
    const productsData = await productsResponse.json();
    const analyticsData = await analyticsResponse.json();

    if (!leadsResponse.ok) {
      throw new Error(leadsData?.detail || "Unable to load leads");
    }

    if (!productsResponse.ok) {
      throw new Error(productsData?.detail || "Unable to load products");
    }

    if (!analyticsResponse.ok) {
      throw new Error(analyticsData?.detail || "Unable to load analytics");
    }

    setLeads(leadsData.leads || []);
    setProducts(productsData.products || []);
    setAnalytics(analyticsData || null);
  };

  const handleExportCsv = async (exportType: "leads" | "products") => {
    const token = getAdminSessionToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const endpoint = exportType === "leads" ? "leads/export.csv" : "products/export.csv";
      const response = await fetch(`${getApiBaseUrl()}/api/admin/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${exportType} CSV`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exportType === "leads" ? "reachout_leads.csv" : "products.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      addToast(`${exportType === "leads" ? "Leads" : "Products"} CSV exported`, "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "CSV export failed", "error");
    }
  };

  useEffect(() => {
    const token = getAdminSessionToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        await loadPanelData(token);
      } catch (error) {
        clearAdminSessionToken();
        setErrorMessage(error instanceof Error ? error.message : "Session expired. Please login again.");
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = getAdminSessionToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const payload = {
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || "").toUpperCase(),
      artisan: String(formData.get("artisan") || "") || null,
      price: String(formData.get("price") || ""),
      image_url: null,
      images_base64: selectedImages.length > 0 
        ? selectedImages.map((img) => ({ data: img.base64, mime_type: img.mimeType }))
        : null,
      description: String(formData.get("description") || "") || null,
    };

    if (!PRICE_REGEX.test(payload.price)) {
      addToast("Price must be numeric (up to 2 decimal places).", "error");
      return;
    }

    setIsSavingProduct(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to create product");
      }

      form.reset();
      setSelectedImages([]);
      addToast("Product added successfully.", "success");
      await loadPanelData(token);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to create product", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const token = getAdminSessionToken();
    if (!token) { router.push("/admin/login"); return; }

    setDeletingProductId(productId);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to delete product");
      }
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast("Product deleted successfully.", "error");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to delete product", "error");
    } finally {
      setDeletingProductId(null);
    }
  };

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditSelectedImages([]);
    setEditForm({
      title: product.title,
      category: product.category,
      artisan: product.artisan || "",
      price: product.price,
      description: product.description || "",
    });
  };

  const cancelEditingProduct = () => {
    setEditingProductId(null);
    setIsUpdatingProduct(false);
    setEditSelectedImages([]);
    setEditForm({ title: "", category: "", artisan: "", price: "", description: "" });
  };

  const handleUpdateProduct = async (event: FormEvent<HTMLFormElement>, productId: number) => {
    event.preventDefault();

    const token = getAdminSessionToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    if (!PRICE_REGEX.test(editForm.price)) {
      addToast("Price must be numeric (up to 2 decimal places).", "error");
      return;
    }

    setIsUpdatingProduct(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          category: editForm.category,
          artisan: editForm.artisan || null,
          price: editForm.price,
          images_base64: editSelectedImages.length > 0
            ? editSelectedImages.map((img) => ({ data: img.base64, mime_type: img.mimeType }))
            : null,
          description: editForm.description || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to update product");
      }

      setProducts((prev) => prev.map((product) => (product.id === productId ? data : product)));
      addToast("Product updated successfully.", "success");
      cancelEditingProduct();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update product", "error");
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    const token = getAdminSessionToken();
    if (!token) { router.push("/admin/login"); return; }

    setDeletingLeadId(leadId);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/reachout/${leadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to delete submission");
      }
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      addToast("Submission deleted successfully.", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to delete submission", "error");
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleLogout = () => {
    clearAdminSessionToken();
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 px-3 py-4 md:px-6 md:py-6 lg:px-8">
      <section className="w-full mx-auto min-h-[calc(100vh-2rem)]">
        <div className="bg-white rounded-2xl shadow border border-teal-100 p-6 md:p-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold text-teal-800">Admin Panel</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage products and review reachout submissions.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow border border-teal-100 p-8 flex items-center justify-center gap-3 text-teal-600">
            <span className="w-5 h-5 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
            Loading panel...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-5 text-red-700 animate-fade-in">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <div className="mt-0 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 xl:gap-6 items-stretch min-h-[calc(100vh-190px)]">
            <aside className="rounded-2xl border border-teal-100 bg-white shadow-sm p-3 md:p-4 h-fit lg:h-full lg:sticky lg:top-4 animate-fade-in-up">
              <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Navigation</p>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 min-w-max lg:min-w-0 ${
                      activeSection === item.key
                        ? "bg-teal-600 text-white shadow"
                        : "text-zinc-700 hover:bg-teal-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {typeof item.count === "number" && (
                      <span className={`rounded-full px-2 py-0.5 text-xs ${activeSection === item.key ? "bg-white/20" : "bg-zinc-100"}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-5 min-h-[calc(100vh-190px)]">
              {activeSection === "dashboard" && (
                <section className="rounded-2xl border border-teal-100 bg-white shadow-sm p-5 md:p-6 animate-fade-in-up min-h-[calc(100vh-190px)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">Business Dashboard</h2>
                  <p className="text-sm text-zinc-600 mt-1">Live performance insights and one-click data export.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportCsv("leads")}
                    className="rounded-xl border border-teal-300 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-all duration-200"
                  >
                    Export Leads CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCsv("products")}
                    className="rounded-xl border border-teal-300 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-all duration-200"
                  >
                    Export Products CSV
                  </button>
                </div>
              </div>

              {analytics ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Total Products</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">{analytics.total_products}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Total Reachouts</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">{analytics.total_leads}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Leads (7 Days)</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">{analytics.leads_last_7_days}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Products Added (7 Days)</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">{analytics.products_added_last_7_days}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Category Distribution</h3>
                      <div className="space-y-2">
                        {analytics.categories.length === 0 ? (
                          <p className="text-xs text-zinc-500">No product categories available yet.</p>
                        ) : (
                          analytics.categories.slice(0, 6).map((item) => {
                            const max = analytics.categories[0]?.count || 1;
                            const percent = Math.max(8, Math.round((item.count / max) * 100));
                            return (
                              <div key={item.category}>
                                <div className="flex items-center justify-between text-xs text-zinc-700 mb-1">
                                  <span>{item.category}</span>
                                  <span>{item.count}</span>
                                </div>
                                <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
                                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Leads Trend (Last 14 Days)</h3>
                      <div className="grid grid-cols-14 gap-1 h-28 items-end">
                        {analytics.daily_leads_last_14_days.map((entry) => {
                          const max = Math.max(...analytics.daily_leads_last_14_days.map((item) => item.count), 1);
                          const height = Math.max(8, Math.round((entry.count / max) * 100));
                          return (
                            <div key={entry.date} className="flex flex-col items-center justify-end gap-1">
                              <div className="w-full rounded-sm bg-teal-400" style={{ height: `${height}%` }} title={`${entry.date}: ${entry.count}`} />
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-2">Hover bars to see date-wise lead count.</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500">Loading analytics...</p>
              )}
                </section>
              )}

              {activeSection === "add-product" && (
                <section className="rounded-2xl border border-teal-100 bg-white shadow-sm p-5 md:p-6 animate-fade-in-up min-h-[calc(100vh-190px)]">
              <h2 className="text-xl font-semibold text-zinc-900">Add Product</h2>
              <p className="text-sm text-zinc-600 mt-1">Products added here appear in customer catalog.</p>

              <form onSubmit={handleCreateProduct} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="title" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Title</label>
                  <input id="title" name="title" required className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Category</label>
                  <input
                    id="category"
                    name="category"
                    required
                    list="product-categories"
                    className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                  <datalist id="product-categories">
                    {DEFAULT_CATEGORIES.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="artisan" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Artisan</label>
                  <input id="artisan" name="artisan" className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="price" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Price</label>
                  <input id="price" name="price" required type="number" inputMode="decimal" min="0" step="0.01" placeholder="e.g. 2499.00" className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Product Images (up to 10, stored as Base64)</label>
                  <label
                    htmlFor="image_file"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragOver(false);
                      const files = event.dataTransfer.files;
                      if (files) handleImageSelection(files);
                    }}
                    className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragOver
                        ? "border-teal-600 bg-teal-50 scale-[1.01]"
                        : "border-zinc-300 bg-zinc-50 hover:border-teal-400 hover:bg-teal-50/50"
                    }`}
                  >
                    <input
                      id="image_file"
                      name="image_file"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        if (event.target.files) {
                          handleImageSelection(event.target.files);
                        }
                      }}
                    />
                    <p className="font-semibold text-zinc-700 text-sm">Drag and drop images here, or click to browse</p>
                    <p className="text-xs text-zinc-400 mt-1">Max 2MB per image · PNG, JPG, WEBP · Up to 10 images</p>
                    {selectedImages.length > 0 && (
                      <p className="text-sm text-teal-600 mt-3">
                        {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </label>

                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
                      {selectedImages.map((image, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={image.dataUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-teal-100 shadow"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="description" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Description</label>
                  <textarea id="description" name="description" rows={3} className="border border-teal-200 rounded-xl px-4 py-2.5 text-sm bg-teal-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none" />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 flex-wrap">
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="rounded-xl bg-teal-600 text-white px-6 py-2.5 font-semibold hover:bg-teal-700 active:scale-95 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-teal-200"
                  >
                    {isSavingProduct ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : "Add Product"}
                  </button>
                </div>
              </form>
                </section>
              )}

              {activeSection === "products" && (
                <section className="rounded-2xl border border-teal-100 bg-white shadow-sm p-5 md:p-6 overflow-x-auto animate-fade-in-up delay-100 min-h-[calc(100vh-190px)]">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Products <span className="text-teal-500 font-normal">({products.length})</span></h2>
              
              {products.length === 0 ? (
                <p className="text-zinc-400 py-6">No products added yet.</p>
              ) : (
                <>
                  {/* Category Filter Buttons */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
                    <button
                      onClick={() => setSelectedProductCategory(null)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                        selectedProductCategory === null
                          ? "bg-teal-600 text-white border border-teal-600"
                          : "bg-white text-teal-600 border border-teal-200 hover:border-teal-400"
                      }`}
                    >
                      All Products
                    </button>
                    {Array.from(new Set(products.map((p) => p.category)))
                      .sort()
                      .map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedProductCategory(category)}
                          className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                            selectedProductCategory === category
                              ? "bg-teal-600 text-white border border-teal-600"
                              : "bg-white text-teal-600 border border-teal-200 hover:border-teal-400"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                  </div>

                  {/* Products List */}
                  <div className="grid grid-cols-1 gap-3">
                    {products
                      .filter((p) => selectedProductCategory === null || p.category === selectedProductCategory)
                      .map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3 hover:bg-teal-50/50 transition-colors duration-200"
                    >
                      {/* Image thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-teal-100 bg-zinc-200">
                        {product.image_data_urls && product.image_data_urls.length > 0 ? (
                          <img
                            src={product.image_data_urls[0].image_data_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={NO_IMAGE_PLACEHOLDER}
                            alt="No image available"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{product.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          <span className="bg-teal-100 text-teal-700 rounded-full px-2 py-0.5 font-medium mr-2">{product.category}</span>
                          {product.artisan && <span className="mr-2">{product.artisan}</span>}
                          <span className="font-semibold text-teal-600">{formatPrice(product.price)}</span>
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">{new Date(product.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => startEditingProduct(product)}
                          className="rounded-xl border border-teal-200 text-teal-600 px-3 py-1.5 text-xs font-semibold hover:bg-teal-50 hover:border-teal-300 active:scale-95 transition-all duration-200"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingProductId === product.id}
                          className="rounded-xl border border-red-200 text-red-500 px-3 py-1.5 text-xs font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 active:scale-95 disabled:opacity-50 transition-all duration-200"
                        >
                          {deletingProductId === product.id ? (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 border border-red-400 border-t-red-600 rounded-full animate-spin" />
                              Deleting
                            </span>
                          ) : "Delete"}
                        </button>
                      </div>

                      {editingProductId === product.id && (
                        <div className="w-full basis-full mt-3 rounded-xl border border-teal-200 bg-white p-4">
                          <form onSubmit={(event) => handleUpdateProduct(event, product.id)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Title</label>
                              <input
                                required
                                value={editForm.title}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                                className="border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Category</label>
                              <input
                                required
                                list="product-categories"
                                value={editForm.category}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value.toUpperCase() }))}
                                className="border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Artisan</label>
                              <input
                                value={editForm.artisan}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, artisan: event.target.value }))}
                                className="border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Price</label>
                              <input
                                required
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={editForm.price}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                                className="border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                              />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Replace Product Images (optional)</label>
                              <label
                                htmlFor={`edit_image_file_${product.id}`}
                                onDragOver={(event) => {
                                  event.preventDefault();
                                  setIsEditDragOver(true);
                                }}
                                onDragLeave={() => setIsEditDragOver(false)}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  setIsEditDragOver(false);
                                  const files = event.dataTransfer.files;
                                  if (files) handleEditImageSelection(files);
                                }}
                                className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                                  isEditDragOver
                                    ? "border-teal-600 bg-teal-50 scale-[1.01]"
                                    : "border-zinc-300 bg-zinc-50 hover:border-teal-400 hover:bg-teal-50/50"
                                }`}
                              >
                                <input
                                  id={`edit_image_file_${product.id}`}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(event) => handleEditImageSelection(event.target.files)}
                                />
                                <p className="font-semibold text-zinc-700 text-sm">Drag and drop images here, or click to browse</p>
                                <p className="text-xs text-zinc-400 mt-1">Max 2MB per image · PNG, JPG, WEBP · Up to 10 images</p>
                                {editSelectedImages.length > 0 && (
                                  <p className="text-sm text-teal-600 mt-3">
                                    {editSelectedImages.length} image{editSelectedImages.length !== 1 ? "s" : ""} selected
                                  </p>
                                )}
                              </label>
                              <p className="text-[11px] text-zinc-500">Uploading images here replaces existing uploaded images for this product.</p>

                              <div className="mt-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">Current Product Images</p>
                                {product.image_data_urls && product.image_data_urls.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {product.image_data_urls.map((image, idx) => (
                                      <div key={image.id} className="relative">
                                        <img
                                          src={image.image_data_url}
                                          alt={`Current image ${idx + 1}`}
                                          className="w-full h-20 object-cover rounded border border-teal-100"
                                        />
                                        <span className="absolute bottom-1 left-1 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded">
                                          {idx + 1}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="w-24 h-20 rounded border border-zinc-200 overflow-hidden bg-zinc-50">
                                    <img src={product.image_url || NO_IMAGE_PLACEHOLDER} alt="Current product image" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>

                              {editSelectedImages.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">New Images To Replace</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {editSelectedImages.map((image, idx) => (
                                    <div key={idx} className="relative group">
                                      <img src={image.dataUrl} alt={`Update preview ${idx + 1}`} className="w-full h-20 object-cover rounded border border-teal-100" />
                                      <button
                                        type="button"
                                        onClick={() => removeEditImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        ✕
                                      </button>
                                      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                        {idx + 1}
                                      </span>
                                    </div>
                                  ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-1">
                              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Description</label>
                              <textarea
                                rows={2}
                                value={editForm.description}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                                className="border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                              />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-2">
                              <button
                                type="submit"
                                disabled={isUpdatingProduct}
                                className="rounded-lg bg-teal-600 text-white px-4 py-2 text-xs font-semibold hover:bg-teal-700 disabled:opacity-60"
                              >
                                {isUpdatingProduct ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingProduct}
                                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold hover:bg-zinc-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                </>
              )}
                </section>
              )}

              {activeSection === "reachouts" && (
                <section className="rounded-2xl border border-teal-100 bg-white shadow-sm p-5 md:p-6 overflow-x-auto animate-fade-in-up delay-200 min-h-[calc(100vh-190px)]">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Reachout Submissions <span className="text-teal-500 font-normal">({leads.length})</span></h2>
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Address</th>
                    <th className="py-3 pr-4">Message</th>
                    <th className="py-3 pr-0">Submitted</th>
                    <th className="py-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td className="py-6 text-zinc-500" colSpan={7}>
                        No submissions yet.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-zinc-100 align-top">
                        <td className="py-3 pr-4 font-medium text-zinc-900">{lead.name}</td>
                        <td className="py-3 pr-4">{lead.email}</td>
                        <td className="py-3 pr-4">{lead.phone || "-"}</td>
                        <td className="py-3 pr-4">{lead.address || "-"}</td>
                        <td className="py-3 pr-4 max-w-xs whitespace-pre-wrap">{lead.message}</td>
                        <td className="py-3 pr-0 whitespace-nowrap">{new Date(lead.created_at).toLocaleString()}</td>
                        <td className="py-3 pl-4 text-right">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            disabled={deletingLeadId === lead.id}
                            className="rounded-lg border border-red-200 text-red-500 px-3 py-1 text-xs font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 active:scale-95 disabled:opacity-50 transition-all duration-200"
                          >
                            {deletingLeadId === lead.id ? (
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 border border-red-400 border-t-red-600 rounded-full animate-spin" />
                                Deleting
                              </span>
                            ) : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                </section>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in pointer-events-auto flex items-center justify-between gap-3 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
