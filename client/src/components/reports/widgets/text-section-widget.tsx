import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit2, Save } from 'lucide-react';

interface TextSectionWidgetProps {
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function TextSectionWidget({ 
  initialContent = 'Add your report text here. This could be an introduction, analysis section, or conclusion. This text will appear as a full-width section in your report.',
  onSave 
}: TextSectionWidgetProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) {
      onSave(content);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 space-y-4">
        <Textarea
          className="min-h-[150px] text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your text here..."
        />
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
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="whitespace-pre-line">{content}</p>
      </div>
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