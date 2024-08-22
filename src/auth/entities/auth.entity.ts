import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @OneToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE' })
  user: User;
}
