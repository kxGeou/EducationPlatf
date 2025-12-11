import { useState, useEffect } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Edit3, 
  Trash2, 
  X, 
  Star,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import supabase from '../../../util/supabaseClient';
import { toast } from '../../../utils/toast';

export default function RewardsManagement({ isDark }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showTypeFilterDropdown, setShowTypeFilterDropdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showInactive, setShowInactive] = useState(true);
  const [pointsSort, setPointsSort] = useState('default');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'project',
    points_required: 100,
    link: '',
    is_active: true
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".reward-type-dropdown")) {
        setShowTypeDropdown(false);
      }
      if (!e.target.closest(".type-filter-dropdown")) {
        setShowTypeFilterDropdown(false);
      }
    };
    if (showTypeDropdown || showTypeFilterDropdown) {
      document.addEventListener("click", closeOnOutsideClick);
      return () => document.removeEventListener("click", closeOnOutsideClick);
    }
  }, [showTypeDropdown, showTypeFilterDropdown]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      if (err.code === 'PGRST116') {
        // Table doesn't exist - show message
        toast.info('Tabela nagród nie istnieje. Musisz ją najpierw utworzyć w bazie danych.');
      } else {
        toast.error('Błąd podczas ładowania nagród');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.link.trim()) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    if (formData.points_required < 1) {
      toast.error('Wymagana liczba punktów musi być większa niż 0');
      return;
    }

    try {
      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update(formData)
          .eq('id', editingReward.id);

        if (error) throw error;
        toast.success('Nagroda została zaktualizowana');
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert([formData]);

        if (error) throw error;
        toast.success('Nagroda została utworzona');
      }

      resetForm();
      setShowCreateModal(false);
      fetchRewards();
    } catch (err) {
      console.error('Error saving reward:', err);
      toast.error('Błąd podczas zapisywania nagrody');
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description,
      type: reward.type,
      points_required: reward.points_required,
      link: reward.link,
      is_active: reward.is_active
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę nagrodę?')) {
      try {
        const { error } = await supabase
          .from('rewards')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Nagroda została usunięta');
        fetchRewards();
      } catch (err) {
        console.error('Error deleting reward:', err);
        toast.error('Błąd podczas usuwania nagrody');
      }
    }
  };

  const toggleActive = async (reward) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', reward.id);

      if (error) throw error;
      toast.success(`Nagroda ${!reward.is_active ? 'aktywowana' : 'dezaktywowana'}`);
      fetchRewards();
    } catch (err) {
      console.error('Error toggling reward:', err);
      toast.error('Błąd podczas aktualizacji nagrody');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'project',
      points_required: 100,
      link: '',
      is_active: true
    });
    setEditingReward(null);
  };

  const getTypeColor = (type) => {
    return type === 'project' 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  // Toggle points sort: default -> asc -> desc -> default
  const handlePointsSortToggle = () => {
    if (pointsSort === 'default') {
      setPointsSort('asc');
    } else if (pointsSort === 'asc') {
      setPointsSort('desc');
    } else {
      setPointsSort('default');
    }
  };

  // Filter and sort rewards
  const filteredAndSortedRewards = React.useMemo(() => {
    let filtered = rewards;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(reward => reward.type === typeFilter);
    }

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(reward => reward.is_active);
    }

    // Sort by points
    if (pointsSort === 'default') {
      return filtered;
    }

    const sorted = [...filtered];
    if (pointsSort === 'asc') {
      return sorted.sort((a, b) => a.points_required - b.points_required);
    } else if (pointsSort === 'desc') {
      return sorted.sort((a, b) => b.points_required - a.points_required);
    }

    return filtered;
  }, [rewards, typeFilter, showInactive, pointsSort]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-blackText dark:text-white">
          Zarządzanie nagrodami ({filteredAndSortedRewards.length})
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => {
              resetForm();
              setEditingReward(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md shadow-sm hover:opacity-90 transition-opacity duration-200 text-sm"
          >
            Utwórz nagrodę
          </button>
          
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Type Filter Dropdown */}
          <div className="type-filter-dropdown relative">
            <button
              onClick={() => setShowTypeFilterDropdown((prev) => !prev)}
              className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                typeFilter !== 'all'
                  ? 'bg-primaryBlue text-white'
                  : 'bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder'
              }`}
            >
              <span>{typeFilter === 'all' ? 'Wszystkie typy' : typeFilter === 'project' ? 'Projekt' : 'Film YT'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTypeFilterDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-md border border-gray-200 z-[9999] animate-slideUp">
                <div
                  onClick={() => {
                    setTypeFilter('all');
                    setShowTypeFilterDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                >
                  Wszystkie typy
                </div>
                <div
                  onClick={() => {
                    setTypeFilter('project');
                    setShowTypeFilterDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                >
                  Projekt
                </div>
                <div
                  onClick={() => {
                    setTypeFilter('video');
                    setShowTypeFilterDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                >
                  Film YT
                </div>
              </div>
            )}
          </div>

          {/* Show Inactive Filter */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              showInactive
                ? 'bg-primaryBlue text-white'
                : 'bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder'
            }`}
          >
            {showInactive ? 'Pokaż nieaktywne' : 'Ukryj nieaktywne'}
          </button>

          {/* Points Sort */}
          <button
            onClick={handlePointsSortToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              pointsSort !== 'default'
                ? 'bg-primaryBlue text-white'
                : 'bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder'
            }`}
          >
            {pointsSort === 'asc' && <ArrowUp size={16} />}
            {pointsSort === 'desc' && <ArrowDown size={16} />}
            <span>{pointsSort === 'default' ? 'Sortuj punkty' : pointsSort === 'asc' ? 'Rosnące' : 'Malejące'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ładowanie nagród...
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Brak nagród</p>
          <p className="text-sm">Kliknij "Utwórz nagrodę" aby rozpocząć</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedRewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-white/80 dark:bg-DarkblackBorder rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-DarkblackText flex flex-col ${
                !reward.is_active ? 'opacity-50' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${getTypeColor(reward.type)}`}>
                    {reward.type === 'project' ? 'Projekt' : 'Film YT'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(reward)}
                      className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md transition-colors"
                      title="Edytuj"
                    >
                      <Edit3 size={16} className="text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md transition-colors"
                      title="Usuń"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1.5 text-blackText dark:text-white line-clamp-2">
                  {reward.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {reward.description}
                </p>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md mb-3">
                  <a 
                    href={reward.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 dark:text-blue-300 hover:underline truncate max-w-[200px]"
                  >
                    {reward.link}
                  </a>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-DarkblackText rounded-md w-fit">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {reward.points_required} punktów
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-blackText dark:text-white">
                  {editingReward ? 'Edytuj nagrodę' : 'Utwórz nową nagrodę'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Tytuł nagrody *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Np. Projekt: Aplikacja To-Do"
                    className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Opis nagrody *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Opisz nagrodę..."
                    rows="3"
                    className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                      Typ nagrody *
                    </label>
                    <div className="reward-type-dropdown relative">
                      <button
                        type="button"
                        onClick={() => setShowTypeDropdown((prev) => !prev)}
                        className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition flex items-center justify-between text-left"
                      >
                        <span>{formData.type === 'project' ? 'Projekt' : 'Film YT'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
                      </button>
                      {showTypeDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-md border border-gray-200 z-[9999] animate-slideUp">
                          <div
                            onClick={() => {
                              setFormData(prev => ({ ...prev, type: 'project' }));
                              setShowTypeDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                          >
                            Projekt
                          </div>
                          <div
                            onClick={() => {
                              setFormData(prev => ({ ...prev, type: 'video' }));
                              setShowTypeDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                          >
                            Film YT
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                      Wymagane punkty *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.points_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
                      className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Link (URL) *
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://github.com/example/project lub https://youtube.com/..."
                    className="w-full border rounded-md p-2 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primaryBlue focus:ring-primaryBlue"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-blackText dark:text-white">
                    Nagroda aktywna (widoczna dla użytkowników)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-DarkblackBorder">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md bg-primaryBlue dark:bg-primaryGreen text-white font-medium shadow-sm hover:opacity-90 transition-opacity duration-200"
                  >
                    {editingReward ? 'Zaktualizuj' : 'Utwórz'} nagrodę
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

