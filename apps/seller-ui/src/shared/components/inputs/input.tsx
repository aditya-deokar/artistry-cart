import React, { forwardRef } from 'react'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface BaseProps {
  label?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'textarea';
  className?: string;
}

type InputProps = BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;
type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type Props = InputProps | TextareaProps;

const isTextarea = (type?: string): type is 'textarea' => type === 'textarea';

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = 'text', className, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <Label className="text-base font-medium">{label}</Label>
        )}

        {isTextarea(type) ? (
          <ShadcnTextarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={cn('resize-none', className)}
            {...(props as TextareaProps)}
          />
        ) : (
          <ShadcnInput
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={className}
            {...(props as InputProps)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
