#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;

namespace SgfDevs.Dev;

public class EventDisplayService
{
    public bool IsCurrentOrUpcoming(DateTime eventDate, DateTime now) => eventDate.AddHours(1) > now;

    public T? GetCurrentOrNextEvent<T>(IEnumerable<T> events, Func<T, DateTime> getDate, DateTime now)
    {
        return events
            .OrderBy(getDate)
            .FirstOrDefault(item => IsCurrentOrUpcoming(getDate(item), now));
    }

    public IReadOnlyList<T> GetCurrentAndUpcomingEvents<T>(IEnumerable<T> events, Func<T, DateTime> getDate, DateTime now)
    {
        return events
            .Where(item => IsCurrentOrUpcoming(getDate(item), now))
            .OrderBy(getDate)
            .ToList();
    }
}
