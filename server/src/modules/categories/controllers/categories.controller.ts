import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { CategoriesService } from '../services/categories.service';
import { CategoryDto } from '../dtos/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }
}
