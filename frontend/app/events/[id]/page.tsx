'use client'
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ArrowLeft, Bell, User, Share2, ExternalLink, Mail, Phone, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

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

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/events/${params.id}/`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data);

        // Fetch related events
        const relatedResponse = await fetch(`http://localhost:8000/api/events/?type=${data.type}&limit=3`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedEvents(relatedData.filter((e: Event) => e.id !== data.id).slice(0, 3));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const addToCalendar = () => {
    if (!event) return;

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-300 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events">
            <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg hover:opacity-90 transition-colors font-semibold">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black text-gray-900">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-gradient-to-b from-black/95 via-black/50 to-transparent backdrop-blur-sm'
        : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-600">EveBuzz</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <Link href="/" className="text-gray-200 hover:text-amber-500 transition-colors">Home</Link>
            <Link href="/events" className="text-amber-500 font-semibold">Events</Link>
            <a href="/#calendar" className="text-gray-200 hover:text-amber-500 transition-colors">Calendar</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden md:block px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white transition-colors">Sign In</button>
            <button className="px-4 py-2 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:opacity-90 transition-colors font-semibold">Register</button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      {/* <div className="container mx-auto px-4 py-4"> */}
      {/*   <div className="flex items-center space-x-2 text-sm"> */}
      {/*     <Link href="/" className="text-gray-400 hover:text-amber-500 transition-colors">Home</Link> */}
      {/*     <span className="text-gray-500">/</span> */}
      {/*     <Link href="/events" className="text-gray-400 hover:text-amber-500 transition-colors">Events</Link> */}
      {/*     <span className="text-gray-500">/</span> */}
      {/*     <span className="text-gray-300">{event.title}</span> */}
      {/*   </div> */}
      {/* </div> */}
      {/**/}
      {/* Hero Section */}
      <section className="relative">
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
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-slate-800">
              {event.type === "others" ? event.other_type_name : event.type}
            </div>
          </div>

          {/* Share Button */}
          <div className="absolute top-6 right-6">
            <button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors"
            >
              <Share2 className="h-5 w-5 text-slate-700" />
            </button>
          </div>

          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-200">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>{event.price == "0.00" ? "Free" : `₹${event.price}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Event Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-amber-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-800">Start Date</p>
                        <p className="text-gray-600">{formatDate(event.start_date)}</p>
                        <p className="text-sm text-gray-500">{formatTime(event.start_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-amber-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-800">End Date</p>
                        <p className="text-gray-600">{formatDate(event.end_date)}</p>
                        <p className="text-sm text-gray-500">{formatTime(event.end_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-amber-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-800">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-amber-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-800">Team Size</p>
                        <p className="text-gray-600">{event.minTeamParticipants}–{event.maxTeamParticipants} Participants</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Description</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </div>
                </div>
              </div>

              {/* Organizer Information */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Organizer Information</h2>

                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{event.organizer}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{event.contact_info}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-slate-800 mb-2">
                    {event.price == "0.00" ? "Free" : `₹${event.price}`}
                  </div>
                  <p className="text-gray-600">Registration Fee</p>
                </div>

                <div className="space-y-4">
                  <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                    <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center justify-center">
                      Register Now <ExternalLink className="ml-2 h-4 w-4" />
                    </button>
                  </a>

                  <button
                    onClick={addToCalendar}
                    className="mt-2 w-full py-3 border border-amber-500 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Add to Calendar
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-slate-800 mb-3">Quick Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Type:</span>
                      <span className="font-medium">{event.type === "others" ? event.other_type_name : event.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team Size:</span>
                      <span className="font-medium">{event.minTeamParticipants}–{event.maxTeamParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Events */}
              <div className="bg-slate-800 rounded-xl p-6">
                <Link href="/events">
                  <button className="w-full flex items-center justify-center py-3 text-white hover:text-amber-500 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Events
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <section className="py-16 px-4 bg-slate-800">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Related Events</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedEvents.map(relatedEvent => (
                <Link key={relatedEvent.id} href={`/events/${relatedEvent.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative">
                      <Image
                        src={
                          relatedEvent.image.startsWith('http')
                            ? relatedEvent.image
                            : `http://localhost:8000/media/${relatedEvent.image.replace(/^\/?media\//, '')}`
                        }
                        alt={relatedEvent.title}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {relatedEvent.type === "others" ? relatedEvent.other_type_name : relatedEvent.type}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">{relatedEvent.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>{formatDate(relatedEvent.start_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{relatedEvent.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
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
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-amber-500 transition-colors">Home</Link></li>
                <li><Link href="/events" className="text-gray-400 hover:text-amber-500 transition-colors">Events</Link></li>
                <li><a href="/#calendar" className="text-gray-400 hover:text-amber-500 transition-colors">Calendar</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">support@evebuzz.com</li>
                <li className="text-gray-400">+91 1234567890</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-6 text-center">
            <p className="text-gray-500">© 2025 EveBuzz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
