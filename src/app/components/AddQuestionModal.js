"use client";

import { useState, useEffect } from "react";
import { addCategory, addQuestion, getCategories } from "@/lib/firestore";

export default function AddQuestionModal({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [questionText, setQuestionText] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories([...fetchedCategories, "새 카테고리"]); // '새 카테고리' 옵션 추가
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      alert("질문을 입력하세요.");
      return;
    }

    let categoryToSave = selectedCategory;

    if (selectedCategory === "새 카테고리") {
      if (!newCategory.trim()) {
        alert("새 카테고리를 입력하세요.");
        return;
      }
      await addCategory(newCategory);
      categoryToSave = newCategory;
    }

    await addQuestion(categoryToSave, questionText);
    alert("질문이 추가되었습니다.");
    onClose();
  };

  return (
    isOpen && (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
        <div className='bg-white p-6 rounded-lg w-96'>
          <h2 className='text-xl font-semibold mb-4'>질문 추가</h2>

          {/* 카테고리 선택 */}
          <label className='block text-sm font-medium text-gray-700'>
            카테고리
          </label>
          <select
            className='w-full p-2 border rounded mt-1'
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value='' disabled>
              카테고리 선택
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* 새 카테고리 입력 */}
          {selectedCategory === "새 카테고리" && (
            <input
              type='text'
              placeholder='새 카테고리 입력'
              className='w-full p-2 border rounded mt-2'
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          )}

          {/* 질문 입력 */}
          <label className='block text-sm font-medium text-gray-700 mt-4'>
            질문
          </label>
          <input
            type='text'
            placeholder='질문 입력'
            className='w-full p-2 border rounded mt-1'
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          {/* 버튼 */}
          <div className='flex justify-end mt-4 space-x-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-400 text-white rounded'
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className='px-4 py-2 bg-blue-500 text-white rounded'
            >
              추가
            </button>
          </div>
        </div>
      </div>
    )
  );
}
