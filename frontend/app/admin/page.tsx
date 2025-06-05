'use client'
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  CalendarIcon, Users, DollarSign, TrendingUp, Eye, MapPin,
  Clock, Sparkles, ArrowLeft, Filter, Download, RefreshCw,
  BarChart3, PieChart as PieChartIcon, Calendar, Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Event type definition
type Event = {
  id: number;
  title: string;
  type: string;
  other_type_name?: string;
  image: string;
  description: string;
  minTeamParticipants: number;
  maxTeamParticipants: number;
  location: string;
  start_date: string;
  end_date: string;
  price: string;
  organizer: string;
  contact_info: string;
  registrationLink: string;
  created_at: string;
};

// Analytics data types
type EventTypeData = {
  name: string;
  count: number;
  percentage: number;
};

type MonthlyData = {
  month: string;
  events: number;
  totalParticipants: number;
};

type PriceDistribution = {
  category: string;
  count: number;
  percentage: number;
};

type LocationData = {
  location: string;
  count: number;
};

// Helper function to check authentication status
const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('access_token');
  }
  return false;
};

// Color palette for charts
const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Analytics state
  const [eventTypeData, setEventTypeData] = useState<EventTypeData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [priceDistribution, setPriceDistribution] = useState<PriceDistribution[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    averagePrice: 0,
    upcomingEvents: 0,
    freeEvents: 0,
    paidEvents: 0
  });

  // Effect for sticky navigation bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to handle initial authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login...');
      router.replace('/login');
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  // Effect to fetch events data
  useEffect(() => {
    if (isAuthChecked) {
      const fetchEvents = async () => {
        try {
          setLoading(true);
          const accessToken = localStorage.getItem('access_token');

          if (!accessToken) {
            setError('Authentication token missing. Please log in.');
            router.replace('/login');
            return;
          }

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          };

          const response = await fetch('http://localhost:8000/api/events/', {
            headers: headers,
          });

          if (response.status === 401 || response.status === 403) {
            setError('Session expired or unauthorized. Please log in again.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.push('/login');
            return;
          }

          if (!response.ok) {
            throw new Error('Failed to fetch events');
          }

          const data = await response.json();
          setEvents(data);
          processAnalyticsData(data);

        } catch (err) {
          console.error('Error fetching events:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch events.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }
  }, [isAuthChecked, router]);

  // Process analytics data
  const processAnalyticsData = (eventsData: Event[]) => {
    // Event type distribution
    const typeCount: { [key: string]: number } = {};
    eventsData.forEach(event => {
      const eventType = event.type === 'others' && event.other_type_name ? event.other_type_name : event.type;
      typeCount[eventType] = (typeCount[eventType] || 0) + 1;
    });

    const eventTypeAnalytics = Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: Math.round((count / eventsData.length) * 100)
    }));
    setEventTypeData(eventTypeAnalytics);

    // Monthly distribution
    const monthlyCount: { [key: string]: { events: number, participants: number } } = {};
    eventsData.forEach(event => {
      const month = new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyCount[month]) {
        monthlyCount[month] = { events: 0, participants: 0 };
      }
      monthlyCount[month].events += 1;
      monthlyCount[month].participants += event.maxTeamParticipants;
    });

    const monthlyAnalytics = Object.entries(monthlyCount)
      .map(([month, data]) => ({
        month,
        events: data.events,
        totalParticipants: data.participants
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    setMonthlyData(monthlyAnalytics);

    // Price distribution
    const priceCategories = { free: 0, low: 0, medium: 0, high: 0 };
    eventsData.forEach(event => {
      const price = parseFloat(event.price);
      if (price === 0) priceCategories.free++;
      else if (price <= 50) priceCategories.low++;
      else if (price <= 200) priceCategories.medium++;
      else priceCategories.high++;
    });

    const priceAnalytics = Object.entries(priceCategories).map(([category, count]) => ({
      category: category === 'free' ? 'Free' :
        category === 'low' ? '$1-50' :
          category === 'medium' ? '$51-200' : '$200+',
      count,
      percentage: Math.round((count / eventsData.length) * 100)
    }));
    setPriceDistribution(priceAnalytics);

    // Location distribution
    const locationCount: { [key: string]: number } = {};
    eventsData.forEach(event => {
      locationCount[event.location] = (locationCount[event.location] || 0) + 1;
    });

    const locationAnalytics = Object.entries(locationCount)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 locations
    setLocationData(locationAnalytics);

    // Total statistics
    const now = new Date();
    const upcomingEvents = eventsData.filter(event => new Date(event.start_date) > now).length;
    const freeEvents = eventsData.filter(event => parseFloat(event.price) === 0).length;
    const paidEvents = eventsData.length - freeEvents;
    const totalParticipants = eventsData.reduce((sum, event) => sum + event.maxTeamParticipants, 0);
    const averagePrice = eventsData.reduce((sum, event) => sum + parseFloat(event.price), 0) / eventsData.length;

    setTotalStats({
      totalEvents: eventsData.length,
      totalParticipants,
      averagePrice: Math.round(averagePrice * 100) / 100,
      upcomingEvents,
      freeEvents,
      paidEvents
    });
  };

  // Refresh data
  const refreshData = () => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        };

        const response = await fetch('http://localhost:8000/api/events/', {
          headers: headers,
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data);
          processAnalyticsData(data);
        }
      } catch (err) {
        console.error('Error refreshing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  };

  if (!isAuthChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4">
            <RefreshCw className="h-12 w-12" />
          </div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Analytics</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-600 hover:to-amber-700">
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isScrolled
        ? 'backdrop-blur-sm shadow-lg'
        : 'bg-gradient-to-b from-black/100 to-black/10'
        }`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/50 to-amber-600/50 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="h-7 w-7 text-white drop-shadow-sm" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-300 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-4">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 drop-shadow-sm tracking-tight">
                  EveBuzz
                </span>
                <div className="flex items-center mt-0.5">
                  <Sparkles className="h-3 w-3 text-amber-400 mr-1" />
                  <span className="text-xs text-amber-400">Admin Analytics</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-12">
              {[
                { name: 'Home', path: '/' },
                { name: 'Events', path: '/events' },
                { name: 'Calendar', path: '/#calendar' }
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className={`relative group transition-all duration-300 font-medium text-lg ${isScrolled
                    ? 'text-amber-400 hover:text-white drop-shadow-sm'
                    : 'text-gray-200 hover:text-white'
                    }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300 rounded-full"></div>
                </a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={refreshData}
                className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-black transition-colors font-semibold flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              {isAuthenticated() && (
                <Button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    router.push('/login');
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-24 pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
                Event Analytics Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Comprehensive insights into your event management system
              </p>
            </div>
            <Link href="/events">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>

          {/* Key Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-amber-500" />
                </div>
                <span className="text-2xl font-bold text-white">{totalStats.totalEvents}</span>
              </div>
              <h3 className="text-gray-300 font-medium">Total Events</h3>
              <p className="text-sm text-gray-400 mt-1">
                {totalStats.upcomingEvents} upcoming
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-white">{totalStats.totalParticipants}</span>
              </div>
              <h3 className="text-gray-300 font-medium">Total Participants</h3>
              <p className="text-sm text-gray-400 mt-1">
                Across all events
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-white">${totalStats.averagePrice}</span>
              </div>
              <h3 className="text-gray-300 font-medium">Average Price</h3>
              <p className="text-sm text-gray-400 mt-1">
                {totalStats.freeEvents} free, {totalStats.paidEvents} paid
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <span className="text-2xl font-bold text-white">{Math.round((totalStats.upcomingEvents / totalStats.totalEvents) * 100)}%</span>
              </div>
              <h3 className="text-gray-300 font-medium">Upcoming Rate</h3>
              <p className="text-sm text-gray-400 mt-1">
                Events coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="px-4 pb-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Event Types Distribution */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-amber-500" />
                Event Types Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Events Trend */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                Monthly Events Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#F59E0B"
                    fill="url(#colorEvents)"
                  />
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Price Distribution */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                Price Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      color: '#F3F4F6'
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Locations */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                Top Event Locations
              </h3>
              <div className="space-y-4">
                {locationData.slice(0, 8).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-bold text-sm">#{index + 1}</span>
                      <span className="text-gray-300 text-sm truncate max-w-48">
                        {location.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                          style={{ width: `${(location.count / locationData[0].count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium text-sm w-8 text-right">
                        {location.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
