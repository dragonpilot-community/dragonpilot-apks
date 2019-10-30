# Installation
Make sure all the packages are installed
```
yarn
```

# Add a new language
see supported language tags: http://www.apps4android.org/?p=3695

For example, add **zh_TW**(Chinese Traditional) translation:

Create a folder in js/locales/ with an empty po file.
```bash
yarn add-locale zh_TW
```

Extract all strings to the po file:
```bash
yarn extract zh_TW
``` 

Open you favorite editor and edit the messages.po file:
```bash
vi js/locales/zh_TW/messages.po
```

Compile it for release (generate a message.js file), always compile it if changes are made to messages.po:
```bash
yarn compile zh_TW
```

Add the language to js/utils/i18n.js
```javascript
// import the messages.js
import zhTW from '../locales/zh_TW/messages.js';
// ...

// define which locale use which translate file
let supportedLanguage = {
    // ...
    'zh_TW': zhTW,
};
// ...
```

Build the APK and try it on your EON!