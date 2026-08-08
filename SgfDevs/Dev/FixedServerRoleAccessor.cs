using Umbraco.Cms.Core.Sync;

namespace SgfDevs.Dev;

internal sealed class FixedServerRoleAccessor(ServerRole serverRole) : IServerRoleAccessor
{
    public ServerRole CurrentServerRole { get; } = serverRole;
}
