import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import { isValidStatusTransition, canActorPublish } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  BusinessRuleError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class UnpublishPropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string, actor: Actor): Promise<PropertyData> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);

    // Authorization: same rules as publish
    if (!canActorPublish(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to unpublish this property.");
    }

    if (!isValidStatusTransition(property.status, "DRAFT")) {
      throw new BusinessRuleError(
        `Cannot unpublish a property with status "${property.status}".`
      );
    }

    return this.propertyRepository.update(id, { status: "DRAFT" });
  }
}
