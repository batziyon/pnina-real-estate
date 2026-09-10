/**
 * Login Use Case — Credential Verification
 *
 * Authenticates a user with email + password.
 *
 * Security:
 * - Uses generic error messages to prevent username enumeration
 * - Checks user.active status
 * - Compares password hash using bcrypt
 * - Returns safe UserData (no passwordHash)
 *
 * Layer: Application
 */

import * as bcrypt from "bcryptjs";
import type { UserRepository } from "@/domain/user/user.repository";
import type { UserData } from "@/domain/user/user.types";
import { UnauthorizedError } from "../errors";

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginInput): Promise<UserData> {
    const { email, password } = input;

    // 1. Find user with credentials
    const userWithCredentials =
      await this.userRepository.findByEmailWithCredentials(email);

    // Generic error — don't reveal whether email exists
    if (!userWithCredentials) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 2. Check active status
    if (!userWithCredentials.active) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 3. Verify password hash exists
    if (!userWithCredentials.passwordHash) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 4. Compare password with hash
    const isPasswordValid = await bcrypt.compare(
      password,
      userWithCredentials.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 5. Return safe user data (omit passwordHash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUserData } = userWithCredentials;

    return safeUserData;
  }
}
