const NextI18Next = require("next-i18next").default;

const NextI18NextInstance = new NextI18Next({
  strictMode: false,
  defaultLanguage: "en",
  otherLanguages: ["de", "es"],
  localeSubpaths: {
    de: "de",
    es: "es",
    en: "en",
  },
});

module.exports = NextI18NextInstance;
