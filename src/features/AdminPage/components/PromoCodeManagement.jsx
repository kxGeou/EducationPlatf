import { useState, useEffect } from 'react';
import { 
  Tag, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  X,
  CheckCircle,
  XCircle,
  Percent,
  DollarSign,
  Calendar,
  Users,
  User
} from 'lucide-react';
import { usePromoCodeStore } from '../../../store/promoCodeStore';
import { useToast } from '../../../context/ToastContext';

export default function PromoCodeManagement({ isDark }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [usageStats, setUsageStats] = useState({});
  
  const {
    promoCodes,
    loading,
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActive,
    getUsageStats
  } = usePromoCodeStore();
  
  const toast = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    is_active: true,
    valid_from: '',
    valid_until: '',
    max_uses_global: '',
    max_uses_per_user: '',
    is_single_use: false,
    description: ''
  });

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  useEffect(() => {
    // Pobierz statystyki dla wszystkich kodów
    const fetchStats = async () => {
      const stats = {};
      for (const code of promoCodes) {
        const stat = await getUsageStats(code.id);
        stats[code.id] = stat;
      }
      setUsageStats(stats);
    };

    if (promoCodes.length > 0) {
      fetchStats();
    }
  }, [promoCodes, getUsageStats]);

  const filteredCodes = promoCodes.filter(code => {
    if (filterActive === 'active') return code.is_active;
    if (filterActive === 'inactive') return !code.is_active;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('Wprowadź kod promocyjny');
      return;
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      toast.error('Wartość zniżki musi być większa od 0');
      return;
    }

    try {
      const codeData = {
        ...formData,
        discount_value: parseInt(formData.discount_value),
        max_uses_global: formData.max_uses_global ? parseInt(formData.max_uses_global) : null,
        max_uses_per_user: formData.max_uses_per_user ? parseInt(formData.max_uses_per_user) : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null
      };

      if (editingCode) {
        await updatePromoCode(editingCode.id, codeData);
        setEditingCode(null);
      } else {
        await createPromoCode(codeData);
      }

      resetForm();
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('Error saving promo code:', error);
    }
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_type: code.discount_type,
      discount_value: code.discount_value.toString(),
      is_active: code.is_active,
      valid_from: code.valid_from ? code.valid_from.split('T')[0] : '',
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      max_uses_global: code.max_uses_global?.toString() || '',
      max_uses_per_user: code.max_uses_per_user?.toString() || '',
      is_single_use: code.is_single_use,
      description: code.description || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten kod promocyjny?')) {
      await deletePromoCode(id);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      is_active: true,
      valid_from: '',
      valid_until: '',
      max_uses_global: '',
      max_uses_per_user: '',
      is_single_use: false,
      description: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Bezterminowo';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const isCodeValid = (code) => {
    const now = new Date();
    if (!code.is_active) return false;
    if (code.valid_from && new Date(code.valid_from) > now) return false;
    if (code.valid_until && new Date(code.valid_until) < now) return false;
    return true;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
          <Tag size={20} className="sm:w-6 sm:h-6" />
          Kody promocyjne ({promoCodes.length})
        </h2>
        <div className="flex gap-3">
          <div className="flex gap-2 bg-gray-100 dark:bg-DarkblackText rounded-lg p-1">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                filterActive === 'all'
                  ? 'bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                filterActive === 'active'
                  ? 'bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Aktywne
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                filterActive === 'inactive'
                  ? 'bg-white dark:bg-DarkblackBorder text-blackText dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Nieaktywne
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingCode(null);
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
          >
            <PlusCircle size={18} />
            <span className="text-sm sm:text-base">Utwórz kod</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ładowanie kodów promocyjnych...
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Tag size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Brak kodów promocyjnych</p>
          <p className="text-sm">Kliknij "Utwórz kod" aby rozpocząć</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredCodes.map((code) => {
            const stats = usageStats[code.id] || { totalUses: 0, uniqueUsers: 0, totalDiscount: 0 };
            const valid = isCodeValid(code);
            
            return (
              <div
                key={code.id}
                className={`bg-white/80 dark:bg-DarkblackBorder rounded-2xl shadow-lg p-4 sm:p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  valid ? 'border-green-200 dark:border-green-900/30' : 'border-gray-100 dark:border-DarkblackText'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {code.discount_type === 'percentage' ? (
                      <Percent size={20} className="text-primaryBlue dark:text-primaryGreen" />
                    ) : (
                      <DollarSign size={20} className="text-primaryBlue dark:text-primaryGreen" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-blackText dark:text-white font-mono">
                          {code.code}
                        </span>
                        {valid ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        code.discount_type === 'percentage'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {code.discount_type === 'percentage' 
                          ? `${code.discount_value}%` 
                          : `${code.discount_value.toFixed(2)} zł`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(code)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-lg transition-colors"
                      title="Edytuj"
                    >
                      <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Usuń"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                {code.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {code.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {code.valid_from || code.valid_until ? (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>
                        {code.valid_from 
                          ? formatDate(code.valid_from) 
                          : 'Od zawsze'} - {code.valid_until 
                          ? formatDate(code.valid_until) 
                          : 'Bezterminowo'}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-4">
                    {code.max_uses_global && (
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>Max: {code.max_uses_global}</span>
                      </div>
                    )}
                    {code.max_uses_per_user && (
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Per user: {code.max_uses_per_user}</span>
                      </div>
                    )}
                    {code.is_single_use && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs font-medium">
                        Jednorazowy
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span>Użycia:</span>
                      <span className="font-semibold text-blackText dark:text-white">
                        {stats.totalUses} {stats.uniqueUsers > 0 && `(${stats.uniqueUsers} użytkowników)`}
                      </span>
                    </div>
                    {stats.totalDiscount > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <span>Zniżka łącznie:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {(stats.totalDiscount / 100).toFixed(2)} zł
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tworzenia/edycji */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText flex items-center justify-between">
              <h3 className="text-xl font-bold text-blackText dark:text-white">
                {editingCode ? 'Edytuj kod promocyjny' : 'Utwórz kod promocyjny'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                  setEditingCode(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kod promocyjny *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white font-mono"
                  placeholder="SUMMER2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Typ zniżki *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="percentage"
                      checked={formData.discount_type === 'percentage'}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="text-primaryBlue dark:text-primaryGreen"
                    />
                    <span>Procentowy (%)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="fixed"
                      checked={formData.discount_type === 'fixed'}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="text-primaryBlue dark:text-primaryGreen"
                    />
                    <span>Kwotowy (zł)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Wartość zniżki * {formData.discount_type === 'percentage' ? '(%)' : '(w złotych, np. 50 = 50 zł)'}
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ważny od (opcjonalnie)
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ważny do (opcjonalnie)
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max użyć globalnie (opcjonalnie)
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses_global}
                    onChange={(e) => setFormData({ ...formData, max_uses_global: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max użyć per użytkownik (opcjonalnie)
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses_per_user}
                    onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_single_use"
                  checked={formData.is_single_use}
                  onChange={(e) => setFormData({ ...formData, is_single_use: e.target.checked })}
                  className="text-primaryBlue dark:text-primaryGreen"
                />
                <label htmlFor="is_single_use" className="text-sm text-gray-700 dark:text-gray-300">
                  Kod jednorazowy (jeden użytkownik może użyć tylko raz)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="text-primaryBlue dark:text-primaryGreen"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  Kod aktywny
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-DarkblackText rounded-lg bg-white dark:bg-DarkblackText text-blackText dark:text-white"
                  rows="3"
                  placeholder="Opis kodu dla administratora..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setEditingCode(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg font-medium transition-all hover:opacity-90"
                >
                  {editingCode ? 'Zaktualizuj' : 'Utwórz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

