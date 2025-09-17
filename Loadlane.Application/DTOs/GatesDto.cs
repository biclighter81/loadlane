namespace Loadlane.Application.DTOs;

public sealed record GatesDto(
    string id,
    int number,
    bool is_active,
    string type,
    string description  
);