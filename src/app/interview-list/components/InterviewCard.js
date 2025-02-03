"use client";

export default function InterviewCard({ interview, onClick }) {
  // 🔥 questions가 객체일 경우 배열로 변환
  const questionsArray = Array.isArray(interview.questions)
    ? interview.questions
    : Object.values(interview.questions || {});

  // 🔥 질문 3개만 가져와서 문자열 변환
  const questionPreview = questionsArray
    .slice(0, 3) // 🔹 3개만 가져오기
    .map((q) => q.question) // 🔹 질문 텍스트만 추출
    .join(", "); // 🔹 문자열로 합치기

  return (
    <div
      className='p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100'
      onClick={onClick}
    >
      <h2 className='text-lg font-semibold'>{interview.date}일자 질문</h2>
      <p className='text-gray-600 text-sm truncate'>
        {questionPreview} 외 {questionsArray.length - 3}개 질문
      </p>
    </div>
  );
}
