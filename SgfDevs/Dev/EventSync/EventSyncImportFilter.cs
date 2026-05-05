#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using SgfDevs.Dev.EventSync.Sessionize;

namespace SgfDevs.Dev.EventSync;

public class EventSyncImportFilter
{
    public IReadOnlyList<ImportedEventPlan> GetUpcomingEvents(IEnumerable<ImportedEventPlan> eventPlans, DateTime nowLocal)
    {
        return eventPlans
            .Where(plan => plan.StartsAtLocal >= nowLocal)
            .OrderBy(plan => plan.StartsAtLocal)
            .ToList();
    }
}
