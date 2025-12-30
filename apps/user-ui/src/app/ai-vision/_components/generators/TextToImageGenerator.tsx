'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, X } from 'lucide-react';
import { aiVisionClient, type Concept, type SchemaData } from '@/lib/api/aivision-client';
import { toast } from 'sonner';
import GenerationResults from './GenerationResults';

export default function TextToImageGenerator() {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedConcepts, setGeneratedConcepts] = useState<Concept[]>([]);
  
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [style, setStyle] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 10000]);

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const data = await aiVisionClient.getAllSchema();
      setSchema(data);
    } catch (error) {
      console.error('Failed to load schema:', error);
      toast.error('Failed to load options. Using defaults.');
    }
  };

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to create');
      return;
    }

    try {
      setLoading(true);
      setGeneratedConcepts([]);
      
      const concepts = await aiVisionClient.generateFromPrompt({
        prompt: prompt.trim(),
        category: category || undefined,
        subCategory: subCategory || undefined,
        style: style || undefined,
        materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
        priceRange: {
          min: priceRange[0],
          max: priceRange[1],
        },
      });

      setGeneratedConcepts(concepts);
      toast.success(`Generated ${concepts.length} concept${concepts.length > 1 ? 's' : ''}!`);
    } catch (error: any) {
      console.error('Generation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to generate concepts');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = schema?.categories?.find((c) => c.value === category);

  if (generatedConcepts.length > 0) {
    return (
      <GenerationResults
        concepts={generatedConcepts}
        onGenerateMore={() => setGeneratedConcepts([])}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="space-y-6"
        >
          {/* Main Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-medium">
              Describe Your Vision
              <span className="text-[var(--ac-gold)]">*</span>
            </Label>
            <Textarea
              id="prompt"
              placeholder="E.g., A handcrafted ceramic vase with intricate floral patterns, inspired by traditional Indian pottery..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)] border-[var(--ac-linen)] focus:border-[var(--ac-gold)]"
              disabled={loading}
            />
            <p className="text-xs text-[var(--ac-stone)]">
              Be as detailed as possible. Mention colors, patterns, size, occasion, or inspiration.
            </p>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger className="bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {schema?.categories?.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && selectedCategory.subcategories?.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select value={subCategory} onValueChange={setSubCategory} disabled={loading}>
                  <SelectTrigger className="bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)]">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {selectedCategory.subcategories?.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle} disabled={loading}>
              <SelectTrigger className="bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)]">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {schema?.styles?.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          {/* Materials */}
          <div className="space-y-3">
            <Label>Preferred Materials</Label>
            <div className="flex flex-wrap gap-2">
              {schema?.materials?.slice(0, 12).map((material) => (
                <Badge
                  key={material}
                  variant={selectedMaterials.includes(material) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-[var(--ac-gold)] hover:text-white transition-colors"
                  onClick={() => !loading && handleMaterialToggle(material)}
                >
                  {material}
                  {selectedMaterials.includes(material) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              )) || []}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label>Estimated Price Range</Label>
            <Slider
              min={500}
              max={50000}
              step={500}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              disabled={loading}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-[var(--ac-stone)]">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            size="lg"
            disabled={loading || !prompt.trim()}
            className="w-full bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-white font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating... (10-30 seconds)
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Concepts
              </>
            )}
          </Button>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-[var(--ac-stone)]">
                <span>Our AI is creating unique concepts for you...</span>
              </div>
              <div className="h-2 bg-[var(--ac-linen)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--ac-gold)] animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Tips Card */}
      <Card className="p-4 bg-[var(--ac-linen)]/50 dark:bg-[var(--ac-slate)]/50 border-[var(--ac-sand)]">
        <h4 className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2">
          💡 Tips for Better Results
        </h4>
        <ul className="text-xs text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] space-y-1">
          <li>• Mention specific details: colors, patterns, textures, dimensions</li>
          <li>• Reference traditional crafts or cultural inspirations</li>
          <li>• Describe the occasion or purpose of the item</li>
          <li>• Include any personal touches or customization ideas</li>
        </ul>
      </Card>
    </div>
  );
}
