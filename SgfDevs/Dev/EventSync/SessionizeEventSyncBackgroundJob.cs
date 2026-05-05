#nullable enable
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Sync;
using Umbraco.Cms.Infrastructure.BackgroundJobs;

namespace SgfDevs.Dev.EventSync;

public class SessionizeEventSyncBackgroundJob : IRecurringBackgroundJob
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<SessionizeEventSyncBackgroundJob> _logger;

    public SessionizeEventSyncBackgroundJob(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<SessionizeEventSyncBackgroundJob> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    public TimeSpan Period => TimeSpan.FromHours(2);
    public TimeSpan Delay => TimeSpan.FromMinutes(1);
    public ServerRole[] ServerRoles => [ServerRole.Single, ServerRole.SchedulingPublisher];

    public event EventHandler? PeriodChanged
    {
        add { }
        remove { }
    }

    public async Task RunJobAsync()
    {
        _logger.LogInformation("Starting Sessionize event sync job.");

        using var scope = _serviceScopeFactory.CreateScope();
        var syncService = scope.ServiceProvider.GetRequiredService<SessionizeEventSyncService>();
        await syncService.SyncAsync();
    }
}
