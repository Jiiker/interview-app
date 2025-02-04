"use client";

export default function InterviewCard({ interview, onClick }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  const questionsArray = Array.isArray(interview.questions)
    ? interview.questions
    : Object.values(interview.questions || {});

  const questionPreview = questionsArray
    .slice(0, 3)
    .map((q) => q.question)
    .join(", ");

  return (
    <div
      className='p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100'
      onClick={onClick}
    >
      <h2 className='text-lg font-semibold'>
        {formatDate(interview.createdAt)}일자 질문
      </h2>
      <p className='text-gray-600 text-sm truncate'>
        {questionPreview} 외 {questionsArray.length - 3}개 질문
      </p>
    </div>
  );
}
