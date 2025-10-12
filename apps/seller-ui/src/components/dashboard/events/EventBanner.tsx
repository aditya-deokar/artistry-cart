// components/dashboard/events/EventBanner.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon, Wand2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadEventBanner, deleteEventBanner, generateEventBanner } from '@/lib/api/events';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';

interface EventBannerProps {
  className?: string;
}

const bannerTemplates = [
  { id: 'flash-sale', name: 'Flash Sale', preview: '/templates/flash-sale.jpg' },
  { id: 'seasonal', name: 'Seasonal Sale', preview: '/templates/seasonal.jpg' },
  { id: 'clearance', name: 'Clearance', preview: '/templates/clearance.jpg' },
  { id: 'new-arrival', name: 'New Arrival', preview: '/templates/new-arrival.jpg' },
];

export default function EventBanner({ className }: EventBannerProps) {
  const [uploading, setUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const form = useFormContext();
  const bannerImage = form.watch('banner_image');

  const uploadMutation = useMutation({
    mutationFn: uploadEventBanner,
    onSuccess: (uploadedImage) => {
      form.setValue('banner_image', uploadedImage);
      toast.success('Banner uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload banner');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEventBanner,
    onSuccess: () => {
      toast.success('Banner deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete banner');
    },
  });

  const generateMutation = useMutation({
    mutationFn: ({ template, text }: { template: string; text: string }) =>
      generateEventBanner(template, text),
    onSuccess: (generatedImage) => {
      form.setValue('banner_image', generatedImage);
      toast.success('Banner generated successfully');
      setGeneratingBanner(false);
      setShowTemplates(false);
    },
    onError: () => {
      toast.error('Failed to generate banner');
      setGeneratingBanner(false);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleRemoveBanner = async () => {
    if (!bannerImage) return;
    
    try {
      await deleteMutation.mutateAsync(bannerImage.file_id);
      form.setValue('banner_image', null);
    } catch (error) {
      console.error('Error removing banner:', error);
    }
  };

  const handleGenerateBanner = async () => {
    if (!selectedTemplate || !bannerText) {
      toast.error('Please select a template and enter banner text');
      return;
    }

    setGeneratingBanner(true);
    await generateMutation.mutateAsync({
      template: selectedTemplate,
      text: bannerText
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Event Banner
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
              {bannerImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={bannerImage.url} download="event-banner.jpg">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Banner Preview */}
          {bannerImage ? (
            <div className="relative aspect-[16/9] max-w-md mx-auto">
              <Image
                src={bannerImage.url}
                alt="Event banner"
                fill
                className="object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveBanner}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            /* Upload Area */
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors aspect-[16/9] flex flex-col items-center justify-center",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                uploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              
              {uploading ? (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              ) : isDragActive ? (
                <p className="text-sm text-muted-foreground">Drop banner here...</p>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG, WEBP (Recommended: 1600x900px)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Banner Generation */}
          {showTemplates && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Generate AI Banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Banner Text</Label>
                  <Input
                    placeholder="e.g., MEGA FLASH SALE - UP TO 70% OFF"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Template Style</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {bannerTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Preview */}
                {selectedTemplate && (
                  <div className="grid grid-cols-2 gap-4">
                    {bannerTemplates
                      .filter(t => t.id === selectedTemplate)
                      .map((template) => (
                        <div key={template.id} className="space-y-2">
                          <div className="aspect-video relative border rounded-lg overflow-hidden">
                            <Image
                              src={template.preview}
                              alt={template.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-sm text-center font-medium">{template.name}</p>
                        </div>
                      ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleGenerateBanner}
                    disabled={generatingBanner || !selectedTemplate || !bannerText}
                    className="flex-1"
                  >
                    {generatingBanner ? 'Generating...' : 'Generate Banner'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTemplates(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Banner Guidelines */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Banner Guidelines</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Recommended size: 1600x900px (16:9 aspect ratio)</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Use high-contrast text for better readability</li>
              <li>• Include your event discount prominently</li>
              <li>• Avoid cluttered designs for mobile display</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
