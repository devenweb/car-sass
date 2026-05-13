"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Tag, 
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  published_at: string;
  created_at: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
    setLoading(false);
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) alert("Error deleting post");
    else fetchPosts();
  }

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-admin-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <MessageSquare size={16} />
          </div>
          <div>
            <h1 className="text-lg font-black text-admin-text uppercase tracking-tight leading-none">Blog Content Manager</h1>
            <p className="text-[9px] text-admin-muted font-bold tracking-tight uppercase mt-1">SEO & Articles System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 h-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-full pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-[10px]" 
            />
          </div>
          <Link 
            href="/blog/new"
            className="h-8 px-4 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={14} />
            New Post
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-admin-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-admin-border">
              <th className="px-4 py-3 text-[10px] font-black text-admin-muted uppercase tracking-widest">Article</th>
              <th className="px-4 py-3 text-[10px] font-black text-admin-muted uppercase tracking-widest">Category</th>
              <th className="px-4 py-3 text-[10px] font-black text-admin-muted uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-[10px] font-black text-admin-muted uppercase tracking-widest">Published</th>
              <th className="px-4 py-3 text-[10px] font-black text-admin-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                </tr>
              ))
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-admin-text line-clamp-1">{post.title}</span>
                      <span className="text-[9px] text-admin-muted font-bold tracking-tight mt-0.5 italic">/{post.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {post.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                      post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      post.status === 'draft' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    )}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-admin-muted font-bold">
                      <Calendar size={12} className="text-slate-300" />
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={`https://royalcarmauritius.vercel.app/blog/${post.slug}`} 
                        target="_blank" 
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="View on site"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <Link 
                        href={`/blog/${post.id}`} 
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button 
                        onClick={() => deletePost(post.id)} 
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-20 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-xs font-black text-admin-text uppercase">No articles found</h3>
                  <p className="text-[9px] text-admin-muted font-bold mt-1 uppercase">Start publishing content to boost your SEO.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
