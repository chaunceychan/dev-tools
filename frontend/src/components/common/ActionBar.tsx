import React from 'react';

/**
 * ActionBar — Horizontal row of action buttons for tool operations.
 */
interface ActionBarProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
  }>;
}

const ActionBar: React.FC<ActionBarProps> = ({ actions }) => {
  return (
    <div className="flex items-center gap-2 my-3">
      {actions.map((action, index) => {
        const baseClasses = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer';

        const variantClasses = {
          primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
          secondary: 'bg-surface text-text border border-border hover:bg-bg',
          danger: 'bg-error text-white hover:bg-error-hover shadow-sm',
        };

        const variant = action.variant || 'primary';

        return (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={`${baseClasses} ${variantClasses[variant]}
              ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${action.loading ? 'animate-pulse cursor-wait' : ''}
            `}
          >
            {action.loading ? '处理中...' : action.label}
          </button>
        );
      })}
    </div>
  );
};


export default ActionBar;
