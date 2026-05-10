import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<CategoryDto[]> {
    const entities = await this.categoriesRepository.find({
      order: { name: 'ASC' },
    });
    return entities.map((e) => new CategoryDto(e));
  }
}
