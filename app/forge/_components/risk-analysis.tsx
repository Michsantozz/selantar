"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, CheckCircle } from "lucide-react";

interface RiskAnalysisProps {
  content: string;
  isStreaming: boolean;
}

export function RiskAnalysis({ content, isStreaming }: RiskAnalysisProps) {
  if (!content) return null;

  return (
    <Card className="glass-strong overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[14px] font-semibold">
            <Shield className="size-4 text-primary/80" />
            Analise de risco
          </CardTitle>
          {isStreaming ? (
            <Badge variant="outline" className="text-[11px] font-medium border-primary/20 text-primary/70">
              <span className="mr-1.5 size-1.5 rounded-full bg-primary animate-subtle-pulse inline-block" />
              Analisando
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px] font-medium">
              <CheckCircle className="mr-1 size-3 text-primary" />
              Concluido
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="whitespace-pre-wrap text-[13px] leading-[1.7] text-foreground/85">
            {content}
            {isStreaming && (
              <span className="ml-1 inline-block size-1.5 animate-subtle-pulse rounded-full bg-primary" />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
