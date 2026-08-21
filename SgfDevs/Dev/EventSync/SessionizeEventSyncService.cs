#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SgfDevs.Dev;
using SgfDevs.Dev.EventSync.Meetup;
using SgfDevs.Dev.EventSync.Sessionize;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace SgfDevs.Dev.EventSync;

public class SessionizeEventSyncService
{
    private const string EventAlias = "event";
    private const string EventsAlias = "events";
    private const string GroupAlias = "group";
    private const string PresentationAlias = "presentation";
    private const string DatePropertyAlias = "date";
    private const string DescriptionPropertyAlias = "description";
    private const string GroupPropertyAlias = "group";
    private const string MeetupUrlPropertyAlias = "meetupURL";
    private const string PresentersPropertyAlias = "presenters";
    private const string SessionizeIdPropertyAlias = "sessionizeId";
    private const int SystemUserId = -1;

    private readonly SessionizeApiClient _sessionizeApiClient;
    private readonly MeetupApiClient _meetupApiClient;
    private readonly EventSyncImportFilter _eventSyncImportFilter;
    private readonly PresenterMemberMatcher _presenterMemberMatcher;
    private readonly SessionizeSyncPlanner _planner;
    private readonly MeetupEventMatcher _meetupEventMatcher;
    private readonly ImportedPresenterBlockBuilder _presenterBlockBuilder;
    private readonly SessionizeSpeakerMediaService _speakerMediaService;
    private readonly IContentService _contentService;
    private readonly IOptions<EventSyncOptions> _options;
    private readonly ILogger<SessionizeEventSyncService> _logger;

    public SessionizeEventSyncService(
        SessionizeApiClient sessionizeApiClient,
        MeetupApiClient meetupApiClient,
        EventSyncImportFilter eventSyncImportFilter,
        PresenterMemberMatcher presenterMemberMatcher,
        SessionizeSyncPlanner planner,
        MeetupEventMatcher meetupEventMatcher,
        ImportedPresenterBlockBuilder presenterBlockBuilder,
        SessionizeSpeakerMediaService speakerMediaService,
        IContentService contentService,
        IOptions<EventSyncOptions> options,
        ILogger<SessionizeEventSyncService> logger)
    {
        _sessionizeApiClient = sessionizeApiClient;
        _meetupApiClient = meetupApiClient;
        _eventSyncImportFilter = eventSyncImportFilter;
        _presenterMemberMatcher = presenterMemberMatcher;
        _planner = planner;
        _meetupEventMatcher = meetupEventMatcher;
        _presenterBlockBuilder = presenterBlockBuilder;
        _speakerMediaService = speakerMediaService;
        _contentService = contentService;
        _options = options;
        _logger = logger;
    }

    public async Task SyncAsync(CancellationToken cancellationToken = default)
    {
        if (_sessionizeApiClient.IsConfigured == false)
        {
            _logger.LogInformation("Skipping Sessionize sync because SGFDevs:Sessionize:BaseUrl is not configured.");
            return;
        }

        var timeZone = EventSyncTimeZoneResolver.Resolve(_options.Value.EventTimeZoneId);
        var nowLocal = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone).DateTime;
        var sessionGroups = await _sessionizeApiClient.GetSessionsAsync(cancellationToken);
        var speakers = await _sessionizeApiClient.GetSpeakersAsync(cancellationToken);
        var eventPlans = _eventSyncImportFilter.GetUpcomingEvents(
            _planner.BuildEventPlans(sessionGroups, speakers, timeZone),
            nowLocal);

        if (eventPlans.Count == 0)
        {
            _logger.LogInformation("No upcoming accepted Sessionize sessions were found to import.");
            return;
        }

        IReadOnlyList<MeetupApiEventDto> meetupEvents = [];

        if (_meetupApiClient.IsConfigured == false)
        {
            _logger.LogInformation("Skipping meetup URL resolution because meetup API credentials are not fully configured.");
        }
        else
        {
            meetupEvents = await _meetupApiClient.GetEventsAsync(cancellationToken);
        }

        var references = GetContentReferences();
        var speakerImageUdis = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        var existingEvents = GetChildren(references.EventsContainerId)
            .Where(content => string.Equals(content.ContentType.Alias, EventAlias, StringComparison.Ordinal))
            .ToList();
        foreach (var eventPlan in eventPlans)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var eventContent = GetOrCreateEvent(existingEvents, references.EventsContainerId, eventPlan);
            SaveEventContent(eventContent, eventPlan);
            SaveAndPublishContent(eventContent, "event", clearSchedule: true);

            var existingPresentations = GetChildren(eventContent.Id)
                .Where(content => string.Equals(content.ContentType.Alias, PresentationAlias, StringComparison.Ordinal))
                .ToList();

            foreach (var presentationPlan in eventPlan.Presentations)
            {
                var matchedPresenters = _presenterMemberMatcher.MatchPresenters(presentationPlan.Presenters);
                var presentersWithImages = await ImportPresenterImagesAsync(matchedPresenters, speakerImageUdis, cancellationToken);
                var enrichedPresentationPlan = presentationPlan with { Presenters = presentersWithImages };
                var meetupMatch = _meetupEventMatcher.FindMatch(meetupEvents, presentationPlan.Title, eventPlan.StartsAtLocal);

                if (meetupMatch == null)
                {
                    _logger.LogInformation(
                        "No meetup event match found for Sessionize session {SessionizeId} ({Title}).",
                        presentationPlan.SessionizeId,
                        presentationPlan.Title);
                }

                var presentationContent = GetOrCreatePresentation(existingPresentations, eventContent.Id, presentationPlan);
                SavePresentationContent(presentationContent, references.SpringfieldDevsGroupKey, enrichedPresentationPlan, meetupMatch?.EventUrl);
                SaveAndPublishContent(presentationContent, "presentation");
            }
        }
    }

    private (int EventsContainerId, Guid SpringfieldDevsGroupKey) GetContentReferences()
    {
        var home = _contentService.GetRootContent()
            .FirstOrDefault(content => string.Equals(content.ContentType.Alias, "home", StringComparison.Ordinal))
            ?? throw new InvalidOperationException("Could not locate the Home node.");

        var homeChildren = GetChildren(home.Id);
        var eventsContainer = homeChildren
            .FirstOrDefault(content => string.Equals(content.ContentType.Alias, EventsAlias, StringComparison.Ordinal))
            ?? throw new InvalidOperationException("Could not locate the Events container under Home.");

        var groupsContainer = homeChildren
            .FirstOrDefault(content => string.Equals(content.ContentType.Alias, "groups", StringComparison.Ordinal))
            ?? throw new InvalidOperationException("Could not locate the Groups container under Home.");

        var springfieldDevsGroup = GetChildren(groupsContainer.Id)
            .FirstOrDefault(group => string.Equals(group.ContentType.Alias, GroupAlias, StringComparison.Ordinal) && group.Name.InvariantEquals("Springfield Devs"))
            ?? throw new InvalidOperationException("Could not locate the Springfield Devs group node.");

        return (eventsContainer.Id, springfieldDevsGroup.Key);
    }

    private IContent GetOrCreateEvent(List<IContent> existingEvents, int eventsContainerId, ImportedEventPlan eventPlan)
    {
        var eventContent = existingEvents.FirstOrDefault(content => content.GetValue<DateTime>(DatePropertyAlias).Date == eventPlan.StartsAtLocal.Date);
        if (eventContent != null)
        {
            return eventContent;
        }

        eventContent = _contentService.Create(eventPlan.Name, eventsContainerId, EventAlias, SystemUserId);
        existingEvents.Add(eventContent);
        _logger.LogInformation("Created event node {EventName} for {EventDate}.", eventPlan.Name, eventPlan.StartsAtLocal);
        return eventContent;
    }

    private void SaveEventContent(IContent eventContent, ImportedEventPlan eventPlan)
    {
        eventContent.Name = eventPlan.Name;
        eventContent.SetValue(DatePropertyAlias, eventPlan.StartsAtLocal);
    }

    private IContent GetOrCreatePresentation(List<IContent> existingPresentations, int eventId, ImportedPresentationPlan presentationPlan)
    {
        var presentationContent = existingPresentations.FirstOrDefault(content =>
            string.Equals(content.GetValue(SessionizeIdPropertyAlias)?.ToString(), presentationPlan.SessionizeId, StringComparison.OrdinalIgnoreCase));

        presentationContent ??= existingPresentations.FirstOrDefault(content =>
            string.IsNullOrWhiteSpace(content.GetValue(SessionizeIdPropertyAlias)?.ToString()) &&
            string.Equals(MeetupEventMatcher.Normalize(content.Name ?? string.Empty), MeetupEventMatcher.Normalize(presentationPlan.Title), StringComparison.Ordinal));

        if (presentationContent != null)
        {
            return presentationContent;
        }

        presentationContent = _contentService.Create(presentationPlan.Title, eventId, PresentationAlias, SystemUserId);
        existingPresentations.Add(presentationContent);
        _logger.LogInformation("Created presentation node {PresentationTitle} ({SessionizeId}).", presentationPlan.Title, presentationPlan.SessionizeId);
        return presentationContent;
    }

    private void SavePresentationContent(
        IContent presentationContent,
        Guid springfieldDevsGroupKey,
        ImportedPresentationPlan presentationPlan,
        string? meetupUrl)
    {
        presentationContent.Name = presentationPlan.Title;
        presentationContent.SetValue(SessionizeIdPropertyAlias, presentationPlan.SessionizeId);
        presentationContent.SetValue(GroupPropertyAlias, new GuidUdi(Constants.UdiEntityType.Document, springfieldDevsGroupKey).ToString());

        if (string.IsNullOrWhiteSpace(presentationPlan.Description) == false)
        {
            presentationContent.SetValue(DescriptionPropertyAlias, presentationPlan.Description);
        }

        if (string.IsNullOrWhiteSpace(meetupUrl) == false)
        {
            presentationContent.SetValue(MeetupUrlPropertyAlias, meetupUrl);
        }

        presentationContent.SetValue(PresentersPropertyAlias, _presenterBlockBuilder.Build(presentationPlan.Presenters));
    }

    private async Task<IReadOnlyList<ImportedPresenterPlan>> ImportPresenterImagesAsync(
        IReadOnlyList<ImportedPresenterPlan> presenters,
        Dictionary<string, string?> speakerImageUdis,
        CancellationToken cancellationToken)
    {
        var enrichedPresenters = new List<ImportedPresenterPlan>(presenters.Count);

        foreach (var presenter in presenters)
        {
            if (string.IsNullOrWhiteSpace(presenter.ProfileImageUrl) || string.IsNullOrWhiteSpace(presenter.SessionizeSpeakerId))
            {
                enrichedPresenters.Add(presenter);
                continue;
            }

            if (speakerImageUdis.TryGetValue(presenter.SessionizeSpeakerId, out var existingUdi))
            {
                enrichedPresenters.Add(presenter with { ProfileImageUdi = existingUdi });
                continue;
            }

            var enrichedPresenter = await _speakerMediaService.ImportProfileImageAsync(presenter, cancellationToken);
            speakerImageUdis[presenter.SessionizeSpeakerId] = enrichedPresenter.ProfileImageUdi;
            enrichedPresenters.Add(enrichedPresenter);
        }

        return enrichedPresenters;
    }

    private void SaveAndPublishContent(IContent content, string contentKind, bool clearSchedule = false)
    {
        if (content.IsDirty() == false && content.IsCultureEdited(null!) == false)
        {
            return;
        }

        if (clearSchedule && content.HasIdentity)
        {
            _contentService.PersistContentSchedule(content, new ContentScheduleCollection());
        }

        var publishResult = _contentService.SaveAndPublish(content, [], SystemUserId);
        if (publishResult.Success)
        {
            _logger.LogInformation(
                "Saved and published {ContentKind} {ContentName} with result {PublishResult}.",
                contentKind,
                content.Name,
                publishResult.Result);
            return;
        }

        throw new InvalidOperationException(
            $"Failed to save and publish {contentKind} {content.Name}. Publish result was {publishResult.Result}.");
    }

    private IReadOnlyList<IContent> GetChildren(int parentId)
    {
        var children = new List<IContent>();
        long pageIndex = 0;
        const int pageSize = 200;
        long totalRecords;

        do
        {
            var page = _contentService.GetPagedChildren(parentId, pageIndex, pageSize, out totalRecords, null, null, null, false).ToList();
            children.AddRange(page);
            pageIndex++;
        }
        while (children.Count < totalRecords);

        return children;
    }
}
