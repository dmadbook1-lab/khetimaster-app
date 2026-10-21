import {resolveVoiceCommand} from '../src/utils/voiceCommandResolver';

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
});
