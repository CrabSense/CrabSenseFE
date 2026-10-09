import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UITest() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>CrabSense UI Test</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Badge>System Online</Badge>

          <p className="text-sm text-muted-foreground">
            Shadcn/ui + Tailwind CSS
          </p>

          <Button
            className="w-full"
            onClick={() => alert("Shadcn UI Working!")}
          >
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
