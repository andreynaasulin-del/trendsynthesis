"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Project Details
          </h1>
          <p className="text-sm text-muted-foreground">ID: {params.id}</p>
        </div>
      </div>

      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Project details will load from Supabase once connected.
        </p>
        <Badge variant="secondary" className="mt-4">
          Coming Soon
        </Badge>
      </Card>
    </div>
  );
}
