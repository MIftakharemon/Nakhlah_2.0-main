import { create } from "zustand";

/**
 * Lesson Store (ephemeral)
 * Replaces lesson selection values currently stored in sessionStorage.
 */
const initialLessonState = {
    selectedLessonId: "",
    selectedNodeId: "",
    selectedLessonStatus: "",
    selectedLessonIsExam: false,
};

export const useLessonStore = create((set) => ({
    ...initialLessonState,

    setSelectedLesson: ({
        lessonId = "",
        nodeId = "",
        status = "",
        isExam = false,
    } = {}) => {
        set({
            selectedLessonId: lessonId,
            selectedNodeId: nodeId,
            selectedLessonStatus: status,
            selectedLessonIsExam: Boolean(isExam),
        });
    },

    clearLessonSelection: () => {
        set({ ...initialLessonState });
    },
}));
