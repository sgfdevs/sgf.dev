#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using SgfDevs.Dev.EventSync.Sessionize;
using Umbraco.Cms.Core.Services;

namespace SgfDevs.Dev.EventSync;

public class ImportedPresenterBlockBuilder
{
    private const string NonMemberPresenterAlias = "nonMemberPresenter";

    private readonly IContentTypeService? _contentTypeService;
    private readonly Guid? _nonMemberPresenterTypeKey;

    public ImportedPresenterBlockBuilder(IContentTypeService contentTypeService)
    {
        _contentTypeService = contentTypeService;
    }

    internal ImportedPresenterBlockBuilder(Guid nonMemberPresenterTypeKey)
    {
        _nonMemberPresenterTypeKey = nonMemberPresenterTypeKey;
    }

    public string Build(IReadOnlyList<ImportedPresenterPlan> presenters)
    {
        if (presenters.Count == 0)
        {
            return string.Empty;
        }

        var nonMemberPresenterTypeKey = _nonMemberPresenterTypeKey
            ?? _contentTypeService?.Get(NonMemberPresenterAlias)?.Key
            ?? throw new InvalidOperationException($"Could not find content type '{NonMemberPresenterAlias}'.");

        var blocks = presenters.Select(presenter =>
        {
            var key = Guid.NewGuid();

            return new
            {
                key,
                contentData = new
                {
                    contentTypeKey = nonMemberPresenterTypeKey,
                    key,
                    values = new object[]
                    {
                        new
                        {
                            alias = "presenterName",
                            culture = (string?)null,
                            editorAlias = (string?)null,
                            segment = (string?)null,
                            value = presenter.Name
                        },
                        new
                        {
                            alias = "profileImage",
                            culture = (string?)null,
                            editorAlias = (string?)null,
                            segment = (string?)null,
                            value = presenter.ProfileImageUdi ?? string.Empty
                        }
                    }
                }
            };
        }).ToList();

        var payload = new
        {
            contentData = blocks.Select(block => block.contentData).ToList(),
            settingsData = Array.Empty<object>(),
            expose = blocks.Select(block => new
            {
                contentKey = block.key,
                culture = (string?)null,
                segment = (string?)null
            }).ToList(),
            Layout = new Dictionary<string, object>
            {
                ["Umbraco.BlockList"] = blocks.Select(block => new
                {
                    contentKey = block.key,
                    contentUdi = (string?)null,
                    settingsKey = (Guid?)null,
                    settingsUdi = (string?)null
                }).ToList()
            }
        };

        return JsonSerializer.Serialize(payload);
    }
}
