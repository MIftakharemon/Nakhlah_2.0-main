"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/nakhlah/Toast";

/**
 * Example component demonstrating the custom toast system
 * This file serves as a reference for using toasts throughout the app
 */
export default function ToastExamples() {
  return (
    <div className="container max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Toast Examples</h1>
        <p className="text-muted-foreground">
          Click the buttons below to see different toast notifications
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Success Toast */}
        <Button
          onClick={() =>
            toast.success("Success!", {
              description: "Your changes have been saved successfully.",
            })
          }
          className="bg-green-600 hover:bg-green-700"
        >
          Show Success Toast
        </Button>

        {/* Error Toast */}
        <Button
          onClick={() =>
            toast.error("Error occurred", {
              description: "Unable to save changes. Please try again.",
            })
          }
          variant="destructive"
        >
          Show Error Toast
        </Button>

        {/* Warning Toast */}
        <Button
          onClick={() =>
            toast.warning("Warning!", {
              description: "This action cannot be undone.",
            })
          }
          className="bg-amber-600 hover:bg-amber-700"
        >
          Show Warning Toast
        </Button>

        {/* Info Toast */}
        <Button
          onClick={() =>
            toast.info("Information", {
              description: "New features are now available.",
            })
          }
          className="bg-blue-600 hover:bg-blue-700"
        >
          Show Info Toast
        </Button>

        {/* Toast with Action */}
        <Button
          onClick={() =>
            toast.success("File uploaded", {
              description: "Your file has been uploaded successfully.",
              action: {
                label: "View",
                onClick: () => console.log("View clicked"),
              },
            })
          }
          variant="outline"
        >
          Toast with Action
        </Button>

        {/* Simple Toast */}
        <Button
          onClick={() => toast("Simple notification")}
          variant="outline"
        >
          Simple Toast
        </Button>

        {/* Promise Toast */}
        <Button
          onClick={() => {
            const promise = new Promise((resolve) =>
              setTimeout(resolve, 2000)
            );

            toast.promise(promise, {
              loading: "Loading...",
              success: "Data loaded successfully!",
              error: "Failed to load data",
            });
          }}
          variant="outline"
        >
          Promise Toast
        </Button>

        {/* Custom Duration */}
        <Button
          onClick={() =>
            toast.success("This will stay for 10 seconds", {
              duration: 10000,
            })
          }
          variant="outline"
        >
          Custom Duration (10s)
        </Button>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="font-bold mb-2">Toast Positioning</h2>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Desktop: Bottom-right corner</li>
          <li>• Mobile: Bottom-center (full width)</li>
          <li>• Max visible: 3 toasts at once</li>
          <li>• Auto-dismiss after 4 seconds (default)</li>
          <li>• Close button available on all toasts</li>
        </ul>
      </div>
    </div>
  );
}
