import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Crown, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import supabase from '../../../util/supabaseClient';
import { useAuthStore } from '../../../store/authStore';
import Avatar from 'boring-avatars';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 6;
  const { user, userPoints } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      setTotalUsers(count || 0);
      
      const offset = (currentPage - 1) * usersPerPage;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, points, full_name')
        .order('points', { ascending: false, nullsLast: true })
        .range(offset, offset + usersPerPage - 1);

      if (error) throw error;
      
      const leaderboardData = data?.map((user, index) => ({
        id: user.id,
        full_name: user.full_name || 'Użytkownik',
        email: '',
        points: user.points || 0,
        rank: offset + index + 1 
      })) || [];
      
      setLeaderboard(leaderboardData);
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

  const currentUserRank = leaderboard.find(u => u.id === user?.id);

  if (loading) {
    return (
      <div className="bg-white dark:bg-DarkblackBorder rounded-xl shadow-lg p-6">
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

  return (
    <div className="w-full">
      <div className="flex items-center border-l-4 border-primaryBlue dark:border-primaryGreen pl-3 mb-4 mt-2">
        <h2 className="text-lg font-semibold text-primaryBlue dark:text-primaryGreen ">Ranking użytkowników</h2>
      </div>

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
                <p className="text-sm text-gray-600 dark:text-gray-400">Twoja pozycja</p>
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
    </div>
  );
};

export default Leaderboard;
