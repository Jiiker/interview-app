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
      console.warn("가져올 질문이 없습니다.");
      return [];
    }
  } catch (error) {
    console.error("질문 가져오기 오류:", error);
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

    // 기본 질문 선택 보장
    const basicQuestions = uncompletedQuestions.filter(
      (q) => q.category === "기본(경험)"
    );
    const technicalQuestions = uncompletedQuestions.filter(
      (q) => q.category !== "기본(경험)"
    );

    // 기본 질문이 없으면 첫 번째 기술 질문을 기본 질문으로 사용
    const selectedBasicQuestion =
      basicQuestions.length > 0
        ? basicQuestions[Math.floor(Math.random() * basicQuestions.length)]
        : technicalQuestions.length > 0
        ? technicalQuestions.shift()
        : null;

    // 기술 질문 6개 고정 (기본 질문 포함)
    const selectedTechnicalQuestions = technicalQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, selectedBasicQuestion ? 5 : 6);

    const selectedQuestions = [
      ...(selectedBasicQuestion ? [selectedBasicQuestion] : []),
      ...selectedTechnicalQuestions,
    ];

    // 질문이 6개 미만일 경우 추가 로직
    while (selectedQuestions.length < 6 && technicalQuestions.length > 0) {
      selectedQuestions.push(technicalQuestions.pop());
    }

    const newInterviewRef = push(ref(db, "interviews"));
    const currentDate = new Date().toISOString().split("T")[0];

    const interviewQuestions = selectedQuestions.map((question) => ({
      ...question,
      interviewees: [],
      feedbacks: [],
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

    for (const question of interview.questions) {
      if (question.id) {
        await updateQuestionStatus(question.id, false);
      }
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
    const interviewRef = ref(db, `interviews/${interviewId}`);
    const interviewSnapshot = await get(interviewRef);

    if (!interviewSnapshot.exists()) {
      throw new Error("면접 정보를 찾을 수 없습니다.");
    }

    const interview = interviewSnapshot.val();
    const currentQuestions = interview.questions || [];

    await update(interviewRef, {
      interviewees: interviewees,
      questions: currentQuestions,
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
  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  function hasOverlap(arr1, arr2) {
    const minLength = Math.min(arr1.length, arr2.length);
    for (let i = 0; i < minLength; i++) {
      if (arr1[i] === arr2[i]) {
        return true;
      }
    }
    return false;
  }

  try {
    const interviewRef = ref(db, `interviews/${interviewId}`);
    const interviewSnapshot = await get(interviewRef);

    if (!interviewSnapshot.exists()) {
      throw new Error("면접 정보를 찾을 수 없습니다.");
    }

    const interview = interviewSnapshot.val();
    let questions = interview.questions || [];

    const technicalQuestions = questions.filter(
      (q) => q.category !== "기본(경험)"
    );

    const intervieweeIds = interviewees.map((i) => i.id);
    if (intervieweeIds.length < 2) {
      throw new Error("최소 두 명 이상의 면접자가 필요합니다.");
    }

    // 면접자 목록을 무작위로 섞기
    let shuffledInterviewees = shuffleArray([...intervieweeIds]);

    // 각 질문마다 2명의 면접자 배정
    const assignedQuestions = questions.map((question) => {
      if (question.category === "기본(경험)") {
        return {
          ...question,
          interviewees: intervieweeIds, // 기본 질문은 모든 면접자에게 배정
        };
      }

      // 기술 질문에 대해 2명씩 배정
      if (technicalQuestions.some((q) => q.id === question.id)) {
        if (shuffledInterviewees.length < 2) {
          shuffledInterviewees = shuffleArray([...intervieweeIds]); // 재섞기
        }
        const assignedInterviewees = shuffledInterviewees.splice(0, 2);
        return {
          ...question,
          interviewees: assignedInterviewees,
        };
      }

      return question;
    });

    // 데이터 업데이트
    await update(ref(db, `interviews/${interviewId}`), {
      questions: assignedQuestions,
      currentStep: 3,
    });

    console.log("랜덤 질문 배정 완료:", assignedQuestions);
    return true;
  } catch (error) {
    console.error("면접자 랜덤 질문 배정 중 오류:", error);
    throw error;
  }
};

// 피드백 추가
export const addFeedbackToQuestion = async (
  interviewId,
  questionId,
  feedback
) => {
  try {
    const interviewRef = ref(db, `interviews/${interviewId}`);
    const interviewSnapshot = await get(interviewRef);

    if (!interviewSnapshot.exists()) {
      throw new Error("면접 정보를 찾을 수 없습니다.");
    }

    const interview = interviewSnapshot.val();
    const questions = interview.questions || [];

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          feedbacks: [
            ...(q.feedbacks || []),
            {
              id: Date.now().toString(),
              name: feedback.name,
              content: feedback.content,
              timestamp: Date.now(),
            },
          ],
        };
      }
      return q;
    });

    await update(interviewRef, { questions: updatedQuestions });

    console.log(`피드백 추가 완료 (질문 ID: ${questionId})`, feedback);
    return updatedQuestions;
  } catch (error) {
    console.error("피드백 추가 중 오류:", error);
    throw error;
  }
};

// 면접 완료
export const completeInterview = async (interviewId) => {
  try {
    const interviewRef = ref(db, `interviews/${interviewId}`);
    const interviewSnapshot = await get(interviewRef);

    if (!interviewSnapshot.exists()) {
      throw new Error("면접 정보를 찾을 수 없습니다.");
    }

    const interview = interviewSnapshot.val();
    const questions = interview.questions || [];

    // 전역 질문 리스트(`questions/` 경로)에서 상태 업데이트
    for (const question of questions) {
      if (question.id) {
        await updateQuestionStatus(question.id, true);
      }
    }

    // 면접 상태를 완료로 변경
    await update(interviewRef, {
      isFinished: true,
    });

    console.log("면접 완료 처리 및 질문 상태 업데이트 완료:", interviewId);
    return true;
  } catch (error) {
    console.error("면접 완료 처리 중 오류:", error);
    throw error;
  }
};
