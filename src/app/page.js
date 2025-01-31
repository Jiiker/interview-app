"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getQuestions,
  updateQuestionStatus,
  getCategories,
} from "@/lib/firestore";
import AddQuestionModal from "./components/AddQuestionModal";

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedCategories = await getCategories();
      const fetchedQuestions = await getQuestions();
      setCategories(fetchedCategories);
      setQuestions(fetchedQuestions);
    };
    fetchData();
  }, []);

  const handleCheck = async (id, completed) => {
    await updateQuestionStatus(id, completed);
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, completed } : q))
    );
  };

  return (
    <main className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>면접 질문 목록</h1>

      {/* 상단 버튼 */}
      <div className='flex justify-between mb-6'>
        <button
          onClick={() => setIsModalOpen(true)}
          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
        >
          질문 추가
        </button>
        <button
          onClick={() => router.push("/mock-interview")}
          className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600'
        >
          면접 시작
        </button>
      </div>

      {/* 카테고리별 질문 리스트 */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category} className='mb-6'>
            <h2 className='text-xl font-semibold mb-3'>{category}</h2>
            <ul className='space-y-2'>
              {questions.filter((q) => q.category === category).length > 0 ? (
                questions
                  .filter((q) => q.category === category)
                  .map((question) => (
                    <li
                      key={question.id}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='checkbox'
                        checked={question.completed}
                        onChange={(e) =>
                          handleCheck(question.id, e.target.checked)
                        }
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span
                        className={
                          question.completed ? "line-through text-gray-400" : ""
                        }
                      >
                        {question.question}
                      </span>
                    </li>
                  ))
              ) : (
                <p className='text-gray-500'>등록된 질문이 없습니다.</p>
              )}
            </ul>
          </div>
        ))
      ) : (
        <p className='text-gray-500'>등록된 질문이 없습니다.</p>
      )}

      {/* 질문 추가 모달 */}
      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
