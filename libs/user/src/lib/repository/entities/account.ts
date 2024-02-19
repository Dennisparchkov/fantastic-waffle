import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@freeshares/user';


@Entity()
export class Account {
  @PrimaryGeneratedColumn('increment', { type: 'int', primaryKeyConstraintName: 'account_seq_id_pkey' })
  id: string

  @Column({ unique: true, type: 'int', name: 'userId' })
  userId: string

  @OneToOne(() => User, {})
  @JoinColumn({ referencedColumnName: 'id', name: 'userId', foreignKeyConstraintName: 'account_user_id_fkey' })
  user: User

}
