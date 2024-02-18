import { Broker } from '../src/lib/broker';
import { AxiosInstance } from 'axios';
import { mock } from 'jest-mock-extended';

describe('broker', () => {
  const httpMock = mock<AxiosInstance>()

  const service = new Broker(httpMock)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('listTradableAssets', () => {
    it('should return a list of tradable assets', async () => {
      httpMock.get.mockResolvedValue({ data: [{ tickerSymbol: 'AAPL' }] })
      const assets = await service.listTradableAssets()
      expect(assets).toEqual([{ tickerSymbol: 'AAPL' }])
    })

    it('should call the correct endpoint', async () => {
      httpMock.get.mockResolvedValue({ data: [{ tickerSymbol: 'AAPL' }] })
      await service.listTradableAssets()
      expect(httpMock.get).toHaveBeenCalledWith('/assets')
    })
  })

  describe('getLatestPrice', () => {
    it('should return the latest price', async () => {
      httpMock.get.mockResolvedValue({ data: { sharePrice: 100 } })
      const price = await service.getLatestPrice('AAPL')
      expect(price).toEqual({ sharePrice: 100 })
    })

    it('should call the correct endpoint', async () => {
      httpMock.get.mockResolvedValue({ data: { sharePrice: 100 } })
      await service.getLatestPrice('AAPL')
      expect(httpMock.get).toHaveBeenCalledWith('/assets/AAPL/price')
    })
  })

  describe('isMarketOpen', () => {
    it('should return the market status', async () => {
      httpMock.get.mockResolvedValue({ data: { open: true, nextOpeningTime: '09:00', nextClosingTime: '17:00' } })
      const market = await service.isMarketOpen()
      expect(market).toEqual({ open: true, nextOpeningTime: '09:00', nextClosingTime: '17:00' })
    })

    it('should call the correct endpoint', async () => {
      httpMock.get.mockResolvedValue({ data: { open: true, nextOpeningTime: '09:00', nextClosingTime: '17:00' } })
      await service.isMarketOpen()
      expect(httpMock.get).toHaveBeenCalledWith('/market/status')
    })
  })

  describe('getAccountPositions', () => {
    it('should return the account positions', async () => {
      httpMock.get.mockResolvedValue({ data: [{ tickerSymbol: 'AAPL', quantity: 100, sharePrice: 100 }] })
      const positions = await service.getAccountPositions('123')
      expect(positions).toEqual([{ tickerSymbol: 'AAPL', quantity: 100, sharePrice: 100 }])
    })

    it('should call the correct endpoint', async () => {
      httpMock.get.mockResolvedValue({ data: [{ tickerSymbol: 'AAPL', quantity: 100, sharePrice: 100 }] })
      await service.getAccountPositions('123')
      expect(httpMock.get).toHaveBeenCalledWith('/accounts/123/positions')
    })
  })

  describe('getAllOrders', () => {
    it('should return the account orders', async () => {
      httpMock.get.mockResolvedValue({ data: [{ id: '123', tickerSymbol: 'AAPL', quantity: 100, side: 'buy', status: 'open', filledPrice: 100 }] })
      const orders = await service.getAllOrders('123')
      expect(orders).toEqual([{ id: '123', tickerSymbol: 'AAPL', quantity: 100, side: 'buy', status: 'open', filledPrice: 100 }])
    })

    it('should call the correct endpoint', async () => {
      httpMock.get.mockResolvedValue({ data: [{ id: '123', tickerSymbol: 'AAPL', quantity: 100, side: 'buy', status: 'open', filledPrice: 100 }] })
      await service.getAllOrders('123')
      expect(httpMock.get).toHaveBeenCalledWith('accounts/123/orders')
    })
  })

  describe('placeBuyOrderUsingEmmaFunds', () => {
    it('should place a buy order using Emma funds', async () => {
      httpMock.post.mockResolvedValue({ data: { id: '123' } })
      const order = await service.placeBuyOrderUsingEmmaFunds('123', 'AAPL', 100)
      expect(order).toEqual({ id: '123' })
    })

    it('should call the correct endpoint', async () => {
      httpMock.post.mockResolvedValue({ data: { id: '123' } })
      await service.placeBuyOrderUsingEmmaFunds('123', 'AAPL', 100)
      expect(httpMock.post).toHaveBeenCalledWith('/accounts/123/orders', { tickerSymbol: 'AAPL', quantity: 100, side: 'buy' })
    })
  })
});
