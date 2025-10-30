import jwt, {type JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
  user_id: number;
  role: "student" | "alumni" | "admin";
}


const JWT_SECRET  = process.env.JWT_SECRET as string;

export const isTokenValid = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET!;
  const decoded = jwt.verify(token, secret) as TokenPayload;
  return decoded;
};