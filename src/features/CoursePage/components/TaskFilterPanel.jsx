import { useState, useEffect } from 'react';
import { useTasks } from '../../../store/taskStore';
import { useAuthStore } from '../../../store/authStore';
import CustomCheckbox from './CustomCheckbox';
import { Lock } from 'lucide-react';
import supabase from '../../../util/supabaseClient';

function TaskFilterPanel() {
    const {
        showCompletedTasks,
        showAllTasks,
        selectedTopics,
        availableTopics,
        hasSelectedStatus,
        setShowCompletedTasks,
        setShowAllTasks,
        setSelectedTopics,
        setHasSelectedStatus,
        getFilteredTasks,
        updateCurrentTask,
        isTopicAccessible,
        getTopicSectionInfo
    } = useTasks();

    const [localFilters, setLocalFilters] = useState({
        showCompletedTasks: showCompletedTasks,
        showAllTasks: showAllTasks,
        selectedTopics: [...selectedTopics]
    });
    
    const [sectionTitles, setSectionTitles] = useState({});

    useEffect(() => {
        setLocalFilters({
            showCompletedTasks: showCompletedTasks,
            showAllTasks: showAllTasks,
            selectedTopics: [...selectedTopics]
        });
    }, [showCompletedTasks, showAllTasks, selectedTopics]);

    useEffect(() => {
        const fetchSectionTitles = async () => {
            const lockedTopics = availableTopics.filter(topic => !isTopicAccessible(topic));
            if (lockedTopics.length === 0) return;

            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('id, title');
                
                if (!error && data) {
                    const titles = {};
                    data.forEach(course => {
                        titles[course.id] = course.title;
                    });
                    setSectionTitles(titles);
                }
            } catch (err) {
                console.error('Error fetching section titles:', err);
            }
        };

        fetchSectionTitles();
    }, [availableTopics, isTopicAccessible]);

    const filteredTasks = getFilteredTasks();

    const applyFilters = () => {
        console.log("Applying filters:", localFilters);
        
        if (!localFilters.showCompletedTasks && !localFilters.showAllTasks) {
            alert("Proszę wybrać status zadań (ukończone lub nieukończone)");
            return;
        }
        
        setShowCompletedTasks(localFilters.showCompletedTasks);
        setShowAllTasks(localFilters.showAllTasks);
        setSelectedTopics(localFilters.selectedTopics);
        setHasSelectedStatus(true);
        updateCurrentTask();
    };

    return (
        <div className="w-full lg:w-72 flex flex-col">
            <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primaryBlue dark:bg-primaryGreen rounded-lg flex items-center justify-center mr-2 lg:mr-3">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200">
                    Filtry zadań
                </h3>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="mb-4 lg:mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 lg:mb-3 flex items-center">
                        <div className="w-2 h-2 bg-primaryBlue dark:bg-primaryGreen rounded-full mr-2"></div>
                        Status zadań
                    </h4>
                    
                    <div className="space-y-2 lg:space-y-2.5">
                        <CustomCheckbox
                            checked={localFilters.showAllTasks}
                            onChange={(e) => {
                                setLocalFilters(prev => ({
                                    ...prev,
                                    showAllTasks: e.target.checked,
                                    showCompletedTasks: e.target.checked ? false : prev.showCompletedTasks
                                }));
                            }}
                            label="Nieukończone zadania"
                            size="medium"
                            variant="primary"
                        />

                        <CustomCheckbox
                            checked={localFilters.showCompletedTasks}
                            onChange={(e) => {
                                setLocalFilters(prev => ({
                                    ...prev,
                                    showCompletedTasks: e.target.checked,
                                    showAllTasks: e.target.checked ? false : prev.showAllTasks
                                }));
                            }}
                            label="Ukończone zadania"
                            size="medium"
                            variant="primary"
                        />
                    </div>
                </div>

                <div className="mb-4 lg:mb-5 flex-1">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 lg:mb-3 flex items-center">
                        <div className="w-2 h-2 bg-primaryBlue dark:bg-primaryGreen rounded-full mr-2"></div>
                        Tematy
                    </h4>
                    
                    <div className="space-y-2 lg:space-y-3">
                        <CustomCheckbox
                            checked={localFilters.selectedTopics.length === availableTopics.length}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setLocalFilters(prev => ({
                                        ...prev,
                                        selectedTopics: [...availableTopics]
                                    }));
                                } else {
                                    setLocalFilters(prev => ({
                                        ...prev,
                                        selectedTopics: []
                                    }));
                                }
                            }}
                            label="Wszystkie pytania"
                            size="medium"
                            variant="primary"
                        />
                        
                        <div className="ml-8 mt-4 space-y-4">
                            {availableTopics
                                .sort((a, b) => {
                                    const aAccessible = isTopicAccessible(a);
                                    const bAccessible = isTopicAccessible(b);
                                    if (aAccessible && !bAccessible) return -1;
                                    if (!aAccessible && bAccessible) return 1;
                                    return 0;
                                })
                                .map((topic) => {
                                const isAccessible = isTopicAccessible(topic);
                                
                                const getSectionInfo = () => {
                                    if (isAccessible) return null;
                                    
                                    const { allTasks } = useTasks.getState();
                                    const { purchasedCourses } = useAuthStore.getState();
                                    
                                    const tasksWithTopic = allTasks.filter(task => task.topic === topic);
                                    const lockedTasks = tasksWithTopic.filter(task => {
                                        if (!task.section_id) return false;
                                        return !purchasedCourses.includes(task.section_id);
                                    });
                                    
                                    if (lockedTasks.length > 0) {
                                        const sectionIds = [...new Set(lockedTasks.map(task => task.section_id).filter(Boolean))];
                                        const sectionNames = sectionIds.map(id => sectionTitles[id] || `Sekcja ${id}`).join(', ');
                                        return sectionNames;
                                    }
                                    
                                    return null;
                                };
                                
                                const sectionInfo = getSectionInfo();
                                
                                return (
                                    <div key={topic} className="relative group">
                                        {isAccessible ? (
                                            <CustomCheckbox
                                                checked={localFilters.selectedTopics.includes(topic)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setLocalFilters(prev => ({
                                                            ...prev,
                                                            selectedTopics: [...prev.selectedTopics, topic]
                                                        }));
                                                    } else {
                                                        setLocalFilters(prev => ({
                                                            ...prev,
                                                            selectedTopics: prev.selectedTopics.filter(t => t !== topic)
                                                        }));
                                                    }
                                                }}
                                                label={topic}
                                                size="small"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Lock size={12} className="text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{topic}</span>
                                                
                                                {/* Tooltip */}
                                                <div className="absolute left-full ml-1 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                                    <div className="relative">
                                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-[3px] w-2 h-2 bg-gray-900 rotate-45"></div>
                                                        <div className="font-medium">Sekcja zablokowana</div>
                                                        <div className="text-gray-300">
                                                            {sectionInfo ? `Kup ${sectionInfo} aby odblokować` : 'Kup sekcję aby odblokować'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <div className="pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-600 mb-3 lg:mb-4">
                    <div className="bg-primaryBlue/10 dark:bg-primaryGreen/10 rounded-xl p-2 lg:p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            <p className="font-medium">Dostępne zadania</p>
                            <p className="text-xl lg:text-2xl font-bold text-primaryBlue dark:text-primaryGreen mt-1">
                                {filteredTasks.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 lg:space-y-3">
                <button
                    onClick={applyFilters}
                    className="w-full px-3 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-md text-sm"
                >
                    <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Zastosuj filtry
                    </div>
                </button>
                
                <button
                    onClick={() => {
                        setLocalFilters({
                            showCompletedTasks: false,
                            showAllTasks: true,
                            selectedTopics: [...availableTopics]
                        });
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-200 dark:bg-DarkblackBorder dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                    <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Resetuj filtry
                    </div>
                </button>
                </div>
            </div>
        </div>
    );
}

export default TaskFilterPanel;
