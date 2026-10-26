# Business rules

- Total = sum of `amount_cents`. Percent of zero total = 0 (never NaN).
- "Today"/"this month"/week boundaries use the configured timezone (`VITE_APP_TIMEZONE`, default `Africa/Johannesburg`) via `todayISO()`. Dates are `YYYY-MM-DD` strings; compare as strings.
- Range keys: `today, this_week (Mon–Sun), this_month, last_month, this_year, all_time, custom`. All inclusive of both ends.
- Dashboard cards: Total, Count, Top Category, Top Person follow **all** filters. "Spending Today" and "This Month" use their own fixed window but still honour the category/person filters.
- Names (category/person): trim + collapse whitespace; duplicates compared case-insensitively.
- Delete category/person only when it has zero transactions; otherwise deactivate. Inactive items stay visible for historical transactions and in filters; only active ones are offered in the new-transaction form (plus the current value when editing).
- Rename never changes transaction links (FK by id).
- Amount: positive, ≤ 2 decimals, ≤ R 99,999,999.99; stored as integer cents.
- Currency ZAR only; format `R 1,234.56`.
