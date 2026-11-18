import i18n from '../translation/i18n';
import { MANDI_ROUTES } from '../constants/mandiRoutes';
import { CROP_NAMES } from './voiceCommandData';
import { COMMANDS, commandById, matchVoiceIntent } from './voiceIntentMatcher';

/*
|--------------------------------------------------------------------------
| VOICE COMMAND RESOLVER
|--------------------------------------------------------------------------
|
| Spoken text (any app language, any script) -> what the assistant does.
| Matching lives in ./voiceIntentMatcher (words in ./voiceCommandData);
| this file only adds routes and translated messages.
|
| Result types: empty | cancel | greeting | unknown | navigate
| navigate.confident === false: a long question that also names a screen;
| the assistant lets AI decide between opening it and answering.
|
*/

export { normalizeSpeech } from './voiceParsers';

export function navigateCommand(id, extra = {}) {
  const command = commandById(id);
  if (!command) return null;

  return {
    type: 'navigate',
    id: command.id,
    route: command.route,
    message: i18n.t(command.message),
    confident: true,
    ...extra,
  };
}

function cropPriceCommand(cropId) {
  const fallback =
    CROP_NAMES[cropId] || cropId.charAt(0).toUpperCase() + cropId.slice(1);

  return {
    type: 'navigate',
    id: `mandi-${cropId}`,
    route: MANDI_ROUTES.CROP,
    params: { cropId, cropName: fallback },
    confident: true,
    message: i18n.t('voice.open_crop_prices', {
      crop: i18n.exists(`crops.${cropId}`) ? i18n.t(`crops.${cropId}`) : fallback,
    }),
  };
}

export function resolveVoiceCommand(transcript = '') {
  const match = matchVoiceIntent(transcript);

  switch (match.type) {
    case 'crop-price':
      return cropPriceCommand(match.cropId);
    case 'command':
      return navigateCommand(match.id, { confident: match.confident });
    case 'greeting':
      return { type: 'greeting', response: i18n.t('voice.greeting') };
    case 'unknown':
      return { type: 'unknown', transcript };
    default:
      return { type: match.type };
  }
}

export default COMMANDS;
