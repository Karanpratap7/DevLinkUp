import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = React.memo(({ project }) => {
  return (
    <div className="bg-netflix-dark-gray rounded-lg overflow-hidden shadow-lg hover:shadow-red-600/30 transition-all duration-200 h-full flex flex-col border border-netflix-dark-gray hover:border-netflix-red/50">
      <Link to={`/projects/${project._id}`} className="flex flex-col flex-grow">
        {/* Project Image/Placeholder */}
        <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-netflix-light-gray text-4xl font-bold">
           {project.title ? project.title[0] : 'P'} {/* Use first letter of title as placeholder */}
        </div>

        <div className="p-6 flex-grow">
          <h3 className="text-xl font-semibold text-netflix-white mb-2 flex-grow">{project.title}</h3>
          <p className="text-netflix-light-gray mb-4 text-sm flex-grow">{project.description || 'No description provided.'}</p>
          
          {/* Technologies */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-netflix-red text-netflix-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

export default ProjectCard; 