import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Check, ShoppingBag, Award, TrendingUp } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import supabase from '../../../util/supabaseClient';

export default function ShopPanel({ course, isDark, setActivePage }) {
  const toast = useToast();
  const { user, purchasedCourses, fetchUserData, canPurchaseCourses, maturaDate } = useAuthStore();
  const { addItem, isInCart } = useCartStore();
  const [coursePackages, setCoursePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packageDetails, setPackageDetails] = useState({});

  const getRandomGradient = (index) => {
    const gradients = [
      'from-blue-300 to-blue-400',
      'from-green-300 to-green-400',
      'from-purple-300 to-purple-400',
      'from-indigo-300 to-indigo-400',
      'from-teal-300 to-teal-400',
      'from-cyan-300 to-cyan-400',
      'from-slate-300 to-slate-400',
      'from-gray-300 to-gray-400'
    ];
    return gradients[index % gradients.length];
  };

  useEffect(() => {
    fetchCoursePackages();
  }, [course?.id]);

  const fetchCoursePackages = async () => {
    if (!course?.id) return;

    try {
      setLoading(true);
      
      // Pobierz wszystkie sekcje dla danego kursu z kolejnością
      const { data: sections, error: sectionsError } = await supabase
        .from('video_base')
        .select('section_id, section_title, order')
        .eq('course_id', course.id)
        .not('section_id', 'is', null)
        .order('order', { ascending: true });

      if (sectionsError) throw sectionsError;

      // Pobierz unikalne sekcje z zachowaniem kolejności
      const uniqueSections = sections.reduce((acc, section) => {
        if (!acc.find(s => s.section_id === section.section_id)) {
          acc.push(section);
        }
        return acc;
      }, []);

      // Pobierz informacje o pakietach kursów
      const sectionIds = uniqueSections.map(s => s.section_id);
      const { data: packages, error: packagesError } = await supabase
        .from('courses')
        .select('id, title, description, price_cents, image_url, stripe_payment_link, order')
        .in('id', sectionIds)
        .order('order', { ascending: true });

      if (packagesError) throw packagesError;

      // Połącz dane sekcji z pakietami
      const packagesWithSections = packages?.map(pkg => {
        const sectionInfo = uniqueSections.find(s => s.section_id === pkg.id);
        return {
          ...pkg,
          section_title: sectionInfo?.section_title || pkg.title,
          section_id: pkg.id,
          order: pkg.order || 999
        };
      }) || [];

      setCoursePackages(packagesWithSections);

      // Pobierz informacje o sekcjach dla każdego pakietu
      const details = {};
      for (const pkg of packagesWithSections) {
        const { data: videos, error: videosError } = await supabase
          .from('video_base')
          .select('section_title')
          .eq('section_id', pkg.id)
          .eq('course_id', course.id);

        if (!videosError && videos) {
          // Pobierz unikalne nazwy sekcji
          const uniqueSections = [...new Set(videos.map(v => v.section_title).filter(Boolean))];

          details[pkg.id] = {
            totalLessons: videos.length,
            sections: uniqueSections.length,
            sectionNames: uniqueSections
          };
        }
      }
      setPackageDetails(details);
    } catch (error) {
      console.error('Error fetching course packages:', error);
      toast.error('Nie udało się pobrać pakietów kursów');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (packageId) => {
    if (!user) {
      toast.error("Musisz być zalogowany, żeby dodać produkt do koszyka.");
      return;
    }

    // Check if user has set matura date
    if (!canPurchaseCourses()) {
      toast.error("Musisz ustawić datę matury w profilu, aby móc kupować kursy.");
      return;
    }

    const packageData = coursePackages.find(pkg => pkg.id === packageId);
    if (!packageData) {
      toast.error("Nie udało się pobrać informacji o pakiecie.");
      return;
    }

    addItem(packageId, packageData, coursePackages);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full md:min-h-[96vh] p-3">
        <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
          Sklep
        </span>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
        </div>
      </div>
    );
  }

  // Oblicz procent zakupionych sekcji
  const allSectionIds = coursePackages.map(pkg => pkg.id);
  const purchasedSectionIds = allSectionIds.filter(sectionId => 
    purchasedCourses.includes(sectionId)
  );
  const purchasedSectionsPercentage = allSectionIds.length > 0 
    ? Math.round((purchasedSectionIds.length / allSectionIds.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8 w-full md:min-h-[96vh] p-3">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
        Sklep
      </span>

      {/* Procent zakupionych sekcji */}
      {coursePackages.length > 0 && (
        <div className="relative bg-white dark:bg-DarkblackText rounded-lg shadow-md p-4 border border-primaryBlue/10 dark:border-primaryGreen/10 overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Lewa strona - ikona i tekst */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primaryBlue dark:bg-primaryGreen flex items-center justify-center shadow-md">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blackText dark:text-white">
                  Zakupione sekcje
                </h3>
                <p className="text-xs text-primaryBlue/70 dark:text-primaryGreen/70">
                  {purchasedSectionIds.length} z {allSectionIds.length} sekcji
                </p>
              </div>
            </div>

            {/* Prawa strona - procent i pasek */}
            <div className="flex-1 sm:max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-primaryBlue dark:text-primaryGreen" />
                  <span className="text-xs font-medium text-primaryBlue/80 dark:text-primaryGreen/80">
                    Postęp
                  </span>
                </div>
                <span className="text-2xl font-bold text-primaryBlue dark:text-primaryGreen">
                  {purchasedSectionsPercentage}%
                </span>
              </div>
              
              {/* Pasek postępu */}
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primaryBlue dark:bg-primaryGreen transition-all duration-700 ease-out"
                  style={{
                    width: `${purchasedSectionsPercentage}%`,
                  }}
                ></div>
              </div>
              
              {/* Dodatkowy wskaźnik wizualny */}
              {purchasedSectionsPercentage === 100 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <Award size={12} className="animate-bounce" />
                  <span className="font-medium">Wszystkie sekcje zakupione!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coursePackages.map((pkg, index) => {
          const isPurchased = purchasedCourses.includes(pkg.id);
          const inCart = isInCart(pkg.id);
          // price_cents w bazie jest w złotych, więc wyświetlamy bezpośrednio
          const priceInZloty = pkg.price_cents.toFixed(2);
          const details = packageDetails[pkg.id];
          
          // Sprawdź czy poprzedni pakiet został zakupiony LUB jest w koszyku
          const previousPackage = index > 0 ? coursePackages[index - 1] : null;
          const previousPackagePurchased = previousPackage ? purchasedCourses.includes(previousPackage.id) : true;
          const previousPackageInCart = previousPackage ? isInCart(previousPackage.id) : true;
          const previousPackageAvailable = previousPackagePurchased || previousPackageInCart;
          const hasMaturaDate = canPurchaseCourses();
          const canPurchase = isPurchased || (index === 0) || previousPackageAvailable;
          const canPurchaseWithMatura = canPurchase && hasMaturaDate;

          return (
            <div
              key={pkg.id}
              className={`relative bg-white dark:bg-DarkblackText rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                isPurchased 
                  ? 'bg-green-50/30 dark:bg-green-900/10' 
                  : 'bg-gray-50/50 dark:bg-gray-800/50 shadow-gray-200 dark:shadow-gray-700'
              } ${!canPurchaseWithMatura ? 'opacity-60' : ''}`}
            >
              {/* Top Banner */}
              <div className={`relative h-16 bg-gradient-to-r ${getRandomGradient(index)} overflow-hidden`}>
                {/* Wzór w tle */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 left-4 w-6 h-6 border border-white/40 rounded-full"></div>
                  <div className="absolute top-6 right-8 w-4 h-4 border border-white/40 rounded-full"></div>
                  <div className="absolute bottom-3 left-8 w-5 h-5 border border-white/40 rounded-full"></div>
                  <div className="absolute top-3 right-4 w-3 h-3 border border-white/40 rounded-full"></div>
                </div>
                
                {/* Nazwa pakietu */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-lg font-bold text-white drop-shadow-lg tracking-wide">
                    {pkg.section_title.toUpperCase()}
                  </h2>
                </div>
              </div>

              {/* Główna zawartość */}
              <div className="p-4">
                {/* Opis */}
                {pkg.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-left text-sm leading-relaxed">
                    {pkg.description}
                  </p>
                )}
                
                {/* Co zawiera pakiet */}
                {details && details.sectionNames && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
                      Co zawiera pakiet:
                    </h4>
                    
                    <div className="space-y-1">
                      {details.sectionNames.map((sectionName, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-600 dark:bg-primaryGreen rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={8} className="text-white" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 text-xs">
                            {sectionName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Cena */}
                <div className="mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Koszt pakietu:</span>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {priceInZloty} zł
                  </div>
                </div>
              </div>
              
              {/* Przycisk na samym dole */}
              <div className="p-4 pt-1">
                {isPurchased ? (
                  <div className="w-full py-2.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center font-semibold text-sm shadow-sm border border-green-200 dark:border-green-700">
                    ✓ Zakupione
                  </div>
                ) : inCart ? (
                  <div className="w-full py-2.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center font-semibold text-sm shadow-sm border border-green-200 dark:border-green-700 flex items-center justify-center gap-2">
                    <Check size={16} />
                    W koszyku
                  </div>
                ) : canPurchaseWithMatura ? (
                  <button
                    onClick={() => handleAddToCart(pkg.id)}
                    className="w-full py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingBasket size={16} />
                    Dodaj do koszyka
                  </button>
                ) : !hasMaturaDate ? (
                  <button
                    onClick={() => setActivePage("profile")}
                    className="w-full py-2.5 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-lg text-center font-semibold text-sm hover:bg-orange-300 dark:hover:bg-orange-700 transition-colors cursor-pointer"
                  >
                    Ustaw datę matury w profilu
                  </button>
                ) : (
                  <div className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-center font-semibold text-sm">
                    Kup poprzedni pakiet, aby odblokować
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {coursePackages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <ShoppingBasket size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Brak dostępnych pakietów</p>
          <p className="text-sm text-center">
            Obecnie nie ma dostępnych pakietów kursów dla tego kursu.
          </p>
        </div>
      )}
    </div>
  );
}