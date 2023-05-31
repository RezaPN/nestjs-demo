import { randomBytes, scryptSync } from 'crypto';

interface EncryptProps {
  nonHash: string;
  salt?: string;
}

export const encrypt = ({ nonHash, salt }: EncryptProps) => {
  // If salt is not provided, generate one
  if (!salt) {
    salt = randomBytes(8).toString('hex');
  }

  // hash the salt and the password together
  const hash = scryptSync(nonHash, salt, 32);

  // join the hashed result and the salt together
  return salt + '.' + hash.toString('hex');
};

export const validateEncrypt = (hashed, nonHash) => {
  const [salt, storedHash] = hashed.split('.');

  const hash = scryptSync(nonHash, salt, 32) as Buffer;

  return storedHash === hash.toString('hex');
};
