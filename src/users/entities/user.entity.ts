import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true, length: 200 })
  email: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToOne(() => Auth, (auth) => auth.user, {
    nullable: true,
  })
  auth?: Auth;
}
