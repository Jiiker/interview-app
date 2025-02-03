"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getInterview,
  updateInterviewStep,
  updateInterviewees,
  assignInterviewees,
  updateInterviewStatus,
  addFeedbackToQuestion,
} from "@/lib/firestore";
import Comment from "./components/Comment";

const QuestionList = ({ questions, onNext }) => {
  const questionsArray = Array.isArray(questions)
    ? questions
    : Object.values(questions || {});

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold mb-4'>질문 목록 확인</h2>
      <ul className='space-y-2'>
        {questionsArray.map((q, index) => (
          <li key={q.id} className='p-4 bg-white rounded-lg shadow'>
            <span className='text-gray-600'>#{index + 1}</span>
            <p className='mt-1'>{q.question}</p>
            <div className='text-sm text-gray-500 mt-1'>{q.category}</div>
          </li>
        ))}
      </ul>
      <div className='flex justify-end mt-6'>
        <button
          onClick={onNext}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          면접자 입력하기
        </button>
      </div>
    </div>
  );
};

const IntervieweeInput = ({ onNext, onAddInterviewee, interviewees }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddInterviewee(name);
    setName("");
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold mb-4'>면접자 정보 입력</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            이름
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2'
          />
        </div>
        <button
          type='submit'
          className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
        >
          면접자 추가
        </button>
      </form>

      <div className='mt-6'>
        <h3 className='font-medium mb-2'>등록된 면접자 목록</h3>
        <ul className='space-y-2'>
          {interviewees.map((person, index) => (
            <li
              key={index}
              className='p-3 bg-gray-50 rounded-lg flex justify-between items-center'
            >
              <span>{person.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {interviewees.length > 1 && (
        <div className='flex justify-end mt-6'>
          <button
            onClick={onNext}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            면접 진행하기
          </button>
        </div>
      )}
    </div>
  );
};

const InterviewProgress = ({
  questions,
  interview,
  onUpdateResult,
  onComplete,
  onAddFeedback, // 🔥 피드백 추가 함수
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [name, setName] = useState(""); // 이름 입력 필드
  const [content, setContent] = useState(""); // 내용 입력 필드

  const currentQuestion = questions[currentQuestionIndex];

  // 🔥 배정된 면접자 리스트
  const assignedInterviewees = currentQuestion.interviewees || [];
  const feedbacks = currentQuestion.feedbacks || [];

  console.log({ interview });

  const handleNext = async () => {
    await onUpdateResult(currentQuestion.id, {
      completed: true,
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      onComplete(currentQuestion.id, true);
    }
  };

  // 🔥 피드백 추가 함수
  const handleFeedbackSubmit = async () => {
    if (!name.trim() || !content.trim()) return;

    await onAddFeedback(currentQuestion.id, { name, content });

    setName(""); // 입력 필드 초기화
    setContent("");
  };

  return (
    <div className='space-y-6'>
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-medium mb-4'>
          질문 {currentQuestionIndex + 1} / {questions.length}
        </h3>
        <p className='text-xl mb-6'>{currentQuestion.question}</p>

        {/* 🔥 배정된 면접자 섹션 복원 */}
        <div className='mb-4'>
          <h4 className='text-md font-medium mb-2'>배정된 면접자</h4>
          <div className='grid grid-cols-3 gap-2'>
            {assignedInterviewees.length > 0 ? (
              assignedInterviewees.map((intervieweeId) => {
                const interviewee = interview.interviewees.find(
                  (i) => i.id === intervieweeId
                );

                return (
                  <div
                    key={intervieweeId}
                    className='p-2 rounded-lg bg-blue-100 border-blue-500'
                  >
                    {interviewee
                      ? interviewee.name
                      : `알 수 없는 면접자 (${intervieweeId})`}
                  </div>
                );
              })
            ) : (
              <p className='text-gray-500 text-sm'>배정된 면접자가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 🔥 피드백 입력 폼 */}
        <div className='mb-4'>
          <h4 className='text-md font-medium mb-2'>피드백 작성</h4>
          <label className='block text-sm font-medium'>이름</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='이름을 입력하세요.'
            className='w-full p-2 border rounded-lg'
          />

          <label className='block text-sm font-medium mt-4'>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='피드백을 입력하세요.'
            className='w-full p-2 border rounded-lg h-24'
          />

          <button
            onClick={handleFeedbackSubmit} // 🔥 피드백 추가
            className='mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
          >
            작성 완료
          </button>
        </div>

        {/* 🔥 기존 피드백 목록 */}
        <div className='mb-4'>
          <h4 className='text-md font-medium mb-2'>작성된 피드백</h4>
          {feedbacks.length > 0 ? (
            feedbacks.map((fb) => (
              <Comment
                key={fb.id}
                name={fb.name}
                content={fb.content}
                timestamp={fb.timestamp}
              />
            ))
          ) : (
            <p className='text-gray-500 text-sm'>
              아직 작성된 피드백이 없습니다.
            </p>
          )}
        </div>

        <div className='flex justify-end space-x-2'>
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className='px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400'
            >
              이전 질문
            </button>
          )}
          <button
            onClick={handleNext}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            {currentQuestionIndex < questions.length - 1
              ? "다음 질문"
              : "면접 완료"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InterviewDetail() {
  const router = useRouter();
  const params = useParams();
  const [interview, setInterview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [interviewees, setInterviewees] = useState([]);

  useEffect(() => {
    if (params.id) {
      getInterview(params.id).then((fetchedInterview) => {
        setInterview(fetchedInterview);
        setInterviewees(fetchedInterview.interviewees || []);
      });
    }
  }, [params.id]);

  const updateStep = async (newStep) => {
    await updateInterviewStep(interview.id, newStep);
    setCurrentStep(newStep);
  };

  const handlePrepareInterview = async () => {
    try {
      await updateInterviewees(interview.id, interviewees);
      await assignInterviewees(interview.id, interviewees);

      const updatedInterview = await getInterview(interview.id);
      setInterview(updatedInterview);

      updateStep(3);
    } catch (error) {
      console.error("면접 준비 과정 중 오류:", error);
    }
  };

  const handleAddInterviewee = async (name) => {
    try {
      const newInterviewee = {
        id: Date.now().toString(),
        name,
      };

      const updatedInterviewees = [...interviewees, newInterviewee];
      setInterviewees(updatedInterviewees);

      await updateInterviewees(interview.id, updatedInterviewees);
    } catch (error) {
      console.error("면접자 추가 중 오류:", error);
    }
  };

  const handleUpdateResult = async (questionId, resultData) => {
    try {
      const updatedQuestions = interview.questions.map((q) =>
        q.id === questionId ? { ...q, ...resultData } : q
      );

      await updateInterviewStatus(interview.id, {
        questions: updatedQuestions,
      });

      const updatedInterview = await getInterview(interview.id);
      setInterview(updatedInterview);
    } catch (error) {
      console.error("질문 결과 업데이트 중 오류:", error);
    }
  };

  const handleAddFeedback = async (questionId, feedback) => {
    try {
      await addFeedbackToQuestion(interview.id, questionId, feedback);

      const updatedInterview = await getInterview(interview.id);
      setInterview(updatedInterview);
    } catch (error) {
      console.error("피드백 추가 중 오류:", error);
    }
  };

  if (!interview) return <div className='p-6'>로딩 중...</div>;

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>면접 진행</h1>
      {currentStep === 1 && (
        <QuestionList
          questions={interview.questions}
          onNext={() => updateStep(2)}
        />
      )}
      {currentStep === 2 && (
        <IntervieweeInput
          onNext={handlePrepareInterview}
          onAddInterviewee={handleAddInterviewee}
          interviewees={interviewees}
        />
      )}
      {currentStep === 3 && (
        <InterviewProgress
          questions={interview.questions}
          interview={{ ...interview, interviewees }}
          onUpdateResult={handleUpdateResult}
          onComplete={updateInterviewStatus}
          onAddFeedback={handleAddFeedback}
        />
      )}
    </div>
  );
}
