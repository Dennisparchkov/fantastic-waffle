
export interface IAllocation {

  generateAllocation(): AllocationType
}

export enum AllocationType {
  A = 'A',
  B = 'B',
  C = 'C',
}

export const ALLOCATION_TYPE_PRICES = {
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
  generateAllocation(): AllocationType {
    // TODO: Math.random() is not a good way to generate a random number
    const random = Math.random()

    // 95% percent chance
    if (random <= 0.95) {
      return AllocationType.A
    // 3% percent chance
    } else if (random <= 0.98) {
      return AllocationType.B
    }

    // 2% percent chance
    return AllocationType.C
  }
}
