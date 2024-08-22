import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: string;

  @Column()
  providerId: string;

  @OneToOne(() => User, (user) => user.auth, {
    nullable: false,
    onDelete: 'CASCADE',
  }) // Relasi wajib
  @JoinColumn()
  user: User;
}
