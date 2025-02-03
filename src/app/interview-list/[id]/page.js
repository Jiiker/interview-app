"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getInterview,
  updateInterviewStep,
  updateInterviewees,
  updateQuestionResult,
  assignRandomQuestionsToInterviewees,
  completeInterview,
} from "@/lib/firestore";

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
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState("");

  const currentQuestion = questions[currentQuestionIndex];

  const assignedInterviewees = currentQuestion.assignedInterviewees || [];

  const handleNext = async () => {
    await onUpdateResult(currentQuestion.id, {
      feedback,
      completed: true,
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setFeedback("");
    } else {
      onComplete();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-medium mb-4'>
          질문 {currentQuestionIndex + 1} / {questions.length}
        </h3>
        <p className='text-xl mb-6'>{currentQuestion.question}</p>

        <div className='mb-4'>
          <h4 className='text-md font-medium mb-2'>배정된 면접자</h4>
          <div className='grid grid-cols-3 gap-2'>
            {assignedInterviewees.map((intervieweeId) => {
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
            })}
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-md font-medium mb-2'>
            질문에 대한 전체 피드백
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder='질문에 대한 전반적인 피드백을 입력하세요.'
            className='w-full p-2 border rounded-lg h-24'
          />
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

  const handleAddInterviewee = async (name) => {
    const newInterviewee = {
      id: Date.now().toString(),
      name,
    };

    const updatedInterviewees = [...interviewees, newInterviewee];
    setInterviewees(updatedInterviewees);

    try {
      await updateInterviewees(interview.id, updatedInterviewees);
    } catch (error) {
      console.error("면접자 업데이트 중 오류:", error);
    }
  };

  const handlePrepareInterview = async () => {
    await assignRandomQuestionsToInterviewees(interview.id);
    updateStep(3);
  };

  const handleUpdateResult = async (questionId, resultData) => {
    await updateQuestionResult(interview.id, questionId, resultData);
  };

  const handleComplete = async () => {
    await completeInterview(interview.id);
    router.push("/interview-list");
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
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
