const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface HealthResponse {
  status: "ok" | "error";
  info: Record<string, { status: string }> | null;
  error: Record<string, { status: string }> | null;
  details: Record<string, { status: string }>;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}
