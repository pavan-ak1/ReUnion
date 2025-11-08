import { StatusCodes } from "http-status-codes";
import { isTokenValid } from "../utils/checkTokenValid.js";
import type { Request, Response, NextFunction } from "express";

interface User {
  user_id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies.token;

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token not present Re-login again" });
  }

  try {
    const decoded = await isTokenValid(token);
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
  }
};

export const verifyStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies.token;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token not present Re-login again" });
  }
  try {
    const decoded = await isTokenValid(token);
    if (decoded.role !== "student")
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Not authorized for this route" });
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.log(error);
  }
};

export const verifyAlumni = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies.token;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Please log in again" });
  }
  try {
    const decoded = await isTokenValid(token);
    if (decoded.role !== "alumni") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access restricted to alumni only" });
    }

    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }
};
