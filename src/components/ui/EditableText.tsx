import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from './textarea';
import { Button } from './button';
import { Edit, Save, X } from 'lucide-react';

interface EditableTextProps {
  text: string;
  onSave: (newText: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ text, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave(currentText);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setCurrentText(text); // Reset to original text
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
  };

  return (
    <div className="relative">
      {isEditing ? (
        <div className="flex flex-col gap-2"> {/* Wrap textarea and buttons in a flex container */}
          <Textarea
            ref={textareaRef}
            value={currentText}
            onChange={handleTextChange}
            className="w-full"
            rows={3}
          />
          <div className="flex gap-1 justify-end"> {/* Buttons at the bottom, right-aligned */}
            <Button variant="ghost" size="icon" onClick={handleCancelClick} title="Cancel">
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSaveClick} title="Save">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded break-words whitespace-pre-wrap line-clamp-2">
            {text}
          </p>
          <Button variant="ghost" size="icon" onClick={handleEditClick} title="Edit">
            <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditableText;
