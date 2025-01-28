import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async () => {
    const response = await axios.get(`${API_URL}/rewards`);
    return response.data;
  }
);

export const createReward = createAsyncThunk(
  'rewards/createReward',
  async (rewardData) => {
    const response = await axios.post(`${API_URL}/rewards`, rewardData);
    return response.data;
  }
);

export const assignReward = createAsyncThunk(
  'rewards/assignReward',
  async ({ rewardId, profileId, date }) => {
    const response = await axios.post(`${API_URL}/rewards/${rewardId}/assign`, {
      profileId,
      date
    });
    return response.data;
  }
);

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createReward.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(assignReward.fulfilled, (state, action) => {
        const index = state.items.findIndex(reward => reward.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default rewardsSlice.reducer; 