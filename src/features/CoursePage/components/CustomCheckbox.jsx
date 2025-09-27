import { useState } from 'react';

function CustomCheckbox({ 
    checked, 
    onChange, 
    label, 
    disabled = false, 
    size = 'medium',
    variant = 'default' 
}) {
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    const labelSizeClasses = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base'
    };

    const getCheckboxClasses = () => {
        const baseClasses = `${sizeClasses[size]} rounded-md border-2 transition-all duration-200 flex items-center justify-center`;
        
        if (disabled) {
            return `${baseClasses} border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed`;
        }

        if (checked) {
            if (variant === 'primary') {
                return `${baseClasses} border-primaryBlue dark:border-primaryGreen bg-primaryBlue dark:bg-primaryGreen text-white shadow-md`;
            }
            return `${baseClasses} border-primaryBlue dark:border-primaryGreen bg-primaryBlue dark:bg-primaryGreen text-white shadow-md`;
        }

        if (isHovered) {
            return `${baseClasses} border-primaryBlue/70 dark:border-primaryGreen/70 bg-primaryBlue/10 dark:bg-primaryGreen/10`;
        }

        return `${baseClasses} border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primaryBlue/50 dark:hover:border-primaryGreen/50`;
    };

    const getLabelClasses = () => {
        const baseClasses = `${labelSizeClasses[size]} transition-colors duration-200`;
        
        if (disabled) {
            return `${baseClasses} text-gray-400 dark:text-gray-500 cursor-not-allowed`;
        }

        if (checked) {
            return `${baseClasses} text-primaryBlue dark:text-primaryGreen font-medium`;
        }

        return `${baseClasses} text-gray-700 dark:text-gray-300 hover:text-primaryBlue dark:hover:text-primaryGreen`;
    };

    return (
        <label 
            className={`flex items-center cursor-pointer group ${disabled ? 'cursor-not-allowed' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                if (!disabled && onChange) {
                    // Create a synthetic event object
                    const syntheticEvent = {
                        target: { checked: !checked }
                    };
                    onChange(syntheticEvent);
                }
            }}
        >
            <div className={getCheckboxClasses()}>
                {checked && (
                    <svg 
                        className={`${size === 'small' ? 'w-2.5 h-2.5' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                )}
            </div>
            {label && (
                <span className={`ml-3 ${getLabelClasses()}`}>
                    {label}
                </span>
            )}
        </label>
    );
}

export default CustomCheckbox;
