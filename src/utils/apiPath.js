export const BASE_URL = import.meta.env.VITE_API_BASE;

export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        SIGNUP: "/api/auth/signup"
    },

    TASK: {
        ADD: "/api/tasks",
        GET_ALL: "/api/tasks",
        DELETE: (id) => `/api/tasks/${id}`,
        UPDATE: (id) => `/api/tasks/${id}`,
        UPDATE_STATUS: (id) => `/api/tasks/${id}/status`,
    },
}