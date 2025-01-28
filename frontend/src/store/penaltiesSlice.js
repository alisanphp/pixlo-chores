import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPenalties = createAsyncThunk(
    'penalties/fetchPenalties',
    async () => {
        const response = await axios.get(`${API_URL}/penalties`);
        return response.data;
    }
);

export const createPenalty = createAsyncThunk(
    'penalties/createPenalty',
    async (penaltyData) => {
        const response = await axios.post(`${API_URL}/penalties`, penaltyData);
        return response.data;
    }
);

export const deletePenalty = createAsyncThunk(
    'penalties/deletePenalty',
    async (penaltyId) => {
        await axios.delete(`${API_URL}/penalties/${penaltyId}`);
        return penaltyId;
    }
);

const penaltiesSlice = createSlice({
    name: 'penalties',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPenalties.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPenalties.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchPenalties.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createPenalty.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(deletePenalty.fulfilled, (state, action) => {
                state.items = state.items.filter(penalty => penalty.id !== action.payload);
            });
    },
});

export default penaltiesSlice.reducer; 