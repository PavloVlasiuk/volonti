import { Category } from '../entities/category.entity';

export class CategoryDto {
  id: string;
  name: string;

  constructor(entity: Category) {
    this.id = entity.id;
    this.name = entity.name;
  }
}
