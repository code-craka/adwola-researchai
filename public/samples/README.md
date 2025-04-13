# Sample Files

This directory contains sample files for demonstration purposes in the ResearchAI application.

Files:
- sample-research-paper.pdf: A sample research paper for demonstrating the paper transformation features.
\`\`\`

Now, let's fix the "View Example" buttons in the examples page:

```tsx file="app/examples/page.tsx"
[v0-no-op-code-block-prefix]"use client";

import { BarChart3, Presentation, Podcast } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

const examples = [
 {
   id: "quantum-computing",
   title: "Quantum Computing Research",
   type: "presentation",
   description:
     "A comprehensive presentation breaking down complex quantum computing concepts into clear, visual slides.",
   icon: Presentation,
   image: "/placeholder.svg?height=400&width=600",
   link: "/examples/quantum-computing",
 },
 {
   id: "climate-change",
   title: "Climate Change Analysis",
   type: "podcast",
   description: "An engaging audio podcast discussing the latest climate change research findings and implications.",
   icon: Podcast,
   image: "/placeholder.svg?height=400&width=600",
   link: "/examples/climate-change",
 },
 {
   id: "neural-networks",
   title: "Neural Networks Overview",
   type: "visual",
   description: "Visual infographics explaining neural network architectures and their applications in modern AI.",
   icon: BarChart3,
   image: "/placeholder.svg?height=400&width=600",
   link: "/examples/neural-networks",
 },
 {
   id: "medical-research",
   title: "Medical Research Findings",
   type: "presentation",
   description: "A presentation summarizing breakthrough medical research findings in an accessible format.",
   icon: Presentation,
   image: "/placeholder.svg?height=400&width=600",
   link: "/examples/medical-research",
 },
 {
   id: "renewable-energy",
   title: "Renewable Energy Study",
   type: "podcast",
   description: "A podcast exploring the latest developments in renewable energy technology and implementation.",
   icon: Podcast,
   image: "/placeholder.svg?height=400&width=600",
   link: "/examples/renewable-energy",
 },
 {
   id: "space-exploration",
   title: "Space Exploration Data",
   type: "visual",
   description: "Visual representations of space exploration data and astronomical discoveries.",
   icon: BarChart3,
   image: "/placeholder.svg?height=400&width=600",
   link: "/examples/space-exploration",
 },
]

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Examples</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example) => (
          <Card key={example.id} className="bg-stone-900 text-white">
            <CardHeader>
              <CardTitle>{example.title}</CardTitle>
              <CardDescription>{example.type}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <img
                src={example.image || "/placeholder.svg"}
                alt={example.title}
                className="rounded-md aspect-video object-cover"
              />
              <p>{example.description}</p>
              <Button 
                variant="outline" 
                asChild 
                className="w-full text-white border-purple-500 hover:bg-purple-500/20"
              >
                <Link href={example.link}>View Example</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}