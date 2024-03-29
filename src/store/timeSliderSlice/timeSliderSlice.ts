import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { ResponseData } from "../../assets/types/ResponseData";
import { aqmSpatialForecast } from "./thunks/aqmSpatialForecast";

interface TimeSliderState {
	responseData: ResponseData;
	value: number;
	playing: boolean;
	loading: "idle" | "pending" | "succeeded" | "failed";
	error: string | undefined;
}

const initialState: TimeSliderState = {
	responseData: {} as ResponseData,
	value: 0,
	playing: false,
	loading: "idle",
	error: undefined,
};

export const getAQMSpatialForecast: any = createAsyncThunk(
	"airquality/aqmSpatialForecast",
	async ({
		startTime,
		endTime,
		pollutant_val,
		path,
	}: {
		startTime: string;
		endTime: string;
		pollutant_val: string;
		path: string;
	}) => {
		const response = await aqmSpatialForecast({
			startTime,
			endTime,
			pollutant_val,
			path,
		});
		return response;
	}
);

export const timeSliderSlice = createSlice({
	name: "timeSlider",
	initialState,
	reducers: {
		setTimeValue: (state, action: PayloadAction<number>) => {
			state.value = action.payload;
		},
		setPlayingStatus: (state, action: PayloadAction<boolean>) => {
			state.playing = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAQMSpatialForecast.fulfilled, (state, action) => {
				state.responseData = action.payload;
				if (state.responseData.timeseries.timestamps !== null) {
					console.log("load passed");
					state.loading = "succeeded";
				} else {
					console.log("load failed");
					state.loading = "failed";
				}
			})
			.addCase(getAQMSpatialForecast.pending, (state, action) => {
				state.loading = "pending";
			})
			.addCase(getAQMSpatialForecast.rejected, (state, action) => {
				state.loading = "failed";
				state.error = action.error.message;
			});
	},
});

// Action creators are generated for each case reducer function
export const { setTimeValue, setPlayingStatus } = timeSliderSlice.actions;

export const selectValue = (state: RootState) => state.timeSlider.value;
export const selectPlaying = (state: RootState) => state.timeSlider.playing;

export const getAQMSpatialForecastResponse = (state: RootState) =>
	state.timeSlider.responseData;
export const getAQMSpatialForecastStatus = (state: RootState) =>
	state.timeSlider.loading;
export const getAQMSpatialForecastError = (state: RootState) =>
	state.timeSlider.error;

export default timeSliderSlice.reducer;
