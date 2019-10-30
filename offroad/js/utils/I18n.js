import { NativeModules } from 'react-native'
import { setupI18n } from "@lingui/core"
import en from '../locales/en/messages.js';
import zhTW from '../locales/zh_TW/messages.js';
import zhCN from '../locales/zh_CN/messages.js';

// define which locale use which translate file
let supportedLanguage = {
    'en': en,
    'zh_TW': zhTW,
    'zh_CN': zhCN,
};

const locale = NativeModules.I18nManager.localeIdentifier; // zh_TW_#Hant, zh_CN_#Hans

export const i18n = setupI18n();
i18n.load(supportedLanguage);
// if the locale is defined, activate it
if (supportedLanguage.hasOwnProperty(locale)) {
    i18n.activate(locale);
} else {
    i18n.activate('en');
}

export default i18n