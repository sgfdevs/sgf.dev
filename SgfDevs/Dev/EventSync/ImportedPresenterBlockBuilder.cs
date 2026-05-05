#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace SgfDevs.Dev.EventSync;

public class ImportedPresenterBlockBuilder
{
    private static readonly Guid NonMemberPresenterTypeKey = new("5ff3a2c3-9dc3-4131-8f07-99c2c0a38be5");

    public string Build(IReadOnlyList<ImportedPresenterPlan> presenters)
    {
        if (presenters.Count == 0)
        {
            return string.Empty;
        }

        var blocks = presenters.Select(presenter =>
        {
            var key = Guid.NewGuid();

            return new
            {
                key,
                contentData = new
                {
                    contentTypeKey = NonMemberPresenterTypeKey,
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
                            value = string.Empty
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
