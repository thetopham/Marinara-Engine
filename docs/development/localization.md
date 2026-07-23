# UI localization

Marinara Engine localizes application interface text while leaving model prompts, user content, generated chat
content, identifiers, protocol values, file paths, and persisted machine values unchanged.

English is the canonical locale and the runtime fallback. A missing community translation therefore displays the
English text instead of a translation key or an empty control.

## Locale files

Client locale files live in:

```text
packages/client/src/localization/locales/
```

Each BCP-47 locale uses one JSON file named after its canonical locale, such as `pl.json`, `ko.json`, or
`pt-BR.json`. Vite discovers these files automatically, so adding a locale does not require editing a registry.
English loads with the application; other locales load only when selected.

```json
{
  "_meta": {
    "locale": "pl",
    "direction": "ltr"
  },
  "chat.input.placeholder": "Napisz odpowiedź…",
  "common.actions.save": "Zapisz"
}
```

Use semantic keys organized by interface area. Do not use an English sentence as the key because ordinary copy
editing would then invalidate every translation.

## Adding or updating a translation

1. Copy `en.json` to a canonically named locale file.
2. Keep `_meta.locale` equal to the filename and set `_meta.direction` to `ltr` or `rtl`.
3. Translate only the values. Do not change semantic keys.
4. Preserve interpolation tokens such as `{{name}}` and rich-text tags such as `<strong>`.
5. Keep translation keys alphabetically sorted.
6. Run `pnpm localization:check`.

Community locales may temporarily omit keys while a feature-area translation is being prepared. Missing keys fall
back to English. Unknown keys, empty translations, malformed metadata, and changed interpolation tokens fail the
localization check.

Machine-produced translations are welcome as an initial draft when the PR identifies them as such. A fluent speaker
should review terminology, tone, truncation, and mobile layout before the locale is described as reviewed.

## Using translations in client code

React components use `useTranslation`:

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
return <button>{t("common.actions.save")}</button>;
```

Store translation keys rather than translated values in module-level UI configuration. This keeps language changes
live without a page reload. Non-React client helpers can use the exported `translate` function from
`packages/client/src/localization/i18n.ts`.

Translate visible text, including labels, placeholders, tooltips, accessibility names, alternative text, loading and
empty states, toasts, confirmations, and static tutorials. Do not route prompts or authored content through the UI
translator.

## Downloadable Agent interfaces

Engine-owned Agent screens use the Engine locale files. Downloadable capability clients own their translated copy in
the Marinara-Agents repository.

Every capability custom element receives the selected locale through both its `lang` and `dir` attributes and:

```ts
capabilityProps.localization = {
  locale: "pl",
  direction: "ltr",
};
```

The existing `marinara-capability-props` event fires when the locale changes. Package UI should select its bundled
locale, fall back to package English, and rerender after that event.
