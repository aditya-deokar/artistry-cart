'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#F5F5F5", // Light Gray
  "#808080", // Gray
  "#C0C0C0", // Silver
  "#FF0000", // Red
  "#FF6F61", // Coral
  "#FFA500", // Orange
  "#FFD700", // Gold
  "#FFFF00", // Yellow
  "#ADFF2F", // Green Yellow
  "#008000", // Green
  "#00FFFF", // Aqua
  "#0000FF", // Blue
  "#8A2BE2", // Blue Violet
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#A52A2A", // Brown
  "#D2B48C", // Tan
  "#F0E68C", // Khaki
];

const ColorSector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#FFFFFF");

  return (
    <div className='mt-2'>
      <label className='block font-semibold mb-1 text-primary/80'>Colours</label>
      
      <Controller
        name='colors'
        control={control}
        render={({ field }) => {
          const selectedColors = Array.isArray(field.value) ? field.value : [];

          return (
            <div className='flex gap-3 flex-wrap items-center'>
              {[...defaultColors, ...customColors].map((color) => {
                const isSelected = selectedColors.includes(color);
                const isLightColor = ['#FFFFFF', '#FFFF00'].includes(color);

                return (
                  <Button
                    type='button'
                    key={color}
                    onClick={() =>
                      field.onChange(
                        isSelected
                          ? selectedColors.filter((c: string) => c !== color)
                          : [...selectedColors, color]
                      )
                    }
                    title={color}
                    aria-label={`Color ${color}`}
                    className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition 
                      ${isSelected ? 'scale-110 border-white' : 'border-transparent'} 
                      ${isLightColor ? 'border-gray-600' : ''}`}
                    style={{
                      backgroundColor: color,
                    }}
                  />
                );
              })}

              {/* Add new color button */}
              <Button
                type='button'
                className='w-8 h-8 flex items-center justify-center rounded-full border-2 border-border bg-primary/50 hover:bg-primary/80 transition-all'
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Plus size={16} />
              </Button>

              {/* Color Picker */}
              {showColorPicker && (
                <div className='relative'>
                  <div className='absolute z-50 mt-2 bg-white p-2 rounded shadow-md flex items-center gap-2'>
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className='w-10 h-10 border border-gray-300 rounded cursor-pointer'
                    />
                    <Button
                      type='button'
                      onClick={() => {
                        if (!customColors.includes(newColor)) {
                          setCustomColors([...customColors, newColor]);
                        }
                        setShowColorPicker(false);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default ColorSector;
