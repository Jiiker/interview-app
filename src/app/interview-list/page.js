// src/app/interview-list/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InterviewCard from "./components/InterviewCard";
import { getInterviews, deleteInterview } from "@/lib/firestore";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { Trash2 } from "lucide-react";

export default function InterviewListPage() {
  const [interviews, setInterviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    interviewId: null,
    interviewTitle: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchInterviews = async () => {
      const fetchedInterviews = await getInterviews();
      setInterviews(fetchedInterviews);
    };
    fetchInterviews();
  }, []);

  const sortedInterviews = [...interviews].sort((a, b) => {
    if (sortOrder === "latest") {
      return b.createdAt - a.createdAt; // 최신순 정렬
    } else {
      return a.createdAt - b.createdAt; // 오래된순 정렬
    }
  });

  const handleDeleteInterview = async () => {
    try {
      await deleteInterview(deleteModal.interviewId);
      setInterviews((prev) =>
        prev.filter((interview) => interview.id !== deleteModal.interviewId)
      );
      setDeleteModal({ isOpen: false, interviewId: null, interviewTitle: "" });
    } catch (error) {
      alert("면접 삭제 중 오류가 발생했습니다: " + error.message);
    }
  };

  return (
    <main className='p-6 max-w-3xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>면접 목록</h1>
        <button
          onClick={() => router.push("/")}
          className='p-2 rounded bg-gray-200 hover:bg-gray-300'
          aria-label='질문 목록으로 돌아가기'
        >
          질문 목록으로 돌아가기
        </button>
      </div>
      <div className='flex items-center mb-4 space-x-4'>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className='px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200'
        >
          <option value='latest'>최신순</option>
          <option value='oldest'>오래된순</option>
        </select>
      </div>
      <div className='space-y-4'>
        {sortedInterviews.length > 0 ? (
          sortedInterviews.map((interview) => (
            <div key={interview.id} className='relative'>
              <InterviewCard
                interview={interview}
                onClick={() => router.push(`/interview-list/${interview.id}`)}
              />
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: true,
                    interviewId: interview.id,
                    interviewTitle: `${interview.title} 면접`,
                  })
                }
                className='absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors'
                aria-label='면접 삭제'
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className='text-gray-500'>진행 중이거나 완료된 면접이 없습니다.</p>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            interviewId: null,
            interviewTitle: "",
          })
        }
        onConfirm={handleDeleteInterview}
        questionText={deleteModal.interviewTitle}
      />
    </main>
  );
}
