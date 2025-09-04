## 📊 Stakeholder Matrix

| Stakeholder       | Interest | Influence | Description                                                             |
| ----------------- | -------- | --------- | ----------------------------------------------------------------------- |
| Logistics Manager | High     | High      | Needs overview of entire fleet, routes, status, and utilization.        |
| Drivers           | Medium   | Medium    | Are tracked, also provide status updates (arrival, departure).          |
| Warehouse Staff   | High     | Medium    | Works with dock information, coordinates loading/unloading.             |
| Customers         | Medium   | Low       | Indirectly interested: delivery status, transparency.                   |
| IT/DevOps         | Low      | Medium    | Responsible for running the app.                                        |
| Management        | Medium   | High      | Interested in efficiency and cost optimization.                         |

---

## 🧩 User Stories

- **As a Logistics Manager**, I want to see a map of all active trucks so that I always have an overview of my fleet.  
- **As a Driver**, I want my status (at dock, en route, unloading) to update automatically so I don’t have to report manually.  
- **As Warehouse Staff**, I want to assign docks to trucks to coordinate the loading process.  
- **As a Logistics Manager**, I want to see information about a truck’s cargo to detect bottlenecks early.  
- **As Warehouse Staff**, I want to see in real time when a truck arrives at the yard so I can plan resources.  
- **As Management**, I want reports about utilization & efficiency so I can make strategic decisions.  

---

## 📦 Task Packages (MVP)

### Epic 1: Map UI with Real-Time Data

- [ ] Integrate Mapbox/Leaflet into the web UI  
- [ ] Display truck locations in real time (e.g., via WebSocket simulation)  
- [ ] Display branches (yards) on the map  

### Epic 2: Yard & Docks

- [ ] Click on yard opens detail view  
- [ ] Show docks and their status (free, occupied, loading)  
- [ ] Assign a truck to a dock  

### Epic 3: Truck Details

- [ ] Show cargo info (dummy data)  
- [ ] Show status (en route, at dock, unloading, ready to depart)  
- [ ] Timeline of recent actions  

### Epic 4: Real-Time Simulation

- [ ] Truck moves from A to B (coordinate simulation)  
- [ ] Status updates during trip / at dock  
- [ ] Loading/unloading as animation or status change  
