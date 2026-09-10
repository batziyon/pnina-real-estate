/**
 * Repository interface for the User aggregate.
 *
 * Defines the persistence contract. Infrastructure implements this.
 * No Prisma imports here.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  CreateUserInput,
  UserData,
  UserFilters,
  UpdateUserInput,
  UserWithCredentials,
} from "./user.types";

export interface UserRepository {
  /** Find a safe user record by ID (no passwordHash). Returns null if not found. */
  findById(id: string): Promise<UserData | null>;

  /** Find a user including credentials — used only during authentication. */
  findByIdWithCredentials(id: string): Promise<UserWithCredentials | null>;

  /** Find a user by email (safe, no hash). Returns null if not found. */
  findByEmail(email: string): Promise<UserData | null>;

  /** Find a user by email including credentials — used only during login. */
  findByEmailWithCredentials(email: string): Promise<UserWithCredentials | null>;

  /** List users with optional filters and pagination. */
  findMany(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<{ data: UserData[]; meta: PaginationMeta }>;

  /** List all active agents (for property assignment UI). */
  findAllActiveAgents(): Promise<UserData[]>;

  /** Create a new user. Returns the created user (no hash). */
  create(input: CreateUserInput): Promise<UserData>;

  /** Update a user. Returns the updated user (no hash). */
  update(id: string, input: UpdateUserInput): Promise<UserData>;

  /** Deactivate a user (sets active = false). */
  deactivate(id: string): Promise<UserData>;

  /** Count users matching the given filters. */
  count(filters: UserFilters): Promise<number>;
}
