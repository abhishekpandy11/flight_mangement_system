import API from "./axios";

export const sendMessage = async (message, thread_id = null) => {
  try {
    const response = await API.post("/chat/", {
      message,
      thread_id,
    });
    return response.data;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};

export const resumeMessage = async (human_input, thread_id) => {
  try {
    const response = await API.post("/chat/resume", {
      human_input,
      thread_id,
    });
    return response.data;
  } catch (error) {
    console.error("Resume API Error:", error);
    throw error;
  }
};
