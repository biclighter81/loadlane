export interface CreateCarrierRequest {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateCarrierRequest {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CarrierResponse {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  createdUtc: string;
}