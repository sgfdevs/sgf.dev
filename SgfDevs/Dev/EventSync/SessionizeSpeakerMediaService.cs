#nullable enable
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SgfDevs.Dev.EventSync.Sessionize;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;

namespace SgfDevs.Dev.EventSync;

public class SessionizeSpeakerMediaService
{
    private const string ImportedSpeakersFolderName = "Imported Speakers";
    private const string EventsFolderName = "Events";
    private const int SystemUserId = -1;

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMediaService _mediaService;
    private readonly MediaFileManager _mediaFileManager;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly IContentTypeBaseServiceProvider _contentTypeBaseServiceProvider;
    private readonly MediaUrlGeneratorCollection _mediaUrlGeneratorCollection;
    private readonly ILogger<SessionizeSpeakerMediaService> _logger;

    public SessionizeSpeakerMediaService(
        IHttpClientFactory httpClientFactory,
        IMediaService mediaService,
        MediaFileManager mediaFileManager,
        IShortStringHelper shortStringHelper,
        IContentTypeBaseServiceProvider contentTypeBaseServiceProvider,
        MediaUrlGeneratorCollection mediaUrlGeneratorCollection,
        ILogger<SessionizeSpeakerMediaService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _mediaService = mediaService;
        _mediaFileManager = mediaFileManager;
        _shortStringHelper = shortStringHelper;
        _contentTypeBaseServiceProvider = contentTypeBaseServiceProvider;
        _mediaUrlGeneratorCollection = mediaUrlGeneratorCollection;
        _logger = logger;
    }

    public async Task<ImportedPresenterPlan> ImportProfileImageAsync(ImportedPresenterPlan presenter, CancellationToken cancellationToken)
    {
        if (presenter.MatchedMemberKey.HasValue || string.IsNullOrWhiteSpace(presenter.ProfileImageUrl))
        {
            return presenter;
        }

        try
        {
            using var stream = await DownloadImageAsync(presenter.ProfileImageUrl, cancellationToken);
            if (stream == null)
            {
                return presenter;
            }

            var importedSpeakersFolder = GetOrCreateImportedSpeakersFolder();
            var media = GetOrCreateSpeakerImage(importedSpeakersFolder.Id, presenter);
            var profileImageUdi = new GuidUdi(Constants.UdiEntityType.Media, media.Key).ToString();

            if (media.HasIdentity)
            {
                try
                {
                    using var existingStream = _mediaFileManager.GetFile(media, out _);
                    if (ReferenceEquals(existingStream, Stream.Null) == false &&
                        StreamsHaveEqualContent(stream, existingStream))
                    {
                        return presenter with { ProfileImageUdi = profileImageUdi };
                    }
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Failed to compare the existing Sessionize speaker image for {SpeakerName} ({SpeakerId}); retaining it.",
                        presenter.Name,
                        presenter.SessionizeSpeakerId);
                    return presenter with { ProfileImageUdi = profileImageUdi };
                }
            }

            var fileName = BuildFileName(presenter);

            media.SetValue(
                _mediaFileManager,
                _mediaUrlGeneratorCollection,
                _shortStringHelper,
                _contentTypeBaseServiceProvider,
                Constants.Conventions.Media.File,
                fileName,
                stream);

            _mediaService.Save(media, SystemUserId);

            return presenter with
            {
                ProfileImageUdi = profileImageUdi
            };
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Failed to import Sessionize speaker image for {SpeakerName} ({SpeakerId}).", presenter.Name, presenter.SessionizeSpeakerId);
            return presenter;
        }
    }

    private async Task<MemoryStream?> DownloadImageAsync(string imageUrl, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        using var response = await client.GetAsync(imageUrl, cancellationToken);
        if (response.IsSuccessStatusCode == false)
        {
            _logger.LogInformation("Skipping speaker image import because {ImageUrl} returned status code {StatusCode}.", imageUrl, response.StatusCode);
            return null;
        }

        await using var sourceStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var memoryStream = new MemoryStream();
        await sourceStream.CopyToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;
        return memoryStream;
    }

    private IMedia GetOrCreateImportedSpeakersFolder()
    {
        var eventsFolder = _mediaService.GetRootMedia().FirstOrDefault(media => media.Name.InvariantEquals(EventsFolderName))
            ?? CreateFolder(EventsFolderName, Constants.System.Root);

        return GetPagedChildren(eventsFolder.Id)
            .FirstOrDefault(media => media.Name.InvariantEquals(ImportedSpeakersFolderName))
            ?? CreateFolder(ImportedSpeakersFolderName, eventsFolder.Id);
    }

    private IMedia CreateFolder(string name, int parentId)
    {
        var folder = _mediaService.CreateMedia(name, parentId, Constants.Conventions.MediaTypes.Folder, SystemUserId);
        _mediaService.Save(folder, SystemUserId);
        return folder;
    }

    private IMedia GetOrCreateSpeakerImage(int folderId, ImportedPresenterPlan presenter)
    {
        var mediaName = BuildMediaName(presenter);

        return GetPagedChildren(folderId)
            .FirstOrDefault(media => media.Name.InvariantEquals(mediaName))
            ?? _mediaService.CreateMedia(mediaName, folderId, Constants.Conventions.MediaTypes.Image, SystemUserId);
    }

    private IReadOnlyList<IMedia> GetPagedChildren(int parentId)
    {
        var children = new List<IMedia>();
        long pageIndex = 0;
        const int pageSize = 200;
        long totalRecords;

        do
        {
            var page = _mediaService.GetPagedChildren(parentId, pageIndex, pageSize, out totalRecords).ToList();
            children.AddRange(page);
            pageIndex++;
        }
        while (children.Count < totalRecords);

        return children;
    }

    private static string BuildMediaName(ImportedPresenterPlan presenter)
    {
        return string.IsNullOrWhiteSpace(presenter.SessionizeSpeakerId)
            ? presenter.Name
            : $"Sessionize Speaker {presenter.SessionizeSpeakerId}";
    }

    private static string BuildFileName(ImportedPresenterPlan presenter)
    {
        var extension = ".jpg";
        if (Uri.TryCreate(presenter.ProfileImageUrl, UriKind.Absolute, out var imageUri))
        {
            var pathExtension = Path.GetExtension(imageUri.AbsolutePath);
            if (string.IsNullOrWhiteSpace(pathExtension) == false)
            {
                extension = pathExtension;
            }
        }

        var baseName = string.IsNullOrWhiteSpace(presenter.SessionizeSpeakerId)
            ? presenter.Name.Replace(' ', '-').ToLowerInvariant()
            : presenter.SessionizeSpeakerId;

        return $"{baseName}{extension}";
    }

    internal static bool StreamsHaveEqualContent(Stream first, Stream second)
    {
        var firstPosition = first.CanSeek ? first.Position : 0;
        var secondPosition = second.CanSeek ? second.Position : 0;

        try
        {
            if (first.CanSeek)
            {
                first.Position = 0;
            }

            if (second.CanSeek)
            {
                second.Position = 0;
            }

            var firstHash = SHA256.HashData(first);
            var secondHash = SHA256.HashData(second);
            return firstHash.AsSpan().SequenceEqual(secondHash);
        }
        finally
        {
            if (first.CanSeek)
            {
                first.Position = firstPosition;
            }

            if (second.CanSeek)
            {
                second.Position = secondPosition;
            }
        }
    }
}
