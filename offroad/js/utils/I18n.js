import { NativeModules } from 'react-native'
import { setupI18n } from "@lingui/core"
import enUS from '../locales/en_US/messages.js';
import zhTW from '../locales/zh_TW/messages.js';
import zhCN from '../locales/zh_CN/messages.js';
import frFR from '../locales/fr_FR/messages.js';
import jaJP from '../locales/ja_JP/messages.js';

import moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/zh-tw';

// define which locale use which translate file
let supportedLanguage = {
    'en_US': enUS,
    'zh_TW': zhTW,
    'zh_CN': zhCN,
    'fr_FR': frFR,
    'ja_JP': jaJP,
};

const locale = NativeModules.I18nManager.localeIdentifier; // zh_TW_#Hant, zh_CN_#Hans

export const i18n = setupI18n();
i18n.load(supportedLanguage);
// if the locale is defined, activate it
if (supportedLanguage.hasOwnProperty(locale)) {
    i18n.activate(locale);
    moment.locale(locale);
} else {
    i18n.activate('en_US');
    moment.locale('en_US')
}

export default i18n