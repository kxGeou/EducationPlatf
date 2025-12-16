import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCalendarStore } from '../../../../store/calendarStore';
import { useGroupStore } from '../../../../store/groupStore';
import { useNotificationStore } from '../../../../store/notificationStore';
import { Calendar, Clock, Users, User, Plus, Edit, Trash2, CheckCircle, XCircle, Eye, X, Mail, Hash, MessageSquare, Check, X as XIcon, Archive, Tag, Filter, ChevronDown, ExternalLink } from 'lucide-react';
import CustomCalendar from '../../../CalendarPage/components/CustomCalendar';
import { formatTimeRange, formatDate } from '../../../../utils/timePreferencesUtils';
import { useToast } from '../../../../context/ToastContext';
import supabase from '../../../../util/supabaseClient';

export default function CalendarSection({ timeAgo }) {
  const toast = useToast();
  const {
    availability,
    bookings,
    preferences,
    labels,
    overlappingHours,
    loading,
    fetchAllAvailability,
    fetchAllBookings,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    updateBookingStatus,
    getBookingsForSlot,
    fetchAllPreferences,
    fetchOverlappingHours,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel
  } = useCalendarStore();

  const {
    createGroup,
    assignUsersToGroup,
    fetchGroups
  } = useGroupStore();

  const {
    createNotification
  } = useNotificationStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotBookings, setSlotBookings] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    classType: 'individual',
    maxParticipants: 1,
    isWebinar: false,
    meetingLink: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'upcoming', 'archived', or 'preferences'
  
  // Preferences tab state
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showLabelsManagementModal, setShowLabelsManagementModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelFormData, setLabelFormData] = useState({ name: '', color: '' });
  const [showOverlapDetailsModal, setShowOverlapDetailsModal] = useState(false);
  const [selectedOverlap, setSelectedOverlap] = useState(null);
  const [overlapUsers, setOverlapUsers] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    discord_link: '',
    class_type: 'group',
    description: '',
    date: '',
    start_time: '',
    end_time: ''
  });
  const [preferenceFilters, setPreferenceFilters] = useState({
    classType: null, // 'individual' or 'group' or null
    meetingType: null, // 'webinar' or 'regular' or null
    topic: null // topic filter
  });
  const [openClassTypeDropdown, setOpenClassTypeDropdown] = useState(false);
  const [openTopicDropdown, setOpenTopicDropdown] = useState(false);
  const [openStartTimeDropdown, setOpenStartTimeDropdown] = useState(false);
  const [openEndTimeDropdown, setOpenEndTimeDropdown] = useState(false);
  const [openClassTypeModalDropdown, setOpenClassTypeModalDropdown] = useState(false);

  // Generate time options for dropdowns (30-minute intervals from 08:00 to 20:00)
  const timeOptions = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  useEffect(() => {
    loadData();
    if (activeTab === 'preferences') {
      loadPreferencesData();
    }
  }, [activeTab]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenClassTypeDropdown(false);
        setOpenTopicDropdown(false);
        setOpenStartTimeDropdown(false);
        setOpenEndTimeDropdown(false);
        setOpenClassTypeModalDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPreferencesData = async () => {
    try {
      await fetchAllPreferences();
      await fetchLabels();
      // Automatically calculate overlapping hours after preferences are loaded
      // Wait a bit for state to update
      setTimeout(() => {
        fetchOverlappingHours(null, null, null);
      }, 100);
    } catch (err) {
      console.error('Error loading preferences data:', err);
    }
  };

  const loadData = async () => {
    await fetchAllAvailability();
    await fetchAllBookings();
  };

  // Set default date to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const resetForm = () => {
    setFormData({
      date: getTomorrowDate(),
      startTime: '09:00',
      endTime: '10:00',
      classType: 'individual',
      maxParticipants: 1,
      isWebinar: false,
      meetingLink: ''
    });
    setFormErrors({});
    setEditingSlot(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.start_time.substring(0, 5),
      endTime: slot.end_time.substring(0, 5),
      classType: slot.class_type,
      maxParticipants: slot.max_participants,
      isWebinar: slot.is_webinar || false,
      meetingLink: slot.meeting_link || ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Auto-adjust endTime if it's before or equal to startTime
      if (field === 'startTime' && value) {
        const start = timeOptions.indexOf(value);
        const end = timeOptions.indexOf(newData.endTime);
        if (end <= start) {
          // Set endTime to one hour after startTime
          const newEndIndex = Math.min(start + 2, timeOptions.length - 1);
          newData.endTime = timeOptions[newEndIndex];
        }
      }

      // Auto-adjust maxParticipants for individual classes
      if (field === 'classType' && value === 'individual') {
        newData.maxParticipants = 1;
      } else if (field === 'classType' && value === 'group' && newData.maxParticipants <= 1) {
        newData.maxParticipants = 2;
      }

      return newData;
    });
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Trim all values
    const trimmedDate = formData.date?.trim() || '';
    const trimmedStartTime = formData.startTime?.trim() || '';
    const trimmedEndTime = formData.endTime?.trim() || '';
    const trimmedClassType = formData.classType?.trim() || '';
    const maxParticipants = parseInt(formData.maxParticipants) || 0;

    // Validate date
    if (!trimmedDate) {
      errors.date = 'Data jest wymagana';
    }

    // Validate startTime
    if (!trimmedStartTime) {
      errors.startTime = 'Godzina rozpoczęcia jest wymagana';
    }

    // Validate endTime
    if (!trimmedEndTime) {
      errors.endTime = 'Godzina zakończenia jest wymagana';
    }

    // Validate that endTime is after startTime
    if (trimmedStartTime && trimmedEndTime) {
      const start = timeOptions.indexOf(trimmedStartTime);
      const end = timeOptions.indexOf(trimmedEndTime);
      if (end <= start) {
        errors.endTime = 'Godzina zakończenia musi być po godzinie rozpoczęcia';
      }
    }

    // Validate classType
    if (!trimmedClassType || !['individual', 'group'].includes(trimmedClassType)) {
      errors.classType = 'Typ zajęć jest wymagany';
    }

    // Validate maxParticipants based on classType
    if (trimmedClassType === 'individual' && maxParticipants !== 1) {
      errors.maxParticipants = 'Zajęcia indywidualne muszą mieć dokładnie 1 uczestnika';
    } else if (trimmedClassType === 'group') {
      if (isNaN(maxParticipants) || maxParticipants < 2) {
        errors.maxParticipants = 'Zajęcia grupowe muszą mieć co najmniej 2 uczestników';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      console.log('Form data:', formData);
      return;
    }

    try {
      const maxParticipants = formData.classType === 'individual' 
        ? 1 
        : (parseInt(formData.maxParticipants) || 2);

      if (editingSlot) {
        const updateData = {
          date: formData.date.trim(),
          start_time: `${formData.startTime.trim()}:00`,
          end_time: `${formData.endTime.trim()}:00`,
          class_type: formData.classType.trim(),
          max_participants: maxParticipants,
          is_webinar: formData.isWebinar || false
        };
        
        // Add meeting_link if provided
        if (formData.meetingLink && formData.meetingLink.trim()) {
          updateData.meeting_link = formData.meetingLink.trim();
        } else {
          updateData.meeting_link = null;
        }
        
        await updateAvailability(editingSlot.id, updateData);
      } else {
        await createAvailability(
          formData.date.trim(),
          `${formData.startTime.trim()}:00`,
          `${formData.endTime.trim()}:00`,
          formData.classType.trim(),
          maxParticipants,
          formData.isWebinar || false,
          formData.meetingLink && formData.meetingLink.trim() ? formData.meetingLink.trim() : null
        );
      }

      setShowAddModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error('Error saving availability:', err);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten termin?')) {
      return;
    }

    try {
      await deleteAvailability(slotId);
      await loadData();
    } catch (err) {
      console.error('Error deleting slot:', err);
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      await updateAvailability(slot.id, {
        is_active: !slot.is_active
      });
      await loadData();
    } catch (err) {
      console.error('Error toggling slot:', err);
    }
  };

  const handleViewBookings = async (slot) => {
    setSelectedSlot(slot);
    try {
      const bookings = await getBookingsForSlot(slot.id);
      setSlotBookings(bookings || []);
      setShowBookingModal(true);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setSlotBookings([]);
      setShowBookingModal(true);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      // Refresh bookings for the slot
      if (selectedSlot) {
        const updatedBookings = await getBookingsForSlot(selectedSlot.id);
        setSlotBookings(updatedBookings || []);
      }
      await loadData();
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  // Prepare calendar events from availability
  const availabilityEvents = availability.map((slot) => {
    const start = `${slot.date}T${slot.start_time}`;
    const end = `${slot.date}T${slot.end_time}`;

    // Get booking count for this slot
    const bookingCount = bookings.filter(
      (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
    ).length;

    const isFull = bookingCount >= slot.max_participants;

    return {
      id: `availability-${slot.id}`,
      title: `${slot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'} (${bookingCount}/${slot.max_participants})`,
      start,
      end,
      backgroundColor: !slot.is_active
        ? '#9ca3af' // gray - inactive
        : isFull
        ? '#ef4444' // red - full
        : slot.class_type === 'individual'
        ? '#3b82f6' // blue - individual
        : '#8b5cf6', // purple - group
      borderColor: !slot.is_active
        ? '#9ca3af'
        : isFull
        ? '#ef4444'
        : slot.class_type === 'individual'
        ? '#3b82f6'
        : '#8b5cf6',
      extendedProps: {
        type: 'availability',
        slot,
        bookingCount,
        isFull
      }
    };
  });

  // Prepare calendar events from user preferences (yellow squares) with filters
  const filteredPreferences = (preferences || []).filter((pref) => {
    // Filter by class type (individual/group)
    if (preferenceFilters.classType) {
      const prefType = pref.preference_labels?.type;
      if (prefType !== preferenceFilters.classType) {
        return false;
      }
    }
    // Filter by topic
    if (preferenceFilters.topic) {
      const prefTopic = pref.preference_labels?.topic;
      if (prefTopic !== preferenceFilters.topic) {
        return false;
      }
    }
    return true;
  });

  const preferenceEvents = filteredPreferences.map((pref) => {
    const start = `${pref.date}T${pref.start_time}`;
    const end = `${pref.date}T${pref.end_time}`;
    const labelName = pref.preference_labels?.name || 'Preferencja';

    return {
      id: `preference-${pref.id}`,
      title: labelName,
      start,
      end,
      backgroundColor: '#fbbf24', // yellow/amber for preferences
      borderColor: '#f59e0b',
      display: 'block',
      extendedProps: {
        type: 'preference',
        preference: pref
      }
    };
  });

  // Prepare calendar events from overlapping hours (if available) with filters
  const filteredOverlappingHours = (overlappingHours || []).filter((overlap) => {
    // Filter by class type - check if any preference in overlap matches
    if (preferenceFilters.classType) {
      const overlapPrefs = preferences.filter(p => 
        overlap.user_ids?.includes(p.user_id) &&
        p.date === overlap.date &&
        p.start_time < overlap.end_time &&
        p.end_time > overlap.start_time
      );
      const hasMatchingType = overlapPrefs.some(p => 
        p.preference_labels?.type === preferenceFilters.classType
      );
      if (!hasMatchingType) {
        return false;
      }
    }
    // Filter by topic - check if any preference in overlap matches
    if (preferenceFilters.topic) {
      const overlapPrefs = preferences.filter(p => 
        overlap.user_ids?.includes(p.user_id) &&
        p.date === overlap.date &&
        p.start_time < overlap.end_time &&
        p.end_time > overlap.start_time
      );
      const hasMatchingTopic = overlapPrefs.some(p => 
        p.preference_labels?.topic === preferenceFilters.topic
      );
      if (!hasMatchingTopic) {
        return false;
      }
    }
    return true;
  });

  const overlappingEvents = filteredOverlappingHours.map((overlap, idx) => {
    const start = `${overlap.date}T${overlap.start_time}`;
    const end = `${overlap.date}T${overlap.end_time}`;

    return {
      id: `overlap-${idx}`,
      title: `${overlap.user_count} użytkowników`,
      start,
      end,
      backgroundColor: '#10b981', // green for overlapping hours
      borderColor: '#059669',
      display: 'block',
      extendedProps: {
        type: 'overlap',
        overlap
      }
    };
  });

  // Combine events based on active tab
  // For bookings tab: only show availability (admin-created meetings)
  // For preferences tab: show both individual preferences (yellow) and overlapping hours (green)
  const calendarEvents = activeTab === 'bookings' 
    ? [...availabilityEvents] 
    : [...preferenceEvents, ...overlappingEvents];

  const handleEventClick = (event) => {
    const eventType = event.extendedProps?.type;
    
    if (eventType === 'preference') {
      // Handle preference click - show users with overlapping hours
      const preference = event.extendedProps?.preference;
      if (preference) {
        handlePreferenceClick(preference);
      }
      return;
    }
    
    if (eventType === 'overlap') {
      // Show overlap details modal (only in preferences tab)
      const overlap = event.extendedProps?.overlap;
      if (overlap) {
        handleOverlapClick(overlap);
      }
      return;
    }
    
    // For availability events (bookings tab)
    const slot = event.extendedProps?.slot;
    if (slot) {
      handleViewBookings(slot);
    }
  };

  // Handle preference click - find users with overlapping hours
  const handlePreferenceClick = async (preference) => {
    if (!preference) return;

    setSelectedOverlap({
      date: preference.date,
      start_time: preference.start_time,
      end_time: preference.end_time
    });
    
    // Find all preferences that overlap with this one (including the clicked one)
    const overlappingPrefs = (preferences || []).filter((pref) => {
      // Same date
      if (pref.date !== preference.date) return false;
      // Times overlap
      const prefStart = pref.start_time;
      const prefEnd = pref.end_time;
      const selectedStart = preference.start_time;
      const selectedEnd = preference.end_time;
      
      return prefStart < selectedEnd && prefEnd > selectedStart;
    });

    // Get unique user IDs
    const userIds = [...new Set(overlappingPrefs.map(pref => pref.user_id))];
    
    // Fetch user data from Supabase to ensure we have complete information
    const usersMap = new Map();
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (!error && usersData && usersData.length > 0) {
        // Initialize users map with fetched user data
        usersData.forEach(user => {
          usersMap.set(String(user.id), {
            id: user.id,
            email: user.email || '',
            full_name: user.full_name || '',
            preferences: []
          });
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }

    // Now add preferences to users
    overlappingPrefs.forEach((pref) => {
      const prefUserId = String(pref.user_id);
      if (!usersMap.has(prefUserId)) {
        // Fallback if user data wasn't fetched
        usersMap.set(prefUserId, {
          id: pref.user_id,
          email: pref.users?.email || '',
          full_name: pref.users?.full_name || '',
          preferences: []
        });
      }
      usersMap.get(prefUserId).preferences.push({
        start_time: pref.start_time,
        end_time: pref.end_time,
        label: pref.preference_labels,
        type: pref.preference_labels?.type || 'unknown',
        topic: pref.preference_labels?.topic || ''
      });
    });

    setOverlapUsers(Array.from(usersMap.values()));
    setShowOverlapDetailsModal(true);
  };

  // Filter end time options based on selected start time
  const getEndTimeOptions = () => {
    if (!formData.startTime) return timeOptions;
    const startIndex = timeOptions.indexOf(formData.startTime);
    if (startIndex === -1) return timeOptions;
    return timeOptions.slice(startIndex + 1);
  };


  const handleLabelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLabel) {
        await updateLabel(editingLabel.id, labelFormData);
      } else {
        await createLabel(labelFormData);
      }
      setShowLabelModal(false);
      setEditingLabel(null);
      setLabelFormData({ name: '', color: '' });
      await fetchLabels();
    } catch (err) {
      // Error handled in store
    }
  };

  const handleLoadOverlapping = async () => {
    try {
      const startDate = preferenceFilters.startDate || null;
      const endDate = preferenceFilters.endDate || null;
      const labelId = preferenceFilters.labelId || null;
      
      await fetchOverlappingHours(startDate, endDate, labelId);
      setShowOverlappingView(true);
    } catch (err) {
      console.error('Error loading overlapping hours:', err);
    }
  };

  const handleOverlapClick = async (overlap) => {
    if (!overlap || !overlap.user_ids || overlap.user_ids.length === 0) {
      return;
    }

    setSelectedOverlap(overlap);
    setShowOverlapDetailsModal(true);
    setOverlapUsers([]); // Clear previous users

    // Convert all IDs to strings for reliable comparison
    const userIds = overlap.user_ids.map(id => String(id));
    const usersMap = new Map();

    // Always fetch user data from Supabase to ensure we have complete information
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (!error && usersData && usersData.length > 0) {
        // Initialize users map with fetched user data
        usersData.forEach(user => {
          usersMap.set(String(user.id), {
            id: user.id,
            email: user.email || '',
            full_name: user.full_name || '',
            preferences: []
          });
        });

        // Now match users with their preferences from the overlap
        preferences.forEach(pref => {
          const prefUserId = String(pref.user_id);
          
          // Check if this user is in the overlap
          if (userIds.includes(prefUserId) && usersMap.has(prefUserId)) {
            // Check if this preference overlaps with the selected overlap time range
            const prefStart = pref.start_time;
            const prefEnd = pref.end_time;
            const overlapStart = overlap.start_time;
            const overlapEnd = overlap.end_time;
            const sameDate = pref.date === overlap.date;
            const timesOverlap = prefStart < overlapEnd && prefEnd > overlapStart;
            
            if (sameDate && timesOverlap) {
              // Add this preference time range
              usersMap.get(prefUserId).preferences.push({
                start_time: pref.start_time,
                end_time: pref.end_time,
                label: pref.preference_labels,
                type: pref.preference_labels?.type || 'unknown',
                topic: pref.preference_labels?.topic || ''
              });
            }
          }
        });
      } else {
        console.error('Error fetching users or no users found:', error);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }

    // Convert map to array
    const finalUsersArray = Array.from(usersMap.values());
    setOverlapUsers(finalUsersArray);
  };

  const handleOpenCreateGroupModal = () => {
    if (!selectedOverlap) return;
    
    // Determine class_type from preferences
    const firstUser = overlapUsers[0];
    const firstPreference = firstUser?.preferences?.[0];
    const classType = firstPreference?.type === 'individual' ? 'individual' : 'group';
    
    setGroupFormData({
      name: `Grupa ${formatDate(selectedOverlap.date)} ${selectedOverlap.start_time.substring(0, 5)}`,
      discord_link: '',
      class_type: classType
    });
    setSelectedUsersForGroup(overlapUsers.map(u => u.id));
    setShowCreateGroupModal(true);
  };

  const handleCreateGroup = async () => {
    if (!groupFormData.name || !groupFormData.discord_link || !groupFormData.date || !groupFormData.start_time || !groupFormData.end_time) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      // Create group (skip toast - we'll show one at the end)
      const group = await createGroup({
        name: groupFormData.name,
        discord_link: groupFormData.discord_link,
        class_type: groupFormData.class_type,
        description: groupFormData.description || null,
        date: groupFormData.date,
        start_time: groupFormData.start_time + ':00', // Add seconds
        end_time: groupFormData.end_time + ':00' // Add seconds
      }, true); // skipToast = true

      // Assign users to group (skip toast - we'll show one at the end)
      if (selectedUsersForGroup.length > 0) {
        await assignUsersToGroup(group.id, selectedUsersForGroup, true); // skipToast = true

        // Create notifications for assigned users (skip toast for each)
        for (const userId of selectedUsersForGroup) {
          try {
            await createNotification({
              title: 'Zostałeś przypisany do grupy',
              message: `Zostałeś przypisany do grupy "${group.name}" na ${formatDate(group.date)} o ${group.start_time.substring(0, 5)}`,
              type: 'announcement',
              is_active: true,
              user_id: userId
            }, true); // skipToast = true
          } catch (err) {
            console.error('Error creating notification:', err);
          }
        }
      }

      setShowCreateGroupModal(false);
      setShowOverlapDetailsModal(false);
      setGroupFormData({ name: '', discord_link: '', class_type: 'group', description: '', date: '', start_time: '', end_time: '' });
      setSelectedUsersForGroup([]);
      
      // Show single success toast
      if (selectedUsersForGroup.length > 0) {
        toast.success(`Grupa "${group.name}" została utworzona i ${selectedUsersForGroup.length} użytkowników zostało przypisanych`);
      } else {
        toast.success(`Grupa "${group.name}" została utworzona`);
      }
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  return (
    <>
      {/* Modals - rendered via Portal to ensure full screen overlay */}
      {showOverlapDetailsModal && selectedOverlap && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white dark:bg-DarkblackBorder rounded shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Część wspólna godzin</h3>
                <div className="flex items-center gap-2">
                  {overlapUsers.length > 0 && (
                    <button
                      onClick={handleOpenCreateGroupModal}
                      className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md hover:opacity-90 transition flex items-center gap-2"
                    >
                      <Hash size={18} />
                      Utwórz grupę Discord
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowOverlapDetailsModal(false);
                      setSelectedOverlap(null);
                      setOverlapUsers([]);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 rounded"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data</div>
                  <div className="font-medium">
                    {formatDate(selectedOverlap.date)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Godzina</div>
                  <div className="font-medium">
                    {formatTimeRange(selectedOverlap.start_time, selectedOverlap.end_time)}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                  Użytkownicy ({overlapUsers.length})
                </div>
                {overlapUsers.length > 0 ? (
                  <div className="space-y-3">
                    {overlapUsers.map((user, idx) => {
                      const initials = user.full_name 
                        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                        : user.email 
                        ? user.email.substring(0, 2).toUpperCase()
                        : '?';
                      
                      return (
                        <div
                          key={user.id || idx}
                          className="p-5 border-2 border-gray-200 dark:border-DarkblackBorder rounded-lg shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-DarkblackText dark:to-DarkblackBorder hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                                {user.full_name || 'Brak nazwy użytkownika'}
                              </div>
                              {user.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {user.preferences && user.preferences.length > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-DarkblackBorder">
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Godziny preferencji:
                              </div>
                              <div className="space-y-2">
                                {user.preferences.map((pref, prefIdx) => (
                                  <div
                                    key={prefIdx}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-DarkblackBorder rounded-md border border-gray-200 dark:border-DarkblackText"
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {pref.start_time.substring(0, 5)} - {pref.end_time.substring(0, 5)}
                                      </span>
                                    </div>
                                    {pref.label && (
                                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {pref.label.name || `${pref.type} - ${pref.topic}`}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Ładowanie użytkowników...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Labels Management Modal */}
      {showLabelsManagementModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setShowLabelsManagementModal(false)}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blackText dark:text-white">
                  Zarządzanie etykietami
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingLabel(null);
                      setLabelFormData({ name: '', color: '' });
                      setShowLabelModal(true);
                      setShowLabelsManagementModal(false);
                    }}
                    className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md text-sm font-medium hover:opacity-90 transition"
                  >
                    Dodaj etykietę
                  </button>
                  <button
                    onClick={() => setShowLabelsManagementModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-md transition-colors"
                  >
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {labels.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">Brak etykiet. Dodaj pierwszą etykietę.</p>
              ) : (
                <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {labels.map((label) => (
                      <div
                        key={label.id}
                        className="p-4 bg-white dark:bg-DarkblackText border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {label.color && (
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: label.color }}
                            />
                          )}
                          <span className="text-gray-900 dark:text-white truncate">{label.name}</span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingLabel(label);
                              setLabelFormData({ name: label.name, color: label.color || '' });
                              setShowLabelModal(true);
                              setShowLabelsManagementModal(false);
                            }}
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                          >
                            <Edit size={16} className="text-blue-400 dark:text-blue-300" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Czy na pewno chcesz usunąć tę etykietę?')) {
                                try {
                                  await deleteLabel(label.id);
                                  await fetchLabels();
                                } catch (err) {
                                  // Error handled in store
                                }
                              }
                            }}
                            className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                          >
                            <Trash2 size={16} className="text-red-400 dark:text-red-300" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Label Modal */}
      {showLabelModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowLabelModal(false);
            setEditingLabel(null);
            setLabelFormData({ name: '', color: '' });
          }}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-md w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingLabel ? 'Edytuj etykietę' : 'Dodaj etykietę'}
                </h3>
                <button
                  onClick={() => {
                    setShowLabelModal(false);
                    setEditingLabel(null);
                    setLabelFormData({ name: '', color: '' });
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 rounded"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleLabelSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nazwa</label>
                  <input
                    type="text"
                    value={labelFormData.name}
                    onChange={(e) => setLabelFormData({ ...labelFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kolor (hex, opcjonalnie)</label>
                  <input
                    type="color"
                    value={labelFormData.color || '#3b82f6'}
                    onChange={(e) => setLabelFormData({ ...labelFormData, color: e.target.value })}
                    className="w-full h-10 border border-gray-200 dark:border-DarkblackBorder rounded-md"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLabelModal(false);
                      setEditingLabel(null);
                      setLabelFormData({ name: '', color: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-DarkblackBorder rounded-md hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md hover:opacity-90 transition"
                  >
                    {editingLabel ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-blackText dark:text-white">
          Zarządzanie kalendarzem
        </h2>
        {activeTab === 'bookings' && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md shadow-sm max-w-[300px] transition-opacity hover:opacity-90"
          >
            Dodaj termin
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-DarkblackBorder">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'bookings'
                ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Rezerwacje
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'preferences'
                ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Preferencje czasowe
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Nadchodzące terminy
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'archived'
                ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Archiwalne terminy
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'upcoming' ? (
        <div className="space-y-6">
          {/* Upcoming Terms Only */}
          {(() => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              
              const activeSlots = availability.filter((slot) => {
                const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
                return slotDateTime >= now;
              });

              const renderSlot = (slot) => {
                const bookingCount = bookings.filter(
                  (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
                ).length;
                const isFull = bookingCount >= slot.max_participants;

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg border ${
                      slot.is_active
                        ? 'bg-white dark:bg-DarkblackText border-gray-200 dark:border-DarkblackBorder'
                        : 'bg-gray-100 dark:bg-DarkblackBorder border-gray-300 dark:border-DarkblackText opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(slot.date).toLocaleDateString('pl-PL', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              slot.is_active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                            }`}
                          >
                            {slot.is_active ? 'Aktywny' : 'Nieaktywny'}
                          </span>
            </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </span>
              </div>
                          <div className="flex items-center gap-1">
                            {slot.class_type === 'individual' ? (
                              <User className="w-4 h-4" />
            ) : (
                              <Users className="w-4 h-4" />
            )}
                            <span>{slot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'}</span>
          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {bookingCount}/{slot.max_participants} {isFull && '(Pełne)'}
                            </span>
                    </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                      {slot.meeting_link && (
                        <button
                          onClick={() => window.open(slot.meeting_link, '_blank', 'noopener,noreferrer')}
                          className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                          title="Otwórz link do spotkania"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      )}
                      <button
                          onClick={() => handleViewBookings(slot)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                          title="Zobacz rezerwacje"
                      >
                          <Eye className="w-5 h-5" />
                      </button>
                      <button
                          onClick={() => openEditModal(slot)}
                          className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition"
                          title="Edytuj"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(slot)}
                          className={`p-2 rounded-md transition ${
                            slot.is_active
                              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                          }`}
                          title={slot.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                        >
                          {slot.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                          title="Usuń"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
              </div>
                );
              };

              return (
                <div className="space-y-3">
                  {activeSlots.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">Brak nadchodzących terminów</p>
                  ) : (
                    activeSlots.map(renderSlot)
              )}
            </div>
              );
            })()}
        </div>
      ) : activeTab === 'archived' ? (
        <div className="space-y-6">
          {/* Archived Terms Only */}
            {(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const archivedSlots = availability.filter((slot) => {
          const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
          return slotDateTime < now;
        });

        const renderSlot = (slot) => {
          const bookingCount = bookings.filter(
            (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
          ).length;
          const isFull = bookingCount >= slot.max_participants;

          return (
            <div
              key={slot.id}
                    className={`p-4 rounded-lg border opacity-75 ${
                slot.is_active
                  ? 'bg-white dark:bg-DarkblackText border-gray-200 dark:border-DarkblackBorder'
                  : 'bg-gray-100 dark:bg-DarkblackBorder border-gray-300 dark:border-DarkblackText opacity-60'
                    }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(slot.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        slot.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {slot.is_active ? 'Aktywny' : 'Nieaktywny'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {slot.class_type === 'individual' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span>{slot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {bookingCount}/{slot.max_participants} {isFull && '(Pełne)'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {slot.meeting_link && (
                    <button
                      onClick={() => window.open(slot.meeting_link, '_blank', 'noopener,noreferrer')}
                      className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                      title="Otwórz link do spotkania"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleViewBookings(slot)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                    title="Zobacz rezerwacje"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(slot)}
                          className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition"
                    title="Edytuj"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(slot)}
                          className={`p-2 rounded-md transition ${
                      slot.is_active
                              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                    }`}
                    title={slot.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                  >
                    {slot.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                    title="Usuń"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        };

        return (
              <div className="space-y-3">
                  {archivedSlots.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">Brak archiwalnych terminów</p>
                ) : (
                    archivedSlots.map(renderSlot)
                )}
              </div>
              );
            })()}
        </div>
      ) : activeTab === 'preferences' ? (
        <div className="space-y-6">
          {/* Filters and Labels */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Class Type Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={() => {
                  setOpenClassTypeDropdown(!openClassTypeDropdown);
                  setOpenTopicDropdown(false);
                }}
                className="px-4 py-2.5 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-DarkblackText transition"
              >
                {preferenceFilters.classType === 'individual' ? 'Indywidualne' : preferenceFilters.classType === 'group' ? 'Grupowe' : 'Typ zajęć'}
                <ChevronDown size={16} />
              </button>
              {openClassTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm z-10 min-w-[200px] animate-slideUp">
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, classType: null });
                      setOpenClassTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Wszystkie
                  </button>
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, classType: 'individual' });
                      setOpenClassTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Indywidualne
                  </button>
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, classType: 'group' });
                      setOpenClassTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Grupowe
                  </button>
                </div>
              )}
            </div>

            {/* Topic Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={() => {
                  setOpenTopicDropdown(!openTopicDropdown);
                  setOpenClassTypeDropdown(false);
                }}
                className="px-4 py-2.5 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-DarkblackText transition"
              >
                {preferenceFilters.topic || 'Temat zajęć'}
                <ChevronDown size={16} />
              </button>
              {openTopicDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm z-10 min-w-[200px] animate-slideUp">
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, topic: null });
                      setOpenTopicDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Wszystkie
                  </button>
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, topic: 'inf 0.3' });
                      setOpenTopicDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    inf 0.3
                  </button>
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, topic: 'inf 0.4' });
                      setOpenTopicDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    inf 0.4
                  </button>
                  <button
                    onClick={() => {
                      setPreferenceFilters({ ...preferenceFilters, topic: 'matura z informatyki' });
                      setOpenTopicDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Matura z informatyki
                  </button>
                </div>
              )}
              </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setPreferenceFilters({ classType: null, meetingType: null, topic: null });
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-DarkblackBorder rounded-md hover:bg-gray-100 dark:hover:bg-DarkblackText transition text-sm"
            >
              Wyczyść filtry
            </button>

            {/* Labels Section */}
            <div className="flex items-center gap-2 ml-auto">
              {labels.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {labels.slice(0, 3).map((label) => (
                    <div
                      key={label.id}
                      className="px-3 py-1.5 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm flex items-center gap-2"
                    >
                      {label.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label.name}</span>
                    </div>
                  ))}
                  {labels.length > 3 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">+{labels.length - 3}</span>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowLabelsManagementModal(true)}
                className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md text-sm font-medium hover:opacity-90 transition"
              >
                Zarządzaj etykietami
              </button>
            </div>
          </div>

          {/* Calendar - Full Width, No Box */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto"></div>
            </div>
          ) : (
            <CustomCalendar
              events={calendarEvents}
              onEventClick={handleEventClick}
              selectable={false}
            />
          )}
        </div>
      ) : (
        <>
          {/* Calendar only for bookings tab */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
            </div>
          )}

          {!loading && (
            <CustomCalendar
              events={calendarEvents}
              onEventClick={handleEventClick}
              selectable={false}
            />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blackText dark:text-white">
                {editingSlot ? 'Edytuj termin' : 'Dodaj nowy termin'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-md transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date || getTomorrowDate()}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white ${
                    formErrors.date ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
              </div>

              {/* Start Time */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Godzina rozpoczęcia <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenStartTimeDropdown(!openStartTimeDropdown);
                    setOpenEndTimeDropdown(false);
                    setOpenClassTypeModalDropdown(false);
                  }}
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md bg-white dark:bg-DarkblackText text-left flex items-center justify-between ${
                    formErrors.startTime ? 'border-red-500' : ''
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">{formData.startTime || 'Wybierz godzinę'}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {openStartTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm z-10 max-h-[200px] overflow-y-auto animate-slideUp">
                  {timeOptions.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          handleFormChange('startTime', time);
                          setOpenStartTimeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                      >
                      {time}
                      </button>
                  ))}
                  </div>
                )}
                {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
              </div>

              {/* End Time */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Godzina zakończenia <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenEndTimeDropdown(!openEndTimeDropdown);
                    setOpenStartTimeDropdown(false);
                    setOpenClassTypeModalDropdown(false);
                  }}
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md bg-white dark:bg-DarkblackText text-left flex items-center justify-between ${
                    formErrors.endTime ? 'border-red-500' : ''
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">{formData.endTime || 'Wybierz godzinę'}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {openEndTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm z-10 max-h-[200px] overflow-y-auto animate-slideUp">
                  {getEndTimeOptions().map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          handleFormChange('endTime', time);
                          setOpenEndTimeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                      >
                      {time}
                      </button>
                  ))}
                  </div>
                )}
                {formErrors.endTime && <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>}
              </div>

              {/* Class Type */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Typ zajęć <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenClassTypeModalDropdown(!openClassTypeModalDropdown);
                    setOpenStartTimeDropdown(false);
                    setOpenEndTimeDropdown(false);
                  }}
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md bg-white dark:bg-DarkblackText text-left flex items-center justify-between ${
                    formErrors.classType ? 'border-red-500' : ''
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">
                    {formData.classType === 'individual' ? 'Indywidualne' : formData.classType === 'group' ? 'Grupowe' : 'Wybierz typ'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {openClassTypeModalDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-DarkblackBorder border border-gray-200 dark:border-DarkblackBorder rounded-md shadow-sm z-10 animate-slideUp">
                    <button
                      type="button"
                      onClick={() => {
                        handleFormChange('classType', 'individual');
                        setOpenClassTypeModalDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                    >
                      Indywidualne
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleFormChange('classType', 'group');
                        setOpenClassTypeModalDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                    >
                      Grupowe
                    </button>
                  </div>
                )}
                {formErrors.classType && <p className="text-red-500 text-xs mt-1">{formErrors.classType}</p>}
              </div>

              {/* Max Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maksymalna liczba uczestników <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => handleFormChange('maxParticipants', e.target.value)}
                  min={formData.classType === 'individual' ? 1 : 2}
                  max={50}
                  disabled={formData.classType === 'individual'}
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white ${
                    formErrors.maxParticipants ? 'border-red-500' : ''
                  } ${formData.classType === 'individual' ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {formErrors.maxParticipants && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.maxParticipants}</p>
                )}
                {formData.classType === 'individual' && (
                  <p className="text-gray-500 text-xs mt-1">Zajęcia indywidualne mają zawsze 1 uczestnika</p>
                )}
              </div>

              {/* Is Webinar */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isWebinar"
                  checked={formData.isWebinar}
                  onChange={(e) => handleFormChange('isWebinar', e.target.checked)}
                  className="w-5 h-5 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                />
                <label htmlFor="isWebinar" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  To jest webinar (będzie widoczny w powiadomieniach)
                </label>
              </div>

              {/* Meeting Link */}
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link do spotkania (np. Discord, Zoom)
                </label>
                <input
                  type="url"
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => handleFormChange('meetingLink', e.target.value)}
                  placeholder="https://discord.gg/..."
                  className={`w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white ${
                    formErrors.meetingLink ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.meetingLink && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.meetingLink}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Opcjonalne - po kliknięciu w termin użytkownik zostanie przekierowany do tego linku</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md hover:opacity-90 transition"
                >
                  {editingSlot ? 'Zapisz zmiany' : 'Dodaj termin'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Bookings Modal */}
      {showBookingModal && selectedSlot && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
            setSlotBookings([]);
          }}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rezerwacje dla terminu
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Zobacz wszystkich uczestników tego terminu
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                    setSlotBookings([]);
                  }}
                  className="p-2 hover:bg-white/50 dark:hover:bg-DarkblackText/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Slot Info */}
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Data i godzina:</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {new Date(selectedSlot.date).toLocaleDateString('pl-PL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mt-1">
                          {selectedSlot.start_time.substring(0, 5)} - {selectedSlot.end_time.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        {selectedSlot.class_type === 'individual' ? (
                          <User className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Users className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedSlot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Zarezerwowanych: <span className="font-bold text-blue-600 dark:text-blue-400">{slotBookings.length}/{selectedSlot.max_participants}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {slotBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Brak rezerwacji</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Nikt jeszcze nie zarezerwował tego terminu</p>
                  </div>
                ) : (
                  slotBookings.map((booking) => {
                    // booking.users to obiekt z danymi użytkownika pobranymi z tabeli users
                    const user = booking.users || {};
                    // Pobierz dane - zawsze wyświetlaj co jest dostępne
                    const userName = user?.full_name || '';
                    const userEmail = user?.email || '';
                    const userId = user?.id || booking.user_id;
                    // Generuj inicjały dla avatara
                    const initials = userName 
                      ? userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                      : userEmail 
                      ? userEmail.substring(0, 2).toUpperCase()
                      : '?';

                    return (
                      <div
                        key={booking.id}
                        className="p-5 bg-white dark:bg-DarkblackText rounded-xl border border-gray-200 dark:border-DarkblackBorder shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {initials}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                                  {userName || 'Brak nazwy użytkownika'}
                                </h4>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  {userEmail && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                      <Mail className="w-4 h-4" />
                                      <span className="truncate max-w-[200px]">{userEmail}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                                    <Hash className="w-4 h-4" />
                                    <span className="font-mono text-xs">{userId.substring(0, 8)}...</span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                  booking.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                    : booking.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                }`}
                              >
                                {booking.status === 'confirmed'
                                  ? '✓ Potwierdzone'
                                  : booking.status === 'cancelled'
                                  ? '✕ Anulowane'
                                  : '⏳ Oczekujące'}
                              </span>
                            </div>

                            {/* Notes */}
                            {booking.notes && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-DarkblackBorder rounded-lg border border-gray-200 dark:border-DarkblackText">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notatka:</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{booking.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-DarkblackText">
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Utworzono: {timeAgo(booking.created_at)}</span>
                              </div>

                              {/* Action buttons */}
                              {booking.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                                  >
                                    <Check className="w-4 h-4" />
                                    Potwierdź
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                                  >
                                    <XIcon className="w-4 h-4" />
                                    Anuluj
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && selectedOverlap && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white dark:bg-DarkblackBorder rounded shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Utwórz grupę Discord</h3>
                  <button
                    onClick={() => {
                      setShowCreateGroupModal(false);
                      setGroupFormData({ name: '', discord_link: '', class_type: 'group', description: '', date: '', start_time: '', end_time: '' });
                      setSelectedUsersForGroup([]);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 rounded"
                  >
                    <X size={24} />
                  </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nazwa grupy *
                  </label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                    placeholder="Nazwa grupy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link Discord *
                  </label>
                  <input
                    type="url"
                    value={groupFormData.discord_link}
                    onChange={(e) => setGroupFormData({ ...groupFormData, discord_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                    placeholder="https://discord.gg/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Typ zajęć
                  </label>
                  <select
                    value={groupFormData.class_type}
                    onChange={(e) => setGroupFormData({ ...groupFormData, class_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                  >
                    <option value="group">Grupowe</option>
                    <option value="individual">Indywidualne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opis (opcjonalnie)
                  </label>
                  <textarea
                    value={groupFormData.description}
                    onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                    placeholder="Dodatkowe informacje o grupie..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={groupFormData.date}
                    onChange={(e) => setGroupFormData({ ...groupFormData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Godzina rozpoczęcia *
                    </label>
                    <input
                      type="time"
                      value={groupFormData.start_time}
                      onChange={(e) => setGroupFormData({ ...groupFormData, start_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Godzina zakończenia *
                    </label>
                    <input
                      type="time"
                      value={groupFormData.end_time}
                      onChange={(e) => setGroupFormData({ ...groupFormData, end_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Użytkownicy do przypisania ({selectedUsersForGroup.length})
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-DarkblackBorder rounded-md p-3 space-y-2">
                    {overlapUsers.map((user) => (
                      <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-DarkblackText rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsersForGroup.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsersForGroup([...selectedUsersForGroup, user.id]);
                            } else {
                              setSelectedUsersForGroup(selectedUsersForGroup.filter(id => id !== user.id));
                            }
                          }}
                          className="w-4 h-4 text-primaryBlue dark:text-primaryGreen"
                        />
                        <span className="text-sm">{user.full_name || user.email || 'Brak nazwy'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateGroupModal(false);
                      setGroupFormData({ name: '', discord_link: '', class_type: 'group', description: '', date: '', start_time: '', end_time: '' });
                      setSelectedUsersForGroup([]);
                    }}
                    className="px-6 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="px-6 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md hover:opacity-90 transition"
                  >
                    Utwórz grupę
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    </>
  );
}

