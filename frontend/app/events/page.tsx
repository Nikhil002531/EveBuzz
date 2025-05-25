"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  MapPin,
  Users,
  Trash2,
  Edit,
  Filter,
  ArrowLeftRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';

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
};

const eventTypes = ["Hackathon", "Cultural", "Sports", "Workshop", "Seminar", "Competition", "Others"];

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const eventsPerPage = 6;

  // Fetch events
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/events/');

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter and sort events
  useEffect(() => {
    let result = [...events];

    // Apply type filter
    if (selectedType !== 'all') {
      result = result.filter(event =>
        event.type.toLowerCase() === selectedType.toLowerCase() ||
        (event.type === 'others' && event.other_type_name?.toLowerCase() === selectedType.toLowerCase())
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'organizer') {
      result.sort((a, b) => a.organizer.localeCompare(b.organizer));
    }

    setFilteredEvents(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [events, selectedType, searchQuery, sortBy]);

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.length > 0
    ? filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
    : [];
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Refresh event list
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
  };

  // Delete event handler
  const handleDeleteEvent = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.status}`);
      }

      // Remove the event from state
      setEvents(events.filter(event => event.id !== id));
      setDeleteConfirmId(null);
      setDeleteSuccess(`Event successfully deleted.`);

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get image URL function
  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:8000/media/${imagePath.replace(/^\/?media\//, '')}`;
  };

  // Render event type badge
  const renderEventTypeBadge = (type: string, otherTypeName?: string) => {
    const displayType = type === 'others' && otherTypeName ? otherTypeName : type;

    let badgeColor = 'bg-slate-100 text-slate-800';

    switch (type.toLowerCase()) {
      case 'hackathon':
        badgeColor = 'bg-blue-100 text-blue-800';
        break;
      case 'cultural':
        badgeColor = 'bg-purple-100 text-purple-800';
        break;
      case 'sports':
        badgeColor = 'bg-green-100 text-green-800';
        break;
      case 'workshop':
        badgeColor = 'bg-amber-100 text-amber-800';
        break;
      case 'seminar':
        badgeColor = 'bg-indigo-100 text-indigo-800';
        break;
      case 'competition':
        badgeColor = 'bg-red-100 text-red-800';
        break;
    }

    return (
      <Badge variant="outline" className={`${badgeColor} font-medium text-xs px-2 py-1 capitalize`}>
        {displayType}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-12">
         {/* Back Button */}
      <div className="mb-6">
  <Link
    href="/"
    className="inline-flex items-center gap-2 font-semibold transition-colors bg-amber-500 text-black hover:bg-amber-400 rounded-lg px-4 py-2 shadow border-none"
  >
    <ChevronLeft className="h-5 w-5" />
    Back to Home
  </Link>
</div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Registered Events</h1>
            <p className="text-gray-300">Manage and view all your registered events</p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>

            <Link href="/form">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-600 hover:to-amber-700">
                + Add New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Alert messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-start">
            <CircleAlert className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>
        )}

        {deleteSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{deleteSuccess}</p>
            <button
              onClick={() => setDeleteSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              &times;
            </button>
          </div>
        )}

        {/* Search and Filter Section */}
        <Card className="bg-white shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search events by title, description, location..."
                  className="w-full pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-slate-500" />
                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-slate-500" />
                  <select
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="organizer">Sort by Organizer</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedType !== 'all'
                ? "No events match your current filters. Try adjusting your search criteria."
                : "You haven't registered any events yet. Click the button below to add your first event."}
            </p>
            <Link href="/add-event">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-600 hover:to-amber-700">
                + Add New Event
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentEvents.map(event => (
                <Card key={event.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      {renderEventTypeBadge(event.type, event.other_type_name)}
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2">
                      <Link href={`/edit-event/${event.id}`}>
                        <Button size="sm" variant="outline" className="bg-white/90 text-slate-700 border-none hover:bg-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 text-red-500 border-none hover:bg-white hover:text-red-600"
                            onClick={() => setDeleteConfirmId(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the event "{event.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              Delete Event
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.minTeamParticipants}–{event.maxTeamParticipants} Participants</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                    <div className="flex gap-2 mt-4">
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
                        >
                          Registration Link
                        </Button>
                      </a>
                      <Link href={`/event/${event.id}`} className="flex-1">
                        <Button className="w-full bg-slate-800 text-white hover:bg-slate-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 flex items-center justify-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-amber-500 text-black' : ''
                            }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 flex items-center justify-center"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Event count */}
            <p className="text-center text-gray-300 mt-6">
              Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EventsList;
