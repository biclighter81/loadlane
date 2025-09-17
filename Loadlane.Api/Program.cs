using Application.Logging;
using Application.Services;
using Infrastructure.Context;
using Infrastructure.Logging;
using Loadlane.Api.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.AddSignalR();
builder.Services.AddHttpClient();

// Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("client", p => p
        .WithOrigins("null", "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Add Redis distributed cache instead of memory cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("redis");
    // The Aspire connection string will include the password
    options.Configuration = connectionString ?? "localhost:6380,password=loadlane123";
});

// Configuration Options
builder.Services.Configure<MapboxOptions>(builder.Configuration.GetSection("Mapbox"));

// Add Infrastructure Services (includes logging)
builder.Services.AddScoped<ILoggerManager, LoggerManager>();

// Add Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("postgres"))
        .UseSnakeCaseNamingConvention()
);

// Add Application Services
builder.Services.AddScoped<DirectionsService>();
builder.Services.AddScoped<RouteSampler>();

var app = builder.Build();

app.UseCors("client");
app.MapControllers();

// Map Hubs
app.MapHub<TripHub>("/hub/trip");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();
