import { Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import Link from "next/link";

export const ProjectInfo = () => {
  return (
    <div className="bg-muted p-4 mt-auto">
      <Alert className="bg-muted text-muted-foreground border-0">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          You can ask questions about the following tables: Revenue Report,
          Cancellations, Clients, Events, Customers, Registrations, Staff
          Availability Schedule, and Staff Payroll.
          <div className="mt-4 sm:hidden"></div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
