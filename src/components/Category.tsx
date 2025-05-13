import React from 'react';
import { Category as CategoryType, Question } from '../types';
import QuestionCard from './QuestionCard';

interface CategoryProps {
  category: CategoryType;
  onSelectQuestion: (categoryId: string, questionId: string) => void;
  isEditMode: boolean;
  onEditTitle: (categoryId: string, newTitle: string) => void;
  onEditQuestion?: (categoryId: string, questionId: string) => void;
}

const Category: React.FC<CategoryProps> = ({
  category,
  onSelectQuestion,
  isEditMode,
  onEditTitle,
  onEditQuestion,
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditTitle(category.id, e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-950 text-yellow-400 p-3 text-center font-bold border-b border-blue-800">
        {isEditMode ? (
          <input
            type="text"
            value={category.title}
            onChange={handleTitleChange}
            className="w-full bg-blue-900 text-yellow-400 p-2 rounded text-center font-bold"
          />
        ) : (
          <h3 className="text-sm md:text-lg uppercase">{category.title}</h3>
        )}
      </div>
      <div className="flex-1 flex flex-col divide-y divide-blue-800">
        {category.questions
          .sort((a, b) => a.points - b.points)
          .map((question: Question) => (
            <div key={question.id} className="flex-1">
              <QuestionCard
                question={question}
                categoryId={category.id}
                onSelect={onSelectQuestion}
                isEditMode={isEditMode}
                onEdit={onEditQuestion}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Category;