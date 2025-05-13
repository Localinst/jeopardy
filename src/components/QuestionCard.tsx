import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  categoryId: string;
  onSelect: (categoryId: string, questionId: string) => void;
  isEditMode: boolean;
  onEdit?: (categoryId: string, questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  categoryId,
  onSelect,
  isEditMode,
  onEdit,
}) => {
  const handleClick = () => {
    if (isEditMode && onEdit) {
      onEdit(categoryId, question.id);
    } else if (!question.isAnswered) {
      onSelect(categoryId, question.id);
    }
  };

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center
        rounded-md shadow-md transition-all duration-300 ease-in-out
        cursor-pointer transform hover:scale-105 hover:shadow-lg
        ${question.isAnswered ? 'bg-gray-700 text-gray-500' : 'bg-blue-900 text-yellow-400 hover:bg-blue-800'}
        ${isEditMode ? 'border-2 border-dashed border-yellow-400' : ''}
      `}
      onClick={handleClick}
    >
      <div className="text-center">
        {question.isAnswered ? (
          <span className="text-2xl font-bold">&#10003;</span>
        ) : (
          <span className="text-2xl md:text-3xl font-bold">{question.points}</span>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;