import { useState, useEffect } from 'react';
import { useCalendarStore } from '../../../store/calendarStore';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../context/ToastContext';
import { Plus, Tag, Calendar, ListTodo, Users, X, Edit, Trash2, Clock } from 'lucide-react';
import { formatTimeRange, formatDate } from '../../../utils/timePreferencesUtils';

export default function TimePreferencesPanel({ isDark }) {
  const { user } = useAuthStore();
  const toast = useToast();
  const {
    preferences,
    labels,
    loading,
    fetchUserPreferences,
    fetchLabels,
    createPreference,
    updatePreference,
    deletePreference
  } = useCalendarStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreference, setEditingPreference] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    labelId: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedLabelFilter, setSelectedLabelFilter] = useState('');

  // Generate time options (30-minute intervals from 08:00 to 20:00)
  const timeOptions = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserPreferences(user.id);
      fetchLabels();
    }
  }, [user]);

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
      labelId: '',
      description: ''
    });
    setFormErrors({});
    setEditingPreference(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (preference) => {
    setEditingPreference(preference);
    setFormData({
      date: preference.date,
      startTime: preference.start_time.substring(0, 5),
      endTime: preference.end_time.substring(0, 5),
      labelId: preference.label_id || '',
      description: preference.description || ''
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
          const newEndIndex = Math.min(start + 2, timeOptions.length - 1);
          newData.endTime = timeOptions[newEndIndex];
        }
      }

      return newData;
    });

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

    if (!formData.date) {
      errors.date = 'Data jest wymagana';
    }

    if (!formData.startTime) {
      errors.startTime = 'Godzina rozpoczęcia jest wymagana';
    }

    if (!formData.endTime) {
      errors.endTime = 'Godzina zakończenia jest wymagana';
    }

    if (formData.startTime >= formData.endTime) {
      errors.endTime = 'Godzina zakończenia musi być późniejsza niż rozpoczęcia';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingPreference) {
        await updatePreference(editingPreference.id, {
          date: formData.date,
          start_time: formData.startTime + ':00',
          end_time: formData.endTime + ':00',
          label_id: formData.labelId || null,
          description: formData.description || null
        });
      } else {
        await createPreference({
          userId: user.id,
          labelId: formData.labelId || null,
          date: formData.date,
          startTime: formData.startTime + ':00',
          endTime: formData.endTime + ':00',
          description: formData.description || null
        });
      }

      setShowAddModal(false);
      resetForm();
      if (user) {
        await fetchUserPreferences(user.id);
      }
    } catch (err) {
      // Error is handled in store
    }
  };

  const handleDelete = async (preferenceId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę preferencję?')) {
      return;
    }

    try {
      await deletePreference(preferenceId);
      if (user) {
        await fetchUserPreferences(user.id);
      }
    } catch (err) {
      // Error is handled in store
    }
  };

  const filteredPreferences = selectedLabelFilter
    ? preferences.filter((p) => p.label_id === selectedLabelFilter)
    : preferences;

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Zaloguj się, aby zarządzać preferencjami czasowymi
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded hover:bg-secondaryBlue dark:hover:bg-secondaryGreen transition"
        >
          <Plus size={18} />
          Dodaj
        </button>
        <button
          onClick={() => setSelectedLabelFilter('')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition ${
            selectedLabelFilter === ''
              ? 'bg-primaryBlue dark:bg-primaryGreen text-white'
              : 'bg-gray-200 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder/80'
          }`}
        >
          <Tag size={18} />
          Etykiety
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-DarkblackBorder/80 transition"
        >
          <Calendar size={18} />
          Daty
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-DarkblackBorder/80 transition"
        >
          <ListTodo size={18} />
          Lista zadań
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-DarkblackBorder/80 transition"
        >
          <Users size={18} />
          Członkowie
        </button>
      </div>

      {/* Label Filter */}
      {labels.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Filtruj po etykiecie:</label>
          <select
            value={selectedLabelFilter}
            onChange={(e) => setSelectedLabelFilter(e.target.value)}
            className="w-full sm:w-auto p-2 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded"
          >
            <option value="">Wszystkie etykiety</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Preferences List */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto"></div>
        </div>
      )}

      {!loading && filteredPreferences.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Brak preferencji czasowych. Kliknij "Dodaj", aby utworzyć nową preferencję.
        </div>
      )}

      {!loading && filteredPreferences.length > 0 && (
        <div className="space-y-4">
          {filteredPreferences.map((preference) => (
            <div
              key={preference.id}
              className="p-4 bg-white dark:bg-DarkblackBorder rounded-lg border border-gray-200 dark:border-DarkblackBorder/50 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{formatDate(preference.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                    <span>{formatTimeRange(preference.start_time, preference.end_time)}</span>
                  </div>
                  {preference.preference_labels && (
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={16} className="text-gray-500 dark:text-gray-400" />
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: preference.preference_labels.color
                            ? `${preference.preference_labels.color}20`
                            : undefined,
                          color: preference.preference_labels.color || undefined
                        }}
                      >
                        {preference.preference_labels.name}
                      </span>
                    </div>
                  )}
                  {preference.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {preference.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(preference)}
                    className="p-2 text-primaryBlue dark:text-primaryGreen hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 rounded transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(preference.id)}
                    className="p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingPreference ? 'Edytuj preferencję' : 'Dodaj preferencję'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full p-2 border rounded ${
                      formErrors.date
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-DarkblackBorder'
                    } dark:bg-DarkblackBorder/50`}
                    required
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Godzina rozpoczęcia</label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => handleFormChange('startTime', e.target.value)}
                      className={`w-full p-2 border rounded ${
                        formErrors.startTime
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-DarkblackBorder'
                      } dark:bg-DarkblackBorder/50`}
                      required
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {formErrors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Godzina zakończenia</label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => handleFormChange('endTime', e.target.value)}
                      className={`w-full p-2 border rounded ${
                        formErrors.endTime
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-DarkblackBorder'
                      } dark:bg-DarkblackBorder/50`}
                      required
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {formErrors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.endTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Etykieta (opcjonalnie)</label>
                  <select
                    value={formData.labelId}
                    onChange={(e) => handleFormChange('labelId', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded"
                  >
                    <option value="">Brak etykiety</option>
                    {labels.map((label) => (
                      <option key={label.id} value={label.id}>
                        {label.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Opis (opcjonalnie)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Dodaj bardziej szczegółowy opis..."
                    rows={4}
                    className="w-full p-2 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-DarkblackBorder rounded hover:bg-gray-100 dark:hover:bg-DarkblackBorder/50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded hover:bg-secondaryBlue dark:hover:bg-secondaryGreen transition"
                  >
                    {editingPreference ? 'Zaktualizuj' : 'Dodaj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


