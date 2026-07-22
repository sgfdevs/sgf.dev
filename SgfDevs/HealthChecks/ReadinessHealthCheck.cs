using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence;

namespace SgfDevs.HealthChecks;

internal sealed class ReadinessHealthCheck(
    IRuntimeState runtimeState,
    IUmbracoDatabaseFactory databaseFactory) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (runtimeState.Level != RuntimeLevel.Run)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy());
        }

        using var database = databaseFactory.CreateDatabase();
        var result = database.ExecuteScalar<int>("SELECT 1");

        return Task.FromResult(result == 1
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Unhealthy());
    }
}
