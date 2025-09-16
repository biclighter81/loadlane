var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("redis");

var postgres = builder
    .AddPostgres("postgres")
    .WithDataVolume()
    .WithEnvironment("POSTGRES_DB", "loadlane")
    .WithLifetime(ContainerLifetime.Persistent);

var db = postgres.AddDatabase("loadlane-db");

var api = builder
    .AddProject<Projects.Loadlane_Api>("loadlane-api")
    .WithReference(redis)
    .WithReference(db);

builder.AddNpmApp("web", "../Loadlane.Web", "dev")
    .WithReference(api);

builder.Build().Run();
