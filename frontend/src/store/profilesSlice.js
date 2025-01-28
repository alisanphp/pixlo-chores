import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async ({ date }) => {
    const response = await axios.get(`${API_URL}/profiles`, {
      params: { date }
    });
    return response.data;
  }
);

export const createProfile = createAsyncThunk(
  'profiles/createProfile',
  async (profileData) => {
    const response = await axios.post(`${API_URL}/profiles`, profileData);
    return response.data;
  }
);

export const updateProfile = createAsyncThunk(
  'profiles/updateProfile',
  async ({ id, profileData }) => {
    const response = await axios.put(`${API_URL}/profiles/${id}`, profileData);
    return response.data;
  }
);

const profilesSlice = createSlice({
  name: 'profiles',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        const index = state.items.findIndex(profile => profile.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      });
  },
});

export default profilesSlice.reducer; 