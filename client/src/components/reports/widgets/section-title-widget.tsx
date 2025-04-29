import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SectionTitleWidgetProps {
  initialTitle?: string;
  initialAlign?: 'left' | 'center' | 'right';
  initialSize?: 'small' | 'medium' | 'large';
  onSave?: (data: { title: string, align: string, size: string }) => void;
}

export function SectionTitleWidget({
  initialTitle = 'Section Title',
  initialAlign = 'left',
  initialSize = 'medium',
  onSave
}: SectionTitleWidgetProps) {
  const [title, setTitle] = useState(initialTitle);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialAlign);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>(initialSize);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) {
      onSave({ title, align, size });
    }
  };

  const getTitleClass = () => {
    const sizeClass = {
      small: 'text-lg font-semibold',
      medium: 'text-xl font-bold',
      large: 'text-2xl font-extrabold'
    };
    
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    
    return cn(sizeClass[size], alignClass[align]);
  };

  if (isEditing) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title-input">Title</Label>
            <Input
              id="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter section title..."
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <Label>Alignment</Label>
            <RadioGroup 
              value={align} 
              onValueChange={(value) => setAlign(value as 'left' | 'center' | 'right')}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="left" id="align-left" />
                <Label htmlFor="align-left" className="cursor-pointer">Left</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="center" id="align-center" />
                <Label htmlFor="align-center" className="cursor-pointer">Center</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="right" id="align-right" />
                <Label htmlFor="align-right" className="cursor-pointer">Right</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <RadioGroup 
              value={size} 
              onValueChange={(value) => setSize(value as 'small' | 'medium' | 'large')}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="small" id="size-small" />
                <Label htmlFor="size-small" className="cursor-pointer">Small</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="medium" id="size-medium" />
                <Label htmlFor="size-medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="large" id="size-large" />
                <Label htmlFor="size-large" className="cursor-pointer">Large</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
            <Save className="h-3 w-3" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className={getTitleClass()}>
        {title}
      </h3>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1"
        >
          <Edit2 className="h-3 w-3" />
          Edit
        </Button>
      </div>
    </div>
  );
}