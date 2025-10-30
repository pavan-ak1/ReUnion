import jwt, { type SignOptions } from "jsonwebtoken";

export const generateToken = (user_id: number, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRE ||
    "1d") as SignOptions["expiresIn"];

  if (!jwtSecret) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
    throw new Error("JWT secret key is not configured.");
  }

  const options: SignOptions = {
  expiresIn: expiresIn ?? '1h',
};
  const token = jwt.sign({ user_id, role }, jwtSecret, options);

  return token;
};
