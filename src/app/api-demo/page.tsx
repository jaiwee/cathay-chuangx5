"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ApiDemo() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string, method = "GET", body?: any) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(endpoint, options);
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (error) {
      setResponse({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">API Endpoints Demo</h1>
        <p className="text-muted-foreground mb-8">
          Test your API routes by clicking the buttons below
        </p>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* GET Examples */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">GET Requests</h3>
            <div className="space-y-2">
              <Button
                onClick={() => testApi("/api/hello")}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                GET /api/hello
              </Button>
              <Button
                onClick={() => testApi("/api/users")}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                GET /api/users
              </Button>
              <Button
                onClick={() => testApi("/api/users/1")}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                GET /api/users/1
              </Button>
            </div>
          </div>

          {/* POST Examples */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">POST Requests</h3>
            <div className="space-y-2">
              <Button
                onClick={() =>
                  testApi("/api/users", "POST", {
                    name: "Charlie",
                    email: "charlie@example.com",
                  })
                }
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                POST /api/users
              </Button>
              <Button
                onClick={() =>
                  testApi("/api/contact", "POST", {
                    name: "Test User",
                    email: "test@example.com",
                    message: "This is a test message",
                  })
                }
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                POST /api/contact
              </Button>
            </div>
          </div>

          {/* PUT/DELETE Examples */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">PUT/DELETE Requests</h3>
            <div className="space-y-2">
              <Button
                onClick={() =>
                  testApi("/api/users/1", "PUT", {
                    name: "Updated Name",
                  })
                }
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                PUT /api/users/1
              </Button>
              <Button
                onClick={() => testApi("/api/users/1", "DELETE")}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                DELETE /api/users/1
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">API Routes Location</h3>
            <code className="text-sm">src/app/api/</code>
            <ul className="text-sm mt-3 space-y-1 text-muted-foreground">
              <li>• /api/hello/route.ts</li>
              <li>• /api/users/route.ts</li>
              <li>• /api/users/[id]/route.ts</li>
              <li>• /api/contact/route.ts</li>
            </ul>
          </div>
        </div>

        {/* Response Display */}
        {loading && (
          <div className="border rounded-lg p-6 bg-muted/50">
            <p className="text-center">Loading...</p>
          </div>
        )}

        {response && !loading && (
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Response:</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
