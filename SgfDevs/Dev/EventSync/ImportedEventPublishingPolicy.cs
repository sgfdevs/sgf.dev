using System;

namespace SgfDevs.Dev.EventSync;

public class ImportedEventPublishingPolicy
{
    public bool ShouldBePublished(DateTime eventStartsAtLocal, DateTime nowLocal) => eventStartsAtLocal.AddHours(1) > nowLocal;

    public DateTime GetUnpublishAt(DateTime eventStartsAtLocal) => eventStartsAtLocal.AddHours(1);
}
