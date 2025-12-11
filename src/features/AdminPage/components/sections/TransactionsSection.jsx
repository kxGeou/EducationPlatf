import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, User, Calendar, Check, X as XIcon, UserPlus, X } from 'lucide-react';
import { useTransactionStore } from '../../../../store/transactionStore';
import { useToast } from '../../../../context/ToastContext';
import supabase from '../../../../util/supabaseClient';

export default function TransactionsSection({ timeAgo }) {
  const toast = useToast();
  const { transactions, loading, fetchTransactions, manuallyGrantAccess } = useTransactionStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDateDropdown, setOpenDateDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [courseTitles, setCourseTitles] = useState({});
  const [userPurchases, setUserPurchases] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".dropdown")) {
        setOpenDateDropdown(false);
        setOpenStatusDropdown(false);
      }
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    // Pobierz nazwy kursów dla wszystkich transakcji
    const fetchCourseTitles = async () => {
      const allCourseIds = new Set();
      transactions.forEach(transaction => {
        transaction.course_ids?.forEach(id => allCourseIds.add(id));
      });

      if (allCourseIds.size === 0) return;

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', Array.from(allCourseIds));

        if (!error && data) {
          const titlesMap = {};
          data.forEach(course => {
            titlesMap[course.id] = course.title;
          });
          setCourseTitles(titlesMap);
        }
      } catch (err) {
        console.error('Error fetching course titles:', err);
      }
    };

    // Pobierz purchased_courses dla wszystkich użytkowników
    const fetchUserPurchases = async () => {
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      
      if (userIds.length === 0) return;

      try {
        // Pobierz w partiach, aby uniknąć problemów z limitami
        const batchSize = 100;
        const purchasesMap = {};
        
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          const { data, error } = await supabase
            .from('users')
            .select('id, purchased_courses')
            .in('id', batch);

          if (error) {
            console.error('Error fetching user purchases batch:', error);
            console.error('User IDs in batch:', batch);
          } else if (data) {
            data.forEach(user => {
              purchasesMap[user.id] = user.purchased_courses || [];
            });
          }
        }
        
        setUserPurchases(purchasesMap);
      } catch (err) {
        console.error('Error fetching user purchases:', err);
      }
    };

    if (transactions.length > 0) {
      fetchCourseTitles();
      fetchUserPurchases();
    }
  }, [transactions]);

  // Sprawdź czy użytkownik ma wszystkie uprawnienia z transakcji
  const hasAllAccess = (transaction) => {
    const userPurchasesList = userPurchases[transaction.user_id] || [];
    return transaction.course_ids?.every(courseId => userPurchasesList.includes(courseId));
  };

  // Filtrowanie transakcji
  const filteredTransactions = transactions.filter(transaction => {
    // Filtrowanie po statusie
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }

    // Filtrowanie po dacie
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7days' && daysDiff > 7) return false;
      if (dateFilter === '30days' && daysDiff > 30) return false;
    }

    // Wyszukiwanie po numerze transakcji lub emailu
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const transactionNumber = transaction.transaction_number?.toString() || '';
      const userEmail = (transaction.email || transaction.users?.email || '').toLowerCase();
      
      if (!transactionNumber.includes(searchLower) && 
          !userEmail.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const formatted = date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    if (daysDiff === 0) return `${formatted} (dzisiaj)`;
    if (daysDiff === 1) return `${formatted} (wczoraj)`;
    return `${formatted} (${daysDiff} dni temu)`;
  };

  const formatPrice = (cents) => {
    return (cents / 100).toFixed(2) + ' zł';
  };


  const handleOpenManualGrant = (transaction) => {
    setSelectedTransaction(transaction);
    // Zaznacz wszystkie kursy domyślnie
    setSelectedCourses([...transaction.course_ids]);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
    setSelectedCourses([]);
  };

  const handleToggleCourse = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleManualGrant = async () => {
    if (!selectedTransaction || selectedCourses.length === 0) {
      toast.error('Wybierz przynajmniej jeden kurs');
      return;
    }

    const success = await manuallyGrantAccess(selectedTransaction.id, selectedCourses);
    if (success) {
      handleCloseModal();
      // Odśwież dane użytkowników
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      const { data } = await supabase
        .from('users')
        .select('id, purchased_courses')
        .in('id', userIds);
      
      if (data) {
        const purchasesMap = {};
        data.forEach(user => {
          purchasesMap[user.id] = user.purchased_courses || [];
        });
        setUserPurchases(purchasesMap);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-blackText dark:text-white">
          Wszystkie transakcje
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Wyszukiwanie */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Szukaj po numerze, emailu lub nazwie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 dark:bg-DarkblackBorder dark:border-gray-200 dark:text-white rounded-md text-sm w-full sm:w-64"
            />
          </div>

          {/* Filtrowanie po dacie */}
          <div className="dropdown relative">
            <button
              onClick={() => setOpenDateDropdown((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-DarkblackBorder dark:border-gray-200 dark:text-white rounded-md transition text-sm w-full sm:w-auto"
            >
              <Calendar size={16} />
              {dateFilter === 'all' ? 'Wszystkie daty' : 
               dateFilter === '7days' ? 'Ostatnie 7 dni' : 'Ostatnie 30 dni'}
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
            </button>
            {openDateDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-md border border-gray-200 z-[9999] animate-slideUp">
                {[
                  { value: 'all', label: 'Wszystkie daty' },
                  { value: '7days', label: 'Ostatnie 7 dni' },
                  { value: '30days', label: 'Ostatnie 30 dni' }
                ].map(option => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setDateFilter(option.value);
                      setOpenDateDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filtrowanie po statusie */}
          <div className="dropdown relative">
            <button
              onClick={() => setOpenStatusDropdown((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-DarkblackBorder dark:border-gray-200 dark:text-white rounded-md transition text-sm w-full sm:w-auto"
            >
              {statusFilter === 'all' ? 'Wszystkie statusy' : 
               statusFilter === 'completed' ? 'Zakończone' :
               statusFilter === 'pending' ? 'Oczekujące' : 'Nieudane'}
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
            </button>
            {openStatusDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-md border border-gray-200 z-[9999] animate-slideUp">
                {[
                  { value: 'all', label: 'Wszystkie statusy' },
                  { value: 'completed', label: 'Zakończone' },
                  { value: 'pending', label: 'Oczekujące' },
                  { value: 'failed', label: 'Nieudane' }
                ].map(option => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setOpenStatusDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Brak transakcji</p>
          <p className="text-sm">Nie znaleziono transakcji spełniających kryteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const user = transaction.users;
            const needsManualGrant = transaction.status === 'completed' && !hasAllAccess(transaction);
            const transactionCourses = transaction.course_ids?.map(id => courseTitles[id] || `Kurs ${id.slice(0, 8)}`) || [];

            return (
              <div
                key={transaction.id}
                className="bg-white/80 dark:bg-DarkblackBorder backdrop-blur-md p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-DarkblackText"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm font-mono font-bold">
                        #{transaction.transaction_number || transaction.id.slice(0, 8)}
                      </span>
                      {hasAllAccess(transaction) ? (
                        <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center h-full">
                          <Check size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center justify-center h-full">
                          <XIcon size={16} className="text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <p className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
                        <User size={16} />
                        <span>{transaction.email || user?.email || 'Nieznany użytkownik'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
                        <Calendar size={16} />
                        <span>{formatDate(transaction.created_at)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primaryBlue dark:text-primaryGreen mb-2">
                      {formatPrice(transaction.total_amount_cents)}
                    </p>
                    <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {transaction.status === 'completed' ? 'Zakończone' : 
                       transaction.status === 'pending' ? 'Oczekujące' : 'Nieudane'}
                    </span>
                  </div>
                </div>

                {/* Lista produktów */}
                {transactionCourses.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-DarkblackText rounded-md border border-gray-100 dark:border-DarkblackText">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zakupione produkty ({transactionCourses.length}):
                    </p>
                    <ul className="space-y-1">
                      {transactionCourses.map((title, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primaryBlue dark:bg-primaryGreen rounded-full"></span>
                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stripe ID na dole */}
                {transaction.stripe_session_id && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                      Stripe: {transaction.stripe_session_id}
                    </p>
                  </div>
                )}

                {/* Przycisk ręcznego dodania uprawnień */}
                {needsManualGrant && (
                  <button
                    onClick={() => handleOpenManualGrant(transaction)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen hover:opacity-90 text-white rounded-md font-medium transition-opacity duration-200 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    Dodaj uprawnienia ręcznie
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal wyboru kursów */}
      {selectedTransaction && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-DarkblackText flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blackText dark:text-white">
                Dodaj uprawnienia do kursów
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-md transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Wybierz kursy, które chcesz dodać użytkownikowi. Zaznaczone kursy zostaną dodane do uprawnień.
              </p>

              <div className="space-y-3 mb-6">
                {selectedTransaction.course_ids?.map((courseId, index) => {
                  const courseTitle = courseTitles[courseId] || `Kurs ${courseId.slice(0, 8)}`;
                  const isSelected = selectedCourses.includes(courseId);
                  
                  return (
                    <label
                      key={courseId}
                      className={`flex items-start gap-3 p-3 rounded-md border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primaryBlue dark:border-primaryGreen bg-blue-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-DarkblackText hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCourse(courseId)}
                        className="mt-1 w-5 h-5 text-primaryBlue dark:text-primaryGreen border-gray-300 rounded focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-blackText dark:text-white">
                          {courseTitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ID: {courseId}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-DarkblackText rounded-md transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleManualGrant}
                  disabled={selectedCourses.length === 0 || loading}
                  className="px-6 py-2.5 bg-primaryBlue dark:bg-primaryGreen hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-opacity duration-200 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Dodaj wybrane kursy ({selectedCourses.length})
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

