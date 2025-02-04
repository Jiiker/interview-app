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

  const intervieweeCount = interview.interviewees
    ? interview.interviewees.length
    : 0;
  const participantText =
    intervieweeCount > 0 ? `, ${intervieweeCount}명 참여` : "";

  const statusBadge = interview.isFinished ? (
    <span className='ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
      완료
    </span>
  ) : (
    <span className='ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
      진행중
    </span>
  );

  return (
    <div
      className='p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100 relative'
      onClick={onClick}
    >
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold flex items-center'>
          {formatDate(interview.createdAt)}일자 질문
          {statusBadge}
        </h2>
      </div>

      <p className='text-gray-600 text-sm line-clamp-3 mb-2 leading-relaxed mt-2'>
        {questionPreview}
      </p>

      <p className='text-xs text-gray-500'>
        총 {questionsArray.length}개 질문{participantText}
      </p>
    </div>
  );
}
