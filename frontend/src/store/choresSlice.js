import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchChores = createAsyncThunk(
  'chores/fetchChores',
  async () => {
    const response = await axios.get(`${API_URL}/chores`);
    console.log('Fetched chores:', response.data);
    return response.data;
  }
);

export const createChore = createAsyncThunk(
  'chores/createChore',
  async (choreData) => {
    const response = await axios.post(`${API_URL}/chores`, choreData);
    return response.data;
  }
);

export const toggleChoreCompletion = createAsyncThunk(
  'chores/toggleCompletion',
  async ({ choreId, profileId, isCompleted, date }) => {
    const response = await axios.patch(`${API_URL}/chores/${choreId}/toggle`, {
      profileId,
      isCompleted,
      date
    });
    return response.data;
  }
);

export const deleteChore = createAsyncThunk(
  'chores/deleteChore',
  async (choreId) => {
    await axios.delete(`${API_URL}/chores/${choreId}`);
    return choreId;
  }
);

const choresSlice = createSlice({
  name: 'chores',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChores.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChores.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchChores.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createChore.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(toggleChoreCompletion.fulfilled, (state, action) => {
        const index = state.items.findIndex(chore => chore.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteChore.fulfilled, (state, action) => {
        state.items = state.items.filter(chore => chore.id !== action.payload);
      });
  },
});

export default choresSlice.reducer; 