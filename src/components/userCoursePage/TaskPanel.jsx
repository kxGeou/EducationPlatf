import { useEffect, useState } from 'react';
import { useTasks } from '../../store/taskStore';
import TaskFilterPanel from './TaskFilterPanel';
import supabase from '../../util/supabaseClient';

function TaskPanel({ courseId }) {
    const { 
        tasks, 
        completedTasks, 
        currentTask, 
        hasSelectedStatus,
        showCompletedTasks,
        fetchTasksByCourseId, 
        fetchCompletedTasks,
        submitTaskAnswer,
        getNextTask,
        getFilteredTasks,
        loading, 
        error 
    } = useTasks();
    
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState(null); 
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showRedirectAnimation, setShowRedirectAnimation] = useState(false);
    const [showTranslationAnswers, setShowTranslationAnswers] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchTasksByCourseId(courseId);
            fetchCompletedTasks(courseId);
        }
    }, [courseId])

    useEffect(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        setShowRedirectAnimation(false);
        setShowTranslationAnswers(false);
        setTimer(0);
        setShowNextButton(false);
        setCorrectAnswer(null);
    }, [currentTask])

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setShowNextButton(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleAnswerSubmit = async () => {
        if (!selectedAnswer || !currentTask) return;
        
        const taskId = currentTask.task_id;
        
        if (!taskId) {
            setFeedbackType('error');
            setFeedbackMessage('Błąd: Nie można znaleźć ID zadania');
            setShowFeedback(true);
            return;
        }
        
        setIsSubmitting(true);
        setShowFeedback(false);
        
        try {
            const success = await submitTaskAnswer(taskId, selectedAnswer, courseId);
            
            if (success) {
                const isAlreadyCompleted = completedTasks.includes(taskId.toString());
                
                if (isAlreadyCompleted) {
                    setFeedbackType('already_completed');
                    setFeedbackMessage('Poprawna odpowiedź! (Zadanie już było ukończone)');
                } else {
                    setFeedbackType('correct');
                    setFeedbackMessage('Świetnie! Poprawna odpowiedź! Zadanie zostało ukończone.');
                }
                
                setShowFeedback(true);
                setShowTranslationAnswers(true);
                
                setTimer(5);
            } else {
                setFeedbackType('incorrect');
                setFeedbackMessage('Niepoprawna odpowiedź. Sprawdź tłumaczenia poniżej i spróbuj ponownie!');
                setShowFeedback(true);
                setShowTranslationAnswers(true);
                
                // Fetch correct answer for translation display
                const correctAns = await fetchCorrectAnswer(taskId);
                setCorrectAnswer(correctAns);
            }
        } catch (error) {
            setFeedbackType('error');
            setFeedbackMessage('Wystąpił błąd podczas sprawdzania odpowiedzi');
            setShowFeedback(true);
        }
        
        setIsSubmitting(false);
    };

    const handleNextQuestion = () => {
        setShowFeedback(false);
        setShowTranslationAnswers(false);
        setShowNextButton(false);
        setSelectedAnswer(null);
        getNextTask();
    };

    const handleTryAgain = () => {
        setShowFeedback(false);
        setShowTranslationAnswers(false);
        setShowNextButton(false);
        setSelectedAnswer(null);
        setTimer(0);
    };

    const fetchCorrectAnswer = async (taskId) => {
        try {
            const { data, error } = await supabase
                .from("tasks")
                .select("correct_answer")
                .eq("task_id", taskId)
                .single();
            
            if (error) {
                console.error("Error fetching correct answer:", error);
                return null;
            }
            
            return data.correct_answer;
        } catch (error) {
            console.error("Error fetching correct answer:", error);
            return null;
        }
    };

    const filteredTasks = getFilteredTasks();
    const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Debug logging
    console.log('TaskPanel Debug:', {
        tasks: tasks.length,
        completedTasks: completedTasks.length,
        filteredTasks: filteredTasks.length,
        showCompletedTasks,
        hasSelectedStatus,
        currentTask: !!currentTask
    });


    return (
        <div className='p-3 flex flex-col lg:flex-row gap-4 w-full'>
            <div className="w-full lg:w-72 lg:flex-shrink-0 lg:order-1 order-2">
                <TaskFilterPanel />
            </div>

            <div className="flex-1 flex flex-col lg:order-2 order-1">
                <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
                    Zadania
                </span>

                {!hasSelectedStatus && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Wybierz status zadań
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Aby zobaczyć zadania, musisz najpierw wybrać status zadań (ukończone lub nieukończone) w panelu filtrów.
                        </p>
                    </div>
                )}

            {!loading && tasks.length > 0 && hasSelectedStatus && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Postęp: {completedTasks.length} / {tasks.length}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-primaryBlue to-primaryGreen h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {loading && <p>Ładowanie zadań...</p>}
            
            {!loading && !error && filteredTasks.length === 0 && hasSelectedStatus && (
                <div className="text-center py-8">
                    {tasks.length > 0 && completedTasks.length === tasks.length && !showCompletedTasks ? (
                        <>
                            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                                Gratulacje!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Ukończyłeś wszystkie zadania w tym kursie!
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                Brak zadań do wyświetlenia
                            </h3>
                            <p className="text-gray-500 dark:text-gray-500">
                                Nie ma zadań spełniających wybrane kryteria filtrów.
                            </p>
                        </>
                    )}
                </div>
            )}
            
            {!loading && !error && currentTask && filteredTasks.length > 0 && hasSelectedStatus && (
                <div className="bg-white dark:bg-DarkblackText rounded-[16px] p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        {currentTask.topic}
                    </h3>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {currentTask.task}
                    </p>

                    <div className="space-y-3 mb-6">
                        {currentTask.answers.map((answer, index) => (
                            <div key={index}>
                                <button
                                    onClick={() => setSelectedAnswer(answer)}
                                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                        selectedAnswer === answer
                                            ? 'border-primaryBlue dark:border-primaryGreen bg-blue-50 dark:bg-green-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    {answer}
                                </button>
                                {showTranslationAnswers && currentTask.answers_translation && currentTask.answers_translation[index] && (
                                    <div className={`p-2 mt-1 rounded-lg border shadow-sm ${
                                        correctAnswer && answer === correctAnswer
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}>
                                        <div className="flex items-start gap-2">
                                            <div>
                                                <p className={`text-xs font-medium mb-1 ${
                                                    correctAnswer && answer === correctAnswer
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {correctAnswer && answer === correctAnswer ? 'Poprawna odpowiedź' : 'Niepoprawna odpowiedź'}
                                                </p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {currentTask.answers_translation[index]}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {!showFeedback ? (
                        <button
                            onClick={handleAnswerSubmit}
                            disabled={!selectedAnswer || isSubmitting}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                                selectedAnswer && !isSubmitting
                                    ? 'bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? 'Sprawdzanie...' : 'Sprawdź odpowiedź'}
                        </button>
                    ) : (
                        feedbackType === 'correct' ? (
                            showNextButton && (
                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full py-3 px-6 rounded-lg font-semibold bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90 transition-all"
                                >
                                    Następne pytanie
                                </button>
                            )
                        ) : feedbackType === 'incorrect' ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleTryAgain}
                                    className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-400 dark:bg-gray-600 text-white hover:opacity-90 transition-all"
                                >
                                    Spróbuj ponownie
                                </button>
                                <button
                                    onClick={handleNextQuestion}
                                    className="flex-1 py-3 px-6 rounded-lg font-semibold bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90 transition-all"
                                >
                                    Następne pytanie
                                </button>
                            </div>
                        ) : null
                    )}

                    {showFeedback && (
                        <div className={`mt-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                            feedbackType === 'correct' 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : feedbackType === 'incorrect'
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : feedbackType === 'already_completed'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        }`}>
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                    feedbackType === 'correct' 
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : feedbackType === 'incorrect'
                                        ? 'bg-red-100 dark:bg-red-900/30'
                                        : feedbackType === 'already_completed'
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                                }`}>
                                    {feedbackType === 'correct' ? (
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : feedbackType === 'incorrect' ? (
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : feedbackType === 'already_completed' ? (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${
                                        feedbackType === 'correct' 
                                            ? 'text-green-800 dark:text-green-200'
                                            : feedbackType === 'incorrect'
                                            ? 'text-red-800 dark:text-red-200'
                                            : feedbackType === 'already_completed'
                                            ? 'text-blue-800 dark:text-blue-200'
                                            : 'text-yellow-800 dark:text-yellow-200'
                                    }`}>
                                        {feedbackMessage}
                                    </p>
                                    {feedbackType === 'correct' && (
                                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                            {timer > 0 ? (
                                                <>Następne pytanie za {timer} sekund{timer === 1 ? 'ę' : timer < 5 ? 'y' : ''}...</>
                                            ) : (
                                                <>Kliknij przycisk poniżej, aby przejść do następnego pytania.</>
                                            )}
                                        </p>
                                    )}
                                    {feedbackType === 'incorrect' && (
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                            Sprawdź tłumaczenia poniżej i wybierz jedną z opcji.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </div>
        </div>
    )
}

export default TaskPanel