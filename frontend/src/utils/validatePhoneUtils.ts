// Simple validation script for phone utility functions

import { formatPhoneNumber, isValidPhoneNumber, formatPhoneForDisplay } from './phone';

console.log('Testing phone utility functions...');

// Test formatPhoneNumber
console.log('\n--- Testing formatPhoneNumber ---');
const testNumbers = [
  '89123456789',
  '+79123456789',
  '79123456789',
  '0700123456',
  '+996700123456',
  '996700123456',
  '',
  '123',
  '891234567890123',
  '0700123456789'
];

testNumbers.forEach(number => {
  const result = formatPhoneNumber(number);
  console.log(`formatPhoneNumber('${number}') => ${result}`);
});

// Test isValidPhoneNumber
console.log('\n--- Testing isValidPhoneNumber ---');
const validNumbers = [
  '+79123456789',
  '+71234567890',
  '+996700123456',
  '+996555123456'
];

const invalidNumbers = [
  '',
  '123',
  '+7912345678',
  '+791234567890',
  '+99670012345',
  '+9967001234567',
  '79123456789'
];

validNumbers.forEach(number => {
  const result = isValidPhoneNumber(number);
  console.log(`isValidPhoneNumber('${number}') => ${result}`);
});

invalidNumbers.forEach(number => {
  const result = isValidPhoneNumber(number);
  console.log(`isValidPhoneNumber('${number}') => ${result}`);
});

// Test formatPhoneForDisplay
console.log('\n--- Testing formatPhoneForDisplay ---');
const displayNumbers = [
  '+79123456789',
  '+996700123456',
  '+1234567890',
  ''
];

displayNumbers.forEach(number => {
  const result = formatPhoneForDisplay(number);
  console.log(`formatPhoneForDisplay('${number}') => ${result}`);
});

console.log('\nValidation complete.');