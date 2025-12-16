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
    hasEbookAccessForCurrentCourse: false, // Cache ebook access for current course 

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
        
        const { purchasedCourses, purchasedEbooks } = useAuthStore.getState();
        
        // Check if user has purchased any ebook related to this course
        let hasEbookAccess = false;
        if (purchasedEbooks && purchasedEbooks.length > 0) {
            hasEbookAccess = await get().checkEbookCourseRelationship(purchasedEbooks, courseId);
        }
        
        // Cache the ebook access for this course
        set({ hasEbookAccessForCurrentCourse: hasEbookAccess });
        
        const {error, data} = await supabase
            .from("tasks")
            .select("*")
            .eq("course_id", courseId);
        if(error) {
            console.error('Error fetching tasks by course ID:', error.message);
        } else {
            set({ allTasks: data || [] });
            
            // If user has purchased an ebook related to this course, show all tasks
            // Otherwise, filter by purchased sections
            const accessibleTasks = hasEbookAccess 
                ? (data || []) // Show all tasks if ebook purchased
                : (data?.filter(task => {
                    if (!task.section_id) {
                        return true;
                    }
                    return purchasedCourses.includes(task.section_id);
                }) || []);
            
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
    
    checkEbookCourseRelationship: async (purchasedEbooks, courseId) => {
        // Check if any purchased ebook is related to this course
        // First, try to check if ebooks table has a course_id field
        try {
            const { data: ebooks, error } = await supabase
                .from("ebooks")
                .select("id, course_id")
                .in("id", purchasedEbooks);
            
            if (!error && ebooks) {
                // Check if any ebook has this course_id
                const relatedEbook = ebooks.find(ebook => ebook.course_id === courseId);
                if (relatedEbook) {
                    return true;
                }
            }
        } catch (err) {
            // If course_id column doesn't exist, the query will fail
            // We'll return false - the migration needs to be run first
            console.log('Ebooks table may not have course_id field yet. Run migration to add it.');
        }
        
        return false;
    },

    fetchTasksByEbookId: async (ebookId) => {
        set({ loading: true, error: null });
        
        const { purchasedEbooks } = useAuthStore.getState();
        
        // Check if user has access to this ebook
        if (!purchasedEbooks.includes(ebookId)) {
            set({ tasks: [], allTasks: [], loading: false });
            return;
        }
        
        // Get the course_id from the ebook
        const { data: ebookData, error: ebookError } = await supabase
            .from("ebooks")
            .select("course_id")
            .eq("id", ebookId)
            .single();
        
        if (ebookError || !ebookData || !ebookData.course_id) {
            console.error('Error fetching ebook course_id:', ebookError);
            set({ tasks: [], allTasks: [], loading: false });
            return;
        }
        
        const courseId = ebookData.course_id;
        
        // Fetch all tasks from the course (same tasks as in the course panel)
        const {error, data} = await supabase
            .from("tasks")
            .select("*")
            .eq("course_id", courseId);
        if(error) {
            console.error('Error fetching tasks by course ID for ebook:', error.message);
        } else {
            set({ allTasks: data || [] });
            
            // All tasks are accessible if user has purchased the ebook
            // No need to filter by section_id - show all tasks from the course
            set({ tasks: data || [] });
            
            // Mark that user has ebook access for this course
            set({ hasEbookAccessForCurrentCourse: true });
            
            const allTopics = [...new Set(data?.map(task => task.topic).filter(Boolean))] || [];
            set({ 
                availableTopics: allTopics,
                selectedTopics: allTopics 
            });
            
            get().updateCurrentTask();
        }
        set({ loading: false });
    },

    fetchCompletedTasks: async (courseId, isEbook = false) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
            .from("tasks_answers")
            .select("task_id")
            .eq("user_id", user.id);

        if (isEbook) {
            // For ebooks, get the course_id from the ebook first
            const { data: ebookData, error: ebookError } = await supabase
                .from("ebooks")
                .select("course_id")
                .eq("id", courseId)
                .single();
            
            if (ebookError || !ebookData || !ebookData.course_id) {
                console.error("Error fetching ebook course_id:", ebookError);
                set({ completedTasks: [] });
                return;
            }
            
            // Use the course_id to get completed tasks (same as for courses)
            query = query.eq("course_id", ebookData.course_id);
        } else {
            query = query.eq("course_id", courseId);
        }

        const { error, data } = await query;

        if (error) {
            console.error("Error fetching completed tasks:", error);
        } else {
            const completedTaskIds = data?.map(item => item.task_id) || [];
            set({ completedTasks: completedTaskIds });
        }
    },

    submitTaskAnswer: async (taskId, selectedAnswer, courseId, isEbook = false) => {
        if (!taskId || !selectedAnswer || !courseId) {
            console.error("Missing required parameters:", { taskId, selectedAnswer, courseId });
            return false;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return false;
        }

        const numericTaskId = typeof taskId === 'string' ? parseInt(taskId) : taskId;

        // For ebooks, get the actual course_id from the ebook
        let actualCourseId = courseId;
        if (isEbook) {
            const { data: ebookData, error: ebookError } = await supabase
                .from("ebooks")
                .select("course_id")
                .eq("id", courseId)
                .single();
            
            if (ebookError || !ebookData || !ebookData.course_id) {
                console.error("Error fetching ebook course_id:", ebookError);
                return false;
            }
            
            actualCourseId = ebookData.course_id;
        }

        const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            .select("correct_answer, course_id")
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
                // Check if entry exists with this task_id, user_id, and course_id
                const { data: existingEntry, error: checkError } = await supabase
                    .from("tasks_answers")
                    .select("task_id")
                    .eq("task_id", taskId.toString())
                    .eq("user_id", user.id)
                    .eq("course_id", actualCourseId)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') { 
                    console.error("Error checking existing entry:", checkError);
                    return false;
                }

                if (!existingEntry) {
                    const insertData = {
                        task_id: taskId.toString(), 
                        user_id: user.id,
                        answer: selectedAnswer,
                        course_id: actualCourseId
                    };

                    const { error: insertError } = await supabase
                        .from("tasks_answers")
                        .insert(insertData);

                    if (insertError) {
                        console.error("Error inserting task answer:", insertError);
                        return false;
                    }

                    set({ completedTasks: [...completedTasks, taskId.toString()] });
                    
                    // Award points for completing exercise
                    const { awardPoints } = useAuthStore.getState();
                    awardPoints(15, 'exercise', taskId.toString(), actualCourseId);
                    
                    get().fetchCompletedTasks(courseId, isEbook);
                }
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
        const { allTasks, hasEbookAccessForCurrentCourse } = get();
        const { purchasedCourses } = useAuthStore.getState();
        
        // If user has purchased an ebook for this course, all topics are accessible
        if (hasEbookAccessForCurrentCourse) {
            return true;
        }
        
        const tasksWithTopic = allTasks.filter(task => task.topic === topic);
        return tasksWithTopic.some(task => {
            if (!task.section_id) return true;
            return purchasedCourses.includes(task.section_id);
        });
    },

    getTopicSectionInfo: async (topic) => {
        const { allTasks, hasEbookAccessForCurrentCourse } = get();
        const { purchasedCourses } = useAuthStore.getState();
        
        // If user has purchased an ebook for this course, no sections are locked
        if (hasEbookAccessForCurrentCourse) {
            return [];
        }
        
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
