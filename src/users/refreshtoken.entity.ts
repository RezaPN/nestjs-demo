import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column()
    userId: number;
}