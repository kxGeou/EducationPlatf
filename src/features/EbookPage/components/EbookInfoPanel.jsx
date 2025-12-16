import React from "react";

function EbookInfoPanel({ ebook }) {
  return (
    <div className="w-full h-full p-3 rounded-[12px] flex flex-col gap-8 justify-between transition-all">
      <div>
        <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
          Informacje o e-booku
        </span>

        <div className="flex flex-col md:flex-row gap-8">
          {ebook.image_url && (
            <img 
              src={ebook.image_url} 
              alt={ebook.title} 
              className="rounded-[10px] max-w-md" 
              loading="lazy"
            />
          )}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium dark:text-white/50 text-blackText/75">
                Tytuł e-booka
              </span>
              <span className="text-xl font-semibold text-blackText dark:text-white">
                {ebook.title}
              </span>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <span className="text-sm font-medium dark:text-white/50 text-blackText/75">
                Opis e-booka
              </span>
              <span className="text-lg max-w-[500px] leading-[25px] text-blackText dark:text-white">
                {ebook.description || "Brak opisu"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-4">
              <div className="flex flex-col px-2 gap-1 py-2 items-center border bg-white border-gray-100 justify-center dark:border-0 dark:bg-DarkblackText shadow-md rounded-[12px]">
                <p className="opacity-75">Cena</p>
                <span className="font-semibold text-2xl">
                  {ebook.price_cents.toFixed(2)} zł
                </span>
              </div>
              <div className="flex flex-col px-2 gap-1 py-2 items-center border bg-white border-gray-100 justify-center dark:border-0 dark:bg-DarkblackText shadow-md rounded-[12px]">
                <p className="opacity-75">Format</p>
                <span className="font-semibold text-2xl">PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EbookInfoPanel;


