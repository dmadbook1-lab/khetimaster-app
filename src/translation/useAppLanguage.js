import { useTranslation } from 'react-i18next';
import { normalizeLanguageCode } from '../utils/languageUtils';

/**
 * Current app language code ('en', 'hi', …); re-renders when it changes.
 * Use it for API calls that take a language (advisory, AI Guru).
 */
export default function useAppLanguage() {
  const { i18n } = useTranslation();
  return normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
}
