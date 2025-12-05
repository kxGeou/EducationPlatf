import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarStore } from '../../store/calendarStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import PageLayout from '../../components/systemLayouts/PageLayout';
import { Calendar, Clock, Users, User, X, LogIn, Archive } from 'lucide-react';
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
    deletePreference,
    createLabel
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
  const [preferenceType, setPreferenceType] = useState('individual');
  const [preferenceTopic, setPreferenceTopic] = useState('');

  useEffect(() => {
    // Fetch availability for the next 7 days (available for everyone)
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const endDateStr = endDate.toISOString().split('T')[0];

    fetchAvailability(startDate, endDateStr);
    fetchLabels();

    // Fetch user bookings and preferences only if user is logged in
    if (user) {
      fetchUserBookings(user.id);
      // Fetch preferences for the next 7 days
      fetchUserPreferences(user.id, startDate, endDateStr);
    }
  }, [user]);

  const handleDateClick = (arg) => {
    const clickedDate = arg.dateStr;
    const slotsForDate = availability.filter(
      (slot) => slot.date === clickedDate && slot.is_active
    );

    if (slotsForDate.length > 0) {
      setSelectedDate(clickedDate);
      setSelectedSlot(null);
    } else {
      toast.error('Brak dostępnych terminów w tym dniu');
    }
  };

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

    // Check if selection is in the past
    const now = new Date();
    if (selectInfo.start < now) {
      toast.error('Nie można dodać preferencji w przeszłości');
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
    if (!selectedTimeRange || !user || !preferenceTopic) {
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

      await createPreference({
        userId: user.id,
        labelId: labelId,
        date: selectedTimeRange.date,
        startTime: selectedTimeRange.startTime + ':00',
        endTime: selectedTimeRange.endTime + ':00',
        description: preferenceDescription || null
      });
      setShowPreferenceModal(false);
      setSelectedTimeRange(null);
      setPreferenceDescription('');
      setPreferenceLabelId('');
      setPreferenceType('individual');
      setPreferenceTopic('');
      await fetchUserPreferences(user.id);
      await fetchLabels();
      toast.success('Preferencja została dodana');
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
      await fetchUserPreferences(user.id);
    } catch (err) {
      // Error handled in store
    }
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

      return {
        id: `availability-${slot.id}`,
        title: `${slot.class_type === 'individual' ? 'Indywidualne' : 'Grupowe'} (${bookingCount}/${slot.max_participants})`,
        start,
        end,
        backgroundColor: userHasBooking
          ? '#10b981' // green - user has booking
          : isFull
          ? '#ef4444' // red - full
          : slot.class_type === 'individual'
          ? '#3b82f6' // blue - individual available
          : '#8b5cf6', // purple - group available
        borderColor: userHasBooking
          ? '#10b981'
          : isFull
          ? '#ef4444'
          : slot.class_type === 'individual'
          ? '#3b82f6'
          : '#8b5cf6',
        extendedProps: {
          type: 'availability',
          slot,
          bookingCount,
          isFull,
          userHasBooking
        }
      };
    });

  // Prepare calendar events from user preferences
  const preferenceEvents = (preferences || []).map((pref) => {
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

  const calendarEvents = [...availabilityEvents, ...preferenceEvents];

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const eventType = clickInfo.event.extendedProps.type;
    
    if (eventType === 'preference') {
      // Handle preference click - show delete option
      const preference = clickInfo.event.extendedProps.preference;
      if (window.confirm('Czy chcesz usunąć tę preferencję?')) {
        handleDeletePreference(preference.id);
      }
      return;
    }

    // Handle availability slot click
    const slot = clickInfo.event.extendedProps.slot;
    const userHasBooking = clickInfo.event.extendedProps.userHasBooking;
    const isFull = clickInfo.event.extendedProps.isFull;

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
  };

  return (
    <PageLayout isDark={isDark} setIsDark={setIsDark} from="#5e91ff" fromDark="#15316b" stopAt="30%">
      <div className="w-full max-w-7xl mx-auto mt-24 mb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primaryBlue to-secondaryBlue rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Kalendarz zajęć
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Umów się na zajęcia indywidualne lub grupowe
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 p-4 bg-white dark:bg-DarkblackBorder rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Indywidualne - dostępne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Grupowe - dostępne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Twoja rezerwacja</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Zajęte</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Twoje preferencje</span>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
            </div>
          )}

          {!loading && (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek7Days"
              views={{
                timeGridWeek7Days: {
                  type: 'timeGridWeek',
                  duration: { days: 7 },
                  slotMinTime: '08:00:00',
                  slotMaxTime: '20:00:00',
                  slotDuration: '00:30:00',
                  allDaySlot: false
                }
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              locale="pl"
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              select={handleSelect}
              selectMirror={true}
              editable={false}
              selectable={user ? true : false}
              selectOverlap={true}
              unselectAuto={false}
              height="auto"
              eventDisplay="block"
              validRange={{
                start: new Date().toISOString().split('T')[0]
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              firstDay={1}
              weekends={true}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              dayHeaderFormat={{ 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short',
                omitCommas: false
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
            />
          )}
        </div>

        {/* User Bookings - Only show if user is logged in */}
        {user && (() => {
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
                className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  isPast 
                    ? 'border-gray-200 dark:border-DarkblackText opacity-75' 
                    : 'border-gray-200 dark:border-DarkblackText'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {slot.class_type === 'individual' ? (
                      <User className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Users className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {slot.class_type === 'individual' ? 'Zajęcia indywidualne' : 'Zajęcia grupowe'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {booking.status === 'confirmed' ? 'Potwierdzone' : 'Oczekujące'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {date.toLocaleDateString('pl-PL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    {startTime} - {endTime}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Notatka: {booking.notes}
                    </p>
                  )}
                </div>
                {!isPast && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Anuluj
                  </button>
                )}
              </div>
            );
          };

          return (
            <>
              {/* Active Bookings */}
              <div className="mt-8 bg-white dark:bg-DarkblackBorder rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Nadchodzące rezerwacje
                </h2>

                {activeBookings.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">Brak nadchodzących rezerwacji</p>
                ) : (
                  <div className="space-y-3">
                    {activeBookings.map(renderBooking)}
                  </div>
                )}
              </div>

              {/* Archived Bookings */}
              {archivedBookings.length > 0 && (
                <div className="mt-6 bg-white dark:bg-DarkblackBorder rounded-lg shadow-lg p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Archive className="w-5 h-5" />
                    Archiwalne rezerwacje
                  </h2>
                  <div className="space-y-3">
                    {archivedBookings.map(renderBooking)}
                  </div>
                </div>
              )}
            </>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Typ zajęć *
                  </label>
                  <select
                    value={preferenceType}
                    onChange={(e) => setPreferenceType(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-DarkblackText rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white"
                    required
                  >
                    <option value="individual">Zajęcia indywidualne</option>
                    <option value="group">Zajęcia grupowe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temat *
                  </label>
                  <select
                    value={preferenceTopic}
                    onChange={(e) => setPreferenceTopic(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-DarkblackText rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white"
                    required
                  >
                    <option value="">Wybierz temat</option>
                    <option value="inf 0.3">inf 0.3</option>
                    <option value="inf 0.4">inf 0.4</option>
                    <option value="matura z informatyki">Matura z informatyki</option>
                  </select>
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
    </PageLayout>
  );
}

