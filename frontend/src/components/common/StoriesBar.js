import React from 'react';
import { Plus } from 'lucide-react';

const StoriesBar = ({ stories, user, onCreateStory, onViewStory }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
      {/* Create Story Button */}
      {user && (
        <div 
          onClick={onCreateStory}
          className="flex-shrink-0 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <Plus className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <Plus size={12} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-center mt-1 text-white truncate w-16">Hikaye</p>
        </div>
      )}

      {/* User Stories */}
      {stories.map((userStory) => (
        <div 
          key={userStory.user_id}
          onClick={() => onViewStory(userStory)}
          className="flex-shrink-0 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-[2px] group-hover:scale-105 transition">
              <img 
                src={userStory.user_photo || 'https://ui-avatars.com/api/?background=1f2937&color=fff&size=64'}
                alt={userStory.user_name}
                className="w-full h-full rounded-full object-cover border-2 border-gray-900"
              />
            </div>
          </div>
          <p className="text-xs text-center mt-1 text-white truncate w-16">
            {userStory.user_id === user?.uid ? 'Sen' : userStory.user_name.split(' ')[0]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StoriesBar;