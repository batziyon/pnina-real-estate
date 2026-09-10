/**
 * Create User with Password Use Case
 *
 * Creates a new user with a hashed password.
 * Password hashing is owned by the Application layer.
 *
 * Security:
 * - Password is hashed with bcrypt (10 rounds)
 * - passwordHash is persisted, never returned
 * - Client never provides passwordHash field
 *
 * Layer: Application
 */

import * as bcrypt from "bcryptjs";
import type { UserRepository } from "@/domain/user/user.repository";
import type { UserData, UserRole } from "@/domain/user/user.types";
import { ValidationError } from "../errors";

export interface CreateUserWithPasswordInput {
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  password: string; // Raw password (ephemeral)
}

export class CreateUserWithPasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserWithPasswordInput): Promise<UserData> {
    const { password, ...userData } = input;

    // 1. Validate password presence
    if (!password || password.trim().length === 0) {
      throw new ValidationError("Password is required.");
    }

    // 2. Check for duplicate email
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError("A user with this email already exists.");
    }

    // 3. Hash password (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create user with hashed password
    const createdUser = await this.userRepository.create({
      ...userData,
      passwordHash,
    });

    // Repository already returns safe UserData (no hash)
    return createdUser;
  }
}
