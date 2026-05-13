"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Globe, 
  Clock,
  Upload
} from "lucide-react";
import SmartUploader from "@/components/SmartUploader";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BlogEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    thumbnail_url: "",
    category: "",
    status: "draft"
  });

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    }
  }, [params.id]);

  async function fetchPost() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!error && data) {
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        thumbnail_url: data.thumbnail_url || "",
        category: data.category || "",
        status: data.status || "draft"
      });
    }
    setLoading(false);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, title: val, slug }));
  };

  async function handleSave() {
    if (!formData.title || !formData.slug) {
      alert("Title and Slug are required.");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
      published_at: formData.status === 'published' ? new Date().toISOString() : null
    };

    let error;
    if (isNew) {
      const { error: err } = await supabase.from("blogs").insert([payload]);
      error = err;
    } else {
      const { error: err } = await supabase.from("blogs").update(payload).eq("id", params.id);
      error = err;
    }

    if (error) {
      alert("Error saving post: " + error.message);
    } else {
      router.push("/blog");
    }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-admin-muted font-bold animate-pulse">Loading Editor System...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/blog"
            className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">
              {isNew ? "Draft New Article" : "Refine Published Post"}
            </h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">Content Strategy Engine</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary h-8 px-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
          {isNew ? "Launch Post" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-admin-border shadow-sm space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-admin-muted uppercase tracking-widest ml-1">Headline</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Ex: Driving the Coastal Roads of Mauritius"
                className="w-full text-xl font-black text-admin-text placeholder:text-slate-200 border-none focus:ring-0 p-0 leading-tight"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-admin-muted uppercase tracking-widest ml-1">Permalink / Slug</label>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">/blog/</span>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="bg-transparent border-none focus:ring-0 p-0 text-[10px] font-black text-primary w-full"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-black text-admin-muted uppercase tracking-widest ml-1">Excerpt / Meta Description</label>
              <textarea 
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Provide a brief summary for SEO and card previews..."
                className="w-full min-h-[60px] bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-black text-admin-muted uppercase tracking-widest ml-1">Article Content (Markdown/HTML Support)</label>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing your story here..."
                className="w-full min-h-[400px] bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          {/* Status & Category */}
          <div className="bg-white p-5 rounded-xl border border-admin-border shadow-sm space-y-4">
            <h2 className="text-[10px] font-black text-admin-text uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
              <Globe size={14} className="text-primary" />
              Publishing Meta
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[8px] font-black text-admin-muted uppercase mb-1 ml-1 tracking-widest">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-bold"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Live)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-black text-admin-muted uppercase mb-1 ml-1 tracking-widest">Category</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Travel Tips"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-bold"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-5 rounded-xl border border-admin-border shadow-sm space-y-4">
            <h2 className="text-[10px] font-black text-admin-text uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
              <ImageIcon size={14} className="text-primary" />
              Visual Asset
            </h2>
            <SmartUploader 
              currentValue={formData.thumbnail_url}
              onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
              bucket="car-assets"
              label="Cover Image"
            />
            <div className="space-y-1">
              <label className="text-[8px] font-black text-admin-muted uppercase ml-1">Manual URL</label>
              <input 
                type="text" 
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="Or paste an external URL..."
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-bold"
              />
            </div>
          </div>

          {/* Quick Stats */}
          {!isNew && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-primary uppercase">
                <span className="flex items-center gap-1.5"><Clock size={12} /> Last Saved</span>
                <span>Just Now</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
