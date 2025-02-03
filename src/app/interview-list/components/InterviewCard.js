"use client";

export default function InterviewCard({ interview, onClick }) {
  return (
    <div
      className='p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100'
      onClick={onClick}
    >
      <h2 className='text-lg font-semibold'>{interview.date}일자 질문</h2>
      <p className='text-gray-600 text-sm truncate'>
        {interview.questions.slice(0, 3).join(" ")} 외{" "}
        {interview.questions.length - 3}개 질문
      </p>
    </div>
  );
}
