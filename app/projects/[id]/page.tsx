import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-service";
import { getProject } from "@/lib/db/project-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Presentation, Podcast, BarChart3, Users, History } from "lucide-react";
import DocumentUpload from "@/components/document-upload";
import OutputGenerator from "@/components/output-generator";
import ProcessingVisualization from "@/components/processing-visualization";
import CollaboratorList from "@/components/collaboration/collaborator-list";
import CommentsSection from "@/components/collaboration/comments-section";
import VersionHistory from "@/components/collaboration/version-history";

// Define interfaces for type consistency across the file
interface Project {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  outputs: Output[];
  collaborators: Collaborator[];
  documents?: Document[];
  comments?: Comment[];
  versions?: Version[];
}

interface Output {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null; // Matches data source
    email: string;
    image: string | null;
  };
}

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  createdAt: string;
  textContent?: string;
}

interface Comment {
  id: string;
  projectId: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface Version {
  id: string;
  projectId: string;
  versionNumber: number;
  description: string; // Required by VersionHistory component
  createdAt: string;
  documentId?: string;
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Get project id from params
  const projectId = params.id;

  const projectResult = await getProject(projectId, session.user.id);

  if (!projectResult.success) {
    redirect("/projects");
  }

  const project: Project = projectResult.project;
  const documents: Document[] = project.documents || [];
  const outputs: Output[] = project.outputs || [];
  const collaborators: Collaborator[] = project.collaborators || [];
  const comments: Comment[] = project.comments || [];
  const versions: Version[] = project.versions || [];

  // Transform collaborators to ensure user.name is always a string
  const collaboratorsForList = collaborators.map((c) => ({
    ...c,
    user: {
      ...c.user,
      name: c.user.name || "Unknown", // Default to "Unknown" if null
      image: c.user.image || "", // Default to an empty string if null
    },
  }));

  // Get the latest document for processing visualization
  const latestDocument =
    documents.length > 0
      ? documents.sort((a: Document, b: Document) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

  // Simplified document summary for output generation
  const documentSummary = latestDocument?.textContent?.substring(0, 1000) || "";

  // Check if the project is in a processing state
  const isProcessing = project.status === "processing";

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          {project.description && <p className="text-gray-400">{project.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Document Upload Section */}
            {documents.length === 0 && (
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Upload Research Paper</CardTitle>
                  <CardDescription className="text-gray-400">
                    Start by uploading your research paper in PDF, DOCX, LaTeX, or TXT format.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload projectId={project.id} maxFileSize={50} />
                </CardContent>
              </Card>
            )}

            {/* Processing Visualization */}
            {isProcessing && (
              <ProcessingVisualization
                isProcessing={isProcessing}
                documentName={latestDocument?.filename || "document"}
              />
            )}

            {/* Document List */}
            {documents.length > 0 && (
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Documents</CardTitle>
                  <CardDescription className="text-gray-400">Uploaded research papers and documents.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc: Document) => (
                      <div
                        key={doc.id}
                        className="flex items-center p-3 rounded-md bg-gray-800/50 border border-gray-700"
                      >
                        <FileText className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <p className="text-white font-medium">{doc.filename}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(doc.createdAt).toLocaleDateString()} • {(doc.fileSize / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                    ))}
                    <DocumentUpload projectId={project.id} maxFileSize={50} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Output Generator */}
            {documents.length > 0 && !isProcessing && (
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Generate Content</CardTitle>
                  <CardDescription className="text-gray-400">
                    Transform your research into presentations, podcasts, or visual content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OutputGenerator
                    projectId={project.id}
                    documentSummary={documentSummary}
                    projectTitle={project.title}
                  />
                </CardContent>
              </Card>
            )}

            {/* Outputs List */}
            {outputs.length > 0 && (
              <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Generated Outputs</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your presentations, podcasts, and visual content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-6">
                      <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="presentation" className="data-[state=active]:bg-purple-600">
                        Presentations
                      </TabsTrigger>
                      <TabsTrigger value="podcast" className="data-[state=active]:bg-purple-600">
                        Podcasts
                      </TabsTrigger>
                      <TabsTrigger value="visual" className="data-[state=active]:bg-purple-600">
                        Visuals
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {outputs.map((output: Output) => (
                          <OutputCard key={output.id} output={output} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="presentation" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {outputs
                          .filter((output) => output.type === "presentation")
                          .map((output: Output) => (
                            <OutputCard key={output.id} output={output} />
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="podcast" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {outputs
                          .filter((output) => output.type === "podcast")
                          .map((output: Output) => (
                            <OutputCard key={output.id} output={output} />
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="visual" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {outputs
                          .filter((output) => output.type === "visual")
                          .map((output: Output) => (
                            <OutputCard key={output.id} output={output} />
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Collaboration Section */}
            <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CollaboratorList projectId={project.id} collaborators={collaboratorsForList} />
              </CardContent>
            </Card>

            {/* Version History */}
            <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Versions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VersionHistory projectId={project.id} versions={versions} />
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-black/50 border border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentsSection projectId={project.id} comments={comments} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputCard({ output }: { output: Output }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "presentation":
        return <Presentation className="h-8 w-8 text-purple-500" />;
      case "podcast":
        return <Podcast className="h-8 w-8 text-purple-500" />;
      case "visual":
        return <BarChart3 className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-purple-500" />;
    }
  };

  return (
    <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-colors">
      <div className="flex items-start">
        {getIcon(output.type)}
        <div className="ml-3">
          <h4 className="text-white font-medium">{output.title}</h4>
          <p className="text-xs text-gray-400 mt-1">{new Date(output.createdAt).toLocaleDateString()}</p>
          {output.description && <p className="text-sm text-gray-300 mt-2">{output.description}</p>}
          <div className="mt-4">
            {output.fileUrl ? (
              <a
                href={output.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Download {output.type}
              </a>
            ) : (
              <span className="text-sm text-gray-400">No file available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}