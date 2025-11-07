import { useState, useEffect } from 'react';
import { 
  Gift, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  X, 
  Video,
  Code,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import supabase from '../../../util/supabaseClient';
import { toast } from '../../../utils/toast';

export default function RewardsManagement({ isDark }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const getTypeIcon = (type) => {
    return type === 'project' ? <Code className="w-4 h-4" /> : <Video className="w-4 h-4" />;
  };

  const getTypeColor = (type) => {
    return type === 'project' 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
          <Gift size={20} className="sm:w-6 sm:h-6" />
          Zarządzanie nagrodami ({rewards.length})
        </h2>
        <button
          onClick={() => {
            resetForm();
            setEditingReward(null);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 w-full sm:w-auto"
        >
          <PlusCircle size={18} />
          <span className="text-sm sm:text-base">Utwórz nagrodę</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ładowanie nagród...
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-DarkblackBorder rounded-2xl border border-gray-200 dark:border-DarkblackText">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Brak nagród</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kliknij "Utwórz nagrodę" aby rozpocząć</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-white/80 dark:bg-DarkblackBorder rounded-2xl shadow-lg p-4 sm:p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                reward.is_active 
                  ? 'border-gray-200 dark:border-DarkblackText' 
                  : 'border-gray-300 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(reward.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reward.type)}`}>
                    {reward.type === 'project' ? 'Projekt' : 'Film YT'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(reward)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-lg transition-colors"
                    title="Edytuj"
                  >
                    <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-blackText dark:text-white line-clamp-2">
                {reward.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {reward.description}
              </p>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {reward.points_required} punktów
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(reward)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    reward.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {reward.is_active ? 'Aktywna' : 'Nieaktywna'}
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <a 
                  href={reward.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primaryBlue dark:text-primaryGreen hover:underline truncate block"
                >
                  {reward.link}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-3 sm:p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-blackText dark:text-white flex items-center gap-2">
                  <Gift size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">
                    {editingReward ? 'Edytuj nagrodę' : 'Utwórz nową nagrodę'}
                  </span>
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
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
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
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                      Typ nagrody *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                      required
                    >
                      <option value="project">Projekt</option>
                      <option value="video">Film YT</option>
                    </select>
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
                      className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
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
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
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
                    className="px-6 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-primaryBlue dark:bg-primaryGreen text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                  >
                    {editingReward ? 'Zaktualizuj' : 'Utwórz'} nagrodę
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

