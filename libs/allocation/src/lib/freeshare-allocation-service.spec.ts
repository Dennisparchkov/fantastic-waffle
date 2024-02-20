import {
  FreeshareAllocation,
  FreeshareAllocationService,
  FreeshareAllocationStatus,
  IAllocation
} from '@freeshares/allocation';
import { mock, mockDeep } from 'jest-mock-extended';
import { Account, FreeShareStatus } from '@freeshares/user';
import { Repository } from 'typeorm';
import { IInstrumentService } from '@freeshares/instrument';
import { IBroker, Order } from '@freeshares/broker';

describe('FreeshareAllocationService', () => {
  const allocation = mock<IAllocation>()
  const accountRepo = mock<Repository<Account>>()
  const freeshareAllocationRepo = mockDeep<Repository<FreeshareAllocation>>()
  const instrumentService = mock<IInstrumentService>()
  const broker = mock<IBroker>()

  const useCPAAllocation = false
  const service = new FreeshareAllocationService(
    allocation,
    accountRepo,
    freeshareAllocationRepo,
    instrumentService,
    broker,
    useCPAAllocation
  )

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns NO_USER_FOUND when no user in database', async () => {
    accountRepo.findOne.mockResolvedValue(undefined)
    const response = await service.allocateFreeshare('123')
    expect(response).toEqual({
      success: false,
      reason: 'NO_USER_FOUND'
    })
  })

  it('returns INELIGIBLE when user is not eligible', async () => {
    accountRepo.findOne.mockResolvedValue({
      id: '1',
      userId: '123',
      user: {
        id: '123',
        freeShareStatus: FreeShareStatus.ineligible
      }
    })
    const response = await service.allocateFreeshare('123')
    expect(response).toEqual({
      success: false,
      reason: 'INELIGIBLE'
    })
  })

  it('returns ALREADY_CLAIMED when user has already claimed', async () => {
    const userId = '123'
    const accountId = '1'
    accountRepo.findOne.mockResolvedValue({
      id: accountId,
      userId,
      user: {
        id: userId,
        freeShareStatus: FreeShareStatus.claimed
      }
    })
    const response = await service.allocateFreeshare(userId)
    expect(response).toEqual({
      success: false,
      reason: 'ALREADY_CLAIMED'
    })
  })

  it('does not call allocation service when user is already assigned a freeshare and tries to purchase it', async () => {
    const userId = '123'
    const accountId = '1'
    accountRepo.findOne.mockResolvedValue({
      id: accountId,
      userId,
      user: {
        id: userId,
        freeShareStatus: FreeShareStatus.eligible
      }
    })

    const instrumentTicker = 'AAPL'
    freeshareAllocationRepo.findOne.mockResolvedValue({
      id: '1',
      userId,
      user: null,
      instrumentTicker,
      orderId: null,
      status: FreeshareAllocationStatus.PENDING_BUY,
      cost: 10
    })

    const order = { id: '1234' }
    const orderWithPrice = {
      id: order.id,
      tickerSymbol: 'APPL',
      quantity: 1,
      side: 'buy',
      status: 'filled',
      filledPrice: 50.5
    }
    broker.placeBuyOrderUsingEmmaFunds.mockResolvedValue(order)
    broker.getOrder.mockResolvedValue(orderWithPrice as Order)

    await service.allocateFreeshare(userId)

    expect(allocation.generateAllocation).not.toHaveBeenCalled()
    expect(freeshareAllocationRepo.save).not.toHaveBeenCalled()
    const expectedQuantity = 1
    expect(broker.placeBuyOrderUsingEmmaFunds).toHaveBeenCalledWith(accountId, instrumentTicker, expectedQuantity)
  })

  it('purchases freeshare and stores it in the database', async () => {
    const userId = '123'
    const accountId = '1'
    accountRepo.findOne.mockResolvedValue({
      id: accountId,
      userId,
      user: {
        id: userId,
        freeShareStatus: FreeShareStatus.eligible
      }
    })

    const instrumentTicker = 'AAPL'
    freeshareAllocationRepo.findOne.mockResolvedValue(undefined)
    allocation.generateAllocation.mockReturnValue({ min: 3, max: 5 })
    instrumentService.getRandomInstrumentInPriceRange.mockResolvedValue({ isin: instrumentTicker })

    const order = { id: '1234' }
    const orderWithPrice = {
      id: order.id,
      tickerSymbol: 'APPL',
      quantity: 1,
      side: 'buy',
      status: 'filled',
      filledPrice: 50.5
    }
    broker.placeBuyOrderUsingEmmaFunds.mockResolvedValue(order)
    broker.getOrder.mockResolvedValue(orderWithPrice as Order)

    const response = await service.allocateFreeshare(userId)

    expect(response).toEqual({
      success: true,
      orderId: order.id,
      instrumentTicker
    })
  })
})
