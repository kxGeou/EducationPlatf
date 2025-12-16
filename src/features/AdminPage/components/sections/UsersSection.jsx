import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Users } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import supabase from '../../../../util/supabaseClient';

export default function UsersSection({ timeAgo }) {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Pobierz wszystkich użytkowników z tabeli users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, created_at, purchased_courses, purchased_ebooks, points')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Przygotuj dane użytkowników (email powinien być w users.email)
      const usersWithEmail = (usersData || []).map((user) => ({
        ...user,
        email: user.email || 'Brak emaila',
        created_at: user.created_at || null
      }));

      // Pobierz statystyki progresu dla wszystkich użytkowników
      const userIdsList = usersWithEmail.map(u => u.id);
      
      // Pobierz obejrzane filmy
      const { data: videoProgress, error: videoError } = await supabase
        .from('user_video_progress')
        .select('user_id')
        .eq('watched', true);

      if (videoError) console.error('Error fetching video progress:', videoError);

      // Pobierz ukończone zadania
      const { data: tasksAnswers, error: tasksError } = await supabase
        .from('tasks_answers')
        .select('user_id');

      if (tasksError) console.error('Error fetching tasks answers:', tasksError);

      // Policz statystyki dla każdego użytkownika
      const videoProgressByUser = {};
      (videoProgress || []).forEach(progress => {
        videoProgressByUser[progress.user_id] = (videoProgressByUser[progress.user_id] || 0) + 1;
      });

      const tasksByUser = {};
      (tasksAnswers || []).forEach(answer => {
        tasksByUser[answer.user_id] = (tasksByUser[answer.user_id] || 0) + 1;
      });

      // Połącz dane
      const enrichedUsers = usersWithEmail.map(user => ({
        ...user,
        purchasedCoursesCount: (user.purchased_courses || []).length,
        purchasedEbooksCount: (user.purchased_ebooks || []).length,
        watchedVideosCount: videoProgressByUser[user.id] || 0,
        completedTasksCount: tasksByUser[user.id] || 0,
      }));

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Nie udało się pobrać użytkowników');
    } finally {
      setLoading(false);
    }
  };

  // Sortowanie
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrowanie i sortowanie
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = users;

    // Wyszukiwanie
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const email = (user.email || '').toLowerCase();
        const fullName = (user.full_name || '').toLowerCase();
        return email.includes(searchLower) || fullName.includes(searchLower);
      });
    }

    // Sortowanie
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Obsługa różnych typów danych
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, sortConfig]);

  // Paginacja
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Brak daty';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={16} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="text-primaryBlue dark:text-primaryGreen" />
      : <ChevronDown size={16} className="text-primaryBlue dark:text-primaryGreen" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="font-bold text-lg text-blackText dark:text-white">
          Użytkownicy ({filteredAndSortedUsers.length})
        </h2>
        
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Szukaj po emailu lub nazwisku..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md bg-white dark:bg-DarkblackText text-blackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen w-full sm:w-64"
          />
        </div>
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <div className="bg-white dark:bg-DarkblackBorder rounded-lg p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Nie znaleziono użytkowników pasujących do wyszukiwania' : 'Brak użytkowników'}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-sm border border-gray-200 dark:border-DarkblackText overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-DarkblackText border-b border-gray-200 dark:border-DarkblackBorder">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-DarkblackBorder transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        <SortIcon columnKey="email" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-DarkblackBorder transition-colors"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-2">
                        Imię i nazwisko
                        <SortIcon columnKey="full_name" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-DarkblackBorder transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Data utworzenia
                        <SortIcon columnKey="created_at" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Zakupione kursy
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Zakupione e-booki
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Obejrzane filmy
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ukończone zadania
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-DarkblackBorder transition-colors"
                      onClick={() => handleSort('points')}
                    >
                      <div className="flex items-center gap-2">
                        Punkty
                        <SortIcon columnKey="points" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-DarkblackBorder divide-y divide-gray-200 dark:divide-DarkblackText">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-DarkblackText transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.full_name || 'Brak nazwiska'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                        {user.purchasedCoursesCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                        {user.purchasedEbooksCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                        {user.watchedVideosCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                        {user.completedTasksCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center">
                        {user.points || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Strona {currentPage} z {totalPages} ({filteredAndSortedUsers.length} użytkowników)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-DarkblackText hover:bg-gray-50 dark:hover:bg-DarkblackBorder disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 dark:border-DarkblackBorder rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-DarkblackText hover:bg-gray-50 dark:hover:bg-DarkblackBorder disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

