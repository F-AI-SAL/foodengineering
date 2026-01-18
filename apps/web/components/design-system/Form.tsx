import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode
} from "react";
import { cn } from "@/lib/utils";

interface FieldWrapperProps {
  label?: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, helper, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-xs">
      {label ? <label className="text-sm font-medium text-secondary">{label}</label> : null}
      {children}
      {helper ? <p className="text-xs text-muted">{helper}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

const inputBase =
  "focus-ring w-full rounded-md border border-border bg-surface-alt px-md py-sm text-sm text-secondary placeholder:text-muted";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, className)} {...props} />
  )
);

Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(inputBase, className)} {...props}>
      {children}
    </select>
  )
);

Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(inputBase, "textarea-base", className)} {...props} />
  )
);

Textarea.displayName = "Textarea";
