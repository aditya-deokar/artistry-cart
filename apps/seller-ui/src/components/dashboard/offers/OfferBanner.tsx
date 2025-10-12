// components/dashboard/offers/OfferBanner.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Wand2, Upload, X, Download, Eye, Palette, Type, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfferBannerProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    description?: string;
    cta?: string;
    backgroundImage?: string;
    backgroundType?: 'gradient' | 'solid' | 'image';
    textColor?: string;
    accentColor?: string;
    layout?: 'centered' | 'left' | 'right';
  };
  onSave?: (bannerData: any) => void;
  onPreview?: (bannerData: any) => void;
}

const gradientOptions = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #ff6b6b, #feca57)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { name: 'Night', value: 'linear-gradient(135deg, #2c3e50, #4a6741)' },
];

const layoutTemplates = [
  {
    id: 'centered',
    name: 'Centered',
    preview: 'Text centered in the middle',
    className: 'text-center items-center justify-center'
  },
  {
    id: 'left',
    name: 'Left Aligned',
    preview: 'Text aligned to the left',
    className: 'text-left items-start justify-start'
  },
  {
    id: 'right',
    name: 'Right Aligned', 
    preview: 'Text aligned to the right',
    className: 'text-right items-end justify-end'
  }
];

export default function OfferBanner({ initialData, onSave, onPreview }: OfferBannerProps) {
  const [bannerData, setBannerData] = useState({
    title: initialData?.title || 'Summer Sale',
    subtitle: initialData?.subtitle || 'Up to 70% OFF',
    description: initialData?.description || 'Limited time offer on all summer items',
    cta: initialData?.cta || 'Shop Now',
    backgroundType: initialData?.backgroundType || 'gradient',
    backgroundImage: initialData?.backgroundImage || '',
    backgroundGradient: gradientOptions[0].value,
    backgroundColor: initialData?.accentColor || '#3b82f6',
    textColor: initialData?.textColor || '#ffffff',
    accentColor: initialData?.accentColor || '#fbbf24',
    layout: initialData?.layout || 'centered',
    opacity: 0.9,
  });

  const [customImage, setCustomImage] = useState<string>('');

  const handleInputChange = (field: string, value: any) => {
    setBannerData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomImage(result);
        setBannerData(prev => ({ ...prev, backgroundImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getBackgroundStyle = () => {
    switch (bannerData.backgroundType) {
      case 'gradient':
        return { background: bannerData.backgroundGradient };
      case 'solid':
        return { backgroundColor: bannerData.backgroundColor };
      case 'image':
        return {
          backgroundImage: `url(${bannerData.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return { background: bannerData.backgroundGradient };
    }
  };

  const BannerPreview = () => {
    const layoutClass = layoutTemplates.find(t => t.id === bannerData.layout)?.className || 'text-center items-center justify-center';
    
    return (
      <div 
        className={cn(
          "relative min-h-[200px] rounded-lg flex flex-col p-8",
          layoutClass
        )}
        style={{
          ...getBackgroundStyle(),
          color: bannerData.textColor,
          opacity: bannerData.opacity
        }}
      >
        {/* Background overlay for better text readability */}
        {bannerData.backgroundType === 'image' && (
          <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
        )}
        
        <div className="relative z-10 space-y-4">
          {bannerData.subtitle && (
            <div 
              className="text-sm font-medium px-3 py-1 rounded-full inline-block"
              style={{ 
                backgroundColor: bannerData.accentColor,
                color: bannerData.textColor
              }}
            >
              {bannerData.subtitle}
            </div>
          )}
          
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {bannerData.title}
          </h1>
          
          {bannerData.description && (
            <p className="text-lg opacity-90 max-w-2xl">
              {bannerData.description}
            </p>
          )}
          
          {bannerData.cta && (
            <Button 
              size="lg"
              className="mt-6 font-semibold px-8"
              style={{
                backgroundColor: bannerData.accentColor,
                color: bannerData.textColor,
                borderColor: bannerData.accentColor
              }}
            >
              {bannerData.cta}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Offer Banner Designer</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onPreview?.(bannerData)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => onSave?.(bannerData)}>
            <Download className="h-4 w-4 mr-2" />
            Save Banner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <BannerPreview />
          </CardContent>
        </Card>

        {/* Banner Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">
                  <Type className="h-4 w-4 mr-1" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="background">
                  <Image className="h-4 w-4 mr-1" />
                  Background
                </TabsTrigger>
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-1" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="h-4 w-4 mr-1" />
                  Layout
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="title">Main Title</Label>
                  <Input
                    id="title"
                    value={bannerData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter main title"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={bannerData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Enter subtitle (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={bannerData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cta">Call to Action</Label>
                  <Input
                    id="cta"
                    value={bannerData.cta}
                    onChange={(e) => handleInputChange('cta', e.target.value)}
                    placeholder="Enter CTA text"
                  />
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-4">
                <div>
                  <Label>Background Type</Label>
                  <Select 
                    value={bannerData.backgroundType} 
                    onValueChange={(value) => handleInputChange('backgroundType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="image">Custom Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bannerData.backgroundType === 'gradient' && (
                  <div>
                    <Label>Gradient Options</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {gradientOptions.map((gradient) => (
                        <Button
                          key={gradient.name}
                          variant="outline"
                          className={cn(
                            "h-12 text-white font-medium",
                            bannerData.backgroundGradient === gradient.value && "ring-2 ring-primary"
                          )}
                          style={{ background: gradient.value }}
                          onClick={() => handleInputChange('backgroundGradient', gradient.value)}
                        >
                          {gradient.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {bannerData.backgroundType === 'solid' && (
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={bannerData.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={bannerData.backgroundColor}
                        onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                )}

                {bannerData.backgroundType === 'image' && (
                  <div>
                    <Label>Upload Background Image</Label>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mb-2"
                      />
                      {customImage && (
                        <div className="relative">
                          <img 
                            src={customImage} 
                            alt="Preview" 
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={() => {
                              setCustomImage('');
                              handleInputChange('backgroundImage', '');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="opacity">Background Opacity</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={bannerData.opacity}
                    onChange={(e) => handleInputChange('opacity', parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="text-sm text-muted-foreground text-center mt-1">
                    {Math.round(bannerData.opacity * 100)}%
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4">
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={bannerData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={bannerData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color (CTA Button)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={bannerData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={bannerData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#fbbf24"
                    />
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <Label>Color Presets</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { name: 'Light', text: '#1f2937', accent: '#3b82f6' },
                      { name: 'Dark', text: '#ffffff', accent: '#10b981' },
                      { name: 'Warm', text: '#fef3c7', accent: '#f59e0b' },
                      { name: 'Cool', text: '#dbeafe', accent: '#6366f1' },
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange('textColor', preset.text);
                          handleInputChange('accentColor', preset.accent);
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div>
                  <Label>Text Layout</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {layoutTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant={bannerData.layout === template.id ? "default" : "outline"}
                        className="h-auto p-4 text-left"
                        onClick={() => handleInputChange('layout', template.id)}
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.preview}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
