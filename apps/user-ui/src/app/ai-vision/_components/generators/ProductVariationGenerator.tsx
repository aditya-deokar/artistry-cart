'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Wand2, ImagePlus, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { aiVisionClient, type Concept } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import GenerationResults from './GenerationResults';

export default function ProductVariationGenerator() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Concept[]>([]);
  
  // Variation options
  const [variationType, setVariationType] = useState<string>('color');
  const [intensity, setIntensity] = useState<string>('moderate');
  const [count, setCount] = useState<string>('4');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const variationTypes = [
    { value: 'color', label: 'Color Variations', description: 'Different color palettes' },
    { value: 'material', label: 'Material Variations', description: 'Alternative materials' },
    { value: 'style', label: 'Style Variations', description: 'Different artistic styles' },
    { value: 'size', label: 'Size/Scale Variations', description: 'Different dimensions' },
    { value: 'detail', label: 'Detail Variations', description: 'More or less intricate' },
    { value: 'all', label: 'Mixed Variations', description: 'Combination of changes' },
  ];

  const intensityOptions = [
    { value: 'subtle', label: 'Subtle Changes', description: 'Keep very close to original' },
    { value: 'moderate', label: 'Moderate Changes', description: 'Noticeable differences' },
    { value: 'dramatic', label: 'Dramatic Changes', description: 'Bold reimagining' },
  ];

  const countOptions = [
    { value: '2', label: '2 variations' },
    { value: '4', label: '4 variations' },
    { value: '6', label: '6 variations' },
    { value: '8', label: '8 variations' },
  ];

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
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      const variationCount = parseInt(count);
      toast.info(`Generating ${variationCount} variations...`, { duration: 2000 });

      // Build variation prompt
      const selectedType = variationTypes.find((t) => t.value === variationType);
      const selectedIntensity = intensityOptions.find((i) => i.value === intensity);
      
      const prompt = `Create ${variationCount} product variations with ${selectedType?.label.toLowerCase()} - ${selectedIntensity?.label.toLowerCase()}. ${additionalNotes || ''}`;

      // Generate variations (in production, this would upload the image)
      const concepts = await aiVisionClient.generateFromPrompt({
        prompt,
      });

      setResults(concepts.slice(0, variationCount));
      toast.success(`Generated ${concepts.length} variation${concepts.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate variations. Please try again.');
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
          <ImagePlus className="mx-auto h-12 w-12 text-[var(--ac-gold)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
            {isDragActive ? 'Drop your product image here' : 'Upload a product to create variations'}
          </h3>
          <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
            Upload existing product photos to generate creative variations
          </p>
          <Badge variant="secondary" className="text-xs">
            PNG, JPG, WEBP up to 10MB
          </Badge>
        </div>
      ) : (
        <Card className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="flex items-start gap-4">
              <div className="relative w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 border-2 border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
                <img src={previewUrl} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-1 truncate">
                  {selectedImage.name}
                </h4>
                <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button size="sm" variant="outline" onClick={handleRemoveImage}>
                  <X className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              </div>
            </div>

            {/* Variation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Variation Type</Label>
                <Select value={variationType} onValueChange={setVariationType}>
                  <SelectTrigger className="bg-white dark:bg-[var(--ac-onyx)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {variationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-[var(--ac-stone)]">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Change Intensity</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                  <SelectTrigger className="bg-white dark:bg-[var(--ac-onyx)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {intensityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-[var(--ac-stone)]">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Number of Variations</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="bg-white dark:bg-[var(--ac-onyx)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {countOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVariationType('color');
                      setIntensity('moderate');
                      setCount('4');
                    }}
                  >
                    <Wand2 className="mr-2 h-3 w-3" />
                    Color Palette
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVariationType('style');
                      setIntensity('dramatic');
                      setCount('6');
                    }}
                  >
                    <Sparkles className="mr-2 h-3 w-3" />
                    Style Mix
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Additional Instructions (Optional)
              </Label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="E.g., 'Keep the same shape but explore different textures', 'Make it more eco-friendly', 'Target younger audience'..."
                className="w-full px-3 py-2 rounded-md border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] bg-white dark:bg-[var(--ac-onyx)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ac-gold)]"
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="w-full bg-[var(--ac-gold)] hover:bg-[var(--ac-gold)]/90 text-white"
            >
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Generating Variations...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate {count} Variation{parseInt(count) > 1 ? 's' : ''}
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
              Creating {count} unique variations of your product...
            </p>
            <p className="text-xs text-[var(--ac-stone)] mt-1">
              This may take 20-40 seconds depending on complexity
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: parseInt(count) }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
                Product Variations
              </h3>
              <p className="text-sm text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
                {results.length} creative variation{results.length !== 1 ? 's' : ''} generated
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setResults([])}>
              <ImagePlus className="mr-2 h-4 w-4" />
              New Batch
            </Button>
          </div>
          <GenerationResults concepts={results} onGenerateMore={() => setResults([])} />
        </div>
      )}
    </div>
  );
}
