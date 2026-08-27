import {createSlice} from '@reduxjs/toolkit';

const initialFormData = {
  // ============================================================
  // STEP 1
  // ============================================================

  gender: '',
  age: '',

  // ============================================================
  // STEP 2
  // ============================================================

  preferredWork: [],

  // ============================================================
  // STEP 3
  // ============================================================

  fullName: '',
  phoneNumber: '',
  village: '',
  profileImage: '',

  // ============================================================
  // STEP 4
  // ============================================================

  availability: 'today',
  expectedWage: '',
  wageType: 'daily',

  experience: '',
  experienceUnit: 'years',

  // ============================================================
  // UI
  // ============================================================

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
    // ========================================================
    // SET FORM DATA
    // ========================================================

    setLabourFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },

    // ========================================================
    // RESET FORM
    // ========================================================

    resetLabourForm: state => {
      state.formData = {
        ...initialFormData,
      };

      state.isSubmitting = false;
      state.submitSuccess = false;
      state.error = null;
      state.message = '';
    },

    // ========================================================
    // CLEAR ERROR
    // ========================================================

    clearLabourFormError: state => {
      state.error = null;
    },

    // ========================================================
    // CLEAR MESSAGE
    // ========================================================

    clearLabourFormMessage: state => {
      state.message = '';
    },

    // ========================================================
    // SUBMITTING
    // ========================================================

    setLabourSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },

    // ========================================================
    // SUCCESS
    // ========================================================

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