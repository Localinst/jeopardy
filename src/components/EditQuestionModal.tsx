import React, { useState, useEffect } from 'react';
import { Question, Category } from '../types';

interface EditQuestionModalProps {
  question: Question;
  category: Category;
  onClose: () => void;
  onSave: (categoryId: string, questionId: string, updates: Partial<Question>) => void;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  question,
  category,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    text: question.text,
    answer: question.answer,
    points: question.points,
  });

  useEffect(() => {
    setFormData({
      text: question.text,
      answer: question.answer,
      points: question.points,
    });
  }, [question]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'points' ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(category.id, question.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-blue-900 rounded-lg shadow-2xl max-w-md w-full mx-auto overflow-hidden animate-fadeIn">
        <div className="p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Modifica Domanda</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-yellow-400 mb-2">Categoria</label>
              <input
                type="text"
                value={category.title}
                disabled
                className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
              />
            </div>
            
            <div>
              <label className="block text-yellow-400 mb-2">Punti</label>
              <select
                name="points"
                value={formData.points}
                onChange={handleChange}
                className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
              >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
              </select>
            </div>
            
            <div>
              <label className="block text-yellow-400 mb-2">Domanda</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
              />
            </div>
            
            <div>
              <label className="block text-yellow-400 mb-2">Risposta</label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                required
                rows={2}
                className="w-full p-2 rounded bg-blue-800 text-yellow-400 border border-blue-700"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-blue-900 rounded hover:bg-yellow-400 transition font-bold"
              >
                Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;