using System.Collections.Generic;

namespace SGFDevs.ViewModels;

public class DirectoryResult
{
    public string Name { get; set; }
    public string Location { get; set; }
    public string Image { get; set; }
    public string Url { get; set; }
    public IEnumerable<string> Tags { get; set; }
}
