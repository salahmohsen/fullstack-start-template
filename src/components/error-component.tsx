import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangleIcon } from "lucide-react";
import { useEffect } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ErrorComponent({ error }: { error: Error }) {
  const router = useRouter();

  const queryClientErrorBoundary = useQueryErrorResetBoundary();

  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    queryClientErrorBoundary.reset();
  }, [queryClientErrorBoundary]);

  return (
    <div className="mt-8 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant={"destructive"}>
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Oops! Something went wrong</AlertTitle>
          <AlertDescription>
            We're sorry, but the website has encountered an unexpected issue
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              router.invalidate();
            }}
          >
            Try again
          </Button>
          <Button className="w-full" render={<Link to="/" />} variant={"outline"}>
            Return to home
          </Button>
          {isDev ? (
            <Accordion className="w-full" collapsible type="single">
              <AccordionItem value="error-details">
                <AccordionTrigger>View error details</AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="mb-2 font-semibold">Error details:</h3>
                    <p className="mb-4 text-sm">{error.message}</p>
                    <h3 className="mb-2 font-semibold">Error trace:</h3>
                    <pre className="overflow-x-auto text-xs whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </div>
      </div>
    </div>
  );
}
