import { createIntl } from "react-intl/server";

import ru from "./ru.json";
import type { Text } from "../data/wiki";

// UI strings live in one ICU message file per locale; game text comes from the wiki data as `{ ru, en? }`.
// Only Russian is published now; English is a new message file plus an `en` entry here.
const messages = { ru };

export type Locale = keyof typeof messages;
export const locales = Object.keys(messages) as Locale[];

export function isLocale(lang: string): lang is Locale {
  return lang in messages;
}

export function getIntl(lang: string) {
  if (!isLocale(lang)) throw new Error(`unsupported locale "${lang}"`);
  return createIntl({ locale: lang, messages: messages[lang] });
}

export function tr(text: Text, lang: string) {
  return text[lang as keyof Text] ?? text.ru;
}
