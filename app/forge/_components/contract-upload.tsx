"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ContractUploadProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
}

export function ContractUpload({ onSubmit, isLoading, initialText }: ContractUploadProps) {
  const [contractText, setContractText] = useState(initialText ?? "");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setContractText(ev.target?.result as string);
      reader.readAsText(file);
    }
  }, []);

  const handleSubmit = () => {
    if (contractText.trim()) onSubmit(contractText);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`glass-card rounded-xl border-2 border-dashed p-10 text-center transition-all ${
          dragOver
            ? "border-primary/40 bg-primary/5"
            : "border-border/60 hover:border-border"
        }`}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/8">
          <Upload className="size-5 text-primary/60" />
        </div>
        <p className="mb-1 text-[14px] font-medium">
          Drag a .txt file or paste the contract below
        </p>
        <p className="text-[12px] text-muted-foreground">
          The contract will be analyzed by AI to identify risks and key clauses
        </p>
      </div>

      <Textarea
        value={contractText}
        onChange={(e) => setContractText(e.target.value)}
        placeholder="Paste the contract text here..."
        className="min-h-[180px] resize-y bg-secondary/30 border-border/50 text-[14px] placeholder:text-muted-foreground/40 focus:border-primary/30"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground/70">
          <FileText className="size-3" />
          {contractText.length > 0
            ? `${contractText.length.toLocaleString()} characters`
            : "No contract loaded"}
        </div>
        <div className="flex gap-2">
          {contractText.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setContractText("")}
              className="h-8 text-[12px]"
            >
              <X className="mr-1.5 size-3" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!contractText.trim() || isLoading}
            size="sm"
            className="glow-emerald h-8 px-4 text-[12px] font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 size-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze contract"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
