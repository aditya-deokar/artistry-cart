// components/dashboard/shared/ImageUploadZone.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, File, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file?: File;
  progress?: number;
  error?: string;
}

interface ImageUploadZoneProps {
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<UploadedFile[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  multiple?: boolean;
}

const defaultAcceptedTypes = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

export function ImageUploadZone({
  value = [],
  onChange,
  onUpload,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = defaultAcceptedTypes,
  className,
  disabled = false,
  showPreview = true,
  multiple = true,
}: ImageUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    // Check file limits
    const totalFiles = value.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    // Validate files
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return false;
      }
      if (!acceptedFileTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not supported.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      if (onUpload) {
        // Use custom upload function
        const uploadedFiles = await onUpload(validFiles);
        onChange([...value, ...uploadedFiles]);
      } else {
        // Create local file objects with preview URLs
        const newFiles: UploadedFile[] = validFiles.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          file,
        }));
        onChange([...value, ...newFiles]);
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [value, onChange, onUpload, maxFiles, maxSize, acceptedFileTypes, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled,
    multiple,
  });

  const removeFile = (fileId: string) => {
    onChange(value.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          value.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="p-6 text-center">
          <input {...getInputProps()} ref={fileInputRef} />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className={cn(
              "h-8 w-8 text-muted-foreground",
              isDragActive && "text-primary"
            )} />
            
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supports: {acceptedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
              <p>Max size: {formatFileSize(maxSize)} per file</p>
              <p>Max files: {maxFiles}</p>
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <Progress value={50} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
            </div>
          )}
        </div>
      </Card>

      {/* File Preview */}
      {showPreview && value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Files ({value.length}/{maxFiles})
            </h4>
            {value.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange([])}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {value.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {isImage(file.type) ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <File className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {file.progress !== undefined && file.progress < 100 && (
                      <Progress value={file.progress} className="mt-1 h-1" />
                    )}
                    
                    {file.error && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive">{file.error}</span>
                      </div>
                    )}
                    
                    {file.progress === 100 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Uploaded</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
