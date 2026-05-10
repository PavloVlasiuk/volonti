import { DeepPartial, Repository, SaveOptions } from 'typeorm';

export abstract class BaseRepositoryWrapper<
  E extends object,
  U,
> extends Repository<E> {
  protected abstract dtoClass: new (entity: E) => U;

  async saveToDto(entity: DeepPartial<E>, options?: SaveOptions): Promise<U> {
    const saved = await this.save(entity as E, options);
    return new this.dtoClass(saved);
  }
}
