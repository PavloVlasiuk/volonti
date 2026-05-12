import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
  SaveOptions,
} from 'typeorm';

export abstract class BaseRepositoryWrapper<
  E extends object,
  U,
> extends Repository<E> {
  protected abstract dtoClass: new (entity: E) => U;

  async saveToDto(entity: DeepPartial<E>, options?: SaveOptions): Promise<U> {
    const saved = await this.save(entity as E, options);
    return new this.dtoClass(saved);
  }

  async findOneToDto(options: FindOneOptions<E>): Promise<U | null> {
    const entity = await this.findOne(options);
    return entity ? new this.dtoClass(entity) : null;
  }

  async findToDto(options?: FindManyOptions<E>): Promise<U[]> {
    const entities = await this.find(options);
    return entities.map((entity) => new this.dtoClass(entity));
  }

  async transaction(
    trx: (manager: Repository<E>) => Promise<void>,
  ): Promise<void> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      const transactionalRepo = transactionalEntityManager.getRepository<E>(
        this.metadata.target,
      );
      await trx(transactionalRepo);
    });
  }
}
