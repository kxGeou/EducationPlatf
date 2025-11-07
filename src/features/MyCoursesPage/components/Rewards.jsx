import React, { useState, useEffect, useRef } from 'react';
import { Gift, Lock, Unlock, Video, Code, CheckCircle, Star, Trophy, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import supabase from '../../../util/supabaseClient';
import { toast } from '../../../utils/toast';

const Rewards = () => {
  const { user, userPoints } = useAuthStore();
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const isUnlockingRef = useRef(false);

  useEffect(() => {
    if (user) {
      fetchRewards();
      fetchUnlockedRewards();
    }
  }, [user]);

  // Automatyczne odblokowywanie nagród przy osiągnięciu progu punktów (checkpoint system)
  useEffect(() => {
    if (!user || !rewards.length || loading || isUnlockingRef.current) return;

    const autoUnlockRewards = async () => {
      isUnlockingRef.current = true;

      try {
        // Sprawdź które nagrody powinny być odblokowane
        const rewardsToUnlock = rewards.filter(
          (reward) => 
            userPoints >= reward.points_required && 
            !unlockedRewards.includes(reward.id)
        );

        if (rewardsToUnlock.length === 0) {
          isUnlockingRef.current = false;
          return;
        }

        // Odblokuj wszystkie kwalifikujące się nagrody
        const unlockPromises = rewardsToUnlock.map(async (reward) => {
          try {
            // Zapisz do bazy danych
            const { error: dbError } = await supabase
              .from('user_rewards')
              .insert({
                user_id: user.id,
                reward_id: reward.id,
                unlocked_at: new Date().toISOString()
              });

            if (dbError && dbError.code !== '23505') {
              // Jeśli błąd nie jest "duplicate key", spróbuj zapisać do localStorage jako fallback
              if (dbError.code === '42P01') { // Table doesn't exist
                const stored = JSON.parse(localStorage.getItem(`unlockedRewards_${user.id}`) || '[]');
                if (!stored.includes(reward.id)) {
                  stored.push(reward.id);
                  localStorage.setItem(`unlockedRewards_${user.id}`, JSON.stringify(stored));
                }
                return reward.id;
              } else {
                console.error('Error auto-unlocking reward:', dbError);
                return null;
              }
            }

            return reward.id;
          } catch (err) {
            console.error('Error auto-unlocking reward:', err);
            return null;
          }
        });

        const unlockedIds = (await Promise.all(unlockPromises)).filter(Boolean);

        if (unlockedIds.length > 0) {
          // Aktualizuj stan jednocześnie dla wszystkich odblokowanych nagród
          setUnlockedRewards(prev => {
            const newUnlocked = [...prev];
            unlockedIds.forEach(id => {
              if (!newUnlocked.includes(id)) {
                newUnlocked.push(id);
                const reward = rewards.find(r => r.id === id);
                if (reward) {
                  toast.success(`🎉 Odblokowano nagrodę: ${reward.title}!`);
                }
              }
            });
            return newUnlocked;
          });
        }
      } finally {
        isUnlockingRef.current = false;
      }
    };

    autoUnlockRewards();
  }, [user, userPoints, rewards, loading, unlockedRewards]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      toast.error('Błąd podczas ładowania nagród');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlockedRewards = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('reward_id')
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') throw error; // Ignore table not found
      
      const unlockedIds = data?.map(r => r.reward_id) || [];
      setUnlockedRewards(unlockedIds);
    } catch (err) {
      console.error('Error fetching unlocked rewards:', err);
      // Fallback to localStorage
      const stored = localStorage.getItem(`unlockedRewards_${user.id}`);
      if (stored) {
        setUnlockedRewards(JSON.parse(stored));
      }
    }
  };

  const isUnlocked = (rewardId) => unlockedRewards.includes(rewardId);
  const hasEnoughPoints = (pointsRequired) => userPoints >= pointsRequired;

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 border-l-4 border-primaryBlue dark:border-primaryGreen pl-3 mb-6 mt-20 md:mt-3">
            <Gift className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
          <h2 className="text-lg font-semibold text-primaryBlue dark:text-primaryGreen">
            Nagrody
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-[12px] h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 border-l-4 border-primaryBlue dark:border-primaryGreen pl-3 mb-6 mt-20 md:mt-3">
        <Gift className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
        <h2 className="text-lg font-semibold text-primaryBlue dark:text-primaryGreen">
          Nagrody
        </h2>
      </div>

      {/* Points Display - Ulepszony */}
      {rewards.length > 0 && (() => {
        // Znajdź następną nagrodę do odblokowania
        const nextReward = rewards.find(r => !isUnlocked(r.id) && userPoints < r.points_required);
        const progressToNext = nextReward 
          ? Math.min(100, (userPoints / nextReward.points_required) * 100)
          : 100;
        const pointsNeeded = nextReward ? nextReward.points_required - userPoints : 0;

        return (
          <div className="mb-6 p-5 bg-white dark:bg-DarkblackText border border-primaryBlue/20 dark:border-primaryGreen/20 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Lewa strona - Punkty */}
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
                <div>
                  <p className="text-xs font-medium text-primaryBlue/70 dark:text-primaryGreen/70 mb-1">Twoje punkty</p>
                  <div className="flex items-baseline gap-2">
                    <Star className="w-5 h-5 text-primaryBlue dark:text-primaryGreen" fill="currentColor" />
                    <span className="text-3xl font-bold text-blackText dark:text-white">{userPoints || 0}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">pkt</span>
                  </div>
                </div>
              </div>

              {/* Prawa strona - Progress do następnej nagrody */}
              {nextReward && (
                <div className="flex-1 md:max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Do następnej nagrody</span>
                    <span className="text-xs font-semibold text-primaryBlue dark:text-primaryGreen">
                      {pointsNeeded} pkt
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primaryGreen to-secondaryGreen rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progressToNext}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    {nextReward.title}
                  </p>
                </div>
              )}
              
              {/* Jeśli wszystkie nagrody odblokowane */}
              {!nextReward && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Wszystkie nagrody odblokowane! 🎉
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {rewards.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-DarkblackText border border-gray-200 dark:border-DarkblackBorder rounded-[12px] shadow-md">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Brak dostępnych nagród</p>
        </div>
      ) : (
        <div className="relative w-full">
          {/* Vertical Path Container */}
          <div className="relative max-w-7xl mx-auto">
            {/* Central Path Line - Background (szersza i bardziej widoczna) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gray-200/50 dark:bg-gray-700/50 z-0 rounded-full transform -translate-x-1/2"></div>
            
            {/* Central Path Line - Progress (zielona linia z gradientem i animacją) - bazuje na faktycznych punktach */}
            {(() => {
              if (rewards.length === 0) return null;
              
              // Znajdź najwyższą nagrodę, której wymagane punkty są mniejsze lub równe punktom użytkownika
              let lastAchievedIndex = -1;
              for (let i = rewards.length - 1; i >= 0; i--) {
                if (userPoints >= rewards[i].points_required) {
                  lastAchievedIndex = i;
                  break;
                }
              }
              
              // Oblicz procent postępu między ostatnią osiągniętą nagrodą a następną
              const totalItems = rewards.length;
              const approximateHeightPerItem = 100 / totalItems;
              
              let progressPercentage = 0;
              
              if (lastAchievedIndex >= 0) {
                // Użytkownik osiągnął przynajmniej jedną nagrodę
                const lastAchievedPoints = rewards[lastAchievedIndex].points_required;
                
                if (lastAchievedIndex < rewards.length - 1) {
                  // Jest jeszcze następna nagroda
                  const nextRewardPoints = rewards[lastAchievedIndex + 1].points_required;
                  const pointsRange = nextRewardPoints - lastAchievedPoints;
                  const userProgress = userPoints - lastAchievedPoints;
                  const progressBetweenRewards = Math.min(1, Math.max(0, userProgress / pointsRange));
                  
                  // Pozycja ostatniej osiągniętej nagrody + procent postępu do następnej
                  progressPercentage = (lastAchievedIndex * approximateHeightPerItem) + (approximateHeightPerItem / 2) + (approximateHeightPerItem * progressBetweenRewards);
                } else {
                  // Użytkownik osiągnął wszystkie nagrody
                  progressPercentage = 100;
                }
              } else {
                // Użytkownik nie osiągnął jeszcze żadnej nagrody
                const firstRewardPoints = rewards[0].points_required;
                if (userPoints > 0 && firstRewardPoints > 0) {
                  const progressToFirst = Math.min(1, userPoints / firstRewardPoints);
                  progressPercentage = (approximateHeightPerItem / 2) * progressToFirst;
                }
              }
              
              if (progressPercentage <= 0) return null;
              
              return (
                <div
                  className="absolute left-1/2 top-0 w-1.5 bg-gradient-to-b from-primaryGreen via-secondaryGreen to-primaryGreen z-10 rounded-full transform -translate-x-1/2 transition-all duration-700 shadow-lg shadow-primaryGreen/30"
                  style={{
                    height: `${Math.min(100, progressPercentage)}%`,
                    background: 'linear-gradient(180deg, #17d19b 0%, #00bfaf 50%, #17d19b 100%)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                >
                  {/* Efekt świecenia */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primaryGreen/50 to-transparent rounded-full animate-pulse"></div>
                </div>
              );
            })()}

            {/* Rewards Path - Vertical Layout - karty naprzemiennie lewo/prawo, ale dłuższe */}
            <div className="relative flex flex-col gap-6 md:gap-8">
              {rewards.map((reward, index) => {
                const unlocked = isUnlocked(reward.id);
                const hasEnough = hasEnoughPoints(reward.points_required);
                const isLocked = !unlocked && !hasEnough;
                const isCurrent = !unlocked && hasEnough;
                
                // Alternate left/right positioning
                const isLeft = index % 2 === 0;

                return (
                  <div key={reward.id} className="relative flex items-center" style={{ minHeight: '100px' }}>
                    {/* Reward Card - Naprzemiennie lewo/prawo */}
                    <div
                      className={`relative ${isLeft ? 'mr-[calc(50%+2rem)]' : 'ml-[calc(50%+2rem)]'} w-full`}
                    >
                        <div
                          className={`relative bg-white dark:bg-DarkblackText border rounded-xl shadow-md transition-all duration-300 overflow-hidden ${
                            unlocked
                              ? 'border-0 shadow-primaryGreen/20 dark:shadow-primaryGreen/30'
                              : isCurrent
                              ? 'border-yellow-300 dark:border-yellow-600 shadow-yellow-200 dark:shadow-yellow-900/30'
                              : isLocked
                              ? 'border-gray-200 dark:border-DarkblackBorder opacity-60'
                              : 'border-blue-300 dark:border-blue-600 shadow-blue-200 dark:shadow-blue-900/30'
                          }`}
                        >
                          <div className="p-4 md:p-5">
                            {/* Type Badge */}
                            <div className="flex items-center justify-start mb-3">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                reward.type === 'project'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {reward.type === 'project' ? 'Projekt' : 'Film YT'}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-base md:text-lg text-gray-800 dark:text-white mb-2 line-clamp-2">
                              {reward.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {reward.description}
                            </p>

                            {/* Points */}
                            <div className="flex items-center gap-2 mb-3">
                              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                              <span className={`text-sm font-semibold ${
                                hasEnough 
                                  ? 'text-primaryGreen' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {reward.points_required} pkt
                              </span>
                            </div>

                            {/* Action Button */}
                            {unlocked ? (
                              <a
                                href={reward.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-4 py-2.5 bg-primaryGreen hover:opacity-90 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                <span>Otwórz</span>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : isCurrent ? (
                              <div className="w-full px-4 py-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-yellow-600 dark:border-yellow-400"></div>
                                <span>Odblokowywanie...</span>
                              </div>
                            ) : (
                              <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>Brakuje {Math.max(0, reward.points_required - userPoints)} pkt</span>
                              </div>
                            )}
                          </div>

                          {/* Subtle Lock Overlay for locked rewards */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-white/30 dark:bg-DarkblackText/30 backdrop-blur-[0.5px] rounded-xl pointer-events-none"></div>
                          )}
                        </div>
                      </div>

                      {/* Central Checkpoint - Większa i bardziej widoczna kropka */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
                        {/* Zewnętrzny pierścień dla unlocked */}
                        {unlocked && (
                          <div className="absolute w-8 h-8 rounded-full bg-primaryGreen/20 animate-ping"></div>
                        )}
                        {/* Główna kropka */}
                        <div
                          className={`relative w-5 h-5 rounded-full transition-all duration-500 ${
                            unlocked
                              ? 'bg-primaryGreen shadow-lg shadow-primaryGreen/50 ring-4 ring-primaryGreen/30'
                              : isCurrent
                              ? 'bg-yellow-500 dark:bg-yellow-400 shadow-lg shadow-yellow-500/50 ring-4 ring-yellow-500/30 animate-pulse'
                              : 'bg-gray-400 dark:bg-gray-500 shadow-md ring-2 ring-gray-300/20 dark:ring-gray-600/20'
                          }`}
                        >
                          {/* Wewnętrzny punkt */}
                          <div
                            className={`absolute inset-1 rounded-full ${
                              unlocked
                                ? 'bg-white'
                                : isCurrent
                                ? 'bg-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          ></div>
                          
                          {/* Ikona dla unlocked */}
                          {unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-primaryGreen" fill="currentColor" />
                            </div>
                          )}
                          
                          {/* Ikona dla locked */}
                          {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Linia pomocnicza łącząca kartę z checkpointem - naprzemiennie z lewej/prawej */}
                      <div
                        className={`absolute ${
                          isLeft ? 'right-0' : 'left-0'
                        } top-1/2 transform -translate-y-1/2 z-10 ${
                          isLeft ? 'mr-[calc(50%-2rem)]' : 'ml-[calc(50%-2rem)]'
                        } w-16 h-0.5`}
                        style={{
                          background: isLeft 
                            ? unlocked
                              ? 'linear-gradient(to right, rgba(23, 209, 155, 0.5), transparent)'
                              : isCurrent
                              ? 'linear-gradient(to right, rgba(234, 179, 8, 0.5), transparent)'
                              : 'linear-gradient(to right, rgba(209, 213, 219, 0.3), transparent)'
                            : unlocked
                            ? 'linear-gradient(to left, rgba(23, 209, 155, 0.5), transparent)'
                            : isCurrent
                            ? 'linear-gradient(to left, rgba(234, 179, 8, 0.5), transparent)'
                            : 'linear-gradient(to left, rgba(209, 213, 219, 0.3), transparent)'
                        }}
                      ></div>

                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
