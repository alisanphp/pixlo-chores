import { configureStore } from '@reduxjs/toolkit';
import profilesReducer from './profilesSlice';
import choresReducer from './choresSlice';
import rewardsReducer from './rewardsSlice';
import penaltiesReducer from './penaltiesSlice';
import notificationsReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    profiles: profilesReducer,
    chores: choresReducer,
    rewards: rewardsReducer,
    penalties: penaltiesReducer,
    notifications: notificationsReducer,
  },
}); 