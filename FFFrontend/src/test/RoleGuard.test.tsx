import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RoleGuard } from "../auth/guards";
import { AuthProvider } from "../auth/AuthProvider";

/**
 * Minimal smoke: render a guarded route without token => redirect to /login
 * We don't mock fetch here; this test verifies tree renders and route exists.
 */
describe("RoleGuard", () => {
  it("renders login redirect when not authenticated", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/login" element={<div>login</div>} />
            <Route element={<RoleGuard allow={["ADMIN"]} />}>
              <Route path="/admin" element={<div>admin</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
    // RoleGuard will render a Navigate; MemoryRouter shows /login content
    expect(await screen.findByText("login")).toBeInTheDocument();
  });
});
