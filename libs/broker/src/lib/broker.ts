import { AxiosInstance } from "axios";

export interface IBroker {
  // To fetch a list of assets available for trading
  listTradableAssets(): Promise<Array<{ tickerSymbol: string }>>
  // To fetch the latest price for a single asset
  getLatestPrice(tickerSymbol: string): Promise<{ sharePrice: number }>
  // To check if the stock market is currently open or closed
  isMarketOpen(): Promise<{ open: boolean, nextOpeningTime: string, nextClosingTime: string }>
  // To purchase shares into a customer's account using Emma's funds
  placeBuyOrderUsingEmmaFunds(accountId: string, tickerSymbol: string, quantity: number): Promise<{ id: string }>
  // To view the shares that are purchased in the customer's account
  getAccountPositions(accountId: string): Promise<Array<{ tickerSymbol: string, quantity: number, sharePrice: number }>>
  // To view the orders of the customer's account. Returns the status of each order and what share price the order was executed at.
  getAllOrders(accountId: string): Promise<Array<{ id: string, tickerSymbol: string, quantity: number, side: 'buy'|'sell', status: 'open'|'filled'|'failed', filledPrice: number }>>
  getOrder(orderId: string): Promise<{ id: string, tickerSymbol: string, quantity: number, side: 'buy'|'sell', status: 'open'|'filled'|'failed', filledPrice: number }>
}

export type Position = {
  tickerSymbol: string
  quantity: number
  sharePrice: number
}

export type Market = {
  open: boolean
  nextOpeningTime: string
  nextClosingTime: string
}

export type Asset = { tickerSymbol: string }

export type Order = {
  id: string;
  tickerSymbol: string;
  quantity: number;
  side: "buy" | "sell";
  status: "open" | "filled" | "failed";
  filledPrice: number
}

export class Broker implements IBroker {
  constructor(
    private readonly http: AxiosInstance,
  ) { }

  async getAccountPositions(accountId: string): Promise<Array<Position>> {
    const response = await this.http.get<Array<Position>>(`/accounts/${accountId}/positions`)

    return response.data
  }

  async getAllOrders(accountId: string): Promise<Array<Order>> {
    const response = await this.http.get<Array<Order>>(`accounts/${accountId}/orders`)
    return response.data
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await this.http.get<Order>(`orders/${orderId}`)
    return response.data
  }

  async getLatestPrice(tickerSymbol: string): Promise<Pick<Position, 'sharePrice'>> {
    const response = await this.http.get<Pick<Position, 'sharePrice'>>(`/assets/${tickerSymbol}/price`)
    return response.data
  }

  async isMarketOpen(): Promise<Market> {
    const response = await this.http.get<Market>('/market/status')
    return response.data
  }

  async listTradableAssets(): Promise<Array<Asset>> {
    const response = await this.http.get<Array<Asset>>('/assets')
    return response.data
  }

  async placeBuyOrderUsingEmmaFunds(accountId: string, tickerSymbol: string, quantity: number): Promise<Pick<Order, 'id'>> {
    const response = await this.http.post<Pick<Order, 'id'>>(`/accounts/${accountId}/orders`, {
      tickerSymbol,
      quantity,
      side: 'buy'
    })
    return response.data
  }
}
