import React from 'react';
import { User, ChevronRight, Loader2, } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  company_id?: {
    name: string;
  };
}

interface UserCardProps {
  user: User;
  onClick: (userId: string) => void;
  isLoading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, isLoading }) => {
  return (
    <div
      onClick={() => !isLoading && onClick(user._id)}
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-shadow cursor-pointer border border-gray-100 ${
        isLoading ? 'opacity-70 pointer-events-none' : 'hover:shadow-md'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
            <User className="text-indigo-600" size={20} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Unknown User'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.role || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {user?.company_id?.name || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {user?.title || 'No title'}
        </span>
        <button className="text-indigo-600 hover:text-indigo-800">
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;