import { User } from "../user/user.schema";

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
