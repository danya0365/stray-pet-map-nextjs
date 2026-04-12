export type AdoptionRequestStatus = "pending" | "approved" | "rejected";

export interface AdoptionRequest {
  id: string;
  petPostId: string;
  requesterProfileId: string;
  message: string | null;
  contactPhone: string | null;
  contactLineId: string | null;
  status: AdoptionRequestStatus;
  createdAt: string;
}

export interface CreateAdoptionRequestPayload {
  petPostId: string;
  message?: string;
  contactPhone?: string;
  contactLineId?: string;
}

export interface IAdoptionRequestRepository {
  create(payload: CreateAdoptionRequestPayload): Promise<AdoptionRequest>;
  getByPostId(petPostId: string): Promise<AdoptionRequest[]>;
  getMyRequests(): Promise<AdoptionRequest[]>;
  hasRequested(petPostId: string): Promise<boolean>;
}
