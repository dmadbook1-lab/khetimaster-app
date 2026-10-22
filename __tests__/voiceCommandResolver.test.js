import { resolveVoiceCommand } from '../src/utils/voiceCommandResolver';

describe('resolveVoiceCommand', () => {
  test.each([
    ['mandi', 'mandi'],
    ['Tractor', 'tractor'],
    ['labour', 'labour'],
    ['doctor', 'doctor'],
    ['crops', 'crop-monitoring'],
    ['nursery', 'nursery'],
    ['profile', 'profile'],
    ['products', 'agri-products'],
    ['schemes', 'government-schemes'],
    ['news', 'knowledge-center'],
  ])('opens the %s destination from one word', (phrase, commandId) => {
    expect(resolveVoiceCommand(phrase)).toMatchObject({
      type: 'navigate',
      id: commandId,
    });
  });

  test('responds to a greeting instead of navigating', () => {
    expect(resolveVoiceCommand('hello')).toMatchObject({
      type: 'greeting',
      response: expect.stringContaining("How's your day going?"),
    });
  });

  test('still resolves full natural-language commands', () => {
    expect(resolveVoiceCommand('Show me the mandi rates')).toMatchObject({
      type: 'navigate',
      id: 'mandi',
    });
  });

  test('opens trade and commodities', () => {
    expect(resolveVoiceCommand('I want to sell my crop')).toMatchObject({
      type: 'navigate',
      id: 'trade',
    });
    expect(resolveVoiceCommand('commodities')).toMatchObject({ id: 'trade' });
  });

  test('opens one crop price page for "<crop> ka bhav"', () => {
    expect(resolveVoiceCommand('pyaz ka bhav batao')).toMatchObject({
      type: 'navigate',
      route: 'CommodityDetail',
      params: { cropId: 'onion' },
    });
    expect(resolveVoiceCommand('cotton price today')).toMatchObject({
      params: { cropId: 'cotton' },
    });
  });

  test('plain mandi words still open the mandi home', () => {
    expect(resolveVoiceCommand('mandi bhav')).toMatchObject({ id: 'mandi' });
  });
});
