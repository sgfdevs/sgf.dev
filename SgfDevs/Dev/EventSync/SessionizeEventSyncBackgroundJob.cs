#nullable enable
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Sync;
using Umbraco.Cms.Infrastructure.BackgroundJobs;

namespace SgfDevs.Dev.EventSync;

public class SessionizeEventSyncBackgroundJob : IRecurringBackgroundJob
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly IOptions<EventSyncOptions> _options;
    private readonly ILogger<SessionizeEventSyncBackgroundJob> _logger;

    public SessionizeEventSyncBackgroundJob(
        IServiceScopeFactory serviceScopeFactory,
        IOptions<EventSyncOptions> options,
        ILogger<SessionizeEventSyncBackgroundJob> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _options = options;
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
        if (_options.Value.EventSyncEnabled == false)
        {
            _logger.LogInformation("Skipping Sessionize event sync job because SGFDevs:EventSyncEnabled is false.");
            return;
        }

        _logger.LogInformation("Starting Sessionize event sync job.");

        using var scope = _serviceScopeFactory.CreateScope();
        var syncService = scope.ServiceProvider.GetRequiredService<SessionizeEventSyncService>();
        await syncService.SyncAsync();
    }
}
