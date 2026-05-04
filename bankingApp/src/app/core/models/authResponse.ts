import { User } from "./user";

export interface AuthResponse {
    status: string;
    token: string;
    user: User;
}
