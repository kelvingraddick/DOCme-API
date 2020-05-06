const DatabaseAttributes = {
  PATIENT: [
    'id',
    ['is_active', 'isActive'],
    ['first_name', 'firstName'],
    ['last_name', 'lastName'],
    ['email_address', 'emailAddress'],
    ['phone_number', 'phoneNumber'],
    'gender',
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
    ['birth_date', 'birthDate'],
    ['npi_number', 'npiNumber']
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