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
  ]
}

module.exports = DatabaseAttributes;