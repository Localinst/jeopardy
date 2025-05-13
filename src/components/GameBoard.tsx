import React, { useState } from 'react';
import Category from './Category';
import QuestionModal from './QuestionModal';
import EditQuestionModal from './EditQuestionModal';
import { Question, Team } from '../types';

interface GameBoardProps {
  categories: any[];
  onSelectQuestion: (categoryId: string, questionId: string) => void;
  selectedQuestion: Question | null;
  selectedCategory: any | null;
  onCloseQuestion: () => void;
  onAnswerQuestion: (isCorrect: boolean) => void;
  isEditMode: boolean;
  currentTeam: Team | null;
  onUpdateCategory: (categoryId: string, newTitle: string) => void;
  onUpdateQuestion: (
    categoryId: string,
    questionId: string,
    updates: Partial<Question>
  ) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  categories,
  onSelectQuestion,
  selectedQuestion,
  selectedCategory,
  onCloseQuestion,
  onAnswerQuestion,
  isEditMode,
  currentTeam,
  onUpdateCategory,
  onUpdateQuestion,
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const handleEditQuestion = (categoryId: string, questionId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const question = category.questions.find((q: Question) => q.id === questionId);
    if (!question) return;

    setEditingQuestion(question);
    setEditingCategory(category);
  };

  const handleCloseEditModal = () => {
    setEditingQuestion(null);
    setEditingCategory(null);
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-5 h-full border border-blue-800 divide-x divide-blue-800">
        {categories.map(category => (
          <Category
            key={category.id}
            category={category}
            onSelectQuestion={onSelectQuestion}
            isEditMode={isEditMode}
            onEditTitle={onUpdateCategory}
            onEditQuestion={handleEditQuestion}
          />
        ))}
      </div>

      {selectedQuestion && selectedCategory && (
        <QuestionModal
          question={selectedQuestion}
          category={selectedCategory}
          currentTeam={currentTeam}
          onClose={onCloseQuestion}
          onAnswer={onAnswerQuestion}
          isEditMode={false}
        />
      )}

      {isEditMode && editingQuestion && editingCategory && (
        <EditQuestionModal
          question={editingQuestion}
          category={editingCategory}
          onClose={handleCloseEditModal}
          onSave={onUpdateQuestion}
        />
      )}
    </div>
  );
};

export default GameBoard;