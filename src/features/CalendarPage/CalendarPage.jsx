import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendarStore } from '../../store/calendarStore';
import { useGroupStore } from '../../store/groupStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import PageLayout from '../../components/systemLayouts/PageLayout';
import { Calendar, Clock, Users, User, X, LogIn, Archive, ExternalLink, Hash, Edit } from 'lucide-react';
import CustomCalendar from './components/CustomCalendar';
import './CalendarPage.css';

export default function CalendarPage({ isDark, setIsDark }) {
  const { user } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const {
    availability,
    bookings,
    preferences,
    labels,
    loading,
    fetchAvailability,
    fetchUserBookings,
    createBooking,
    cancelBooking,
    fetchUserPreferences,
    fetchLabels,
    createPreference,
    updatePreference,
    deletePreference,
    createLabel,
    getNextWebinar
  } = useCalendarStore();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const [bookingType, setBookingType] = useState('individual');
  const [bookingNotes, setBookingNotes] = useState('');
  const [preferenceDescription, setPreferenceDescription] = useState('');
  const [preferenceLabelId, setPreferenceLabelId] = useState('');
  const [preferenceTypes, setPreferenceTypes] = useState([]); // Tablica wybranych typów (dla tworzenia)
  const [preferenceTopics, setPreferenceTopics] = useState([]); // Tablica wybranych tematów (dla tworzenia)
  const [preferenceType, setPreferenceType] = useState('individual'); // Pojedynczy typ (dla edycji)
  const [preferenceTopic, setPreferenceTopic] = useState(''); // Pojedynczy temat (dla edycji)
  const [nextWebinar, setNextWebinar] = useState(null);
  const [showEditPreferenceModal, setShowEditPreferenceModal] = useState(false);
  const [showPreferenceInfoModal, setShowPreferenceInfoModal] = useState(false);
  const [viewingPreference, setViewingPreference] = useState(null);
  const [editingPreference, setEditingPreference] = useState(null);
  const [calendarDate, setCalendarDate] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'preferences', or 'groups'
  
  const {
    userGroups,
    loading: groupsLoading,
    newGroupsCount,
    fetchUserGroups,
    markGroupsAsViewed
  } = useGroupStore();

  useEffect(() => {
    // Fetch availability for the next 7 days (available for everyone)
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const endDateStr = endDate.toISOString().split('T')[0];

    fetchAvailability(startDate, endDateStr);
    fetchLabels();
    
    // Fetch next webinar
    getNextWebinar().then(webinar => {
      setNextWebinar(webinar);
    });

    // Fetch user bookings and preferences only if user is logged in
    if (user) {
      fetchUserBookings(user.id);
      // Fetch user's own preferences for display (without date limit to show all preferences)
      fetchUserPreferences(user.id, null, null);
      // Fetch user's groups
      fetchUserGroups(user.id);
    }
  }, [user]);


  const handleSlotClick = (slot) => {
    // If user is not logged in, show booking modal with login prompt
    if (!user) {
      setSelectedSlot(slot);
      setBookingType(slot.class_type);
      setShowBookingModal(true);
      return;
    }

    // Check if user already has a booking for this slot
    const existingBooking = bookings.find(
      (b) => b.availability_id === slot.id && b.status !== 'cancelled'
    );

    if (existingBooking) {
      toast.error('Masz już rezerwację na ten termin');
      return;
    }

    // Check current bookings count
    const currentBookings = bookings.filter(
      (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
    ).length;

    if (currentBookings >= slot.max_participants) {
      toast.error('Ten termin jest już zajęty');
      return;
    }

    setSelectedSlot(slot);
    setBookingType(slot.class_type);
    setShowBookingModal(true);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    // If user is not logged in, redirect to login
    if (!user) {
      navigate('/authentication?returnTo=/calendar');
      return;
    }

    try {
      await createBooking(selectedSlot.id, user.id, bookingType, bookingNotes);
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingNotes('');
      // Refresh bookings
      await fetchUserBookings(user.id);
      // Refresh availability to update booking counts
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const endDateStr = endDate.toISOString().split('T')[0];
      await fetchAvailability(startDate, endDateStr);
    } catch (err) {
      console.error('Error booking slot:', err);
    }
  };

  const handleLoginToBook = () => {
    navigate('/authentication?returnTo=/calendar');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!user) return;

    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) {
      return;
    }

    try {
      await cancelBooking(bookingId, user.id);
      // Refresh bookings
      await fetchUserBookings(user.id);
      // Refresh availability
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const endDateStr = endDate.toISOString().split('T')[0];
      await fetchAvailability(startDate, endDateStr);
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  // Handle time selection (click and drag) for preferences
  const handleSelect = (selectInfo) => {
    if (!user) {
      toast.error('Zaloguj się, aby dodać preferencje czasowe');
      selectInfo.view.calendar.unselect();
      return;
    }

    const start = selectInfo.start;
    const end = selectInfo.end;
    const date = start.toISOString().split('T')[0];
    
    // Format time properly
    const startHours = start.getHours().toString().padStart(2, '0');
    const startMinutes = start.getMinutes().toString().padStart(2, '0');
    const endHours = end.getHours().toString().padStart(2, '0');
    const endMinutes = end.getMinutes().toString().padStart(2, '0');
    
    const startTime = `${startHours}:${startMinutes}`;
    const endTime = `${endHours}:${endMinutes}`;

    setSelectedTimeRange({ date, startTime, endTime, start, end });
    setShowPreferenceModal(true);
  };

  const handleCreatePreference = async () => {
    if (!selectedTimeRange || !user || preferenceTypes.length === 0 || preferenceTopics.length === 0) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      // Generate all combinations of selected types and topics
      const combinations = [];
      for (const type of preferenceTypes) {
        for (const topic of preferenceTopics) {
          combinations.push({ type, topic });
        }
      }

      // Always create recurring preferences for 2 months (8-9 weeks) ahead
      // Parse the date string (YYYY-MM-DD) in local timezone to avoid timezone issues
      const [year, month, day] = selectedTimeRange.date.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed
      
      // Generate dates for the next 2 months (8-9 weeks, depending on the day)
      const dates = [];
      const twoMonthsFromNow = new Date(selectedDate);
      twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
      
      // Start from the selected date and create preferences for every occurrence of this weekday
      let currentDate = new Date(selectedDate);
      while (currentDate <= twoMonthsFromNow) {
        // Format date as YYYY-MM-DD in local timezone
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
        // Move to next week (same weekday)
        currentDate.setDate(currentDate.getDate() + 7);
      }

      // Create preferences for all combinations and dates
      let createdCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (const combination of combinations) {
        // Find or create label for this combination
        let labelId = null;
        const existingLabel = labels.find(
          l => l.type === combination.type && l.topic === combination.topic
        );
        
        if (existingLabel) {
          labelId = existingLabel.id;
        } else {
          // Create new label
          try {
            const newLabel = await createLabel({
              name: `${combination.type === 'individual' ? 'Indywidualne' : 'Grupowe'} - ${combination.topic}`,
              type: combination.type,
              topic: combination.topic,
              color: combination.type === 'individual' ? '#3b82f6' : '#8b5cf6'
            });
            labelId = newLabel.id;
            // Refresh labels to include the new one
            await fetchLabels();
          } catch (err) {
            console.error('Error creating label:', err);
            errorCount++;
            errors.push(`Błąd tworzenia etykiety: ${err.message || 'Nieznany błąd'}`);
            continue;
          }
        }
        
        // Create preferences for all dates for this combination
        for (const date of dates) {
          try {
            await createPreference({
              userId: user.id,
              labelId: labelId,
              date: date,
              startTime: selectedTimeRange.startTime + ':00',
              endTime: selectedTimeRange.endTime + ':00',
              description: preferenceDescription || null,
              skipToast: true // Skip individual toasts
            });
            createdCount++;
          } catch (err) {
            errorCount++;
            errors.push(err.message || 'Nieznany błąd');
            console.error('Error creating recurring preference for date', date, ':', err);
          }
        }
      }
      
      // Show single summary toast
      if (createdCount > 0) {
        const dayName = new Date(selectedTimeRange.date).toLocaleDateString('pl-PL', { weekday: 'long' });
        if (errorCount > 0) {
          toast.success(`Utworzono ${createdCount} preferencji cyklicznych na wszystkie ${dayName} przez 2 miesiące (${errorCount} błędów)`);
        } else {
          toast.success(`Utworzono ${createdCount} preferencji cyklicznych na wszystkie ${dayName} przez 2 miesiące`);
        }
        // Refresh preferences after creating multiple to ensure all are loaded from database
        // This ensures consistency and that all preferences are visible
        await fetchUserPreferences(user.id, null, null);
      } else {
        const errorMsg = errors.length > 0 ? errors.slice(0, 3).join(', ') : 'Nieznany błąd';
        toast.error(`Nie udało się utworzyć preferencji cyklicznych. Błędy: ${errorMsg}`);
      }
      
      // Refresh labels (preferences are already updated in store by createPreference)
      await fetchLabels();
      
      // Reset form
      setShowPreferenceModal(false);
      setSelectedTimeRange(null);
      setPreferenceDescription('');
      setPreferenceLabelId('');
      setPreferenceTypes([]);
      setPreferenceTopics([]);
    } catch (err) {
      // Error handled in store
    }
  };

  const handleDeletePreference = async (preferenceId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę preferencję?')) {
      return;
    }

    try {
      await deletePreference(preferenceId);
      await fetchUserPreferences(user.id, null, null);
      setShowEditPreferenceModal(false);
      setEditingPreference(null);
    } catch (err) {
      // Error handled in store
    }
  };

  const handleUpdatePreference = async () => {
    if (!selectedTimeRange || !user || !preferenceTopic || !editingPreference) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      // First, find or create label with type and topic
      let labelId = preferenceLabelId;
      
      if (!labelId) {
        // Check if label with this type and topic exists
        const existingLabel = labels.find(
          l => l.type === preferenceType && l.topic === preferenceTopic
        );
        
        if (existingLabel) {
          labelId = existingLabel.id;
        } else {
          // Create new label
          const newLabel = await createLabel({
            name: `${preferenceType === 'individual' ? 'Indywidualne' : 'Grupowe'} - ${preferenceTopic}`,
            type: preferenceType,
            topic: preferenceTopic,
            color: preferenceType === 'individual' ? '#3b82f6' : '#8b5cf6'
          });
          labelId = newLabel.id;
        }
      }

      await updatePreference(editingPreference.id, {
        date: selectedTimeRange.date,
        start_time: selectedTimeRange.startTime + ':00',
        end_time: selectedTimeRange.endTime + ':00',
        label_id: labelId,
        description: preferenceDescription || null
      });
      
      setShowEditPreferenceModal(false);
      setEditingPreference(null);
      setSelectedTimeRange(null);
      setPreferenceDescription('');
      setPreferenceLabelId('');
      setPreferenceType('individual');
      setPreferenceTopic('');
      await fetchUserPreferences(user.id, null, null);
      await fetchLabels();
      toast.success('Preferencja została zaktualizowana');
    } catch (err) {
      // Error handled in store
    }
  };

  // Handle preference click - show info modal for user's own preference
  const handlePreferenceClick = (preference) => {
    if (!preference || !user) return;
    
    // Check if this is user's own preference
    if (preference.user_id !== user.id) {
      toast.error('Możesz zobaczyć tylko swoje preferencje');
      return;
    }

    // Use allPreferences if already provided, otherwise find them
    const allPreferences = preference.allPreferences || preferences.filter(pref => 
      String(pref.user_id) === String(user.id) &&
      pref.date === preference.date &&
      pref.start_time === preference.start_time &&
      pref.end_time === preference.end_time
    );

    // Show info modal with all preferences for this slot
    setViewingPreference({
      ...preference,
      allPreferences: allPreferences
    });
    setShowPreferenceInfoModal(true);
  };

  // Handle edit button click - open edit modal
  const handleEditPreferenceClick = (preference) => {
    if (!preference) return;

    setShowPreferenceInfoModal(false);
    setEditingPreference(preference);
    setPreferenceType(preference.preference_labels?.type || 'individual');
    setPreferenceTopic(preference.preference_labels?.topic || '');
    setPreferenceDescription(preference.description || '');
    setPreferenceLabelId(preference.label_id || '');
    
    const date = new Date(preference.date);
    const startTime = preference.start_time.substring(0, 5);
    const endTime = preference.end_time.substring(0, 5);
    
    setSelectedTimeRange({
      date: preference.date,
      startTime,
      endTime,
      start: new Date(`${preference.date}T${preference.start_time}`),
      end: new Date(`${preference.date}T${preference.end_time}`)
    });
    
    setShowEditPreferenceModal(true);
  };

  // Prepare calendar events from availability
  const availabilityEvents = availability
    .filter((slot) => slot.is_active)
    .map((slot) => {
      const start = `${slot.date}T${slot.start_time}`;
      const end = `${slot.date}T${slot.end_time}`;

      // Get booking count for this slot
      const bookingCount = user 
        ? bookings.filter(
            (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
          ).length
        : 0;

      const isFull = bookingCount >= slot.max_participants;
      const userHasBooking = user && bookings.some(
        (b) => b.availability_id === slot.id && b.status !== 'cancelled' && b.user_id === user.id
      );
      const isWebinar = slot.is_webinar === true;

      return {
        id: `availability-${slot.id}`,
        title: isWebinar 
          ? `Webinar (${bookingCount}/${slot.max_participants})`
          : `${slot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'} (${bookingCount}/${slot.max_participants})`,
        start,
        end,
        backgroundColor: isWebinar
          ? (userHasBooking
              ? '#f59e0b' // orange/gold for webinar with booking
              : '#f97316') // bright orange for webinar
          : (userHasBooking
              ? '#10b981' // green - user has booking
              : isFull
              ? '#ef4444' // red - full
              : slot.class_type === 'individual'
              ? '#3b82f6' // blue - individual available
              : '#8b5cf6'), // purple - group available
        borderColor: isWebinar
          ? '#ea580c' // darker orange border for webinar
          : (userHasBooking
              ? '#10b981'
              : isFull
              ? '#ef4444'
              : slot.class_type === 'individual'
              ? '#3b82f6'
              : '#8b5cf6'),
        borderWidth: isWebinar ? '2px' : '1px',
        extendedProps: {
          type: 'availability',
          slot,
          bookingCount,
          isFull,
          userHasBooking,
          meetingLink: slot.meeting_link,
          isWebinar
        }
      };
    });

  // Prepare calendar events from user preferences - group by time slot
  const preferenceEvents = React.useMemo(() => {
    if (!user || !preferences || preferences.length === 0) {
      return [];
    }

    const currentUserId = String(user.id);
    
    // Filter user preferences
    const userPrefs = preferences.filter(pref => {
      if (!pref.user_id) {
        return false;
      }
      const prefUserId = String(pref.user_id);
      return prefUserId === currentUserId;
    });

    // Group preferences by date and time slot
    const groupedPrefs = new Map();
    
    userPrefs.forEach((pref) => {
      if (!pref.date || !pref.start_time || !pref.end_time) {
        console.warn('Preference missing required fields:', pref);
        return;
      }
      
      const startTime = pref.start_time.substring(0, 5);
      const endTime = pref.end_time.substring(0, 5);
      const slotKey = `${pref.date}-${startTime}-${endTime}`;
      
      if (!groupedPrefs.has(slotKey)) {
        groupedPrefs.set(slotKey, []);
      }
      groupedPrefs.get(slotKey).push(pref);
    });

    // Create events for each grouped slot
    return Array.from(groupedPrefs.entries()).map(([slotKey, prefs]) => {
      const firstPref = prefs[0];
      const startTime = firstPref.start_time.substring(0, 5);
      const endTime = firstPref.end_time.substring(0, 5);
      
      const start = `${firstPref.date}T${startTime}`;
      const end = `${firstPref.date}T${endTime}`;
      
      // Collect all types and topics
      const types = [...new Set(prefs.map(p => p.preference_labels?.type).filter(Boolean))];
      const topics = [...new Set(prefs.map(p => p.preference_labels?.topic).filter(Boolean))];
      
      // Create title showing all options
      const typeLabels = types.map(t => t === 'individual' ? 'Indywidualne' : 'Grupowe').join(', ');
      const topicLabels = topics.join(', ');
      const title = `${typeLabels}${topicLabels ? ` - ${topicLabels}` : ''}`;

      return {
        id: `preference-${slotKey}`,
        title: title || 'Preferencja',
        start,
        end,
        backgroundColor: '#fbbf24', // yellow/amber for preferences
        borderColor: '#f59e0b',
        display: 'block',
        extendedProps: {
          type: 'preference',
          preference: firstPref, // Keep first preference for compatibility
          allPreferences: prefs // Store all preferences for this slot
        }
      };
    });
  }, [preferences, user]);

  // Combine events based on active tab
  // For bookings tab: only show availability (concrete classes/bookings)
  // For preferences tab: only show user preferences
  // For groups tab: show both availability and preferences
  const calendarEvents = activeTab === 'bookings' 
    ? [...availabilityEvents] 
    : activeTab === 'preferences'
    ? [...preferenceEvents]
    : activeTab === 'groups'
    ? [...availabilityEvents, ...preferenceEvents]
    : [...availabilityEvents];

  // Debug logging
  React.useEffect(() => {
    if (activeTab === 'preferences') {
      console.log('Preferences tab active:', {
        preferencesCount: preferences?.length || 0,
        preferenceEventsCount: preferenceEvents?.length || 0,
        calendarEventsCount: calendarEvents?.length || 0,
        preferenceEvents: preferenceEvents,
        user: user?.id
      });
    }
  }, [activeTab, preferences, preferenceEvents, calendarEvents, user]);

  // Handle event click
  const handleEventClick = (event) => {
    const eventType = event.extendedProps?.type;
    
    if (eventType === 'preference') {
      // Handle preference click - user can view their preferences
      const preference = event.extendedProps?.preference;
      const allPreferences = event.extendedProps?.allPreferences || [preference];
      if (preference) {
        // Use first preference but pass all preferences for this slot
        handlePreferenceClick({ ...preference, allPreferences });
      }
      return;
    }
    
    // Handle availability slot click
    if (eventType === 'availability') {
      const slot = event.extendedProps?.slot;
      const meetingLink = event.extendedProps?.meetingLink;
      
      if (slot) {
        // If there's a meeting link, open it directly
        if (meetingLink) {
          window.open(meetingLink, '_blank', 'noopener,noreferrer');
          return;
        }
        
        const userHasBooking = event.extendedProps?.userHasBooking;
        const isFull = event.extendedProps?.isFull;

        if (userHasBooking) {
          const booking = bookings.find(
            (b) => b.availability_id === slot.id && b.status !== 'cancelled' && b.user_id === user?.id
          );
          if (booking) {
            handleSlotClick(slot);
          }
        } else if (isFull) {
          toast.error('Ten termin jest już zajęty');
        } else {
          handleSlotClick(slot);
        }
      }
    }
  };

  return (
    <PageLayout isDark={isDark} setIsDark={setIsDark} from="#5e91ff" fromDark="#15316b" stopAt="30%">
      <div className="w-full max-w-7xl mx-auto mt-24 mb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Kalendarz zajęć
            </h1>
            {user && (
              <button
                onClick={() => {
                  if (activeTab === 'preferences') {
                    // Open preference modal by setting a default time range
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    const endTime = new Date(tomorrow);
                    endTime.setHours(10, 0, 0, 0);
                    
                    setSelectedTimeRange({
                      date: tomorrow.toISOString().split('T')[0],
                      startTime: '09:00',
                      endTime: '10:00',
                      start: tomorrow,
                      end: endTime
                    });
                    setShowPreferenceModal(true);
                  } else {
                    // Switch to preferences tab
                    setActiveTab('preferences');
                  }
                }}
                className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md shadow-sm max-w-[300px] transition-opacity hover:opacity-90"
              >
                Dodaj preferencję czasową
              </button>
            )}
          </div>
        </div>

        {/* Next Webinar Block */}
        {nextWebinar && (
          <div 
            className="mb-6 p-6 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => {
                  // Navigate to webinar date in calendar
                  const webinarDate = new Date(nextWebinar.date);
                  setCalendarDate(webinarDate);
                }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Najbliższy webinar
                  </h3>
                  <p className="text-white/90">
                    {new Date(nextWebinar.date).toLocaleDateString('pl-PL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} o {nextWebinar.start_time.substring(0, 5)} - {nextWebinar.end_time.substring(0, 5)}
                  </p>
                  <p className="text-white/80 text-sm mt-1">
                    {nextWebinar.class_type === 'individual' ? 'Zajęcia indywidualne' : `Zajęcia grupowe (max ${nextWebinar.max_participants} osób)`}
                  </p>
                </div>
              </div>
              {nextWebinar.meeting_link && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(nextWebinar.meeting_link, '_blank', 'noopener,noreferrer');
                  }}
                  className="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-2 transition-colors backdrop-blur-sm border border-white/30"
                >
                  <ExternalLink size={18} />
                  Przejdź do spotkania
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-DarkblackBorder">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Zajęcia
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Preferencje
            </button>
            {user && (
              <button
                onClick={() => {
                  setActiveTab('groups');
                  // Mark groups as viewed when clicking on the tab
                  if (newGroupsCount > 0 && user?.id) {
                    markGroupsAsViewed(user.id);
                  }
                }}
                className={`relative px-4 py-2 font-medium transition ${
                  activeTab === 'groups'
                    ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Twoja Grupa
                {newGroupsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg z-10 border-2 border-white dark:border-DarkblackText animate-pulse">
                    {newGroupsCount > 9 ? '9+' : newGroupsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>


        {/* Calendar - hide when groups tab is active */}
        {activeTab !== 'groups' && (
          <div className="mb-6">
            {loading && (
              <div className="flex justify-center items-center py-12 bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
              </div>
            )}

            {!loading && (
              <CustomCalendar
              events={calendarEvents}
              initialDate={calendarDate}
              onEventClick={handleEventClick}
              onTimeSlotClick={(day, timeSlot) => {
                // Find availability slot for this time
                const dateStr = day.toISOString().split('T')[0];
                const slot = availability.find(a => 
                  a.date === dateStr && 
                  a.start_time.substring(0, 5) === timeSlot.time &&
                  a.is_active
                );
                if (slot) {
                  handleSlotClick(slot);
                }
              }}
              selectable={user && activeTab === 'preferences' ? true : false}
              onSelect={(selectInfo) => {
                if (user && activeTab === 'preferences') {
                  const date = selectInfo.start.toISOString().split('T')[0];
                  const startHours = selectInfo.start.getHours().toString().padStart(2, '0');
                  const startMinutes = selectInfo.start.getMinutes().toString().padStart(2, '0');
                  const endHours = selectInfo.end.getHours().toString().padStart(2, '0');
                  const endMinutes = selectInfo.end.getMinutes().toString().padStart(2, '0');
                  
                  const startTime = `${startHours}:${startMinutes}`;
                  const endTime = `${endHours}:${endMinutes}`;

                  setSelectedTimeRange({ date, startTime, endTime, start: selectInfo.start, end: selectInfo.end });
                  setShowPreferenceModal(true);
                } else if (!user) {
                  toast.error('Zaloguj się, aby dodać preferencje czasowe');
                }
              }}
            />
          )}
          </div>
        )}

        {/* Terms Panels - Below calendar, only show if user is logged in */}
        {user && activeTab === 'bookings' && (() => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            const activeBookings = bookings.filter((b) => {
              if (b.status === 'cancelled') return false;
              const slot = b.class_availability;
              if (!slot) return false;
              const slotDate = new Date(slot.date);
              slotDate.setHours(0, 0, 0, 0);
              // Check if slot date and time has passed
              const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
              return slotDateTime >= now;
            });

            const archivedBookings = bookings.filter((b) => {
              if (b.status === 'cancelled') return false;
              const slot = b.class_availability;
              if (!slot) return false;
              const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
              return slotDateTime < now;
            });

            const renderBooking = (booking) => {
              const slot = booking.class_availability;
              if (!slot) return null;

              const date = new Date(slot.date);
              const startTime = slot.start_time.substring(0, 5);
              const endTime = slot.end_time.substring(0, 5);
              const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
              const isPast = slotDateTime < now;

              return (
                <div
                  key={booking.id}
                  className={`p-3 border rounded-lg flex flex-col gap-2 ${
                    isPast 
                      ? 'border-gray-200 dark:border-DarkblackText opacity-75' 
                      : 'border-gray-200 dark:border-DarkblackText'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {slot.class_type === 'individual' ? (
                      <User className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Users className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {slot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'Potwierdzone' : 'Oczekujące'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {date.toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short'
                    })}{' '}
                    {startTime} - {endTime}
                  </p>
                  {!isPast && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition flex items-center gap-1 text-xs w-fit"
                    >
                      <X className="w-3 h-3" />
                      Anuluj
                    </button>
                  )}
                </div>
              );
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Bookings */}
                <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-sm border border-gray-200 dark:border-DarkblackText p-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Nadchodzące terminy
                  </h2>

                  {activeBookings.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Brak nadchodzących rezerwacji</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {activeBookings.map(renderBooking)}
                    </div>
                  )}
                </div>

                {/* Archived Bookings */}
                {archivedBookings.length > 0 && (
                  <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-sm border border-gray-200 dark:border-DarkblackText p-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Archiwalne terminy
                    </h2>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {archivedBookings.map(renderBooking)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


        {/* Info for non-logged in users */}
        {!user && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Zaloguj się, aby zarezerwować termin
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Możesz przeglądać dostępne terminy, ale aby zarezerwować zajęcia, musisz być zalogowany.
                </p>
                <button
                  onClick={handleLoginToBook}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" />
                  Zaloguj się
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups Panel */}
        {user && activeTab === 'groups' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Twoja Grupa
            </h2>
            
            {groupsLoading ? (
              <div className="flex justify-center items-center py-12 bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
              </div>
            ) : userGroups && userGroups.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const filteredGroups = userGroups.filter(group => {
                    if (!group || !group.date || !group.end_time) {
                      console.log('Group filtered out - missing data:', group);
                      return false;
                    }
                    // Show only active groups (date in future or today)
                    try {
                      const groupDate = new Date(`${group.date}T${group.end_time}`);
                      const now = new Date();
                      const isActive = groupDate >= now;
                      console.log('Group filter check:', {
                        groupName: group.name,
                        groupDate: groupDate.toISOString(),
                        now: now.toISOString(),
                        isActive
                      });
                      return isActive;
                    } catch (e) {
                      console.error('Error filtering group:', e, group);
                      return false;
                    }
                  });
                  
                  console.log('Filtered groups count:', filteredGroups.length, 'from', userGroups.length);
                  
                  if (filteredGroups.length === 0 && userGroups.length > 0) {
                    // Show all groups if filtering removed all (for debugging)
                    console.warn('All groups were filtered out, showing all groups anyway');
                    return userGroups.map((group) => {
                      // Check if group date has passed
                      const groupDateTime = new Date(`${group.date}T${group.end_time}`);
                      const now = new Date();
                      const isPast = groupDateTime < now;
                      
                      return (
                      <div
                        key={group.id}
                        className={`rounded-lg shadow-sm border p-6 transition-all ${
                          isPast
                            ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-70'
                            : 'bg-white dark:bg-DarkblackBorder border-gray-200 dark:border-DarkblackText'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                isPast
                                  ? 'bg-gray-400 dark:bg-gray-600'
                                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                              }`}>
                                <Hash className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${
                                  isPast
                                    ? 'text-gray-500 dark:text-gray-400'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {group.name}
                                </h3>
                                <p className={`text-sm ${
                                  isPast
                                    ? 'text-gray-400 dark:text-gray-500'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {group.class_type === 'individual' ? 'Zajęcia indywidualne' : 'Zajęcia grupowe'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className={`flex items-center gap-2 text-sm ${
                                isPast
                                  ? 'text-gray-400 dark:text-gray-500'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(group.date).toLocaleDateString('pl-PL', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className={`flex items-center gap-2 text-sm ${
                                isPast
                                  ? 'text-gray-400 dark:text-gray-500'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                <Clock className="w-4 h-4" />
                                <span>
                                  {group.start_time.substring(0, 5)} - {group.end_time.substring(0, 5)}
                                </span>
                              </div>
                              {group.description && (
                                <div className={`mt-3 pt-3 border-t ${
                                  isPast
                                    ? 'border-gray-300 dark:border-gray-600'
                                    : 'border-gray-200 dark:border-DarkblackText'
                                }`}>
                                  <p className={`text-sm ${
                                    isPast
                                      ? 'text-gray-400 dark:text-gray-500'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {group.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {group.discord_link && (
                            <button
                              onClick={() => {
                                if (isPast) return; // Prevent action if past
                                let link = group.discord_link;
                                // Add protocol if missing
                                if (!link.startsWith('http://') && !link.startsWith('https://')) {
                                  link = 'https://' + link;
                                }
                                window.open(link, '_blank', 'noopener,noreferrer');
                              }}
                              disabled={isPast}
                              className={`ml-4 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
                                isPast
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white'
                              }`}
                            >
                              <ExternalLink size={18} />
                              Przejdź do Discord
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    });
                  }
                  
                  return filteredGroups.map((group) => {
                    // Check if group date has passed
                    const groupDateTime = new Date(`${group.date}T${group.end_time}`);
                    const now = new Date();
                    const isPast = groupDateTime < now;
                    
                    return (
                    <div
                      key={group.id}
                      className={`rounded-lg shadow-sm border p-6 transition-all ${
                        isPast
                          ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-70'
                          : 'bg-white dark:bg-DarkblackBorder border-gray-200 dark:border-DarkblackText'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isPast
                                ? 'bg-gray-400 dark:bg-gray-600'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            }`}>
                              <Hash className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${
                                isPast
                                  ? 'text-gray-500 dark:text-gray-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {group.name}
                              </h3>
                              <p className={`text-sm ${
                                isPast
                                  ? 'text-gray-400 dark:text-gray-500'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {group.class_type === 'individual' ? 'Zajęcia indywidualne' : 'Zajęcia grupowe'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className={`flex items-center gap-2 text-sm ${
                              isPast
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(group.date).toLocaleDateString('pl-PL', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${
                              isPast
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              <Clock className="w-4 h-4" />
                              <span>
                                {group.start_time.substring(0, 5)} - {group.end_time.substring(0, 5)}
                              </span>
                            </div>
                            {group.description && (
                              <div className={`mt-3 pt-3 border-t ${
                                isPast
                                  ? 'border-gray-300 dark:border-gray-600'
                                  : 'border-gray-200 dark:border-DarkblackText'
                              }`}>
                                <p className={`text-sm ${
                                  isPast
                                    ? 'text-gray-400 dark:text-gray-500'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {group.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {group.discord_link && (
                            <button
                              onClick={() => {
                                if (isPast) return; // Prevent action if past
                                let link = group.discord_link;
                                // Add protocol if missing
                                if (!link.startsWith('http://') && !link.startsWith('https://')) {
                                  link = 'https://' + link;
                                }
                                window.open(link, '_blank', 'noopener,noreferrer');
                              }}
                              disabled={isPast}
                              className={`ml-4 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
                                isPast
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white'
                              }`}
                            >
                              <ExternalLink size={18} />
                              Przejdź do Discord
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-sm border border-gray-200 dark:border-DarkblackText p-8 text-center">
                <Hash className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nie jesteś jeszcze przypisany do żadnej grupy.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preference Modal */}
      {showPreferenceModal && selectedTimeRange && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-md animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dodaj preferencję czasową
                </h3>
                <button
                  onClick={() => {
                    setShowPreferenceModal(false);
                    setSelectedTimeRange(null);
                    setPreferenceDescription('');
                    setPreferenceLabelId('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data i godzina:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTimeRange.date).toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    {selectedTimeRange.startTime} - {selectedTimeRange.endTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Typ zajęć * (można wybrać wiele)
                    </label>
                    <div className="space-y-2 p-3 border border-gray-200 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferenceTypes.includes('individual')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferenceTypes([...preferenceTypes, 'individual']);
                            } else {
                              setPreferenceTypes(preferenceTypes.filter(t => t !== 'individual'));
                            }
                          }}
                          className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Zajęcia indywidualne</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferenceTypes.includes('group')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferenceTypes([...preferenceTypes, 'group']);
                            } else {
                              setPreferenceTypes(preferenceTypes.filter(t => t !== 'group'));
                            }
                          }}
                          className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Zajęcia grupowe</span>
                      </label>
                    </div>
                    {preferenceTypes.length === 0 && (
                      <p className="text-red-500 text-xs mt-1">Wybierz przynajmniej jeden typ zajęć</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temat * (można wybrać wiele)
                    </label>
                    <div className="space-y-2 p-3 border border-gray-200 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferenceTopics.includes('inf 0.3')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferenceTopics([...preferenceTopics, 'inf 0.3']);
                            } else {
                              setPreferenceTopics(preferenceTopics.filter(t => t !== 'inf 0.3'));
                            }
                          }}
                          className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">inf 0.3</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferenceTopics.includes('inf 0.4')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferenceTopics([...preferenceTopics, 'inf 0.4']);
                            } else {
                              setPreferenceTopics(preferenceTopics.filter(t => t !== 'inf 0.4'));
                            }
                          }}
                          className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">inf 0.4</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferenceTopics.includes('matura z informatyki')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferenceTopics([...preferenceTopics, 'matura z informatyki']);
                            } else {
                              setPreferenceTopics(preferenceTopics.filter(t => t !== 'matura z informatyki'));
                            }
                          }}
                          className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Matura z informatyki</span>
                      </label>
                    </div>
                    {preferenceTopics.length === 0 && (
                      <p className="text-red-500 text-xs mt-1">Wybierz przynajmniej jeden temat</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opis (opcjonalnie)
                  </label>
                  <textarea
                    value={preferenceDescription}
                    onChange={(e) => setPreferenceDescription(e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-gray-200 dark:border-DarkblackText rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white resize-none"
                    placeholder="Dodaj opis preferencji..."
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Preferencja cykliczna
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedTimeRange
                        ? `Preferencja zostanie automatycznie utworzona na wszystkie ${new Date(selectedTimeRange.date).toLocaleDateString('pl-PL', { weekday: 'long' })} przez najbliższe 2 miesiące. Jest to preferencja cykliczna potrzebna do utworzenia grupy.`
                        : 'Preferencja zostanie automatycznie utworzona na wszystkie przyszłe wystąpienia tego dnia tygodnia przez 2 miesiące (np. wszystkie poniedziałki).'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPreferenceModal(false);
                    setSelectedTimeRange(null);
                    setPreferenceDescription('');
                    setPreferenceLabelId('');
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-DarkblackText text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleCreatePreference}
                  className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition"
                >
                  Dodaj preferencję
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-md animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Rezerwuj termin
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data i godzina:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedSlot.date).toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    {selectedSlot.start_time.substring(0, 5)} - {selectedSlot.end_time.substring(0, 5)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Typ zajęć:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedSlot.class_type === 'individual' ? 'Zajęcia indywidualne' : 'Zajęcia grupowe'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notatka (opcjonalnie)
                  </label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-gray-200 dark:border-DarkblackText rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white resize-none"
                    placeholder="Dodaj notatkę do rezerwacji..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-DarkblackText text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleBookSlot}
                  className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition"
                >
                  Zarezerwuj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-md animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user ? 'Rezerwuj termin' : 'Zaloguj się, aby się umówić'}
                </h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                    setBookingNotes('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data i godzina:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedSlot.date).toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    {selectedSlot.start_time.substring(0, 5)} - {selectedSlot.end_time.substring(0, 5)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Typ zajęć:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedSlot.class_type === 'individual' ? 'Zajęcia indywidualne' : 'Zajęcia grupowe'}
                  </p>
                </div>

                {user ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notatka (opcjonalnie)
                      </label>
                      <textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows="3"
                        className="w-full p-3 border border-gray-200 dark:border-DarkblackText rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white resize-none"
                        placeholder="Dodaj notatkę do rezerwacji..."
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowBookingModal(false);
                          setSelectedSlot(null);
                          setBookingNotes('');
                        }}
                        className="px-4 py-2 border border-gray-200 dark:border-DarkblackText text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={handleBookSlot}
                        className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition"
                      >
                        Zarezerwuj
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Aby zarezerwować ten termin, musisz być zalogowany. Po zalogowaniu zostaniesz przekierowany z powrotem do kalendarza.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowBookingModal(false);
                          setSelectedSlot(null);
                          setBookingNotes('');
                        }}
                        className="px-4 py-2 border border-gray-200 dark:border-DarkblackText text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={handleLoginToBook}
                        className="flex items-center gap-2 px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition"
                      >
                        <LogIn className="w-4 h-4" />
                        Zaloguj się, aby się umówić
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preference Info Modal */}
      {showPreferenceInfoModal && viewingPreference && (() => {
        const allPrefs = viewingPreference.allPreferences || [viewingPreference];
        
        // Collect all unique types and topics
        const selectedTypes = [...new Set(allPrefs.map(p => p.preference_labels?.type).filter(Boolean))];
        const selectedTopics = [...new Set(allPrefs.map(p => p.preference_labels?.topic).filter(Boolean))];
        const description = allPrefs[0]?.description; // Use description from first preference

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-md animate-scaleIn">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Twoja preferencja
                  </h3>
                  <button
                    onClick={() => {
                      setShowPreferenceInfoModal(false);
                      setViewingPreference(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data i godzina:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(viewingPreference.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}{' '}
                      {viewingPreference.start_time.substring(0, 5)} - {viewingPreference.end_time.substring(0, 5)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Typ zajęć:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTypes.map((type, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
                        >
                          {type === 'individual' ? 'Zajęcia indywidualne' : 'Zajęcia grupowe'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Temat:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {description && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Opis:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPreferenceInfoModal(false);
                      setViewingPreference(null);
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-DarkblackText text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={() => handleEditPreferenceClick(viewingPreference)}
                    className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edytuj
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Preference Modal */}
      {showEditPreferenceModal && editingPreference && selectedTimeRange && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-md animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edytuj preferencję
                </h3>
                <button
                  onClick={() => {
                    setShowEditPreferenceModal(false);
                    setEditingPreference(null);
                    setSelectedTimeRange(null);
                    setPreferenceDescription('');
                    setPreferenceLabelId('');
                    setPreferenceType('individual');
                    setPreferenceTopic('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data i godzina:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTimeRange.date).toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    {selectedTimeRange.startTime} - {selectedTimeRange.endTime}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Typ zajęć * (można wybrać wiele)
                  </label>
                  <div className="space-y-2 p-3 border border-gray-200 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferenceTypes.includes('individual')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferenceTypes([...preferenceTypes, 'individual']);
                          } else {
                            setPreferenceTypes(preferenceTypes.filter(t => t !== 'individual'));
                          }
                        }}
                        className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Zajęcia indywidualne</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferenceTypes.includes('group')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferenceTypes([...preferenceTypes, 'group']);
                          } else {
                            setPreferenceTypes(preferenceTypes.filter(t => t !== 'group'));
                          }
                        }}
                        className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Zajęcia grupowe</span>
                    </label>
                  </div>
                  {preferenceTypes.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">Wybierz przynajmniej jeden typ zajęć</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temat * (można wybrać wiele)
                  </label>
                  <div className="space-y-2 p-3 border border-gray-200 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferenceTopics.includes('inf 0.3')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferenceTopics([...preferenceTopics, 'inf 0.3']);
                          } else {
                            setPreferenceTopics(preferenceTopics.filter(t => t !== 'inf 0.3'));
                          }
                        }}
                        className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">inf 0.3</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferenceTopics.includes('inf 0.4')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferenceTopics([...preferenceTopics, 'inf 0.4']);
                          } else {
                            setPreferenceTopics(preferenceTopics.filter(t => t !== 'inf 0.4'));
                          }
                        }}
                        className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">inf 0.4</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferenceTopics.includes('matura z informatyki')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferenceTopics([...preferenceTopics, 'matura z informatyki']);
                          } else {
                            setPreferenceTopics(preferenceTopics.filter(t => t !== 'matura z informatyki'));
                          }
                        }}
                        className="w-4 h-4 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Matura z informatyki</span>
                    </label>
                  </div>
                  {preferenceTopics.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">Wybierz przynajmniej jeden temat</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opis (opcjonalnie)
                  </label>
                  <textarea
                    value={preferenceDescription}
                    onChange={(e) => setPreferenceDescription(e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-gray-200 dark:border-DarkblackText rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white resize-none"
                    placeholder="Dodaj opis preferencji..."
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={() => {
                    if (window.confirm('Czy na pewno chcesz usunąć tę preferencję?')) {
                      handleDeletePreference(editingPreference.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                  Usuń
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEditPreferenceModal(false);
                      setEditingPreference(null);
                      setSelectedTimeRange(null);
                      setPreferenceDescription('');
                      setPreferenceLabelId('');
                      setPreferenceType('individual');
                      setPreferenceTopic('');
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-DarkblackText text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleUpdatePreference}
                    className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition"
                  >
                    Zapisz zmiany
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

