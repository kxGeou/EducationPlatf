import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Crown, Users, ChevronLeft, ChevronRight, Calendar, User, HelpCircle, X, Video, BookOpen, Zap, Flame, CheckCircle, FileText } from 'lucide-react';
import supabase from '../../../util/supabaseClient';
import { useAuthStore } from '../../../store/authStore';
import Avatar from 'boring-avatars';

const Leaderboard = ({ setActivePage }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const usersPerPage = 6;
  const { user, userPoints, maturaDate } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage, maturaDate]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('id, points, full_name, matura_date')
        .order('points', { ascending: false, nullsLast: true });

      if (error) throw error;
      
      // Filter users by matura year if set
      let filteredUsers = allUsers || [];
      if (maturaDate) {
        const maturaYear = maturaDate.split('-')[0];
        filteredUsers = allUsers.filter(u => u.matura_date && u.matura_date.startsWith(maturaYear));
      }
      
      setTotalUsers(filteredUsers.length);
      
      // Paginate results
      const offset = (currentPage - 1) * usersPerPage;
      const paginatedUsers = filteredUsers.slice(offset, offset + usersPerPage);
      
      const leaderboardData = paginatedUsers.map((user, index) => ({
        id: user.id,
        full_name: user.full_name || 'Użytkownik',
        email: '',
        points: user.points || 0,
        rank: offset + index + 1,
        matura_date: user.matura_date
      }));
      
      setLeaderboard(leaderboardData);
      
      // Find current user's rank
      if (user) {
        const userRank = filteredUsers.findIndex(u => u.id === user.id);
        if (userRank !== -1) {
          setCurrentUserRank({
            rank: userRank + 1,
            points: userPoints || 0
          });
        } else {
          setCurrentUserRank(null);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-6 ">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
          <h2 className="text-xl font-bold text-primaryBlue dark:text-primaryGreen">Ranking użytkowników</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-6">
        <div className="text-center text-red-500">
          <p>Błąd ładowania rankingu: {error}</p>
        </div>
      </div>
    );
  }

  const pointsActivities = [
    { icon: <Video className="w-5 h-5" />, activity: 'Recenzja filmu', points: 20, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: <Video className="w-5 h-5" />, activity: 'Obejrzenie filmu', points: 10, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: <CheckCircle className="w-5 h-5" />, activity: 'Wykonanie zadania', points: 15, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { icon: <BookOpen className="w-5 h-5" />, activity: 'Zrobienie fiszki', points: 5, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: <Flame className="w-5 h-5" />, activity: 'Codzienna aktywność', points: 5, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    { icon: <FileText className="w-5 h-5" />, activity: 'Wypełnienie ankiety', points: 10, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { icon: <Zap className="w-5 h-5" />, activity: 'Dodanie pomysłu', points: 5, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-l-4 border-primaryBlue dark:border-primaryGreen pl-3 mb-4 mt-20 md:mt-3">
        <h2 className="text-lg font-semibold text-primaryBlue dark:text-primaryGreen">
          {maturaDate ? `Ranking użytkowników - Matura ${maturaDate.split('-')[0]}` : 'Ranking użytkowników'}
        </h2>
        <button
          onClick={() => setShowPointsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
        >
          <HelpCircle size={18} />
          <span className="hidden sm:inline">Jak zdobyć punkty?</span>
          <span className="sm:hidden">Punkty</span>
        </button>
      </div>

      {/* Modal - Jak zdobyć punkty */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPointsModal(false)}>
          <div className="bg-white dark:bg-DarkblackText rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-DarkblackText border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primaryBlue dark:bg-primaryGreen rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Jak zdobyć punkty?</h3>
              </div>
              <button
                onClick={() => setShowPointsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Zdobywaj punkty wykonując różne aktywności na platformie i wspinaj się w rankingu!
              </p>

              <div className="space-y-3">
                {pointsActivities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-DarkblackBorder rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">{item.activity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg text-primaryBlue dark:text-primaryGreen">
                        +{item.points}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">pkt</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Wskazówka!</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Im więcej punktów zdobędziesz, tym wyżej znajdziesz się w rankingu swojego rocznika maturalnego. Bądź aktywny każdego dnia!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-DarkblackBorder border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowPointsModal(false)}
                className="w-full py-3 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:opacity-90 transition-all font-medium"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}


      {!maturaDate && (
        <div className="w-full">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-[12px] p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-primaryBlue dark:bg-primaryGreen rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Ranking nie jest jeszcze dostępny
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                  Aby zobaczyć ranking uczniów z Twojego rocznika matury, najpierw ustaw swoją datę matury w profilu użytkownika.
                </p>
              </div>
              
              {/* Call to action */}
              <div
               onClick={() => setActivePage("profile")}
              className="bg-white dark:bg-DarkblackText rounded-[8px] p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-primaryBlue dark:text-primaryGreen" />
                  <span>Przejdź do profilu → Ustaw datę matury</span>
                </div>
              </div>
              
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tylko Twój rocznik</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sprawiedliwe porównanie</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Motywacja do nauki</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {maturaDate && (
        <>
          {currentUserRank && (
        <div className="mb-6 p-4 bg-white shadow-md dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={user?.user_metadata?.full_name || 'Użytkownik'}
                colors={['#0056d6', '#669c35', '#ffffff', '#74a7fe', '#cce8b5']}
                variant="beam"
                size={40}
              />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {user?.user_metadata?.full_name || 'Użytkownik'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Twoja pozycja w rankingu matury {maturaDate.split('-')[0]}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {getRankIcon(currentUserRank.rank)}
                <span className="text-lg font-bold text-gray-800 dark:text-white">
                  {currentUserRank.points} pkt
                </span>
              </div>
            </div>
          </div>
        </div>
          )}

          <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
              user.id === user?.id 
                ? 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600' 
                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankBadge(user.rank)}`}>
              {getRankIcon(user.rank)}
            </div>

            <Avatar
              name={user.full_name || 'Użytkownik'}
              colors={['#0056d6', '#669c35', '#ffffff', '#74a7fe', '#cce8b5']}
              variant="beam"
              size={40}
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                {user.full_name || 'Użytkownik'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-gray-800 dark:text-white">
                  {user.points}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">punktów</p>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setActivePage('profile')}
              className="ml-3 p-2 text-gray-600 dark:text-gray-400 hover:text-primaryBlue dark:hover:text-primaryGreen hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Przejdź do profilu"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        ))}
          </div>

          {totalUsers > usersPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Strona {currentPage} z {Math.ceil(totalUsers / usersPerPage)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalUsers / usersPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(totalUsers / usersPerPage)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{totalUsers} użytkowników</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Najwyższy wynik: {leaderboard[0]?.points || 0} pkt</span>
          </div>
        </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
