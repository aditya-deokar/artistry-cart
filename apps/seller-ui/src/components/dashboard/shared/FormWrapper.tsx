// components/dashboard/shared/FormWrapper.tsx
'use client';

import { FormProvider, UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FormWrapperProps {
  title?: string;
  description?: string;
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDirty?: boolean;
  className?: string;
  showCard?: boolean;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function FormWrapper({
  title,
  description,
  methods,
  onSubmit,
  onCancel,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  isDirty,
  className,
  showCard = true,
  footer,
  headerAction,
}: FormWrapperProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = methods;

  // Get global form errors
  const globalErrors = Object.keys(errors).length > 0;
  const errorMessages = Object.values(errors)
    .map(error => error?.message)
    .filter(Boolean) as string[];

  const handleFormSubmit = async (data: any) => {
    try {
      clearErrors();
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const formContent = (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Global Error Alert */}
        {globalErrors && errorMessages.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errorMessages.map((message, index) => (
                  <p key={index}>{message}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Fields */}
        {children}

        {/* Footer */}
        {footer || (onCancel || submitLabel) ? (
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              {isDirty && (
                <p className="text-sm text-muted-foreground">
                  You have unsaved changes
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  {cancelLabel}
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="min-w-24"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}

        {footer && (
          <div className="pt-6 border-t">
            {footer}
          </div>
        )}
      </form>
    </FormProvider>
  );

  if (!showCard) {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={cn("w-full", className)}>
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            {title && <CardTitle className="text-xl">{title}</CardTitle>}
            {description && (
              <CardDescription className="mt-2">
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </CardHeader>
      )}
      
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
