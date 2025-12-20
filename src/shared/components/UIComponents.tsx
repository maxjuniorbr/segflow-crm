import React from 'react';

import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// --- Alert ---
export const Alert: React.FC<{ children: React.ReactNode; variant?: 'error' | 'warning' | 'info' | 'success' }> = ({ children, variant = 'error' }) => {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-green-50 border-green-200 text-green-700"
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
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', isLoading, className = '', ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";

  const variants = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-transparent text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    outline: "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-blue-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
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

    const bgClass = isReadOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900';
    const borderClass = error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500';

    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          name={name}
          autoComplete={props.autoComplete || 'off'}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors ${bgClass} ${borderClass} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

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
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        id={selectId}
        name={name}
        className={`bg-white block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${error ? 'border-red-300 text-red-900' : 'border-slate-300 text-slate-900'} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string, action?: React.ReactNode }> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white overflow-hidden shadow-sm border border-slate-200 rounded-lg ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ status: string }> = ({ status }) => {
  let color = "bg-slate-100 text-slate-800";
  let label = status;

  switch (status) {
    case 'Apólice':
      color = "bg-emerald-100 text-emerald-800 border border-emerald-200";
      break;
    case 'Proposta':
      color = "bg-blue-100 text-blue-800 border border-blue-200";
      break;
    case 'Cancelado':
      color = "bg-slate-200 text-slate-600 border border-slate-300";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};
