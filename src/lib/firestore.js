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
