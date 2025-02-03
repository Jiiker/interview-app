// src/app/interview-list/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InterviewCard from "./components/InterviewCard";
import { getInterviews } from "@/lib/firestore";

export default function InterviewListPage() {
  const [interviews, setInterviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const router = useRouter();

  useEffect(() => {
    const fetchInterviews = async () => {
      const fetchedInterviews = await getInterviews();
      setInterviews(fetchedInterviews);
    };
    fetchInterviews();
  }, []);

  const sortedInterviews = [...interviews].sort((a, b) => {
    return sortOrder === "latest"
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date);
  });

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
      <div className='items-center mb-4'>
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
            <InterviewCard
              key={interview.id}
              interview={interview}
              onClick={() => router.push(`/interview-detail/${interview.id}`)}
            />
          ))
        ) : (
          <p className='text-gray-500'>진행 중이거나 완료된 면접이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
