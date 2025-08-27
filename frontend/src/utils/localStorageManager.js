// localStorageManager.js
export const saveConversations = (conversations) => {
  try {
    localStorage.setItem('chat-conversations', JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations to localStorage:', error);
  }
};

export const loadConversations = () => {
  try {
    const data = localStorage.getItem('chat-conversations');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load conversations from localStorage:', error);
    return null;
  }
};

export const clearConversations = () => {
  try {
    localStorage.removeItem('chat-conversations');
  } catch (error) {
    console.error('Failed to clear conversations from localStorage:', error);
  }
};