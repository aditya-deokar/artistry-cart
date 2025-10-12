// components/dashboard/discounts/DiscountCodeGenerator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface DiscountCodeGeneratorProps {
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  onPrefixChange?: (prefix: string) => void;
  onSuffixChange?: (suffix: string) => void;
}

const codePatterns = [
  { label: 'Random Letters', value: 'letters', example: 'ABCDEF' },
  { label: 'Random Numbers', value: 'numbers', example: '123456' },
  { label: 'Mixed (Letters + Numbers)', value: 'mixed', example: 'AB12CD' },
  { label: 'Word + Numbers', value: 'word-numbers', example: 'SAVE20' },
  { label: 'Custom Pattern', value: 'custom', example: 'YOUR-CODE' },
];

const predefinedCodes = [
  'SAVE10', 'SAVE20', 'WELCOME', 'FIRSTTIME', 'NEWUSER', 
  'FLASH50', 'MEGA30', 'SUPER25', 'EXTRA15', 'BONUS40'
];

export default function DiscountCodeGenerator({
  value,
  onChange,
  prefix = '',
  suffix = '',
  onPrefixChange,
  onSuffixChange
}: DiscountCodeGeneratorProps) {
  const [pattern, setPattern] = useState<string>('mixed');
  const [codeLength, setCodeLength] = useState(8);
  const [useUppercase, setUseUppercase] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const generateRandomString = (length: number, chars: string): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateCode = (): string => {
    let chars = '';
    let code = '';

    switch (pattern) {
      case 'letters':
        chars = excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        code = generateRandomString(codeLength, chars);
        break;
      
      case 'numbers':
        chars = excludeSimilar ? '23456789' : '0123456789';
        code = generateRandomString(codeLength, chars);
        break;
      
      case 'mixed':
        const letters = excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = excludeSimilar ? '23456789' : '0123456789';
        chars = letters + numbers;
        code = generateRandomString(codeLength, chars);
        break;
      
      case 'word-numbers':
        const words = ['SAVE', 'GET', 'WIN', 'TAKE', 'GRAB', 'ENJOY', 'USE'];
        const word = words[Math.floor(Math.random() * words.length)];
        const number = Math.floor(Math.random() * 99) + 1;
        code = `${word}${number}`;
        break;
      
      default:
        code = generateRandomString(codeLength, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    }

    // Apply prefix and suffix
    const finalCode = `${prefix}${code}${suffix}`;
    return useUppercase ? finalCode.toUpperCase() : finalCode;
  };

  const handleGenerate = () => {
    const newCode = generateCode();
    onChange(newCode);
    toast.success('New discount code generated!');
  };

  const generateMultipleCodes = (count: number = 5) => {
    const codes = Array.from({ length: count }, () => generateCode());
    setGeneratedCodes(codes);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const selectPredefinedCode = (code: string) => {
    const finalCode = `${prefix}${code}${suffix}`;
    onChange(finalCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Code */}
        <div className="space-y-2">
          <Label>Generated Code</Label>
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter or generate a code"
              className="font-mono text-lg"
            />
            <Button onClick={handleGenerate} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => copyCode(value)} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Prefix & Suffix */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Prefix (Optional)</Label>
            <Input
              value={prefix}
              onChange={(e) => onPrefixChange?.(e.target.value)}
              placeholder="e.g., SAVE"
              maxLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Suffix (Optional)</Label>
            <Input
              value={suffix}
              onChange={(e) => onSuffixChange?.(e.target.value)}
              placeholder="e.g., 2024"
              maxLength={6}
            />
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="space-y-2">
          <Label>Code Pattern</Label>
          <Select value={pattern} onValueChange={setPattern}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {codePatterns.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs text-muted-foreground">Example: {p.example}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Code Length */}
        {pattern !== 'word-numbers' && (
          <div className="space-y-2">
            <Label>Code Length: {codeLength}</Label>
            <input
              type="range"
              min="4"
              max="16"
              value={codeLength}
              onChange={(e) => setCodeLength(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>16</span>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Force Uppercase</Label>
            <Switch checked={useUppercase} onCheckedChange={setUseUppercase} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Exclude Similar Characters (0,O,I,1)</Label>
            <Switch checked={excludeSimilar} onCheckedChange={setExcludeSimilar} />
          </div>
        </div>

        {/* Predefined Codes */}
        <div className="space-y-2">
          <Label>Quick Select</Label>
          <div className="flex flex-wrap gap-2">
            {predefinedCodes.map((code) => (
              <Button
                key={code}
                variant="outline"
                size="sm"
                onClick={() => selectPredefinedCode(code)}
                className="text-xs"
              >
                {prefix}{code}{suffix}
              </Button>
            ))}
          </div>
        </div>

        {/* Bulk Generation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Generate Multiple Codes</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generateMultipleCodes()}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate 5
            </Button>
          </div>
          
          {generatedCodes.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {generatedCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <code className="font-mono text-sm">{code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onChange(code);
                      copyCode(code);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-muted/50 rounded-lg p-4">
          <Label className="text-sm font-medium mb-2 block">Preview</Label>
          <div className="font-mono text-lg font-bold text-center p-2 bg-background border rounded">
            {value || 'Generated code will appear here'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
