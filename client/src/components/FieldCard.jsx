import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { 
  GripVertical, 
  Type, 
  AlignLeft, 
  Hash, 
  Mail, 
  ChevronDown, 
  CheckSquare, 
  CircleDot, 
  Star, 
  Calendar,
  Trash2
} from 'lucide-react';

const fieldIcons = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  email: Mail,
  dropdown: ChevronDown,
  checkbox: CheckSquare,
  radio: CircleDot,
  rating: Star,
  date: Calendar
};

export default function FieldCard({ field, index, isSelected, onClick, onDelete }) {
  const Icon = fieldIcons[field.type] || Type;

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onClick}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            isSelected 
              ? 'border-l-3 border-l-cream-accent border-y border-r border-cream-border bg-cream-surface shadow-sm' 
              : 'border border-cream-border bg-cream-surface/50 hover:border-cream-accent/50 hover:bg-cream-surface'
          } ${snapshot.isDragging ? 'shadow-lg border-cream-accent bg-cream-surface' : ''}`}
        >
          {/* Left Area: Grip and Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Drag Handle */}
            <div 
              {...provided.dragHandleProps} 
              className="p-1 text-cream-muted hover:text-cream-text cursor-grab active:cursor-grabbing rounded hover:bg-cream-base"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Field Type Icon */}
            <div className="p-2 bg-cream-base rounded-lg text-cream-accent shrink-0">
              <Icon className="w-4 h-4" />
            </div>

            {/* Label and Helper Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cream-text truncate flex items-center gap-1">
                {field.label || 'Untitled Field'}
                {field.required && <span className="text-cream-danger font-bold">*</span>}</p>
              <p className="text-[10px] text-cream-muted font-medium capitalize mt-0.5">
                {field.type === 'textarea' ? 'long text' : field.type} field
              </p>
            </div>
          </div>

          {/* Right Area: Delete Action */}
          <div className="flex items-center gap-1 shrink-0 ml-3">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering card selection
                onDelete(field.id);
              }}
              title="Delete Field"
              className="p-2 text-cream-muted hover:text-cream-danger hover:bg-cream-danger/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
