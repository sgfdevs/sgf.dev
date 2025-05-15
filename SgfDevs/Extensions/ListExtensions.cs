using System;
using System.Collections.Generic;

namespace SgfDevs.Extensions;

public static class ListExtensions
{
    public static List<T> GetDailyRandomItems<T>(this List<T> list, int n)
    {
        var now = DateTime.Now;
        var seed = now.Year * 10000 + now.Month * 100 + now.Day;
        var rng = new Random(seed);

        var take = Math.Min(n, list.Count);
        var result = new List<T>(take);

        var listCopy = new List<T>(list);

        for (var i = 0; i < take; i++)
        {
            var randomIndex = rng.Next(i, listCopy.Count);

            result.Add(listCopy[randomIndex]);
            listCopy.RemoveAt(randomIndex);
        }

        return result;
    }
}
