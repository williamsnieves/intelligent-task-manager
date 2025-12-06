export interface Project {
  _id: string;
  name: string;
  color: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  color?: string;
}

export interface UpdateProjectDto {
  name?: string;
  color?: string;
}

