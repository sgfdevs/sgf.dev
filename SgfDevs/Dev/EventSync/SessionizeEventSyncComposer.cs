using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Infrastructure.BackgroundJobs;

namespace SgfDevs.Dev.EventSync;

public class SessionizeEventSyncComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<SessionizeEventSyncBackgroundJob>();
        builder.Services.AddHostedService<RecurringBackgroundJobHostedService<SessionizeEventSyncBackgroundJob>>();
    }
}
