"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Presentation,
  Podcast,
  BarChart3,
  Settings,
  History,
  Download,
  Share2,
  Edit,
  Trash2,
  Bot,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("projects")

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-purple-500" />
            <span className="text-white font-medium text-xl">Adwola ResearchAI</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-purple-400">
              John Doe
            </Button>
            <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === "projects" ? "bg-purple-500/20 text-white" : "text-gray-400 hover:text-white"}`}
                    onClick={() => setActiveTab("projects")}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    My Projects
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === "history" ? "bg-purple-500/20 text-white" : "text-gray-400 hover:text-white"}`}
                    onClick={() => setActiveTab("history")}
                  >
                    <History className="h-5 w-5 mr-2" />
                    History
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === "settings" ? "bg-purple-500/20 text-white" : "text-gray-400 hover:text-white"}`}
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Button>
                </nav>

                <div className="mt-8">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <FileText className="h-5 w-5 mr-2" />
                    New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-6">My Projects</h1>

            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                  All
                </TabsTrigger>
                <TabsTrigger value="presentations" className="data-[state=active]:bg-purple-600">
                  Presentations
                </TabsTrigger>
                <TabsTrigger value="podcasts" className="data-[state=active]:bg-purple-600">
                  Podcasts
                </TabsTrigger>
                <TabsTrigger value="visuals" className="data-[state=active]:bg-purple-600">
                  Visuals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Project cards */}
                  <ProjectCard
                    title="Quantum Computing Research"
                    date="April 10, 2025"
                    type="presentation"
                    icon={Presentation}
                  />
                  <ProjectCard title="Climate Change Analysis" date="April 8, 2025" type="podcast" icon={Podcast} />
                  <ProjectCard title="Neural Networks Overview" date="April 5, 2025" type="visual" icon={BarChart3} />
                  <ProjectCard
                    title="Machine Learning Ethics"
                    date="April 2, 2025"
                    type="presentation"
                    icon={Presentation}
                  />
                  <ProjectCard title="Renewable Energy Study" date="March 28, 2025" type="podcast" icon={Podcast} />
                </div>
              </TabsContent>

              <TabsContent value="presentations" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProjectCard
                    title="Quantum Computing Research"
                    date="April 10, 2025"
                    type="presentation"
                    icon={Presentation}
                  />
                  <ProjectCard
                    title="Machine Learning Ethics"
                    date="April 2, 2025"
                    type="presentation"
                    icon={Presentation}
                  />
                </div>
              </TabsContent>

              <TabsContent value="podcasts" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProjectCard title="Climate Change Analysis" date="April 8, 2025" type="podcast" icon={Podcast} />
                  <ProjectCard title="Renewable Energy Study" date="March 28, 2025" type="podcast" icon={Podcast} />
                </div>
              </TabsContent>

              <TabsContent value="visuals" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProjectCard title="Neural Networks Overview" date="April 5, 2025" type="visual" icon={BarChart3} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

interface ProjectCardProps {
  title: string;
  date: string;
  type: string;
  icon: React.ElementType;
}

function ProjectCard({ title, date, type, icon: Icon }: ProjectCardProps) {
  return (
    <Card className="bg-black/50 border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Icon className="h-8 w-8 text-purple-500" />
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-white mt-2">{title}</CardTitle>
        <CardDescription className="text-gray-400">{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mt-2">
          <Button variant="outline" size="sm" className="text-white border-purple-500 hover:bg-purple-500/20">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="text-white border-purple-500 hover:bg-purple-500/20">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
