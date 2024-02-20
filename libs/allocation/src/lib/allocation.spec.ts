import { Allocation } from './allocation';
import { FreeshareAllocation, FreeshareAllocationStatus } from '@freeshares/allocation';

describe('generateAllocation', () => {

  const minPrice = 3;
  const maxPrice = 200;
  const targetCPA = 10;

  const simpleAllocation = new Allocation(targetCPA, minPrice, maxPrice);

  const expectedLowPrice = {
    min: minPrice,
    max: 10,
  }
  const expectedMidPrice = {
    min: 11,
    max: 25,
  }
  const expectedHighPrice =  {
    min: 26,
    max: 200,
  }

  describe('generateAllocation', () => {

    it.each`
  random  | expectedPrice
  ${0}    | ${expectedLowPrice}
  ${0.1}  | ${expectedLowPrice}
  ${0.5}  | ${expectedLowPrice}
  ${0.94} | ${expectedLowPrice}
  ${0.95} | ${expectedLowPrice}
  ${0.96} | ${expectedMidPrice}
  ${0.97} | ${expectedMidPrice}
  ${0.98} | ${expectedMidPrice}
  ${0.99} | ${expectedHighPrice}
  ${1}    | ${expectedHighPrice}
  `('should return allocation type $expectedPrice if random number generates $random', ({ random, expectedPrice }) => {
      jest.spyOn(global.Math, 'random').mockReturnValue(random);

      const response = simpleAllocation.generateAllocation();
      expect(response).toEqual(expectedPrice);
    });
  })

  describe('generateCPAllocation', () => {
    it('should return min and target CPA if existing CPA is less than target CPA', () => {
      const allocatedFreeshares = [
        new FreeshareAllocation('1', '1', 'AAPL', '1', FreeshareAllocationStatus.COMPLETE, 10),
        new FreeshareAllocation('2', '2', 'GME', '1', FreeshareAllocationStatus.COMPLETE, 20)
      ]
      const response = simpleAllocation.generateCPAllocation(allocatedFreeshares);
      expect(response).toEqual({ min: minPrice, max: targetCPA });
    })

    it('should return target CPA and max if existing CPA is greater than target CPA', () => {
      const allocatedFreeshares = [
        new FreeshareAllocation('1', '1', 'AAPL', '1', FreeshareAllocationStatus.COMPLETE, 1),
        new FreeshareAllocation('2', '2', 'GME', '1', FreeshareAllocationStatus.COMPLETE, 2)
      ]
      const response = simpleAllocation.generateCPAllocation(allocatedFreeshares);
      expect(response).toEqual({ min: targetCPA, max: maxPrice });
    })
  })

});
