import { combineReducers } from '@reduxjs/toolkit';

// Temporary dummy reducer to keep Redux happy before real features are loaded
const dummyReducer = (state = {}, action: any) => state;

export const rootReducer = combineReducers({
  _dummy: dummyReducer,
});
