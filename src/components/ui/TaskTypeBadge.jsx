import React from 'react';
import { FileText, Code, Database } from 'lucide-react';

const TaskTypeBadge = ({ taskType, className = '' }) => {
  const getTaskTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'text':
        return {
          icon: FileText,
          label: 'Zadanie tekstowe',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'python':
        return {
          icon: Code,
          label: 'Zadanie Python',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'sql':
        return {
          icon: Database,
          label: 'Zadanie SQL',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          icon: FileText,
          label: 'Zadanie',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const config = getTaskTypeConfig(taskType);
  const IconComponent = config.icon;

  return (
    <div 
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.color} ${className}`}
      title={config.label}
    >
      <IconComponent size={14} className={config.iconColor} />
    </div>
  );
};

export default TaskTypeBadge;
