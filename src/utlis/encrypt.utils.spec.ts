import { encrypt, validateEncrypt } from './encrypt.utils'; // Replace 'yourFile' with the actual file name where encrypt and validateEncrypt functions are

describe('Encrypt and validate functions', () => {
  it('should encrypt nonHash and validate it correctly', async () => {
    const nonHash = 'your_test_string_here'; // Replace this with the string you want to test

    // Encrypt the nonHash
    const encrypted = await encrypt({ nonHash });

    // The result of the encryption should be a string
    expect(typeof encrypted).toBe('string');

    // Split the result to get the salt and the hash
    const [salt, hash] = encrypted.split('.');

    // The salt and the hash should be defined
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();

    // Validating the nonHash with the encrypted string should return true
    const isValid = validateEncrypt(encrypted, nonHash);
    expect(isValid).toBe(true);
  });

  it('should return false for non matching nonHash', async () => {
    const nonHash = 'your_test_string_here'; // Replace this with the string you want to test
    const anotherNonHash = 'another_test_string'; // This is another string that is different from the nonHash

    // Encrypt the nonHash
    const encrypted = await encrypt({ nonHash });

    // Validating the anotherNonHash with the encrypted string should return false
    const isValid = validateEncrypt(encrypted, anotherNonHash);
    expect(isValid).toBe(false);
  });
});
