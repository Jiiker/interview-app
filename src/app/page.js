"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getQuestions,
  updateQuestionStatus,
  deleteQuestion,
  createInterview, // 면접 생성 함수 추가
} from "@/lib/firestore";
import { Trash2, User } from "lucide-react";
import AddQuestionModal from "./components/AddQuestionModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

const CATEGORIES = [
  "CS",
  "HTML/CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "기본(경험)",
];

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    questionId: null,
    questionText: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedQuestions = await getQuestions();
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

  const handleDelete = async () => {
    try {
      await deleteQuestion(deleteModal.questionId);
      setQuestions((prev) =>
        prev.filter((q) => q.id !== deleteModal.questionId)
      );
      setDeleteModal({ isOpen: false, questionId: null, questionText: "" });
    } catch (error) {
      alert("질문 삭제 중 오류가 발생했습니다: " + error.message);
    }
  };

  const handleStartInterview = async () => {
    try {
      if (!questions || questions.length === 0) {
        alert("면접을 시작할 수 없습니다. 질문을 추가해주세요.");
        return;
      }

      // 백엔드에서 질문을 자동 선택하여 면접을 생성 (질문 리스트 전달)
      const interviewId = await createInterview(questions);

      // 생성된 면접 상세 페이지로 이동
      router.push(`/interview-list/${interviewId}`);
    } catch (error) {
      console.error("면접 생성 중 오류:", error);
      alert("면접을 시작할 수 없습니다. 다시 시도해주세요.");
    }
  };

  // 필터링된 카테고리 목록 생성
  const filteredCategories =
    selectedCategory === "전체" ? CATEGORIES : [selectedCategory];

  return (
    <main className='p-6 max-w-2xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>면접 질문 목록</h1>
        <button
          onClick={() => router.push("/interview-list")}
          className='p-2 rounded-full bg-gray-100 hover:bg-gray-200'
          aria-label='마이페이지'
        >
          <User className='w-6 h-6 text-gray-700' />
        </button>
      </div>

      {/* 상단 필터와 버튼 */}
      <div className='flex justify-between items-center mb-6'>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200'
        >
          <option value='전체'>전체 카테고리</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className='flex gap-2'>
          <button
            onClick={() => setIsModalOpen(true)}
            className='bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500'
          >
            질문 추가
          </button>
          <button
            onClick={handleStartInterview}
            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600'
          >
            면접 시작
          </button>
        </div>
      </div>

      {/* 카테고리별 질문 리스트 */}
      {filteredCategories.map((category) => (
        <div key={category} className='mb-6'>
          <h2 className='text-xl font-semibold mb-3'>{category}</h2>
          <ul className='space-y-2'>
            {questions.filter((q) => q.category === category).length > 0 ? (
              questions
                .filter((q) => q.category === category)
                .map((question) => (
                  <li
                    key={question.id}
                    className='flex items-start justify-between bg-white rounded-lg p-3 shadow-sm'
                  >
                    <div className='flex items-start gap-2 flex-1 mr-4'>
                      <input
                        type='checkbox'
                        checked={question.completed}
                        onChange={(e) =>
                          handleCheck(question.id, e.target.checked)
                        }
                        className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span
                        className={
                          question.completed ? "line-through text-gray-400" : ""
                        }
                      >
                        {question.question}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          questionId: question.id,
                          questionText: question.question,
                        })
                      }
                      className='text-gray-400 hover:text-red-500 transition-colors'
                      aria-label='질문 삭제'
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))
            ) : (
              <p className='text-gray-500'>등록된 질문이 없습니다.</p>
            )}
          </ul>
        </div>
      ))}

      {/* 모달 */}
      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, questionId: null, questionText: "" })
        }
        onConfirm={handleDelete}
        questionText={deleteModal.questionText}
      />
    </main>
  );
}
