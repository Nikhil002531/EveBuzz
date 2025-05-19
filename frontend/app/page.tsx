'use client'
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ArrowRight, Search, Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Sample event data
const upcomingEvents = [
  {
    id: 1,
    title: "TechHacks 2025",
    type: "Hackathon",
    date: "May 28-30, 2025",
    location: "Engineering Block, MIT",
    image: "/istockphoto-1125107251-612x612.jpg",
    attendees: 120,
    startDate: new Date(2025, 4, 28), // May 28, 2025
    endDate: new Date(2025, 4, 30)    // May 30, 2025
  },
  {
    id: 2,
    title: "Cultural Fusion Festival",
    type: "Cultural",
    date: "June 3-5, 2025",
    location: "Main Auditorium, Stanford",
    image: "/istockphoto-1125107251-612x612.jpg",
    attendees: 350,
    startDate: new Date(2025, 5, 3),  // June 3, 2025
    endDate: new Date(2025, 5, 5)     // June 5, 2025
  },
  {
    id: 3,
    title: "Inter-College Basketball Tournament",
    type: "Sports",
    date: "June 10-12, 2025",
    location: "Sports Complex, UCLA",
    image: "/istockphoto-1125107251-612x612.jpg",
    attendees: 200,
    startDate: new Date(2025, 5, 10), // June 10, 2025
    endDate: new Date(2025, 5, 12)    // June 12, 2025
  },
  {
    id: 4,
    title: "Coding Workshop",
    type: "Workshop",
    date: "May 25, 2025",
    location: "Computer Science Department, Berkeley",
    image: "/istockphoto-1125107251-612x612.jpg",
    attendees: 80,
    startDate: new Date(2025, 4, 25), // May 25, 2025
    endDate: new Date(2025, 4, 25)    // May 25, 2025
  },
  {
    id: 5,
    title: "Science Fair",
    type: "Competition",
    date: "June 15, 2025",
    location: "Science Building, Harvard",
    image: "/istockphoto-1125107251-612x612.jpg",
    attendees: 150,
    startDate: new Date(2025, 5, 15), // June 15, 2025
    endDate: new Date(2025, 5, 15)    // June 15, 2025
  }
];

const eventTypes = ["Hackathon", "Workshop", "Seminar", "Cultural", "Sports", "Competition"];

export default function EveBuzzLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

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
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date has events
  const hasEvents = (date) => {
    return upcomingEvents.some(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      
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
  const getEventsForDate = (date) => {
    return upcomingEvents.filter(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      
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
  const handleDateClick = (date) => {
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
            ${isToday ? 'bg-indigo-100 text-indigo-800' : ''}
            ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}
          `}
          onClick={() => handleDateClick(date)}
        >
          {day}
          {dateHasEvents && (
            <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-500"></div>
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
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-bold">
              {monthNames[month]} {year}
            </h3>
            <button 
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
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
        <h3 className="text-lg font-bold mb-4">
          Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <div className="space-y-4">
          {eventsForSelectedDate.map(event => (
            <div key={event.id} className="border-l-4 border-indigo-500 pl-4 py-2">
              <h4 className="font-semibold">{event.title}</h4>
              <div className="flex flex-col text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{event.attendees} Attending</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full">{event.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">EveBuzz</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <a href="#home" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</a>
            <a href="#events" className="text-gray-700 hover:text-indigo-600 transition-colors">Events</a>
            <a href="#calendar" className="text-gray-700 hover:text-indigo-600 transition-colors">Calendar</a>
            <a href="#colleges" className="text-gray-700 hover:text-indigo-600 transition-colors">Colleges</a>
            <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors">About</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden md:block px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">Sign In</button>
            <button className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-colors">Register</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-24 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Campus Events</span> All in One Place
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Never miss another hackathon, sports meet, or cultural fest. EveBuzz connects students to all college events happening in your region.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center">
                    Explore Events <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                    How It Works
                  </button>
                </div>
              </div>

              <div className="mt-10 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Trusted by <span className="font-semibold">25,000+</span> students</p>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative w-full max-w-md mx-auto lg:ml-auto rounded-2xl overflow-hidden shadow-2xl transform lg:translate-x-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl"></div>
                <img src="/istockphoto-1125107251-612x612.jpg" alt="EveBuzz App Demo" className="w-full rounded-2xl" />

                <div className="absolute top-4 left-4 right-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">TechHacks 2025</h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>May 28-30</span>
                      </div>
                    </div>
                    <button className="px-2 py-1 bg-indigo-600 text-xs text-white rounded">Register</button>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 h-32 w-32 md:h-40 md:w-40 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-20"></div>
              <div className="absolute top-1/2 -right-4 h-24 w-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search events, colleges, or categories..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700">
                  <option value="">All Categories</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700">
                  <option value="">All Locations</option>
                  <option value="MIT">MIT</option>
                  <option value="Stanford">Stanford</option>
                  <option value="UCLA">UCLA</option>
                </select>

                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Find Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Events */}
      <section id="events" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Events</h2>
              <p className="text-gray-600 max-w-2xl">Discover the hottest events happening across college campuses near you.</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                className={`px-4 py-2 rounded-full ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              {['Hackathon', 'Cultural', 'Sports'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full ${activeTab === tab.toLowerCase() ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 3).map(event => (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {event.type}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{event.title}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.attendees} Attending</span>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-gray-100 text-indigo-600 font-medium rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
              View All Events
            </button>
          </div>
        </div>
      </section>

      {/* Events Calendar Section */}
      <section id="calendar" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Events Calendar</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our calendar to find upcoming events and plan your schedule. Click on dates to see details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {renderCalendar()}
              <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
                <h4 className="font-medium mb-2">Calendar Legend</h4>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600">Event scheduled</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-5 w-5 rounded-full border border-indigo-600 bg-indigo-600"></div>
                  <span className="text-sm text-gray-600">Selected date</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {renderEventsForSelectedDate()}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How EveBuzz Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple process to discover, register, and engage with college events in your region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="h-10 w-10 text-indigo-600" />,
                title: "Discover Events",
                description: "Find relevant events based on your interests, location, and college."
              },
              {
                icon: <CalendarIcon className="h-10 w-10 text-indigo-600" />,
                title: "Register & Save",
                description: "Quick registration process with calendar integration to never miss an event."
              },
              {
                icon: <Bell className="h-10 w-10 text-indigo-600" />,
                title: "Get Updates",
                description: "Receive timely notifications about event changes and important announcements."
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md relative">
                <div className="absolute -top-5 left-8 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {index + 1}
                </div>
                <div className="mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">EveBuzz</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting students with college events happening in their region.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"></div>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"></div>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Calendar</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Colleges</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">support@evebuzz.com</li>
                <li className="text-gray-400">+1 (555) 123-4567</li>
                <li className="text-gray-400">123 Campus Drive, San Francisco, CA 94107</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-6 text-center">
            <p className="text-gray-500">© 2025 EveBuzz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )};