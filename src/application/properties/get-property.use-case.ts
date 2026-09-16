import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData, PropertyImageData, PropertyVideoData } from "@/domain/property/property.types";
import { EntityNotFoundError } from "@/application/errors";

export class GetPropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  /** Returns the property without media. */
  async execute(id: string): Promise<PropertyData> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);
    return property;
  }

  /** Returns the property with its images and videos included. */
  async executeWithMedia(
    id: string
  ): Promise<PropertyData & { images: PropertyImageData[]; videos: PropertyVideoData[] }> {
    const property = await this.propertyRepository.findByIdWithMedia(id);
    if (!property) throw new EntityNotFoundError("Property", id);
    return property;
  }

  /** Returns all images for a property. */
  async getImages(id: string): Promise<PropertyImageData[]> {
    return await this.propertyRepository.findImages(id);
  }
}
