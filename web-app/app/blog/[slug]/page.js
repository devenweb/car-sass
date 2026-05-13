'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Clock, 
  Tag,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  async function fetchPost() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (!error && data) {
      setPost(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1EDE4] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-yellow/20 border-t-brand-yellow rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F1EDE4] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-4 text-center">Post Not Found</h1>
        <Link href="/blog" className="text-brand-yellow font-bold uppercase tracking-widest flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1EDE4] selection:bg-brand-yellow/30">
      <Navbar />

      <main className="pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 text-[10px] font-black text-[#1A1A1A]/30 uppercase tracking-widest mb-12">
            <Link href="/" className="hover:text-brand-yellow transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/blog" className="hover:text-brand-yellow transition-colors">Journal</Link>
            <ChevronRight size={10} />
            <span className="text-brand-yellow">{post.category || 'General'}</span>
          </nav>

          {/* Article Header */}
          <div className="space-y-8 mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-[0.9] text-left">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 py-8 border-y border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-[#1A1A1A]">
                  <User size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">Author</span>
                  <span className="text-sm font-black text-[#1A1A1A]">DRIVE TEAM</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1A1A]">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">Published</span>
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1A1A]">
                  <Tag size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">Category</span>
                  <span className="text-sm font-black text-[#1A1A1A] uppercase">{post.category || 'General'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 mb-20">
            <img 
              src={post.thumbnail_url || 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=2070&auto=format&fit=crop'} 
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-[#1A1A1A]/70 prose-p:leading-relaxed prose-strong:text-[#1A1A1A] prose-a:text-brand-yellow">
            <div 
              className="text-lg leading-loose space-y-8"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </article>

          {/* Footer Actions */}
          <div className="mt-20 pt-12 border-t border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <Link href="/blog" className="flex items-center gap-3 text-[#1A1A1A] font-black uppercase tracking-widest group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-brand-yellow transition-colors shadow-sm">
                <ArrowLeft size={20} />
              </div>
              Back to Journal
            </Link>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-brand-yellow transition-colors">
                <Share2 size={14} /> Share Article
              </button>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-brand-yellow transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
