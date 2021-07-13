const DatabaseAttributes = {
  PATIENT: [
    'id',
    ['is_active', 'isActive'],
    ['first_name', 'firstName'],
    ['last_name', 'lastName'],
    ['email_address', 'emailAddress'],
    ['phone_number', 'phoneNumber'],
    'gender',
    'race',
    ['birth_date', 'birthDate'],
    ['address_line_1', 'addressLine1'],
    ['address_line_2', 'addressLine2'],
    'city',
    'state',
    ['postal_code', 'postalCode'],
    ['country_code', 'countryCode'],
    'latitude',
    'longitude',
    ['image_url', 'imageUrl'],
    ['insurance_provider_id', 'insuranceProviderId'],
    ['insurance_plan_id', 'insurancePlanId']
  ],
  DOCTOR: [
    'id',
    ['practice_id', 'practiceId'],
    ['is_approved', 'isApproved'],
    ['first_name', 'firstName'],
    ['last_name', 'lastName'],
    ['email_address', 'emailAddress'],
    ['phone_number', 'phoneNumber'],
    ['image_url', 'imageUrl'],
    'description',
    'gender',
    'race',
    ['birth_date', 'birthDate'],
    ['npi_number', 'npiNumber'],
    ['stripe_customer_id', 'stripeCustomerId'],
    ['stripe_plan_id', 'stripePlanId'],
    ['stripe_subscription_status', 'stripeSubscriptionStatus']
  ],
  PRACTICE: [
    'id',
    'name',
    'description',
    'website',
    ['email_address', 'emailAddress'],
    ['phone_number', 'phoneNumber'],
    ['fax_number', 'faxNumber'],
    ['address_line_1', 'addressLine1'],
    ['address_line_2', 'addressLine2'],
    'city',
    'state',
    ['postal_code', 'postalCode'],
    ['country_code', 'countryCode'],
    'latitude',
    'longitude',
    ['image_url', 'imageUrl']
  ],
  IMAGE: [
    'id',
    ['doctor_id', 'doctorId'],
    'url',
    'description'
  ],
  SCHEDULE: [
    'id',
    ['doctor_id', 'doctorId'],
    ['sunday_availability_start_time', 'sundayAvailabilityStartTime'],
    ['sunday_availability_end_time', 'sundayAvailabilityEndTime'],
    ['sunday_break_start_time', 'sundayBreakStartTime'],
    ['sunday_break_end_time', 'sundayBreakEndTime'],
    ['monday_availability_start_time', 'mondayAvailabilityStartTime'],
    ['monday_availability_end_time', 'mondayAvailabilityEndTime'],
    ['monday_break_start_time', 'mondayBreakStartTime'],
    ['monday_break_end_time', 'mondayBreakEndTime'],
    ['tuesday_availability_start_time', 'tuesdayAvailabilityStartTime'],
    ['tuesday_availability_end_time', 'tuesdayAvailabilityEndTime'],
    ['tuesday_break_start_time', 'tuesdayBreakStartTime'],
    ['tuesday_break_end_time', 'tuesdayBreakEndTime'],
    ['wednesday_availability_start_time', 'wednesdayAvailabilityStartTime'],
    ['wednesday_availability_end_time', 'wednesdayAvailabilityEndTime'],
    ['wednesday_break_start_time', 'wednesdayBreakStartTime'],
    ['wednesday_break_end_time', 'wednesdayBreakEndTime'],
    ['thursday_availability_start_time', 'thursdayAvailabilityStartTime'],
    ['thursday_availability_end_time', 'thursdayAvailabilityEndTime'],
    ['thursday_break_start_time', 'thursdayBreakStartTime'],
    ['thursday_break_end_time', 'thursdayBreakEndTime'],
    ['friday_availability_start_time', 'fridayAvailabilityStartTime'],
    ['friday_availability_end_time', 'fridayAvailabilityEndTime'],
    ['friday_break_start_time', 'fridayBreakStartTime'],
    ['friday_break_end_time', 'fridayBreakEndTime'],
    ['saturday_availability_start_time', 'saturdayAvailabilityStartTime'],
    ['saturday_availability_end_time', 'saturdayAvailabilityEndTime'],
    ['saturday_break_start_time', 'saturdayBreakStartTime'],
    ['saturday_break_end_time', 'saturdayBreakEndTime']
  ],
  APPOINTMENT: [
    'id',
    ['patient_id', 'patientId'],
    ['doctor_id', 'doctorId'],
    ['specialty_id', 'specialtyId'],
    'timestamp',
    ['is_new_patient', 'isNewPatient'],
    'notes'
  ]
}

module.exports = DatabaseAttributes;