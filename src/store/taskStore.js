import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { useAuthStore } from "./authStore";

export const useTasks = create((set, get) => ({
    loading: false,
    error: null,
    tasks: [],
    allTasks: [], 
    completedTasks: [],
    currentTask: null,
    showCompletedTasks: false,
    showAllTasks: true,
    selectedTopics: [],
    availableTopics: [],
    hasSelectedStatus: true, 

    fetchTasks: async () => {
        set({ loading: true, error: null });
        const {error,data} = await supabase.from("tasks").select("*");
        if(error) {
            console.error('Error fetching tasks:', error.message);
        } else {
            set({ tasks: data || [] });
        }
        set({ loading: false });
    },

    fetchTasksByCourseId: async (courseId) => {
        set({ loading: true, error: null });
        
        const { purchasedCourses } = useAuthStore.getState();
        
        const {error, data} = await supabase
            .from("tasks")
            .select("*")
            .eq("course_id", courseId);
        if(error) {
            console.error('Error fetching tasks by course ID:', error.message);
        } else {
            set({ allTasks: data || [] });
            
            const accessibleTasks = data?.filter(task => {
                if (!task.section_id) {
                    return true;
                }
                return purchasedCourses.includes(task.section_id);
            }) || [];
            
            set({ tasks: accessibleTasks });
            
            const allTopics = [...new Set(data?.map(task => task.topic).filter(Boolean))] || [];
            set({ 
                availableTopics: allTopics,
                selectedTopics: allTopics 
            });
            
            get().updateCurrentTask();
        }
        set({ loading: false });
    },

    fetchCompletedTasks: async (courseId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error, data } = await supabase
            .from("tasks_answers")
            .select("task_id")
            .eq("user_id", user.id)
            .eq("course_id", courseId); 

        if (error) {
            console.error("Error fetching completed tasks:", error);
        } else {
            const completedTaskIds = data?.map(item => item.task_id) || [];
            set({ completedTasks: completedTaskIds });
        }
    },

    submitTaskAnswer: async (taskId, selectedAnswer, courseId) => {
        if (!taskId || !selectedAnswer || !courseId) {
            console.error("Missing required parameters:", { taskId, selectedAnswer, courseId });
            return false;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return false;
        }

        const numericTaskId = typeof taskId === 'string' ? parseInt(taskId) : taskId;


        const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            .select("correct_answer")
            .eq("task_id", numericTaskId)
            .single();

        if (taskError) {
            console.error("Error fetching task:", taskError);
            return false;
        }

      
        const normalizedSelected = selectedAnswer?.trim();
        const normalizedCorrect = taskData.correct_answer?.trim();
        
        const isCorrect = normalizedSelected === normalizedCorrect;
        if (isCorrect) {
            const { completedTasks } = get();
            const isAlreadyCompleted = completedTasks.includes(taskId.toString());
            
            if (!isAlreadyCompleted) {
                const { data: existingEntry, error: checkError } = await supabase
                    .from("tasks_answers")
                    .select("task_id")
                    .eq("task_id", taskId.toString())
                    .eq("user_id", user.id)
                    .eq("course_id", courseId)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') { 
                    console.error("Error checking existing entry:", checkError);
                    return false;
                }

                if (!existingEntry) {
                    const { error: insertError } = await supabase
                        .from("tasks_answers")
                        .insert({
                            task_id: taskId.toString(), 
                            user_id: user.id,
                            course_id: courseId,
                            answer: selectedAnswer,
                        });

                    if (insertError) {
                        console.error("Error inserting task answer:", insertError);
                        return false;
                    }

                    set({ completedTasks: [...completedTasks, taskId.toString()] });
                    
                    // Award points for completing exercise
                    const { awardPoints } = useAuthStore.getState();
                    awardPoints(15, 'exercise', taskId.toString(), courseId);
                    
                    get().fetchCompletedTasks(courseId);
                } else {
                }
            } else {
            }
            
            return true;
        } else {
            return false;
        }
    },

    setShowCompletedTasks: (show) => set({ 
        showCompletedTasks: show,
        hasSelectedStatus: true 
    }),
    setShowAllTasks: (show) => set({ 
        showAllTasks: show,
        hasSelectedStatus: true 
    }),
    setSelectedTopics: (topics) => set({ selectedTopics: topics }),
    setHasSelectedStatus: (hasSelected) => set({ hasSelectedStatus: hasSelected }),

    getFilteredTasks: () => {
        const { tasks, completedTasks, showCompletedTasks, showAllTasks, selectedTopics } = get();
        
        
        
        let filteredTasks = tasks;
        
        if (showCompletedTasks && !showAllTasks) {
            filteredTasks = tasks.filter(task => 
                completedTasks.includes(task.task_id.toString())
            );
            console.log("Showing only completed tasks:", filteredTasks.length);
        } else if (!showCompletedTasks && showAllTasks) {
            filteredTasks = tasks.filter(task => 
                !completedTasks.includes(task.task_id.toString())
            );
            console.log("Showing only uncompleted tasks:", filteredTasks.length);
        } else {
            console.log("Showing all tasks:", filteredTasks.length);
        }
        
        if (selectedTopics.length > 0 && selectedTopics.length < get().availableTopics.length) {
            filteredTasks = filteredTasks.filter(task => 
                selectedTopics.includes(task.topic)
            );
            console.log("After topic filter:", filteredTasks.length);
        }
        
        console.log("Final filtered tasks:", filteredTasks.length);
        return filteredTasks;
    },

    updateCurrentTask: () => {
        const filteredTasks = get().getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            set({ currentTask: null });
            return null;
        }

        const randomTask = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
        set({ currentTask: randomTask });
        return randomTask;
    },

    getNextTask: () => {
        return get().updateCurrentTask();
    },

    isTopicAccessible: (topic) => {
        const { allTasks } = get();
        const { purchasedCourses } = useAuthStore.getState();
        
        const tasksWithTopic = allTasks.filter(task => task.topic === topic);
        return tasksWithTopic.some(task => {
            if (!task.section_id) return true;
            return purchasedCourses.includes(task.section_id);
        });
    },

    getTopicSectionInfo: async (topic) => {
        const { allTasks } = get();
        const { purchasedCourses } = useAuthStore.getState();
        
        const tasksWithTopic = allTasks.filter(task => task.topic === topic);
        const lockedTasks = tasksWithTopic.filter(task => {
            if (!task.section_id) return false;
            return !purchasedCourses.includes(task.section_id);
        });
        
        if (lockedTasks.length > 0) {
            const sectionIds = [...new Set(lockedTasks.map(task => task.section_id).filter(Boolean))];
            
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('id, title')
                    .in('id', sectionIds);
                
                if (!error && data) {
                    return data.map(course => course.title);
                }
            } catch (err) {
                console.error('Error fetching section titles:', err);
            }
            
            return sectionIds;
        }
        
        return [];
    }

}));
