process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

describe("Auth Routes", () => {

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should not allow duplicate registration", async () => {
    await User.create({
      name: "Test",
      email: "test@example.com",
      password: "hashed"
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test",
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(400);
  });

  it("should login successfully", async () => {
    const hashed = await bcrypt.hash("password123", 10);

    await User.create({
      name: "Test",
      email: "test@example.com",
      password: hashed
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should reject invalid login", async () => {
    const hashed = await bcrypt.hash("password123", 10);

    await User.create({
      name: "Test",
      email: "test@example.com",
      password: hashed
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(400);
  });

  it("should access protected route with token", async () => {
    const user = await User.create({
      name: "Test",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10)
    });

    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET || "testsecret"
    );

    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("x-auth-token", token)
      .send({ name: "Updated Name" });

    expect(res.statusCode).toBe(200);
  });

});