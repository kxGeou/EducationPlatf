import { useEffect, useState } from 'react';
import { useCalendarStore } from '../../../../store/calendarStore';
import { Clock, Users, User, Trash2, Eye } from 'lucide-react';

export default function ArchivedTermsSection({ timeAgo }) {
  const {
    availability,
    bookings,
    loading,
    fetchAllAvailability,
    fetchAllBookings,
    deleteAvailability,
    getBookingsForSlot
  } = useCalendarStore();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotBookings, setSlotBookings] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchAllAvailability();
    await fetchAllBookings();
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
                className={`px-2 py-1 rounded-md text-xs ${
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
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
              title="Zobacz rezerwacje"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteSlot(slot.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
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
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg font-semibold text-blackText dark:text-white">
        Archiwalne terminy
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedSlots.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">Brak archiwalnych terminów</p>
          ) : (
            archivedSlots.map(renderSlot)
          )}
        </div>
      )}
    </div>
  );
}
