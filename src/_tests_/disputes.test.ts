import request from 'supertest';

const baseURL = 'http://localhost:3000/api/disputes';
const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Use valid UUID

describe("Dispute API Tests", () => {
  test("✅ Should insert a new dispute successfully", async () => {
    const response = await request(baseURL).post("/")
      .send({
        user_id: testUserId,
        creditor: "Bank of America",
        agency: "Experian",
        isTest: true // Forces use of supabaseAdmin
      });

    expect(response.status).toBe(201);
    expect(response.body.dispute).toHaveProperty("id");
  });

  test("❌ Should return error for missing fields", async () => {
    const response = await request(baseURL).post("/")
      .send({ user_id: testUserId });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
  });

  test("✅ Should fetch disputes for a specific user", async () => {
    const response = await request(baseURL).get(`/?user_id=${testUserId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.disputes)).toBeTruthy();
  });

  test("❌ Should return error for missing user_id in GET request", async () => {
    const response = await request(baseURL).get("/");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("User ID is required");
  });
});
