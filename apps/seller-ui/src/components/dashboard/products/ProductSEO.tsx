// components/dashboard/products/ProductSEO.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Globe, Hash, Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function ProductSEO() {
  const form = useFormContext();
  const [generatingSEO, setGeneratingSEO] = useState(false);
  
  const title = form.watch('title');
  const seoTitle = form.watch('seoTitle');
  const seoDescription = form.watch('seoDescription');
  const slug = form.watch('slug');
  
  const seoTitleLength = seoTitle?.length || 0;
  const seoDescriptionLength = seoDescription?.length || 0;

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const autoGenerateSEO = () => {
    if (!title) return;
    
    setGeneratingSEO(true);
    
    // Simulate API call for SEO generation
    setTimeout(() => {
      if (!seoTitle) {
        form.setValue('seoTitle', title);
      }
      
      if (!seoDescription && form.getValues('description')) {
        const description = form.getValues('description');
        const truncated = description.length > 155 
          ? description.substring(0, 155) + '...'
          : description;
        form.setValue('seoDescription', truncated);
      }
      
      if (!slug) {
        form.setValue('slug', generateSlug(title));
      }
      
      setGeneratingSEO(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Optimization
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={autoGenerateSEO}
            disabled={generatingSEO || !title}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {generatingSEO ? 'Generating...' : 'Auto Generate'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SEO Title */}
        <FormField
          control={form.control}
          name="seoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                SEO Title
                <Badge 
                  variant={seoTitleLength > 60 ? 'destructive' : seoTitleLength > 50 ? 'secondary' : 'outline'}
                >
                  {seoTitleLength}/60
                </Badge>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter SEO title (50-60 characters recommended)"
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                This title will appear in search engine results
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                URL Slug
              </FormLabel>
              <FormControl>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                    /product/
                  </div>
                  <Input
                    placeholder="product-url-slug"
                    className="rounded-l-none"
                    {...field}
                    onChange={(e) => {
                      const slug = generateSlug(e.target.value);
                      field.onChange(slug);
                    }}
                  />
                </div>
              </FormControl>
              <p className="text-sm text-muted-foreground">
                The URL-friendly version of the product name
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meta Description */}
        <FormField
          control={form.control}
          name="seoDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Meta Description
                <Badge 
                  variant={seoDescriptionLength > 160 ? 'destructive' : seoDescriptionLength > 140 ? 'secondary' : 'outline'}
                >
                  {seoDescriptionLength}/160
                </Badge>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter meta description (140-160 characters recommended)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                This description will appear in search engine results
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Focus Keywords */}
        <FormField
          control={form.control}
          name="focusKeywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Focus Keywords
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter keywords separated by commas"
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Main keywords you want this product to rank for
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Preview */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Search Engine Preview</h4>
          <div className="space-y-2">
            <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
              {seoTitle || title || 'Product Title'}
            </div>
            <div className="text-green-600 text-sm">
              https://yourstore.com/product/{slug || 'product-slug'}
            </div>
            <div className="text-gray-600 text-sm leading-relaxed">
              {seoDescription || 'Meta description will appear here...'}
            </div>
          </div>
        </div>

        {/* SEO Score */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Title Length:</span>
            <Badge variant={seoTitleLength >= 30 && seoTitleLength <= 60 ? 'default' : 'secondary'}>
              {seoTitleLength >= 30 && seoTitleLength <= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Description Length:</span>
            <Badge variant={seoDescriptionLength >= 120 && seoDescriptionLength <= 160 ? 'default' : 'secondary'}>
              {seoDescriptionLength >= 120 && seoDescriptionLength <= 160 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>URL Slug:</span>
            <Badge variant={slug ? 'default' : 'secondary'}>
              {slug ? 'Set' : 'Missing'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Focus Keywords:</span>
            <Badge variant={form.getValues('focusKeywords') ? 'default' : 'secondary'}>
              {form.getValues('focusKeywords') ? 'Set' : 'Missing'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
