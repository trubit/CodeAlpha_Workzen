import React from 'react';
import { User } from '../../../shared/types/index.js';

interface AvatarGroupProps {
  users?: User[];
  max?: number;
  size?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users = [], max = 3, size = 28 }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="d-flex align-items-center">
      {visible.map((user, idx) => (
        <div
          key={user._id || idx}
          title={`${user.firstName} ${user.lastName}`}
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
          style={{
            width: size,
            height: size,
            marginLeft: idx > 0 ? -8 : 0,
            border: '2px solid #ffffff',
            backgroundColor: idx % 2 === 0 ? '#4F46E5' : '#0EA5E9',
            fontSize: size * 0.42,
            backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
        >
          {!user.avatarUrl && `${user.firstName[0]}${user.lastName[0]}`}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center bg-light text-secondary fw-semibold border border-2 border-white"
          style={{
            width: size,
            height: size,
            marginLeft: -8,
            fontSize: size * 0.4
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

