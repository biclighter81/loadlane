# 🚛 Loadlane

**Loadlane** is a real-time fleet management web app, developed for the **R<H>E\HACK Hackathon Event 2025**.  
It enables tracking of trucks on live maps, management of yard docks, and monitoring of loading/unloading in real time — a showcase for next-gen logistics visibility and efficiency.

---

## ✨ Features

- Live map view with trucks and yards
- Yard and dock management (assign trucks to docks)
- Real-time loading/unloading simulation
- Truck details: status, cargo, timeline
- Modern web tech stack with WebSocket-based updates

---

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind + Shadcn + Mapbox/Leaflet
- **Backend**: .NET Core 9 + SignalR
- **Database**: PostgreSQL + Redis (for caching)
- **Other**: Docker, Kubernetes, REST API

---

## 🚀 Setting up dotnet user-secrets

1. Navigate to the `Loadlane.Api` directory:
   ```bash
   cd Loadlane.Api
   ```
2. Initialize user secrets:
   ```bash
   dotnet user-secrets init
   ```
3. Set your Mapbox access token (replace `your_mapbox_access_token` with your actual token):
   ```bash
   dotnet user-secrets set "Mapbox:AccessToken" "your_mapbox_access_token"
   ```
