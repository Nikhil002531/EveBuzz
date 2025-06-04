'use client'
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ArrowRight, Search, Bell, Menu, X, Sparkles, User, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // Correct import for App Router

// Sample event data
type Event =
  {
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
  };

const eventTypes = ["Hackathon", "Cultural", "Sports", "Workshop", "Seminar", "Competition", "Others"];

export default function EveBuzzLandingPage() {
  const router = useRouter(); // Access router inside the component

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]); // Explicitly type as Event[]

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  // Removed handleEvent as it had a syntax error and Link handles navigation
  // const handleEvent = async (e) => {
  //   e.prevent // This is a syntax error, should be e.preventDefault()
  //   router.push("/events")
  // }

  // Function to check authentication status
  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  };

  // Effect to set initial login status and listen for storage changes
  useEffect(() => {

    setIsLoggedIn(checkAuthStatus());

    const handleStorageChange = () => {
      setIsLoggedIn(checkAuthStatus());
    };

    // Listen for changes in localStorage from other tabs/windows
    // This ensures the login status updates if a user logs in/out in another tab
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Run once on mount

  // Handlers for Sign In and Register buttons
  const handleSignInClick = () => {
    router.push('/login'); // Redirects to the /login page
  };

  const handleRegisterClick = () => {
    router.push('/register'); // Redirects to the /register page
  };

  // Handler for Logout button
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');    // Clear the access token
      localStorage.removeItem('refresh_token');   // Clear the refresh token
      setIsLoggedIn(false);                     // Update the component's state to reflect logout
      router.push('/login');                    // Redirect to the login page after logout
    }
  };

  // Fetch upcoming events with Authorization header
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      const accessToken = localStorage.getItem('access_token');
      console.log('Landing Page: Access Token from localStorage (for upcoming events):', accessToken); // Debugging log

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      try {
        const response = await fetch('http://localhost:8000/api/events/', {
          headers: headers, // Pass the headers here
        });

        if (!response.ok) {
          // If 401 or 403, it means unauthorized access.
          // For the landing page, we might just want to show a message or
          // fallback to public content, rather than redirecting immediately,
          // as some content might be public.
          // However, if all events are protected, then a 401 is expected if not logged in.
          console.error(`HTTP status failed: ${response.status}`);
          // If you want to handle 401/403 by clearing tokens and potentially redirecting
          // (e.g., if the landing page *must* show protected content), you can uncomment:
          // if (response.status === 401 || response.status === 403) {
          //   localStorage.removeItem('access_token');
          //   localStorage.removeItem('refresh_token');
          //   router.push('/login');
          // }
          throw new Error(`Failed to fetch events: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setUpcomingEvents(data);
        } else {
          console.error('API response is not an array:', data);
          setUpcomingEvents([]);
        }
      } catch (err) {
        console.error('Failed to fetch events on landing page:', err);
        setUpcomingEvents([]); // Ensure events are cleared on error
      }
    };

    fetchUpcomingEvents();
  }, []); // Empty dependency array means it runs once on mount


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated counter for statistics
  const [counts, setCounts] = useState({
    events: 0,
    colleges: 0,
    students: 0
  });

  useEffect(() => {
    const targetCounts = {
      events: 500,
      colleges: 75,
      students: 25000
    };

    const duration = 2000; // 2 seconds animation
    const frameDuration = 16; // ~60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      setCounts({
        events: Math.floor(targetCounts.events * progress),
        colleges: Math.floor(targetCounts.colleges * progress),
        students: Math.floor(targetCounts.students * progress)
      });

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, []);

  // Calendar functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return upcomingEvents.some(event => {
      const eventStartDate = new Date(event.start_date);
      const eventEndDate = new Date(event.end_date);

      // Check if the provided date falls within an event's date range
      return (
        date.getDate() === eventStartDate.getDate() &&
        date.getMonth() === eventStartDate.getMonth() &&
        date.getFullYear() === eventStartDate.getFullYear()
      ) || (
          date >= eventStartDate &&
          date <= eventEndDate
        );
    });
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return upcomingEvents.filter(event => {
      const eventStartDate = new Date(event.start_date);
      const eventEndDate = new Date(event.end_date);

      // Check if the provided date falls within an event's date range
      return (
        date.getDate() >= eventStartDate.getDate() &&
        date.getDate() <= eventEndDate.getDate() &&
        date.getMonth() >= eventStartDate.getMonth() &&
        date.getMonth() <= eventEndDate.getMonth() &&
        date.getFullYear() >= eventStartDate.getFullYear() &&
        date.getFullYear() <= eventEndDate.getFullYear()
      );
    });
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    setEventsForSelectedDate(dateEvents);
  };

  // Generate calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Add cells for days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      const dateHasEvents = hasEvents(date);

      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex flex-col items-center justify-center rounded-full cursor-pointer relative
            ${isToday ? 'bg-amber-100 text-amber-800' : ''}
            ${isSelected ? 'bg-amber-500 text-white' : 'hover:bg-gray-100'}
          `}
          onClick={() => handleDateClick(date)}
        >
          {day}
          {dateHasEvents && (
            <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-amber-500"></div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h3 className="text-lg font-bold text-slate-800">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  // Render events for selected date
  const renderEventsForSelectedDate = () => {
    if (eventsForSelectedDate.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
          <p className="text-gray-500 text-center">No events scheduled for this date.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-slate-800">
          Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <div className="space-y-4">
          {eventsForSelectedDate.map(event => (
            <div key={event.id} className="border-l-4 border-amber-500 pl-4 py-2">
              <h4 className="font-semibold text-slate-800">{event.title}</h4>
              <div className="flex flex-col text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {/* Assuming 'attendees' field exists or deriving it */}
                  <span> Attending</span> {/* Removed event.attendees placeholder */}
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-amber-100 text-xs rounded-full text-amber-800">{event.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black text-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isScrolled
        ? 'bg-white/8 backdrop-blur-2xl shadow-lg'
        : 'bg-transparent'
        }`}>
        {/* Remove the glow line completely */}

        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo Section */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/50 to-amber-600/50 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-105">
                  < Sparkles className="h-7 w-7 text-white drop-shadow-sm" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-300 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-4">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 drop-shadow-sm tracking-tight">
                  EveBuzz
                </span>
                <div className="flex items-center mt-0.5">
                  <Sparkles className="h-3 w-3 text-amber-400 mr-1" />
                </div>
              </div>
            </div>

            {/* Enhanced Navigation Links */}
            <div className="hidden lg:flex items-center space-x-12">
              {['Home', 'Events', 'Calendar'].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`relative group transition-all duration-300 font-medium text-lg ${isScrolled
                    ? 'text-amber-400 hover:text-white drop-shadow-sm'
                    : 'text-gray-200 hover:text-white'
                    }`}
                >
                  <span className="relative z-10">{item}</span>
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300 rounded-full"></div>
                  <div className={`absolute -inset-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm ${isScrolled ? 'bg-white/10' : 'bg-white/5'
                    }`}></div>
                </a>
              ))}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-4">

              {isLoggedIn ? (
                <button className="relative group px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 overflow-hidden" onClick={handleLogout}
                >

                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">logout</span>
                </button>) : (
                <>
                  <button className="relative group px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 overflow-hidden " onClick={handleSignInClick}
                  >

                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Sign In</span>
                  </button>

                  <button className="relative group px-6 py-2.5 rounded-xl bg-gradient-to-r from-$mber-500 to-amber-600 text-black font-semibold text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 overflow-hidden" onClick={handleRegisterClick}  >

                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Register</span>
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-bounce"></div>
                  </button>
                </>
              )}

            </div>
          </div>
        </div>




        {/* Animated particles effect */}
        < div className="absolute inset-0 overflow-hidden pointer-events-none" >
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-amber-400/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2 right-1/3 w-0.5 h-0.5 bg-amber-500/40 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-1 left-1/2 w-0.5 h-0.5 bg-amber-300/20 rounded-full animate-pulse delay-3000"></div>
        </div >
      </nav >
      {/* Hero Section */}
      < section className="pt-24 pb-20 md:pt-32 md:pb-24 px-4" >
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">Campus Events</span> All in One Place
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Never miss another hackathon, sports meet, or cultural fest. EveBuzz connects students to all college events happening in your region.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Link href="/events">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg hover:opacity-90 transition-all flex items-center justify-center font-semibold">
                      Explore Events <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                </div>
                <div className="flex-1">
                  <Link href="#how-it-works" scroll={true} className="w-full">
                    <button className="w-full px-6 py-3 border border-gray-600 text-gray-200 rounded-lg hover:bg-slate-800 transition-all">
                      How It Works
                    </button>
                  </Link>
                </div>
              </div>

              <div className="mt-10 flex items-center space-x-4">

              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative w-full max-w-md mx-auto lg:ml-auto rounded-2xl overflow-hidden shadow-2xl transform lg:translate-x-8">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl"></div>
                <img src="/istockphoto-1125107251-612x612.jpg" alt="EveBuzz App Demo" className="w-full rounded-2xl" />

                <div className="absolute top-4 left-4 right-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">TechHacks 2025</h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>May 28-30</span>
                      </div>
                    </div>
                    <button className="px-2 py-1 bg-amber-500 text-xs text-black rounded font-medium">Register</button>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 h-32 w-32 md:h-40 md:w-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-20"></div>
              <div className="absolute top-1/2 -right-4 h-24 w-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section >

      {/* Search and Filter Bar */}
      < section className="py-8 px-4 bg-slate-800" >
        <div className="container mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search events, colleges, or categories..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700">
                  <option value="">All Categories</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700">
                  <option value="">All Locations</option>
                  <option value="MIT">Bengaluru</option>
                  <option value="Stanford">Mysore</option>
                </select>

                <button className="px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors font-semibold">
                  Find Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </section >


      {/* Featured Events */}
      < section id="events" className="py-16 px-4 bg-gradient-to-b from-black to-slate-900" >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Featured Events</h2>
              <p className="text-gray-300 max-w-2xl">Discover the hottest events happening across college campuses near you.</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 3).map(event => (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <Image
                    src={
                      event.image.startsWith('http')
                        ? event.image
                        : `http://localhost:8000/media/${event.image.replace(/^\/?media\//, '')}`
                    }
                    alt={event.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {event.type === "others" ? event.other_type_name : event.type}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.minTeamParticipants}–{event.maxTeamParticipants} Participants</span>
                    </div>
                  </div>
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">
                      View Details
                    </Button>
                  </Link>                </div>
              </div>
            ))}

          </div>

          <div className="text-center mt-12">
            {/* Changed from button with handleEvent to Link directly */}
            <Link href="/events">
              <button className="px-8 py-3 border border-amber-500 text-amber-500 rounded-lg hover:bg-slate-800 transition-colors">
                View All Events
              </button>
            </Link>
          </div>
        </div>
      </section >

      {/* Events Calendar Section */}
      < section id="calendar" className="py-16 px-4 bg-slate-800" >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Events Calendar</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Browse our calendar to find upcoming events and plan your schedule. Click on dates to see details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {renderCalendar()}
              <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
                <h4 className="font-medium mb-2 text-slate-800">Calendar Legend</h4>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-gray-600">Event scheduled</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-5 w-5 rounded-full border border-amber-500 bg-amber-500"></div>
                  <span className="text-sm text-gray-600">Selected date</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {renderEventsForSelectedDate()}
            </div>
          </div>
        </div>
      </section >

      {/* How It Works */}
      < section id='how-it-works' className="py-16 px-4 bg-black" >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How EveBuzz Works</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              A simple process to discover, register, and engage with college events in your region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-10 w-10 text-amber-500" />,
                title: "Discover Events",
                description: "Find relevant events based on your interests, location, and college."
              },
              {
                icon: <CalendarIcon className="h-10 w-10 text-amber-500" />,
                title: "Register & Save",
                description: "Quick registration process with calendar integration to never miss an event."
              },
              {
                icon: <Bell className="h-10 w-10 text-amber-500" />,
                title: "Get Updates",
                description: "Receive timely notifications about event changes and important announcements."
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md relative">
                <div className="absolute -top-5 left-8 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                  {index + 1}
                </div>
                <div className="mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section >


      {/* Footer */}
      < footer className="bg-slate-900 text-white py-12 px-4" >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">EveBuzz</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting students with college events happening in their region.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center"></div>
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center"></div>
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center"></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Home</a>
                </li>
                <li>
                  <a href="#events" className="text-gray-400 hover:text-amber-500 transition-colors">Events</a>
                </li>
                <li>
                  <a href="#calendar" className="text-gray-400 hover:text-amber-500 transition-colors">Calendar</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">support@evebuzz.com</li>
                <li className="text-gray-400">+91 1234567890</li>
                <li className="text-gray-400">Dayananda Sagar Academy of Technology and Management, Bengaluru</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-6 text-center">
            <p className="text-gray-500">© 2025 EveBuzz. All rights reserved.</p>
          </div>
        </div>

      </footer >
    </div >
  )
}
;

