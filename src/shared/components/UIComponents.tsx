import React from 'react';

import { Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

// --- Alert ---
export const Alert: React.FC<{ children: React.ReactNode; variant?: 'error' | 'warning' | 'info' | 'success' }> = ({ children, variant = 'error' }) => {
  const styles = {
    error: "bg-danger-50 border-danger-200 text-danger-700",
    warning: "bg-warning-50 border-warning-200 text-warning-700",
    info: "bg-info-50 border-info-200 text-info-700",
    success: "bg-success-50 border-success-200 text-success-700"
  };

  const Icon = variant === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`p-4 rounded-md border flex items-start ${styles[variant]}`}>
      <Icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', isLoading, className = '', ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center border font-medium rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";

  const variants = {
    primary: "border-transparent text-white bg-brand-600 hover:bg-brand-700 focus:ring-brand-500",
    secondary: "border-transparent text-brand-700 bg-brand-100 hover:bg-brand-200 focus:ring-brand-500",
    danger: "border-transparent text-white bg-danger-600 hover:bg-danger-700 focus:ring-danger-500",
    outline: "border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-brand-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-sm"
  };

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, name, ...props }, ref) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name; // Fallback to name if id is not provided

    const bgClass = isReadOnly ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white text-neutral-900';
    const borderClass = error ? 'border-danger-200 text-danger-700 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          autoComplete={props.autoComplete || 'off'}
          data-error={error ? 'true' : undefined}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors ${bgClass} ${borderClass} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
  }
);

Input.displayName = 'Input';

// --- SearchInput ---
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ label, error, className = '', id, name, ...props }, ref) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;

    const bgClass = isReadOnly ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white text-neutral-900';
    const borderClass = error ? 'border-danger-200 text-danger-700 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            ref={ref}
            id={inputId}
            name={name}
            autoComplete={props.autoComplete || 'off'}
            data-error={error ? 'true' : undefined}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors ${bgClass} ${borderClass} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

// --- InputWithButton ---
interface InputWithButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  buttonIcon?: React.ReactNode;
  buttonText?: string;
  buttonAriaLabel?: string;
  buttonLoading?: boolean;
  onButtonClick: () => void;
}

export const InputWithButton = React.forwardRef<HTMLInputElement, InputWithButtonProps>(
  ({ label, error, className = '', id, name, buttonIcon, buttonText, buttonAriaLabel, buttonLoading, onButtonClick, ...props }, ref) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;

    const bgClass = isReadOnly ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white text-neutral-900';
    const borderClass = error ? 'border-danger-200 text-danger-700 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <div className="flex rounded-md shadow-sm">
          <input
            ref={ref}
            id={inputId}
            name={name}
            autoComplete={props.autoComplete || 'off'}
            data-error={error ? 'true' : undefined}
            className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border focus:outline-none focus:ring-1 sm:text-sm transition-colors ${bgClass} ${borderClass} ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={onButtonClick}
            aria-label={buttonAriaLabel}
            className="inline-flex items-center space-x-2 px-3 py-2 border border-l-0 border-neutral-300 text-sm font-medium rounded-r-md text-neutral-700 bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            disabled={buttonLoading || props.disabled}
          >
            {buttonLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonIcon}
            {buttonText && <span>{buttonText}</span>}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      </div>
    );
  }
);

InputWithButton.displayName = 'InputWithButton';

// --- DateInput ---
interface DateInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const DateInput: React.FC<DateInputProps> = ({ label, error, value, onChange, name, ...props }) => {
  const [displayValue, setDisplayValue] = React.useState('');

  React.useEffect(() => {
    if (value) {
      // Convert YYYY-MM-DD to DD/MM/YYYY for display if valid
      const [y, m, d] = value.split('-');
      if (y && m && d) {
        setDisplayValue(`${d}/${m}/${y}`);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');

    // Mask DD/MM/YYYY
    if (val.length > 8) val = val.substring(0, 8);

    let formatted = val;
    if (val.length > 2) {
      formatted = val.substring(0, 2) + '/' + val.substring(2);
    }
    if (val.length > 4) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5);
    }

    setDisplayValue(formatted);

    // If complete, convert to YYYY-MM-DD and trigger onChange
    if (val.length === 8) {
      const day = val.substring(0, 2);
      const month = val.substring(2, 4);
      const year = val.substring(4, 8);

      // Basic validation
      const numDay = parseInt(day);
      const numMonth = parseInt(month);
      const numYear = parseInt(year);

      if (numMonth >= 1 && numMonth <= 12 && numDay >= 1 && numDay <= 31 && numYear > 1900) {
        onChange({ target: { name: name || '', value: `${year}-${month}-${day}` } } as React.ChangeEvent<HTMLInputElement>);
      }
    } else if (val.length === 0) {
      onChange({ target: { name: name || '', value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <Input
      label={label}
      error={error}
      name={name}
      value={displayValue}
      onChange={handleChange}
      placeholder="DD/MM/AAAA"
      maxLength={10}
      inputMode="numeric"
      {...props}
    />
  );
};

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, name, ...props }) => {
  const selectId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
          {props.required && <span className="ml-1 text-danger-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        data-error={error ? 'true' : undefined}
        className={`bg-white block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${error ? 'border-danger-200 text-danger-700' : 'border-neutral-300 text-neutral-900'} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', id, name, ...props }, ref) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;

    const bgClass = isReadOnly ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'bg-white text-neutral-900';
    const borderClass = error ? 'border-danger-200 text-danger-700 focus:ring-danger-500 focus:border-danger-500' : 'border-neutral-300 focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          data-error={error ? 'true' : undefined}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors ${bgClass} ${borderClass} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// --- PageHeader ---
interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, leading, action }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-start sm:items-center gap-3">
        {leading}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">{title}</h1>
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
};

// --- Text Helpers ---
export const PageSubtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`mt-1 text-xs sm:text-sm text-neutral-500 ${className}`}>{children}</p>
);

export const HelperText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-neutral-500 ${className}`}>{children}</p>
);

// --- FileDropzone ---
interface FileDropzoneProps {
  id: string;
  name: string;
  label: string;
  helperText: string;
  selectedFileName?: string;
  icon?: React.ReactNode;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  id,
  name,
  label,
  helperText,
  selectedFileName,
  icon,
  onFileChange
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md hover:border-brand-400 transition-colors cursor-pointer bg-neutral-50 hover:bg-brand-50">
        <div className="space-y-1 text-center">
          {icon && <div className="mx-auto h-12 w-12 text-neutral-400">{icon}</div>}
          <div className="flex text-sm text-neutral-600">
            <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500">
              <span>Upload de arquivo</span>
              <input id={id} name={name} type="file" className="sr-only" onChange={onFileChange} autoComplete="off" />
            </label>
            <p className="pl-1">ou arraste e solte</p>
          </div>
          <HelperText className="text-xs">
            {helperText}
          </HelperText>
          {selectedFileName && (
            <p className="text-sm text-success-600 font-medium mt-2">
              Selecionado: {selectedFileName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-neutral-900 ${className}`}>{children}</h3>
);

// --- LoadingState ---
interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Carregando...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[320px] text-neutral-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
};

// --- EmptyState ---
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => {
  return (
    <div className={`text-center py-12 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 ${className}`}>
      {icon && <div className="mx-auto mb-3 h-12 w-12 text-neutral-300">{icon}</div>}
      <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
      {description && <p className="mt-1 text-xs sm:text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
};

// --- MobileListCard ---
type MobileListCardProps = React.HTMLAttributes<HTMLDivElement>;

export const MobileListCard = React.forwardRef<HTMLDivElement, MobileListCardProps>(
  ({ className = '', onClick, onKeyDown, role, tabIndex, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(event);
      }
      onKeyDown?.(event);
    };

    return (
      <div
        ref={ref}
        role={role || (onClick ? 'button' : undefined)}
        tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`w-full text-left border border-neutral-200 rounded-lg bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
        {...props}
      />
    );
  }
);

MobileListCard.displayName = 'MobileListCard';

// --- Table ---
export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <table className={`min-w-full divide-y divide-neutral-200 ${className}`}>{children}</table>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <thead className={`bg-neutral-50 ${className}`}>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tbody className={`bg-white divide-y divide-neutral-200 ${className}`}>{children}</tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }> = ({
  children,
  className = '',
  hover = false,
  ...props
}) => (
  <tr className={`${hover ? 'hover:bg-neutral-50 transition-colors' : ''} ${className}`} {...props}>{children}</tr>
);

export const TableHeaderCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${className}`}>{children}</th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-700 ${className}`}>{children}</td>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string, action?: React.ReactNode }> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white overflow-hidden shadow-sm border border-neutral-200 rounded-lg ${className}`}>
      {(title || action) && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          {title && <h3 className="text-base font-semibold text-neutral-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </div>
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  let color = "bg-neutral-100 text-neutral-800 border border-neutral-200";
  let label = status;

  switch (status) {
    case 'Apólice':
      color = "bg-success-50 text-success-700 border border-success-200";
      break;
    case 'Proposta':
      color = "bg-info-50 text-info-700 border border-info-200";
      break;
    case 'Cancelado':
      color = "bg-neutral-200 text-neutral-600 border border-neutral-300";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      {label}
    </span>
  );
};

// --- Tag ---
interface TagProps {
  variant?: 'info' | 'success' | 'warning' | 'neutral';
  className?: string;
  children: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({ variant = 'neutral', className = '', children }) => {
  const styles = {
    info: 'bg-info-50 text-info-700 border border-info-200',
    success: 'bg-success-50 text-success-700 border border-success-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
