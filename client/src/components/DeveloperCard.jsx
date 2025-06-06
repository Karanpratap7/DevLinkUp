import React from 'react';
import { Link } from 'react-router-dom';

const DeveloperCard = React.memo(({ developer }) => {
  return (
    <div className="bg-netflix-dark-gray rounded-lg overflow-hidden shadow-lg hover:shadow-red-600/30 transition-all duration-200 h-full flex flex-col border border-netflix-dark-gray hover:border-netflix-red/50">
      <Link to={`/profile/${developer._id}`} className="flex flex-col flex-grow">
        <div className="p-6 flex-grow">
          <div className="flex items-center mb-4">
            <img
              src={developer.avatar || `https://ui-avatars.com/api/?name=${developer.name}&background=E50914&color=FFFFFF&rounded=true&bold=true`}
              alt={developer.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-netflix-white mb-1">{developer.name}</h3>
              <p className="text-netflix-light-gray text-sm">{developer.title || 'Developer'}</p>
            </div>
          </div>
          <p className="text-netflix-light-gray mb-4 text-sm flex-grow">{developer.bio || 'No bio provided.'}</p>
          <div className="flex flex-wrap gap-2">
            {developer.skills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-netflix-red text-netflix-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
});

export default DeveloperCard; 