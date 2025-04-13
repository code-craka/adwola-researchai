export interface Project {
    id: string
    title: string
    description: string | null
    userId: string
    status: string
    createdAt: string
    updatedAt: string
    outputs: Output[]
    collaborators: Collaborator[]
  }
  
  export interface Output {
    id: string
    projectId: string
    type: string
    title: string
    description: string | null
    fileUrl: string | null
    thumbnailUrl: string | null
    createdAt: string
    updatedAt: string
  }
  
  interface Collaborator {
    id: string
    projectId: string
    userId: string
    role: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }
  