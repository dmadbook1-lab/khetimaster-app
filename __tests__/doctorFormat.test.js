import {
  bookingDays,
  buildConsultationPayload,
  buildDoctorProfilePayload,
  buildTimeSlots,
  describeConsultationState,
  feeLabel,
  getConsultationActions,
} from '../src/utils/doctorFormat';

const today = '2026-10-22';

const vet = {
  _id: 'd1',
  doctorType: 'veterinarian',
  consultationFee: 200,
  consultationFeeType: 'perConsultation',
};

describe('fees', () => {
  test('free doctors and zero fees show as free', () => {
    expect(feeLabel(vet)).toBe('₹200');
    expect(
      feeLabel({ consultationFeeType: 'free', consultationFee: 150 }),
    ).toBe('Free');
    expect(feeLabel({ consultationFee: 0 })).toBe('Free');
  });
});

describe('booking days and slots', () => {
  test('days stay inside the doctor availability window', () => {
    const days = bookingDays(
      {
        availableFrom: '2026-10-24T00:00:00.000Z',
        availableUntil: '2026-10-26',
      },
      today,
    );
    expect(days).toEqual(['2026-10-24', '2026-10-25', '2026-10-26']);
    expect(bookingDays({}, today)).toHaveLength(14);
  });

  test('marks booked (overlapping) and past slots', () => {
    const slots = buildTimeSlots({
      dayKey: today,
      todayKey: today,
      nowMinutes: 9 * 60 + 10,
      bookedSlots: [
        {
          consultationDate: '2026-10-22T00:00:00.000Z',
          startTime: '10:15',
          endTime: '',
        },
        { consultationDate: '2026-10-23T00:00:00.000Z', startTime: '12:00' },
      ],
    });
    const at = time => slots.find(slot => slot.time === time);

    expect(at('09:00').past).toBe(true);
    expect(at('09:30').past).toBe(false);
    // 10:15-10:45 blocks 10:00 and 10:30
    expect(at('10:00').booked).toBe(true);
    expect(at('10:30').booked).toBe(true);
    expect(at('11:00').booked).toBe(false);
    expect(at('12:00').booked).toBe(false);
    expect(at('08:00').label).toBe('8:00 AM');
  });
});

describe('consultation request', () => {
  const form = {
    consultationDate: '2026-10-23',
    startTime: '10:30',
    problemType: 'Fever',
    animalType: 'Cow',
    animalCount: '2',
    symptoms: ' Not eating since yesterday ',
    images: ['a'],
    paymentMethod: 'upi',
  };

  test('builds a payload without any fee', () => {
    const { payload } = buildConsultationPayload(form, {
      doctor: vet,
      todayKey: today,
    });
    expect(payload).toMatchObject({
      doctorId: 'd1',
      consultationType: 'veterinary',
      animalCount: 2,
      symptoms: 'Not eating since yesterday',
    });
    expect(payload.consultationFee).toBeUndefined();
    expect(payload.totalAmount).toBeUndefined();
  });

  test('crop doctors get cropName instead of animal fields', () => {
    const { payload } = buildConsultationPayload(
      { ...form, cropName: 'Tomato' },
      { doctor: { ...vet, doctorType: 'agriculturalDoctor' }, todayKey: today },
    );
    expect(payload.consultationType).toBe('agricultural');
    expect(payload.cropName).toBe('Tomato');
    expect(payload.animalType).toBeUndefined();
  });

  test('rejects past days, past times and bad counts', () => {
    const options = { doctor: vet, todayKey: today, nowMinutes: 11 * 60 };
    expect(
      buildConsultationPayload(
        { ...form, consultationDate: '2026-10-21' },
        options,
      ).field,
    ).toBe('consultationDate');
    expect(
      buildConsultationPayload(
        { ...form, consultationDate: today, startTime: '10:30' },
        options,
      ).field,
    ).toBe('startTime');
    expect(
      buildConsultationPayload({ ...form, animalCount: '1.5' }, options).field,
    ).toBe('animalCount');
    expect(
      buildConsultationPayload({ ...form, symptoms: '' }, options).field,
    ).toBe('symptoms');
  });
});

describe('doctor profile', () => {
  const form = {
    fullName: 'Dr. Patil',
    doctorType: 'veterinarian',
    specialization: ['Cattle'],
    consultationFeeType: 'perConsultation',
    consultationFee: '250',
  };

  test('free consultation sends fee 0', () => {
    const { payload } = buildDoctorProfilePayload({
      ...form,
      consultationFeeType: 'free',
    });
    expect(payload).toMatchObject({
      consultationFeeType: 'free',
      consultationFee: 0,
    });
    expect(buildDoctorProfilePayload(form).payload.consultationFee).toBe(250);
  });

  test('validates type, specialization, fee and dates', () => {
    expect(buildDoctorProfilePayload({ ...form, doctorType: 'x' }).field).toBe(
      'doctorType',
    );
    expect(
      buildDoctorProfilePayload({ ...form, specialization: [] }).field,
    ).toBe('specialization');
    expect(
      buildDoctorProfilePayload({ ...form, consultationFee: '0' }).field,
    ).toBe('consultationFee');
    expect(
      buildDoctorProfilePayload({
        ...form,
        availableFrom: '2026-11-02',
        availableUntil: '2026-11-01',
      }).field,
    ).toBe('availableUntil');
    expect(buildDoctorProfilePayload({ ...form, email: 'bad' }).field).toBe(
      'email',
    );
  });
});

describe('actions and state', () => {
  const base = {
    consultationDate: '2026-10-22T00:00:00.000Z',
    startTime: '10:00',
  };

  test('doctor actions', () => {
    expect(
      getConsultationActions(
        { ...base, status: 'pending', myRole: 'doctor' },
        today,
      ),
    ).toEqual(['accept', 'reject']);
    expect(
      getConsultationActions(
        { ...base, status: 'accepted', myRole: 'doctor' },
        today,
      ),
    ).toEqual(['complete', 'notes', 'cancel']);
    // completing early is blocked
    expect(
      getConsultationActions(
        {
          ...base,
          consultationDate: '2026-10-25',
          status: 'confirmed',
          myRole: 'doctor',
        },
        today,
      ),
    ).toEqual(['notes', 'cancel']);
  });

  test('farmer actions', () => {
    expect(
      getConsultationActions(
        { ...base, status: 'completed', canReview: true, myRole: 'farmer' },
        today,
      ),
    ).toEqual(['review']);
    expect(
      getConsultationActions(
        { ...base, status: 'pending', myRole: 'farmer' },
        today,
      ),
    ).toEqual(['cancel']);
  });

  test('describes expired requests', () => {
    expect(
      describeConsultationState(
        {
          ...base,
          status: 'cancelled',
          cancelledBy: 'system',
          myRole: 'farmer',
        },
        today,
      ),
    ).toMatch(/Expired/);
  });
});
