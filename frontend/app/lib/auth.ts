import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

export const getUserRole = (): string | null => {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.role || null;
  } catch (e) {
    return null;
  }
};

export const getUserName = (): string | null => {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.name || decoded.email || null;
  } catch {
    return null;
  }
};
