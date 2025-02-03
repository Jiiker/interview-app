"use client";

import { useState } from "react";
import { addQuestion } from "@/lib/firestore";

const CATEGORIES = [
  "CS",
  "HTML/CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "기본(경험)",
];

export default function AddQuestionModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questionText, setQuestionText] = useState("");

  const handleSubmit = async () => {
    if (!questionText.trim() || !selectedCategory) {
      alert("카테고리와 질문을 입력하세요.");
      return;
    }

    // 줄바꿈을 기준으로 질문들을 분리
    const questions = questionText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0); // 빈 줄 제거

    try {
      // 모든 질문을 병렬로 추가
      await Promise.all(
        questions.map((question) => addQuestion(selectedCategory, question))
      );

      alert(`${questions.length}개의 질문이 추가되었습니다.`);
      setQuestionText(""); // 입력 필드 초기화
      setSelectedCategory(""); // 카테고리 초기화
      onClose();
    } catch (error) {
      alert("질문 추가 중 오류가 발생했습니다: " + error.message);
    }
  };

  return (
    isOpen && (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
        <div className='bg-white p-6 rounded-lg w-[32rem]'>
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
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* 질문 입력 - textarea로 변경 */}
          <label className='block text-sm font-medium text-gray-700 mt-4'>
            질문 (줄바꿈으로 구분하여 여러 개 입력 가능)
          </label>
          <textarea
            placeholder='질문을 입력하세요.&#10;줄바꿈으로 구분하여 여러 개의 질문을 입력할 수 있습니다.'
            className='w-full p-2 border rounded mt-1 h-40'
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          {/* 버튼 */}
          <div className='flex justify-end mt-4 space-x-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              추가
            </button>
          </div>
        </div>
      </div>
    )
  );
}
