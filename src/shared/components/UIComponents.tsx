import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { uiMessages } from '../../utils/uiMessages';

// --- Alert (CVA) ---
const alertVariants = cva(
  'p-4 rounded-md border flex items-start',
  {
    variants: {
      variant: {
        error: 'bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-900/30 dark:border-danger-700 dark:text-danger-400',
        warning: 'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-900/30 dark:border-warning-700 dark:text-warning-400',
        info: 'bg-info-50 border-info-200 text-info-700 dark:bg-info-900/30 dark:border-info-700 dark:text-info-400',
        success: 'bg-success-50 border-success-200 text-success-700 dark:bg-success-900/30 dark:border-success-700 dark:text-success-400',
      },
    },
    defaultVariants: { variant: 'error' },
  }
);

export const Alert: React.FC<{ children: React.ReactNode } & VariantProps<typeof alertVariants>> = ({ children, variant }) => {
  const Icon = variant === 'success' ? CheckCircle : AlertCircle;
  const role = variant === 'success' ? 'status' : 'alert';
  return (
    <div role={role} className={alertVariants({ variant })}>
      <Icon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

// --- Button (CVA) ---
const buttonVariants = cva(
  'inline-flex items-center justify-center border font-medium rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200',
  {
    variants: {
      variant: {
        primary: 'border-transparent text-white bg-brand-600 hover:bg-brand-700 focus:ring-brand-500',
        secondary: 'border-transparent text-brand-700 bg-brand-100 hover:bg-brand-200 focus:ring-brand-500 dark:text-brand-300 dark:bg-brand-900/40 dark:hover:bg-brand-800/50',
        danger: 'border-transparent text-white bg-danger-600 hover:bg-danger-700 focus:ring-danger-500',
        outline: 'border-border text-neutral-700 dark:text-neutral-300 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-brand-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant, size, isLoading, className, ...props
}) => (
  <button className={cn(buttonVariants({ variant, size }), className)} disabled={isLoading || props.disabled} {...props}>
    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
    {children}
  </button>
);

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
}

export const Input: React.FC<InputProps & { ref?: React.Ref<HTMLInputElement> }> = (
  { label, error, helperText, className, id, name, ref, ...props }) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    const bgClass = isReadOnly ? 'bg-neutral-100 dark:bg-neutral-700 text-muted cursor-not-allowed' : 'bg-card text-foreground';
    const borderClass = error ? 'border-danger-200 text-danger-700 dark:text-danger-400 focus:ring-danger-500 focus:border-danger-500' : 'border-border focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          autoComplete={props.autoComplete || 'off'}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn('block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-200', bgClass, borderClass, className)}
          {...props}
        />
        {helperText && !error && <p className="mt-1 text-xs text-muted">{helperText}</p>}
        {error && <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
      </div>
    );
  };

// --- SearchInput ---
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const SearchInput: React.FC<SearchInputProps & { ref?: React.Ref<HTMLInputElement> }> = (
  { label, error, className, id, name, ref, ...props }) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    const bgClass = isReadOnly ? 'bg-neutral-100 dark:bg-neutral-700 text-muted cursor-not-allowed' : 'bg-card text-foreground';
    const borderClass = error ? 'border-danger-200 text-danger-700 dark:text-danger-400 focus:ring-danger-500 focus:border-danger-500' : 'border-border focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted" />
          </div>
          <input
            ref={ref}
            id={inputId}
            name={name}
            autoComplete={props.autoComplete || 'off'}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn('block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors', bgClass, borderClass, className)}
            {...props}
          />
        </div>
        {error && <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
      </div>
    );
  };

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

export const InputWithButton: React.FC<InputWithButtonProps & { ref?: React.Ref<HTMLInputElement> }> = (
  { label, error, className, id, name, buttonIcon, buttonText, buttonAriaLabel, buttonLoading, onButtonClick, ref, ...props }) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    const bgClass = isReadOnly ? 'bg-neutral-100 dark:bg-neutral-700 text-muted cursor-not-allowed' : 'bg-card text-foreground';
    const borderClass = error ? 'border-danger-200 text-danger-700 dark:text-danger-400 focus:ring-danger-500 focus:border-danger-500' : 'border-border focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
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
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn('flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border focus:outline-none focus:ring-1 sm:text-sm transition-colors', bgClass, borderClass, className)}
            {...props}
          />
          <button
            type="button"
            onClick={onButtonClick}
            aria-label={buttonAriaLabel}
            className="inline-flex items-center space-x-2 px-3 py-2 border border-l-0 border-border text-sm font-medium rounded-r-md text-neutral-700 dark:text-neutral-300 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            disabled={buttonLoading || props.disabled}
          >
            {buttonLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonIcon}
            {buttonText && <span>{buttonText}</span>}
          </button>
        </div>
        {error && <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
      </div>
    );
  };

// --- DateInput ---
interface DateInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const DateInput: React.FC<DateInputProps> = ({ label, error, value, onChange, name, ...props }) => {
  const computeDisplay = (v: string) => {
    if (!v) return '';
    const [y, m, d] = v.split('-');
    return (y && m && d) ? `${d}/${m}/${y}` : v;
  };

  const [displayValue, setDisplayValue] = React.useState(() => computeDisplay(value));

  React.useEffect(() => {
    setDisplayValue(computeDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');

    if (val.length > 8) val = val.substring(0, 8);

    let formatted = val;
    if (val.length > 2) {
      formatted = val.substring(0, 2) + '/' + val.substring(2);
    }
    if (val.length > 4) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5);
    }

    setDisplayValue(formatted);

    if (val.length === 8) {
      const day = val.substring(0, 2);
      const month = val.substring(2, 4);
      const year = val.substring(4, 8);

      const numDay = parseInt(day);
      const numMonth = parseInt(month);
      const numYear = parseInt(year);

      const testDate = new Date(numYear, numMonth - 1, numDay);
      if (testDate.getFullYear() === numYear && testDate.getMonth() === numMonth - 1 && testDate.getDate() === numDay && numYear > 1900) {
        onChange({ target: { name: name || '', value: `${year}-${month}-${day}` } } as React.ChangeEvent<HTMLInputElement>);
      } else {
        onChange({ target: { name: name || '', value: '' } } as React.ChangeEvent<HTMLInputElement>);
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
      placeholder={uiMessages.placeholders.dateFormat}
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

export const Select: React.FC<SelectProps> = ({ label, error, options, className, id, name, ...props }) => {
  const selectId = id || name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
          {props.required && <span className="ml-1 text-danger-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn('bg-card block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors duration-200', error ? 'border-danger-200 text-danger-700 dark:text-danger-400' : 'border-border text-foreground', className)}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }> = (
  { label, error, className, id, name, ref, ...props }) => {
    const isReadOnly = props.readOnly || props.disabled;
    const inputId = id || name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    const bgClass = isReadOnly ? 'bg-neutral-100 dark:bg-neutral-700 text-muted cursor-not-allowed' : 'bg-card text-foreground';
    const borderClass = error ? 'border-danger-200 text-danger-700 dark:text-danger-400 focus:ring-danger-500 focus:border-danger-500' : 'border-border focus:ring-brand-500 focus:border-brand-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn('block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors', bgClass, borderClass, className)}
          {...props}
        />
        {error && <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
      </div>
    );
  };

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
          <h1 className="font-bold text-foreground" style={{ fontSize: 'var(--text-heading-xl)' }}>{title}</h1>
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
};

// --- Text Helpers ---
export const PageSubtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('mt-1 text-xs sm:text-sm text-muted', className)}>{children}</p>
);

export const HelperText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-sm text-muted', className)}>{children}</p>
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
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md hover:border-brand-400 transition-colors cursor-pointer bg-background hover:bg-brand-50 dark:hover:bg-brand-900/20">
        <div className="space-y-1 text-center">
          {icon && <div className="mx-auto h-12 w-12 text-muted">{icon}</div>}
          <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
            <label htmlFor={id} className="relative cursor-pointer bg-card rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 dark:focus-within:ring-offset-neutral-800 focus-within:ring-brand-500">
              <span>{uiMessages.fileDropzone.uploadAction}</span>
              <input id={id} name={name} type="file" className="sr-only" onChange={onFileChange} autoComplete="off" />
            </label>
            <p className="pl-1">{uiMessages.fileDropzone.dragAndDrop}</p>
          </div>
          <HelperText className="text-xs">
            {helperText}
          </HelperText>
          {selectedFileName && (
            <p className="text-sm text-success-600 dark:text-success-400 font-medium mt-2">
              {uiMessages.fileDropzone.selected(selectedFileName)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string; as?: 'h2' | 'h3' }> = ({ children, className, as: Tag = 'h3' }) => (
  <Tag className={cn('text-lg font-semibold text-foreground', className)}>{children}</Tag>
);

// --- LoadingState ---
interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label = uiMessages.common.loading, className }) => {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center min-h-[320px] text-muted', className)}>
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

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  return (
    <div className={cn('text-center py-12 bg-background rounded-lg border-2 border-dashed border-border', className)}>
      {icon && <div className="mx-auto mb-3 h-12 w-12 text-neutral-300 dark:text-neutral-600" aria-hidden="true">{icon}</div>}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && <p className="mt-1 text-xs sm:text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
};

// --- MobileListCard ---
type MobileListCardProps = React.HTMLAttributes<HTMLDivElement>;

export const MobileListCard: React.FC<MobileListCardProps & { ref?: React.Ref<HTMLDivElement> }> = (
  { className, onClick, onKeyDown, role, tabIndex, ref, ...props }) => {
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
        className={cn('w-full text-left border border-border rounded-lg bg-card p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500', onClick && 'cursor-pointer', className)}
        {...props}
      />
    );
  };

// --- Table ---
export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <table className={cn('min-w-full divide-y divide-border', className)}>{children}</table>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <thead className={cn('bg-background', className)}>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <tbody className={cn('bg-card divide-y divide-border', className)}>{children}</tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }> = ({
  children,
  className,
  hover = false,
  ...props
}) => (
  <tr className={cn(hover && 'hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors', className)} {...props}>{children}</tr>
);

export const TableRowButton: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { ariaLabel?: string }> = ({
  children,
  className,
  onClick,
  ariaLabel,
  ...props
}) => (
  <tr
    className={cn('cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500', className)}
    role="button"
    tabIndex={0}
    aria-label={ariaLabel}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event);
      }
    }}
    {...props}
  >
    {children}
  </tr>
);

export const TableHeaderCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th scope="col" className={cn('px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider', className)}>{children}</th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300', className)}>{children}</td>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string, action?: React.ReactNode }> = ({ children, className, title, action }) => {
  return (
    <div className={cn('bg-card overflow-hidden shadow-sm border border-border rounded-lg', className)}>
      {(title || action) && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-700/50">
          {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
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
export const Badge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  let color = "bg-neutral-100 dark:bg-neutral-700 text-foreground border border-border";
  let label = status;

  switch (status) {
    case 'Apólice':
      color = "bg-success-50 text-success-700 border border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-700";
      break;
    case 'Proposta':
      color = "bg-info-50 text-info-700 border border-info-200 dark:bg-info-900/30 dark:text-info-400 dark:border-info-700";
      break;
    case 'Endosso':
      color = "bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-700";
      break;
    case 'Vencido':
      color = "bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-900/30 dark:text-danger-400 dark:border-danger-700";
      break;
    case 'Cancelado':
      color = "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-border";
      break;
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', color, className)}>
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

export const Tag: React.FC<TagProps> = ({ variant = 'neutral', className, children }) => {
  const styles = {
    info: 'bg-info-50 text-info-700 border border-info-200 dark:bg-info-900/30 dark:text-info-400 dark:border-info-700',
    success: 'bg-success-50 text-success-700 border border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-700',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-700',
    neutral: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-border'
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[variant], className)}>
      {children}
    </span>
  );
};
