import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// 새 카테고리 추가
export const addCategory = async (category) => {
  try {
    await addDoc(collection(db, "categories"), { name: category });
  } catch (error) {
    console.error("Error adding category:", error);
  }
};

// 카테고리 가져오기
export const getCategories = async () => {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map((doc) => doc.data().name);
};

// 질문 추가
export const addQuestion = async (category, question) => {
  try {
    await addDoc(collection(db, "questions"), {
      category,
      question,
      completed: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding question:", error);
  }
};

// 모든 질문 가져오기
export const getQuestions = async () => {
  const querySnapshot = await getDocs(collection(db, "questions"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// 질문 체크 상태 업데이트
export const updateQuestionStatus = async (id, completed) => {
  try {
    const questionRef = doc(db, "questions", id);
    await updateDoc(questionRef, { completed });
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};
