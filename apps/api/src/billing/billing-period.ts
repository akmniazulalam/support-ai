export interface BillingPeriod {
  start: Date;
  end: Date;
}

export function getUtcCalendarMonthPeriod(
  referenceDate: Date = new Date(),
): BillingPeriod {
  const start = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() + 1,
      1,
    ),
  );

  return { start, end };
}
