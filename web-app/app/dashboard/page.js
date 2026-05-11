'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, Car, MapPin, Calendar, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
    } else {
      setUser(user);
      fetchUserRentals(user.email);
    }
  }

  async function fetchUserRentals(email) {
    setLoading(true);
    // Join with customers table based on email
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email);

    if (customers && customers.length > 0) {
      const customerIds = customers.map(c => c.id);
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          cars (*)
        `)
        .in('customer_id', customerIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rentals:', error);
      } else {
        setRentals(data || []);
      }
    }
    setLoading(false);
  }

  const getStatusDisplay = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return { label: 'Awaiting Confirmation', color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock };
      case 'confirmed': return { label: 'Confirmed & Ready', color: 'text-blue-500', bg: 'bg-blue-50', icon: CheckCircle2 };
      case 'delivered': return { label: 'Vehicle with You', color: 'text-teal-500', bg: 'bg-teal-50', icon: Car };
      case 'collected': return { label: 'Returned & Completed', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-50', icon: CheckCircle2 };
      default: return { label: status, color: 'text-slate-500', bg: 'bg-slate-50', icon: Clock };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl font-serif text-secondary uppercase tracking-tighter">My <span className="text-primary italic">Bookings</span></h1>
            <p className="text-text-muted mt-2">Track your luxury car rental experience in real-time.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : rentals.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {rentals.map((rental) => {
                const status = getStatusDisplay(rental.status);
                const StatusIcon = status.icon;
                
                return (
                  <div key={rental.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-black/5 flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative h-64 md:h-auto">
                      <img 
                        src={rental.cars?.image_url} 
                        className="w-full h-full object-cover" 
                        alt={rental.cars?.name} 
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg flex items-center gap-2 ${status.bg} ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8 md:w-2/3 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold text-secondary uppercase tracking-tight">{rental.cars?.name}</h3>
                            <p className="text-text-muted text-xs font-mono">BOOKING ID: #{rental.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Total Amount</p>
                            <p className="text-2xl font-black text-primary">Rs {rental.total_price?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 py-6 border-y border-black/5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary">
                              <Calendar size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Pickup Date</span>
                            </div>
                            <p className="font-bold text-secondary">{rental.start_date}</p>
                          </div>
                          <div className="space-y-1 text-right md:text-left">
                            <div className="flex items-center gap-2 text-primary md:justify-start justify-end">
                              <Calendar size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Return Date</span>
                            </div>
                            <p className="font-bold text-secondary">{rental.end_date}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary">
                              <MapPin size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                            </div>
                            <p className="font-bold text-secondary">SSR International Airport</p>
                          </div>
                          <div className="space-y-1 text-right md:text-left">
                            <div className="flex items-center gap-2 text-primary md:justify-start justify-end">
                              <CreditCard size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
                            </div>
                            <p className="font-bold text-secondary">Payment at Pickup</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        {rental.status === 'confirmed' && (
                          <div className="flex-1 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
                              <Clock size={14} /> Agent on his way
                            </p>
                            <p className="text-xs text-secondary/70">Our agent will meet you at the SSR Airport arrivals with your vehicle.</p>
                          </div>
                        )}
                        {rental.status === 'delivered' && (
                          <div className="flex-1 bg-teal-50 p-4 rounded-2xl border border-teal-100">
                            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                              <Car size={14} /> Drive safely
                            </p>
                            <p className="text-xs text-secondary/70">You currently have the vehicle. Enjoy your stay in Mauritius!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-black/5 shadow-2xl">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-8">
                <Car size={40} />
              </div>
              <h2 className="text-3xl font-serif text-secondary uppercase tracking-tight mb-4">No Bookings <span className="text-primary italic">Yet</span></h2>
              <p className="text-text-muted max-w-md mx-auto mb-10">Start your extraordinary journey in Mauritius by reserving one of our premium vehicles.</p>
              <button onClick={() => router.push('/fleet')} className="btn-primary">Explore Our Fleet</button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
