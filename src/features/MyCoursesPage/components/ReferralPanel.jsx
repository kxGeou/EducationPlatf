import React, { useState, useEffect } from 'react';
import { UserPlus, Copy, Check, Gift, Info, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../context/ToastContext';

export default function ReferralPanel() {
  const toast = useToast();
  const { 
    user, 
    referralCode, 
    referralDiscountAvailable, 
    referralUsedBy,
    generateReferralCode, 
    fetchReferralData,
    loading 
  } = useAuthStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGenerateCode = async () => {
    const success = await generateReferralCode();
    if (success) {
      fetchReferralData();
    }
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Kod skopiowany do schowka!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full p-3">
      <div className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
        <UserPlus size={20} />
        Kody polecające
      </div>

      {/* Section 1: Your Referral Code */}
      <div className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-md border border-primaryBlue/10 dark:border-primaryGreen/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primaryBlue/10 dark:bg-primaryGreen/10 rounded-[10px]">
            <UserPlus size={20} className="text-primaryBlue dark:text-primaryGreen" />
          </div>
          <h2 className="text-xl font-semibold text-blackText dark:text-white">
            Twój Kod Polecający
          </h2>
        </div>

        {!referralCode ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-primaryBlue/70 dark:text-primaryGreen/70 mb-6 text-center">
              Wygeneruj swój unikalny kod polecający i zacznij zarabiać zniżki!
            </p>
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="px-6 py-3 bg-primaryBlue dark:bg-primaryGreen text-white rounded-[12px] font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generowanie...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Wygeneruj kod polecający</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-gradient-to-r from-primaryBlue/5 to-primaryGreen/5 dark:from-primaryBlue/10 dark:to-primaryGreen/10 rounded-[12px] border border-primaryBlue/20 dark:border-primaryGreen/20 p-4">
                <p className="text-xs text-primaryBlue/70 dark:text-primaryGreen/70 mb-1">Twój kod:</p>
                <p className="text-2xl font-bold text-primaryBlue dark:text-primaryGreen font-mono tracking-wider">
                  {referralCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-4 bg-primaryBlue/10 dark:bg-primaryGreen/10 hover:bg-primaryBlue/20 dark:hover:bg-primaryGreen/20 rounded-[12px] transition-all duration-200"
                title="Kopiuj kod"
              >
                {copied ? (
                  <Check size={24} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Copy size={24} className="text-primaryBlue dark:text-primaryGreen" />
                )}
              </button>
            </div>

            {referralUsedBy ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[12px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={18} className="text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    Kod został użyty!
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Użytkownik: <span className="font-mono">{referralUsedBy}</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-[12px] p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Kod jest aktywny i gotowy do użycia
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Your 75% Discount */}
      <div className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-md border border-primaryBlue/10 dark:border-primaryGreen/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primaryBlue/10 dark:bg-primaryGreen/10 rounded-[10px]">
            <Gift size={20} className="text-primaryBlue dark:text-primaryGreen" />
          </div>
          <h2 className="text-xl font-semibold text-blackText dark:text-white">
            Twoja Zniżka 75%
          </h2>
        </div>

        {!referralDiscountAvailable ? (
          <div className="bg-gradient-to-br from-primaryBlue/5 to-primaryGreen/5 dark:from-primaryBlue/10 dark:to-primaryGreen/10 rounded-[12px] border border-primaryBlue/20 dark:border-primaryGreen/20 p-6 text-center">
            <Gift size={48} className="mx-auto mb-4 text-primaryBlue/40 dark:text-primaryGreen/40" />
            <p className="text-primaryBlue/80 dark:text-primaryGreen/80">
              Zniżka zostanie aktywowana, gdy ktoś użyje Twojego kodu polecającego podczas zakupu
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-[12px] border-2 border-green-500 dark:border-green-600 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-[12px] shadow-lg">
                <p className="text-3xl font-bold">ZNIŻKA 75%</p>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-[10px]">
                <Check size={20} className="text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Dostępna do wykorzystania
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Zniżka zostanie automatycznie zastosowana przy następnym zakupie sekcji kursu
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: How it Works */}
      <div className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-md border border-primaryBlue/10 dark:border-primaryGreen/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primaryBlue/10 dark:bg-primaryGreen/10 rounded-[10px]">
            <Info size={20} className="text-primaryBlue dark:text-primaryGreen" />
          </div>
          <h2 className="text-xl font-semibold text-blackText dark:text-white">
            Jak to działa?
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primaryBlue dark:bg-primaryGreen text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-blackText dark:text-white mb-1">
                Wygeneruj swój kod
              </p>
              <p className="text-sm text-primaryBlue/70 dark:text-primaryGreen/70">
                Kliknij przycisk "Wygeneruj kod polecający" aby otrzymać swój unikalny kod
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primaryBlue dark:bg-primaryGreen text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-blackText dark:text-white mb-1">
                Podziel się kodem
              </p>
              <p className="text-sm text-primaryBlue/70 dark:text-primaryGreen/70">
                Udostępnij swój kod znajomym, którzy chcą kupić sekcje kursu
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primaryBlue dark:bg-primaryGreen text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-blackText dark:text-white mb-1">
                Twój znajomy otrzymuje 30% zniżki
              </p>
              <p className="text-sm text-primaryBlue/70 dark:text-primaryGreen/70">
                Gdy użyje Twojego kodu podczas zakupu, dostanie 30% rabatu
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <p className="font-semibold text-blackText dark:text-white mb-1">
                Otrzymujesz 75% zniżki!
              </p>
              <p className="text-sm text-primaryBlue/70 dark:text-primaryGreen/70">
                Po użyciu Twojego kodu, automatycznie otrzymasz jednorazową zniżkę 75% na następny zakup
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[12px]">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">Ważne:</span> Każdy kod może być użyty tylko raz. 
            Zniżka 75% jest jednorazowa i zostanie automatycznie zastosowana przy Twoim następnym zakupie.
          </p>
        </div>
      </div>
    </div>
  );
}

