"use client";
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowLeft,
  Image,
  Link,
  Tag,
  Upload,
  X
} from 'lucide-react';

const EventRegistrationForm = () => {
  // Updated form data state with all required fields
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    image: '',
    imageFile: null,
    imageSource: 'url', // 'url' or 'file'
    description: '',
    minTeamParticipants: '',
    maxTeamParticipants: '',
    location: '',
    start_date: '',
    end_date: '',
    price: '',
    organizer: '',
    contact_info: '',
    registrationLink: ''
  });

  // Registration status state
  const [isRegistered, setIsRegistered] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Event type options
  const eventTypes = [
    "Hackathon", "Cultural", "Sports", "Workshop", "Seminar", "Competition", "Others"
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (value) => {
    setFormData(prevState => ({
      ...prevState,
      type: value
    }));
  };

  // Handle image source change
  const handleImageSourceChange = (source) => {
    setFormData(prevState => ({
      ...prevState,
      imageSource: source,
      image: '',
      imageFile: null
    }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setFormData(prevState => ({
        ...prevState,
        imageFile: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setFormData(prevState => ({
      ...prevState,
      imageFile: null
    }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = [];

    // Check all required fields
    if (!formData.title.trim()) errors.push('Event title is required');
    if (!formData.type) errors.push('Event type is required');
  
    if (formData.imageSource === 'url' && !formData.image.trim()) {
      errors.push('Event image URL is required');
    }
    if (formData.imageSource === 'file' && !formData.imageFile) {
      errors.push('Please upload an event image');
    }
    if (!formData.description.trim()) errors.push('Event description is required');
    if (!formData.minTeamParticipants) errors.push('Minimum team participants is required');
    if (!formData.maxTeamParticipants) errors.push('Maximum team participants is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.start_date) errors.push('Start date is required');
    if (!formData.end_date) errors.push('End date is required');
    if (!formData.price.trim()) errors.push('Price is required');
    if (!formData.organizer.trim()) errors.push('Organizer is required');
    if (!formData.contact_info.trim()) errors.push('Contact information is required');
    if (!formData.registrationLink.trim()) errors.push('Registration link is required');

    // Validation for team participants
    if (formData.minTeamParticipants && formData.maxTeamParticipants) {
      if (parseInt(formData.minTeamParticipants) > parseInt(formData.maxTeamParticipants)) {
        errors.push('Minimum team participants cannot be greater than maximum team participants');
      }
    }
    
    // Validation for dates
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.push('Start date cannot be after end date');
    }

    // Validation for URL fields
    if (formData.image && !isValidUrl(formData.image)) {
      errors.push('Please enter a valid image URL');
    }
    if (formData.registrationLink && !isValidUrl(formData.registrationLink)) {
      errors.push('Please enter a valid registration link');
    }

    return errors;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
// ...existing code...

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Basic validation
  if (parseInt(formData.minTeamParticipants) > parseInt(formData.maxTeamParticipants)) {
    alert('Minimum team size cannot be greater than maximum.');
    return;
  }

  if (formData.start_date > formData.end_date) {
    alert('Start date cannot be after end date.');
    return;
  }

  let body;
  let headers = {};

  if (formData.imageSource === 'file') {
    // Use FormData for file upload
    body = new FormData();
    body.append('title', formData.title);
   
    body.append('description', formData.description);
    body.append('minTeamParticipants', formData.minTeamParticipants);
    body.append('maxTeamParticipants', formData.maxTeamParticipants);
    body.append('location', formData.location);
    body.append('start_date', formData.start_date);
    body.append('end_date', formData.end_date);
    body.append('price', formData.price);
    body.append('organizer', formData.organizer);
    body.append('contact_info', formData.contact_info);
    body.append('registrationLink', formData.registrationLink);
    if (formData.imageFile) {
      body.append('image', formData.imageFile);
    }
  } else {
    // Use JSON for URL
    body = JSON.stringify({
      title: formData.title,
      
      image: formData.image,
      description: formData.description,
      minTeamParticipants: parseInt(formData.minTeamParticipants),
      maxTeamParticipants: parseInt(formData.maxTeamParticipants),
      location: formData.location,
      start_date: formData.start_date,
      end_date: formData.end_date,
      price: parseFloat(formData.price || '0'),
      organizer: formData.organizer,
      contact_info: formData.contact_info,
      registrationLink: formData.registrationLink,
    });
    headers = { 'Content-Type': 'application/json' };
  }

  try {
    const response = await fetch('http://localhost:8000/api/events/', {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    alert('Event submitted successfully!');
    setIsRegistered(true);
  } catch (error) {
    console.error('Submission failed:', error);
    alert('Failed to submit event. Check console for details.');
  }
};


  // Handle back navigation
  const handleBack = () => {
    window.history.back();
  };

  // Success registration view
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-800 to-black p-4 relative">
        <Button 
          onClick={handleBack} 
          variant="default" 
          className="absolute top-4 left-4 z-50 bg-amber-500 text-black hover:bg-amber-400 font-semibold"
        >
          <ArrowLeft size={24} className="mr-2" />
          Back
        </Button>
        <Card className="w-full max-w-md shadow-2xl bg-white border border-amber-200">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Rocket className="mx-auto mb-4 text-amber-500" size={64} />
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-slate-800">
              Event added successfully!
            </h2>
            
            <p className="text-slate-600 mb-8 text-lg">
              Your event "{formData.title}" has been added successfully.
            </p>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => {
                  setIsRegistered(false);
                  setFormData({
                    title: '',
                    type: '',
                    image: '',
                    imageFile: null,
                    imageSource: 'url',
                    description: '',
                    minTeamParticipants: '',
                    maxTeamParticipants: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    price: '',
                    organizer: '',
                    contact_info: '',
                    registrationLink: ''
                  });
                  setImagePreview('');
                }} 
                variant="outline"
                className="w-full py-3 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-semibold"
              >
                Add another event
              </Button>
              <Button 
                onClick={handleBack} 
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold"
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
            <form encType='multipart/form-data'>

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-black flex items-center justify-center p-8 overflow-hidden relative">
      <Button 
        onClick={handleBack} 
        variant="default" 
        className="absolute top-4 left-4 z-50 bg-amber-500 text-black hover:bg-amber-400 shadow-lg font-semibold"
      >
        <ArrowLeft size={24} className="mr-2" />
        Back
      </Button>
        

      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-amber-200/50 p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-300/20 rounded-full blur-3xl"></div>

        <CardHeader className="text-center bg-gradient-to-r from-slate-800 to-black text-white py-6 rounded-t-2xl border-b-2 border-amber-400">
          <div className="flex justify-center mb-4">
            <Rocket className="text-amber-400" size={48} />
          </div>
          
          <CardTitle className="text-3xl font-bold">
            Add Your Event
          </CardTitle>
          
          <p className="text-white text-sm mt-2">
            Lock in the details for a flawless event!
          </p>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="space-y-6">
            {/* Event Title and Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <ClipboardList size={16} className="text-amber-600" />
                  Event Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-slate-600" />
                  Event Type *
                </label>
                <select 
                  value={formData.type}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

           

            {/* Image Section */}
            <div>
              <label className="block mb-2 flex items-center gap-2">
                <Image size={16} className="text-slate-600" />
                Event Image *
              </label>
              
              {/* Image source toggle */}
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => handleImageSourceChange('url')}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    formData.imageSource === 'url'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                  }`}
                >
                  <Link size={16} className="inline mr-2" />
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => handleImageSourceChange('file')}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    formData.imageSource === 'file'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
                  }`}
                >
                  <Upload size={16} className="inline mr-2" />
                  Upload File
                </button>
              </div>

              {/* Image URL input */}
              {formData.imageSource === 'url' && (
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/event-image.jpg"
                  type="url"
                  required
                  className="w-full"
                />
              )}

              {/* File upload input */}
              {formData.imageSource === 'file' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    required
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {!formData.imageFile ? (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-gray-600 mb-2">Click to upload an image</p>
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="border-amber-400 text-amber-700 hover:bg-amber-50"
                        >
                          Select Image
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
                      </div>
                    ) : (
                      <div>
                        <div className="relative inline-block">
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-xs max-h-48 rounded-lg shadow-md"
                            />
                          )}
                          <button
                            type="button"
                            onClick={removeUploadedFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-green-600 mt-2 font-medium">
                          {formData.imageFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-amber-600" />
                Location *
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event venue/location"
                required
                className="w-full"
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="block mb-2">Event Description *</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event in detail"
                required
                className="w-full min-h-[120px]"
              />
            </div>

            {/* Start Date and End Date */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-700" />
                  Start Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-amber-700" />
                  End Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Team Participants */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Users size={16} className="text-slate-600" />
                  Minimum Team Participants
                </label>
                <Input
                  type="number"
                  name="minTeamParticipants"
                  value={formData.minTeamParticipants}
                  onChange={handleChange}
                  placeholder="Minimum team size"
                  
                  min="1"
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Users size={16} className="text-amber-600" />
                  Maximum Team Participants *
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

            {/* Price and Organizer */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <span className="text-amber-600 text-lg font-semibold">₹</span>
                  Price *
                </label>
                <Input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price (e.g., Free, ₹500, ₹1000-₹1500)"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <User size={16} className="text-slate-600" />
                  Organizer *
                </label>
                <Input
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Organization/Organizer name"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Contact Info and Registration Link */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-amber-600" />
                  Contact Information *
                </label>
                <Input
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  placeholder="Email or phone number"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="relative">
                <label className="block mb-2 flex items-center gap-2">
                  <Link size={16} className="text-slate-600" />
                  Registration Link *
                </label>
                <Input
                  type="url"
                  name="registrationLink"
                  value={formData.registrationLink}
                  onChange={handleChange}
                  placeholder="https://example.com/register"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              Register Event
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
          </form>

  );
};

export default EventRegistrationForm;