import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ColorSettingsWidgetProps {
  initialColors?: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  onSave?: (colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  }) => void;
}

export function ColorSettingsWidget({
  initialColors = {
    primary: '#2563eb',   // Blue
    secondary: '#16a34a', // Green
    tertiary: '#d97706',  // Amber
    quaternary: '#db2777', // Pink
  },
  onSave,
}: ColorSettingsWidgetProps) {
  const [colors, setColors] = useState(initialColors);

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(colors);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-8 h-8 rounded-md border" 
                style={{ backgroundColor: colors.primary }}
              />
              <Input
                id="primary-color"
                type="text"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-8 h-8 rounded-md border" 
                style={{ backgroundColor: colors.secondary }}
              />
              <Input
                id="secondary-color"
                type="text"
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tertiary-color">Tertiary Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-8 h-8 rounded-md border" 
                style={{ backgroundColor: colors.tertiary }}
              />
              <Input
                id="tertiary-color"
                type="text"
                value={colors.tertiary}
                onChange={(e) => handleColorChange('tertiary', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quaternary-color">Quaternary Color</Label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-8 h-8 rounded-md border" 
                style={{ backgroundColor: colors.quaternary }}
              />
              <Input
                id="quaternary-color"
                type="text"
                value={colors.quaternary}
                onChange={(e) => handleColorChange('quaternary', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between space-x-2">
            <div className="flex-1 h-8 rounded-md" style={{ backgroundColor: colors.primary }}></div>
            <div className="flex-1 h-8 rounded-md" style={{ backgroundColor: colors.secondary }}></div>
            <div className="flex-1 h-8 rounded-md" style={{ backgroundColor: colors.tertiary }}></div>
            <div className="flex-1 h-8 rounded-md" style={{ backgroundColor: colors.quaternary }}></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            These colors will be used in all charts and visualizations throughout the report.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          size="sm" 
          onClick={handleSave}
          className="flex items-center gap-1"
        >
          <Save className="h-3 w-3" />
          Apply Colors
        </Button>
      </div>
    </div>
  );
}