import { IBroker } from '@freeshares/broker';

export type Instrument = {
  isin: string
}

export interface IInstrumentService {
  getRandomInstrumentInPriceRange(min: number, max: number): Promise<Instrument>
}

export class InstrumentService implements IInstrumentService {

  constructor(
    private readonly broker: IBroker
  ) {
  }

  async getRandomInstrumentInPriceRange(min: number, max: number): Promise<Instrument> {
    const instruments = await this.broker.listTradableAssets()

    const instrumentPrices = await Promise.all(
      instruments.map(instrument => this.broker.getLatestPrice(instrument.tickerSymbol))
    )

    const instrumentsInRange = instruments.filter((instrument, index) => {
      const price = instrumentPrices[index].sharePrice
      return price >= min && price <= max
    })

    const randomInstrument = instrumentsInRange[Math.floor(Math.random() * instrumentsInRange.length)]

    return {
      isin: randomInstrument.tickerSymbol
    }
  }
}
