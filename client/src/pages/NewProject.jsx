import ProjectForm from '../components/ProjectForm';

export default function NewProject() {
  return (
    <div className="min-h-screen bg-netflix-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-netflix-white sm:text-3xl sm:truncate">
              Create New Project
            </h2>
          </div>
        </div>

        <div className="mt-8 bg-netflix-dark-gray shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <ProjectForm />
          </div>
        </div>
      </div>
    </div>
  );
} 