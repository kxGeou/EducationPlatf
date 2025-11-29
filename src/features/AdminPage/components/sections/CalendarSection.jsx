import { useEffect, useState } from 'react';
import { useCalendarStore } from '../../../../store/calendarStore';
import { Calendar, Clock, Users, User, Plus, Edit, Trash2, CheckCircle, XCircle, Eye, X, Mail, Hash, MessageSquare, Check, X as XIcon, Archive } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../../../CalendarPage/CalendarPage.css';

export default function CalendarSection({ timeAgo }) {
  const {
    availability,
    bookings,
    loading,
    fetchAllAvailability,
    fetchAllBookings,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    updateBookingStatus,
    getBookingsForSlot
  } = useCalendarStore();

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
    maxParticipants: 1
  });
  const [formErrors, setFormErrors] = useState({});

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
  }, []);

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
      maxParticipants: 1
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
      maxParticipants: slot.max_participants
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
        await updateAvailability(editingSlot.id, {
          date: formData.date.trim(),
          start_time: `${formData.startTime.trim()}:00`,
          end_time: `${formData.endTime.trim()}:00`,
          class_type: formData.classType.trim(),
          max_participants: maxParticipants
        });
      } else {
        await createAvailability(
          formData.date.trim(),
          `${formData.startTime.trim()}:00`,
          `${formData.endTime.trim()}:00`,
          formData.classType.trim(),
          maxParticipants
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

  // Prepare calendar events
  const calendarEvents = availability.map((slot) => {
    const start = `${slot.date}T${slot.start_time}`;
    const end = `${slot.date}T${slot.end_time}`;

    // Get booking count for this slot
    const bookingCount = bookings.filter(
      (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
    ).length;

    const isFull = bookingCount >= slot.max_participants;

    return {
      id: slot.id,
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
        slot,
        bookingCount,
        isFull
      }
    };
  });

  const handleEventClick = (clickInfo) => {
    const slot = clickInfo.event.extendedProps.slot;
    if (slot) {
      handleViewBookings(slot);
    }
  };

  // Filter end time options based on selected start time
  const getEndTimeOptions = () => {
    if (!formData.startTime) return timeOptions;
    const startIndex = timeOptions.indexOf(formData.startTime);
    if (startIndex === -1) return timeOptions;
    return timeOptions.slice(startIndex + 1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
          <Calendar size={20} className="sm:w-6 sm:h-6" />
          Zarządzanie kalendarzem
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 w-full sm:w-auto"
        >
          <Plus size={18} />
          <span className="text-sm sm:text-base">Dodaj termin</span>
        </button>
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
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            locale="pl"
            events={calendarEvents}
            eventClick={handleEventClick}
            editable={false}
            selectable={false}
            height="auto"
            eventDisplay="block"
            validRange={{
              start: new Date().toISOString().split('T')[0],
              end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
              meridiem: false
            }}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="font-semibold text-lg text-blackText dark:text-white mb-3">Legenda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Indywidualne</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Grupowe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Zajęte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Nieaktywne</span>
          </div>
        </div>
      </div>

      {/* Availability List */}
      {(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const activeSlots = availability.filter((slot) => {
          const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
          return slotDateTime >= now;
        });

        const archivedSlots = availability.filter((slot) => {
          const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
          return slotDateTime < now;
        });

        const renderSlot = (slot) => {
          const bookingCount = bookings.filter(
            (b) => b.availability_id === slot.id && ['pending', 'confirmed'].includes(b.status)
          ).length;
          const isFull = bookingCount >= slot.max_participants;
          const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
          const isPast = slotDateTime < now;

          return (
            <div
              key={slot.id}
              className={`p-4 rounded-lg border ${
                slot.is_active
                  ? 'bg-white dark:bg-DarkblackText border-gray-200 dark:border-DarkblackBorder'
                  : 'bg-gray-100 dark:bg-DarkblackBorder border-gray-300 dark:border-DarkblackText opacity-60'
              } ${isPast ? 'opacity-75' : ''}`}
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
                  <button
                    onClick={() => handleViewBookings(slot)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    title="Zobacz rezerwacje"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(slot)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                    title="Edytuj"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(slot)}
                    className={`p-2 rounded-lg transition ${
                      slot.is_active
                        ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title={slot.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                  >
                    {slot.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
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
          <>
            {/* Active Slots */}
            <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="font-semibold text-lg text-blackText dark:text-white mb-4">Nadchodzące terminy</h3>
              <div className="space-y-3">
                {activeSlots.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">Brak nadchodzących terminów</p>
                ) : (
                  activeSlots.map(renderSlot)
                )}
              </div>
            </div>

            {/* Archived Slots */}
            {archivedSlots.length > 0 && (
              <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="font-semibold text-lg text-blackText dark:text-white mb-4 flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  Archiwalne terminy
                </h3>
                <div className="space-y-3">
                  {archivedSlots.map(renderSlot)}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div
            className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText flex items-center justify-between">
              <h3 className="text-xl font-bold text-blackText dark:text-white">
                {editingSlot ? 'Edytuj termin' : 'Dodaj nowy termin'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-lg transition-colors"
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white dark:border-DarkblackBorder ${
                    formErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Godzina rozpoczęcia <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => handleFormChange('startTime', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white dark:border-DarkblackBorder ${
                    formErrors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Godzina zakończenia <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => handleFormChange('endTime', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white dark:border-DarkblackBorder ${
                    formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {getEndTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {formErrors.endTime && <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>}
              </div>

              {/* Class Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Typ zajęć <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.classType}
                  onChange={(e) => handleFormChange('classType', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white dark:border-DarkblackBorder ${
                    formErrors.classType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="individual">Indywidualne</option>
                  <option value="group">Grupowe</option>
                </select>
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:bg-DarkblackText dark:text-white dark:border-DarkblackBorder ${
                    formErrors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                  } ${formData.classType === 'individual' ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {formErrors.maxParticipants && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.maxParticipants}</p>
                )}
                {formData.classType === 'individual' && (
                  <p className="text-gray-500 text-xs mt-1">Zajęcia indywidualne mają zawsze 1 uczestnika</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white rounded-lg shadow hover:shadow-lg transition hover:scale-[1.02]"
                >
                  {editingSlot ? 'Zapisz zmiany' : 'Dodaj termin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
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
        </div>
      )}
    </div>
  );
}

