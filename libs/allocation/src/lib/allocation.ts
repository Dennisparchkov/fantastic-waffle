import { FreeshareAllocation, FreeshareAllocationStatus } from './repository/entities/freeshare-allocation';

export interface IAllocation {
  generateAllocation(): { min: number, max: number }
  generateCPAllocation(allocatedFreeshares: FreeshareAllocation[]): { min: number, max: number }
}
enum AllocationType {
  A = 'A',
  B = 'B',
  C = 'C',
}

const ALLOCATION_TYPE_PRICES = {
  [AllocationType.A]: {
    min: 3,
    max: 10,
  },
  [AllocationType.B]: {
    min: 11,
    max: 25,
  },
  [AllocationType.C]: {
    min: 26,
    max: 200,
  },
}

export class Allocation implements IAllocation {

  constructor(
    private readonly targetCPA: number,
    private readonly minPrice: number,
    private readonly maxPrice: number
  ) { }


  generateAllocation(): { min: number, max: number }  {
    // TODO: Math.random() is not a good way to generate a random number
    const random = Math.random()

    // 95% percent chance
    if (random <= 0.95) {
      return ALLOCATION_TYPE_PRICES[AllocationType.A]
    // 3% percent chance
    } else if (random <= 0.98) {
      return ALLOCATION_TYPE_PRICES[AllocationType.B]
    }

    // 2% percent chance
    return ALLOCATION_TYPE_PRICES[AllocationType.C]
  }

  generateCPAllocation(allocatedFreeshares: FreeshareAllocation[]): { min: number; max: number } {
    const completedFreeshares = allocatedFreeshares.filter(f => f.status === FreeshareAllocationStatus.COMPLETE)

    const totalCost = Object.values(completedFreeshares).reduce((acc, val) => acc + val.cost, 0);
    const totalNumberOfFreeShares = completedFreeshares.length;

    const existingCPA = totalCost/ totalNumberOfFreeShares

    if (existingCPA > this.targetCPA) {
      return { min: this.minPrice, max: this.targetCPA }
    } else {
      return { min: this.targetCPA, max: this.maxPrice }
    }
  }
}
