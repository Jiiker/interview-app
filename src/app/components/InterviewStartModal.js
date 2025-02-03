"use client";

import { useState, useEffect } from "react";

export default function InterviewStartModal({ isOpen, onClose, questions }) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
    }

    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // 미완료 질문들만 필터링
      const uncompletedQuestions = questions.filter((q) => !q.completed);

      // 기본 질문과 다른 질문들을 분리
      const basicQuestions = uncompletedQuestions.filter(
        (q) => q.category === "기본(경험)"
      );
      const otherQuestions = uncompletedQuestions.filter(
        (q) => q.category !== "기본(경험)"
      );

      // 기본 질문에서 1개 랜덤 선택
      const selectedBasicQuestion =
        basicQuestions.length > 0
          ? [basicQuestions[Math.floor(Math.random() * basicQuestions.length)]]
          : [];

      // 다른 카테고리에서 5개 랜덤 선택
      const selectedOtherQuestions = otherQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      // 선택된 질문들 합치기
      setSelectedQuestions([
        ...selectedOtherQuestions,
        ...selectedBasicQuestion,
      ]);
    }
  }, [isOpen, questions]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'
      onClick={(e) => e.stopPropagation()}
    >
      <div className='bg-white p-6 rounded-lg w-[48rem]'>
        <h2 className='text-2xl font-bold mb-4'>면접 질문 목록</h2>

        {selectedQuestions.length === 6 ? (
          <div className='max-h-[80vh] overflow-y-auto'>
            <div className='mb-6 text-gray-600'>
              총 6개의 질문이 선택되었습니다. (기본 질문 1개 + 기술 질문 5개)
            </div>
            <ul className='space-y-4'>
              {selectedQuestions.map((question, index) => (
                <li key={question.id} className='p-4 bg-gray-50 rounded-lg'>
                  <div className='font-medium text-gray-500 text-sm mb-1'>
                    {question.category}
                  </div>
                  <div className='text-lg'>
                    {index + 1}. {question.question}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-600'>
            선택 가능한 질문이 충분하지 않습니다. <br />
            미완료 상태인 질문을 더 추가해주세요.
          </div>
        )}

        <div className='flex justify-end mt-6 gap-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
          >
            닫기
          </button>
          {selectedQuestions.length === 6 && (
            <button
              onClick={() => {
                // TODO: 면접 시작 로직 구현
                onClose();
              }}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              면접 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
