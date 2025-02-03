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
      console.warn("No questions found in Realtime Database.");
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
export const createInterview = async (questions) => {
  try {
    const uncompletedQuestions = questions.filter((q) => !q.completed);
    const basicQuestions = uncompletedQuestions.filter(
      (q) => q.category === "기본(경험)"
    );
    const technicalQuestions = uncompletedQuestions.filter(
      (q) => q.category !== "기본(경험)"
    );

    const selectedBasicQuestion =
      basicQuestions.length > 0
        ? basicQuestions[Math.floor(Math.random() * basicQuestions.length)]
        : null;

    const selectedTechnicalQuestions = technicalQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    const selectedQuestions = [
      ...(selectedBasicQuestion ? [selectedBasicQuestion] : []),
      ...selectedTechnicalQuestions,
    ];

    const newInterviewRef = push(ref(db, "interviews"));
    const currentDate = new Date().toISOString().split("T")[0];

    const interviewQuestions = selectedQuestions.map((question) => ({
      ...question,
      interviewees: [],
      feedbacks: [],
      isCompleted: false,
    }));

    await set(ref(db, `interviews/${newInterviewRef.key}`), {
      title: `${currentDate}일자 질문`,
      questions: interviewQuestions,
      interviewees: [],
      createdAt: Date.now(),
      isFinished: false,
      currentStep: 1,
    });

    return newInterviewRef.key;
  } catch (error) {
    console.error("면접 생성 중 오류:", error);
    throw error;
  }
};

// 면접 단계 업데이트 함수
export const updateInterviewStep = async (interviewId, step) => {
  try {
    await update(ref(db, `interviews/${interviewId}`), {
      currentStep: step,
    });
    return true;
  } catch (error) {
    console.error("면접 단계 업데이트 중 오류:", error);
    throw error;
  }
};

// 면접 목록 불러오기 함수
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

// 면접 상세 불러오기 함수
export const getInterview = async (interviewId) => {
  try {
    const snapshot = await get(ref(db, `interviews/${interviewId}`));
    if (snapshot.exists()) {
      return {
        id: interviewId,
        ...snapshot.val(),
      };
    }
    throw new Error("면접 정보를 찾을 수 없습니다.");
  } catch (error) {
    console.error("면접 상세 조회 중 오류:", error);
    throw error;
  }
};

// 면접 삭제 함수
export const deleteInterview = async (interviewId) => {
  try {
    const interview = await getInterview(interviewId);

    // 포함된 질문들 상태 초기화
    for (const question of interview.questions) {
      await updateQuestionStatus(question.id, false);
    }

    await remove(ref(db, `interviews/${interviewId}`));
    return true;
  } catch (error) {
    console.error("면접 삭제 중 오류:", error);
    throw error;
  }
};

// 면접 상태 변경 함수
export const updateInterviewStatus = async (interviewId, status) => {
  try {
    await update(ref(db, `interviews/${interviewId}`), {
      isFinished: status,
    });
    return true;
  } catch (error) {
    console.error("면접 상태 업데이트 중 오류:", error);
    throw error;
  }
};

// 면접 면접자 업데이트 함수
export const updateInterviewees = async (interviewId, interviewees) => {
  try {
    await update(ref(db, `interviews/${interviewId}`), {
      interviewees: interviewees,
      currentStep: 2,
    });
    return true;
  } catch (error) {
    console.error("면접자 업데이트 중 오류:", error);
    throw error;
  }
};

// 면접자 배정 함수
export const assignInterviewees = async (interviewId, interviewees) => {
  try {
    const interviewRef = ref(db, `interviews/${interviewId}/questions`);

    await update(
      interviewRef,
      questions.map((q) => ({
        ...q,
        interviewees: interviewees,
      }))
    );

    return true;
  } catch (error) {
    console.error("면접자 배정 중 오류:", error);
    throw error;
  }
};

export const assignRandomQuestionsToInterviewees = async (interviewId) => {
  try {
    const interviewSnapshot = await get(ref(db, `interviews/${interviewId}`));
    const interview = interviewSnapshot.val();
    const interviewees = interview.interviewees;
    const questions = interview.questions;

    const technicalQuestions = questions.filter(
      (q) => q.category !== "기본(경험)"
    );

    const assignedQuestions = questions.map((question) => {
      if (question.category === "기본(경험)") {
        return {
          ...question,
          assignedInterviewees: interviewees.map((i) => i.id),
        };
      }
      return question;
    });

    const shuffledTechnicalQuestions = technicalQuestions.sort(
      () => 0.5 - Math.random()
    );
    const shuffledInterviewees = interviewees.sort(() => 0.5 - Math.random());

    shuffledInterviewees.forEach((interviewee, index) => {
      const questionsToAssign = shuffledTechnicalQuestions
        .slice(index * 2, index * 2 + 2)
        .map((q) => q.id);

      questionsToAssign.forEach((qId) => {
        const questionIndex = assignedQuestions.findIndex((q) => q.id === qId);
        if (questionIndex !== -1) {
          if (!assignedQuestions[questionIndex].assignedInterviewees) {
            assignedQuestions[questionIndex].assignedInterviewees = [];
          }
          assignedQuestions[questionIndex].assignedInterviewees.push(
            interviewee.id
          );
        }
      });
    });

    await update(ref(db, `interviews/${interviewId}`), {
      questions: assignedQuestions,
      currentStep: 3,
    });

    return true;
  } catch (error) {
    console.error("면접자 랜덤 질문 배정 중 오류:", error);
    throw error;
  }
};
