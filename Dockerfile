FROM mcr.microsoft.com/dotnet/sdk:10.0 AS publish
ARG TARGETARCH
WORKDIR /src
COPY SgfDevs/SgfDevs.csproj SgfDevs/
RUN dotnet restore SgfDevs/SgfDevs.csproj --arch $TARGETARCH
COPY SgfDevs/ SgfDevs/
RUN dotnet publish SgfDevs/SgfDevs.csproj -c Release --no-restore --arch $TARGETARCH --self-contained false -o /app/publish \
    && mkdir -p \
        /app/publish/umbraco/Data \
        /app/publish/umbraco/Logs \
        /app/publish/umbraco/TEMP/MediaCache \
    && touch /app/publish/umbraco/Data/Umbraco.sqlite.db

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled-extra AS final
ENV ASPNETCORE_HTTP_PORTS=80
WORKDIR /usr/src/main
COPY --from=publish --chown=$APP_UID:$APP_UID /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "SgfDevs.dll"]
