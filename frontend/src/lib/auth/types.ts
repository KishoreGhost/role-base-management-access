export type Role = "viewer" | "analyst" | "operator" | "admin";

export type UserStatus = "active" | "inactive";

export type CurrentUser = {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: CurrentUser;
};
