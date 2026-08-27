import { createSlice } from '@reduxjs/toolkit';

const initialFormData = {
  gender: '',
  age: '',
  preferredWork: [],
  fullName: '',
  phoneNumber: '',
  village: '',
  profileImage: '',
  availability: 'today',
  expectedWage: '',
  wageType: 'daily',
  experience: '',
  experienceUnit: 'years',
  workerArrangement: 'single',
  workDistance: '10 KM',
};

const initialState = {
  formData: initialFormData,
  isSubmitting: false,
  submitSuccess: false,
  error: null,
  message: '',
};


const labourSlice = createSlice({
  name: 'labour',
  initialState,
  reducers: {
    setLabourFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
    resetLabourForm: state => {
      state.formData = {
        ...initialFormData,
      };
      state.isSubmitting = false;
      state.submitSuccess = false;
      state.error = null;
      state.message = '';
    },
    clearLabourFormError: state => {
      state.error = null;
    },
    clearLabourFormMessage: state => {
      state.message = '';
    },
    setLabourSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    setLabourSubmitSuccess: (state, action) => {
      state.submitSuccess = action.payload;
    },
  },
});
export const {
  setLabourFormData,
  resetLabourForm,
  clearLabourFormError,
  clearLabourFormMessage,
  setLabourSubmitting,
  setLabourSubmitSuccess,
} = labourSlice.actions;
export default labourSlice.reducer;
