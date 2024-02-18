import { AxiosInstance } from "axios";

export interface IBroker {
  // To fetch a list of assets available for trading
  listTradableAssets(): Promise<Array<{ tickerSymbol: string }>>

  // To fetch the latest price for a single asset
  getLatestPrice(tickerSymbol: string): Promise<{ sharePrice: number }>

  // To check if the stock market is currently open or closed
  isMarketOpen(): Promise<{ open: boolean, nextOpeningTime: string, nextClosingTime: string }>

  // To purchase shares into a customer's account using Emma's funds
  placeBuyOrderUsingEmmaFunds(accountId: string, tickerSymbol: string, quantity: number): Promise<{ orderId: string }>

  // To view the shares that are purchased in the customer's account
  getAccountPositions(accountId: string): Promise<Array<{ tickerSymbol: string, quantity: number, sharePrice: number }>>

  // To view the orders of the customer's account. Returns the status of each order and what share price the order was executed at.
  getAllOrders(accountId: string): Promise<Array<{ id: string, tickerSymbol: string, quantity: number, side: 'buy'|'sell', status: 'open'|'filled'|'failed', filledPrice: number }>>
}


export class Broker implements IBroker {


  constructor(
    private readonly http: AxiosInstance,
  ) { }

  getAccountPositions(accountId: string): Promise<Array<{
    tickerSymbol: string;
    quantity: number;
    sharePrice: number
  }>> {
    throw new Error('Method not implemented.')
  }

  getAllOrders(accountId: string): Promise<Array<{
    id: string;
    tickerSymbol: string;
    quantity: number;
    side: "buy" | "sell";
    status: "open" | "filled" | "failed";
    filledPrice: number
  }>> {
    throw new Error('Method not implemented.')
  }

  getLatestPrice(tickerSymbol: string): Promise<{ sharePrice: number }> {
    throw new Error('Method not implemented.');
  }

  isMarketOpen(): Promise<{ open: boolean; nextOpeningTime: string; nextClosingTime: string }> {
    throw new Error('Method not implemented.');
  }

  listTradableAssets(): Promise<Array<{ tickerSymbol: string }>> {
    throw new Error('Method not implemented.');
  }

  placeBuyOrderUsingEmmaFunds(accountId: string, tickerSymbol: string, quantity: number): Promise<{ orderId: string }> {
    throw new Error('Method not implemented.');
  }
}
