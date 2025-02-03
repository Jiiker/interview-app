import { ref, push, get, update, set, remove } from "firebase/database";
import { db } from "./firebaseConfig";

// 질문 추가 함수
export const addQuestion = async (category, question) => {
  if (!category || !question) {
    console.error("카테고리와 질문이 필요합니다.");
    return;
  }

  try {
    const newQuestionRef = push(ref(db, "questions"));
    await set(ref(db, `questions/${newQuestionRef.key}`), {
      category,
      question,
      completed: false,
      createdAt: Date.now(),
    });

    console.log("질문 추가 성공:", newQuestionRef.key);
    return newQuestionRef.key;
  } catch (error) {
    console.error("질문 추가 중 오류:", error);
  }
};

// 모든 질문 가져오기 함수
export const getQuestions = async () => {
  try {
    const snapshot = await get(ref(db, "questions"));
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } else {
      console.warn("⚠️ No questions found in Realtime Database.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

// 질문 상태 업데이트 함수
export const updateQuestionStatus = async (id, completed) => {
  if (!id) {
    console.error("질문 ID가 필요합니다.");
    return;
  }

  try {
    await update(ref(db, `questions/${id}`), { completed });
    console.log(`질문(${id}) 상태 업데이트 완료.`);
  } catch (error) {
    console.error("질문 상태 업데이트 오류:", error);
  }
};

// 질문 삭제 함수
export const deleteQuestion = async (id) => {
  if (!id) {
    console.error("질문 ID가 필요합니다.");
    return;
  }

  try {
    await remove(ref(db, `questions/${id}`));
    console.log(`질문(${id}) 삭제 완료.`);
    return true;
  } catch (error) {
    console.error("질문 삭제 중 오류:", error);
    throw error;
  }
};

// 면접 생성 함수
export const createInterview = async (selectedQuestions) => {
  if (!selectedQuestions || selectedQuestions.length === 0) {
    throw new Error("면접 질문이 필요합니다.");
  }

  try {
    const newInterviewRef = push(ref(db, "interviews"));
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식

    // 각 질문에 대한 결과 객체 초기화
    const questionResults = selectedQuestions.reduce((acc, question) => {
      acc[question.id] = {
        questionId: question.id,
        question: question.question,
        category: question.category,
        assignedInterviewees: [], // 배정된 면접자 목록
        feedback: "", // 면접관 피드백
        completed: false, // 해당 질문 완료 여부
      };
      return acc;
    }, {});

    await set(ref(db, `interviews/${newInterviewRef.key}`), {
      questions: selectedQuestions,
      date: currentDate,
      status: "in_progress", // in_progress, completed
      currentStep: 1, // 1: 질문목록, 2: 면접자입력, 3: 면접진행
      interviewees: [], // 전체 면접자 목록
      results: questionResults, // 질문별 결과
      comments: [], // 면접 중 발생한 이슈/코멘트
      createdAt: Date.now(),
    });

    return newInterviewRef.key;
  } catch (error) {
    console.error("면접 생성 중 오류:", error);
    throw error;
  }
};

// 질문에 면접자 배정 함수
export const assignInterviewees = async (
  interviewId,
  questionId,
  intervieweeIds
) => {
  if (!interviewId || !questionId || !intervieweeIds) {
    throw new Error("면접 ID, 질문 ID, 면접자 ID가 필요합니다.");
  }

  try {
    const resultPath = `interviews/${interviewId}/results/${questionId}/assignedInterviewees`;
    await set(ref(db, resultPath), intervieweeIds);
    return true;
  } catch (error) {
    console.error("면접자 배정 중 오류:", error);
    throw error;
  }
};

// 질문 결과 업데이트 함수
export const updateQuestionResult = async (
  interviewId,
  questionId,
  updateData
) => {
  if (!interviewId || !questionId || !updateData) {
    throw new Error("면접 ID, 질문 ID, 업데이트할 데이터가 필요합니다.");
  }

  try {
    const resultPath = `interviews/${interviewId}/results/${questionId}`;
    await update(ref(db, resultPath), updateData);
    return true;
  } catch (error) {
    console.error("질문 결과 업데이트 중 오류:", error);
    throw error;
  }
};

// 면접자 추가 함수
export const addInterviewee = async (interviewId, interviewee) => {
  if (!interviewId || !interviewee) {
    throw new Error("면접 ID와 면접자 정보가 필요합니다.");
  }

  try {
    const interviewRef = ref(db, `interviews/${interviewId}/interviewees`);
    const snapshot = await get(interviewRef);
    const currentInterviewees = snapshot.exists() ? snapshot.val() : [];

    const updatedInterviewees = [
      ...currentInterviewees,
      {
        ...interviewee,
        id: push(ref(db)).key, // 면접자별 고유 ID 생성
        addedAt: Date.now(),
      },
    ];

    await set(interviewRef, updatedInterviewees);
    return true;
  } catch (error) {
    console.error("면접자 추가 중 오류:", error);
    throw error;
  }
};

// 면접 상태 업데이트 함수 (진행중/완료)
export const updateInterviewStatus = async (interviewId, status) => {
  if (!interviewId || !["in_progress", "completed"].includes(status)) {
    throw new Error("유효하지 않은 면접 상태입니다.");
  }

  try {
    await update(ref(db, `interviews/${interviewId}`), { status });
    return true;
  } catch (error) {
    console.error("면접 상태 업데이트 중 오류:", error);
    throw error;
  }
};

// 면접 단계 업데이트 함수
export const updateInterviewStep = async (interviewId, step) => {
  if (!interviewId || ![1, 2, 3].includes(step)) {
    throw new Error("유효하지 않은 면접 단계입니다.");
  }

  try {
    await update(ref(db, `interviews/${interviewId}`), { currentStep: step });
    return true;
  } catch (error) {
    console.error("면접 단계 업데이트 중 오류:", error);
    throw error;
  }
};

// 면접 코멘트 추가 함수
export const addInterviewComment = async (interviewId, comment) => {
  if (!interviewId || !comment) {
    throw new Error("면접 ID와 코멘트 내용이 필요합니다.");
  }

  try {
    const commentRef = ref(db, `interviews/${interviewId}/comments`);
    const snapshot = await get(commentRef);
    const currentComments = snapshot.exists() ? snapshot.val() : [];

    const updatedComments = [
      ...currentComments,
      {
        ...comment,
        id: push(ref(db)).key, // 코멘트별 고유 ID 생성
        createdAt: Date.now(),
      },
    ];

    await set(commentRef, updatedComments);
    return true;
  } catch (error) {
    console.error("코멘트 추가 중 오류:", error);
    throw error;
  }
};

// 면접 삭제 함수
export const deleteInterview = async (interviewId) => {
  if (!interviewId) {
    throw new Error("면접 ID가 필요합니다.");
  }

  try {
    await remove(ref(db, `interviews/${interviewId}`));
    return true;
  } catch (error) {
    console.error("면접 삭제 중 오류:", error);
    throw error;
  }
};

// 면접 정보 가져오기 함수
export const getInterview = async (interviewId) => {
  try {
    const snapshot = await get(ref(db, `interviews/${interviewId}`));
    if (snapshot.exists()) {
      return { id: interviewId, ...snapshot.val() };
    } else {
      throw new Error("면접 정보를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("면접 정보 조회 중 오류:", error);
    throw error;
  }
};

// 모든 면접 목록 가져오기 함수
export const getInterviews = async () => {
  try {
    const snapshot = await get(ref(db, "interviews"));
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    }
    return [];
  } catch (error) {
    console.error("면접 목록 조회 중 오류:", error);
    throw error;
  }
};
