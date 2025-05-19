"use client";
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Corrected path for Textarea component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Rocket, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Users,
  ClipboardList,
  DollarSign,
  ArrowLeft 
} from 'lucide-react';

const EventRegistrationForm = () => {
  // Initial form data state
  const [formData, setFormData] = useState({
    eventName: '',
    venue: '',
    date: '',
    time: '',
    description: '',
    organizerName: '',
    contactEmail: '',
    minTeamParticipants: '',
    maxTeamParticipants: '',
    participationFee: ''
  });

  // Registration status state
  const [isRegistered, setIsRegistered] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulated backend submission (replace with actual API call)
    console.log('Event Registration Data:', formData);
    setIsRegistered(true);
  };

  // Handle back navigation
  const handleBack = () => {
    // Replace this with your actual navigation logic
    window.history.back();
  };

  // Success registration view
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-blue-300 to-green-400 animate-gradient-x p-4 relative">
        {/* Back Button */}
        <Button 
          onClick={handleBack} 
          variant="default" 
          className="absolute top-4 left-4 z-50 bg-white text-gray-800 hover:bg-gray-100"
        >
          <ArrowLeft size={24} className="mr-2" />
          Back
        </Button>

        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <Rocket className="mx-auto mb-4 text-green-600" size={48} />
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Event added successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your event "{formData.eventName}" has been added.
            </p>
            
            <div className="flex space-x-4">
              <Button 
                onClick={() => setIsRegistered(false)} 
                variant="outline"
                className="w-full"
              >
                Add another event
              </Button>
              <Button 
                onClick={handleBack} 
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-300 to-green-400 animate-gradient-x flex items-center justify-center p-8 overflow-hidden relative">
      {/* Back Button - Positioned absolutely at top left */}
      <Button 
        onClick={handleBack} 
        variant="default" 
        className="absolute top-4 left-4 z-50 bg-white text-gray-800 hover:bg-gray-100 shadow-md"
      >
        <ArrowLeft size={24} className="mr-2" />
        Back
      </Button>

      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-8 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-300/30 rounded-full blur-3xl"></div>

        {/* Form Header */}
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 rounded-t-2xl">
          <div className="flex justify-center mb-4">
            <Rocket className="text-white" size={48} />
          </div>
          
          <CardTitle className="text-3xl font-bold">
            Add Your Event
          </CardTitle>
          
          <p className="text-white text-sm mt-2">
            Lock in the details for a flawless event!
          </p>
        </CardHeader>

        {/* Form Content */}
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name and Venue */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-500" />
                  Event Name
                </label>
                <Input
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-green-500" />
                  Venue
                </label>
                <Input
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Event location"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500" />
                  Event Date
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-red-500" />
                  Event Time
                </label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Event Description */}
            <div>
              <label className="block mb-2">Event Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event"
                required
                className="w-full min-h-[120px]"
              />
            </div>

            {/* Organizer and Contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <User size={16} className="text-teal-500" />
                  Organizer Name
                </label>
                <Input
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-orange-500" />
                  Contact Email
                </label>
                <Input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Contact email"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Team Participants */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Users size={16} className="text-indigo-500" />
                  Minimum Team Participants
                </label>
                <Input
                  type="number"
                  name="minTeamParticipants"
                  value={formData.minTeamParticipants}
                  onChange={handleChange}
                  placeholder="Minimum team size"
                  required
                  min="1"
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Users size={16} className="text-pink-500" />
                  Maximum Team Participants
                </label>
                <Input
                  type="number"
                  name="maxTeamParticipants"
                  value={formData.maxTeamParticipants}
                  onChange={handleChange}
                  placeholder="Maximum team size"
                  required
                  min="1"
                  className="w-full"
                />
              </div>
            </div>

            {/* Participation Fee */}
            <div>
            <label className="block mb-2 flex items-center gap-2">
            <span className="text-emerald-500 text-lg">₹</span>
                Entry/Participation Fee (Optional)
            </label>
              <Input
                type="number"
                name="participationFee"
                value={formData.participationFee}
                onChange={handleChange}
                placeholder="Entry fee (leave blank if free)"
                min="0"
                step="0.01"
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Register Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRegistrationForm;