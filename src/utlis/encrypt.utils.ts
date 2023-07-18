import { randomBytes, scryptSync } from 'crypto';

interface EncryptProps {
  nonHash: string;
  salt?: string;
}

export const encrypt = async ({ nonHash, salt }: EncryptProps) => {
  // If salt is not provided, generate one
  if (!salt) {
    salt = await randomBytes(8).toString('hex');
  }

  // hash the salt and the password together
  const hash = await scryptSync(nonHash, salt, 32);

  const result = salt + '.' + hash.toString('hex');

  // join the hashed result and the salt together
  return result;
};

export const validateEncrypt = (hashed, nonHash) => {
  const [salt, storedHash] = hashed.split('.');

  const hash = scryptSync(nonHash, salt, 32) as Buffer;

  return storedHash === hash.toString('hex');
};
