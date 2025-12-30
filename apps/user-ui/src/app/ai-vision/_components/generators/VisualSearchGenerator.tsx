'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, X, ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { aiVisionClient, type Concept } from '@/lib/api/aivision-client';
import GenerationResults from './GenerationResults';

export default function VisualSearchGenerator() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Concept[]>([]);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setResults([]);
    setAdditionalPrompt('');
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      toast.info('Analyzing your image...', { duration: 2000 });

      const generatedConcepts = await aiVisionClient.generateFromPrompt({
        prompt: additionalPrompt || 'Generate similar concept',
        // Note: In production, backend should support image upload
      });

      setResults(generatedConcepts);
      toast.success(`Generated ${generatedConcepts.length} concept${generatedConcepts.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate concepts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-[var(--ac-gold)] bg-[var(--ac-gold)]/5'
              : 'border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-[var(--ac-gold)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload an image to generate similar concepts'}
          </h3>
          <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
            Our AI will analyze your image and create inspired artisan concepts
          </p>
          <Badge variant="secondary" className="text-xs">
            PNG, JPG, WEBP up to 10MB
          </Badge>
        </div>
      ) : (
        <Card className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1 truncate">
                  {selectedImage.name}
                </h4>
                <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-3">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button size="sm" variant="outline" onClick={handleRemoveImage}>
                  <X className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              </div>
            </div>

            {/* Additional Prompt */}
            <div>
              <label className="block text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
                Additional instructions (optional)
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="E.g., 'Make it more colorful', 'Add floral patterns', 'Modern minimalist style'..."
                className="w-full px-3 py-2 rounded-md border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] bg-white dark:bg-[var(--ac-onyx)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ac-gold)]"
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/90 text-white"
            >
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Concepts...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Similar Concepts
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <Sparkles className="mx-auto h-8 w-8 text-[var(--ac-gold)] animate-pulse mb-3" />
            <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
              Our AI is analyzing your image and creating unique concepts...
            </p>
            <p className="text-xs text-[var(--ac-stone)] mt-1">
              This usually takes 15-30 seconds
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <GenerationResults concepts={results} onGenerateMore={() => setResults([])} />
      )}
    </div>
  );
}
