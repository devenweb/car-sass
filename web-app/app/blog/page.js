'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MoveRight, Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const posts = [
  {
    id: 1,
    title: "Driving Around Mauritius in 3 Days – Complete Itinerary",
    excerpt: "Mauritius may be a small island, but it’s packed with beaches, mountains, waterfalls, culture, and scenic coastal roads. The best way to explore it all? Renting a car and hitting the road.",
    date: "28 February 2026",
    author: "DRIVE Team",
    category: "Road Trips",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=2070&auto=format&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "Hire a car or a taxi in Mauritius?",
    excerpt: "Mauritius may be famous for its beaches and luxury resorts, but the real magic of the island reveals itself when you’re behind the wheel. We compare the freedom of self-drive vs traditional taxis.",
    date: "23 February 2026",
    author: "DRIVE Team",
    category: "Travel Tips",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Top 10 Road Trips in Mauritius",
    excerpt: "From the dramatic cliffs of Gris Gris to the winding roads of Chamarel, these are the routes that will make your Mauritius holiday unforgettable.",
    date: "23 February 2026",
    author: "DRIVE Team",
    category: "Guides",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  const featuredPost = posts.find(p => p.featured);
  const regularPosts = posts.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-[#F1EDE4] selection:bg-brand-yellow/30">
      <Navbar />

      <main className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="max-w-3xl mb-20 space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
              The DRIVE <br />
              <span className="text-brand-yellow">Journal.</span>
            </h1>
            <p className="text-xl text-[#1A1A1A]/50 font-medium leading-relaxed">
              Road trip guides, rental tips and local discoveries — everything 
              you need to make the most of your time in Mauritius.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="group relative bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 mb-20">
               <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-[400px] lg:h-auto overflow-hidden">
                     <img 
                       src={featuredPost.image} 
                       alt={featuredPost.title}
                       className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute top-8 left-8">
                        <span className="bg-brand-yellow text-[#1A1A1A] px-4 py-1.5 rounded-full font-black text-[12px] uppercase tracking-wider">
                           {featuredPost.category}
                        </span>
                     </div>
                  </div>
                  <div className="p-12 lg:p-16 flex flex-col justify-center space-y-8">
                     <div className="flex items-center gap-6 text-[#1A1A1A]/40 font-bold text-sm uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                           <Calendar className="w-4 h-4" />
                           {featuredPost.date}
                        </span>
                        <span className="flex items-center gap-2">
                           <User className="w-4 h-4" />
                           {featuredPost.author}
                        </span>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] uppercase tracking-tight leading-tight group-hover:text-brand-yellow transition-colors">
                        {featuredPost.title}
                     </h2>
                     <p className="text-lg text-[#1A1A1A]/60 leading-relaxed font-medium line-clamp-3">
                        {featuredPost.excerpt}
                     </p>
                     <button className="flex items-center gap-3 text-[#1A1A1A] font-black uppercase tracking-widest text-sm group/btn">
                        Read full article
                        <div className="w-10 h-10 rounded-full bg-[#F1EDE4] flex items-center justify-center group-hover/btn:bg-brand-yellow transition-colors">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {regularPosts.map((post) => (
              <div key={post.id} className="group space-y-8">
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
                   <img 
                     src={post.image} 
                     alt={post.title}
                     className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute top-6 left-6">
                      <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider">
                         {post.category}
                      </span>
                   </div>
                </div>
                <div className="space-y-4 px-2">
                   <div className="flex items-center gap-4 text-[#1A1A1A]/40 font-bold text-[12px] uppercase tracking-widest">
                      <span className="flex items-center gap-2 italic">
                         {post.date}
                      </span>
                   </div>
                   <h3 className="text-2xl md:text-3xl font-black text-[#1A1A1A] uppercase tracking-tight leading-tight group-hover:text-brand-yellow transition-colors">
                      {post.title}
                   </h3>
                   <p className="text-[#1A1A1A]/60 leading-relaxed font-medium line-clamp-2">
                      {post.excerpt}
                   </p>
                   <button className="flex items-center gap-2 text-[#1A1A1A] font-bold text-sm uppercase tracking-widest pt-2">
                      Read more
                      <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-32 p-12 lg:p-20 bg-[#1A1A1A] rounded-[4rem] text-center space-y-10 relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.05]" 
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
             </div>
             <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                  Ready to <br />
                  <span className="text-brand-yellow">explore?</span>
                </h2>
                <div className="flex justify-center">
                   <Link href="/fleet" className="bg-brand-yellow text-[#1A1A1A] px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-brand-yellow/20 flex items-center gap-3">
                      Search available cars
                      <MoveRight className="w-6 h-6" />
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
