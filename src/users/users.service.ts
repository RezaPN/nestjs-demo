import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AppService } from '../app.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private appService: AppService
  ) {}

  create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    this.appService.sendMessage(`user created: ${email}`)
    return this.repo.save(user);
  }

  async findOneWithContact(id: number) {
    if (!id) {
      throw new NotFoundException('Not Found');
    }
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findOneUser(id: number) {
    if (!id) {
      throw new NotFoundException('Not Found');
    }
    return this.repo.findOne({ where: { id } });
  }

  findUser(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOneUser(id);
    if (!user) {
      throw new NotFoundException('users not found');
    }
    /*
      Using Object.assign(user, attrs) and then calling save(user) triggers hooks or lifecycle events defined on the entity class.
      Using this.repo.update() does not trigger hooks or lifecycle events defined on the entity class.
    */

    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneWithContact(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.remove(user);
  }
}
