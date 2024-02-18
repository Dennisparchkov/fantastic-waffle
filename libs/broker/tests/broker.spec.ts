import { broker } from '../src/lib/broker';

describe('broker', () => {
  it('should work', () => {
    expect(broker()).toEqual('broker');
  });
});
