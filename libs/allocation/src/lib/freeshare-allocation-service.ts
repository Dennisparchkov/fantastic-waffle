import { Repository } from 'typeorm';

import { ALLOCATION_TYPE_PRICES, IAllocation } from '@freeshares/allocation';
import { Account, FreeShareStatus, User } from '@freeshares/user';
import { FreeshareAllocation, FreeshareAllocationStatus } from './repository/entities/freeshare-allocation';
import { IInstrumentService } from '@freeshares/instrument';
import { IBroker } from '@freeshares/broker';

export interface IFreeshareAllocationService {
  allocateFreeshare(userId: string): Promise<FreeshareAllocationResponse>
}

export type FreeshareAllocationResponse = FreeshareAllocationSuccess | FreeshareAllocationFailure

export type FreeshareAllocationSuccess = {
  success: true
  orderId: string
  instrumentTicker: string
}

export type FreeshareAllocationFailure = {
  success: false
  reason: FreeshareAllocationFailureReason
}

export enum FreeshareAllocationFailureReason {
  USER_HAS_NO_ACCOUNT = 'USER_HAS_NO_ACCOUNT',
  NO_USER_FOUND = 'NO_USER_FOUND',
  ALREADY_CLAIMED = 'ALREADY_CLAIMED',
  INELIGIBLE = 'INELIGIBLE',
  PENDING_BUY = 'PENDING_BUY',
  FAILED_BUY = 'FAILED_BUY'
}

export type FreeshareAllocationContext = {
  user?: User
  account?: Account
  freeshareAllocation?: FreeshareAllocation
}

export class FreeshareAllocationService implements IFreeshareAllocationService {

  constructor(
    private readonly allocation: IAllocation,
    private readonly accountRepo: Repository<Account>,
    private readonly freeshareAllocationRepo: Repository<FreeshareAllocation>,
    private readonly instrumentService: IInstrumentService,
    private readonly broker: IBroker
  ) { }

  async allocateFreeshare(userId: string): Promise<FreeshareAllocationResponse> {
    const context = await this.fetchContext(userId)
    const eligibilityFailureReason = await this.validateUserEligibility(context)
    if (eligibilityFailureReason) {
      return {
        success: false,
        reason: eligibilityFailureReason
      }
    }

    const allocationType = this.allocation.generateAllocation()
    const freeshareInstrument = await this.instrumentService.getRandomInstrumentInPriceRange(
      ALLOCATION_TYPE_PRICES[allocationType].min,
      ALLOCATION_TYPE_PRICES[allocationType].max
    )

    await this.storeFreeshareAllocationPendingBuy(userId, freeshareInstrument.isin)
    const orderId = await this.buyFreeshare(userId, freeshareInstrument.isin)
    await this.updateFreeshareAllocationAfterPurchase(userId, orderId)

    return {
      success: true,
      orderId,
      instrumentTicker: freeshareInstrument.isin
    }
  }

  private async fetchContext(userId: string): Promise<FreeshareAllocationContext> {
    const [account, freeshareAllocation] = await Promise.all([
      this.accountRepo.findOne({
        where: {
          userId: userId
        },
        relations: ['user']
      }),
      this.freeshareAllocationRepo.findOne({
        where: {
          userId: userId
        }
      })
    ])

    return {
      account,
      user: account?.user,
      freeshareAllocation
    }

  }

  private async validateUserEligibility(
    context: FreeshareAllocationContext
  ): Promise<FreeshareAllocationFailureReason | undefined> {
    if (!context.user) {
      return FreeshareAllocationFailureReason.NO_USER_FOUND
    }

    if (!context.account) {
      return FreeshareAllocationFailureReason.USER_HAS_NO_ACCOUNT
    }

    if (context.user.freeShareStatus === FreeShareStatus.ineligible) {
      return FreeshareAllocationFailureReason.INELIGIBLE
    }

    if (context.user.freeShareStatus === FreeShareStatus.claimed) {
      return FreeshareAllocationFailureReason.ALREADY_CLAIMED
    }

    if (!context.freeshareAllocation) {
      return
    }

    if (context.freeshareAllocation.status === FreeshareAllocationStatus.COMPLETE) {
      return FreeshareAllocationFailureReason.ALREADY_CLAIMED
    }
  }

  private async storeFreeshareAllocationPendingBuy(userId: string, instrumentTicker: string): Promise<void> {
    await this.freeshareAllocationRepo.save({
      userId,
      instrumentTicker: instrumentTicker,
      status: FreeshareAllocationStatus.PENDING_BUY
    })
  }


  private async buyFreeshare(userId: string, instrumentId: string): Promise<string> {
    const quantity = 1
    try {
      const buyOrder = await this.broker.placeBuyOrderUsingEmmaFunds(userId, instrumentId, quantity)
      return buyOrder.id
    } catch (e) {
      return FreeshareAllocationFailureReason.FAILED_BUY
    }
  }

  private async updateFreeshareAllocationAfterPurchase(userId: string, orderId: string): Promise<void> {
    await this.freeshareAllocationRepo.manager.transaction(async (transaction) => {
      await transaction.update<FreeshareAllocation>(FreeshareAllocation, {
        userId
      }, {
        orderId,
        status: FreeshareAllocationStatus.COMPLETE
      })
      await transaction.update<User>(User, {
        id: userId
      }, {
        freeShareStatus: FreeShareStatus.claimed
      })
    })
  }
}
