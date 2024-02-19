import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@freeshares/user';


export enum FreeshareAllocationStatus {
  PENDING_BUY = 'PENDING_BUY',
  COMPLETE = 'COMPLETE'
}

@Entity()
export class FreeshareAllocation {
  @PrimaryGeneratedColumn('increment', { type: 'int', primaryKeyConstraintName: 'freeshare_allocation_seq_id_pkey' })
  id: string

  @Column({ unique: true, type: 'int', name: 'userId' })
  userId: string

  @OneToOne(() => User, {})
  @JoinColumn({ referencedColumnName: 'id', name: 'userId', foreignKeyConstraintName: 'freeshare_allocation_user_id_fkey' })
  user: User

  @Column({ type: 'varchar' })
  instrumentTicker: string

  @Column({ type: 'int', nullable: true })
  orderId: string

  @Column({ type: 'varchar', enum: FreeshareAllocationStatus, default: FreeshareAllocationStatus.PENDING_BUY })
  status: FreeshareAllocationStatus
}
