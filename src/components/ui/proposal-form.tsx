"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type ProposalFormValues = {
  title: string;
  owner: string;
  budget: string;
  category: string;
  summary: string;
};

type Props = {
  defaultValues?: Partial<ProposalFormValues>;
  onSubmit?: (values: ProposalFormValues) => void;
};

export function ProposalForm({ defaultValues, onSubmit }: Props) {
  const [values, setValues] = useState<ProposalFormValues>({
    title: defaultValues?.title ?? "",
    owner: defaultValues?.owner ?? "",
    budget: defaultValues?.budget ?? "",
    category: defaultValues?.category ?? "",
    summary: defaultValues?.summary ?? "",
  });

  const handleChange =
    (key: keyof ProposalFormValues) =>
    (val: string) =>
      setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    // You can persist to Supabase here
    console.log("Proposal saved:", values);
  };

  const handleReset = () =>
    setValues({ title: "", owner: "", budget: "", category: "", summary: "" });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => handleChange("title")(e.target.value)}
          placeholder="Proposal title"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="owner">Owner</Label>
          <Input
            id="owner"
            value={values.owner}
            onChange={(e) => handleChange("owner")(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget (USD)</Label>
          <Input
            id="budget"
            type="number"
            inputMode="decimal"
            value={values.budget}
            onChange={(e) => handleChange("budget")(e.target.value)}
            placeholder="e.g. 50000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={values.category}
          onValueChange={(v) => handleChange("category")(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="customer-experience">Customer Experience</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          rows={6}
          value={values.summary}
          onChange={(e) => handleChange("summary")(e.target.value)}
          placeholder="Describe the proposal..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save Draft</Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  );
}