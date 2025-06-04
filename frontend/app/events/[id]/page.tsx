'use client'
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ArrowLeft, Bell, User, Sparkles, Share2, ExternalLink, Mail, Phone, DollarSign, ChevronLeft, ChevronRight, Loader2, CircleAlert } from 'lucide-react'; // Added Loader2 and CircleAlert
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

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

// Helper function to check authentication status
const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('access_token');
  }
  return false;
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // State to track if auth check is done

  // Effect for sticky navigation bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to handle initial authentication check and redirection
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login from EventDetailsPage...');
      router.replace('/login'); // Use replace to prevent going back after login
    } else {
      setIsAuthChecked(true); // Mark authentication check as complete only if authenticated
    }
  }, [router]);

  // Effect to fetch event details and related events after auth check
  useEffect(() => {
    if (isAuthChecked && params.id) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          const accessToken = localStorage.getItem('access_token');

          // This check is redundant if the useEffect above already redirected, but good for clarity/fallback
          if (!accessToken) {
            setError('Authentication token missing. Please log in.');
            router.replace('/login');
            return;
          }

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // INCLUDE THE JWT TOKEN HERE
          };

          // Fetch main event details
          const response = await fetch(`http://localhost:8000/api/events/${params.id}/`, {
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
            throw new Error('Event not found or failed to fetch');
          }
          const data = await response.json();
          setEvent(data);

          // Fetch related events (excluding the current event)
          const relatedResponse = await fetch(`http://localhost:8000/api/events/?type=${data.type}`, {
            headers: headers,
          });
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedEvents(relatedData.filter((e: Event) => e.id !== data.id).slice(0, 3)); // Limit to 3 related events
          } else {
            console.warn('Failed to fetch related events:', relatedResponse.status);
            setRelatedEvents([]);
          }

        } catch (err) {
          console.error('Error fetching event details:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch event details.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [params.id, isAuthChecked, router]); // Dependencies for this effect

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle sharing event details
  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL if Web Share API is not available
      document.execCommand('copy'); // Use document.execCommand for clipboard in iframe
      // You could add a custom message box here to indicate URL copied
    }
  };

  // Add event to Google Calendar
  const addToCalendar = () => {
    if (!event) return;

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    // Format dates for Google Calendar URL (YYYYMMDDTHHMMSSZ)
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]|\.\d{3}/g, '') + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(calendarUrl, '_blank');
  };

  // Render event type badge
  const renderEventTypeBadge = (type: string, otherTypeName?: string) => {
    const displayType = type === 'others' && otherTypeName ? otherTypeName : type;
    let badgeColor = 'bg-slate-100 text-slate-800'; // Default

    switch (type.toLowerCase()) {
      case 'hackathon': badgeColor = 'bg-blue-100 text-blue-800'; break;
      case 'cultural': badgeColor = 'bg-purple-100 text-purple-800'; break;
      case 'sports': badgeColor = 'bg-green-100 text-green-800'; break;
      case 'workshop': badgeColor = 'bg-amber-100 text-amber-800'; break;
      case 'seminar': badgeColor = 'bg-indigo-100 text-indigo-800'; break;
      case 'competition': badgeColor = 'bg-red-100 text-red-800'; break;
    }

    return (
      <span className={`${badgeColor} font-medium text-xs px-3 py-1 rounded-full capitalize`}>
        {displayType}
      </span>
    );
  };

  // Show loading spinner if auth check is not done or data is still loading
  if (!isAuthChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Show error page if there's an error or event is null after loading
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <CircleAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {error ? "Error Loading Event" : "Event Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The event you're looking for doesn't exist or has been removed."}
          </p>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black text-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isScrolled
        ? 'bg-white/8 backdrop-blur-2xl shadow-lg'
        : 'bg-gradient-to-b from-black/100 to-black/10'
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
              )
              }


            </div>
          </div>
        </div>




        {/* Animated particles effect */}
        < div className="absolute inset-0 overflow-hidden pointer-events-none" >
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-amber-400/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2 right-1/3 w-0.5 h-0.5 bg-amber-500/40 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-1 left-1/2 w-0.5 h-0.5 bg-amber-300/20 rounded-full animate-pulse delay-3000"></div>
        </div >
      </nav > {/* Breadcrumb */}


      {/* Hero Section */}
      < section className="relative p-20 " >
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <Image
            src={
              event.image.startsWith('http')
                ? event.image
                : `http://localhost:8000/media/${event.image.replace(/^\/?media\//, '')}`
            }
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Event Type Badge */}
          <div className="absolute top-6 left-6">
            {renderEventTypeBadge(event.type, event.other_type_name)}
          </div>

          {/* Share Button */}
          <div className="absolute top-6 right-6">
            <Button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors"
              size="icon"
            >
              <Share2 className="h-5 w-5 text-slate-700" />
            </Button>
          </div>

          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">
              {event.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> {event.location}
            </p>
          </div>
        </div>
      </section >

      {/* Event Details Section */}
      < section className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10" >
        <div className="lg:col-span-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">About the Event</h2>
          <p className="text-gray-300 leading-relaxed mb-8">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 p-6 rounded-lg shadow-inner flex items-center gap-4">
              <CalendarIcon className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="font-semibold text-white">{formatDate(event.start_date)}</p>
                {event.start_date !== event.end_date && (
                  <p className="text-gray-400 text-sm">to {formatDate(event.end_date)}</p>
                )}
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-lg shadow-inner flex items-center gap-4">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-gray-400 text-sm">Time</p>
                <p className="font-semibold text-white">{formatTime(event.start_date)} - {formatTime(event.end_date)}</p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-lg shadow-inner flex items-center gap-4">
              <Users className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-gray-400 text-sm">Participants</p>
                <p className="font-semibold text-white">{event.minTeamParticipants} - {event.maxTeamParticipants} Team Members</p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-lg shadow-inner flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-gray-400 text-sm">Price</p>
                <p className="font-semibold text-white">{event.price === '0' ? 'Free' : `$${event.price}`}</p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Organizer Details</h3>
          <div className="bg-white/5 p-6 rounded-lg shadow-inner mb-8">
            <p className="text-gray-400 text-sm">Organizer</p>
            <p className="font-semibold text-white text-lg mb-2">{event.organizer}</p>
            <div className="flex items-center gap-4 text-gray-300">
              {event.contact_info.includes('@') && (
                <a href={`mailto:${event.contact_info}`} className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
              {!event.contact_info.includes('@') && (
                <a href={`tel:${event.contact_info}`} className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                  <Phone className="h-4 w-4" /> Call
                </a>
              )}
            </div>
          </div>

          {event.registrationLink && (
            <div className="mb-8">
              <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-600 hover:to-amber-700 py-3 text-lg font-semibold">
                  Register Now <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          )}

          <div className="mt-8">
            <Button
              onClick={addToCalendar}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-3 text-lg font-semibold"
            >
              Add to Google Calendar <CalendarIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Related Events Sidebar */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Related Events</h2>
          {relatedEvents.length > 0 ? (
            <div className="space-y-6">
              {relatedEvents.map(relatedEvent => (
                <Link href={`/events/${relatedEvent.id}`} key={relatedEvent.id}>
                  <div className="bg-white/5 rounded-lg overflow-hidden shadow-inner flex items-center gap-4 p-4 hover:bg-white/10 transition-colors">
                    <Image
                      src={
                        relatedEvent.image.startsWith('http')
                          ? relatedEvent.image
                          : `http://localhost:8000/media/${relatedEvent.image.replace(/^\/?media\//, '')}`
                      }
                      alt={relatedEvent.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-lg">{relatedEvent.title}</h4>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> {formatDate(relatedEvent.start_date)}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {relatedEvent.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 p-6 rounded-lg text-center text-gray-400">
              No related events found.
            </div>
          )}
        </div>
      </section >

      {/* Footer (copied from landing page for consistency) */}
      < footer className="bg-slate-900 text-white py-12 px-4 mt-12" >
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
  );
}
