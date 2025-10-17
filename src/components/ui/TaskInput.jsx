import React from 'react';
import CodeEditor from './CodeEditor';
import TaskTypeBadge from './TaskTypeBadge';

const TaskInput = ({ 
  task, 
  value, 
  onChange, 
  disabled = false,
  className = ''
}) => {

  const handleTextChange = (e) => {
    onChange(e.target.value);
  };

  const handleCodeChange = (code) => {
    onChange(code);
  };

  const renderInput = () => {
    const taskType = task?.task_type?.toLowerCase()?.trim();
    
    // Handle various possible values
    let normalizedTaskType = taskType;
    if (taskType === 'sql' || taskType === 'SQL') {
      normalizedTaskType = 'sql';
    } else if (taskType === 'python' || taskType === 'Python' || taskType === 'PYTHON') {
      normalizedTaskType = 'python';
    } else if (taskType === 'text' || taskType === 'Text' || taskType === 'TEXT' || !taskType) {
      normalizedTaskType = 'text';
    }
    
    switch (normalizedTaskType) {
      case 'python':
        return (
          <CodeEditor
            language="python"
            value={value || task.initial_code || ''}
            onChange={handleCodeChange}
            initialCode={task.initial_code || ''}
            testCases={task.test_cases}
            expectedOutput={task.expected_output}
            testData={task.test_data}
            disabled={disabled}
            height="300px"
          />
        );
      
      case 'sql':
        return (
          <CodeEditor
            language="sql"
            value={value || task.initial_code || ''}
            onChange={handleCodeChange}
            initialCode={task.initial_code || ''}
            testCases={task.test_cases}
            expectedOutput={task.expected_output}
            testData={task.test_data}
            disabled={disabled}
            height="300px"
          />
        );
      
      case 'text':
      default:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Twoja odpowiedź:
            </label>
            <textarea
              value={value || ''}
              onChange={handleTextChange}
              placeholder="Wprowadź swoją odpowiedź..."
              className="w-full p-3 border-0 bg-primaryBlue/10 rounded-lg dark:bg-DarkblackBorder resize-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen"
              rows={4}
              disabled={disabled}
            />
          </div>
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Task Type Badge */}
      <div className="flex items-center justify-between">
        <TaskTypeBadge taskType={task?.task_type} />
        {task?.task_type?.toLowerCase() !== 'text' && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-DarkblackBorder px-3 py-2 rounded-lg">
            {task?.task_type?.toLowerCase() === 'python' && '💡 Użyj Ctrl+Enter aby uruchomić kod'}
            {task?.task_type?.toLowerCase() === 'sql' && '💡 Użyj Ctrl+Enter aby wykonać zapytanie'}
          </div>
        )}
      </div>

      {/* Input Component */}
      {renderInput()}
    </div>
  );
};

export default TaskInput;
