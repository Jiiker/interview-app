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
    const questions = await get(ref(db, "questions"));
    if (questions.exists()) {
      return Object.entries(questions.val()).map(([id, data]) => ({
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

  try {
    const interviewRef = ref(db, `interviews/${interviewId}`);
    const interviewSnapshot = await get(interviewRef);

    if (!interviewSnapshot.exists()) {
      throw new Error("면접 정보를 찾을 수 없습니다.");
    }

    const interview = interviewSnapshot.val();
    let questions = interview.questions || [];
    const intervieweeIds = interviewees.map((i) => i.id);

    if (intervieweeIds.length < 2) {
      throw new Error("최소 두 명 이상의 면접자가 필요합니다.");
    }

    // 질문을 카테고리별로 분리
    const basicQuestions = questions.filter((q) => q.category === "기본(경험)");
    const technicalQuestions = questions.filter(
      (q) => q.category !== "기본(경험)"
    );

    // 면접자별 배정된 질문 수를 추적
    const intervieweeQuestionCount = {};
    intervieweeIds.forEach((id) => {
      intervieweeQuestionCount[id] = 0;
    });

    // 가능한 모든 면접자 조합을 생성
    let possiblePairs = [];
    for (let i = 0; i < intervieweeIds.length; i++) {
      for (let j = i + 1; j < intervieweeIds.length; j++) {
        possiblePairs.push([intervieweeIds[i], intervieweeIds[j]]);
      }
    }

    // 조합들을 섞기
    possiblePairs = shuffleArray([...possiblePairs]);

    // 기술 질문 배정
    const assignedQuestions = technicalQuestions.map((question) => {
      // 현재 가장 적게 배정된 면접자들이 포함된 페어 찾기
      let selectedPair;

      // 모든 페어를 순회하면서 가장 적절한 페어 찾기
      let minTotalCount = Infinity;
      for (const pair of possiblePairs) {
        const totalCount =
          intervieweeQuestionCount[pair[0]] + intervieweeQuestionCount[pair[1]];
        if (totalCount < minTotalCount) {
          minTotalCount = totalCount;
          selectedPair = pair;
        }
      }

      // 선택된 페어가 없다면 새로 섞어서 첫 번째 페어 선택
      if (!selectedPair) {
        possiblePairs = shuffleArray([...possiblePairs]);
        selectedPair = possiblePairs[0];
      }

      // 선택된 면접자들의 질문 카운트 증가
      selectedPair.forEach((id) => {
        intervieweeQuestionCount[id]++;
      });

      return {
        ...question,
        interviewees: selectedPair,
      };
    });

    // 기본 질문은 모든 면접자에게 배정
    const finalQuestions = [
      ...basicQuestions.map((question) => ({
        ...question,
        interviewees: intervieweeIds,
      })),
      ...assignedQuestions,
    ];

    // 최종 검증: 면접자별 배정된 질문 수 출력
    console.log("면접자별 배정된 질문 수:", intervieweeQuestionCount);

    // 데이터 업데이트
    await update(ref(db, `interviews/${interviewId}`), {
      questions: finalQuestions,
      currentStep: 3,
    });

    console.log("질문 배정 완료:", finalQuestions);
    return true;
  } catch (error) {
    console.error("면접자 질문 배정 중 오류:", error);
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
