import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: []
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.push({
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString()
      });
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter(notification => notification.id !== action.payload);
    }
  }
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 