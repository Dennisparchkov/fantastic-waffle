import { Allocation, ALLOCATION_TYPE_PRICES, AllocationType } from './allocation';

describe('generateAllocation', () => {

  const simpleAllocation = new Allocation();

  it.each`
  random  | expectedAllocationType
  ${0}    | ${AllocationType.A}
  ${0.1}  | ${AllocationType.A}
  ${0.5}  | ${AllocationType.A}
  ${0.94} | ${AllocationType.A}
  ${0.95} | ${AllocationType.A}
  ${0.96} | ${AllocationType.B}
  ${0.97} | ${AllocationType.B}
  ${0.98} | ${AllocationType.B}
  ${0.99} | ${AllocationType.C}
  ${1}    | ${AllocationType.C}
  `('should return allocation type $expectedAllocationType if random number generates $random', ({ random, expectedAllocationType }) => {
    jest.spyOn(global.Math, 'random').mockReturnValue(random);

    const response = simpleAllocation.generateAllocation();
    expect(response).toEqual(expectedAllocationType);
  });


  describe('ALLOCATION_TYPE_PRICES', () => {
    it('should return correct price range for each allocation type', () => {
      expect(ALLOCATION_TYPE_PRICES[AllocationType.A]).toEqual({ min: 3, max: 10 });
      expect(ALLOCATION_TYPE_PRICES[AllocationType.B]).toEqual({ min: 11, max: 25 });
      expect(ALLOCATION_TYPE_PRICES[AllocationType.C]).toEqual({ min: 26, max: 200 });
    });
  })
});
