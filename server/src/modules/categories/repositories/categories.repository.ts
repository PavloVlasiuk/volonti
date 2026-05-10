import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepositoryWrapper } from '../../../common/repositories/base.repository';
import { Category } from '../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesRepository extends BaseRepositoryWrapper<
  Category,
  CategoryDto
> {
  protected dtoClass = CategoryDto;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
}
