import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, CreditCard, Receipt, Download, FileText, Tag, X, Gift, Check } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { usePromoCodeStore } from '../../../store/promoCodeStore';
import { generateReceiptPDF } from '../../../utils/receiptGenerator';
import supabase from '../../../util/supabaseClient';

export default function CartPanel({ course, isDark, setActiveSection }) {
  const toast = useToast();
  const { user, canPurchaseCourses, fetchUserData, referralDiscountAvailable } = useAuthStore();
  const { 
    getItems, 
    removeItem, 
    getTotalPrice, 
    validateCartOrder, 
    clearCart,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    getPromoDiscount,
    getTotalWithDiscount,
    applyReferralDiscount,
    removeReferralDiscount,
    isReferralDiscountApplied
  } = useCartStore();
  const { validatePromoCode } = usePromoCodeStore();
  const [activeTab, setActiveTab] = useState('cart');
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [coursePackages, setCoursePackages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [applyingPromoCode, setApplyingPromoCode] = useState(false);

  const cartItems = getItems();
  const totalPrice = getTotalPrice();
  const discount = getPromoDiscount();
  const totalWithDiscount = getTotalWithDiscount();

  useEffect(() => {
    if (activeTab === 'receipts') {
      fetchPurchases();
    }
    fetchCoursePackages();
    fetchUserDataForReceipts();
  }, [activeTab, course?.id, user]);

  const fetchUserDataForReceipts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, user_metadata')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setUserData(data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchCoursePackages = async () => {
    if (!course?.id) return;

    try {
      const { data: sections, error: sectionsError } = await supabase
        .from('video_base')
        .select('section_id, section_title, order')
        .eq('course_id', course.id)
        .not('section_id', 'is', null)
        .order('order', { ascending: true });

      if (sectionsError) throw sectionsError;

      const uniqueSections = sections.reduce((acc, section) => {
        if (!acc.find(s => s.section_id === section.section_id)) {
          acc.push(section);
        }
        return acc;
      }, []);

      const sectionIds = uniqueSections.map(s => s.section_id);
      const { data: packages, error: packagesError } = await supabase
        .from('courses')
        .select('id, title, description, price_cents, image_url, order')
        .in('id', sectionIds)
        .order('order', { ascending: true });

      if (packagesError) throw packagesError;

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
    } catch (error) {
      console.error('Error fetching course packages:', error);
    }
  };

  const fetchPurchases = async () => {
    if (!user) return;

    setPurchasesLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch course titles for each purchase
      const purchasesWithTitles = await Promise.all(
        (data || []).map(async (purchase) => {
          if (!purchase.course_ids || purchase.course_ids.length === 0) {
            return { ...purchase, courseTitles: [] };
          }

          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', purchase.course_ids);

          if (coursesError) {
            console.error('Error fetching course titles:', coursesError);
            return { ...purchase, courseTitles: [] };
          }

          return {
            ...purchase,
            courseTitles: coursesData?.map(c => c.title) || []
          };
        })
      );

      setPurchases(purchasesWithTitles);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Nie udało się pobrać historii zakupów');
    } finally {
      setPurchasesLoading(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast.error("Wprowadź kod promocyjny");
      return;
    }

    if (!user) {
      toast.error("Musisz być zalogowany, aby użyć kodu promocyjnego");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Dodaj produkty do koszyka przed użyciem kodu");
      return;
    }

    setApplyingPromoCode(true);
    try {
      // Konwertuj totalPrice z złotych na grosze dla Edge Function
      const result = await validatePromoCode(promoCodeInput, user.id, Math.round(totalPrice * 100));
      
      if (result.valid) {
        applyPromoCode({
          code: promoCodeInput.toUpperCase().trim(),
          discount_type: result.discount_type,
          discount_value: result.discount_value,
          discount_amount_cents: result.discount_amount_cents
        });
        toast.success(`Kod "${promoCodeInput.toUpperCase()}" został zastosowany!`);
        setPromoCodeInput('');
      } else {
        toast.error(result.error || "Nieprawidłowy kod promocyjny");
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error(error.message || "Błąd podczas walidacji kodu");
    } finally {
      setApplyingPromoCode(false);
    }
  };

  const handleRemovePromoCode = () => {
    removePromoCode();
    toast.info("Kod promocyjny został usunięty");
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Musisz być zalogowany, żeby dokonać zakupu.");
      return;
    }

    if (!canPurchaseCourses()) {
      toast.error("Musisz ustawić datę matury w profilu, aby móc kupować kursy.");
      return;
    }

    // Validate cart order
    const validation = validateCartOrder(coursePackages);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Koszyk jest pusty");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Brak sesji. Zaloguj się ponownie.");
      return;
    }

    setLoading(true);

    try {
      // Prepare items for checkout
      // price_cents w bazie jest w złotych, więc mnożymy przez 100 aby przekonwertować na grosze dla Stripe
      const items = cartItems.map(item => ({
        course_id: item.packageId,
        course_title: item.packageData.title || item.packageData.section_title,
        price_cents: Math.round(item.packageData.price_cents * 100), // Konwersja zł → grosze
      }));

      const res = await fetch(
        "https://gkvjdemszxjmtxvxlnmr.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            items: items,
            promo_code: appliedPromoCode?.code || null,
            success_url_base: window.location.origin,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Błąd przy tworzeniu sesji płatności: " + (data.error || ''));
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Błąd przy tworzeniu sesji płatności");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (cents) => {
    return (cents / 100).toFixed(2) + ' zł';
  };

  const handleGenerateReceiptPDF = (purchase) => {
    try {
      generateReceiptPDF(purchase, userData, purchase.courseTitles || []);
      toast.success('Paragon został wygenerowany i pobrany');
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      toast.error('Błąd podczas generowania paragonu');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full md:min-h-[96vh] p-3">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
        <ShoppingCart size={20} />
        Koszyk
      </span>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-primaryBlue/20 dark:border-primaryGreen/20 pb-0">
        <button
          onClick={() => setActiveTab('cart')}
          className={`px-6 py-3 font-medium transition-all rounded-t-[12px] ${
            activeTab === 'cart'
              ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen bg-white dark:bg-DarkblackText'
              : 'text-primaryBlue/70 dark:text-primaryGreen/70 hover:text-primaryBlue dark:hover:text-primaryGreen hover:bg-primaryBlue/5 dark:hover:bg-primaryGreen/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span>Koszyk</span>
            {cartItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primaryBlue/10 dark:bg-primaryGreen/10 text-primaryBlue dark:text-primaryGreen rounded-[8px] text-xs font-semibold">
                {cartItems.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-6 py-3 font-medium transition-all rounded-t-[12px] ${
            activeTab === 'receipts'
              ? 'border-b-2 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen bg-white dark:bg-DarkblackText'
              : 'text-primaryBlue/70 dark:text-primaryGreen/70 hover:text-primaryBlue dark:hover:text-primaryGreen hover:bg-primaryBlue/5 dark:hover:bg-primaryGreen/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt size={18} />
            <span>Paragony</span>
          </div>
        </button>
      </div>

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div className="flex flex-col gap-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-primaryBlue/70 dark:text-primaryGreen/70">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Koszyk jest pusty</p>
              <p className="text-sm text-center mb-4">
                Dodaj produkty z sekcji sklepu do koszyka.
              </p>
              <button
                onClick={() => setActiveSection('shop')}
                className="px-6 py-3 bg-primaryBlue dark:bg-primaryGreen text-white rounded-[12px] font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 shadow-md"
              >
                <Plus size={18} className="inline mr-2" />
                Przejdź do sklepu
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.packageId}
                    className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-sm border border-primaryBlue/10 dark:border-primaryGreen/10 p-5 flex items-center justify-between hover:shadow-md hover:border-primaryBlue/20 dark:hover:border-primaryGreen/20 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-blackText dark:text-white mb-1.5 text-base">
                        {item.packageData.section_title || item.packageData.title}
                      </h3>
                      <p className="text-sm font-medium text-primaryBlue dark:text-primaryGreen">
                        {item.packageData.price_cents.toFixed(2)} zł
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.packageId)}
                      className="ml-4 p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-[10px] transition-all duration-200 hover:scale-105 active:scale-95"
                      title="Usuń z koszyka"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-primaryBlue/20 dark:border-primaryGreen/20 pt-6 mt-6">
                {/* Referral Discount Section - 75% */}
                {referralDiscountAvailable && (
                  <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-[12px] border-2 border-green-500 dark:border-green-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 dark:bg-green-600 rounded-[10px]">
                          <Gift size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-300 mb-0.5 font-semibold">Dostępna zniżka polecająca</p>
                          <span className="text-xl font-bold text-green-600 dark:text-green-400">
                            75% ZNIŻKI
                          </span>
                        </div>
                      </div>
                      {isReferralDiscountApplied() ? (
                        <button
                          onClick={removeReferralDiscount}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-[10px] transition-all duration-200"
                          title="Usuń zniżkę"
                        >
                          <X size={18} className="text-green-600 dark:text-green-400" />
                        </button>
                      ) : (
                        <button
                          onClick={applyReferralDiscount}
                          className="px-5 py-2.5 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-[12px] font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <Gift size={16} />
                          <span>Zastosuj</span>
                        </button>
                      )}
                    </div>
                    {isReferralDiscountApplied() && (
                      <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                        <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                          <Check size={14} />
                          Zniżka polecająca 75% jest aktywna
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Promo Code Section */}
                {!isReferralDiscountApplied() && (
                <div className="mb-6 p-5 bg-gradient-to-br from-primaryBlue/5 to-primaryGreen/5 dark:from-primaryBlue/10 dark:to-primaryGreen/10 rounded-[12px] border border-primaryBlue/20 dark:border-primaryGreen/20">
                  {appliedPromoCode ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-[10px]">
                          <Tag size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-primaryBlue/70 dark:text-primaryGreen/70 mb-0.5">Kod promocyjny</p>
                          <span className="text-sm font-semibold text-blackText dark:text-white font-mono">
                            {appliedPromoCode.code}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="p-2 hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10 rounded-[10px] transition-all duration-200"
                        title="Usuń kod"
                      >
                        <X size={18} className="text-primaryBlue dark:text-primaryGreen" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                        placeholder="Wprowadź kod promocyjny"
                        className="flex-1 px-4 py-3 border border-primaryBlue/20 dark:border-primaryGreen/20 rounded-[12px] bg-white dark:bg-DarkblackText text-blackText dark:text-white text-sm font-mono placeholder:text-primaryBlue/40 dark:placeholder:text-primaryGreen/40 focus:outline-none focus:ring-2 focus:ring-primaryBlue/20 dark:focus:ring-primaryGreen/20 focus:border-primaryBlue dark:focus:border-primaryGreen transition-all"
                      />
                      <button
                        onClick={handleApplyPromoCode}
                        disabled={applyingPromoCode || !promoCodeInput.trim()}
                        className="px-6 py-3 bg-primaryBlue dark:bg-primaryGreen hover:opacity-90 text-white rounded-[12px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        {applyingPromoCode ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-sm">Sprawdzanie...</span>
                          </>
                        ) : (
                          <>
                            <Tag size={16} />
                            <span>Zastosuj</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                )}

                {/* Price Summary */}
                <div className="mb-6 p-5 bg-white dark:bg-DarkblackText rounded-[12px] border border-primaryBlue/10 dark:border-primaryGreen/10 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-primaryBlue/80 dark:text-primaryGreen/80">
                      <span>Suma częściowa:</span>
                      <span className="font-medium text-blackText dark:text-white">{totalPrice.toFixed(2)} zł</span>
                    </div>
                    {isReferralDiscountApplied() && discount > 0 && (
                      <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Zniżka polecająca (75%):</span>
                        <span className="font-semibold">-{discount.toFixed(2)} zł</span>
                      </div>
                    )}
                    {appliedPromoCode && !isReferralDiscountApplied() && discount > 0 && (
                      <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Zniżka ({appliedPromoCode.code}):</span>
                        <span className="font-semibold">-{discount.toFixed(2)} zł</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-primaryBlue/20 dark:border-primaryGreen/20">
                      <span className="text-lg font-semibold text-blackText dark:text-white">
                        Suma całkowita:
                      </span>
                      <span className="text-2xl font-bold text-primaryBlue dark:text-primaryGreen">
                        {totalWithDiscount.toFixed(2)} zł
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveSection('shop')}
                    className="flex-1 px-6 py-3.5 bg-primaryBlue/10 dark:bg-primaryGreen/10 text-primaryBlue dark:text-primaryGreen rounded-[12px] font-semibold hover:bg-primaryBlue/20 dark:hover:bg-primaryGreen/20 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md border border-primaryBlue/20 dark:border-primaryGreen/20"
                  >
                    <Plus size={18} />
                    <span>Dodaj nowy produkt</span>
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-[12px] font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none shadow-md"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Przetwarzanie...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Przejdź do płatności</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <div className="flex flex-col gap-4">
          {purchasesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryBlue dark:border-primaryGreen"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-primaryBlue/70 dark:text-primaryGreen/70">
              <Receipt size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Brak historii zakupów</p>
              <p className="text-sm text-center">
                Twoje zakupy pojawią się tutaj po dokonaniu płatności.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-sm border border-primaryBlue/10 dark:border-primaryGreen/10 p-6 hover:shadow-md hover:border-primaryBlue/20 dark:hover:border-primaryGreen/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-blackText dark:text-white">
                          Zakup z {formatDate(purchase.created_at)}
                        </h3>
                        {purchase.transaction_number && (
                          <span className="px-2 py-0.5 bg-primaryBlue/10 dark:bg-primaryGreen/10 text-primaryBlue dark:text-primaryGreen rounded-[8px] text-xs font-mono font-semibold">
                            #{purchase.transaction_number}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primaryBlue/80 dark:text-primaryGreen/80">
                        Status: <span className={`font-medium ${
                          purchase.status === 'completed' 
                            ? 'text-green-600 dark:text-green-400' 
                            : purchase.status === 'pending'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {purchase.status === 'completed' ? 'Zakończone' : 
                           purchase.status === 'pending' ? 'Oczekujące' : 'Nieudane'}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primaryBlue dark:text-primaryGreen">
                        {formatPrice(purchase.total_amount_cents)}
                      </p>
                    </div>
                  </div>

                  {purchase.courseTitles && purchase.courseTitles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-blackText dark:text-white mb-2">
                        Zakupione produkty:
                      </p>
                      <ul className="space-y-1">
                        {purchase.courseTitles.map((title, index) => (
                          <li key={index} className="text-sm text-primaryBlue/80 dark:text-primaryGreen/80 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primaryBlue dark:bg-primaryGreen rounded-full"></span>
                            {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {purchase.status === 'completed' && (
                      <button
                        onClick={() => handleGenerateReceiptPDF(purchase)}
                        className="flex-1 px-5 py-3 bg-primaryBlue dark:bg-primaryGreen text-white rounded-[12px] font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                      >
                        <FileText size={18} />
                        <span>Pobierz paragon PDF</span>
                      </button>
                    )}
                    {purchase.invoice_url && (
                      <button
                        onClick={() => window.open(purchase.invoice_url, '_blank')}
                        className="flex-1 px-5 py-3 bg-primaryBlue/10 dark:bg-primaryGreen/10 text-primaryBlue dark:text-primaryGreen rounded-[12px] font-semibold hover:bg-primaryBlue/20 dark:hover:bg-primaryGreen/20 transition-all duration-200 flex items-center justify-center gap-2 border border-primaryBlue/20 dark:border-primaryGreen/20 shadow-sm hover:shadow-md"
                      >
                        <Download size={18} />
                        <span>Faktura Stripe</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

