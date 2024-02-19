import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


export enum FreeShareStatus {
  ineligible = 'ineligible',
  eligible = 'eligible',
  claimed = 'claimed',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'int', primaryKeyConstraintName: 'user_seq_id_pkey' })
  id: string
  @Column({ type: 'varchar', enum: FreeShareStatus})
  freeShareStatus: FreeShareStatus
}
