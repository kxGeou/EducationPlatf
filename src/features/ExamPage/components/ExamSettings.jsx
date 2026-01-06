import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExamStore } from '../../../store/examStore';

export default function ExamSettings() {
  const courses = useExamStore((s) => s.courses);
  const [course, setCourse] = useState("");
  const [numQ, setNumQ] = useState(10);
  const [currentStep, setCurrentStep] = useState(1);
  const startExam = useExamStore((s) => s.startExam);
  const startRandomQuestionMode = useExamStore((s) => s.startRandomQuestionMode);

  const selectedCourse = courses.find((c) => c.id === course);

  const handleNextStep = () => {
    if (course) {
      setCurrentStep(2);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-DarkblackText">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            currentStep >= 1 
              ? 'bg-primaryBlue dark:bg-primaryGreen text-white' 
              : 'bg-gray-200 dark:bg-DarkblackText text-gray-400'
          }`}>
            1
          </div>
          <div className={`h-1 w-16 transition-all duration-300 ${
            currentStep >= 2 
              ? 'bg-primaryBlue dark:bg-primaryGreen' 
              : 'bg-gray-200 dark:bg-DarkblackText'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            currentStep >= 2 
              ? 'bg-primaryBlue dark:bg-primaryGreen text-white' 
              : 'bg-gray-200 dark:bg-DarkblackText text-gray-400'
          }`}>
            2
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Krok {currentStep} z 2
        </p>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r dark:from-primaryGreen dark:to-secondaryGreen from-primaryBlue to-secondaryBlue bg-clip-text text-transparent">
          {currentStep === 1 ? 'Wybierz kurs' : 'Ustawienia egzaminu'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentStep === 1 
            ? 'Wybierz kurs, z którego chcesz rozpocząć egzamin'
            : 'Ustaw liczbę pytań i rozpocznij egzamin'}
        </p>
      </div>

      {/* Step Content with Animations */}
      <div className="relative">
        {/* Step 1: Course Selection */}
        <div 
          className={`transition-all duration-500 ${
            currentStep === 1 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`relative rounded-2xl transition-all duration-200 border-2 overflow-hidden text-left ${
                    course === c.id 
                      ? "shadow-lg border-primaryBlue dark:border-primaryGreen" 
                      : "bg-gray-100 dark:bg-DarkblackText hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10 hover:shadow-md border-transparent hover:border-primaryBlue/20 dark:hover:border-primaryGreen/20"
                  }`}
                  onClick={() => setCourse(c.id)}
                >
                  {/* Course Image with Overlay */}
                  {c.image_url ? (
                    <div className="relative w-full h-96 overflow-hidden bg-gray-200 dark:bg-DarkblackText">
                      <img
                        src={c.image_url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Dark gradient overlay from bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                      {/* Course Title on image */}
                      <div className={`absolute bottom-0 left-0 right-0 p-4 font-semibold text-sm text-white ${
                        course === c.id ? "text-white" : "text-white"
                      }`}>
                        {c.title}
                      </div>
                    </div>
                  ) : (
                    /* Fallback when no image */
                    <div className={`w-full h-96 p-4 flex items-end font-semibold text-sm ${
                      course === c.id 
                        ? "bg-primaryBlue dark:bg-primaryGreen text-white" 
                        : "bg-gray-200 dark:bg-DarkblackText text-gray-900 dark:text-white"
                    }`}>
                      {c.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <button
            className="w-full px-4 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen text-white font-semibold text-base rounded-xl hover:shadow-xl hover:-translate-y-1 duration-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
            onClick={handleNextStep}
            disabled={!course}
          >
            Dalej
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Step 2: Question Count & Actions */}
        <div 
          className={`transition-all duration-500 ${
            currentStep === 2 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
          }`}
        >
          {/* Selected Course Preview */}
          {selectedCourse && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-DarkblackText rounded-xl border border-gray-200 dark:border-DarkblackText">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wybrany kurs:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.title}</p>
                </div>
                <button
                  onClick={handleBackStep}
                  className="ml-4 px-4 py-2 text-sm font-medium text-primaryBlue dark:text-primaryGreen bg-white dark:bg-DarkblackText border border-primaryBlue/20 dark:border-primaryGreen/20 rounded-xl hover:bg-primaryBlue/5 dark:hover:bg-primaryGreen/5 transition-colors"
                >
                  Zmień
                </button>
              </div>
            </div>
          )}

          {/* Question Count Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Liczba pytań
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[10, 20, 40].map((n) => (
                <button
                  key={n}
                  className={`px-4 py-4 rounded-xl transition-all duration-200 font-semibold text-lg ${
                    numQ === n 
                      ? "bg-primaryBlue dark:bg-primaryGreen text-white shadow-lg transform " 
                      : "bg-gray-100 dark:bg-DarkblackText hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10 hover:shadow-md border-2 border-transparent hover:border-primaryBlue/20 dark:hover:border-primaryGreen/20 text-gray-900 dark:text-white"
                  }`}
                  onClick={() => setNumQ(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              className="w-full px-4 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen text-white font-semibold text-base rounded-xl  duration-300 transition-all cursor-pointer"
              onClick={() => startExam({ courseId: course, numQuestions: numQ })}
            >
              Zacznij test
            </button>
            
            <button
              className="w-full px-4 py-3 bg-gradient-to-r from-primaryGreen to-secondaryGreen text-white font-semibold text-base rounded-xl  duration-300 transition-all cursor-pointer"
              onClick={() => startRandomQuestionMode(course)}
            >
              Losowe Pytanie
            </button>

            <button
              className="w-full px-4 py-3 bg-gray-100 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 font-semibold text-base rounded-xl hover:bg-gray-200 dark:hover:bg-DarkblackText/80 duration-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              onClick={handleBackStep}
            >
              <ChevronLeft className="w-5 h-5" />
              Wstecz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}